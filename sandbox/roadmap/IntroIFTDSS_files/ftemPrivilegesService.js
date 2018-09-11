mainApp.factory('ftemPrivilegesService', ['$http','$q','$rootScope','__env', ftemPrivilegesService]);

function ftemPrivilegesService ($http, $q, $rootScope,__env)
{
  var service = {};
  
  var _ftemAppResourceId = 2;
  var _ftemAppResourceType = 'ftem';
  var _accessFtemAppAction = 1;
  
  /**
   * Determine whether a user has at least 'viewer' access to the FTEM application.
   * @param userId  the ID of the user
   * @return  true if the user has access, or false if not
   */
  service.hasFtemViewerAccess = function(userId) 
  {
	  var deferred = $q.defer();
	  if (!userId) {
		  deferred.reject("Undefined userId passed into hasFtemViewerAccess");
		  return deferred.promise;
	  }
	  
	  service.isAuthorized(userId, _ftemAppResourceId, _ftemAppResourceType, _accessFtemAppAction).then(
		  function(response) {
			  deferred.resolve(response);
		  }, 
		  function(errResponse) {
			  deferred.reject(errResponse); 
		  }
	  );
	  return deferred.promise;
  }
  
  /**
   * Answer whether a user has access to perform a particular action on an application resource.
   * 
   * @return  true if the user has access 
   */
  service.isAuthorized = function(userId, resourceId, resType, actionId)
  {
	  var deferred = $q.defer();
	  
	  var restURL =  __env.src("/ftemREST/privileges/isAuthorized/" + userId + "/resource/" + resourceId + "/" + resType + "/action/" + actionId);
	  $http({
		  method: 'GET',
		  url: restURL  
	  }).then(function(response) {
		  if (response && response.data && response.data.responseMessage) {
			  if(response.data.responseMessage == "true") {
				  deferred.resolve(true);
			  } else {
				  deferred.resolve(false);
			  }
		  } else {
			  deferred.reject("Error with format and elements in JSON response.");
		  }
	  },function(errorResponse) {
		  var errorMsg = "Request Failed";
		  if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
			  errorMsg = errorResponse.data.responseMessage;
		  }
		  deferred.reject(errorMsg);
	  });
	  
	  return deferred.promise;
  }
  
  return service;
  
}