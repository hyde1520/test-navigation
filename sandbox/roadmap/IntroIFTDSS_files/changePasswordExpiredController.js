mainApp.controller('changePasswordExpiredController', ['$scope', '$location', '$rootScope', '$timeout', '$routeParams', 'persistanceUserService', 'userResource', changePasswordExpiredController]);

function changePasswordExpiredController($scope, $location, $rootScope, $timeout, $routeParams, persistanceUserService, userResource){
  $scope.user = {
    userId: '',
	newPassword: '',
	newPassword2: ''
  }
			  
  $scope.changePassword_error = '';
  $scope.successful_change = false;
  $scope.user.userId = $routeParams.userId;

  function logoutUser() {
	  $rootScope.$broadcast('logoutCurrentUser');
  }
  
  $scope.changePassword = function(user) {
    $scope.changePassword_error = '';
    var error = '';
				
    if (user.newPassword == '') {
    	error += 'Please enter your new password\n';
  	};
    if (user.newPassword2 == '') {
        error += 'Please re-enter your new password\n';
  	};
	if (error == '') {
		if (user.newPassword != user.newPassword2) {
			$scope.changePassword_error = 'Please re-enter your new password - the two entries must be identical\n';
			return false;
		}
	}
	else if (error != '') {
 		$scope.changePassword_error = 'In order to change your password,\n' + error;
  		return false;
  	}
  	  
 	userResource.changePasswordExpired($scope.user).then( 
		function (response){
		if (response.data && response.data.success && response.data.success == true) {
			$scope.successful_change = true;
			$scope.changePassword_error = '';
			$rootScope.current_user_id = $scope.user.userId;
			$scope.user = '';
 	        var role = response.data.responseMessage.substring(0, 4);
 	        persistanceUserService.setLoggedInUser($rootScope.current_user_id, role);
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