mainApp.controller('changePasswordController', ['$scope', '$rootScope', '$location','userResource', changePasswordController]);

function changePasswordController($scope, $rootScope, $location, userResource){
  $scope.user = {
    userId: '',
	oldPassword: '',
	newPassword: '',
	newPassword2: ''
  }
			  
  $scope.changePassword_error = '';
  $scope.successful_update = false;
  $scope.user.userId = $rootScope.user_record.userId;

  $scope.changePassword = function(user) {
    $scope.changePassword_error = '';
    var error = '';
				
    if (user.oldPassword == '') {
        error += 'Please enter your current password\n';
  	};
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
  	  
 	userResource.changePassword($scope.user).then( 
 		function (response){
 	    if (response.data && response.data.success && response.data.success == true) {
 	    	$scope.successful_update = true;
 	    	$scope.changePassword_error = '';
 	    	return true;
		} else {
			if (response.data && response.data.responseMessage) {
				$scope.changePassword_error=response.data.responseMessage;
			} else {
				$scope.changePassword_error='Unexpected response code: ' + response.status + ' - ' + response.statusText; 
			}
			return false;
	    }
 	},function(response) {
		$scope.changePassword_error = response;
	});
  }

}