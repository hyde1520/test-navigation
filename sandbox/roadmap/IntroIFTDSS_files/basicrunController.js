mainApp.controller("basicrunController", ["$scope", '$rootScope','$timeout','$location','$filter','$route','$window',"basicResource","workspaceResource","landscapeResource","modelValidationFactory",basicrunController])

function basicrunController($scope,$rootScope,$timeout,$location,$filter,$route,$window,basicResource,workspaceResource,landscapeResource,modelValidationFactory){
	
	$rootScope.navbar_title="Create Landscape Fire Behavior Model";
	d = new Date();
	
	$scope.submitSuccess = false;
	$scope.submitFail = false;
	$scope.saveSuccess = false;
	$scope.saveFail = false;
	$scope.saveFailMessage = "";
	$scope.userPlaygroundFolderId = null;
	
	$scope.runForm = {};
	$scope.userLandscapes = [];
	
	$scope.modelInputsRetrievedFlag = 0; // needed for wind input directive but not used 
	$scope.modelInputChanged = 0; // ditto
	
	
	// Hide the save success alert initially
	$(document).ready(function() {
		$("#save-success-alert").addClass('close');
		//setIftdssHoverText('basic', basicHoverJSON);
		//$("#save-success-alert").hide();
	});
	
	$scope.cancelPage = function() {
		location.href = "/#/playground";
	}
	
	$scope.returnPage = function () {
		var returnHome = true;
		$scope.saveBasic(returnHome);
	};
	
	var listener = $scope.$watch("input.resourceDef.name", function () {
		$scope.input.resourceDef.owner= $rootScope.current_user_id;
		$scope.runCreationInputComplete();
		// TODO: - for future $scope.weatherInputComplete();
		$scope.windInputComplete();
		$scope.crownFireInputComplete();
		$scope.fuelMoistureInputComplete();
		$scope.landscapeInputComplete();
		if ($scope.input.resourceDef.name || !$scope.input.resourceDef.runId) {
	      listener(); //run one time
		}
	});
	
	active_save_call = false;
	active_run_call = false;
	
	$scope.getPlaygroundFolderId = function(userId) {
		var userFolders = [];
		workspaceResource.getUserFolders(userId).then(function(response) {
			if (response.data) {
				userFolders = response.data;
				if (userFolders && userFolders.length > 0) {
					for (i=0; i<userFolders.length; i++) {
						if (userFolders[i].resourceName == 'Playground') {
							$scope.userPlaygroundFolderId = userFolders[i].resourceId;
						}
					}
				}
			} else {
				error_message = "Error retrieving folders for user";
			}
		});	
	}
	
	$scope.getPlaygroundFolderId($rootScope.current_user_id);
	
	defaultNewRunInput = {
			resourceDef: {
				owner: $rootScope.current_user_id,
				created: $filter('date')(d.getTime(), 'medium'),
		    	name: "",
		    	runId:"",
		    	containId: $scope.userPlaygroundFolderId,
			    modelType: "Landscape Fire Behavior",
			    modelStatus: "init",
			},
			/* TODO: future 
			weather:{
				ERC: 80,
				HourlyWeatherArray: [[0,null,null,null,null,null,null]]
			}, */
			wind:{
				windSpeed:null,
				windDir:null,
			},
			crownFire:{
				crownFireMethod:"Scott/Reinhardt",
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
		  }
	
	$scope.runCreationInputComplete = function() {
		if ($scope.input.resourceDef && $scope.input.resourceDef.name && !$scope.input.resourceDef.runId) {
			$scope.saveBasic();
		}
		if ($scope.input.resourceDef && modelValidationFactory.valid_runCreation($scope.input.resourceDef)) {
			$scope.allInputsComplete();
		}
	}
	
	/* TODO - for future
	$scope.weatherInputComplete = function() {
		if ($scope.input && modelValidationFactory.valid_weatherConditioning($scope.input.weather)) {
			$scope.allInputsComplete();
		}
	}*/
	$scope.windInputComplete = function() {
		if ((typeof($scope.input) != 'undefined') && modelValidationFactory.valid_wind($scope.input.wind)) {
			$scope.allInputsComplete();
		} 
	}
	$scope.crownFireInputComplete = function() {
		if ($scope.input && modelValidationFactory.valid_crown_fire($scope.input.crownFire)) {
			$scope.allInputsComplete()
		} 
	}
	
	$scope.fuelMoistureInputComplete = function() {
		if ($scope.input && modelValidationFactory.valid_initialFuelMoisture($scope.input.fuelMoisture)){
			$scope.allInputsComplete();
		}
	}
	
	$scope.landscapeInputComplete = function() {
		if ($scope.input && $scope.input.landscape && modelValidationFactory.valid_landscape($scope.input.landscape)) {
			$scope.allInputsComplete()
		}
	}
	
	$scope.allInputsComplete = function() {
		if ((typeof($scope.input) != 'undefined') && modelValidationFactory.valid_runCreation($scope.input.resourceDef) && modelValidationFactory.valid_wind($scope.input.wind)
				&& modelValidationFactory.valid_crown_fire($scope.input.crownFire) && modelValidationFactory.valid_initialFuelMoisture($scope.input.fuelMoisture)
				&& modelValidationFactory.valid_landscape($scope.input.landscape)/* && modelValidationFactory.valid_weatherConditioning($scope.input.weather)*/) {
			$scope.is_run_input_ready = true;
		} else {
			$scope.is_run_input_ready = false;
		}
	
	}
	
	if ($route.current.locals.startingInputs) {
		$scope.input = $route.current.locals.startingInputs;
		$scope.input.resourceDef.owner= $rootScope.current_user_id;
		$scope.$digest;
	} else {
		$scope.input = defaultNewRunInput;
		$scope.is_done_loading = true;
	}
	
	function hideSaveSuccessAlert() {
		$scope.saveSuccess = false; 
	}
	
	function hideSaveFailAlert() {
		$scope.saveFail = false; 
		$scope.saveFailMessage = "";
	}
	
	$scope.saveBasic = function(returnHome) {
		$scope.input.resourceDef.owner= $rootScope.current_user_id;
		if (!$scope.input.resourceDef.containId)  $scope.input.resourceDef.containId = $scope.userPlaygroundFolderId;
		if (active_save_call) {
			return;
		} else if (!$scope.input.resourceDef.name) {
			$scope.saveFailMessage = "No run name found.";
			$scope.saveFail = true;
			$timeout(hideSaveFailAlert, 10000);
			return;
		} else {
			active_save_call = true;
			basicResource.saveRunRequest($scope.input)
		    	.then(function(response){
		    		if (response.data && response.data.success) {
		    			if (returnHome) {
	    					$location.path("/playground");
	    				}
		    			if (!$scope.input.resourceDef.runId && response.data.entityId) {
		    				$scope.input.resourceDef.runId = response.data.entityId;
		    				$location.path('/basic/edit/'+$scope.input.resourceDef.runId).replace();
		    			}
		    			$scope.saveSuccess = true; 
		    			$timeout(hideSaveSuccessAlert, 3000);
		    		} else {
		    			$scope.saveFailMessage = response.data.responseMessage;
		    			$scope.saveFail = true;
		    			$timeout(hideSaveFailAlert, 10000);
		    		}
		    		active_save_call = false;
		    });
		}
	}
	
	$scope.submitBasic = function() {
		$scope.input.resourceDef.owner= $rootScope.current_user_id;
		if (active_run_call) {
			return;
		} else {
			active_run_call = true;
			active_save_call = true;
			testvariable = basicResource.saveRunRequest($scope.input)
	    	.then(function(response){
	    		if (response.data && response.data.success) {
	    			if (!$scope.input.resourceDef.runId && response.data.entityId) {
	    				$scope.input.resourceDef.runId = response.data.entityId;
	    			}
	    			else {
		    			testvariable = basicResource.submitBasicRun($scope.input.resourceDef.runId)
	    		    	.then(function(response){
	    		    		if (response.data && response.data.success) {
	    		    			if (!$scope.input.resourceDef.runId && response.data.entityId) {
	    		    				$scope.input.resourceDef.runId = response.data.entityId;
	    		    				//$location.path('/basic/edit/'+$scope.input.runId).replace()
	    		    			}
	    		    			$scope.submitSuccess = true;
	    		    			$location.path("/playground");
	    		    		} else {
	    		    			$scope.submitFailMessage = response.data.responseMessage;
	    		    			$scope.submitFail = true;
	    		    		}
	    		    		active_run_call = false;
	    		    		$scope.$digest;
	    		       });

	    			}
	    		} else {
	    			//error_message = "Error saving Basic Run";
	    			$scope.saveFailMessage = response.data.responseMessage;
	    			$scope.saveFail = true;
	    			$timeout(hideSaveFailAlert, 10000);
	    		}
	    		active_save_call = false;
	    	});
			
		}
	}

}