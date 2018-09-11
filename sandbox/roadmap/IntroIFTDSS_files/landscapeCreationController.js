mainApp.directive('landscapeCreation',function(){
	return {
		templateUrl: "pages/landscape/landscapeCreationPartial.html",
		scope: {output:'=',
			    input: '='
			   },
		controller: "landscapeCreationController"
	}
}).controller('landscapeCreationController',["$scope","$filter","$window","$rootScope","landscapeResource","workspaceResource","breadcrumbResource", "propertiesService", "genericResource",
  function($scope,$filter,$window,$rootScope,landscapeResource,workspaceResource,breadcrumbResource,propertiesService, genericResource){
	
    $scope.fuelModelMethods = ["Fuel Model 13","Fuel Model 40"];
    
    $scope.landscape_ready_to_create = false;
    $scope.createFolderName = "";
    $scope.activeWorkspaceId = $rootScope.activeWorkspace.resourceId;
    $scope.maxAreaAcres = 12188160;		
	
    d = new Date();
    
    $scope.landscape = {
      "owner":  $rootScope.current_user_id,
      "created": $filter('date')(d.getTime(), 'medium'),
      "southLatitude": null,
      "eastLongitude": null,
      "landscapeSource": "",
      "landscapeMetaId": "",
      "landscapeId": "",
      "fuelModel": "Fuel Model 40",
      "resolution": 30,
      "resourceName": "",
      "westLongitude": null,
      "northLatitude": null,
      "areaAcres": 0,
      "folder": null,
      "lengthFeet": 0
    }
    
    if (breadcrumbResource.activeFolderExists()) {
    	$scope.landscape.folder = breadcrumbResource.getActiveFolder();
    }
    
    landscapeResource.getLandscapeSources().then(function(response){
    	if (response.data && response.data.length > 0) {
    		$scope.landscapeSources = response.data;
    		var lastId = $scope.landscapeSources.length - 1;
    		$scope.landscape.landscapeSource = $scope.landscapeSources[lastId].description;
    		$scope.landscape.landscapeMetaId = $scope.landscapeSources[lastId].landscapeId;
    	} else {
    		error_message = "Error loading landscape sources";
    	}
    })
    
   propertiesService.getProperty("maxLandscapeAreaAcres", "iftdss", $rootScope.current_user_id).then(function(response){
			if (response.data && response.status != 500) {
				if (response.data.value){
					if (isNumber(response.data.value)){
						$scope.maxAreaAcres = parseFloat(response.data.value);
					}					
				}
			} 
		});
    
    $scope.retrieveFolders = function(userId) {
		$scope.userFolders = [];
		workspaceResource.getUserFolders(userId).then(function(response) {
			if (response.data) {
				$scope.userFolders = response.data;
			} else {
				error_message = "Error loading workspaces for user";
			}
		});	
	}
    
    $scope.retrieveFolders($rootScope.current_user_id);
    
    $scope.folder_select = function(folder) {
    	$scope.landscape.folder = folder;
    }
    
    $scope.cancelLandscape= function() {
    	//alert("cancel");
    	$window.document.getElementById("landscapeBoundsMap").remove();
    	$scope.rest_error_message = "";
    	$scope.output.creating_new_landscape = false;
    }
    
    $scope.createLandscape= function(input) {
    	
    	$scope.rest_error_message = ""

    	$scope.landscape.westLongitude = ($window.document.getElementById("xminAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.eastLongitude = ($window.document.getElementById("xmaxAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.southLatitude = ($window.document.getElementById("yminAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.northLatitude = ($window.document.getElementById("ymaxAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.areaAcres = ($window.document.getElementById("areaAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.lengthFeet = ($window.document.getElementById("lengthAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	
    	if (valid_new_landscape(input)) {
    	  landscapeResource.createLandscape(input).then(function(response){
			    if (response.data) {
			    	if (response.data.entityId) {
			    		if ($scope.input) {
			    			$scope.input.landscapeId = response.data.entityId;
					    	$scope.input.resourceName = $scope.landscape.resourceName;
					    	$scope.input.complete = false;
					    	//landscapeResource.setSelectedZeroLandscape(response.data);
					    	$rootScope.selectedZeroLandscapeFlag++;
						}
			    		
			    		$scope.cancelLandscape();
				    	$scope.rest_error_message = "Successfully queued request for landscape " +  $scope.landscape.resourceName;
				    }
			    	else {
			    		$scope.rest_error_message = response.data.responseMessage;
					}
			    } else {
				    $scope.rest_error_message = "Error accessing server:" + response.data.responseMessage;
			    }
		    });
    	}
    }
    
    $scope.landscapeSource_method_select = function(source) {
		$scope.landscape.landscapeSource = source.description;
		$scope.landscape.landscapeMetaId = source.landscapeId;
		$scope.check_submit();
	}
    
    $scope.fuelModel_method_select = function(method) {
		$scope.landscape.fuelModel = method;
		$scope.check_submit();
	}
    
    $scope.check_submit = function() {

    	$scope.landscape.westLongitude = ($window.document.getElementById("xminAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.eastLongitude = ($window.document.getElementById("xmaxAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.southLatitude = ($window.document.getElementById("yminAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.northLatitude = ($window.document.getElementById("ymaxAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.areaAcres = ($window.document.getElementById("areaAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	$scope.landscape.lengthFeet = ($window.document.getElementById("lengthAngular").innerHTML).replace(/[^\d\.]*/g, '');
    	
    	
    	if (valid_new_landscape($scope.landscape)) {
    		$scope.landscape_ready_to_create = true;
    	} else {
    		$scope.landscape_ready_to_create = false;
    	}
    }
    
   isNumber = function(n) {
  	  return !isNaN(parseFloat(n)) && isFinite(n);
  	}
    
    
    valid_new_landscape= function(input) {
    	if (!input) {
    		return false;
    	}
    	if (!input.owner || !input.southLatitude || !input.eastLongitude || !input.landscapeSource 
    			|| !input.resourceName || !input.westLongitude || !input.northLatitude || !input.areaAcres) {
    		return false
    	}
    	if (input.areaAcres > $scope.maxAreaAcres || input.areaAcres <= 0 ){
    		return false
    	}
    	return true
    }
    
	$scope.createFolder = function() {
		var resource = {};
		resource.resourceName = $scope.createFolderName;
		resource.owner = $rootScope.current_user_id;
		resource.resourceType = 'fldr';
		resource.resourceScope = 'per';
		resource.containId = $scope.activeWorkspaceId;
		genericResource.createResource(resource).then(function(response) {
    		if (response.data && response.data.success) {
    			if (response.data.entityId) {
					resource.resourceId = response.data.entityId;
				}
    			
    			$scope.userFolders.push(resource);
    			$scope.rest_error_message = "";
    			$scope.$digest;
    			
    		} else {
    			$scope.rest_error_message  = response.data.responseMessage;
    		}
		});
		
		$scope.createFolderName = '';  // clear input field value
	}
    
}])