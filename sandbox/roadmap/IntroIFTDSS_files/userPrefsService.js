var theApp = null;
if (typeof mainApp != "undefined") {
	theApp = mainApp;
} else if (typeof ftemApp != "undefined") {
	theApp = ftemApp;
} else {
	console.log("ERROR: neither mainApp nor ftemApp are defined!");
}
theApp.factory('userPrefsService', ['$http','__env', userPrefsService]);

function userPrefsService ($http,__env) {

  var service = {};
  
  var geo_areas = {AK: 'Alaska', 
			 EA:'Eastern',
			 GB:'Great Basin', 
			 NC:'Northern California',
			 NR:'Northern Rockies',
			 NW:'Northwest',
			 RM:'Rocky Mountain', 
			 SC: 'Southern California',
			 SA: 'Southern Area',
			 SW: 'Southwest'
			 };
  
	var agencies = ['BIA',
	                'BLM',
	                'BOR',
	                'County-Local',
	                'NPS',
	                'Private',
	                'State',
	                'TNC',
	                'Tribal',
	                'USFS',
	                'USFWS',
	                'ANCSA',
	                'DOD',
	                'DOE',
	                'DOL',
	                'EPA',
	                'FEMA',
	                'NWS',
	                'USGS'
	             ];

	var geoAreaKeyName = [{attribKey:'AK', attribName:'Alaska'},
               {attribKey:'EA', attribName:'Eastern'},
               {attribKey:'GB', attribName:'Great Basin'},
               {attribKey:'NC', attribName:'Northern California'},
               {attribKey:'NR', attribName:'Northern Rockies'},
               {attribKey:'NW', attribName:'Northwest'},
               {attribKey:'RM', attribName:'Rocky Mountain'},
               {attribKey:'SC', attribName:'Southern California'},
               {attribKey:'SA', attribName:'Southern Area'},
			   {attribKey:'SW', attribName:'Southwest'}
              ];


			
	service.getGeoAreaMap = function() {
		return geoAreaKeyName;
	}
	service.getGeoAreaName = function(code) {
		return geo_areas[code];
	}
	service.getAgencies = function() {
		return agencies;
	}
	service.getUnits = function() {
		return [];
	}
	
	service.getUserPrefs = function(userId) {
		return $http({
			method: 'GET',
			url: __env.src("/iftdssREST/prefs/" + userId),
    }).then(
      function successCallback(response) {
         return response;
      }, 
      function errorCallback(response) {
         return response || {data:{responseMessage: "Request failed"}};
      }
    );
  }
  
  service.updatePrefs = function(userPrefBO) 
  {
	  var sendData = JSON.stringify(userPrefBO);

	return $http({
      method: 'PUT',
      url: __env.src("/iftdssREST/prefs/addorupdate"),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({"data":sendData})
    }).
    then(function(response) {
        return response;
      }, function(response) {
        return response || {data:{responseMessage: "Failed to update user preferences."}};
    });
  }

  return service;
}
