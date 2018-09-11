mainApp.directive('developTreatAltCompareDirective',function(){
	return {
		templateUrl: "pages/landscape/compare/developTreatAltCompare_partial.html",
		scope: { modelInput: '=modelInput',
				 selected_landscape: '=input',
				 selectedAOI: '=aoi',
				 familyLandscapesOnly: '=familyOnly',
				 familyLandscapeList: '=familyLandscapeList',  // runModelDirective.js is responsible for updated family lcp list for now
				 familyLandscapeListRetrievedFlag: '=familyLandscapeListRetrievedFlag',
				 modelRunsRetrievedFlag: '=modelRunsRetrievedFlag',
				 selectedLandscapeForRulesDialog: '=selectedLandscapeForRulesDialog',
				 selectedLandscapeChangedFlag: '=selectedLandscapeChangedFlag'
			},
		controller: "developTreatAltCompareDirectiveController"
	}
}).controller('developTreatAltCompareDirectiveController',["$scope","$window","$rootScope","$routeParams","$timeout","landscapeResource","modelResource",
  function($scope,$window,$rootScope,$routeParams,$timeout,landscapeResource, modelResource)
{
	$scope.displaySuccess = false;
	$scope.successMessage = "";
	$scope.displayError = false;
	$scope.errorMessage = "";
	$scope.reportStatus = {};
	$scope.reportStatus.displaySuccess = false;
	$scope.reportStatus.successMessage = "";
	$scope.reportStatus.displayError = false;
	$scope.reportStatus.errorMessage = "";
	//$scope.anyModelsRun = false;  // whether there are any run models on this tab
	$scope.landscapeContextEnum = landscapeResource.ScopeEnum.ALL;
	$rootScope.selectedZeroLandscapeFlag = 0;
	$scope.loading_label_class = "hide-with-fade";
	
	if ($scope.familyLandscapesOnly) {
		// Set context to "Family" if 'familyOnly="true"' was passed into the directive
		$scope.landscapeContextEnum = landscapeResource.ScopeEnum.FAMILY;
	}
	
	/** @return  true if the split-map is being displayed */
	$scope.displayingSplitMap = function() {
		if ($rootScope.splitMapOpen)  return true;
		return false;
	}
	
	$scope.displayLandscapeOnMap = function(landscape) {
		$rootScope.displayMessage($scope, $timeout, "success", "Landscape " + landscape.resourceName + " will be added to the map.",4000);
		if (!$rootScope.splitMapOpen)
		{
			$rootScope.toggleMap('addlandscapeid='+JSON.stringify(landscape));
		}
		$rootScope.postMessageToMapStudio('addlandscapeid='+JSON.stringify(landscape));
	}
	
	$scope.displayModelOnMap = function(landscape) 
	{
		$rootScope.displayMessage($scope, $timeout, "success", "Model output " + landscape.modelRunName + " will be added to the map.",4000);
		if (!$rootScope.splitMapOpen)
		{
			$rootScope.toggleMap('addrunid='+JSON.stringify(landscape));
		}
		$rootScope.postMessageToMapStudio('addrunid='+JSON.stringify(landscape));
	}
	
	/** Reset all the check-boxes to unselected. */
	$scope.resetCheckboxes = function() {
		if (!$scope.familyLandscapeList)  return;
		for (var i=0; i<$scope.familyLandscapeList.length; i++) {
			if ($scope.familyLandscapeList[i].isChecked) {
				$scope.familyLandscapeList[i].isChecked = false;
			}
		}
	}
	
	$scope.getMaxOrder = function() {
		var maxOrder = 0;
		for (var i=0; i<$scope.familyLandscapeList.length; i++) {
			var lcp = $scope.familyLandscapeList[i];
			if (lcp.isChecked && lcp.order && lcp.order > maxOrder) {
				maxOrder = lcp.order;
			}
		}
		return maxOrder;
	}
	
	$scope.removeOrder = function(landscape) {
		var orderOfUncheckedLcp = landscape.order;
		landscape.order = null;
		for (var i=0; i<$scope.familyLandscapeList.length; i++) {
			var lcp = $scope.familyLandscapeList[i];
			if (lcp.isChecked) {
				if (lcp.order && lcp.order > 1 && lcp.order >= orderOfUncheckedLcp) {
					lcp.order--;
				} 
			}
		}
	}
	
	$scope.calculateCheckboxOrder = function(landscape) 
	{
		if (landscape.isChecked && !landscape.order) {
			landscape.order = $scope.getMaxOrder() + 1;
		} else if (!landscape.isChecked && landscape.order) {
			$scope.removeOrder(landscape);
		} else {
			console.log("Shouldn't have a checked lcp without order set ... or unchecked lcp with order set.");
		}
	}
	
	/** @return an array of landscapes with checkboxes selected.  An empty array is returned if none. */
	$scope.getSelectedLandscapes = function() 
	{
		var selectedLandscapes = new Array();
		if (!$scope.familyLandscapeList)  return selectedLandscapes;
		for (var i=0; i<$scope.familyLandscapeList.length; i++) {
			if ($scope.familyLandscapeList[i].isChecked) {
				selectedLandscapes.push($scope.familyLandscapeList[i]);
			}
		}
		return selectedLandscapes;
	}
	
	$scope.getSelectedLandscape = function() {
		for (var i=0; i<$scope.familyLandscapeList.length; i++) {
			if ($scope.familyLandscapeList[i].isChecked) {
				return $scope.familyLandscapeList[i];
			}
		}
	}
	

	// Temporary function for notification message - @deprecated
	$scope.landscapeAsString = function(landscape) {
		var lcpString = landscape.order + ". ";
		lcpString += landscape.resourceName;
		lcpString += " (lcpId=";
		lcpString += landscape.landscapeId;
		if (landscape.modelRunId) {
			lcpString += ", modelRunId=";
			lcpString += landscape.modelRunId;
		}
		if (landscape.modelRunName) {
			lcpString += ", modelRunName=";
			lcpString += landscape.modelRunName;
		}
		if (landscape.modelRunStatus) {
			lcpString += ", modelRunStatus=";
			lcpString += landscape.modelRunStatus;
		}
		if (landscape.modelRunStatusName) {
			lcpString += ", modelRunStatusName=";
			lcpString += landscape.modelRunStatusName;
		}
		lcpString += ") ";
		return lcpString;
	}
	
	$scope.getTwoSelectedMessage = function() {
		var landscapes = $scope.getSelectedLandscapes();
		if (!landscapes || landscapes.length < 1)  return "No landscapes selected.  ";
		if (landscapes && landscapes.length > 2)  return "Selected landscapes will be added to the map.";
		if (landscapes && landscapes.length == 2)  {
			var message = "Selected landscapes will be added to the map. A difference grid between '";
			if (landscapes[0] && landscapes[0].order ==1 ) {
				message += landscapes[0].resourceName;
				message += "' and '";
				message += landscapes[1].resourceName;
				message += "' will be displayed as well.";
			}else{
				message += landscapes[1].resourceName;
				message += "' and '";
				message += landscapes[0].resourceName;
				message += "' will be displayed as well.";
			}
			return message;
		} else {
			//selected one
			var message = "Selected landscape '";
			if (landscapes[0])  message += landscapes[0].resourceName;
			message += "' will be added to the map.";
			return message;
		}
	}
		
	$scope.compareOnMap = function() 
	{
		var selectedLandscapes = $scope.getSelectedLandscapes();
		$rootScope.displayMessage($scope, $timeout, "success", $scope.getTwoSelectedMessage(),4000);
		
		if (!$rootScope.splitMapOpen)
		{
			$rootScope.toggleMap('compareLandscapes='+JSON.stringify(selectedLandscapes));
		}

		// Call code to display the landscapes on a map here
		if (selectedLandscapes && selectedLandscapes.length >0){
			$rootScope.postMessageToMapStudio('compareLandscapes='+JSON.stringify(selectedLandscapes));
		}
	}
	
	$scope.compareTwoLandscapesReport = function() 
	{
		var selectedLandscapes = $scope.getSelectedLandscapes();
		// Call code to display comparison summary report (or dialog) here
	}
	
	$scope.getCheckboxSelectedCount = function() {
	
		if (!$scope.familyLandscapeList)  return 0;
		var selectedCount = 0;
		for (var i=0; i<$scope.familyLandscapeList.length; i++) {
			if ($scope.familyLandscapeList[i].isChecked)  selectedCount++;
		}
		return selectedCount;
	}
	$scope.areTwoCheckboxesSelected = function() {
		return $scope.getCheckboxSelectedCount() == 2;
	}
	$scope.enableCompareReportButton = function() {
		var enableButton = false;
		if ($scope.areTwoCheckboxesSelected()) {
			var selectedLandscapes = $scope.getSelectedLandscapes();
			enableButton = true;
			for (var i=0; i<selectedLandscapes.length; i++) {
				var landscape = selectedLandscapes[i];
				if (landscape.isChecked)   {
					if ( (typeof(landscape.modelRunId) == 'undefined') ||
						 (landscape.modelRunId < 1) ||
						 (landscape.landscapeId < 1) ||
						 (landscape.modelRunStatus != "done") ) {
						enableButton = false;
						break;
					}
				}
			}
		}
		return enableButton;
		
	}
	$scope.areAtLeastTwoCheckboxesSelected = function() {
		return $scope.getCheckboxSelectedCount() > 1;
	}
	$scope.isOneNonZeroCheckboxSelected = function() {
		var selectedCount = $scope.getCheckboxSelectedCount();
		if (selectedCount != 1)  return false;
		var selected = $scope.getSelectedLandscape();
		if (selected && selected.resourceSubType && selected.resourceSubType == 'zero')  return false;
		return true
	}
	$scope.isAtLeastOneCheckboxSelected = function() {
		return $scope.getCheckboxSelectedCount() > 0;
	}
	
	//TODO: the following few functions could possibly be re-factored/moved to createTreatmentAlternativesController.js
	//      I copied over all these methods from runModelDirective.js to simply add a landscape refresh button.  There 
	//      is a lot of duplicate code that now causes dual maintenance - re-factor this.  ...vncook.
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
	
	$scope.refreshModelRuns = function()
	{
		var modelInputId = null;
		if ($scope.modelInput)  modelInputId = $scope.modelInput.resourceDef.runId;
			
		if (modelInputId) {
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
				},
				function(errorResponse) {
					console.log("Error receiving model runs: " + errorResponse);
					$scope.displayError = true;
					$scope.errorMessage = "There was an error getting the status of the model runs: " + errorResponse;
				}
			);
		} else {
			console.log("Error: $scope.modelInput should be defined at this point.");
		}
	}
	
	$scope.initializeRunRequestInfo = function(landscape)
	{
		if (!landscape)  return;
		landscape.modelRunRequestBO = new ModelRunRequestBO();
		landscape.modelRunRequestBO.resourceName = landscape.resourceName + " - Landscape Fire Behavior";
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
			$scope.$digest;
			//$scope.addRunInfoToEachLandscape(); // call here to set landscape.modelRunRequestBO before model input retrieved
		}, function(errorResponse) {
			$scope.displayError = true;
			$scope.errorMessage = "Error retrieving landscapes: " + errorResponse;
			$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
		});	
	}
	
	$scope.selectLandscapeForRulesDialog = function() {
		$scope.selectedLandscapeForRulesDialog = $scope.getSelectedLandscape();
		$scope.selectedLandscapeChangedFlag++;
	}
	
	$scope.$watch('familyLandscapeListRetrievedFlag',
		function() {
			$scope.resetCheckboxes();
			$scope.successMessage = "";
			$scope.displaySuccess = false;
			//$scope.checkForAnyModelsRun();
		}
	);
	
}])