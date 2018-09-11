

mainApp.service('fileUpload', ['$http', function ($http) {
    
    this.uploadFileToUrl = function(file, uploadUrl, input) {
    	if (input.runId) {
    		var saveUrl = "/iftdssREST/basic/input";
    		var picReader = new FileReader();
    		  picReader.readAsText(file);
    		  var sendData = "";
            picReader.addEventListener("load", function(event) {

            	sendData += "{'runId':'" + input.runId + "', 'input':'" + picReader.result + "'";
          		//sendData += example_input_data;
      			sendData +="}";
      			return $http({
      	  	      method: 'PUT',
      	  	      url: saveUrl,
      	  	      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      	  	      data: $.param({"data":sendData})
      	  	    }).
      	  	    then(function(response) {
      	  	    	// TODO remove this with next merge.  This should be done in the
      	  	    	// controller to persist it so page refreshes still have the run id.
      	  	    	input.runId = response.data.entityId;
      	  	        return response;
      	  	      }, function(response) {
      	  	        return response || {data:{message: "Request failed"}};
      	  	    });

            });
            
            //Read the text file
          
            // ORIG passing the hard coded string in this file
            // var sendData = "{'runId':'" + input.runId + "', 'input':'" + example_input_data + "'";
      		
  		} else {
  			return {data:{message: "Run id missing, unable to save input"}};
  		}

  	    
  	  }
   
   var example_input_data = "";                
   example_input_data += "FlamMap-Inputs-File-Version-1\n";
   example_input_data += "\n";
   example_input_data += "#mandatory switches\n";
   example_input_data += "FUEL_MOISTURES_DATA: 1\n";
   example_input_data += "0 4 6 13 30 60\n";
   example_input_data += "WIND_SPEED: 20\n";
   example_input_data += "WIND_DIRECTION: 240\n";
   example_input_data += "\n";
   example_input_data += "#optional switches\n";
   example_input_data += "CONDITIONING_PERIOD_END: 09 01 1500\n";
   example_input_data += "RAWS_ELEVATION: 5400\n";
   example_input_data += "RAWS_UNITS: English\n";
   example_input_data +=  "RAWS: 59\n";
   example_input_data += "2015 8 25 1300 82 22 0.00 7 156 33\n";
   example_input_data += "2015 8 25 1400 84 17 0.00 8 245 36\n";
   example_input_data += "2015 8 25 1500 85 15 0.00 9 218 39\n";
   example_input_data += "2015 8 25 1600 82 13 0.00 7 294 42\n";
   example_input_data += "2015 8 25 1700 82 17 0.00 3 316 45\n";
   example_input_data += "2015 8 25 1800 78 23 0.00 4 337 48\n";
   example_input_data +=  "2015 8 25 1900 69 29 0.00 2 317 51\n";
   example_input_data +=  "2015 8 25 2000 56 53 0.00 1 316 54\n";
   example_input_data += "2015 8 25 2100 56 64 0.00 4 15 57\n";
   example_input_data += "2015 8 25 2200 54 60 0.00 3 301 60\n";
   example_input_data += "2015 8 25 2300 49 67 0.00 2 25 63\n";
   example_input_data += "2015 8 26 0000 45 84 0.00 0 323 66\n";
   example_input_data += "2015 8 26 0100 42 85 0.00 0 320 69\n";
   example_input_data += "2015 8 26 0200 41 91 0.00 1 251 72\n";
   example_input_data += "2015 8 26 0300 38 88 0.00 1 63 75\n";
   example_input_data += "2015 8 26 0400 36 95 0.00 0 317 78\n";
   example_input_data += "2015 8 26 0500 35 94 0.00 0 328 81\n";
   example_input_data += "2015 8 26 0600 33 96 0.00 0 206 84\n";
   example_input_data += "2015 8 26 0700 38 97 0.00 0 132 88\n";
   example_input_data += "2015 8 26 0800 53 78 0.00 0 121 80\n";
   example_input_data += "2015 8 26 0900 65 44 0.00 2 23 72\n";
   example_input_data += "2015 8 26 1000 72 34 0.00 3 174 64\n";
   example_input_data += "2015 8 26 1100 78 26 0.00 4 202 56\n";
   example_input_data +=  "2015 8 26 1200 83 18 0.00 4 99 48\n";
   example_input_data += "2015 8 26 1300 84 17 0.00 4 121 41\n";
   example_input_data += "2015 8 26 1400 86 16 0.00 4 180 43\n";
   example_input_data += "2015 8 26 1500 84 12 0.00 6 217 46\n";
   example_input_data += "2015 8 26 1600 85 11 0.00 5 226 49\n";
   example_input_data += "2015 8 26 1700 81 17 0.00 4 325 52\n";
   example_input_data += "2015 8 26 1800 74 19 0.00 3 72 54\n";
   example_input_data += "2015 8 26 1900 62 35 0.00 2 352 57\n";
   example_input_data += "2015 8 26 2000 53 66 0.00 2 224 60\n";
   example_input_data += "2015 8 26 2100 48 76 0.00 2 1 63\n";
   example_input_data += "2015 8 26 2200 44 81 0.00 2 99 66\n";
   example_input_data += "2015 8 26 2300 42 82 0.00 1 84 68\n";
   example_input_data += "2015 8 27 0000 39 86 0.00 0 6 71\n";
   example_input_data += "2015 8 27 0100 39 92 0.00 0 43 74\n";
   example_input_data += "2015 8 27 0200 37 93 0.00 2 7 77\n";
   example_input_data += "2015 8 27 0300 36 91 0.00 0 61 79\n";
   example_input_data += "2015 8 27 0400 35 90 0.00 0 20 82\n";
   example_input_data += "2015 8 27 0500 34 95 0.00 0 21 85\n";
   example_input_data += "2015 8 27 0600 34 95 0.00 0 335 88\n";
   example_input_data += "2015 8 27 0700 37 92 0.00 0 32 91\n";
   example_input_data += "2015 8 27 0800 44 91 0.00 0 87 84\n";
   example_input_data += "2015 8 27 0900 56 66 0.00 0 135 77\n";
   example_input_data += "2015 8 27 1000 65 40 0.00 1 212 70\n";
   example_input_data += "2015 8 27 1100 77 33 0.00 2 126 63\n";
   example_input_data += "2015 8 27 1200 80 20 0.00 6 3 56\n";
   example_input_data += "2015 8 27 1300 82 16 0.00 8 271 50\n";
   example_input_data += "2015 8 27 1400 82 16 0.00 10 223 52\n";
   example_input_data += "2015 8 27 1500 77 18 0.00 6 288 55\n";
   example_input_data += "2015 8 27 1600 78 20 0.00 7 343 57\n";
   example_input_data += "2015 8 27 1700 74 24 0.00 3 345 60\n";
   example_input_data += "2015 8 27 1800 69 28 0.00 3 329 62\n";
   example_input_data += "2015 8 27 1900 59 55 0.00 2 31 65\n";
   example_input_data += "2015 8 27 2000 51 68 0.00 1 236 67\n";
   example_input_data += "2015 8 27 2100 47 75 0.00 1 358 70\n";
   example_input_data += "2015 8 27 2200 45 82 0.00 0 264 72\n";
   example_input_data += "2015 8 27 2300 43 89 0.00 2 339 75\n";
   example_input_data += "\n";
   example_input_data += "CUSTOM_FUELS_FILE: C:\data\customfuels.fmd\n";
   example_input_data += "FOLIAR_MOISTURE_CONTENT: 100\n";
   example_input_data += "CROWN_FIRE_METHOD: Finney\n";
   example_input_data += "#CROWN_FIRE_METHOD: ScottReinhardt\n";
   example_input_data += "GRIDDED_WINDS_DIRECTION_FILE: C:\Data\angle_20_225.asc\n";
   example_input_data += "GRIDDED_WINDS_SPEED_FILE: C:\Data\velocity_20_225.asc\n";
   example_input_data += "NUMBER_PROCESSORS: 1\n";
   example_input_data += "SPREAD_DIRECTION_FROM_NORTH: 0\n";
   example_input_data += "USE_MEMORY_OUTPUTS: 0\n";
   example_input_data += "TEMP_STORAGE_PATH: F:\Data\Temp\n";
   example_input_data += "\n";
   example_input_data += "GRIDDED_WINDS_GENERATE: Yes\n";
   example_input_data += "GRIDDED_WINDS_RESOLUTION: 60.0\n";
   example_input_data += "GRIDDED_WINDS_DIURNAL: Yes\n";
   example_input_data += "GRIDDED_WINDS_DIURNAL_AIRTEMP: 84.5\n";
   example_input_data += "GRIDDED_WINDS_DIURNAL_CLOUDCOVER: 15.0\n";
   example_input_data += "GRIDDED_WINDS_DIURNAL_LONGITUDE: -114.0\n";
   example_input_data += "GRIDDED_WINDS_DIURNAL_DATE: 03 16 2009\n";
   example_input_data += "GRIDDED_WINDS_DIURNAL_TIME: 0 00 14 -7\n";
   example_input_data += "\n";
   example_input_data += "\n";
   example_input_data += "#output switches\n";
   example_input_data += "FLAMELENGTH:\n";
   example_input_data += "SPREADRATE:\n";
   example_input_data += "INTENSITY:\n";
   example_input_data += "HEATAREA:\n";
   example_input_data += "CROWNSTATE:\n";
   example_input_data += "CROWNFRACTIONBURNED:\n";
   example_input_data += "SOLARRADIATION:\n";
   example_input_data += "FUELMOISTURE1:\n";
   example_input_data += "FUELMOISTURE10:\n";
   example_input_data += "FUELMOISTURE100:\n";
   example_input_data += "FUELMOISTURE1000:\n";
   example_input_data += "MIDFLAME:\n";
   example_input_data += "HORIZRATE:\n";
   example_input_data += "MAXSPREADDIR:\n";
   example_input_data += "ELLIPSEDIM_A:\n";
   example_input_data += "ELLIPSEDIM_B:\n";
   example_input_data += "ELLIPSEDIM_C:\n";
   example_input_data += "MAXSPOT_DIR:\n";
   example_input_data += "MAXSPOT_DX:\n";
   example_input_data += "WINDDIRGRID:\n";
   example_input_data += "WINDSPEEDGID:";

}]);
 

mainApp.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          
          element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }]);

mainApp.controller('uploadCtrl', ['$scope', '$rootScope', 'fileUpload', 'basicResource', function($scope, $rootScope, fileUpload, basicResource){
    $scope.uploadFile = function(){
       var file = $scope.myFile;
       
       console.log('file is ' );
       console.dir(file);
       
       var uploadUrl = "/iftdss/basic/input";
        fileUpload.uploadFileToUrl(file, uploadUrl, $scope.input)
       .then( function (response){
	      if (response.data && response.data.success && response.data.success == true) {
         	createDate = ""; // TODO: How to set default $filter('date')(d.getTime(), 'medium');
         	$scope.login_error = '';
         	basicResource.setExistingRunInput(response.data.entityId, $rootScope.current_user_id, createDate);
 	      } else {
	        $scope.login_error=response.data.message;
	        //return false;
	      }
	    })
    };
 }]);
