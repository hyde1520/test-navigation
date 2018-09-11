mainApp.controller("comparisonTaskController",["$scope","$rootScope","$location","$window", "$routeParams", "breadcrumbResource","cycleGuidenceResource","landscapeResource","landscapeEditService", "reportService", comparisonTaskController])

function comparisonTaskController($scope,$rootScope,$location,$window,$routeParams,breadcrumbResource,cycleGuidenceResource,landscapeResource, landscapeEditService, reportService) {
	
	$scope.dialog = cycleGuidenceResource.getGuidenceDialog($routeParams.task);
	$scope.resources = cycleGuidenceResource.getRequiredResources($routeParams.task);
	$scope.selected_landscape = {};
	$scope.createdLandscapeMessage = null;
	$scope.scoped_landscapes = [];
	$scope.include_page = "";
	$scope.summaryData = {};
	$scope.selected_model = {};
	
	$scope.lcp_selected = function() {
		$scope.selected_sublandscape = $scope.selected_landscape;
		landscapeResource.getRelatedLandscapes($scope.selected_landscape.landscapeId).then(function(response){
			$scope.scoped_landscapes = response;
		});
	}
	
	$scope.view_summary = function(){
		$scope.include_page = "landscape_summary"
		$scope.summaryData = reportService.getSummary($scope.selected_landscape.landscapeId);
	}
	
	$scope.view_model = function(){
		$scope.include_page = "model"
		$scope.selected_model = {}
	}
	
	$scope.view_edit = function(){
		$scope.include_page = "landscape_edit"
	}
	
}