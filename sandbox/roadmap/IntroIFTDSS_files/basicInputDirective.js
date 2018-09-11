mainApp.directive('basicInputDirective',function(){
	return {
		templateUrl: "pages/modelpages/basicInput_partial.html",
		scope: { modelInput: '=input',
				 familyLandscapesOnly: '=familyOnly', 
				 allInputsReadyFlag: '=allInputsReady',
				 userSavedModelInput: '=userSavedModelInput',
				 modelInputsRetrievedFlag: '=modelInputsRetrievedFlag',
				 modelRunsRetrievedFlag: '=modelRunsRetrievedFlag',
				 familyLandscapeList: '=familyLandscapeList',
				 familyLandscapeListRetrievedFlag: '=familyLandscapeListRetrievedFlag'
			},
		controller: "basicInputDirectiveController"
	}
}).controller('basicInputDirectiveController',["$scope","$window","$rootScope","$filter","$timeout","landscapeResource","modelValidationFactory","modelInputService",
  function($scope,$window,$rootScope,$filter,$timeout,landscapeResource,modelValidationFactory,modelInputService)
{
	$scope.displaySuccess = false;
	$scope.successMessage = "";
	$scope.displayError = false;
	$scope.errorMessage = "";
	$scope.modelsRunAgainstThisInputFlag = false;
	$scope.modelInputChanged = 0;
	
	$scope.landscapeContextEnum = landscapeResource.ScopeEnum.ALL;
	
	
	if ($scope.familyLandscapesOnly) {
		// Set context to "Family" if 'familyOnly="true"' was passed into the directive
		$scope.landscapeContextEnum = landscapeResource.ScopeEnum.FAMILY;
	}
	
	if (!$scope.modelInput) {
		console.log("INFO: modelInput scope parameter is undefined or null in basicInputDirective.");
	} 
	
	function hideSuccessNotification() {
		$scope.displaySuccess = false;
		$scope.successMessage = "";
	}
	
	$scope.saveModelInputs = function() {
		if (!$scope.modelInput || !$scope.modelInput.resourceDef) {
			$scope.displayError = true;
			$scope.errorMessage = "Unexpected error: the model input is not defined yet.";
			return;
		}
		if (!$scope.modelInput.resourceDef.owner && $rootScope.current_user_id) {
			$scope.modelInput.resourceDef.owner = $rootScope.current_user_id;
		}
		$scope.saveWaitingClass = "wait-spinning-md";
		modelInputService.saveModelInput($scope.modelInput).then(
			function(response) {
				$scope.userSavedModelInput++;  // increment flag so watch is triggered
				$scope.saveWaitingClass = null;
				$scope.displaySuccess = true;
				$scope.successMessage = "Your model input values have been saved.";
				if (response && response.data && response.data.entityId && $scope.modelInput.resourceDef) {
					$scope.modelInput.resourceDef.runId = response.data.entityId;
				}
				$timeout(hideSuccessNotification, 4000);
			}, 
			function(errorResponse) {
				$scope.saveWaitingClass = null;
				console.log(errorResponse);
				$scope.displayError = true;
				$scope.errorMessage = "There was an error saving your model input";
				if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
					$scope.errorMessage += ": " + errorResponse.data.responseMessage;
				}
			}
		);
	}
	
//	$scope.modifyModelInputs = function() {
//		$scope.displaySuccess = true;
//		$scope.successMessage = "Once a model run exists that uses these inputs it cannot be modified. A delete function will be made available in the future. For now you can delete the model runs that are dependent on this model input in your workspace. At that time you can reset this model input.";
//	}
	
	// Model Validation functions
	$scope.weatherInputComplete = function() {
		if ($scope.modelInput && modelValidationFactory.valid_weatherConditioning($scope.modelInput.weather)) {
			$scope.allInputsComplete();
		}
	}
	$scope.windInputComplete = function() {
		if ($scope.modelInput && modelValidationFactory.valid_wind($scope.modelInput.wind)) {
			$scope.allInputsComplete();
		} 
	}
	$scope.crownFireInputComplete = function() {
		if ($scope.modelInput && modelValidationFactory.valid_crown_fire($scope.modelInput.crownFire)) {
			$scope.allInputsComplete();
		} 
	}
	
	$scope.fuelMoistureInputComplete = function() {
		if ($scope.modelInput && modelValidationFactory.valid_initialFuelMoisture($scope.modelInput.fuelMoisture)){
			$scope.allInputsComplete();
		}
	}
	
	$scope.allInputsComplete = function() {
		if ($scope.modelInput && 
			modelValidationFactory.valid_wind($scope.modelInput.wind) &&
			modelValidationFactory.valid_crown_fire($scope.modelInput.crownFire) && 
			modelValidationFactory.valid_initialFuelMoisture($scope.modelInput.fuelMoisture)) 
		{
			$scope.allInputsReadyFlag = true;
		} else {
			$scope.allInputsReadyFlag = false;
		}
	}
	
	
	$scope.modelInput = modelInputService.getDefaultNewRunInput();
	
	/** Check to see if any of the models run against this one input have been initiated */
	$scope.checkForModelsRunAgainstThisInput = function() {
		$scope.modelsRunAgainstThisInputFlag = false;
		if ($scope.familyLandscapeList && $scope.familyLandscapeList.length > 0) {
			for (var i=0; i<$scope.familyLandscapeList.length; i++) {
				var lcp = $scope.familyLandscapeList[i];
				if (lcp.modelRunStatus && lcp.modelRunStatus != 'rdy_') {
					$scope.modelsRunAgainstThisInputFlag = true;
				}
			}
		}
	}
	
	$scope.$watch('modelRunsRetrievedFlag', function() {
		if ($scope.modelRunsRetrievedFlag)  $scope.checkForModelsRunAgainstThisInput();
	});
	
	$scope.$watch('familyLandscapeListRetrievedFlag', function() {
		if ($scope.familyLandscapeListRetrievedFlag)  $scope.modelsRunAgainstThisInputFlag = false;
	});
	
	$scope.$watch('modelInputChanged', function() {
		if ($scope.modelInputChanged) $scope.allInputsComplete();
	});
	
	$scope.$watch('modelInputsRetrievedFlag', function() 
	{ 	
		// When new model inputs are retrieved then we want to validate them so panel headers show the correct color
		if ($scope.modelInputsRetrievedFlag) {
			$scope.allInputsComplete();
		}
	});
	
}])