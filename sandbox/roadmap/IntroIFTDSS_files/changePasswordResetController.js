mainApp.controller('changePasswordResetController', ['$scope', '$rootScope', '$timeout', '$location', '$routeParams', 'userResource', 'persistanceUserService', changePasswordResetController]);

function changePasswordResetController($scope, $rootScope, $timeout, $location, $routeParams, userResource, persistanceUserService) {
  $scope.user = {
    userId: '',
	resetCode: '',
	newPassword: '',
	newPassword2: ''
  }
			  
  $scope.changePassword_error = '';
  $scope.successful_reset = false;
  $scope.user.userId = $routeParams.userId;
 
  function logoutUser() {
	  $rootScope.$broadcast('logoutCurrentUser');
  }
  
  $scope.changePassword = function(user) {
    $scope.changePassword_error = '';
    var error = '';
				
    if (user.resetCode == '') {
        error += 'Please enter your reset code\n';
  	};
    if (user.newPassword == '') {
    	error += 'Please enter your new password\n';
  	};
    if (user.newPassword2 == '') {
        error += 'Please re-enter your new password\n';
  	};
	if (error == '') {
		if (user.newPassword != user.newPassword2) {
			$scope.changePassword_error = 'Please re-enter your password - the two entries must be identical\n';
			return false;
		}
	}
	else if (error != '') {
 		$scope.changePassword_error = 'In order to change your password,\n' + error;
  		return false;
  	}
  	  
 	userResource.changePasswordReset($scope.user).then( 
 		function (response){
 	    if (response.data && response.data.success && response.data.success == true) {
 		  $scope.successful_reset = true;
 		  $scope.changePassword_error = '';
		  persistanceUserService.setLoggedInUser($scope.user.userId, response.data.responseMessage);
		  $rootScope.current_user_id = $scope.user.userId;
		  $rootScope.current_user_role = response.data.responseMessage;
		  $timeout(logoutUser, 5000);
		  $rootScope.changingPassword = false;
 		  return true;
 		} else {
 		  $scope.changePassword_error = response.data.responseMessage;
 		  return false;
 	    }
 	},function(response) {
		$scope.changePassword_error = response;
	});
  }

}