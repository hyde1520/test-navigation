mainApp.controller('signupController', ['$scope', '$location','userResource', signupController]);

function signupController($scope,$location,userResource){
  $scope.user = {
    id: '',
	firstname: '',
	lastname: '',
	email: '',
	securityquestion: '',
	securityanswer: '',
	justification: ''
  }
			  
  $scope.signup_error = '';
  $scope.successful_registration = false;

  $scope.signup = function(user) {
				
    $scope.signup_error = '';
				
    if (user.id == '') {
	  $scope.signup_error += 'Please enter a user name\n';
	};
    if (user.firstname == '') {
        $scope.signup_error +='Please enter your first name\n';
  	};
    if (user.lastname == '') {
        $scope.signup_error +='Please enter your last name\n';
  	};
    if (user.email == '') {
        $scope.signup_error +='Please enter your email name\n';
  	};
  	if (user.securityquestion == '') {
        $scope.signup_error='Please enter your user security question\n';
  	};
  	if (user.securityanswer == '') {
        $scope.signup_error='Please enter your answer to the security question\n';
  	};
  	if (user.justification == '') {
        $scope.signup_error='Please enter justification for your request\n';
  	} else {
  		user.justification = user.justification.substring(0, 255);
  	};
 	if ( $scope.signup_error != '') {
  		return false;
  	}
  	
	$scope.signup_error != null;
			
  	userResource.signupRequest($scope.user)
	  .then( function (response){
	    if (response.data && response.data.success && response.data.success == true) {
		  $scope.successful_registration = true;
		  $scope.user = {};
		  $scope.signup_error = '';
		  return true;
		} else {
			if (response.data && response.data.responseMessage) {
				$scope.signup_error=response.data.responseMessage;
			} else {
				$scope.signup_error='Unexpected response code: ' + response.status + ' - ' + response.statusText; 
			}
			return false;
	    }
    })

  }
}