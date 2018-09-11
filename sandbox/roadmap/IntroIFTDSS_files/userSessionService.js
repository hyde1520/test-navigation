mainApp.factory('userSessionService', ['$http','__env', userSessionService]);

function userSessionService ($http,__env) {

  var service = {};
  
  service.refreshLoginSession = function(userId) {
	  return $http({
			method: 'GET',
			url: __env.src("/iftdssREST/user/refreshLoginSession/user/" + userId),
		}).then(
		    function(response) {
		    	return response;
		    }, 
		    function(errResponse) {
		    	if (errResponse && errResponse.data && errResponse.data.responseMessage) {
		    		console.log("Error refreshing login session for IFTDSS: " + errResponse.data.responseMessage);
		    	} else {
		    		console.log("Error refreshing login session for IFTDSS");
		    	}
		    	return false;
		    }
		);
  }
  
  return service;
}
  