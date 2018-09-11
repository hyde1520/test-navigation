var theApp = null;
if (typeof mainApp != "undefined") {
	theApp = mainApp;
} else if (typeof ftemApp != "undefined") {
	theApp = ftemApp;
} else {
	console.log("ERROR: neither mainApp nor ftemApp are defined!");
}
theApp.factory('orgInfoService', ['$http','$q','__env', orgInfoService]);

function orgInfoService ($http, $q, __env) {

	var service = {};
	
	var stateList = [];
	var unitList = [];
	var agency = null;
	var geoArea = null;
	var _agencyRegionsMap = {};
  
 	service.getGeoArea = function() {
		return geoArea;
	}
	service.getAgency = function() {
		return agency;
	}
	service.getUnits = function() {
		return unitList;
	}
	
	service.getUnits = function(iAgency, iGeoArea) {
		return $http({
			method: 'GET',
			url: __env.src("/firenetREST/org/units/agency/" + iAgency + "/geoarea/" + iGeoArea.attribKey),
    }).then(
      function successCallback(response) {
    	 if (response.data) {
    		 agency = iAgency;
    		 geoArea = iGeoArea
    		 unitList = response.data;
    	 }
         return response;
      }, 
      function errorCallback(response) {
         return response || {data:{responseMessage: "Request failed"}};
      }
    );
  }
  
  service.getUnit = function(unitId) 
  {
	  var selectedUnit = null;
	  for (var i=0; i < unitList.length; i++) {
			var unitDO = unitList[i];
			if (unitDO.unitid == unitId) {
				selectedUnit = unitList[i];
				break;
			}
	  }
	  return selectedUnit;
  }
  
  /** Retrieve the federal agencies for their name, id and whether it is a valid agency with potential roles for FTEM */
  service.getAgencyRegionMap = function() 
  {
	  var deferred = $q.defer();
	 
	  // If we already have the agency to rearray then return it - we only need to fetch it once
	  if (_agencyRegionsMap && _agencyRegionsMap.length > 0) {
		  deferred.resolve(_agencyRegionsMap);
		  return deferred.promise;
	  }
	  
	  var restURL =  __env.src("/firenetREST/org/regions");
	  $http({
		  method: 'GET',
		  url: restURL  
	  }).then(function(response) {
		  if (response && response.data) {
			  _agencyRegionsMap = response.data;
			  deferred.resolve(_agencyRegionsMap);
		  } else {
			  deferred.reject("Error with format and elements in JSON response (getAgencyRegionMap).");
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
  
  service.getStates = function() {
		return $http({
			method: 'GET',
			url: __env.src("/firenetREST/org/states"),
  }).then(
    function successCallback(response) {
     if (response && response.data) {
  		 stateList = response.data;
  	 }else{
  		return {data:{responseMessage: "Error with format and elements in JSON response (getStates)."}};
  	 }
       return stateList;
    }, 
    function errorCallback(response) {
       return response || {data:{responseMessage: "Request failed"}};
    }
  );
}

  return service;
}
