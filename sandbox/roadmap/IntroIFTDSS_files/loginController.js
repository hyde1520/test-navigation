mainApp.controller('loginController', ['$scope', '$location', '$rootScope','loginResource', '$routeParams', 'persistanceUserService', loginController]);

function loginController($scope, $location, $rootScope, loginResource, $routeParams, persistanceUserService) {

  $scope.user = {
    id: '',
    password: ''
  }
  
  $scope.login_error = '';
  $scope.ticket_error = '';
  $scope.loginAllowed = true;
  $scope.exemptUsers = [];
  
  // New Account confirmation link contains userid and token
  var userId = $routeParams.userid;
  var token = $routeParams.token;
  
  //Only set the path to /home if it's not a confirmation login link
  if ($rootScope.current_user_id && !userId) {
	  if (window == window.top) { // not in iframe
		  $location.path("/home");
	  }else{
		  $location.path("/logindone")
	  }
  }
  
  loginResource.getApplicationDownFlag().then(
	function(response) {
		var appMaintDO = new AppMaintDO();
		if (!appMaintDO)  return;
		appMaintDO.fillFrom(response);
		$scope.loginAllowed = !appMaintDO.isUnderMaint();
		$scope.exemptUsers = appMaintDO.getExemptUserArray();
	},
	function(errResponse) {
		console.log(errResponse);
	}
  );

  $scope.login = function() {
	
	$scope.login_error = '';
	$scope.ticket_error = '';
	
    if ($scope.user.id == '') {
		$scope.login_error = 'Please enter user\n';
    }

    if ($scope.user.password == '') {
		$scope.login_error = $scope.login_error + 'Please enter password\n';
    }
    
    if ($scope.login_error) {
    	return false;
    }
    
    loginResource.loginRequest($scope.user).then(
    function (response){
      if (response.data && response.data.success && response.data.success == true) {
    	var userId = $scope.user.id;
    	$rootScope.changingPassword = false;
      	$rootScope.current_user_id = $scope.user.id;
      	$rootScope.$broadcast('userLoginSuccessful');  // to start Idle.watch();
        $scope.user = '';
        $scope.login_error = '';
    		
     	if (response.data.responseMessage.substring(0, 3) === "RoB") {
            window.open("/#/acceptRoB/" + userId, '_parent');
            //$location.path("/acceptRoB");
     	}
     	else if (response.data.responseMessage.substring(0, 5) === "Reset") {
     		$rootScope.changingPassword = true;
            window.open("/#/changePasswordReset/" + response.data.responseMessage.substring(6), '_parent');
            $location.path("/changePasswordReset");
     	}
     	else if (response.data.responseMessage.substring(0, 6) === "Change") {
     		$rootScope.changingPassword = true;
            window.open("/#/changePasswordExpired/" + response.data.responseMessage.substring(7), '_parent');
            $location.path("/changePasswordExpired");
     	}
     	else {
     		var role = response.data.responseMessage.substring(0, 4);
        	persistanceUserService.setLoggedInUser($rootScope.current_user_id, role);
            window.open("/#/home", '_parent');
         	if (window == window.top) { // not in iframe
    		  $location.path("/home");
         	} else {
         	  $location.path("/blank");
         	}
  	    }
        return true;
		} else {
			if (response.data && response.data.responseMessage) {
		    	if (response.data.responseMessage.search("ticket") > 0) {
		    		$scope.ticket_error = response.data.responseMessage;
		    	} else {
		    		$scope.login_error = response.data.responseMessage;
		    	}
			} else {
				$scope.login_error='Unexpected response code: ' + response.status + ' - ' + response.statusText; 
			}
			return false;
	    }
    }) 
  }
  
}
