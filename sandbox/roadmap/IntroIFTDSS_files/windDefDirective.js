mainApp.directive('windDefPanelDirective',function(){
	return {
		templateUrl: "pages/modelpages/windDefPanel_partial.html",
		scope: {validation:'<',
			    inputWind: '=input',
			    modelInputChanged: '=modelInputChanged',
			    modelInputsRetrievedFlag: "=modelInputsRetrievedFlag"
			   },
		link: function($scope, element, attrs) {
			$scope.triggerValidateInputs = function() {
				console.log("Inside windefController - about to validate inputs");
			}
		},
		controller: "windDefController"
	}
}).controller('windDefController',["$scope","$filter","$rootScope","modelValidationFactory","workspaceResource","breadcrumbResource","modelInputService",
  function($scope,$filter,$rootScope,modelValidationFactory,workspaceResource,breadcrumbResource, modelInputService){
	
	$scope.windInputClass = "";
	
	$scope.validateInputs = function() {
		if ($scope.inputWind && modelValidationFactory.valid_wind($scope.inputWind)) {
			$scope.windInputClass = "guidance-success";
			$scope.validation();
		} else {
			$scope.windInputClass = "";
		}
		$scope.modelInputChanged++;
	}

	$scope.$watch($scope.inputWind,function(){
		console.log("scope.validateInputs called in winDefController");
		$scope.validateInputs()
	});
	
	$scope.$watch('modelInputsRetrievedFlag', function() 
	{ 	
		// When new model inputs are retrieved then we want to validate them so panel headers show the correct color
		if ($scope.modelInputsRetrievedFlag) {
			$scope.validateInputs();
		}
	});
}])