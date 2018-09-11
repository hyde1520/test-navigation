var theApp = null;
if (typeof mainApp != "undefined") {
	theApp = mainApp;
} else if (typeof ftemApp != "undefined") {
	theApp = ftemApp;
} else {
	console.log("ERROR: neither mainApp nor ftemApp are defined!");
}

theApp.factory('propertiesService', ['$http','$q','__env', propertiesService]);

function propertiesService ($http, $q, __env) {

  var service = {};

  service.getProperties = function(category, appName) {
	    return $http({
	      method: 'GET',
	      url: __env.src("/firenetREST/props/" + appName + "/category/"+category),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }
  

  service.getProperties = function(category, appName, userId) {
	    return $http({
	      method: 'GET',
	      url: __env.src("/firenetREST/props/" + appName + "/category/"+category + "/user/" + userId),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }
  service.getProperty = function(propertyKey, appName) {
	    return $http({
	      method: 'GET',
	      url: __env.src("/firenetREST/props/" + appName + "/property/"+propertyKey),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }
  
  service.getProperty = function(propertyKey, appName, userId) {
	    return $http({
	      method: 'GET',
	      url: __env.src("/firenetREST/props/" + appName + "/property/"+propertyKey + "/user/" + userId),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }
  
  service.getPropertyFromFile = function(propertyKey, defaultValue, appName) {
	    return $http({
	      method: 'GET',
	      url: __env.src("/firenetREST/props/" + appName + "/propertyFromFile/"+propertyKey+"/default/"+defaultValue),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }
  
  service.getSessionTimeoutProperties = function(appName) 
  {
	  var deferred = $q.defer();
	  
	  var timeoutProperties = {"idleTimeout":3600, "warnTimeout":120};
	  var sessionTimeoutSeconds = 3600;
	  this.getProperties("session", appName).then(
		function(response) {
			if (response && response.data && response.data.length > 0) {
				for (var i=0; i<response.data.length; i++) {
					var propertyDO = response.data[i];
					if (propertyDO && propertyDO.id && propertyDO.id.key && propertyDO.value) {
						if (propertyDO.id.key == "sessionTimeoutSeconds") {
							sessionTimeoutSeconds = Number(propertyDO.value);
						} else if (propertyDO.id.key == "sessionTimeoutWarnSeconds") {
							timeoutProperties.warnTimeout = Number(propertyDO.value);
						}
					}
				} //endfor
				
				// idleTimeout is time until warn dialog is displayed and warnTimeout is dialog time before logout
				  timeoutProperties.idleTimeout = sessionTimeoutSeconds - timeoutProperties.warnTimeout;
				  deferred.resolve(timeoutProperties);
			} //endif
		}, 
		function(errResponse) {
			deferred.reject("ERROR retrieving 'session' properties: " + errResponse);
		}
	  );
	  
	  return deferred.promise;
  }

  return service;
}
