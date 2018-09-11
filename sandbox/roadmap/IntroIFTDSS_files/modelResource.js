mainApp.factory('modelResource', ['$http', '$rootScope', '$q', '__env', modelResource]);

function modelResource ($http, $rootScope, $q, __env) {

	var service = {};

	$rootScope.modelTypeHash = Array();  // hash of model type enum to model type common name
	$rootScope.modelStatusHash = Array();  // hash of model status enum to model status short name

	// Set up a hash of model types as an associative array
	function setModelTypes(response) {
		if (response && Object.keys($rootScope.modelTypeHash).length == 0) {
			var model_types = response.data;
			for (i=0; i < model_types.length; i++) {
				$rootScope.modelTypeHash[model_types[i].modelType] = model_types[i].commonName;
			}
		}
	}

	// Set up a hash of model statuses as an associative array
	function setModelStatuses(response) {
		if (response &&Object.keys($rootScope.modelStatusHash).length == 0) {
			var model_statuses = response.data;
			for (i=0; i < model_statuses.length; i++) {
				$rootScope.modelStatusHash[model_statuses[i].runStatus] = model_statuses[i].shortName;
			}
		}
	}

	service.getModels = function() {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/model/types")
	    }).
	    then(function(response) {
	    	console.log("Retrieved model types");
	    	setModelTypes(response);
	        return response;
	      }, function(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });
	}

	service.getModelStatuses = function() {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/model/statuses")
	    }).
	    then(function(response) {
	    	console.log("Retrieved model statuses");
	    	setModelStatuses(response);
	        return response;
	      }, function(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });
	}

	service.deleteModel = function(runId) {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/model/delete/run/"+runId)
	    }).
	    then(function(response) {
	        return response;
	      }, function(response) {
	        return response || {data:{responseMessage: "Failed to delete run"}};
	    });
	}
	
	/** Submit a request to run a fire behavior model using a persisted model input. */
	service.submitModelRunRequest = function(modelRunRequestBO) {
		var deferred = $q.defer();
		
		if (!modelRunRequestBO) {
	  		  deferred.reject({data:{responseMessage:"parameter 'modelRunRequestBO' is undefined or null - can not submit the model run request"}});
		} else { 
		 
			//var inputBO = new ModelInputBO();
			//inputBO.fillFromInput(input);
			var sendData = JSON.stringify(modelRunRequestBO);
	
		    $http({
		      method: 'PUT',
		      url: __env.src("/iftdssREST/basic/submit/runRequest"),
		      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		      data: $.param({"data":sendData+"}"})
		    }).
		    then(function(response) {
		        deferred.resolve(response);
		      }, function(response) {
		    	var errorResponse = response || {data:{message: "Request failed"}};
		    	deferred.reject(errorResponse);
		    });
		}
	    return deferred.promise;
	}
	
	service.getModelRunsForInputId = function(modelInputId, modelType, runContext) {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/model/runs/inputId/" + modelInputId + "/modelType/" + modelType + "/runContext/" + runContext)
	    }).
	    then(function(response) {
	    	// console.log("Retrieved model runs");
	        return response;
	      }, function(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });
	}

	return service;
}