var theApp = null;
if (typeof mainApp != "undefined") {
	theApp = mainApp;
} else if (typeof ftemApp != "undefined") {
	theApp = ftemApp;
} else {
	console.log("ERROR: neither mainApp nor ftemApp are defined!");
}

theApp.directive('sessionTimeoutDialogDirective',function(){
	return {
		templateUrl: "pages_shared/common/sessionTimeoutDialog_partial.html",
		controller: "sessionTimeoutDialogDirectiveController"
	}
}).controller('sessionTimeoutDialogDirectiveController',["$scope","$window","$rootScope","$routeParams","$timeout","$interval","$location","propertiesService","userSessionService",
     function($scope,$window,$rootScope,$routeParams,$timeout,$interval,$location,propertiesService,userSessionService)
{
	$scope.successMessage = null;
	$scope.errorMessage = null;
	$scope.secondsRemaining = 0;
	$scope.keepAliveIntervalSeconds = 10;
	$scope.keepAliveIteration = 0;
	$scope.mouseClickCount = 0;
	
	// Use session timeout defined for IFTDSS (app ID = 1) for other apps too like FTEM
	if ($rootScope.current_user_id) {
		propertiesService.getSessionTimeoutProperties("iftdss").then(
			function(response) {
				$rootScope.$broadcast('updateSessionTimeoutProps', response); // sending timeoutProperties.idleTimeout & warnTimeout
			}, 
			function(errResponse) {
				console.log(errResponse);
			}
		);
	}
	
	$scope.closeDialog = function() {
		$scope.successMessage = null;
		$scope.errorMessage = null;
		$("#sessionTimeoutDialog").modal('hide');
	}
	
	$scope.renewSession = function() 
	{
		userSessionService.refreshLoginSession($rootScope.user_record.userId).then(
			function(response) { 
				$scope.keepAliveIteration = 0;
				//console.log("Server login session refreshed.");
				$scope.successMessage = "Login session refreshed.";
				$scope.mouseClickCount = 0;  //reset
				$timeout($scope.closeDialog, 2000);
			},
			function(errResponse) { 
				$scope.errorMessage = "Error refreshing your login session.";
				console.log("ERROR refreshing server login session."); 
			}
		);
		
	}
	
	$scope.logoutButtonClicked = function() 
	{
		$rootScope.$broadcast('logoutCurrentUser');
		// $("#sessionTimeoutDialog").modal('hide');
	}
	
	$rootScope.$on('user-mouse-clicked', function(event, data) {
		$scope.mouseClickCount++;
		//console.log("... user-mouse-clicked event caught (" + $scope.mouseClickCount + ")");
	});
	
	// Check once a minute if user clicked the mouse and renew the login session 
	$interval(function() {
			if ($scope.mouseClickCount && $scope.mouseClickCount > 0 && $rootScope.user_record) {
				$scope.renewSession();	
				console.log("... login session renewed based on mouse click.");
			}
		}, 60000);
	
	// Listen for events emitted from the 'ngIdle' component
	$rootScope.$on('IdleWarn', function(e, countdown) {
		console.log("Session seconds remaining = " + countdown);
		$scope.secondsRemaining = countdown;
		$scope.$apply();
	});
//	$rootScope.$on('IdleEnd', function() {
//		// User did something with the mouse or keyboard while the session timeout warn dialog was up
//		$scope.keepAliveIteration = 0;
//		console.log("keepAliveIteration reset to " + $scope.keepAliveIteration);
//		$("#sessionTimeoutDialog").modal('hide');
//		userAccessService.refreshLoginSession($rootScope.user_record.userId).then(
//			function(response) { console.log("Server login session refreshed.") },
//			function(errResponse) { console.log("ERROR refreshing server login session.") }
//		);
//	});
	$rootScope.$on('Keepalive', function() {
		$scope.keepAliveIteration++;
		var idleSeconds = $scope.keepAliveIteration * $scope.keepAliveIntervalSeconds;
		$rootScope.$broadcast('userIdleSeconds', idleSeconds);
		//console.log("User has been idle for " + idleSeconds + " seconds.");
	});
	
	$rootScope.$on('userActivityToServer', function() {
		$scope.keepAliveIteration = 0;
		//console.log("userActivityToServer, keepAliveIteration reset to " + $scope.keepAliveIteration);
	});
	$rootScope.$on('renewSession', function() {
		$scope.renewSession();
	});
                                                   	
}]);
