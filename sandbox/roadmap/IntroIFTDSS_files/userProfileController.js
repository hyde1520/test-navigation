mainApp.controller('userProfileController', ['$scope', '$rootScope', '$location','userResource', userProfileController]);

function userProfileController($scope, $rootScope, $location, userResource){
  $scope.user = {
    userId: '',
	firstName: '',
	lastName: '',
	emailAddress: '',
	securityQuestion: '',
	securityAnswer: ''
  }
			  
  $scope.updateProfile_error = '';
  $scope.successful_update = false;
 
  // Get the user profile from the userResource service
  userResource.getRequest($rootScope.user_record.userId).then(function(response) {
		$scope.user = response.data;
	},function(response) {
		$scope.displayError = true;
		$scope.errorMessage = response;
	});

  $scope.updateProfile = function(user) {
				
    $scope.updateProfile_error = '';
    var error = '';
				
    if (user.firstName == '') {
        error += 'Please enter your first name\n';
  	};
    if (user.lastName == '') {
    	error += 'Please enter your last name\n';
  	};
    if (user.emailAddress == '') {
        error += 'Please enter your email address\n';
  	};
  	if (user.securityQuestion == '') {
        error += 'Please enter your user security question\n';
  	};
  	if (user.securityAnswer == '') {
        error += 'Please enter your answer to the security question\n';
  	};
 	if ( error != '') {
 		$scope.updateProfile_error = 'In order to update your profile,\n' + error;
  		return false;
  	}
  	  
 	userResource.updateProfile($scope.user).then( 
 		function (response){
 	    if (response.data && response.data.success && response.data.success == true) {
 		  $scope.successful_update = true;
 		  $scope.updateProfile_error = '';
 		  return true;
 		} else {
 		  $scope.updateProfile_error=response.data.responseMessage;
 		  return false;
 	    }
 	})
  }

}