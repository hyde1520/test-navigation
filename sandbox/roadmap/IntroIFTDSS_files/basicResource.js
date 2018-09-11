mainApp.factory('basicResource', ['$http','__env', basicResource]);

function basicResource ($http,__env) {

  function saveRunRequest (input) {
	//  var sendData = "{'modified':'"+input.current_time+"'";
	    var sendData = "";
	var saveUrl = "/iftdssREST/model";
	if (input.resourceDef && input.resourceDef.runId) {
		saveUrl = "/iftdssREST/basic"
		    sendData += "{'runId':'"+input.resourceDef.runId + "'";
			// sendData += ",'runId':'"+input.runId + "'";
		if (input.resourceDef && input.resourceDef.containId) {
			sendData += ",'containId':'" + input.resourceDef.containId + "'"
		}
		if (input.weather && input.weather.ERC != null) {
			sendData += ", 'ERC':'" + input.weather.ERC + "'";
		}
		//if (input.weather && input.weather.hourlyWeatherList) {
		//	sendData += ",'RAWsArray':'" + input.weather.hourlyWeatherList + "'";
		//}
		if ((typeof(input.wind) != 'undefined') && input.wind.windSpeed != null) {
			sendData += ",'windSpeed':'" + input.wind.windSpeed + "'";
		}
		if ((typeof(input.wind) != 'undefined') && input.wind.windDir != null) {
			sendData +=", 'windDirection':'" + input.wind.windDir + "'";
		}
		if (input.resourceDef && input.resourceDef.name != null) {
			sendData +=", 'resourceName':'" + input.resourceDef.name + "'";
		}
		if ((input.landscape != null) && (input.landscape.landscapeId != null) && (input.landscape.landscapeId !="")) {
			sendData +=", 'landscapeResourceId':'" + input.landscape.landscapeId + "'";
		}
		if (input.crownFire && input.crownFire.crownFireMethod != null) {
			sendData += ", 'crownFireMethodName':'" + input.crownFire.crownFireMethod.name+ "'";
		}
		if (input.crownFire && input.crownFire.foliarMoistureContent != null) {
			sendData += ", 'foliarMoisture':'" +  input.crownFire.foliarMoistureContent +"'";
		}
		if ((input.fuelMoisture) && (input.fuelMoisture.fuelMoistureArray != null) && (input.fuelMoisture.fuelMoistureArray.length > 0)
				&& (input.fuelMoisture.fuelMoistureArray[0][1] != null)) {
		 	sendData += ", 'fuelMoistures': [{";
		 	var count = input.fuelMoisture.fuelMoistureArray.length;
			for (i=0; i < count; i++) {
				if ((input.fuelMoisture.fuelMoistureArray[i][1] == null)  ||
						(typeof(input.fuelMoisture.fuelMoistureArray[i][1]) == 'undefined')){
					continue;
				}
				sendData += "'runId':'"+ input.resourceDef.runId +"',";
				sendData += "'model':'"+input.fuelMoisture.fuelMoistureArray[i][0]+"',";
				sendData += "'fm1Hr':'"+input.fuelMoisture.fuelMoistureArray[i][1]+"',";
				sendData += "'fm10Hr':'"+input.fuelMoisture.fuelMoistureArray[i][2]+"',";
				sendData += "'fm100Hr':'"+input.fuelMoisture.fuelMoistureArray[i][3]+"',";
				sendData += "'fmLiveHerbaceous':'"+input.fuelMoisture.fuelMoistureArray[i][4]+"',";
				sendData += "'fmLiveWoody':'"+input.fuelMoisture.fuelMoistureArray[i][5]+"'";

				if (i < (count -1)) {
				    sendData += "},{";
				}
			}
			sendData +="}]"
		}
	} else {
		// sendData += ",'resourceType':'run_'";
		sendData += "{'resourceType':'run_'";
		if (input.resourceDef && input.resourceDef.containId) {
			sendData += ",'containId':'" + input.resourceDef.containId + "'"
		}

		sendData += ",'owner':'"+ input.resourceDef.owner + "'"
		if (input.resourceDef && input.resourceDef.created && input.resourceDef.created != 'undefined') {
			sendData += ",'created':'"+input.resourceDef.created+"'";
		}
		sendData += ",'modelRunStatus':'init'";
		sendData += ",'resourceName':'" + input.resourceDef.name +"'";
		sendData += ",'modelType':'" + input.resourceDef.modelType +"'";
	}

    return $http({
      method: 'PUT',
      url: __env.src(saveUrl),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({"data":sendData+"}"})
    }).
    then(function(response) {
    	//rerun to save inputs and get runId
    	if (!input.resourceDef.runId && response.data && response.data.entityId) {
    		input.resourceDef.runId = response.data.entityId;
    		saveRunRequest(input);
    		input.resourceDef.runId = "";
    	}
    	return response;
      }, function(response) {
       return response||{status:500, data:{responseMessage: "Request failed", success: false}};
    });

  }

  function getRun(runId) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/basic/run/"+runId)
	  }).then(function(response){
		  return response;
	  }, function(response) {
	  	  return response || {data:{message:"Request failed"}}
	  })

  }


  function submitBasicRun(runId) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/basic/submit/run/"+runId)
	  }).then(function(response){
		  return response;
	  }, function(response) {
	  	  return response || {data:{message:"Failed to submit the Landscape Fire Behavior Run"}};
	  })

  }

	function setExistingRunInput(runId, userId, createDate) {
		defaultNewRunInput = {
				resourceDef: {
					owner: userId,
					showonly: false,
					created: createDate,
					name: "",
					runId:"",
					modelType: "Landscape Fire Behavior",
					modelStatus: "init",
				},
				weather:{
					showonly: false,
					ERC: 80,
					HourlyWeatherArray: [[0,null,null,null,null,null,null]]
				},
				wind: {
					showonly: false,
					windSpeed:null,
					windDir:null,
				},
				crownFire: {
					showonly: false,
					method:"Scott/Reinhardt",
					foliarMoistureContent:100
				},
				landscape:{
					showonly: false,
					landscapeId:"",
					resourceName:"",
					complete:false
				},
				fuelMoisture: {
					showonly: false,
					fuelMoistureArray:[[0,null,null,null,null,null]],
				}
			  };
		newInput = defaultNewRunInput;
		newInput.resourceDef.runId = runId;
   		getRun(runId).then(function(response){
   			if (response.data.basicRunBO || response.data.modelRunBO){
   				if (response.data.basicRunBO) {
   					var basicBO = response.data.basicRunBO;
   					var modelBO = response.data.modelRunBO;
   					if (typeof(basicBO.windDirection) != 'undefined') {
       					newInput.wind.windDir = basicBO.windDirection;
       				}
       				if (typeof(basicBO.windSpeed)  != 'undefined') {
       					newInput.wind.windSpeed = basicBO.windSpeed;
       				}
       				if (basicBO.crownFireMethod) {
       					newInput.crownFire.method = basicBO.crownFireMethodName;
       					newInput.crownFire.id = basicBO.crownFireMethod;
       					if (newInput.crownFire.crownFireMethod) {
       						newInput.crownFire.crownFireMethod = {"id":basicBO.crownFireMethod, "name":basicBO.crownFireMethodName};
       						//newInput.crownFire.crownFireMethod.name = basicBO.crownFireMethodName;
       						//newInput.crownFire.crownFireMethod.id = basicBO.crownFireMethod; 
       					}
       				}
       				if (basicBO.foliarMoisture != null) {
       					newInput.crownFire.foliarMoistureContent = basicBO.foliarMoisture;
       	       		}
       				if (basicBO.landscapeResourceId != null) {
       					newInput.landscape.landscapeId = basicBO.landscapeResourceId;
       					newInput.landscape.resourceName = basicBO.landscapeName;
       					newInput.landscape.acres = basicBO.landscapeAcres;
       					newInput.landscape.landscapeSource = basicBO.landscapeSource;
       					newInput.landscape.resolution = basicBO.landscapeResolution;
       					newInput.landscape.created = basicBO.landscapeCreated;
       					
       					newInput.landscape.owner = basicBO.landscapeOwner;
       					newInput.landscape.complete = basicBO.landscapeComplete;
       					newInput.landscape.landscapeViewOnly =  false;
       					// TODO Set other fields for landscape drop down.
       	       		}
       				if (createDate == "") {
       					newInput.resourceDef.created = modelBO.created;
       				}
       				if ((basicBO.fuelMoistures != null) && (basicBO.fuelMoistures.length > 0)) {
       				 	var count = basicBO.fuelMoistures.length;
       				 	newInput.fuelMoisture.fuelMoistureArray = []
       				 	for (i=0; i < count; i++) {
       				 		newInput.fuelMoisture.fuelMoistureArray.push([null,null,null,null,null,null]);
       						//newInput.fuelMoisture.fuelMoistureArray[i][0].fm.fuelModelNumber = basicBO.fuelMoistures[i].model;
       						newInput.fuelMoisture.fuelMoistureArray[i][0] = basicBO.fuelMoistures[i].model;
       						newInput.fuelMoisture.fuelMoistureArray[i][1] = basicBO.fuelMoistures[i].fm1Hr;
       						newInput.fuelMoisture.fuelMoistureArray[i][2] = basicBO.fuelMoistures[i].fm10Hr;
       						newInput.fuelMoisture.fuelMoistureArray[i][3] = basicBO.fuelMoistures[i].fm100Hr;
       						newInput.fuelMoisture.fuelMoistureArray[i][4] = basicBO.fuelMoistures[i].fmLiveHerbaceous;
       						newInput.fuelMoisture.fuelMoistureArray[i][5] = basicBO.fuelMoistures[i].fmLiveWoody;
       					}
       				}
       				if ((basicBO.hourlyWeatherList != null) && (basicBO.hourlyWeatherList.length > 0)) {
       				 	newInput.weather.hourlyWeatherList = basicBO.hourlyWeatherList;
       				}
       			}
   				if (response.data.modelRunBO) {
   					if (response.data.modelRunBO.resourceName) {
       					newInput.resourceDef.name = response.data.modelRunBO.resourceName;
       				}
       			}

   				newInput.resourceDef.modelType = "Landscape Fire Behavior";
           		return newInput;
   			} else {
   				error_message = "Error loading previously entered data";
   				return null;
   			}});
   		return newInput;
	};
	
	

	function viewExistingRunInput(runId, userId, createDate) {
		defaultNewRunInput = {
				resourceDef: {
					owner: userId,
					showonly: true,
					created: createDate,
					name: "",
					runId:"",
					modelType: "Landscape Fire Behavior",
					modelStatus: "init",
				},
				weather:{
					showonly: true,
					ERC: 80,
					HourlyWeatherArray: [[0,null,null,null,null,null,null]]
				},
				wind: {
					showonly: true,
					windSpeed:null,
					windDir:null,
				},
				crownFire: {
					showonly: true,
					method:"Scott/Reinhardt",
					foliarMoistureContent:100
				},
				landscape:{
					showonly: true,
					landscapeId:"",
					resourceName:"",
					landscapeViewOnly: true,
					complete:false
				},
				fuelMoisture: {
					showonly: true,
					fuelMoistureArray:[[0,null,null,null,null,null]],
				}
			  };
		newInput = defaultNewRunInput;
		newInput.resourceDef.runId = runId;
   		getRun(runId).then(function(response){
   			if (response.data.basicRunBO || response.data.modelRunBO){
   				if (response.data.basicRunBO) {
   					var basicBO = response.data.basicRunBO;
   					var modelBO = response.data.modelRunBO;
   					if (typeof(basicBO.windDirection) != 'undefined') {
       					newInput.wind.windDir = basicBO.windDirection;
       				}
       				
       				if (typeof(basicBO.windSpeed) != 'undefined') {
       					newInput.wind.windSpeed = basicBO.windSpeed;
       				}
       				if (basicBO.crownFireMethod) {
       					newInput.crownFire.method = basicBO.crownFireMethodName;
       					newInput.crownFire.id = basicBO.crownFireMethod;
						// Had to have the following 2 lines for the playground
						newInput.crownFire.crownFireMethod.id = basicBO.crownFireMethod;
       					newInput.crownFire.crownFireMethod.name = basicBO.crownFireMethodName;
           			}
       				if (basicBO.foliarMoisture != null) {
       					newInput.crownFire.foliarMoistureContent = basicBO.foliarMoisture;
       	       		}
       				if (basicBO.landscapeResourceId != null) {
       					newInput.landscape.landscapeId = basicBO.landscapeResourceId;
       					newInput.landscape.resourceName = basicBO.landscapeName;
       					newInput.landscape.complete = basicBO.landscapeComplete;
       					newInput.landscape.landscapeViewOnly = true;
       					// TODO Set other fields for landscape drop down.
       	       		}
       				if (createDate == "") {
       					newInput.resourceDef.created = modelBO.created;
       				}
       				if ((basicBO.fuelMoistures != null) && (basicBO.fuelMoistures.length > 0)) {
       				 	var count = basicBO.fuelMoistures.length;
       				 	newInput.fuelMoisture.fuelMoistureArray = []
       				 	for (i=0; i < count; i++) {
       				 		newInput.fuelMoisture.fuelMoistureArray.push([null,null,null,null,null,null]);
       						//newInput.fuelMoisture.fuelMoistureArray[i][0] = basicBO.fuelMoistures[i].model;
       						newInput.fuelMoisture.fuelMoistureArray[i][0] = basicBO.fuelMoistures[i].model;
       						newInput.fuelMoisture.fuelMoistureArray[i][1] = basicBO.fuelMoistures[i].fm1Hr;
       						newInput.fuelMoisture.fuelMoistureArray[i][2] = basicBO.fuelMoistures[i].fm10Hr;
       						newInput.fuelMoisture.fuelMoistureArray[i][3] = basicBO.fuelMoistures[i].fm100Hr;
       						newInput.fuelMoisture.fuelMoistureArray[i][4] = basicBO.fuelMoistures[i].fmLiveHerbaceous;
       						newInput.fuelMoisture.fuelMoistureArray[i][5] = basicBO.fuelMoistures[i].fmLiveWoody;
       					}
       				}
       				if ((basicBO.hourlyWeatherList != null) && (basicBO.hourlyWeatherList.length > 0)) {
       				 	newInput.weather.hourlyWeatherList = basicBO.hourlyWeatherList;
       				}
       			}
   				if (response.data.modelRunBO) {
   					if (response.data.modelRunBO.resourceName) {
       					newInput.resourceDef.name = response.data.modelRunBO.resourceName;
       				}
       			}

   				newInput.resourceDef.modelType = "Landscape Fire Behavior";
           		return newInput;
   			} else {
   				error_message = "Error loading previously entered data";
   				return null;
   			}});
   		return newInput;
	};


  return {saveRunRequest: saveRunRequest,
	  	  setExistingRunInput: setExistingRunInput,
	  	  viewExistingRunInput: viewExistingRunInput,
	  	  submitBasicRun: submitBasicRun,
	  	  getRun: getRun};

}
