mainApp.controller('resetPasswordController', ['$scope', 'userResource', resetPasswordController]);

function resetPasswordController($scope, userResource){
  $scope.user = {
    userId: '',
	firstName: '',
	lastName: '',
	emailAddress: '',
	securityQuestion: '',
	securityAnswer: ''
  }
			  
  $scope.resetPassword_error = '';
  $scope.successful_reset = false;

  $scope.showSecurityInfo = function() {
	  return ($scope.user.securityQuestion && $scope.user.securityQuestion.length > 0);
  }

  $scope.resetPassword = function(user) {
				
    $scope.resetPassword_error = '';
    var error = '';
				
    if (user.userId == '') {
        error += 'Please enter your User ID\n';
  	};
    if (user.emailAddress == '') {
        error += 'Please enter your email name\n';
  	};
  	if ($scope.user.securityAnswer && $scope.user.securityAnswer.length == 0 && $scope.user.securityQuestion != '') {
        error += 'Please enter your answer to the security question\n';
  	};
 	if ( error != '') {
 		$scope.resetPassword_error = 'In order to reset your password,\n' + error;
  		return false;
  	}
  	  
 	userResource.resetPassword($scope.user).then( 
 		function (response){
	    $scope.successful_reset = false;
 	    if (response.data && response.data.success && response.data.success == true) {
 	 	  $scope.resetPassword_error = '';
 	      if ($scope.user.securityQuestion == '')
 	      {
 	    	 $scope.user.securityQuestion = response.data.responseMessage;
 	      }
 	      else
 	      {
 		    $scope.successful_reset = true;
 	      }
 		  return true;
		} else {
			if (response.data && response.data.responseMessage) {
	    		$scope.resetPassword_error = response.data.responseMessage;
			} else {
				$scope.resetPassword_error='Unexpected response code: ' + response.status + ' - ' + response.statusText; 
			}
			return false;
	    }
 	})
  }

  $scope.login = function(user) {
	  $location.path("/#/landing_page");
  }

}