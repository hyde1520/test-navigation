mainApp.factory('userResource', ['$http','__env', userResource]);

function userResource ($http,__env) {

	var service = {};
	
	service.signupRequest = function(user) {
		return $http({
			method: 'PUT',
			url: __env.src("/iftdssREST/user"),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: $.param({"data":"{'userId':'"+ convertStringToHexString((user.id).replace(" ", "")) +
				"', 'firstName':'"+ convertStringToHexString(user.firstname) + "', 'lastName':'"+ convertStringToHexString(user.lastname) + "', 'email':'"+ user.email +
				"', 'securityQuestion':'" + convertStringToHexString(user.securityquestion) +
				"', 'securityAnswer':'" + convertStringToHexString(user.securityanswer) +
				"', 'justification':'" + convertStringToHexString(user.justification) + "'}"})
		}).then(function(response) {
			return response;
		}, function(response) {
			return response;
		});
	}
	
	service.updateSession = function(user) {
		return $http({
			method: 'PUT',
			url: __env.src("/firenetREST/firenetuser/sessionTimestamp"),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: $.param({"data":"{'userId':'"+ convertStringToHexString(user) + "'}"})
		}).then(function(response) {
			return response;
		}, function(response) {
			return response;
		});
	}

	service.acceptRoB = function(user) {
	    return $http({
	      method: 'PUT',
	      url: __env.src("/firenetREST/firenetuser/acceptRoB"),
	      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	      data: $.param({"data":"{'userId':'" + convertStringToHexString(user) + "'}"})
	    }).
	    then(function(response) {
	        return response;
	      }, function(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }

	service.logout = function(user) {
		return $http({
			method: 'PUT', url: __env.src("/firenetREST/firenetuser/logout"),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: $.param({"data":"{'userId':'" + convertStringToHexString(user) + "'}"})
		}).then(function(response) {
			return response;
		}, function(response) {
			return response || {data:{responseMessage: "Request failed"}};
		});
	}

  service.updateProfile = function(user) {
    return $http({
      method: 'PUT',
      url: __env.src("/firenetREST/firenetuser/userProfile"),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({"data":"{'userId':'" + convertStringToHexString(user.userId) + "'" +
          ", 'firstName':'" + convertStringToHexString(user.firstName) + "'" +
          ", 'lastName':'" + convertStringToHexString(user.lastName) + "'" +
          ", 'email':'" + user.emailAddress + "'" +
          ", 'securityQuestion':'" + convertStringToHexString(user.securityQuestion) + "'" +
          ", 'securityAnswer':'" + convertStringToHexString(user.securityAnswer) + "'}"})
    }).
    then(function(response) {
        return response;
      }, function(response) {
        return response || {data:{responseMessage: "Request failed"}};
    });

  }

  service.getRequest = function(userId) {
	    return $http({
	      method: 'GET',
	      url: __env.src("/firenetREST/firenetuser/" + convertStringToHexString(userId)),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }
	
	service.changePassword = function(user) {
	  return $http({
		method: 'PUT',
		url: __env.src("/firenetREST/firenetuser/changePassword"),
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: $.param({"data":"{'userId':'"+ convertStringToHexString(user.userId) + "'" +
                    ", 'oldPassword':'" + convertStringToHexString(user.oldPassword) + "'" +
                    ", 'newPassword':'" + convertStringToHexString(user.newPassword) + "'}"})
	  	}).
	  	then(function(response) {
	  		return response;
	  	}, function(response) {
	  		return response || {data:{responseMessage: "Request failed"}};
	  	});
	}
	
	service.changePasswordExpired = function(user) {
	  return $http({
		method: 'PUT',
		url: __env.src("/firenetREST/firenetuser/changePassword"),
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: $.param({"data":"{'userId':'"+ convertStringToHexString(user.userId) + "'" +
                    ", 'newPassword':'" + convertStringToHexString(user.newPassword) + "'}"})
	  	}).
	  	then(function(response) {
	  		return response;
	  	}, function(response) {
	  		return response || {data:{responseMessage: "Request failed"}};
	  	});
	}
	
	service.changePasswordReset = function(user) {
	  return $http({
		method: 'PUT',
		url: __env.src("/iftdssREST/user/changePassword"),
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: $.param({"data":"{'userId':'"+ convertStringToHexString(user.userId) + "'" +
                    ", 'resetCode':'" + user.resetCode + "'" +
                    ", 'newPassword':'" + convertStringToHexString(user.newPassword) + "'}"})
	  	}).
	  	then(function(response) {
	  		return response;
	  	}, function(response) {
	  		return response || {data:{responseMessage: "Request failed"}};
	  	});
	}
	
	service.resetPassword = function(user) {
	  return $http({
		method: 'PUT',
		url: __env.src("/iftdssREST/user/resetPassword"),
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		data: $.param({"data":"{'userId':'"+ convertStringToHexString(user.userId) + "'" +
          ", 'email':'"+ user.emailAddress + "'" +
          ", 'securityAnswer':'" + convertStringToHexString(user.securityAnswer) + "'}"})
	  	}).
	  	then(function(response) {
	  		return response;
	  	}, function(response) {
	  		return response || {data:{responseMessage: "Request failed"}};
	  	});
	}

	return service;
	
	function convertStringToHexString(inputString) {
  		var pos = 0;
  		var hexString = '';
  		var currentChar = '';
  		var len = inputString.length;
  		for (pos = 0; pos < len; pos++) {
  			currentChar = inputString.charCodeAt(pos).toString(16);
  			hexString += currentChar;
  		}
		return hexString;
	}
}
