mainApp.directive('selectBasicModelDirective',function(){
	return {
		templateUrl: "pages/modelpages/selectBasicModelPanel_partial.html",
		scope: {validation:'<',
			    selected_model: '=input'
			   },
		controller: "selectBasicModelController"
	}
}).controller('selectBasicModelController',["$scope","$window","$filter","$rootScope","workspaceResource","breadcrumbResource","modelResource","basicResource","runResource","modelValidationFactory",
  function($scope,$window,$filter,$rootScope,workspaceResource,breadcrumbResource,modelResource,basicResource,runResource,modelValidationFactory){
	
	$scope.panelCompleteClass = "panel-default";
	
	$scope.validateInputs = function() {
		if ($scope.selected_model && modelValidationFactory.valid_basic_input($scope.selected_model)) {
			$scope.panelCompleteClass = "panel-success";
			$scope.validation();
		} else {
			$scope.panelCompleteClass = "panel-default";
		}
	}
	
	$scope.retrieve_runs = function(userId) {
		if(!userId) {
			userId = $rootScope.current_user_id;
		}
		runResource.getRuns(userId).then(function(response) {
			if (response.data && response.data.length > 0) {
				$scope.current_user_models = response.data;
				$scope.loaded_user_runs = true;
			} else if (response.data && response.data.length == 0) {
				$scope.current_user_models = []
				$scope.loaded_user_runs = true;
			} else {
				error_message = "Error loading user runs";
			}
		});
	}
	$scope.retrieve_runs($rootScope.current_user_id)
	
	$scope.model_select = function(model){
		$scope.selected_model={};
		$scope.digest;
		$scope.selected_model=basicResource.setExistingRunInput(model.runId, $rootScope.current_user_id, Date());
		$scope.runCreationInputComplete();
		$scope.weatherInputComplete();
		$scope.windInputComplete();
		$scope.crownFireInputComplete();
		$scope.fuelMoistureInputComplete();
	}
	
	$scope.cancelModelEdits = function() {
		$scope.creating_model = false;
	}
	
	d = new Date()
	
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
			weather:{
				ERC: 80,
				HourlyWeatherArray: [[0,null,null,null,null,null,null]]
			},
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
		if ($scope.selected_model.resourceDef && $scope.selected_model.resourceDef.name && !$scope.selected_model.resourceDef.runId) {
			$scope.saveBasic();
		}
		if ($scope.input.resourceDef && modelValidationFactory.valid_runCreation($scope.selected_model.resourceDef)) {
			if ($scope.selected_model) {
				$scope.selectedResourceDefComplete = true;
			}
			$scope.allInputsComplete();
		} else {
			$scope.selectedResourceDefComplete = false;
		}
	}
	
	$scope.weatherInputComplete = function() {
		if ($scope.selected_model && modelValidationFactory.valid_weatherConditioning($scope.selected_model.weather)) {
			if ($scope.selected_model) {
				$scope.selectedWeatherComplete = true;
			}
			$scope.allInputsComplete();
		} else {
			$scope.selectedWeatherComplete = false;
		}
	}
	$scope.windInputComplete = function() {
		if ($scope.selected_model && modelValidationFactory.valid_wind($scope.selected_model.wind)) {
			if ($scope.selected_model) {
				$scope.selectedWindComplete = true;
			}
			$scope.allInputsComplete();
		} else {
			$scope.selectedWindComplete = false;
		}
	}
	$scope.crownFireInputComplete = function() {
		if ($scope.selected_model && modelValidationFactory.valid_crown_fire($scope.selected_model.crownFire)) {
			if ($scope.selected_model) {
				$scope.selectedCrownFireComplete = true;
			}
			$scope.allInputsComplete()
		} else {
			$scope.selectedCrownFireComplete = false;
		}
	}
	
	$scope.fuelMoistureInputComplete = function() {
		if ($scope.selected_model && modelValidationFactory.valid_initialFuelMoisture($scope.selected_model.fuelMoisture)){
			if ($scope.selected_model) {
				$scope.selectedFuelMoistureComplete = true;
			}
			$scope.allInputsComplete();
		}
	}
	
	$scope.allInputsComplete = function() {
		if ($scope.input && modelValidationFactory.valid_runCreation($scope.selected_model.resourceDef) && modelValidationFactory.valid_wind($scope.selected_model.wind)
				&& modelValidationFactory.valid_crown_fire($scope.selected_model.crownFire) && modelValidationFactory.valid_initialFuelMoisture($scope.selected_model.fuelMoisture)
				&& modelValidationFactory.valid_landscape($scope.selected_model.landscape) 
				/*&& modelValidationFactory.valid_weatherConditioning($scope.selected_model.weather)*/) {
			$scope.is_run_input_ready = true;
		} else {
			$scope.is_run_input_ready = false;
		}
	
	}
	
	$scope.saveBasic = function() {
		$scope.selected_model.resourceDef.owner= $rootScope.current_user_id;
		if (!$scope.selected_model.resourceDef.containId)  $scope.input.resourceDef.containId = $scope.userPlaygroundFolderId;
		if (active_save_call) {
			return;
		} else if (!$scope.selected_model.resourceDef.name) {
			$scope.saveFailMessage = "No run name found.";
			$scope.saveFail = true;
			$timeout(hideSaveFailAlert, 10000);
			return;
		} else {
			active_save_call = true;
			basicResource.saveRunRequest($scope.selected_model)
		    	.then(function(response){
		    		if (response.data && response.data.success) {
		    			$scope.saveSuccess = true; 
		    			$timeout(hideSaveSuccessAlert, 3000);
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
	
}])