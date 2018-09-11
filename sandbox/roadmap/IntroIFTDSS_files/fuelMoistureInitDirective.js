//fuelmoisture-init-panel-directive 
mainApp.directive('fuelmoistureInitPanelDirective',function(){
	return {
		templateUrl: "pages/modelpages/fuelMoistureInitPanel_partial.html",
		scope: {validation:'<',
			    inputFuelMoisture: '=input',
			    modelInputChanged: '=modelInputChanged',
			    modelInputsRetrievedFlag: "=modelInputsRetrievedFlag"
			   },
		controller: "fuelMoistureInitController"
	}
}).controller('fuelMoistureInitController',["$scope","$filter","$rootScope","modelValidationFactory","workspaceResource","breadcrumbResource","landscapeResource",
  function($scope,$filter,$rootScope,modelValidationFactory,workspaceResource,breadcrumbResource,landscapeResource) {
	$scope.fuelMoistureInputClass = "";
	$scope.fuelModels = null;
	
	$scope.validateInputs = function() {
		if ($scope.inputFuelMoisture && modelValidationFactory.valid_initialFuelMoisture($scope.inputFuelMoisture)) {
			$scope.fuelMoistureInputClass = "guidance-success";
			$scope.validation();
		} else {
			$scope.fuelMoistureInputClass = "";
		}
		$scope.modelInputChanged++;
	}
	
	$scope.deleteFuelMoisture = function(index) {
		$scope.inputFuelMoisture.fuelMoistureArray.splice(index,1);
		$scope.fuelMoistureInputComplete();
	}
	
	landscapeResource.getFuelModels().then(function(response) {
		$scope.fuelModels = response;
		// derive a name for the pull-down list from the attributes
		for (var i=0; i<$scope.fuelModels.length;i++) {
			if ($scope.fuelModels[i].fuelModelCode) {
				$scope.fuelModels[i].descrip = $scope.fuelModels[i].fuelModelNumber + " (" + $scope.fuelModels[i].fuelModelCode + ")";
			} else if ($scope.fuelModels[i].name) {
				$scope.fuelModels[i].descrip = $scope.fuelModels[i].fuelModelNumber + " - " + $scope.fuelModels[i].name;
			}
		}
	},function(response) {
		$scope.displayError = true;
		$scope.errorMessage = response;
	});

	
	$scope.$watch($scope.inputFuelMoisture,function() {
		console.log("scope.validateInputs called in fuelMoistureInitController");
		$scope.validateInputs();
	});
	
	$scope.$watch('modelInputsRetrievedFlag', function() 
	{ 	
		// When new model inputs are retrieved then we want to validate them so panel headers show the correct color
		if ($scope.modelInputsRetrievedFlag) {
			$scope.validateInputs();
		}
	});
	
}])