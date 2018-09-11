mainApp.controller("breadcrumbController", ['$rootScope','$scope','$location','$route','breadcrumbResource',breadcrumbController])

function breadcrumbController($rootScope, $scope, $location, $route, breadcrumbResource)
{
	$scope.getActiveWorkspace = function()  { return breadcrumbResource.getActiveWorkspace(); }
	$scope.navigateToWorkspaceView = function()  { breadcrumbResource.navigateToWorkspaceView(); }

	$scope.getActiveFolder = function()  { return breadcrumbResource.getActiveFolder(); }
	$scope.activeFolderExists = function()  { return breadcrumbResource.activeFolderExists(); }
	$scope.navigateToFolderView = function()  { breadcrumbResource.navigateToFolderView(); }

	$scope.getSubtopic = function()  { return breadcrumbResource.getSubtopic(); }
	$scope.getSubtopicName = function()  { return breadcrumbResource.getSubtopicName(); }
	$scope.subtopicExists = function()  { 
		var exists = breadcrumbResource.subtopicExists();
		return breadcrumbResource.subtopicExists(); }
	$scope.navigateToSubtopicView = function()  { 
		breadcrumbResource.navigateToSubtopicView(); 
		$scope.$digest;
	}
	
	$scope.getGuidance = function()  { return breadcrumbResource.getGuidance(); }
	$scope.getGuidanceName = function()  { return breadcrumbResource.getGuidanceName(); }
	$scope.guidanceExists = function()  { return breadcrumbResource.guidanceExists(); }
	$scope.navigateToGuidanceView = function()  { breadcrumbResource.navigateToGuidanceView(); }

	$scope.getLeafView = function()  { return breadcrumbResource.getLeafView(); }
	$scope.getLeafViewName = function()  { return breadcrumbResource.getLeafViewName(); }
	$scope.leafViewExists = function()  { return breadcrumbResource.leafViewExists(); }
	$scope.navigateToLeafView = function()  { breadcrumbResource.navigateToLeafView(); }
	
	$scope.displayingSplitMap = function() {
		if ($rootScope.splitMapOpen)  return true;
		return false;
	}
	
	breadcrumbResource.getHelpContent();
}

mainApp.directive("breadcrumbDirective",function() {
	var dirConfig = {
		templateUrl: "pages/common/breadcrumb.html",
		controller: "breadcrumbController"
	};
	return dirConfig;
});