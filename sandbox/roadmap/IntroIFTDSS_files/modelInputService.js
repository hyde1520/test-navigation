mainApp.factory('modelInputService', ['$http', '$q','$filter','$rootScope','__env', modelInputService]);

function modelInputService ($http,$q,$filter,$rootScope,__env)
{
	var service = {};
	
	/** @return  a ModelInputBO (for a zero landscape) in the form of JSON. */ 
	service.getModelInputREST = function(zeroLcpId) 
	{
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/model/input/zerolcp/" + zeroLcpId)
	  }).then(function(response){
		  return response;
	  },function(response){
		  console.log("REST call to retrieve model input failed.");
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
	}
	
	/** @return  cached model input if it exists, otherwise get from server and return it. */
	service.getModelInput = function(zeroLcpId)
	{
		var deferred = $q.defer();
		
		// Commented out because this is only going to get called when the selected zero landscape changes
		// and we will always want to get the model input record from the server when that happens.
//		if (_modelInput) {
//			deferred.resolve(_modelInput); // return cached
//		}

		this.getModelInputREST(zeroLcpId).then(function(response) {
			if (response.data) {
				var modelInputBO = new ModelInputBO();
				modelInputBO.fillFromBO(response.data);
				deferred.resolve(modelInputBO);
			} else {
				var errMsg = "Model input retrieved but there is a data problem: " + response;
				console.log(errMsg);
				deferred.reject(errMsg);
			}
			
		},function(response) {
			var errMsg = "Error retrieving model input from server: " + response;
			console.log(errMsg);
			deferred.reject(errMsg);
		});
		
		return deferred.promise;
	}
	
	/** Persist a model input for a zero landscape */
	service.saveModelInput = function(input)
	{
		var deferred = $q.defer();
		
		if (!input) {
	  		  deferred.reject({data:{responseMessage:"parameter 'input' is undefined or null - can not save the model input"}});
		} else { 
			var inputBO = new ModelInputBO();
			inputBO.fillFromInput(input);
			var sendData = JSON.stringify(inputBO);
	
		    $http({
		      method: 'PUT',
		      url: __env.src("/iftdssREST/model/saveInput"),
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
	
	var d = new Date();
	var defaultNewRunInput = {
		resourceDef: {
			owner: $rootScope.current_user_id,
			created: $filter('date')(d.getTime(), 'medium'),
	    	name: "",
	    	runId:"",
	    	containId: null,
		    modelType: "Landscape Fire Behavior",
		    zeroLandscapeId: -1,
		    modelStatus: "init",
		},
		weather:{
			ERC: 80,
			HourlyWeatherArray: [[0,null,null,null,null,null,null]]
		},
		wind:{
			windSpeed:"",
			windDir:"",
		},
		crownFire:{
			crownFireMethod:{"id":2, "name":"Scott/Reinhardt"},
			foliarMoistureContent:100,
		},
		landscape: {
			landscapeId:"",
			resourceName:"",
			complete:false,
		},
		fuelMoisture: {
			fuelMoistureArray:[[0,null,null,null,null,null]],
		}
	};
	
	service.getDefaultNewRunInput = function() {
		return defaultNewRunInput;
	}
	

	return service;
}
