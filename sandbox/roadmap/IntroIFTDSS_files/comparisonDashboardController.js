mainApp.controller("comparisonDashboardController",["$scope","$filter","$rootScope","$location", "$route","runResource","basicResource","modelResource","landscapeResource",comparisonDashboardController])

function comparisonDashboardController ($scope,$filter, $rootScope, $location, $route,runResource,basicResource,modelResource,landscapeResource) {
	
	$scope.models=[];
	$scope.landscapes = [];
	$scope.modelsoflandscapes = [];
	$scope.landscapeCopy = {};
	$scope.errorMessage = "";
	d = new Date();
	
	exampleLandscapes = [{owner:"rtmah",created:"Jan 01, 2016 12:00:00 AM",resourceName:"0",
		resourceScope:"per",landscapeSource:"LANDFIRE_2012",landscapeMetaId:"1",lcpPathname:"default",
		landscapeId:1000,complete:true,eastLongitude:-104,westLongitude:-105,northLatitude:56,
		southLatitude:57,resolution:30},
	{owner:"rtmah",created:"Jan 01, 2016 12:00:00 AM",resourceName:"A",
		resourceScope:"per",landscapeSource:"LANDFIRE_2012",landscapeMetaId:"1",lcpPathname:"default",
		landscapeId:1001,complete:true,eastLongitude:-104,westLongitude:-105,northLatitude:56,
		southLatitude:57,resolution:30},
	{owner:"rtmah",created:"Jan 01, 2016 12:00:00 AM",resourceName:"B",
		resourceScope:"per",landscapeSource:"LANDFIRE_2012",landscapeMetaId:"1",lcpPathname:"default",
		landscapeId:1002,complete:false,eastLongitude:-104,westLongitude:-105,northLatitude:56,
		southLatitude:57,resolution:30},
	{owner:"rtmah",created:"Jan 01, 2016 12:00:00 AM",resourceName:"C",
		resourceScope:"per",landscapeSource:"LANDFIRE_2012",landscapeMetaId:"1",lcpPathname:"default",
		landscapeId:1003,complete:false,eastLongitude:-104,westLongitude:-105,northLatitude:56,
		southLatitude:57,resolution:30}]
	
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
	
	getLandscapes  = function(landscapeId) {
		landscapeResource.getRelatedLandscapes(landscapeId).then(function (response) {
			if (response) {
				$scope.landscapes = response;
				getLandscapeRules();
			} else {
				console.log("Not found")
			}
		})
	}
	
	getLandscapeRules = function() {
		
	}
	
	$scope.clearError = function() {
		$scope.errorMessage = "";
	}
	
	$scope.setLandscapeAsEC = function(landscapeId) {
		landscapeResource.setIdAsEC(landscapeId).then(function(response) {
			$scope.errorMessage = "";
			for (i = 0 ; i < $scope.landscapes.length; i++) {
				if ($scope.landscapes[i].resourceSubType == "ec__"){
					landscapeResource.setIdAsSubTypeNull($scope.landscapes[i].landscapeId)
						.then(function(response){$scope.landscapes[i].resourceSubType = "";});
				}
				if ($scope.landscapes[i].landscapeId == landscapeId) {
					$scope.landscapes[i].resourceSubType = "ec__";
				}
			}
			if (response.success == false) {
				$scope.errorMessage = "Was not able to change which landscape is the existing condition."
			}
		})
	}
	
	$scope.copyLandscape = function(landscape) {
		if (landscape.landscapeId && landscape.resourceName) {
		landscapeResource.copyLandscapeandRelate(landscape.landscapeId,landscape.resourceName).then(function (response) {
			landscape.landscapeId = response.entityId;
			landscape.runs= [];
			for (runIndex = 0; runIndex < $scope.model_groups.length; runIndex++) {
				landscape.runs.push({resourceId:null,complete:false});
			}
			$scope.landscapes.push(landscape);
			landscape={}
		})
		} else {
			$scope.copyError = "No Landscape Name Entered"
		}
	}
	
	//landscapeResource.copyLandscapeandRelate($route.current.params.landscapeId,"hullaballu")
	getLandscapes($route.current.params.landscapeId);
	//getModels($route.current.params.landscapeId);
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
		$scope.selected_model=model;
		$scope.digest
		console.log($scope.selected_model)
	}
	
	
}