mainApp.directive('landscapeSelectPanelDirective',function(){
	return {
		templateUrl: "pages/landscape/landscapeSelectPanel_partial.html",
		scope: {validation:'<',
			    selected_landscape: '=input',
			    zeroLandscapesOnly: '@zeroOnly',
			    selectedAOI: '=aoi',   // area of interest
			    showAOI: '=showaoi',
			    familyLandscapesOnly: '@familyOnly'
			   },
		controller: "landscapeSelectController"
	}
}).controller('landscapeSelectController',["$scope","$window","$filter","$rootScope","$location", "workspaceResource","breadcrumbResource","landscapeResource","reportService","propertiesService",
  function($scope,$window,$filter,$rootScope,$location,workspaceResource,breadcrumbResource,landscapeResource,reportService,propertiesService){
	//$scope.panelCompleteClass = "panel-default";
	$scope.panelCompleteClass = "";
	$scope.landscape = {creating_new_landscape: false};
	$scope.zeroOnly = false;
	$scope.familyOnly = false;
	$scope.userLandscapes = null;
	$scope.intersecting_AOIs = [];
	$scope.maskExist = false;
	//$scope.userZeroLandscapes = null;
	$scope.landscapeScopeEnum = landscapeResource.ScopeEnum.ALL;
	$scope.addedNewResourceFlag = 0;
	
	$rootScope.selectedZeroLandscapeFlag = 0;
	
	
	if (typeof $scope.zeroLandscapesOnly == "undefined") {
		console.log("zeroLandscapesOnly is undefined")
	} else if ($scope.zeroLandscapesOnly == null) {
		console.log("zerLandscapeOnly: null");
	} else if ($scope.zeroLandscapesOnly == "true") {
		console.log("zeroLandscapesOnly: true");
		$scope.zeroOnly = true;
		$scope.landscapeScopeEnum = landscapeResource.ScopeEnum.ZEROES;
	} else {
		console.log("zeroLandscapesOnly: false");
	}
	
	if (typeof $scope.familyLandscapesOnly != "undefined" && $scope.familyLandscapesOnly != null && $scope.familyLandscapesOnly == "true") {
		$scope.familyOnly = true;
		$scope.landscapeScopeEnum = landscapeResource.ScopeEnum.FAMILY;
	}
	
	$scope.validateInputs = function() {
		if ($scope.selected_landscape && $scope.selected_landscape.landscapeId) {
			$scope.panelCompleteClass = "guidance-success";
			//$scope.validation();
		} else {
			$scope.panelCompleteClass = "";
		}
	}
	
	$scope.createdLandscapeMessage = null;
	
	landscapeResource.getUserLandscapes($rootScope.current_user_id, $scope.landscapeScopeEnum).then(
		function(response) {
			$scope.userLandscapes = response;
		},
		function(errorResponse){
			console.log("Error retrieving landscapes: " + errorResponse);
		}
	);
	
	
	/** @return  the list of landscapes, either all or just the zero landscapes */
	$scope.getLandscapes = function() {
//		if ($scope.zeroOnly) {
//			return $scope.userZeroLandscapes;
//		} else {
			return $scope.userLandscapes;
//		}
	}
	
	$scope.directive_action= {creating_new_landscape:false};
	
	$scope.isLandscapeNotSelected = function() {
		if ((typeof($scope.selected_landscape) == 'undefined') ||
			($scope.selected_landscape == null) ||
			($scope.selected_landscape.landscapeId == null) ||
			($scope.selected_landscape.landscapeId  < 0))  return true;
		return false;
	}
	
	$scope.displayingSplitMap = function() {
		if ($rootScope.splitMapOpen)  return true;
		return false;
	}
	
	$scope.displayingNewLandscapeInSplitMapButton = function() {
		if ($rootScope.splitMapOpen)  return true;
		if ($rootScope.splitMapMode && (($rootScope.current_user_id != 'vince') && ($rootScope.current_user_id != 'nina'))) return true;  //TEMPORARY CHANGE SO I CAN CREATE LANDSCAPES LOCALLY AND DEBUG!!!
		return false;
	}
	
	$scope.displayFullScreenCreateLcpButtons = function() 
	{
		if ($rootScope.splitMapOpen)  return false;
		if ($scope.directive_action.creating_new_landscape)  return false;
		return true;
	}
	
	$scope.displaySplitScreenCreateLcpButtons = function()  
	{
		if ($rootScope.splitMapOpen)  return true;
		if ($scope.directive_action.creating_new_landscape)  return false;
		return true;
	}
	
	$scope.createNewLandscape = function(){
		$scope.directive_action.creating_new_landscape = true;
		if($window.document.getElementById("landscapeBoundsMap")) {
    	  $window.document.getElementById("landscapeBoundsMap").remove();
		}
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
		$location.path("/iftdssDataStudio/?containId="+currentWorkSpace+"&action=newLandscape");
	}
	
	$scope.createNewLandscapeOnSplitMap = function() 
	{
		if (!$rootScope.splitMapOpen)
		{
			$rootScope.toggleMap('newlandscape');
		}
		$rootScope.postMessageToMapStudio('newlandscape');
	}
	
	$scope.refreshUserLandscapesFromServer = function() {
		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id, $scope.landscapeScopeEnum).then(
			function(response){
				$scope.userLandscapes = response; 
				if ($scope.selected_landscape) {
					for (i=0;i<$scope.userLandscapes.length;i++) {
						if ($scope.userLandscapes[i].landscapeId == $scope.selected_landscape.landscapeId) {
							$scope.selected_landscape = $scope.userLandscapes[i];
							$scope.resource4Summary = $scope.selected_landscape;
							$scope.reportTypes = reportService.initializeReportResource( $scope.selected_landscape, "summary");
								
							break;
						}
					}
				}
			},
			function(errorResponse) {
    			console.log(errorResponse);
    		}
		);
	}
	
	$scope.refreshMasks = function(landscapeId) {
		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id, landscapeResource.ScopeEnum.ALL).then(function(response){
				$scope.userLandscapes = response;
				$scope.maskExist = false;
				landscapeResource.getIntersectingShapes(landscapeId, $rootScope.current_user_id).then(function(response){
					if (response.data && response.data.length > 0) {
						$scope.intersecting_AOIs = response.data;
					} else {
						$scope.intersecting_AOIs = [];
						error_message = "Error generating list of intersecting areas of interest";
					}
				});
			},function(errorResponse) {
    			console.log(errorResponse);
    		});
	}
	
	// Set AOI (area of interest)
	$scope.mask_select = function(landscapeMask) {
		$scope.selectedAOI= landscapeMask;
		$scope.maskExist = true;
		if ($scope.resource4Summary) {
			$scope.resource4Summary.mask = landscapeMask;
		}
		if($window.document.getElementById("mapStudioIframe")) {
			if (landscapeMask && landscapeMask.shapeOrShapefileId){
				if (landscapeMask.resourceType === 'shpf'){
					$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('shapefile='+JSON.stringify(landscapeMask), '*');					
				}
				if (landscapeMask.resourceType === 'shp_'){
					$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('shapeid='+landscapeMask.shapeOrShapefileId, '*');
					
				}
			}
		}
	}
	
	$scope.clearMaskSelection = function() {
		$scope.selectedAOI = null;
		$scope.maskExist = false;
		if ($scope.resource4Summary) {
			$scope.resource4Summary.mask = null;
		}
	}
	
	
	$scope.getUserLandscapeList = function () {
		if ($rootScope.current_user_id) {
			$scope.loading_landscapes = true;
			landscapeResource.getUserLandscapes($rootScope.current_user_id, $scope.landscapeScopeEnum).then(function(response){
				if (response) {
					$scope.userLandscapes = response;
					$scope.loading_landscapes = false;
					if ($scope.selected_landscape) {
							for (i=0;i<$scope.userLandscapes.length;i++) {
								if ($scope.userLandscapes[i].landscapeId == $scope.selected_landscape) {
									$scope.selected_landscape = $scope.userLandscapes[i].complete;
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
		
		// Initialize values for reports. Used in report directives.
		$scope.resource4Summary = landscape;
		$scope.reportTypes = reportService.initializeReportResource( landscape, "landscapeDir");
		
		if ($scope.zeroOnly) { 
			$rootScope.selectedZeroLandscapeFlag++;
			landscapeResource.setSelectedZeroLandscape(landscape);
		}
		
		$scope.validateInputs();
		//replace lcp on split map
		if ( $rootScope.splitMapOpen) {
			if ($scope.zeroOnly || !$rootScope.splitMapOpen) { 
				//replace what's on map
				$rootScope.postMessageToMapStudio('newlandscapeid='+JSON.stringify($scope.selected_landscape));
			}else{
				//just add to map
				$rootScope.postMessageToMapStudio('addlandscapeid='+JSON.stringify($scope.selected_landscape));
			}
		}
		else if($window.document.getElementById("mapStudioIframe")) {
			$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('newlandscapeid='+JSON.stringify($scope.selected_landscape), '*');
		}
		
		landscapeResource.getIntersectingShapes(landscape.landscapeId, $rootScope.current_user_id).then(function(response){
			if (response.data && response.data.length > 0) {
				$scope.intersecting_AOIs = response.data;
			} else {
				$scope.intersecting_AOIs = [];
				error_message = "Error generating list of intersecting shapes (Landscape masks)";
			}
		});
	}
	
	$scope.generateSummary = function() {
		reportService.getLandscapeSummary($scope.selected_landscape).then(function(response){
			if (response.data && response.data.length > 0 && response.status != 500) {
				$scope.userLandscapes = response.data;
			} else {
				error_message = "Error generating landscape summary statistics";
			}
		})
	}
	
	$scope.goToSummary = function() {
		var new_path = "/report/summary/landscape/"+$scope.selected_landscape.landscapeId;
		$scope.openInNewTab(new_path);
		//$location.path("/report/summary/landscape/"+$scope.selected_landscape.landscapeId)
	}
	$scope.openInNewTab = function(new_path) {
		$window.open($location.$$absUrl.replace($location.$$path,new_path), '_iftdssRpt'); // in new tab
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
		if (!$rootScope.splitMapMode){
			$location.path("/iftdssDataStudio/?landscapeid="+$scope.selected_landscape.landscapeId);
		}else{
			if (!$rootScope.splitMapOpen)
			{
				$rootScope.toggleMap('addlandscapeid='+JSON.stringify($scope.selected_landscape));
			}
			if($window.document.getElementById("mapStudioIframe")) {
				$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('addlandscapeid='+JSON.stringify($scope.selected_landscape), '*');
			}
		}	
	}
	

	$rootScope.$on('shape-create-completed', function(event, data) {
		if ($scope.selected_landscape) {
			$scope.refreshMasks($scope.selected_landscape.landscapeId);
		}
		//$scope.displayWarning = true;
		//$scope.warningMessage = "Your new shape was created. If it intersects with your selected landcape, refresh the Area of Interest list to see it in the list."
		//console.log("Received shape created msg from map studio");
		//if (data) {
			//$scope.mapExtent.fillFrom(data);
			//$scope.$broadcast('shapeCreated', $scope.mapExtent);
		//}
	});
	
	$rootScope.$watch('landscapeCreatedFlag', function() { 	
		if ($rootScope.landscapeCreatedFlag) {
			if ($rootScope.createdLandscape) {
				$scope.selected_landscape = $rootScope.createdLandscape;
				$scope.createdLandscapeMessage = "Successfully submitted a request to create landscape: " + $rootScope.createdLandscape.resourceName;
				$rootScope.createdLandscape = null;
			}
			$rootScope.landscapeCreatedFlag = false;
		}
	});
	
}])