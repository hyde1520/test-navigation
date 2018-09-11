var theApp = null;
if (typeof mainApp != "undefined") {
	theApp = mainApp;
} else if (typeof ftemApp != "undefined") {
	theApp = ftemApp;
} else {
	console.log("ERROR: neither mainApp nor ftemApp are defined!");
}
theApp.factory('landscapeResource', ['$http','$q','$rootScope','__env', landscapeResource]);

function landscapeResource ($http, $q, $rootScope,__env)
{
  var _allLandscapes = null;
  var _zeroLandscapes = null;
  var _familyLandscapes = null;
  
  var _selectedZeroLandscape = null; // originating landscape
  var _selectedFamilyLandscape = null; // a landscape selected from a family 
  
  var landscapeMasks = null;
  var _fuelModels = null;
  
  
  var service = {};
  
  service.ScopeEnum = ({"ALL":1, "ZEROES":2, "FAMILY":3});
  if (Object.freeze)  Object.freeze(service.ScopeEnum); // Make enum a constant

  service.getLandscapeMasks = function()  { return this.landscapeMasks; }

  service.getZeroLandscapes = function() {
	 if (_zeroLandscapes) return _zeroLandscapes;
	 return [];
  }
  service.getSelectedZeroLandscape = function() {
	  return _selectedZeroLandscape;
  }
  service.setSelectedZeroLandscape = function(landscape) {
	  var zeroChanged = !_selectedZeroLandscape || landscape.landscapeId != _selectedZeroLandscape.landscapeId;
	  _selectedZeroLandscape = landscape;
	  if (zeroChanged) {
		  $rootScope.selectedZeroLandscapeFlag++;
		  // Update list of landscapes in the family of the new zero landscape
		  service.refreshUserLandscapesFromServer($rootScope.user_record.userId, service.ScopeEnum.FAMILY);
	  }
  }
  
  service.getFamilyLandscapes = function() {
	  if (_familyLandscapes)  return _familyLandscapes;
	  return [];
  }
  service.getSelectedFamilyLandscape = function() {
	  return _selectedFamilyLandscape;
  }
  service.setSelectedFamilyLandscape = function(landscape) {
	  _selectedFamilyLandscape = landscape;
  }
  
  service.createLandscape = function(input) {
	var sendData = "";
	var landscapeMetaId = input.landscapeMetaId;
	if (typeof(landscapeMetaId) == 'undefined') {
		landscapeMetaId = "1";
	}
	var fuelModel = input.fuelModel.includes("13") ? 13 : 40;
	sendData += "{'landscapeMetaId':'" + landscapeMetaId +"'";
	sendData += ",'owner':'"+ input.owner + "'";
	sendData += ",'created':'" + input.created + "'"
	// Set buffered extent to the extent drawn but addjust to buffered
	// value on the server
	sendData += ",'southLatitude':'" + input.southLatitude +"'";
	sendData += ",'northLatitude':'" + input.northLatitude +"'";
	sendData += ",'westLongitude':'" + input.westLongitude +"'";
	sendData += ",'eastLongitude':'" + input.eastLongitude +"'";
	sendData += ",'acres':'" + input.areaAcres +"'";
	sendData += ",'landscapeSource':'" + input.landscapeSource +"'";
	sendData += ",'fuelModel':'" + fuelModel +"'";
	sendData += ",'resolution':'" + input.resolution +"'";
	sendData += ",'resourceName':'" + input.resourceName +"'";
	// Unbuffered extent
	sendData += ",'origSouthLatitude':'" + input.southLatitude +"'";
	sendData += ",'origNorthLatitude':'" + input.northLatitude +"'";
	sendData += ",'origWestLongitude':'" + input.westLongitude +"'";
	sendData += ",'origEastLongitude':'" + input.eastLongitude +"'";

	if (input.folder && input.folder.resourceId) {
		sendData += ",'containId':'" + input.folder.resourceId+"'";
	}

    return $http({
      method: 'PUT',
      url: __env.src("/iftdssREST/landscape/create"),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({"data":sendData+"}"})
    }).
    then(function(response) {
    	if (response && response.data && response.data.entityId) {
    		var landscape = createLandscapeObject(input, response.data.entityId);
    		if (_allLandscapes) {
    			_allLandscapes.push(landscape);
        	}
    		else if (_zeroLandscapes) {
    			_zeroLandscapes.push(landscape);
        	}
    		//TODO: should we push it also on to this._zeroLandscapes ?fi
    		$rootScope.createdLandscape = landscape;
    		$rootScope.landscapeCreatedFlag = true;
    	}
        return response;
      }, function(response) {
        return response || {data:{message: "Request failed"}};
    });

  }

  // Create a landscape Javascript object from the input and returned entity ID
  function createLandscapeObject(input, entityId)
  {
	  var landscape = {};
	  landscape.landscapeId = entityId;

	  var metaId = input.landscapeMetaId;
	  if (typeof(metaId) == 'undefined') {
		  mMetaId = "1";
	  }
	  landscape.landscapeMetaId = metaId;
	  landscape.owner = input.owner;
	  landscape.created = input.created;
	  landscape.southLatitude = input.southLatitude;
	  landscape.northLatitude = input.northLatitude;
	  landscape.westLongitude = input.westLongitude;
	  landscape.eastLongitude = input.eastLongitude;
	  landscape.landscapeSource = input.landscapeSource;
	  landscape.resolution = input.resolution;
	  landscape.resourceName = input.resourceName;

	  return landscape;
  }
   service.getIntersectingShapes = function(landscapeId, userId) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/shape/userId/" + userId + "/landscape/" + landscapeId + "/allTypes")
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }
  service.getLandscapeSources = function() {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscape/sources")
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }
  
  
  /** @return cached landscape array for scopeEnum type if it exists, otherwise call refresh and then return array */
  service.getUserLandscapes = function(userId, scopeEnum) 
  {
	  // see http://www.dwmkerr.com/promises-in-angularjs-the-definitive-guide/
	  var deferred = $q.defer();
	  if (!scopeEnum) {
  		  deferred.reject({data:{responseMessage:"scopeEnum is undefined or null - can not return landscape array"}});
	  } else if (scopeEnum == service.ScopeEnum.ZEROES && _zeroLandscapes) {
		  deferred.resolve(_zeroLandscapes);
	  } else  if (scopeEnum == service.ScopeEnum.FAMILY && _familyLandscapes) {
		  deferred.resolve(_familyLandscapes);
	  } else if (scopeEnum == service.ScopeEnum.ALL && _allLandscapes) {
		  deferred.resolve(_allLandscapes);
	  } else {
		  service.refreshUserLandscapesFromServer(userId, scopeEnum)
		    .then(function(response) {
		    	if (scopeEnum == service.ScopeEnum.ZEROES) {
					  deferred.resolve(_zeroLandscapes);
				  } else if (scopeEnum == service.ScopeEnum.FAMILY) {
					  deferred.resolve(_familyLandscapes);  
				  } else if (scopeEnum == service.ScopeEnum.ALL) {
					  deferred.resolve(_allLandscapes);
				  } else {
					  deferred.reject({data:{responseMessage:"Unknown scopeEnum so landscape could not be returned."}});
				  }
		    },function(errorResponse) {
		    	deferred.reject(errorResponse);
			});
	  }
	  return deferred.promise;
  }
  
  
  service.refreshUserLandscapesFromServer = function(userId, scopeEnum) 
  {
	  var deferred = $q.defer();
	  
	  if (typeof scopeEnum == "undefined")  scopeEnum = service.ScopeEnum.ALL;
	  var restURL =  __env.src("/iftdssREST/landscape/user/"+userId);
	  if (scopeEnum && scopeEnum == service.ScopeEnum.ZEROES) restURL += "/zeroLandscapes";
	  if (scopeEnum && scopeEnum == service.ScopeEnum.FAMILY) {
		  if (!(_selectedZeroLandscape)) {
			  var errorResponse = {data: {responseMessage: "A zero landscape must be selected in order to retrieve its descendents."}};
			  deferred.reject(errorResponse);
		  }
		  restURL = __env.src("/iftdssREST/landscape/landscapes/" + _selectedZeroLandscape.landscapeId);
	  }
	  $http({
		  method: 'GET',
		  url: restURL  
	  }).then(function(response) {
		  if (scopeEnum && scopeEnum == service.ScopeEnum.ZEROES) {
			  console.log("retrieved zero landscapes");
			  _zeroLandscapes = response.data;
			  deferred.resolve(_zeroLandscapes);
			  //return _zeroLandscapes;
		  } else if (scopeEnum && scopeEnum == service.ScopeEnum.FAMILY) {
			  console.log("retrieved family landscapes");
			  _familyLandscapes = response.data;
			  deferred.resolve(_familyLandscapes);
			  //return _familyLandscapes;
		  } else {
			  console.log("retrieved all user's landscapes");
			  _allLandscapes = response.data;
			  deferred.resolve(_allLandscapes);
			  //return _allLandscapes;
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
  
  
  service.getRelatedLandscapes = function(landscapeId) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscape/landscapes/"+landscapeId)
	  }).then(function(response) {
		  this.landLandscapes = response.data;
		  return this.landLandscapes;
	  },function(errorResponse) {
		  var errorMsg = "Request Failed";
		  if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
			  errorMsg = errorResponse.data.responseMessage;
		  }
		  //return response || {data:{responseMessage:"Request Failed"}}
	  });
  }

  service.getLandscapeRules = function(landscapeId) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscape/rules/landscape/"+landscapeId)
	  }).then(function(response) {
		  this.landRules = response.data;
		  return this.landRules;
	  },function(errorResponse) {
		  var errorMsg = "Request Failed";
		  if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
			  errorMsg = errorResponse.data.responseMessage;
		  }
		  //return response || {data:{responseMessage:"Request Failed"}}
	  });
  }

  service.copyLandscapeandRelate = function(oldLandscapeId,newLandscapeName) {
	  var sendData = "";
	  sendData += "{'sourceLandscapeId':'" + oldLandscapeId +"',";
	  sendData += "'newLandscapeName':'"+ newLandscapeName+ "'";
	  return $http({
		  method: 'PUT',
		  url: __env.src("/iftdssREST/landscape/copy/"),
	      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	      data: $.param({"data":sendData+"}"})
	  }).then(function(response){
		  this.copyResponse = response.data;
		  return this.copyResponse;
	  },function(errorResponse) {
		  var errorMsg = "Request Failed";
		  if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
			  errorMsg = errorResponse.data.responseMessage;
		  }
	  });
  }

  	//Fuel Models
	service.getFuelModelsREST = function() {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscape/fuelmodels")
	  }).then(function(response){
		  return response;
	  },function(response){
		  console.log("REST call to retrieve fuel models failed.");
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
	}

	service.getFuelModels = function()
	{
		//if (_lfluSimulationTimes)  return _lfluSimulationTimes;

		return service.getFuelModelsREST().then(function(response) {
			if (response.data && response.data.length > 0) {
				_fuelModels = response.data;
			} else {
				console.log("Error: " + response);
			}
			return _fuelModels;
		},function(response) {
			console.log("Error: " + response);
			return $q.reject("Error retrieving fuel models from server.");
		});
	}

  service.setIdAsEC = function(landscapeId) {
	  return $http({
		  method: 'PUT',
		  url: __env.src("/iftdssREST/landscape/update/landscape/"+landscapeId+"/subType/ec__"),
	      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	  }).then(function(response){
		  return response;
	  },function(errorResponse) {
		  var errorMsg = "Request Failed";
		  if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
			  errorMsg = errorResponse.data.responseMessage;
		  }
	  });
  }

  service.setIdAsSubTypeNull = function(landscapeId) {
	  return $http({
		  method: 'PUT',
		  url: __env.src("/iftdssREST/landscape/update/landscape/"+landscapeId+"/subType//"),
	      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	  }).then(function(response){
		  return response;
	  },function(errorResponse) {
		  var errorMsg = "Request Failed";
		  if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
			  errorMsg = errorResponse.data.responseMessage;
		  }
	  });
  }

  return service;
}