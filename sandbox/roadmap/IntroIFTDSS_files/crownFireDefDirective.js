mainApp.directive('crownfireDefPanelDirective',function(){
	return {
		templateUrl: "pages/modelpages/crownFireDefPanel_partial.html",
		scope: {validation:'<',
			    inputCrownFire: '=input',
			    modelInputChanged: '=modelInputChanged',
			    modelInputsRetrievedFlag: "=modelInputsRetrievedFlag"
			   },
		controller: "crownFireDefController"
	}
}).controller('crownFireDefController',["$scope","$filter","$rootScope","modelValidationFactory","workspaceResource","breadcrumbResource",
  function($scope,$filter,$rootScope,modelValidationFactory,workspaceResource,breadcrumbResource){
	$scope.crownFireInputClass = "";
	$scope.crownMethods = [{"id":1, "name":"Finney"},{"id":2, "name":"Scott/Reinhardt"}];
	
	if ($scope.inputCrownFire && $scope.inputCrownFire.method) {
		for (var i=0; i<$scope.crownMethods.length; i++) {
			if ($scope.crownMethods[i].name == $scope.inputCrownFire.method) {
				$scope.inputCrownFire.crownFireMethod = $scope.crownMethods[i];
			}
		}
	} else {
		$scope.inputCrownFire.crownFireMethod = $scope.crownMethods[1]; //default to Scott/Reinhardt if not set
	}
	
	$scope.crown_method_select = function(crownMethod) {
		$scope.inputCrownFire.crownFireMethod = crownMethod;
		$scope.validateInputs();
	}
	
	$scope.validateInputs = function() {
		if ($scope.inputCrownFire && modelValidationFactory.valid_crown_fire($scope.inputCrownFire)) {
			$scope.crownFireInputClass = "guidance-success";
			$scope.validation();
		} else {
			$scope.crownFireInputClass = "";
		}
		$scope.modelInputChanged++;
	}
	
	$scope.$watch($scope.inputCrownFire,function() {
		console.log("scope.validateInputs called in crownFireDefController");
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