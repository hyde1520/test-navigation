mainApp.controller("cycleMainController",["$scope","$location", "$routeParams","$rootScope","$window","breadcrumbResource","propertiesService","cycleGuidenceResource","ftemPrivilegesService",cycleMainController])

function cycleMainController ($scope, $location, $routeParams, $rootScope, $window, breadcrumbResource, propertiesService, cycleGuidenceResource, ftemPrivilegesService)
{
	$scope.selected_component = '';
	$scope.hover_info = false;
	$scope.revealFtem = true;
	
	propertiesService.getProperty("revealFtem","iftdss", $rootScope.current_user_id).then(
		function(response) {
			if (response && response.data && response.data.value) {
				if (response.data.value == "false")  $scope.revealFtem = false;
			}
		},
		function(errorResponse) { 
			console.log("Error getting revealFtem property: " + errorResponse.data);
		}
	);

	if ($routeParams.topic) {
		var subTopicName = cycleGuidenceResource.getCycleComponentName($routeParams.topic);
		breadcrumbResource.setSubtopic(subTopicName, "/cycle/" + $routeParams.topic);
		$scope.selected_component = $routeParams.topic;
	}

	$scope.changeComponent = function(name) {
		var subTopicName = cycleGuidenceResource.getCycleComponentName(name);
		breadcrumbResource.setSubtopic(subTopicName, "/cycle/" + name);
		$scope.selected_component = name;
		$scope.hover_info = false;
	}
	
	
	$scope.openFtem = function(newTab) {
		if (!$scope.revealFtem)  return;
		ftemPrivilegesService.hasFtemViewerAccess($rootScope.current_user_id).
			then(function(response){
				if (response != null && typeof(response) != "undefined" && response === true) {
					if (newTab == true) {
						$window.open("/ftem/#/ftem", '_blank');
					}
					else {
						$window.open("/ftem/#/ftem", '_self');
					}
				}
				else {
					$window.open("/ftem/#/ftemAccess", '_self');
				}
				
				return;
			},function(errorResponse){
			$scope.handleErrorResponse(response);
				$scope.gotStatus = true;
				return;
			});
		// TODO Check if user is allowed access to FTEM
		
	}
}
