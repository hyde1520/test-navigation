mainApp.factory('svcTxService', ['$http','$q','__env', svcTxService]);

function svcTxService ($http,$q,__env) {

	var service = {};
	
	var _serviceTypeMap = null;
	var _serviceTxStatusesMap = null;
	
	service.getTxList = function() {
		return $http({method: 'GET',
		    url: __env.src("/firenetREST/serviceTxs/week"),
		 }).then(function successCallback(response) {
			 var transactions = new Array();
			 
			 for (i=0; i < response.data.length; i++){
				var tx = new ServiceTransactionDO();
				tx.fillFromOther(response.data[i]);
				transactions.push(tx);
			 } 
			 
			 service.attachSvcTxStatusEnums(transactions);
			 service.attachServiceTypeEnums(transactions);
			 
		     return transactions;
		 }, function errorCallback(response) {
			 return response || {data:{responseMessage: "Request failed"}};
		 });
	}
	
	// Transaction Status Enums
	//-------------------------
	service.attachSvcTxStatusEnums = function(txList)
	{
		var deferred = $q.defer();
		if (!txList || txList.length < 1) {
			deferred.reject("Transaction List passed into attachSvcTxStatusEnums is undefined or empty.");
			return deferred.promise;
		}
		
		service.getSvcTxStatuses().then(
			function(response) {
				for (var i=0; i<txList.length; i++) {
					if (txList[i] && txList[i].serviceTxStatus) {
						var txStatusEnumVal = txList[i].serviceTxStatus
						if (response && response[txStatusEnumVal]) {
							var statusEnum = response[txStatusEnumVal];
							txList[i].serviceTxStatusName = statusEnum.shortName;
						}
					}
				}
				
				//_serviceTxStatusesMap = response;
				deferred.resolve(_serviceTxStatusesMap);
			}, 
			function(errResponse) {
				deferred.reject(errResponse); 
			}
		);
		
		return deferred.promise;
	}
	
	
	service.getSvcTxStatuses = function() 
	{
		  var deferred = $q.defer();
		  if (_serviceTxStatusesMap) {
			  deferred.resolve(_serviceTxStatusesMap);
			  return deferred.promise;
		  }
		  
		  service.getSvcTxStatusesREST().then(
			  function(response) {
				  _serviceTxStatusesMap = response;
				  deferred.resolve(_serviceTxStatusesMap);
			  }, 
			  function(errResponse) {
				  deferred.reject(errResponse); 
			  }
		  );
		  
		  return deferred.promise;
	}
	  
	// Service Transaction Status Enumerations
	service.getSvcTxStatusesREST = function() {
		return $http({
			  method: 'GET',
			  url: __env.src("/firenetREST/serviceTxs/statusEnums")
		}).then(function(response){
			  return response.data;
		},function(response){
			  console.log("REST call to retrieve service transaction status enums failed.");
			  return response || {data:{responseMessage:"Request Failed"}};
		});
	}
	
	// Service Type Enums
	
	service.attachServiceTypeEnums = function(txList)
	{
		var deferred = $q.defer();
		if (!txList || txList.length < 1) {
			deferred.reject("Transaction List passed into attachServiceTypeEnums is undefined or empty.");
			return deferred.promise;
		}
		
		service.getServiceTypes().then(
			function(response) {
				for (var i=0; i<txList.length; i++) {
					if (txList[i] && txList[i].serviceType) {
						var serviceTypeEnumVal = txList[i].serviceType
						if (response && response[serviceTypeEnumVal]) {
							var statusEnum = response[serviceTypeEnumVal];
							txList[i].serviceTypeName = statusEnum.shortName;
						}
					}
				}
				
				deferred.resolve(_serviceTypeMap);
			}, 
			function(errResponse) {
				deferred.reject(errResponse); 
			}
		);
		
		return deferred.promise;
	}
	
	service.getServiceTypes = function() 
	{
		  var deferred = $q.defer();
		  if (_serviceTypeMap) {
			  deferred.resolve(_serviceTypeMap);
			  return deferred.promise;
		  }
		  
		  service.getServiceTypesREST().then(
			  function(response) {
				  _serviceTypeMap = response;
				  deferred.resolve(_serviceTypeMap);
			  }, 
			  function(errResponse) {
				  deferred.reject(errResponse); 
			  }
		  );
		  
		  return deferred.promise;
	}
	  
	// Service Transaction Status Enumerations
	service.getServiceTypesREST = function() {
		return $http({
			  method: 'GET',
			  url: __env.src("/firenetREST/serviceTxs/typeEnums")
		}).then(function(response){
			  return response.data;
		},function(response){
			  console.log("REST call to retrieve service types failed.");
			  return response || {data:{responseMessage:"Request Failed"}};
		});
	}
	
	/** Submit a request to run a fire behavior model using a persisted model input. */
	service.cancelWorkRequest = function(transactionId, requestorUserId) {
		var deferred = $q.defer();
		
		var cancelWorkRequestBO = {"transactionId": transactionId, "userIdRequesting": requestorUserId};
		
		if (!transactionId || !requestorUserId) {
	  		  deferred.reject({data:{responseMessage:"parameters transactionId or requestorUserId are undefined or null - can not submit the request"}});
		} else { 
		 
			var sendData = JSON.stringify(cancelWorkRequestBO);
	
		    $http({
		      method: 'PUT',
		      url: __env.src("/iftdssREST/serviceTxs/cancelRequest"),
		      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		      data: $.param({"data":sendData})
		    }).
		    then(function(response) {
		        deferred.resolve(response);
		      }, function(response) {
		    	var errorResponse = response || {data:{message: "Request failed"}};
		    	deferred.reject(errorResponse);
		    });
		}
	    return deferred.promise;
	}


	return service;
}
