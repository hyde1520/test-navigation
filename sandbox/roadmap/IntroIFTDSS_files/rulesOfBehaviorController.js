mainApp.controller('rulesOfBehaviorController', ['$rootScope','$scope', '$location', '$routeParams', 'userResource', 'persistanceUserService', rulesOfBehaviorController]);

function rulesOfBehaviorController($rootScope, $scope, $location, $routeParams, userResource, persistanceUserService){
  $scope.user = {
    userId: ''
  }
			  
  $scope.rob_error = '';
  $scope.user.userId = $routeParams.userId;

	$scope.acceptRoB = function() {
		$scope.rob_error = '';
		var userId = $routeParams.userId;
		userResource.acceptRoB(userId).then(
			function (response) {
				if (response.data && response.data.success && response.data.success == true) {
					$scope.rob_error = '';
					if (response.data.responseMessage.substring(0, 5) === "Init ") {
						window.open("/#/changePasswordReset/" + response.data.responseMessage.substring(5), '_parent');
						$location.path("/changePasswordReset");
					} else {
						persistanceUserService.setLoggedInUser(userId);
						$rootScope.current_user_id = userId;
						window.open("/#/home", '_parent');

						if (window == window.top) { // not in iframe
							$location.path("/home");
						} else {
							$location.path("/blank");
						}
					}
					return true;
				}
				
				$scope.rob_error = response.data.responseMessage;
				return false;
			}, function(response) {
				$scope.rob_error = response;
			})
	}
}