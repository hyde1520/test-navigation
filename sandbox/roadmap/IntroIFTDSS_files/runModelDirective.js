mainApp.directive('runModelDirective',function(){
	return {
		templateUrl: "pages/modelpages/runModel_partial.html",
		scope: {modelInput: '=modelInput',
				selected_landscape: '=selectedLcp',
				familyLandscapesOnly: '=familyOnly',
				allInputsReadyFlag: '=allInputsReady',
				modelInputsRetrievedFlag: '=modelInputsRetrievedFlag',
				modelRunsRetrievedFlag: '=modelRunsRetrievedFlag',
				familyLandscapeList: '=familyLandscapeList',
				familyLandscapeListRetrievedFlag: '=familyLandscapeListRetrievedFlag',
				addedLandscapeToFamilyFlag: '=addedLandscapeToFamilyFlag'
			},
		controller: "runModelDirectiveController"
	}
}).controller('runModelDirectiveController',["$scope","$window","$timeout","$rootScope","$filter","landscapeResource","modelValidationFactory","modelResource",
  function($scope,$window,$timeout,$rootScope,$filter,landscapeResource,modelValidationFactory,modelResource)
{
	$scope.displaySuccess = false;
	$scope.successMessage = "";
	$scope.displayError = false;
	$scope.errorMessage = "";
	//$scope.userLandscapes = null;
	$scope.landscapeContextEnum = landscapeResource.ScopeEnum.ALL;
	$scope.emptyLandscapeList = false;
	//$scope.newModelRunName = '';
	$scope.selected_landscape = null;  //TODO: Don't need this now that we have list of landscapes on screen
	$scope.modelRunBOList = [];
	$scope.loading_label_class = "hide-with-fade";

	
	modelResource.getModelStatuses().then(
		function(response) {
			console.log("Run model status names retrieved from the server.");
		}, function(errorResponse) {
			console.log("Error: unable to retrieve run model status names from server.");
		}
	);
	
	//TODO: might not need this now
	$scope.setLandscapeDataInModelInput = function(landscape) {
		if (landscape && $scope.modelInput && $scope.modelInput.landscape) {
			$scope.modelInput.landscape.landscapeId = landscape.landscapeId;
			$scope.modelInput.landscape.complete = landscape.complete;
			$scope.modelInput.landscape.resourceName = landscape.resourceName;
		}
	}
	
	if ($scope.familyLandscapesOnly) {
		// Set context to "Family" if 'familyOnly="true"' was passed into the directive
		$scope.landscapeContextEnum = landscapeResource.ScopeEnum.FAMILY;
		var selectedFamilyLcp = landscapeResource.getSelectedFamilyLandscape();
		if (selectedFamilyLcp)  $scope.selected_landscape = selectedFamilyLcp;  
		$scope.setLandscapeDataInModelInput(selectedFamilyLcp);  //TODO: need this?
	}
	
	if (!$scope.modelInput) {
		console.log("INFO: modelInput scope parameter is undefined or null in runModelDirective.")
	} 
	
	if ( $scope.landscapeContextEnum == landscapeResource.ScopeEnum.ALL || 
		($scope.landscapeContextEnum == landscapeResource.ScopeEnum.FAMILY && $rootScope.selectedZeroLandscapeFlag))
	{
		landscapeResource.getUserLandscapes($rootScope.current_user_id, $scope.landscapeContextEnum).then(
			function(response) {
				$scope.familyLandscapeList = response;
				$scope.familyLandscapeListRetrievedFlag++;
				if ($scope.familyLandscapeList && $scope.familyLandscapeList.length == 0) {
					$scope.emptyLandscapeList = true;
				} 
			}, 
			function(errorResponse) {
				$scope.errorMessage = errorResponse.data.responseMessage;
				$scope.displayError = true;
				console.log(errorResponse);
			}
		);
	}
	
	$scope.getUserLandscapes = function() 
	{
		landscapeResource.getUserLandscapes($rootScope.current_user_id, $scope.landscapeContextEnum).then(function(response) {
			$scope.familyLandscapeList = response;
			$scope.familyLandscapeListRetrievedFlag++;
		}, function(errorResponse) {
			$scope.displayError = true;
			$scope.errorMessage = "Error retrieving landscapes: " + errorResponse;
		});	
	}
	
	$scope.refreshModelRuns = function()
	{
		var modelInputId = null;
		if ($scope.modelInput)  modelInputId = $scope.modelInput.resourceDef.runId;
			
		if (modelInputId) {
			$scope.loading_label_class = "show-with-fade";
			modelResource.getModelRunsForInputId(modelInputId, "Flam", "cmprl").then(
				function(response) {
					if (response && response.data) {
						$scope.modelRunBOList = response.data;
						console.log("Retrieved " + response.data.length + " model runs for model input " + modelInputId);
					} else {
						$scope.modelRunBOList = response;
						console.log("Unexpected response retrieving model runs: " + response);
					}
					if ($scope.modelRunBOList)  console.log("Retrieved " + $scope.modelRunBOList.length + " model runs.");
					$scope.addRunInfoToEachLandscape();
					$scope.modelRunsRetrievedFlag++;
					$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				},
				function(errorResponse) {
					console.log("Error receiving model runs: " + errorResponse);
					$scope.displayError = true;
					$scope.errorMessage = "There was an error getting the status of the model runs: " + errorResponse;
					$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				}
			);
		} else {
			console.log("Error: $scope.modelInput should be defined at this point.");
		}
	}
	
	$scope.refreshUserLandscapes = function() 
	{
		if ($scope.landscapeContextEnum == landscapeResource.ScopeEnum.FAMILY) {
			$scope.selected_zero_landscape = landscapeResource.getSelectedZeroLandscape();
			if (!$scope.selected_zero_landscape) {
				return;
			}
		}
		$scope.loading_label_class = "show-with-fade";
		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id, $scope.landscapeContextEnum).then(function(response) {
			//TODO: move refresh of family landscapes to main controller for all tabs: createTreatmentAlternativesController.js
			$scope.familyLandscapeList = response;
			$scope.familyLandscapeListRetrievedFlag++;
			$scope.initializeRunRequestInfoForEachLandscape();
			$scope.refreshModelRuns();
			$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
			//$scope.addRunInfoToEachLandscape(); // call here to set landscape.modelRunRequestBO before model input retrieved
		}, function(errorResponse) {
			$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
			$scope.displayError = true;
			$scope.errorMessage = "Error retrieving landscapes: " + errorResponse;
		});	
	}
	
	/** @return  a run status name from its enumerated string value */
	$scope.getRunStatusName = function(statusEnum) {
		//TODO: probably move this into modelResource.js
		var modelStatusHashMapExists = Object.keys($rootScope.modelStatusHash).length > 0;
		if (modelStatusHashMapExists) {
			return $rootScope.modelStatusHash[statusEnum];
		} else {
			modelResource.getModelStatuses().then(
				function(response) {
					modelStatusHashMapExists = Object.keys($rootScope.modelStatusHash).length > 0;
					if (modelTypeHashMapExists && statusEnum) {
						return $rootScope.modelStatusHash[statusEnum];
					} else {
						return "(NA)";
					}
				},
				function(errorResponse) {
					console.log("Could not retrieve run status names.  " + errorResponse);
				}
			);
		}
	}
	
	/** Derive model run request info for a landscape and add it to the landscape object */
	$scope.addRunRequestInfo = function(landscape, modelRunBO)
	{
		$scope.initializeRunRequestInfo(landscape);
		if ($scope.modelInput) {
			landscape.modelRunRequestBO.modelInputId = $scope.modelInput.resourceDef.runId;
			landscape.modelRunRequestBO.containId = $scope.modelInput.resourceDef.containId;
			landscape.modelRunRequestBO.owner = $scope.modelInput.resourceDef.owner || $rootScope.user_record.userId;
		} else {
			console.log("$scope.modelInput not defined yet in runModelDirective.js");
		}
		if (modelRunBO) {
			console.log("Attaching model run [" + modelRunBO.resourceName + " (" + modelRunBO.runId + ") " + modelRunBO.modelRunStatus + "] to landscape [" + landscape.resourceName + "]");
			landscape.modelRunId = modelRunBO.runId;
			landscape.modelRunName = modelRunBO.resourceName;
			landscape.modelRunCreated = modelRunBO.created;
			landscape.modelRunStarted = modelRunBO.started;
			landscape.modelRunCompleted = modelRunBO.completed;
			landscape.modelRunType = modelRunBO.modelType;
			landscape.modelRunStatus = modelRunBO.modelRunStatus;
			landscape.modelRunStatusName = $scope.getRunStatusName(modelRunBO.modelRunStatus);
		} else {
			landscape.modelRunStatus = 'rdy_';
			landscape.modelRunStatusName = $scope.getRunStatusName(landscape.modelRunStatus);
		}
		var zeroSelectedLandscape = landscapeResource.getSelectedZeroLandscape();
		if (zeroSelectedLandscape) {
			landscape.modelRunRequestBO.zeroLcpId = zeroSelectedLandscape.landscapeId;
		}
	}
	
	/** Find modelRunBO for a landscape - it may not exist.  Could improve this with associative array. */
	$scope.findModelForLandscape = function(landscape)
	{
		var returnRun = null;
		if ($scope.modelRunBOList && $scope.modelRunBOList.length) {
			for (var i=0; i<$scope.modelRunBOList.length; i++) {
				var modelRunBO = $scope.modelRunBOList[i];
				if (modelRunBO && modelRunBO.landscapeId && modelRunBO.landscapeId == landscape.landscapeId) {
					returnRun = modelRunBO;
				} 
			}
		}
		
		return returnRun;
	}
	
	$scope.addRunInfoToEachLandscape = function() 
	{
		if (!$scope.familyLandscapeList || $scope.familyLandscapeList.length < 1)  return;
		for (var i=0; i<$scope.familyLandscapeList.length; i++) {
			var lcp = $scope.familyLandscapeList[i];
			console.log("Retrieved landscape: " + lcp.resourceName + " (" + lcp.landscapeId + ")");
			var modelRunBO = $scope.findModelForLandscape(lcp);
			$scope.addRunRequestInfo(lcp, modelRunBO);
		}
	}
	
	$scope.initializeRunRequestInfo = function(landscape)
	{
		if (!landscape)  return;
		landscape.modelRunRequestBO = new ModelRunRequestBO();
		landscape.modelRunRequestBO.resourceName = landscape.resourceName;
		landscape.modelRunRequestBO.landscapeId = landscape.landscapeId;
		landscape.modelRunStatus = 'rdy_';
		landscape.modelRunStatusName = $scope.getRunStatusName(landscape.modelRunStatus);
	}
	
	$scope.initializeRunRequestInfoForEachLandscape = function()
	{
		if (!$scope.familyLandscapeList || $scope.familyLandscapeList.length < 1)  return;
		for (var i=0; i<$scope.familyLandscapeList.length; i++) {
			$scope.initializeRunRequestInfo($scope.familyLandscapeList[i]);
		}
	}
	
	// Fetch the family of landscapes for the UI 
	if ($rootScope.selectedZeroLandscapeFlag)
	{
		$scope.getUserLandscapes();
	}
	
	$scope.readyToRunModel = function(landscape) {
		if (!$scope.allInputsReadyFlag)  return false;
		if (!$scope.modelInput)  return false;
		if (!$scope.modelInput.resourceDef)  return false;
		if (!$scope.modelInput.resourceDef.name)  return false;
		if ($scope.modelInput.resourceDef.name.length < 1)  return false;
		if (!$scope.modelInput.landscape)  return false;
		if (!$scope.modelInput.landscape.landscapeId)  return false;
		if (!landscape.complete)  return false;
		if (!landscape)  return false;
		if (landscape.runButtonClass)  return false;
		if (!landscape.modelRunRequestBO.resourceName)  return false;
		return true;
	}
	
	$scope.runModel = function(landscape) 
	{		
		if (!$scope.modelInput || !$scope.modelInput.resourceDef) {
			$scope.displayError = true;
			$scope.errorMessage = "Local error: modelInput is not defined so model can't be run.";
			return;
		}
		
		if (!landscape || !landscape.modelRunRequestBO) {
			$scope.displayError = true;
			$scope.errorMessage = "Local error: the request for running the model is not valid so the model can't be run.";
			return;
		}
		landscape.runWaitingClass="wait-spinning-md";  //display spinning wait icon and disable run button
		
		if (landscape.resourceSubType == "zero") {
			landscape.modelRunRequestBO.zeroLcpId = landscape.landscapeId;
		}
		modelResource.submitModelRunRequest(landscape.modelRunRequestBO).then(
			function(response) {
				landscape.runWaitingClass = null;
				// landscape.modelRunId = modelRunBO.runId; //TODO: assign the model run ID in the next line
				landscape.modelRunName = landscape.modelRunRequestBO.resourceName;
				landscape.modelRunStatus = 'init';
				landscape.modelRunStatusName =  $scope.getRunStatusName(landscape.modelRunStatus);
				$scope.displaySuccess = true;
				$scope.successMessage = "Model run '" + landscape.modelRunRequestBO.resourceName + "' was successfully requested.";
			},
			function(errorResponse) {
				landscape.runWaitingClass = null;
				landscape.modelRunStatus = 'fail';
				landscape.modelRunStatusName = $scope.getRunStatusName(landscape.modelRunStatus);
				$scope.displayError = true;
				$scope.errorMessage = "There was an error requesting the submitted model run";
				if (errorResponse.data) {
					$scope.errorMessage = errorResponse.data.responseMessage;
				}
				$scope.refreshUserLandscapes();
				//slandscape.modelRunName = landscape.modelRunRequestBO.resourceName;
			}
		);
	}
	
	$scope.lcp_select = function(landscape) {
		$scope.selected_landscape = landscape;
		if ($scope.familyLandscapesOnly) {
			$rootScope.selectedFamilyLandscapeFlag = true;
			landscapeResource.setSelectedFamilyLandscape(landscape);
		}
		$scope.setLandscapeDataInModelInput(landscape);
		if($scope.selected_landscape.complete && $window.document.getElementById("mapStudioIframe")) {
			$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('landscapeid='+landscape.landscapeId, '*');
		}
	}
	
	$scope.goToCreateLandscapePage = function() {
		$location.path("/cycle/topic/landscape_eval/task/summary");
	}
	
	// Scope Watches
	$scope.$watch('addedLandscapeToFamilyFlag', function() {
		//TODO: Do we need to do a wait timer here so the edit landscape service can have a chance to add the landscape_resource record?
		if ($scope.addedLandscapeToFamilyFlag)  $scope.refreshUserLandscapes();
	});
	
	$scope.$watch('modelInputsRetrievedFlag', function() {
		if ($scope.modelInputsRetrievedFlag)  $scope.refreshModelRuns();
	});
	
//	$rootScope.$on('newLandscapeCreated', function(event, landscapeName) {
//		//$scope.listUpdatedFromMap = true;
//		//$timeout(function() { $scope.listUpdatedFromMap = false; }, 2500);
//		//$scope.$apply();
//		$timeout(function() { 
//			$scope.refreshUserLandscapes();
//		}, 25000);
//		//$scope.refreshUserLandscapes();
//		console.log("runModelDirective, newLandscapeCreated notification for " + landscapeName);
//	});	
	
	// Root Scope Watches
	$rootScope.$watch('selectedFamilyLandscapeFlag', function() {
		if ($rootScope.selectedFamilyLandscapeFlag)  $scope.selected_landscape = landscapeResource.getSelectedFamilyLandscape();
	});
	
	$rootScope.$watch('selectedZeroLandscapeFlag', function() 
	{ 	
		// When the Zero landscape changes then fetch its landscape family list
		if ($rootScope.selectedZeroLandscapeFlag) {
			$scope.refreshUserLandscapes();
			$scope.selected_landscape = null; //TODO: might not need this anymore
		}
	});
	
}])