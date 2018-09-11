mainApp.factory('loginResource', ['$http','__env', loginResource]);

function loginResource ($http,__env) {

	var service = {};

	service.loginRequest = function(user) {
		return $http({
			method: 'POST',
			url: __env.src("/iftdssREST/login"),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: $.param({"data":"{'userId':" + convertStringToHexString(user.id) + ", 'password':" + convertStringToHexString(user.password) + "}"})
		}).
		then(function(response) {
			return response;
		}, function(response) {
			return response || {data:{message: "Request failed"}};
		});
	}
	
	/** @return an AppMaintDO object */
	service.getApplicationDownFlag = function() {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/login/appMaint")
	    }).
	    then(function(response) {
	    	var appMaintDO = new AppMaintDO();
			if (!appMaintDO)  return;
			if (response && response.data)
			appMaintDO.fillFrom(response.data);
	        return appMaintDO;
	    }, function(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });
	}


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
	
	return service;
	
}
