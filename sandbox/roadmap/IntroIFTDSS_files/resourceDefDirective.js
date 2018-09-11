mainApp.directive('resourceDefPanelDirective',function(){
	return {
		templateUrl: "pages/modelpages/resourceDefPanel_partial.html",
		scope: {validation:'<',
			 	input: '='
			   },
		controller: "resourceDefController"
	}
}).controller('resourceDefController',["$scope","$filter","$rootScope","modelValidationFactory","workspaceResource","breadcrumbResource",
  function($scope,$filter,$rootScope,modelValidationFactory,workspaceResource,breadcrumbResource){
	
	$scope.runCreationInputClass = "";
	
	$scope.validateInputs = function() {
		if (!$scope.input.runId && $scope.input.name) {
			$scope.validation();
		}
		if ($scope.input && modelValidationFactory.valid_runCreation($scope.input)) {
			$scope.runCreationInputClass = "guidance-success";
			$scope.validation();
		} else {
			$scope.runCreationInputClass = "";
		}
	}
	
	$scope.$watch($scope.input,function(){$scope.validateInputs()})
    
}])