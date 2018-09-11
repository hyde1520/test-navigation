mainApp.factory('userListResource', ['$http','__env', userListResource]);

function userListResource ($http,__env) {

	var service = {};
	
	service.getUserList = function(userType, requesterUserId) {
		return $http({method: 'GET',
		    url: __env.src("/iftdssREST/userList/" + userType + "/requester/" + requesterUserId),
		 }).then(function successCallback(response) {
		    return response;
		 }, function errorCallback(response) {
			 return response || {data:{responseMessage: "Request failed"}};
		 });
	}
	
	service.getRoles = function() {
		return $http({method: 'GET',
		    url: __env.src("/iftdssREST/userList/roles"),
		 }).then(function successCallback(response) {
		    return response;
		 }, function errorCallback(response) {
			 return response || {data:{responseMessage: "Request failed"}};
		 });
	}
	
	service.updatePrivileges = function(adminId, userId, role) {
		return $http({method: 'PUT',
			url: __env.src("/iftdssREST/userList/setUserPrivileges"),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: $.param({"data":"{'adminId':'" + convertStringToHexString(adminId) + "', 'userId':'" + convertStringToHexString(userId) + "', 'role':'"+ role + "'}"})
		}).then(function(response) {
			return response;
		}, function(response) {
			return response || {data:{responseMessage: "Request failed"}};
		});
	}
	
	service.rejectRequest = function(adminId, userId) {
		return $http({method: 'PUT',
			url: __env.src("/iftdssREST/userList/rejectRequest"),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: $.param({"data":"{'adminId':'"+ convertStringToHexString(adminId) + "', 'userId':'"+ convertStringToHexString(userId) + "'}"})
		}).then(function(response) {
			return response;
		}, function(response) {
			return response || {data:{responseMessage: "Request failed"}};
		});
	}
	
	service.resetPassword = function(adminId, userId) {
		return $http({method: 'PUT',
			url: __env.src("/iftdssREST/userList/resetPassword"),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: $.param({"data":"{'adminId':'"+ convertStringToHexString(adminId) + "', 'userId':'"+ convertStringToHexString(userId) + "'}"})
		}).then(function(response) {
			return response;
		}, function(response) {
			return response || {data:{responseMessage: "Request failed"}};
		});
	}
	
	service.unlock = function(adminId, userId) {
		return $http({method: 'PUT',
			url: __env.src("/iftdssREST/userList/unlock"),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			data: $.param({"data":"{'adminId':'"+ convertStringToHexString(adminId) + "', 'userId':'"+ convertStringToHexString(userId) + "'}"})
		}).then(function(response) {
			return response;
		}, function(response) {
			return response || {data:{responseMessage: "Request failed"}};
		});
	}
	
	service.getAuditLogURL = function(adminId, userId) {
		return "/iftdssREST/userList/auditLog/adminId/" + adminId + "/userId/" + userId;
	}
	
	// Retrieve user audit log in CSV format
	service.auditLog = function(adminId, userId) {
		window.location.assign(service.getAuditLogURL(adminId, userId));
	}

	return service;
	
	function convertStringToHexString(inputString) {
		if (inputString == null) return null;
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
