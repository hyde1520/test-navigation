mainApp.controller('svcTxsController', ['$scope', '$rootScope', '$timeout', '$location', 'svcTxService', 'genericResource', svcTxsController]);

function svcTxsController($scope, $rootScope, $timeout, $location, svcTxService, genericResource) {
	console.log('Initiating svcTxsController');

	$scope.tx_list = [];
	
	$scope.user_types = [];
	$scope.loaded_user_list = false;
	$scope.userFilter = "All";
	$scope.hoverContext = "general";
	$scope.submenu_id = '';
	
	$scope.successMessage = null;
	$scope.errorMessage = null;
	$scope.loading_label_class = "hide-with-fade";
	
	$scope.sort_by='';
	$scope.sort_order= true;
	
	$scope.serviceTypeFilter={"serviceType": ""};
	$scope.service_types = null;
	$scope.svcTypesHash = {};
			  
	$scope.fetchingResourceDetail = false; // if in process of getting more hover detail
	
	$scope.convertDates = function(transactionList) {
		if (!transactionList)  return;
		for (var i=0; i < transactionList.length; i++) {
			var tx = transactionList[i];
			if (tx) {
				tx.date = new Date(tx.requestTime);
			}
		}
	}
	
	$scope.refreshTxList = function() {
		$scope.loading_label_class = "show-with-fade";
		svcTxService.getTxList().then(function(tx_list) {
			$scope.tx_list = tx_list;
			$scope.convertDates(tx_list);
			$scope.clearMessages();
			//setTimeout($scope.collectServiceTypes(tx_list), 3000); // need to wait for serviceTypeName attachment
		},function(response) {
			$scope.errorMessage = response;
		});
		$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
	}

	$scope.refreshTxList();

	$scope.init = function() {
		// $scope.retrieve_txs('');
	}
	
	$scope.collectServiceTypes = function(tx_list)
	{
		if (typeof($scope.svcTypesHash) == "undefined" || $scope.svcTypesHash == null) {
			$scope.svcTypesHash = {};
		}
//		if (tx_list && Object.keys($scope.svcTypesHash).length == 0) {
//			for (i=0; i < tx_list.length; i++) {
//				$scope.svcTypesHash[tx_list[i].serviceType] = tx_list[i].serviceTypeName;
//			}
//		}
		
		for (i=0; i < tx_list.length; i++) {
			var svcTypeKey = tx_list[i].serviceType;
			if (!$scope.svcTypesHash.hasOwnProperty(svcTypeKey)) {
				if (tx_list[i].resourceTypeName) {
					$scope.svcTypesHash[svcTypeKey] = tx_list[i].resourceTypeName;
				} else {
					$scope.svcTypesHash[svcTypeKey] = svcTypeKey;
				}
			}
		}
		
		// Convert the unique service types (in the hash) to an array of objects
		if (typeof($scope.service_types) == "undefined" || $scope.service_types == null) {
			$scope.service_types = [];
		}
		var allType = {"type":"", "name":"All"};
		$scope.service_types.push(allType);
		$scope.setFilter(allType);
		for (var key in $scope.svcTypesHash) {
			$scope.service_types.push( {"type":key, "name":$scope.svcTypesHash[key]} );
		}
	}
	
	
	$scope.setCancelCandidate = function(tx) {
		$scope.txToCancel = tx;
	}
	
	$scope.submitCancelRequest = function(tx)
	{
		svcTxService.cancelWorkRequest(tx.transactionId, $rootScope.current_user_id).then(
			function(response) {
				$scope.successMessage = response.data.responseMessage || response.responseMessage || response ||  "A request was submitted to cancel work request.";
				tx.cancelRequested = true;
				$scope.txToCancel = null;
			}, function(errResponse) {
				$scope.errorMessage = errResponse.responseMessage || errResponse || "Error submitting cancel work request.";
				$scope.txToCancel = null;
			}
		);
	}
	
	$scope.clearMessages = function() {
		$scope.successMessage = null;
		$scope.errorMessage = null;
	}
	
	$scope.setFilter = function(svcType) {
		$scope.svcTypeFilter=svcType;
	}
	
	$scope.set_sort = function(sort_tag){
		$scope.clearMessages();
		if (sort_tag == $scope.sort_by) {
			$scope.sort_order = !($scope.sort_order);
		}
		else {
			$scope.sort_order= false;			
			$scope.sort_by = sort_tag;
		}
	}
	
	$scope.set_sort('date');
	$scope.set_sort('date'); // descending date order
	
	// Set properties to show or hide a sub-menu for a resource in the main list
	$scope.reveal_menu = function(tx){
		$scope.clearMessages();
		if (tx.transactionId == $scope.submenu_id) {
			$scope.submenu_id = '';
			return false;
		}
		$scope.submenu_id = tx.transactionId;
		return true;
	}

	// Code for right-hand panel hover-text
	
	$scope.applyResourceDetail = function(transaction, resourceDetail)
	{
		if (resourceDetail == null || typeof resourceDetail == "undefined")  return;
			
		transaction.resourceName = resourceDetail.resourceName;
		transaction.created = resourceDetail.created;
		if (resourceDetail.resourceType == 'land') {
			transaction.landscapeAcres = resourceDetail.landscapeAcres;
		} else if (resourceDetail.resourceType == 'run_') {
			transaction.runStatusName = resourceDetail.runStatusName;
		}
	}
	
	$scope.getMoreResourceDetail = function(transaction) 
	{
		if (transaction.detailApplied && transaction.detailApplied == true)  return;
	
		if ($scope.fetchingResourceDetail == false ) {
			$scope.fetchingResourceDetail = true;
			genericResource.getResourceElementView(transaction.resourceId).then(
				function(response) {
					if (response && response.data) {
						$scope.applyResourceDetail(transaction, response.data);
						$scope.fetchingResourceDetail = false;
						transaction.detailApplied = true;
					}
				}, 
				function(errResponse) {
					console.log("Error fetching more resource detail: " + errResponse);
					$scope.fetchingResourceDetail = false;
				}
			);
		}
	}
	
	$scope.setHoverContext = function(context, txId) {
		$scope.hoverContext = context;
		if (txId == -1)  return;
		for (i=0; i < $scope.tx_list.length; i++){
			if ($scope.tx_list[i].transactionId == txId) {
				$scope.hoverTx = $scope.tx_list[i];
				if (typeof $scope.hoverTx.detailApplied == "undefined" || $scope.hoverTx.detailApplied == false) {
					$scope.getMoreResourceDetail($scope.hoverTx); 
				}
				break;
			}
		}
		
	}
	
	$scope.isLandscape = function(resourceElement) {
		return (resourceElement && resourceElement.serviceType == 'lcp_');
	}
	$scope.isBasicRun = function(resourceElement) {
		return (resourceElement && resourceElement.serviceType == 'flam');
	}

}