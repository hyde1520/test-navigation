mainApp.controller("workspaceController", ['$rootScope','$scope','$timeout','$location','$routeParams','$window','workspaceResource','breadcrumbResource','genericResource','persistanceUserService','reportService','propertiesService',workspaceController])

function workspaceController($rootScope, $scope, $timeout, $location, $routeParams, $window,  workspaceResource, breadcrumbResource, genericResource, persistanceUserService,reportService,propertiesService)
{	
	$scope.activeWorkspaceName = $rootScope.activeWorkspace.resourceName;
	$scope.activeWorkspaceId = $rootScope.activeWorkspace.resourceId;
	$scope.resource_list = []
	$scope.loaded_resource_list = false;
	$scope.loaded_folders = false;
	$scope.hasNonFolderResource = false;
	$scope.needToLoadResTypes = true;
	$scope.resTypeFilter={"resourceType": ""};
	$scope.hoverContext = "general";
	$scope.submenu_id = '';
	$scope.submenu_type = '';
	$scope.resourceDeleteCandidate = null;
	$scope.resourceDeleteConfirmMsg = null;
	$scope.reportmodalactive = false;

	$scope.deleteSuccess = false; 
	$scope.deleteFail = false; 

	$scope.submitSuccess = false;
	$scope.submitSuccessMessage = "";
	$scope.submitFail = false;
	$scope.submitFailMessage = "";
	$scope.sort_by="date_created";
	$scope.sort_order= true;
	$scope.selectedLandscapeForRulesDialog = null;
	$scope.selectedLandscapeChangedFlag = 0;
	$scope.loading_label_class = "hide-with-fade";
	$scope.addedNewResourceFlag = 0;

	$scope.init = function() {
		if (typeof($rootScope.folder_list) == "undefined" || $rootScope.folder_list == null) {
			$rootScope.folder_list = [];
		}
		$scope.retrieve_resources($routeParams.workspaceId);
	}
	
	function hideSubmitSuccessAlert() {
		$scope.submitSuccess = false; 
		$scope.submitSuccessMessage = "";
	}
	
	function hideSubmitFailAlert() {
		$scope.submitFail = false; 
		$scope.submitFailMessage = "";
	}
	
	$scope.setDeleteCandidate = function(resource) {
		$scope.resourceDeleteCandidate = resource;
		$scope.dependentResources = null;
		$scope.deleteResponseReceived = false;

		if (resource.resourceType == 'land'){
			$scope.resourceDeleteConfirmMessage = 
				 "Do you really want to delete landscape '" + resource.resourceName + "' ?";
		}
		else if (resource.resourceType == 'run_'){
			$scope.resourceDeleteConfirmMessage = 
				"Do you really want to delete model run '" + resource.resourceName + "' ?";
		}
		else {
			$scope.resourceDeleteConfirmMessage = 
				"Do you really want to delete '" + resource.resourceName + "' ?";
		}
	}
	$scope.clearDeleteCandidate = function()  { $scope.resourceDeleteCandidate = null; }
	
	$scope.isGroup = function()
	{
		var isGroup = ($rootScope.activeWorkspace.resourceScope == 'grp');
		return isGroup;
	};
	
	$scope.activeFolderExists = function() {
		return breadcrumbResource.activeFolderExists();
	}
	
	$scope.getActiveFolder = function() { return breadcrumbResource.getActiveFolder(); }
	
	$scope.canDelete = function(resource) {
		if (resource.resourceType == 'land')  return true;
		if (resource.resourceType == 'run_')  return true;
		if (resource.resourceType == 'shp_')  return true;
		if (resource.resourceType == 'shpf')  return true;
		if (resource.resourceType == 'rprt')  return true;
		return false;
	}
	$scope.canEdit = function(resource) {
		if ((resource.resourceType == 'land') && resource.landscapeCreated) return true;
	}
	$scope.canViewOnMap = function(resource) {
		if ((resource.resourceType == 'land') && resource.landscapeCreated) return true;
	}
	$scope.summaryIsAvailable = function(resource) {
		if ((resource.resourceType == 'rprt') && (resource.landscapeReportStatus == "done")) return true;
	}
	
	$scope.viewSummary = function(resource) {
		var locStr = "/report/summary/"+ resource.resourceId + "/reportType/" + resource.resourceSubtype;
		if ((resource.resourceSubtype == 'rclp') || (resource.resourceSubtype == 'rcfb')) {
			locStr = "/report/compare/"+ resource.resourceId + "/reportType/" + resource.resourceSubtype;
		}
		$scope.openInNewSumTab(locStr);
	}
	
	$scope.openInNewSumTab = function(new_path) {
		$window.open($location.$$absUrl.replace($location.$$path,new_path), '_wkspRpt'); // in new tab
	}

	/*
	$scope.rerunSummary = function(resource) {
		var status = false;
		if (resource.summaryId) {
			reportService.rerunSummary(resource.summaryId).
			then(function(response){
				$scope.setSummaryBuilding(response, resource);
			},function(errorResponse){
				$scope.setSummaryStatusFailed(resource);
			});
		}
		return status;
	}
	} */
	function determineStatusName(resourceElement){
		if (!resourceElement)  return '';
		if (resourceElement.resourceType == 'run_') {
			return resourceElement.runStatusName;
		} else if (resourceElement.resourceType == 'rprt') {
			var reportStatusName = resourceElement.landscapeReportStatusName;
			if (reportStatusName == 'Created') {
				reportStatusName = 'Building';
			}
			return reportStatusName; 
		} else if (resourceElement.resourceType == 'land') {
			if (resourceElement.resourceStatus){
				return  genericResource.getResourceStatusDescription(resourceElement.resourceStatus);
			}
			else if (resourceElement.landscapeCreated) {
				return 'Completed';
			} else {
				return 'Requested';
			}
		} else {
			return '';
		}
	}
	
	$scope.getCrownFireMethodName = function(hoverResource) {
		if (hoverResource.basicCrownFireMethod && hoverResource.basicCrownFireMethod) {
			return hoverResource.basicCrownFireMethod == 1 ? 'Finney' : 'Scott/Reinhardt'; 
		}
	}
	
	$scope.isLandscape = function(resourceElement) {
		if (!resourceElement)  return false;
		return (resourceElement.resourceType == 'land');
	}
	
	$scope.isShapefile = function(resourceElement) {
		if (!resourceElement)  return false;
		return (resourceElement.resourceType == 'shpf');
	}

	$scope.isModelRun = function(resourceElement) {
		if (!resourceElement)  return false;
		return (resourceElement.resourceType == 'run_');
	}
	

	$scope.isReport = function(resourceElement) {
		if (!resourceElement)  return false;
		return (resourceElement.resourceType == 'rprt');
	}
	
	$scope.hasResponseMsg = function(resourceElement) {
		if (!resourceElement)  return false;
		return ((resourceElement.runStatusMsg != null) &&  (resourceElement.runStatusMsg != ""));
	}
	
	$scope.setFilter = function(resType) {
		$scope.resTypeFilter={"resourceType": resType};
	}
	
	$scope.setHoverContext = function(context, resourceId) {
		$scope.hoverContext = context;
		if (resourceId == -1)  return;
		for (i=0; i < $scope.resource_list.length; i++) {
			if (resourceId == $scope.resource_list[i].resourceId) {
				$scope.hoverResource = $scope.resource_list[i];
			}
		}
	}
	
	// Set properties to show or hide a sub-menu for a resource in the main list
	$scope.reveal_menu = function(resource){
		if (resource.resourceId == $scope.submenu_id) {
			$scope.submenu_id = '';
			$scope.submenu_type = '';
			return false;
		}
		$scope.submenu_id = resource.resourceId;
		$scope.submenu_type = resource.resourceType;
		
		// Setup summary report settings
		if ((resource.resourceType == 'land') || (resource.resourceType == "run_")) {
			$scope.resource4Summary = resource;
			$scope.reportTypes = reportService.initializeReportResource( resource, "workspace");
		}
			
		return true;
	}
	
	// Set up a hash of resource types as an associative array
	function setResourceTypes(resource_types) {
		if (typeof($rootScope.resourceTypeHash) == "undefined" || $rootScope.resourceTypeHash == null) {
			$rootScope.resourceTypeHash = [];
		}
		if (resource_types && Object.keys($rootScope.resourceTypeHash).length == 0) {
			for (i=0; i < resource_types.length; i++) {
				var res_type = {"type": resource_types[i].resType, "name":resource_types[i].shortName};
				$rootScope.resourceTypeHash[res_type.type] = res_type.name;
			}
		}
	}
	
	// Retrieve resource types
	$scope.setTypeStrings = function() {
		if (typeof($rootScope.resourceTypeHash) == "undefined" || $rootScope.resourceTypeHash == null) {
			genericResource.getResourceTypes().then(function(response) {
				if (response.data && response.data.length > 0) {
					setResourceTypes(response.data);
				} else if (response.data && response.data.length == 0) {
					$rootScope.resourceTypeHash = [];
				} else {
					error_message = "Error loading resource types ";
				}
			});
		}
		
	}
	
	$scope.setTypeStrings();
	
	function resolveResourceTypeNames() {
		if ($rootScope.resourceTypeHash && Object.keys($rootScope.resourceTypeHash).length > 0) {
			for (i=0; i < $scope.resource_list.length; i++) {
				// The following lines use global variable hash lookups from genericResource.js
				$scope.resource_list[i].resourceTypeName = $rootScope.resourceTypeHash[$scope.resource_list[i].resourceType];
			}
		}
	}
	
	// Retrieve resource list
	$scope.retrieve_resources = function(parentId) {
		$scope.loading_label_class = "show-with-fade";
		genericResource.getResourcesForParent(parentId).then(function(response) {
			if (response.data && response.data.lightResources && response.data.lightResources.length > 0) {
				$scope.resource_list = response.data.lightResources;
				$scope.hasNonFolderResource = false;
				for (i=0; i < $scope.resource_list.length; i++) {
					var dateString = $scope.resource_list[i].created;
					var dateObj = new Date(dateString);
					var statusName = determineStatusName($scope.resource_list[i]);
					$scope.resource_list[i].createdDateObj = dateObj;
					$scope.resource_list[i].statusName = statusName;
					if ($scope.resource_list[i].resourceType != 'fldr')  $scope.hasNonFolderResource = true;
					if ($scope.resource_list[i].resourceType == 'rprt') {
						console.log("Report");
					}
					
					$scope.initSummaryStatus($scope.resource_list[i]);
					// Set the status for the summary report associated with each landscape. 
					if ((($scope.resource_list[i].landscapeCreated) && ($scope.resource_list[i].landscapeCreated == true)) ||
						($scope.resource_list[i].resourceType == 'rprt'))
					{
						$scope.setSummaryStatus($scope.resource_list[i], response);
					}
				}
				// Iterate to remove elements that Angular filtering can't handle
				for (var i=$scope.resource_list.length-1; i >= 0; i--) {
					var resElem = $scope.resource_list[i];
					// Model runs that aren't at least ready to run should not be displayed
					if (resElem.resourceType == 'run_' && resElem.runStatus) {
						if (resElem.runStatus != 'done' &&  resElem.runStatus != 'fail') {
							$scope.resource_list.splice(i, 1);
						}
					}
				}
				
				$scope.loaded_resource_list = true;
				if (parentId == $scope.activeWorkspaceId) {
					$scope.parentIsWorkspace = true;
				} else {
					$scope.parentIsWorkspace = false;
				}
				resolveResourceTypeNames();
				$scope.$digest;
				$scope.set_sort_desc('createdDateObj');
			} else if (response.data && response.data.lightResources && response.data.lightResources.length == 0) {
				$scope.resource_list = [];
				$scope.loaded_resource_list = true;
			} else {
				$scope.loaded_resource_list = false;
				error_message = "Error loading resources for a workspace/folder";
			}
			$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
			
		});
	}
	
	$scope.refreshResources = function() {
		if ($rootScope.activeFolder) {
			$scope.retrieve_resources($rootScope.activeFolder.resourceId);
		} else {
			$scope.retrieve_resources($scope.activeWorkspaceId);
		}
	}
	
	function getResourceName(resourceId) {
		for (i=0; i < $scope.resource_list.length; i++) {
			if (resourceId = $scope.resource_list[i]) {
				return $scope.resource_list[i].resourceName;
			}
		}
	}
	
	$scope.getResource = function(resourceId) {
		for (var i=0; i < $scope.resource_list.length; i++) {
			if (resourceId == $scope.resource_list[i].resourceId) {
				return $scope.resource_list[i];
			}
		}
	}
	
	$scope.isWorkspaceEmpty = function() 
	{
		if ($rootScope.activeFolder)  return false;  // in a folder
		if ($scope.hasNonFolderResource)  return false;
		return true;
	}
	
	$scope.isFolderEmpty = function()
	{
		if ($rootScope.activeFolder == null)  return false;  // in a workspace
		if ($scope.resource_list && $scope.resource_list.length > 0) return false;
		return true; 
	}
	
	$scope.openWorkspace = function(workspace) {
		$rootScope.activeFolder = null;
		breadcrumbResource.setActiveWorkspace(workspace);
		breadcrumbResource.navigateToWorkspaceView();
	}
	
	$scope.openFolder = function(folder) {
		$rootScope.activeFolder = folder;
		breadcrumbResource.setActiveFolder(folder);
		breadcrumbResource.navigateToFolderView();
	}
	
	$scope.removeResource = function(resourceId, resourceType) {
		if (!$scope.resource_list)  return;
		for (var i=0; i < $scope.resource_list.length; i++) {
			if (resourceId == $scope.resource_list[i].resourceId) {
				$scope.resource_list.splice(i, 1);
				if (resourceType == "fldr") {
					$scope.loaded_folders = true;
				}
				return;
			}
		}
	} 
	
	$scope.viewLcpInMap = function(lcpId) {
		$location.path("/iftdssDataStudio/index.html\?landscapeid="+lcpId);
	}
	
	$scope.viewShapeInMap = function(shapeId) {
		$location.path("/iftdssDataStudio/index.html\?shapeid="+shapeId);
	}
	
	$scope.viewShapefileInMap = function(resource) {
		$location.path("/iftdssDataStudio/index.html\?shapefile="+JSON.stringify(resource));
	}
	
	$scope.editLcp = function(lcpId) {
		$location.path("/landscape/edit/"+lcpId);
	}
	
	$scope.showRunMap = function(runid) {
		$location.path("/iftdssDataStudio/index.html\?runid="+runid);
	}
	
	function isEmptyObject(obj) {
	    var name;
	    for (name in obj) {
	        return false;
	    }
	    return true;
	}
	
	$scope.prepTheFolderCreateDialog = function() {
		$timeout(function() {
			$scope.$broadcast('openNewFolderDialogEvent');
		}, 200);
	}
	
	$scope.checkForDuplicateFolderName = function() {
		$scope.isDupeFolderName = false;
		if (!$rootScope.folder_list || $rootScope.folder_list.length < 1)  return;
		for (i=0; i < $rootScope.folder_list.length; i++) {
			var folder = $rootScope.folder_list[i];
			if (folder.resourceName == $scope.createFolderName) {
				$scope.isDupeFolderName = true;
				return;
			}
		}
	}
	
	$scope.createFolder = function() {
		console.log("createFolder ... folder name: " + $scope.createFolderName);
		var resource = {};
		resource.resourceName = $scope.createFolderName;
		resource.owner = $rootScope.current_user_id;
		resource.resourceType = 'fldr';
		resource.resourceScope = 'per';
		resource.containId = $scope.activeWorkspaceId;
		genericResource.createResource(resource).then(function(response) {
    		if (response.data && response.data.success) {
    			if (response.data.entityId) {
					resource.resourceId = response.data.entityId;
				}
    			$scope.needToLoadResTypes = true;
    			$scope.retrieve_resources($scope.activeWorkspaceId);
    			$scope.submitSuccessMessage = 'Work Folder \"' + resource.resourceName + '\" has been created.';
    			$scope.submitSuccess = true; 
    			$timeout(hideSubmitSuccessAlert, 5000);
    			$scope.resource_list.push(resource);
    			$scope.loadFolderList(true);
    			$('#createFolderDialog').modal('hide');
    		} else {
    			$scope.submitFailMessage = response.data.responseMessage;
    			$scope.submitFail = true;
    			$timeout(hideSubmitFailAlert, 15000);
    		}
		});
		
		$scope.createFolderName = '';  // clear input field value
	}
	
	/** lcpId: Number - the ID of the landscape for which we want to 
	 * 					delete related resources like models and reports. */
	$scope.deleteRelatedLandscapeResources = function(lcpId)
	{
		var resourceToBeDeleted = $scope.getResource(lcpId);
		if (resourceToBeDeleted && resourceToBeDeleted.resourceType == 'land') {
			// Iterate through resources looking for related models and reports
			for (var i=0; i < $scope.resource_list.length; i++) {
				if ($scope.resource_list[i].runModelLcpId && 
					$scope.resource_list[i].runModelLcpId == lcpId) 
				{
					$scope.removeResource($scope.resource_list[i].resourceId, $scope.resource_list[i].resourceType);
				}
				else if ($scope.resource_list[i].landscapeReportLcpId && 
						$scope.resource_list[i].landscapeReportLcpId == lcpId) 
				{
					$scope.removeResource($scope.resource_list[i].resourceId, $scope.resource_list[i].resourceType);
				}
			}
		}
	}
	
	$scope.dependentResources = null;
	$scope.deleteResponseReceived = false;
	
	$scope.deleteResource = function(resource) 
	{	
		$scope.deleteSuccessResponse = true;
		if (resource != null) {
			$scope.resourceDeleteCandidate = resource;
		}
		
		//if ($scope.resourceDeleteCandidate.resourceType == 'fldr' && $scope.resourceDeleteCandidate.resourceSubType == 'play') {
		if ($scope.resourceDeleteCandidate.resourceType == 'fldr' && $scope.resourceDeleteCandidate.resourceName == 'Playground') {
			$scope.submitFailMessage = "Sorry, you can't delete the 'Playground' folder.";
			$scope.submitFail = true;
			$timeout(hideSubmitFailAlert, 7000);
			return;
		}
		
		genericResource.deleteResource($scope.resourceDeleteCandidate.resourceId).then(function(response){
			if (response.data && response.data.success) {
				$scope.deleteSuccessMessage = ' \"' + $scope.resourceDeleteCandidate.resourceName + '\" has been deleted.';
    			$scope.deleteSuccess = true;
    			$scope.deleteFail = false; 
    			//$timeout(hideSubmitSuccessAlert, 3000);
    			// Don't need this as associated resources to delete
    			// will be passed back from REST call
    			//$scope.deleteRelatedLandscapeResources($scope.resourceDeleteCandidate.resourceId);
    			$scope.removeResource($scope.resourceDeleteCandidate.resourceId, $scope.resourceDeleteCandidate.resourceType);
    			$scope.additionalResourcesToRemoveFromList = response.data.resourceElements;
    			if (($scope.additionalResourcesToRemoveFromList != null) && (typeof($scope.additionalResourcesToRemoveFromList) != "undefined")) {
    				for (i=0; i < $scope.additionalResourcesToRemoveFromList.length; i++) {
    					// The following lines use global variable hash lookups from genericResource.js
    					if ($scope.additionalResourcesToRemoveFromList[i] != null) {
    						//$scope.deleteRelatedLandscapeResources($scope.additionalResourcesToRemoveFromList[i].resourceId);
                			$scope.removeResource($scope.additionalResourcesToRemoveFromList[i].resourceId, $scope.additionalResourcesToRemoveFromList[i].resourceType);
                		}
        			}
    			}
    			
    			$scope.deleteResponseReceived = true;
    			//$scope.clearDeleteCandidate();
    			if ($scope.resourceDeleteCandidate.resourceType == "fldr") {
    				$scope.loadFolderListAfterFolderDelete(true);
    			}
    			else {
    				$scope.loadFolderList(true);
    			}
    			
			} else {
				var proceedAsNotAShape = true;
				if (response.data && response.data.resourceElements) {
					$scope.dependentResources = response.data.resourceElements;
					// Resolve resource type names from each resource type
					if ($scope.resourceDeleteCandidate.resourceType == "shp_") {
						proceedAsNotAShape = false;
					}
					if ($rootScope.resourceTypeHash && Object.keys($rootScope.resourceTypeHash).length > 0) {
						for (i=0; i < $scope.dependentResources.length; i++) {
							// The following lines use global variable hash lookups from genericResource.js
							$scope.dependentResources[i].resourceTypeName = $rootScope.resourceTypeHash[$scope.dependentResources[i].resourceType];
						}
					}
				}
				if (!proceedAsNotAShape) {
					$scope.deleteSuccessResponse = false;
				}
				$scope.deleteFailMessage = response.data.responseMessage;
    			$scope.deleteFail = true;
    			$scope.deleteResponseReceived = true;
    			if ($scope.resourceDeleteCandidate.resourceType == "fldr") {
    				$scope.submitFail = true;
    				$scope.submitFailMessage = response.data.responseMessage;
    			}
    			//$scope.clearDeleteCandidate();
    			//$timeout(hideSubmitFailAlert, 7000);
			}
		});
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
	    			$scope.deleteFail = false; 
	    			$scope.refreshResources();
	    			//$timeout(hideSubmitSuccessAlert, 3000);
	    			$scope.loadFolderList(true);
				} else if (response.data) {
					var errRespMsg = response.data.responseMessage || "The request to delete a list of resources failed";
					$scope.deleteFailMessage = errRespMsg;
	    			$scope.deleteFail = true;
					console.log(errRespMsg);
				}
				$scope.deleteListResponseReceived = true;
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
	
	$scope.loadFolderList = function(forceReload) {
		if ((!$scope.loaded_folders || forceReload) && $scope.parentIsWorkspace && $scope.resource_list /*&& $scope.resource_list.length > 0 */) {
			$rootScope.folder_list = [];  // empty the list
			for (i=0; i < $scope.resource_list.length; i++) {
				if ($scope.resource_list[i].resourceType == 'fldr') {
					$rootScope.folder_list.push($scope.resource_list[i]);
				}
			}
			$scope.loaded_folders = true;
		}
	}
	
	$scope.loadFolderListAfterFolderDelete = function(forceReload) {
		if ((!$scope.loaded_folders || forceReload) && $scope.parentIsWorkspace && $scope.resource_list && $scope.resource_list.length > 0) {
			$rootScope.folder_list = [];  // empty the list
			for (i=0; i < $scope.resource_list.length; i++) {
				if ($scope.resource_list[i].resourceType == 'fldr') {
					$rootScope.folder_list.push($scope.resource_list[i]);
				}
			}
			$scope.loaded_folders = true;
		}
		else {
			genericResource.getFolderResourcesForParent($scope.activeWorkspaceId).then(function(response) {
				if (response.data && response.data.lightResources && response.data.lightResources.length > 0) {
					$rootScope.folder_list = [];  // empty the list
					for (i=0; i < response.data.lightResources.length; i++) {
						$rootScope.folder_list.push(response.data.lightResources[i]);
					}
					
					resolveResourceTypeNames();
					$scope.$digest;
				} 
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				
			});

		}
		
	}
	
	$scope.initSummaryStatus = function(resource) {
		resource.summaryDone = false;
		resource.summaryBuilding = false;
		resource.summaryNoRequest = false;
		resource.summaryFailed = false;
	}
	$scope.setNoRequestStatus = function(resource) {
		resource.summaryDone = false;
		resource.summaryBuilding = false;
		resource.summaryNoRequest = true;
		resource.summaryFailed = false;
	}
	$scope.setSummaryStatusFailed = function(resource) {
		resource.summaryDone = false;
		resource.summaryBuilding = false;
		resource.summaryNoRequest = false;
		resource.summaryFailed = true;
	}
	$scope.setSummaryStatusRunning = function(resource) {
		resource.summaryDone = false;
		resource.summaryBuilding = true;
		resource.summaryNoRequest = false;
		resource.summaryFailed = false;
	}
	$scope.setSummaryStatusDone = function(resource) {
		resource.summaryDone = true;
		resource.summaryBuilding = false;
		resource.summaryNoRequest = false;
		resource.summaryFailed = false;
	}
	/*
	$scope.refreshSummaryStatus = function(status, resource) {
		if (status.summaryStatus == "init") {
			$scope.setSummaryStatusRunning(resource);
		}
		else if (status.summaryStatus == "done") {
			$scope.setSummaryStatusDone(resource);
		}
		else if (status.summaryStatus == "fail") {
			$scope.setSummaryStatusFailed(resource);
		}
	} */
	$scope.setSummaryStatus = function(resource, response) {
		// Set the status for the summary report associated with each landscape.  Added code for landscape/shapes 
		// although this code may not be called here (TODO: Revisit shape logic)
		resource.summaryNoRequest = true;
		if (resource.resourceType == "rprt") {
			var statusRecord = null;
			if (response.data.landscapeAndShapeIdToLandscapeStatusBO) {
				var keys = Object.keys(response.data.landscapeAndShapeIdToLandscapeStatusBO);
				for (var i=0; i < keys.length; i++ ) {
					if ((response.data.landscapeAndShapeIdToLandscapeStatusBO[keys[i]]) &&(response.data.landscapeAndShapeIdToLandscapeStatusBO[keys[i]].summaryId == resource.resourceId)) {
						statusRecord = response.data.landscapeAndShapeIdToLandscapeStatusBO[keys[i]];
						break;
					}
				}
			}
			if (response.data.landscapeIdToLandscapeStatusBO && (statusRecord == null) ) {
				var keys = Object.keys(response.data.landscapeIdToLandscapeStatusBO);
				for (var i=0; i < keys.length; i++ ) {
						if ((response.data.landscapeIdToLandscapeStatusBO[keys[i]]) && (response.data.landscapeIdToLandscapeStatusBO[keys[i]].summaryId == resource.resourceId)) {
						statusRecord = response.data.landscapeIdToLandscapeStatusBO[keys[i]];
						break;
					}
				}
			}
			if (statusRecord != null)  {
				if (statusRecord.reportStatus == "done") {
					$scope.setSummaryStatusDone(resource);
				}
				else if (statusRecord.reportStatus == "init") {
					$scope.setSummaryStatusRunning(resource);
				}
				else if (statusRecord.reportStatus == "fail") {
					$scope.setSummaryStatusFailed(resource);
				}
			}
		}
		var key = resource.resourceId;
		if ((response.data.landscapeAndShapeIdToLandscapeStatusBO) && (resource.shapeGisId) ) {
			key +=  ( "-" + resource.shapeGisId);
			if (response.data.landscapeIdAndShapeIdToLandscapeStatusBO[key]) {
				resource.summaryId = response.data.landscapeIdAndShapeIdToLandscapeStatusBO[key].summaryId;
				if (response.data.landscapeIdAndShapeIdToLandscapeStatusBO[key].reportStatus == "done") {
					$scope.setSummaryStatusDone(resource);
				}
				else if (response.data.landscapeIdAndShapeIdToLandscapeStatusBO[key].reportStatus == "init") {
					$scope.setSummaryStatusRunning(resource);
				}
				else if (response.data.landscapeIdAndShapeIdToLandscapeStatusBO[key].reportStatus == "fail") {
					$scope.setSummaryStatusFailed(resource);
				}

				else {
					$scope.setNoRequestStatus(resource);
				}
			}
		}
		else if (response.data.landscapeIdToLandscapeStatusBO)  {
			if (response.data.landscapeIdToLandscapeStatusBO[resource.resourceId]) {
				resource.summaryId = response.data.landscapeIdToLandscapeStatusBO[key].summaryId;
				if (response.data.landscapeIdToLandscapeStatusBO[resource.resourceId].reportStatus == "done") {
					$scope.setSummaryStatusDone(resource);
				}
				else if (response.data.landscapeIdToLandscapeStatusBO[resource.resourceId].reportStatus == "init") {
					$scope.setSummaryStatusRunning(resource);
				}
				else if (response.data.landscapeIdToLandscapeStatusBO[resource.resourceId].reportStatus == "fail") {
					$scope.setSummaryStatusFailed(resource);
				}
				else {
					$scope.setNoRequestStatus(resource);
				}
			}
		}
	}
	
	$scope.selectLandscapeForRulesDialog = function(resource) {
		$scope.selectedLandscapeForRulesDialog = resource;
		$scope.selectedLandscapeChangedFlag++;
	}
	
	// File Downloads
	// ------------------------------
//	if ($scope.resourceToDownload.resourceType == 'land') {
//		$scope.downloadFilePattern = "[\w\- ]+[\.]tif";
//	} else {
//		$scope.downloadFilePattern = "[\w\- ]+[\.][a-zA-Z]{2,4}"; 
//	}
//	propertiesService.getProperty("downloadFilePattern", "ftem").then(
//		function(response) {
//			if (response && response.data && response.data.value) {
//				$scope.downloadFilePattern = response.data.value;
//			}
//		}
//	);
	
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
	

	$scope.$watch('loaded_resource_list', function() 
	{
		$scope.loadFolderList(false);
		
		// Get a list of unique resource types that are actually in our resource list		
		if ($scope.needToLoadResTypes == true && $scope.resource_list && $scope.resource_list.length > 0) 
		{
			$scope.resource_hash = {};
			
			for (i=0; i < $scope.resource_list.length; i++) {
				var resTypeKey = $scope.resource_list[i].resourceType;
				if (!$scope.resource_hash.hasOwnProperty(resTypeKey)) {
					$scope.resource_hash[resTypeKey] = $scope.resource_list[i].resourceTypeName;
				}
			}
			
			// Convert the unique resource types to an array of objects
			if (typeof($scope.resource_types) == "undefined" || $scope.resource_types == null) {
				$scope.resource_types = [];
			}

			$scope.resource_types.push( {"type":"", "name":"All"} );

			for (var key in $scope.resource_hash) {
				$scope.resource_types.push( {"type":key, "name":$scope.resource_hash[key]} );
			}
			if ($scope.resource_types.length > 0)  $scope.needToLoadResTypes = false;
		}
	});
	
	$scope.$watch('addedNewResourceFlag', function() {
		if ($scope.addedNewResourceFlag) {
			$scope.refreshResources();
		}
	});
	
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
}