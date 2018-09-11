mainApp.controller("cycleTaskController",["$scope","$rootScope","$location","$window", "$routeParams", "breadcrumbResource","cycleGuidenceResource","landscapeResource","landscapeEditService", "reportService", "propertiesService", cycleTaskController])

function cycleTaskController($scope,$rootScope,$location,$window,$routeParams,breadcrumbResource,cycleGuidenceResource,landscapeResource, landscapeEditService, reportService, propertiesService) {
	
	$scope.dialog = cycleGuidenceResource.getGuidenceDialog($routeParams.task);
	$scope.resources = cycleGuidenceResource.getRequiredResources($routeParams.task);
	$scope.selected_landscape = {};
	$scope.createdLandscapeMessage = null;
	$scope.maskExist = false;
	$scope.selected_mask = {};
	// Removed these next 2 lines as adding them to initialize the ng-repeat lists create this javascript error in the console:
	//   "Error: [filter:notarray] http://errors.angularjs.org/1.5.7/filter/notarray?p0=%7B%7D
	//$scope.userMasks = {};
	//$scope.userLandscapes = {};
	$scope.addedNewResourceFlag = 0;
	
	landscapeResource.getUserLandscapes($rootScope.current_user_id, landscapeResource.ScopeEnum.ALL).then(function(response){
		$scope.userLandscapes = response;
		
	},function(errorResponse){
		// console.log
	});
	
	
	$scope.directive_action= {creating_new_landscape:false};
	
	$scope.createNewLandscape = function(){
		$scope.directive_action.creating_new_landscape = true;
		if($window.document.getElementById("landscapeBoundsMap")) {
    	  $window.document.getElementById("landscapeBoundsMap").remove();
		}
		$scope.hoverContext = "create";
		propertiesService.getProperty("maxLandscapeAreaAcres", "iftdss", $rootScope.current_user_id).then(function(response){
			var maxAreaAc = 12188160;			
			if (response.data && response.status != 500) {
				if (response.data.value){
					if (isNumber(response.data.value)){
						maxAreaAc = parseFloat(response.data.value);
					}					
				}
			} 
			var iframeContent = "<iframe width='500' height='530' frameborder='5' src='pages/modelpages/SelectLandscapeExtent.html?maxAreaAcres="+maxAreaAc+"' marginwidth='0' marginheight='0' scrolling='no' id='landscapeBoundsMap'>";
			$("#landscapeBoundsMapAppend").append(iframeContent);
		});
		
		function isNumber(n) {
	    	  return !isNaN(parseFloat(n)) && isFinite(n);
	    	}
    	
	}
	
	$scope.createNewLandscapeInMapStudio = function() {
		if (breadcrumbResource && breadcrumbResource.getActiveFolder() && breadcrumbResource.getActiveFolder().resourceId) {
			currentWorkSpace = breadcrumbResource.getActiveFolder().resourceId;
		} else if (breadcrumbResource && breadcrumbResource.getActiveWorkspace() && breadcrumbResource.getActiveWorkspace().resourceId) {
			currentWorkSpace = breadcrumbResource.getActiveWorkspace().resourceId;
		} else {
			currentWorkSpace = -1;
		}
		$location.path("/iftdssDataStudio/index.html\?containId="+currentWorkSpace+"&action=newLandscape");
	}
	
	$scope.refreshUserLandscapesFromServer = function() {
		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id,  landscapeResource.ScopeEnum.ALL).then(function(response){
				$scope.userLandscapes = response;
				if ($scope.selected_landscape) {
						for (i=0;i<$scope.userLandscapes.length;i++) {
							if ($scope.userLandscapes[i].landscapeId == $scope.selected_landscape.landscapeId) {
								$scope.selected_landscape = $scope.userLandscapes[i];
								// set the selected landscape as the one to use for the summary report.
								$scope.resource4Summary = $scope.selected_landscape;
							}
						}
				}
			},function(errorResponse) {
    			console.log(errorResponse);
    		});
	}
	
	
	$scope.refreshMasks = function() {
		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id, landscapeResource.ScopeEnum.ALL).then(function(response){
				$scope.userLandscapes = response;
				$scope.maskExist = false;
			},function(errorResponse) {
    			console.log(errorResponse);
    		});
	}
	
	$scope.getUserLandscapeList = function () {
		if ($rootScope.current_user_id) {
			$scope.loading_landscapes = true;
			landscapeResource.getUserLandscapes($rootScope.current_user_id, landscapeResource.ScopeEnum.ALL).then(function(response){
				if (response) {
					$scope.userLandscapes = response;
					$scope.loading_landscapes = false;
					if ($scope.selected_landscape) {
							for (i=0;i<$scope.userLandscapes.length;i++) {
								if ($scope.userLandscapes[i].landscapeId == $scope.selected_landscape) {
									$scope.selected_landscape = $scope.userLandscapes[i].complete;
									//$scope.setSummaryStatus($scope.selected_landscape, -1);
								}
							}
					}
				} else {
    				error_message = "Error loading landscape sources";
    				$scope.loading_landscapes = false;
    			}
    		},function(errorResponse) {
    			console.log(errorResponse);
    		});
		}
	}
	
	$scope.lcp_select = function(landscape) {
		$scope.selected_landscape = landscape;
		$scope.selected_mask = {};
		landscape.runId = -1;
		
		// Setup summary report settings
		$scope.resource4Summary = landscape;
		$scope.resource4Summary.mask = null;
		$scope.reportTypes = reportService.initializeReportResource( landscape, "summary");
		
		landscapeResource.getIntersectingShapes(landscape.landscapeId, $rootScope.current_user_id).then(function(response){
			if (response.data && response.data.length > 0) {
				$scope.userMasks = response.data;
			} else {
				$scope.userMasks = [];
				error_message = "Error generating list of intersecting shapes (Landscape masks)";
			}
			$scope.maskExist = false;
		});
	}
	
	$scope.mask_select = function(landscapeMask) {
		$scope.selected_mask = landscapeMask;
		$scope.maskExist = true;
		if ($scope.resource4Summary) {
			$scope.resource4Summary.mask = landscapeMask;
		}
		//$scope.setSummaryStatus($scope.selected_landscape, landscapeMask.shapeId);
	}
	

	$scope.clearMaskSelection = function() {
		$scope.selected_mask = null;
		$scope.maskExist = false;
		if ($scope.resource4Summary) {
			$scope.resource4Summary.mask = null;
		}
	}
	
	$scope.generateSummary = function() {
		reportService.getLandscapeSummary($scope.selected_landscape).then(function(response){
			if (response.data && response.data.length > 0 && response.status != 500) {
				$scope.userLandscapes = response.data;
			} else {
				error_message = "Error generating landscape summary statistics";
			}
		});
	}
	
	$scope.goToSummary = function() {
		var shapeId = $scope.selected_mask.shapeId;
		if (shapeId == null) {
			shapeId = -1;
		}
		$location.path("/report/summary/landscape/"+$scope.selected_landscape.landscapeId + "/shape/" +shapeId);
	}
	
	
	$scope.goToCompare = function() {
		landscapeEditService.getLandscapeRules($scope.selected_landscape.landscapeId).then(function(response){
		    if (response.data) {
		    	console.log(response.data);
		    	var rule = response.data[0].ruleFragments;
		    	var whereRuleStr = "";
		    	var modifyRuleStr = "";
		    	var compareOps = landscapeEditService.getCompareOps();
		    	var modifyOps = landscapeEditService.getModifyOps();
		    	var fuelLabels = landscapeEditService.getLandscapeAttributeValues();
		    	for (var i=0; i < rule.length; i++ ) {
		    		var attrKey = rule[i].attributeKey;
		    		if (rule[i].condition == true) {
		    			whereRuleStr += (fuelLabels[rule[i].attributeKey -1].attribName + " " + compareOps[rule[i].operator] + " " + rule[i].landscapeValue + ", ");
		    		}
		    		else {
		    			modifyRuleStr += (fuelLabels[rule[i].attributeKey -1].attribName + " " + modifyOps[ rule[i].operator] + " " + rule[i].landscapeValue + ", ");
		    		}
		    	}
		    	var ruleStr = "Where (" + whereRuleStr + ") modify (" + modifyRuleStr + ")";
		    	console.log(ruleStr);
		    	$location.path("/comparisonDashboard/" + $scope.selected_landscape.landscapeId);
		    } else {
		    	$location.path("/comparisonDashboard/" + $scope.selected_landscape.landscapeId);
		    }
	    });
		
	}
	$scope.goToMapStudio = function(runid) {
		$location.path("/iftdssDataStudio/?landscapeid="+$scope.selected_landscape.landscapeId);
	}
	
	$rootScope.$watch('landscapeCreatedFlag', function() { 	
		if ($rootScope.landscapeCreatedFlag) {
			if ($rootScope.createdLandscape) {
				$scope.selected_landscape = $rootScope.createdLandscape;
				$scope.createdLandscapeMessage = "Successfully submitted a request to create landscape: " + $rootScope.createdLandscape.resourceName;
				$scope.resource4Summary = $scope.selected_landscape;
				$scope.reportTypes = reportService.initializeReportResource( $scope.selected_landscape, "summary");
				$rootScope.createdLandscape = null;
			}
			$rootScope.landscapeCreatedFlag = false;
		}
	});
}