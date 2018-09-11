mainApp.directive('displayAppliedLandscapeRulesDirective',function(){
	return {
		templateUrl: "pages/landscape/displayAppliedLandscapeRules_partial.html",
		scope: {
			landscape: '<landscape',
			landscapeChangedFlag: '=landscapeChangedFlag'
		  },
		controller: "displayAppliedLandscapeRulesController"
	}
}).controller('displayAppliedLandscapeRulesController',["$scope","$rootScope","$window","landscapeResource","landscapeEditService",
  function($scope,$rootScope,$window,landscapeResource,landscapeEditService)
  {
	$scope.retrieveFailMessage = null;
	$scope.landscapeRules = null;
	
	$scope.lfluCategories = [];
	$scope.lfluSeverities = [];
	$scope.lfluSimulationTimes = [];
	
	
	landscapeEditService.getLfluCategories().then(function(response) {
		$scope.lfluCategories = response;
	},function(response) {
		$scope.retrieveFailMessage = response;
	});
	
	landscapeEditService.getLfluSeverities().then(function(response) {
		$scope.lfluSeverities = response;
	},function(response) {
		$scope.retrieveFailMessage = response;
	});
	
	landscapeEditService.getLfluSimulationTimes().then(function(response) {
		$scope.lfluSimulationTimes = response;
	},function(response) {
		$scope.retrieveFailMessage = response;
	});
	
	// Retrieve applied landscape edit rules
	$scope.retrieveRules = function(landscapeId) {
		landscapeEditService.loadAppliedLandscapeRuleViews(landscapeId).then(function(response) {
			$scope.landscapeRules = landscapeEditService.getAppliedLandscapeRules();
		}, function(errorResponse) {
			$scope.retrieveFailMessage = errorResponse;
			console.log(errorResponse);
		});
	}
		
	// Get a rule as a String to display to the user
	$scope.getRuleAsString = function(landscapeRule) {
		return landscapeEditService.getRuleAsString(landscapeRule);
	}
	
	$scope.handleDialogClose = function() {
		$scope.retrieveFailMessage = null;
		$scope.landscapeRules = null;
	}
	
	$scope.$watch('landscapeChangedFlag', function() {
		if ($scope.landscapeChangedFlag) {
			$scope.landscapeRules = null; //reset
			if (!$scope.landscape) {
				$scope.retrieveFailMessage = "The landscape was not defined correctly so the applied landscape rules can not be displayed.";
			} else {
				var landscapeId = $scope.landscape.resourceId | $scope.landscape.landscapeId;
				$scope.retrieveRules(landscapeId);
			}
		}
	});
}])