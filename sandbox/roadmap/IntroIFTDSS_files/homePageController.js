mainApp.controller("homePageController", ['$rootScope','$scope','$location','breadcrumbResource',homePageController]);

function homePageController($rootScope, $scope, $location, breadcrumbResource)
{
	if ($rootScope.current_user_id != null) {
		$rootScope.$broadcast('userLoginSuccessful');  // to start Idle.watch();
	}
	
	$scope.init = function() {
		//console.log("$scope.init for homePageController called.");
	}
	
	$scope.clickPlayground = function() {
		$location.path("/playground");
	}
	$scope.clickCycle = function() {
		$location.path("/cycle/landscape_eval");
	}
	$scope.clickWorkspace = function() {
		breadcrumbResource.navigateToWorkspaceView();
	}
}