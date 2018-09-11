mainApp.controller("mapStudioController", ['$rootScope', '$scope', '$location', mapStudioController])

function mapStudioController($rootScope, $scope, $location) 
{
	$scope.frame_src = $location.path();

	
}