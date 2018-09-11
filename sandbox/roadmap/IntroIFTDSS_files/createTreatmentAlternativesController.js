mainApp.controller("createTreatmentAlternativesController", ["$scope", '$rootScope','$routeParams','$timeout','$location','$filter','$route','$window',"landscapeResource","breadcrumbResource","landscapeEditService","modelValidationFactory","modelInputService","iftdssMapStudioMessages",createTreatmentAlternativesController])

function createTreatmentAlternativesController($scope,$rootScope,$routeParams,$timeout,$location,$filter,$route,$window,landscapeResource,breadcrumbResource,landscapeEditService,modelValidationFactory,modelInputService,iftdssMapStudioMessages) 
{	
	$rootScope.splitMapMode = true;
	$scope.fullMapMode = false;
	$scope.editWithMap = false;
	$rootScope.splitMapOpen = false;
	$scope.hoverContext = "general";
	$scope.selectedZeroLandscape = null;
	$scope.selectedAOI = null;
	$scope.selectedZeroLandscapeName = null;
	$scope.familyLandscapeList = null;
	$scope.familyLandscapeListRetrievedFlag = 0;
	$scope.familyHasMoreThanOneLandscape = false;
	$scope.addedLandscapeToFamilyFlag = 0;
	$scope.selectedFamilyLandscape = null;
	$scope.modelInput = null;  // old input format
	$scope.allInputsReadyFlag = false;
	
	$scope.modelInputsRetrievedFlag = 0;
	$scope.modelRunsRetrievedFlag = 0;
	$scope.userSavedModelInput = 0;
	
	$scope.selectedTabId = 'home-tab';
	
	$scope.selectedLandscapeForRulesDialog = null;
	$scope.selectedLandscapeChangedFlag = 0;
	
	
	// Throttle back too many requests for data
	$scope.modelInputsRequestInProcess = false;
	
	//subscribe to listen to map studio messages
	iftdssMapStudioMessages.subscribe();
	
	
	// We always want to refresh the list of zero landscapes when we enter this page
	landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id, landscapeResource.ScopeEnum.ZEROES).then(
		function(response) {
			console.log("Zero landscapes refreshed for Compare Treatment Alternatives.");	
		},
		function(errorResponse) {
			console.log("Error refreshing zero landscapes for Compare Treatment Alternatives.");
		});
	
	window.scrollTo(0,0);
	
	$timeout(function() { window.scrollTo(0,0); }, 1000); // scroll to top in case the page started lower
	
	$scope.setSelectedZeroLandscapeName = function() {
		if ($scope.selectedZeroLandscape) {
			if ($scope.selectedZeroLandscape.resourceName.length > 20) {
				$scope.selectedZeroLandscapeName = $scope.selectedZeroLandscape.resourceName.substring(1,17) + "...";
			} else {
				$scope.selectedZeroLandscapeName = $scope.selectedZeroLandscape.resourceName;
			}
			$scope.$digest;
		} else {
			$scope.selectedZeroLandscapeName = "(error)";
		}
	}

	// Get selected area of interest from 1st tab
	$scope.getSelectedAOI = function() {
		if (!selectedAOI) {
			selectedAOI = $scope.$parent.selectedAOI;
		}
		if (typeof(selectedAOI)== 'undefined') {
			selectedAOI = null;
		}
		return selectedAOI;
	}
	
	// Split Map functions
	$scope.displayingSplitMap = function() {
		if ($rootScope.splitMapOpen)  return true;
		return false;
	}
	
	// Full Map functions
	$scope.displayingFullMap = function() {
		if ($scope.fullMapMode)  return true;
		return false;
	}
	
	$scope.getSelectedLcpForMap = function() {
		if ($scope.selectedFamilyLandscape) {
			return $scope.selectedFamilyLandscape;
		} else if ($scope.selectedZeroLandscape) {
			return $scope.selectedZeroLandscape;
		} 
	}
	
	$scope.noLcpSelected = function() {
		var selectedLcp = $scope.getSelectedLcpForMap();
		if (selectedLcp)  return false;
		return true;
	}
	
	$scope.fullMap = function() 
	{
		if ($scope.fullMapMode === true){
			$scope.fullMapMode = false;
			//setStyle('innerHTML','spanFullView','Split View');
			setStyle('right','fullMap','40%');
			setStyle('right','mapStudioDiv','40%');
			setStyle('display','createTreatmentAlternativesControllerDiv','block');
		}else{
			$scope.fullMapMode = true;
			//setStyle('innerHTML','spanFullView','Split View');
			setStyle('display','createTreatmentAlternativesControllerDiv','none');
			setStyle('right','fullMap','0%');
			setStyle('right','mapStudioDiv','0%');
		}
		
		//setStyle('width','createTreatmentAlternativesControllerDiv','40%');
	}
	
	$rootScope.postMessageToMapStudio = function(message) 
	{
		var iframe = $window.document.getElementById("mapStudioIframe");
		if(iframe) {
			var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
			var iframeLoaded = innerDoc.getElementById("map_load_complete");	
			if (iframeLoaded){
				iframe.contentWindow.postMessage(message, '*');	
			}
//			var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
//			var iframeLoaded = innerDoc.getElementById("map_load_complete");	
//			if (iframeLoaded){
//				iframe.contentWindow.postMessage(message, '*');	
//			}else{
//				//wait 4 seconds twice for map to load...if still is not loaded
//				//display warning message
//				setTimeout(function(){
//					innerDoc = iframe.contentDocument || iframe.contentWindow.document;
//					iframeLoaded = innerDoc.getElementById("map_load_complete");
//					if (iframeLoaded){
//						iframe.contentWindow.postMessage(message, '*');	
//					}else{
//						setTimeout(function(){
//							innerDoc = iframe.contentDocument || iframe.contentWindow.document;
//							iframeLoaded = innerDoc.getElementById("map_load_complete");
//							if (iframeLoaded){
//								iframe.contentWindow.postMessage(message, '*');	
//							}else{
//								//alert("Wait until the map loads and resummit the request.");
//								$rootScope.displayMessage($scope, $timeout, "warning", "Wait until the map loads and then resubmit the request.",4000);
//							}
//						},4000);
//					}
//				}, 5000);
//			}			
		}
	}
	
	$rootScope.toggleMap = function(message) 
	{
		
		if ($scope.editWithMap === true){
			$scope.editWithMap = false;
			$rootScope.splitMapOpen = false;
			setStyle('display','mapStudioIframeDiv','none');	
			setStyle('width','createTreatmentAlternativesControllerDiv','60%');
			if($window.document.getElementById("createTreatmentAlternativesControllerDiv")) {
				$window.document.getElementById("createTreatmentAlternativesControllerDiv").setAttribute('class','angular-view');
			}
		} else {
			$scope.editWithMap = true;
			$rootScope.splitMapOpen = true;
			setStyle('display','mapStudioIframeDiv','block');
			setStyle('width','createTreatmentAlternativesControllerDiv','40%');
			if($window.document.getElementById("createTreatmentAlternativesControllerDiv")) {
				$window.document.getElementById("createTreatmentAlternativesControllerDiv").setAttribute('class','angular-view-map');
			}
			if(!$window.document.getElementById("mapStudioIframe")) {
				var iframeInfo ="";
				if ($scope.noLcpSelected()){
					if (message){
						iframeInfo = "<iframe id='mapStudioIframe' style='min-width:200px; min-height:200px; max-width: 100%; max-height: 100%; top: 0px; left: 0px; width: 100%; height: 100%;' src='/iftdssDataStudio/?"+message+"'>";
					}else{
						iframeInfo = "<iframe id='mapStudioIframe' style='min-width:200px; min-height:200px; max-width: 100%; max-height: 100%; top: 0px; left: 0px; width: 100%; height: 100%;' src='/iftdssDataStudio/'>";
					}
				}else{
					if (message){
						iframeInfo = "<iframe id='mapStudioIframe' style='min-width:200px; min-height:200px; max-width: 100%; max-height: 100%; top: 0px; left: 0px; width: 100%; height: 100%;' src='/iftdssDataStudio/?"+message+"'>";
					}else{
						iframeInfo = "<iframe id='mapStudioIframe' style='min-width:200px; min-height:200px; max-width: 100%; max-height: 100%; top: 0px; left: 0px; width: 100%; height: 100%;' src='/iftdssDataStudio/?landscapeid="+$scope.getSelectedLcpForMap().landscapeId+"'>";
					}
					
				}
				
				$("#mapStudioIframeDiv").append(iframeInfo);
			}else{
				if (!$scope.noLcpSelected()){
					$rootScope.postMessageToMapStudio('addlandscapeid='+JSON.stringify($scope.getSelectedLcpForMap()));
				}else{
					$rootScope.postMessageToMapStudio('zoomToCONUS');
				}			
			}
		}	
	}
	
	function setStyle(styleName, elementId, styleVal) {
		 var element = $window.document.getElementById(elementId);
		 if (element && element.style) {
			 if (styleName == 'display'){
				 element.style.display = styleVal;
			 }
			 if (styleName == 'width'){
				 element.style.width = styleVal;
			 }
			 if (styleName == 'right'){
				 element.style.right = styleVal;
			 }
			 if (styleName == 'innerHTML'){
				 element.innerHTML = styleVal;
			 }
		 }
	 }
	
	/** Retrieve the one model input shared by the zero landscap's family of landscapes. */
	$scope.retrieveModelInputForZeroLandscape = function(zeroLandscape) 
	{
		if ($scope.modelInputsRequestInProcess) return;
		$scope.modelInputsRequestInProcess = true;	
		modelInputService.getModelInput(zeroLandscape.landscapeId).then(
			function(response) {
				if (response) {	
					var inputResourceId = response.resourceId;
					var modelInputBO = response;
					$scope.modelInput = modelInputBO.asInputObject(zeroLandscape);
					console.log("Model Input retreived for Compare Treatment Alternatives.");
					if ($scope.modelInput && $scope.modelInput.resourceDef) {
						$scope.modelInput.resourceDef.zeroLandscapeId = $scope.selectedZeroLandscape.landscapeId;
						$scope.modelInput.resourceDef.containId = $scope.selectedZeroLandscape.parentId; 
						$scope.modelInput.resourceDef.name = $scope.selectedZeroLandscape.resourceName + " " + $scope.modelInput.resourceDef.modelType + " Input";
					}
					$scope.modelInputsRetrievedFlag++;  // increment so flag is now true and a watch event is propagated
					$scope.modelInputsRequestInProcess = false;
					
				} else {
					console.log("Error retrieving model input for Develop Treatment Alternatives.");
				}
			},
			function(errorResponse) {	
				var errMsg = "Error retrieving model input record:  ";
				if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
					errMsg += errorResponse.data.responseMessage;
				}
				console.log(errMsg);
				$scope.modelInputsRequestInProcess = false;
			});
	}
	
	angular.element(document).ready(function () {
		console.log("createTreatmentAlternatives page loading complete");
	});
	
	// When a model input is saved by the user then retrieve it to get latest from DB 
	$scope.$watch('userSavedModelInput', function() {
		if ($scope.userSavedModelInput) {
			$scope.retrieveModelInputForZeroLandscape($scope.selectedZeroLandscape);
		}
	});
	
	$scope.$watch('familyLandscapeListRetrievedFlag', function() {
		// Figure this out for the check-mark on the Edit Landscape tab
		if ($scope.familyLandscapeListRetrievedFlag) {
			if ($scope.familyLandscapeList && $scope.familyLandscapeList.length > 1) {
				$scope.familyHasMoreThanOneLandscape = true;
			} else {
				$scope.familyHasMoreThanOneLandscape = false;
			}
		}
	});
	
	$rootScope.$watch('selectedZeroLandscapeFlag', function() 
	{ 	
		if ($rootScope.selectedZeroLandscapeFlag) {
			$scope.selectedZeroLandscape = landscapeResource.getSelectedZeroLandscape();
			$scope.setSelectedZeroLandscapeName();

			// When a new zero landscape is selected that means we are in a new landscape family
			$rootScope.selectedFamilyLandscapeFlag = false;
			$scope.selectedFamilyLandscape = null;
			
			$scope.modelInput = modelInputService.getDefaultNewRunInput(); // reset to new input
			$scope.retrieveModelInputForZeroLandscape($scope.selectedZeroLandscape);
			
			
		}
	});
}
	