var theApp = null;
if (typeof mainApp != "undefined") {
	theApp = mainApp;
} else if (typeof ftemApp != "undefined") {
	theApp = ftemApp;
} else {
	console.log("ERROR: neither mainApp nor ftemApp are defined!");
}
theApp.factory('userAccessService', ['$http','__env', userAccessService]);

function userAccessService ($http,__env) {

  var service = {};
  
  /** @return true if user has a temporary access code for the application, or false if not */
  service.userHasAccessCode = function(userId, appId) {
		return $http({
			method: 'GET',
			url: __env.src("/firenetREST/firenetuser/hasAccessCode/user/" + userId + "/app/" + appId),
		}).then(
		    function(response) {
		    	if (response && response.data && response.data.queued && response.data.queued == true) {
		    		return true;
		    	} else {
		    		return false;
		    	}
		    }, 
		    function(errResponse) {
		    	if (errResponse && errResponse.data && errResponse.data.responseMessage) {
		    		console.log("Error determining if user has a temporary access code: " + errResponse.data.responseMessage);
		    	} else {
		    		console.log("Could not determine if the user has a temp access code.");
		    	}
		    	return false;
		    }
		);
  }
  
  /** @return true if user has a pending access request for the application, or false if not */
  service.userHasPendingRequest = function(userId, appId) {
		return $http({
			method: 'GET',
			url: __env.src("/firenetREST/firenetuser/hasPendingRequest/user/" + userId + "/app/" + appId),
		}).then(
		    function(response) {
		    	if (response && response.data && response.data.queued && response.data.queued == true) {
		    		return true;
		    	} else {
		    		return false;
		    	}
		    }, 
		    function(errResponse) {
		    	if (errResponse && errResponse.data && errResponse.data.responseMessage) {
		    		console.log("Error determining if user has a pending access request: " + errResponse.data.responseMessage);
		    	} else {
		    		console.log("Could not determine if the user has a pending access request");
		    	}
		    	return false;
		    }
		);
  }
  
//  service.refreshLoginSession = function(userId) {
//	  return $http({
//			method: 'GET',
//			url: __env.src("/iftdssREST/user/refreshLoginSession/user/" + userId),
//		}).then(
//		    function(response) {
//		    	return response;
//		    }, 
//		    function(errResponse) {
//		    	if (errResponse && errResponse.data && errResponse.data.responseMessage) {
//		    		console.log("Error refreshing login session for FTEM: " + errResponse.data.responseMessage);
//		    	} else {
//		    		console.log("Error refreshing login session for FTEM");
//		    	}
//		    	return false;
//		    }
//		);
//  }
  
  return service;
}
  