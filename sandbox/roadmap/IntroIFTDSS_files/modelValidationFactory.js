var INTEGER_REGEXP = /^\-?\d+$/;

mainApp.directive('integer', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.integer = function(modelValue, viewValue) {
    	
    	//Don't bother them if they haven't touched it and not required tag present
        if (ctrl.$isEmpty(modelValue)) {
          return true;
        }

        //isInt
        if (INTEGER_REGEXP.test(viewValue)) {
          return true;
        }
        
        return false;
      };
    }
  };
})

.directive('windDir', function(){
	return {
		require:'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$validators.windDir = function(modelValue, viewValue) {
				if (ctrl.$isEmpty(modelValue)) {
					return true;
				}
				if (((viewValue== -1) || (viewValue == -2)) || (viewValue >= 0 && viewValue < 360)) {
					return true;
				}
				
				return false;
			}
		}
	}
})

.factory("modelValidationFactory",["$filter",function($filter){
	
	function valid_basic_input(input) {
		if(valid_runCreation(input.resourceDef) && 
			valid_weatherConditioning(input.weather) && 
			valid_initialFuelMoisture(input.fuelMoisture) && 
			valid_wind(input.wind) && 
			valid_crown_fire(input.crownFire)) {
			return true;
		} else {
			return false;
		}
	}
	
	function valid_runCreation(input) {
		if (input && valid_name(input.name) && valid_owner(input.owner) 
				&& valid_modelRunStatus(input.modelStatus) && valid_time(input.created) 
				&& valid_modelType(input.modelType)) {
			return true;
		} else {
			return false;
		}
		
	}
	
	function valid_landscape(input) {
		if (input && valid_landscape_name(input.resourceName) && valid_landscape_complete(input.complete)
				&& valid_landscape_id(input.landscapeId)){
			return true;
		} else {
			return false;
		}
	}
	
	function valid_weatherConditioning(input) {
		//valid_ERC(ERC) function below disable for now
		// Note that having no weather data is also valid
		if (input && valid_hourly_weather_array(input.HourlyWeatherArray)) {
			return true
		} else {
			return false;
		}
	}
	
	function valid_initialFuelMoisture(input) {
		if (input && valid_fuelMoistureArray(input.fuelMoistureArray)){
			return true;
		}
		else {
			return false;
		}
	}
	
	function valid_wind(input) {
		if ((typeof(input) != 'undefined') && valid_windSpeed(input.windSpeed) && valid_windDir(input.windDir)) {
			return true
		} else {
			return false;
		}
	}
	
	function valid_crown_fire(input) {
		if (input && valid_crownFireMethod(input.crownFireMethod) && valid_foliarMoistureContent(input.foliarMoistureContent)) {
			return true;
		} else {
			return false;
		}
	}
	
	function valid_name(name){
		if (!name) {
			return false;
		}
		return true;
	}
	
	function valid_landscape_name(name){
		if (!name) {
			return false;
		}
		return true;
	}
	
	function valid_landscape_complete(status){
		return true;
	}
	
	function valid_landscape_id(id){
		if (!id) {
			return false;
		}
		if (!Number.isInteger(id)) {
			return false;
		}
		//check if in database
		return true
	}
	
	function valid_owner(owner){
		if (!owner) {
			return false;
		}
		return true;
	}
	
	function valid_time(time) {
		if (!time) {
			return false;
		}
		//time = $filter('date')(time)
		//if (!angular.isDate(time)){
		//	return false;
		//}
		return true;
	}
	
	function valid_modelType(modelType) {
		if (!modelType) {
			return false;
		}
		//Check if in database?
		return true;
	}
	
	function valid_modelRunStatus(modelRunStatus) {
		if (!modelRunStatus) {
			return false
		}
		//Check if in database?
		return true
	}
	
	function valid_ERC(ERC) {
		if (!ERC && ERC != 0) {
			return false
		}
		if (!Number.isInteger(ERC)) {
			return false;
		}
		if (ERC > 100 || ERC < 0) {
			return false;
		}
		return true;
	}
	
	function valid_temperature(temperature) {
		if (!temperature && temperature != 0) {
			return false;
		}
		if (!Number.isInteger(temperature)) {
			return false;
		}
		if (temperature > 200 || temperature < -30) {
			return false;
		}
		return true;
	}
	
	function valid_humidity(humidity) {
		if (!humidity && humidity != 0) {
			return false;
		}
		if (!Number.isInteger(humidity)) {
			return false;
		}
		if (humidity < 0 || humidity > 100) {
			return false;
		}
		return true;
	}
	
	function valid_precipitation(precipitation) {
		if (!precipitation && precipitation != 0) {
			return false;
		}
		if (precipitation < 0 || precipitation > 30) {
			return false;
		}
		return true;
	}
	
	function valid_cloud_cover(cloudCover) {
		if (!cloudCover && cloudCover != 0){
			return false;
		}
		if (!Number.isInteger(cloudCover)) {
			return false;
		}
		if (cloudCover < 0 || cloudCover > 100) {
			return false;
		}
		return true;
	}
	
	function valid_hour_of_weather(hour) {
		if (!hour && hour !=0) {
			return false;
		}
		if (!Number.isInteger(hour)) {
			return false;
		}
		if (hour >16800 || hour < 0) {
			return false;
		}
		return true;
	}
	
	function valid_hourly_weather_array(HourlyWeatherArray) {
		
		// Having no weather data is acceptable for running some models.
		if (!HourlyWeatherArray) {
			return false;
		}
		if (HourlyWeatherArray.length <= 0) {
			return false;
		}
		
		hournumber = []
		for (i=0; i<HourlyWeatherArray.length; i++) {
			
			if (!valid_hour_of_weather(HourlyWeatherArray[i][0])) {
				return false;
			}
			
			if (!valid_temperature(HourlyWeatherArray[i][2])) {
				return false;
			}
			
			if (!valid_windSpeed(HourlyWeatherArray[i][4])) {
				return false;
			}
			
			if (!valid_windDir(HourlyWeatherArray[i][3])) {
				return false;
			}
			
			if (!valid_humidity(HourlyWeatherArray[i][1])) {
				return false;
			}
			
			if (!valid_precipitation(HourlyWeatherArray[i][5])) {
				return false;
			}
			
			if (!valid_cloud_cover(HourlyWeatherArray[i][6])) {
				return false;
			}
			
			for (k=0;k < hournumber.length; k++) {
				if (hournumber[k] == HourlyWeatherArray[i][0]) {
					return false;
				}
			}
			
			hournumber.push(HourlyWeatherArray[i][0])
		}
		//TODO: check values inside list
		return true;
	}
	
	function valid_windSpeed(windSpeed) {
		if ((typeof(windSpeed) != 'undefined') && !windSpeed && windSpeed != 0) {
			return false
		}
		if (Number.isNaN(windSpeed)) {
			return false
		}
		if (windSpeed < 0 || windSpeed > 200) {
			return false
		}
		return true
	}
	
	function valid_windDir(windDir) {
		if (windDir == null || typeof(windDir) == "undefined") {
			return false
		}
		if (Number.isNaN(windDir)) {
			return false
		}
		if (windDir == -1 || windDir == -2) {
			return true
		}
		if (windDir > 360 || windDir < 0) {
			return false
		}
		return true;
	}
	
	function valid_crownFireMethod(crownFireMethod) {
		if (!crownFireMethod) {
			return false;
		}
		return true;
	}
	
	function valid_foliarMoistureContent(foliarMoistureContent) {
		if (!foliarMoistureContent) {
			return false;
		}
		if (!Number.isInteger(foliarMoistureContent)) {
			return false;
		}
		if (foliarMoistureContent > 200 || foliarMoistureContent < 0) {
			return false;
		}
		return true;
	}
	
	fuelMoistureRanges = [[0,1e8],[2,100],[2,100],[2,100],[30,250],[60,200]]
	
	function valid_fuelMoistureArray(fuelMoistureArray) {
		if (!fuelMoistureArray) {
			return false
		}
		indexOfDefaultFound = false
		modelnumber = []
		for (i=0; i<fuelMoistureArray.length; i++) {
			
			if (!Number.isInteger(fuelMoistureArray[i][0])) {
				return false
			}
			
			if (fuelMoistureArray[i][0] == 0) {
				indexOfDefaultFound  = true;
			}
			
			for (k=0;k < modelnumber.length; k++) {
				if (modelnumber[k] == fuelMoistureArray[i][0]) {
					return false;
				}
			}
			
			modelnumber.push(fuelMoistureArray[i][0])
			
			for (j=0; j<fuelMoistureArray[i].length; j++) {
				if(!fuelMoistureArray[i][j] && fuelMoistureArray[i][j] != 0) {
					return false
				}
				if (Number.isNaN(fuelMoistureArray[i][j])) {
					return false
				}
				if (!Number.isInteger(fuelMoistureArray[i][j])) {
					return false
				}
				if (fuelMoistureArray[i][j] < fuelMoistureRanges[j][0] || fuelMoistureArray[i][j] > fuelMoistureRanges[j][1]) {
					return false
				}
			}
			
			if (indexOfDefaultFound) {
				return true
			} else {
				return false
			}
		}
	}
	
	return {
		valid_runCreation : valid_runCreation,
		valid_initialFuelMoisture: valid_initialFuelMoisture,
		valid_weatherConditioning: valid_weatherConditioning,
		valid_wind: valid_wind,
		valid_landscape: valid_landscape,
		valid_crown_fire: valid_crown_fire,
		valid_basic_input:valid_basic_input
		}

}])