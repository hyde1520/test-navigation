(function(){  // Ensure unique namespace

mainApp.controller("modelrunController", ['$scope', '$rootScope','$location','$window', "modelResource","runResource","genericResource","reportService", modelrunController])


function modelrunController($scope,$rootScope,$location,$window,modelResource,runResource,genericResource, reportService){
	
	$rootScope.splitMapMode = false;
	user={userid:$rootScope.current_user_id};
	$rootScope.navbar_title="Welcome to IFTDSS";

	$scope.hoverContext = "general";
	$scope.selected_model = "";
	$scope.sort_by="date_created";
	$scope.sort_order= true;
	$scope.show_menu_id = '';
	$scope.current_user_runs = [];
	$scope.models_list = [];
	$scope.model_statuses = [];
	$scope.addedNewResourceFlag = 0;
	
	$scope.createModel = function() {
		if ($scope.selected_model == "Landscape Fire Behavior") {
			$location.path('/basic/new/');
		}
	}
	
	$scope.editRun = function(runid) {
		//console.log($scope.models_list[0])
		$location.path('/basic/edit/'+runid);
	}
	
	$scope.viewRun = function(runid) {
		//console.log($scope.models_list[0])
		$location.path('/basic/view/'+runid);
	}
	
	$scope.removeResource = function(resourceId) {
		if (!$scope.current_user_runs)  return;
		for (var i=0; i < $scope.current_user_runs.length; i++) {
			if (resourceId == $scope.current_user_runs[i].resourceId) {
				$scope.current_user_runs.splice(i, 1);
				return;
			}
		}
	}
	
	$scope.setDeleteCandidate = function(resource) {
		$scope.resourceDeleteCandidate = resource;
		
		if (resource.resourceType == 'run_'){
			$scope.resourceDeleteConfirmMessage = 
				"Do you really want to delete model run '" + resource.resourceName + "' ?";
		}
	}
	$scope.clearDeleteCandidate = function()  { $scope.resourceDeleteCandidate = null; }
	
	$scope.deleteRun = function(run) {
		$scope.deleteSuccessResponse = true;
		var runId = run.resourceId;
		$scope.deleteSuccess = false;
		$scope.deleteFail = false; 
		
		
		for (var i = 0; i < $scope.current_user_runs.length; i++) {
			if ($scope.current_user_runs[i].runId == runId) {
				$scope.current_user_runs.splice(i, 1);
			//	basicResource.deleteRun(runId);
		    	break;
			}
		}	
		var user = $rootScope.current_user_id;
		if ($rootScope.current_user_id) {
			$scope.loading_landscapes = true;

			genericResource.deleteResource(runId).then(function(response){
				//$scope.$digest;
				if (response.data && response.data.success && response.status != 500) {
					$scope.deleteSuccessMessage = ' \"' + run.resourceName + '\" has been deleted.';
					$scope.deleteSuccess = true; 
	    			//$timeout(hideSubmitSuccessAlert, 3000);
	    			// Don't need this as associated resources to delete
	    			// will be passed back from REST call
	    			//$scope.deleteRelatedLandscapeResources($scope.resourceDeleteCandidate.resourceId);
	    			$scope.removeResource(run.resourceId);
	    			/*$scope.additionalResourcesToRemoveFromList = response.data.resourceElements;
	    			if (($scope.additionalResourcesToRemoveFromList != null) && (typeof($scope.additionalResourcesToRemoveFromList) != "undefined")) {
	    				for (i=0; i < $scope.additionalResourcesToRemoveFromList.length; i++) {
	    					// The following lines use global variable hash lookups from genericResource.js
	    					if ($scope.additionalResourcesToRemoveFromList[i] != null) {
	    						//$scope.deleteRelatedLandscapeResources($scope.additionalResourcesToRemoveFromList[i].resourceId);
	                			$scope.removeResource($scope.additionalResourcesToRemoveFromList[i].resourceId);
	                		}
	        			}
	    			}*/
	    			
	    			$scope.deleteResponseReceived = true;
	    			//$scope.clearDeleteCandidate();
	    		//-->	$scope.loadFolderList(true);
	    			$scope.digest;
				} else {
					if (response.data && response.data.resourceElements) {
						$scope.dependentResources = response.data.resourceElements;
					}
					$scope.deleteFailMessage = response.data.responseMessage;
					$scope.deleteFail = true;
	    			$scope.deleteResponseReceived = true;
	    		}
    		});
		}
	}
	
	$scope.handleDeleteDialogClose = function() {
		$scope.clearDeleteCandidate();
		$scope.dependentResources = null;
		$scope.deleteResponseReceived = false;
		$scope.deleteListResponseReceived = false;
		$scope.deleteSuccess = false;
		$scope.deleteSuccessMessage = '';
		$scope.deleteFail = false;
		$scope.deleteFailMessage = '';
	}
	
	
	$scope.deleteResourceList = function(resource, dependentResources) 
	{
		var deleteRequestBO = new DeleteRequestBO();
		deleteRequestBO.originalDeleteResourceId = resource.resourceId;
		// dependentResources.push(resource);
		deleteRequestBO.deleteResourceList = dependentResources;
		
		genericResource.deleteResourceList(deleteRequestBO).then(
			function(response) {
				if (response.data && response.data.deleteResourceIds) {
					$scope.deleteSuccessMessage = 'The list of resources was successfully deleted.';
	    			$scope.deleteSuccess = true; 
	    			//$scope.refreshResources();
	    			//$timeout(hideSubmitSuccessAlert, 3000);
	    			//$scope.loadFolderList(true);
				} else if (response.data) {
					var errRespMsg = response.data.responseMessage || "The request to delete a list of resources failed";
					$scope.deleteFailMessage = errRespMsg;
	    			$scope.deleteFail = true;
					console.log(errRespMsg);
				}
				$scope.removeResource(resource.resourceId);
				$scope.deleteListResponseReceived = true;
				$scope.digest;
			},
			function(errorResponse) {
				var errRespMsg = response.data.responseMessage || "The request to delete a list of resources failed";
				$scope.deleteFailMessage = errRespMsg;
    			$scope.deleteFail = true;
				console.log(errRespMsg);
				$scope.deleteListResponseReceived = true;
			}
		);
	}

	
	$scope.setHoverContext = function(context, modelId) {
		$scope.hoverContext = context;
		if (modelId == -1)  return;
		for (i=0; i < $scope.current_user_runs.length; i++) {
			if (modelId == $scope.current_user_runs[i].resourceId) {
				$scope.hoverResource = $scope.current_user_runs[i];
			}
		}
	}
	
	$scope.showRunMap = function(runid) {
		$location.path("/iftdssDataStudio/index.html\?runid="+runid);
	}
	
	$scope.copyRun = function(runid) {
		$location.path('/basic/copy/'+runid);
	}
	
	modelResource.getModels().then(function(response){
		if (response.data && response.data.length > 0){
			$scope.models_list = response.data;
			//triggers $watch function in this case the one that checks in we have gotten all of the models, user's runs and statuses
			$scope.$digest;
		} else {
			error_message = "Error loading model list";
		}
	});
	
	
	modelResource.getModelStatuses().then(function(response){
		if (response.data && response.data.length > 0) {
			$scope.model_statuses = response.data;
			$scope.$digest;
		} else {
			error_message = "Error loading model statuses list";
		}
	});
	
	$scope.isModelActivated = function(modelCommonName)
	{
		for (var i=0; i<$scope.models_list.length; i++) {
			var modelTypeObj = $scope.models_list[i];
			if (modelTypeObj && modelTypeObj.commonName == modelCommonName && modelTypeObj.activated == true) {
				return true;
			}
		}
		return false;
	}
	
	$scope.retrieve_runs = function(userId) {
		runResource.getRuns(userId).then(function(response) {
			if (response.data && response.data.resources && response.data.resources.length > 0) {
				$scope.current_user_runs = response.data.resources;
			
			    var hashMapExists = Object.keys($rootScope.modelTypeHash).length > 0 && Object.keys($rootScope.modelStatusHash).length > 0;
			    for (i=0; i < $scope.current_user_runs.length; i++){
				    var dateString = $scope.current_user_runs[i].created;
				    var dateObj = new Date(dateString);
				    $scope.current_user_runs[i].createdDateObj = dateObj;
				    if (hashMapExists){
				       $scope.current_user_runs[i].modelType = $rootScope.modelTypeHash[$scope.current_user_runs[i].modelTypeEnum];  
				       $scope.current_user_runs[i].modelRunStatus = $rootScope.modelStatusHash[$scope.current_user_runs[i].modelRunStatus];
				     }
			    }   
				
				$scope.loaded_user_runs = true;
				$scope.set_sort_desc('createdDateObj');
				$scope.$digest;
			} else if (response.data && response.data.length == 0) {
				$scope.current_user_runs = []
				$scope.loaded_user_runs = true;
			} else {
				error_message = "Error loading user runs";
			}
		});
	}
	
	$scope.retrieve_runs($rootScope.current_user_id);
	
	$scope.model_select = function(model){
		$scope.selected_model=model;
		return;
	}
	
	/** Sort in descending order, such as latest first */
	$scope.set_sort_desc = function(sort_tag) {
		$scope.sort_order = true;
		$scope.sort_by = sort_tag;
	}
	
	$scope.set_sort = function(sort_tag){
		if (sort_tag == $scope.sort_by) {
          $scope.sort_order = !($scope.sort_order);
		}
		$scope.sort_by = sort_tag;
	}
	
	$scope.reveal_menu = function(run){
		if (run.resourceId == $scope.show_menu_id) {
			$scope.show_menu_id = ''
			return false;
		}
		$scope.show_menu_id = run.resourceId;
		$scope.resource4Summary = run;
		$scope.reportTypes = reportService.initializeReportResource( run, "playground");
		return true;
	}
	
	// File Downloads
	// ------------------------------	
	$scope.resourceToDownload = null;
	$scope.saveFileName = null;
	$scope.fileSaved = false;
	
	$scope.downloadFile = function(resource)
	{
		$scope.resourceToDownload = resource;
		if (($scope.resourceToDownload.resourceType == 'land') ||
				($scope.resourceToDownload.resourceType == 'run_')) {
				$scope.downloadFilePattern = "[\\w\\- ]+[\\.]zip";
			} else {
				$scope.downloadFilePattern = "[\\w\\- ]+[\\.][a-zA-Z]{2,4}"; 
			}
		$scope.saveFileName = resource.resourceName + ".zip"; // default to resource name
		$scope.fileSaved = false;
		//$("#downloadFileDialog").modal('show');
	}
	$scope.closeDownloadDialog = function() 
	{
		$scope.resourceToDownload = null;
		$scope.saveFileName = null;
		$scope.fileSaved = false;
	}
	// ------------------------------
	
	//This code executes to convert names of models and statuses to the displayable versions
	function getCommonStatus(run_status){
		for (var i = 0; i < $scope.model_statuses.length; i++) {
			if ($scope.model_statuses[i].runStatus == run_status) {
				return $scope.model_statuses[i].shortName;
			}
		}
		return run_status;
	}
	
	function getCommonModelName(model_id){
		for (var i = 0; i < $scope.models_list.length; i++) {
			if ($scope.models_list[i].modelType == model_id) {
				return $scope.models_list[i].commonName;
			}
		}
		return model_id;
	}
	
}

})();  // End of namespace