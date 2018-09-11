mainApp.controller("editLandscapeController", ["$scope", '$rootScope','$routeParams','$timeout','$location','$filter','$route','$window',"landscapeResource","breadcrumbResource","landscapeEditService", editLandscapeController])

function editLandscapeController($scope,$rootScope,$routeParams,$timeout,$location,$filter,$route,$window,landscapeResource,breadcrumbResource,landscapeEditService) 
{	
	$scope.editWithMap = false;
	$rootScope.splitMapOpen = false;
	$scope.hoverContext = "general";
	
	$scope.selectedLandscapeForRulesDialog = null;
	$scope.selectedLandscapeChangedFlag = 0;
	
	
	$scope.init = function() {
		console.log("Initializing editLandscapeController");
	}
	
	$scope.displayingSplitMap = function() {
		if ($rootScope.splitMapOpen)  return true;
		return false;
	}
	
	$scope.toggleMap = function() 
	{
		if ($scope.editWithMap === true) {
			$scope.editWithMap = false;
			$rootScope.splitMapOpen = false;
			$scope.hoverContext = 'general';
			setStyle('display','mapStudioIframeDiv','none');	
			setStyle('width','editLandscapeControllerDiv','60%');
			if($window.document.getElementById("editLandscapeControllerDiv")) {
				$window.document.getElementById("editLandscapeControllerDiv").setAttribute('class','angular-view');
			}
		} else {
			$scope.editWithMap = true;
			$rootScope.splitMapOpen = true;
			$scope.hoverContext = 'none';
			setStyle('display','mapStudioIframeDiv','block');
			setStyle('width','editLandscapeControllerDiv','40%');
			if($window.document.getElementById("editLandscapeControllerDiv")) {
				$window.document.getElementById("editLandscapeControllerDiv").setAttribute('class','angular-view-map');
			}
			//$window.document.getElementById("mapStudioIframe").contentWindow.location.reload()  //reload iframe content
			if(!$window.document.getElementById("mapStudioIframe")) {
				if ($scope.selected_landscape){
					iframeInfo = "<iframe id='mapStudioIframe' width='100%' height='100%' frameborder='5' scrolling='no' marginheight='0' marginwidth='0' style='min-width:200px; min-height:200px' src='/iftdssDataStudio/?landscapeid="+$scope.selected_landscape.landscapeId+"'>";					
				}else{
					iframeInfo = "<iframe id='mapStudioIframe' width='100%' height='100%' frameborder='5' scrolling='no' marginheight='0' marginwidth='0' style='min-width:200px; min-height:200px' src='/iftdssDataStudio/'>";
				}
				$("#mapStudioIframeDiv").append(iframeInfo);
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
		 }
	 }
}
	