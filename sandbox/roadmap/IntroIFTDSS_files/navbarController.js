mainApp.controller("navbarController", ['$rootScope','$scope', '$timeout', '$location','$window','$route','userResource','workspaceResource','breadcrumbResource','persistanceUserService','propertiesService','ftemPrivilegesService','mapStudioMessages',navbarController])

function navbarController($rootScope, $scope, $timeout, $location, $window, $route, userResource, workspaceResource, breadcrumbResource, persistanceUserService, propertiesService, ftemPrivilegesService, mapStudioMessages)
{
	$scope.revealFtem = true;
	$scope.revealGeoBot = false;
	$scope.logOutDetectionOn = true;
	$scope.system = "default";
	
	//subscribe to listen to map studio messages
	mapStudioMessages.subscribe();
	
	
	$scope.getNavBarStyle = function(){
		//check local, prod or qa
		prodColor = "#2E3E4F";
		localColor = "#0E4D92";
		qaColor = "#0B6623";
		color = prodColor;
		if ($scope.system == "qa"){
			color = qaColor;
		}
		if ($scope.system == "local"){
			color = localColor;
		}
		style = {
			"background-color" : color,
			"color": "white"
		}
		return style;
	}
	
	if (!$rootScope.current_user_id) {
		$rootScope.current_user_id = persistanceUserService.getLoggedInUser();
		$rootScope.current_user_role = persistanceUserService.getLoggedInUserRole();
	}
	
	propertiesService.getProperty("revealFtem", "iftdss", $rootScope.current_user_id).then(
		function(response) {
			if (response && response.data && response.data.value) {
				if (response.data.value == "false")  $scope.revealFtem = false;
			}
		},
		function(errorResponse) { 
			console.log("Error getting revealFtem property: " + errorResponse.data);
		}
	);
	
	propertiesService.getProperty("revealGeoBot", "iftdss", $rootScope.current_user_id).then(
			function(response) {
				if (response && response.data && response.data.value) {
					if (response.data.value == "true")  $scope.revealGeoBot = true;
				}
			},
			function(errorResponse) { 
				console.log("Error getting revealGeoBot property: " + errorResponse.data);
			}
		);
	
	propertiesService.getProperty("system", "iftdss").then(
			function(response) {
				if (response && response.data && response.data.value) {
					 $scope.system = response.data.value;
				}
			},
			function(errorResponse) { 
				console.log("Error getting system property: " + errorResponse.data);
			}
		);
	
	propertiesService.getProperty("logoutDetectionOn", "iftdss").then(
			function(response) {
				if (response && response.data && response.data.value) {
					if (response.data.value == "false")  $scope.logOutDetectionOn = false;
				}
			},
			function(errorResponse) { 
				console.log("Error getting logOutDetectionOn property: " + errorResponse.data);
			}
		);

	
	//allowing a new tab to the user is logged in
	//transfers sessionStorage from one tab to another
	var sessionStorage_transfer = function(event) {
	  if(!event) { event = $window.event; } // ie suq
	  if(!event.newValue) return;          // do nothing if no value to work with
	  if (event.key == 'getIFTDSSSessionStorage') {
	    // another tab asked for the sessionStorage -> send it
	    localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
	    // the other tab should now have it, so we're done with it.
	    localStorage.removeItem('sessionStorage'); // <- could do short timeout as well.
	  } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
	    // another tab sent data <- get it
	    var data = JSON.parse(event.newValue);
	    for (var key in data) {
	      sessionStorage.setItem(key, data[key]);
	    }
	  }
	}

	// listen for changes to localStorage
	if($window.addEventListener) {
		$window.addEventListener("storage", sessionStorage_transfer, false);
	} else {
		$window.attachEvent("onstorage", sessionStorage_transfer);
	};

	
	$timeout(function(){
	if (!$rootScope.current_user_id && $location.path() != "/landing_page") {
		$rootScope.current_user_id = persistanceUserService.getLoggedInUser();
		$rootScope.current_user_role = persistanceUserService.getLoggedInUserRole();
		var path = $location.path();
		var lastIndex = path.lastIndexOf("/");
		if (lastIndex > 0)
		{
			path = path.substring(0, lastIndex);
		}
		if (!sessionStorage.length || !$rootScope.current_user_id) {
			if ((path != "/login") && (path != "/signup") && (path != "/acceptRoB") && (path != "/resetPassword") &&
				(path != "/changePasswordExpired") && (path != "/changePasswordReset") && (path != "/404_page")){
			// Removed .. causing problems going to summary page
				// where current_user_id not set... removed until we fully
				// implement timeout
				//$location.path("/landing_page") 
			}
		} else if ($rootScope.current_user_id) {
			$rootScope.$digest(); //reloads navbar
			$route.reload(); //reloads rest of page
		}
	}},100)
	//stop checking for logged in user
	
	// Retrieve workspaces for the navbar scope
	$scope.retrieveWorkspaces = function(userId) {
		$scope.workspaces = [];
		if (!$rootScope.activeWorkspace) {
			$rootScope.activeWorkspace = {resourceName:''};
			breadcrumbResource.setActiveWorkspace({resourceName:''});
		}
		workspaceResource.getUserWorkspaces(userId).then(function(response) {
			if (response.data) {
				$scope.workspaces = response.data;
				for (len = $scope.workspaces.length, i=0; i<len; ++i) {
					if ($scope.workspaces[i] && $scope.workspaces[i].resourceScope == 'per') {
						$rootScope.activeWorkspace = $scope.workspaces[i]; 
						breadcrumbResource.setActiveWorkspace($scope.workspaces[i]);
						$scope.activeWorkspaceName = $rootScope.activeWorkspace.resourceName;
					}
				}
			} else {
				console.log("Error loading workspaces for user");
				$scope.showSessionNotValidDialog();
			}
		});	
	}
	
	// Determine if a navbar element should have the active class or not
	$scope.isActive = function (viewLocation1, viewLocation2) 
	{
		if (viewLocation1 && viewLocation1 == $location.path()) {
			return true;
		} else if (viewLocation2 && viewLocation2 == $location.path()) {
			return true;
		} else if (viewLocation1 && $location.path().includes(viewLocation1)) {
			if ($location.path().includes('/topic/landscape_eval/task/summary')) return false;  //patch for old routing
			return true;
		} else if (viewLocation2 && $location.path().includes(viewLocation2)) {
			return true;
		}
		return false;
	};

	$scope.userIsAdmin = function() {
		if ($rootScope.current_user_role == 'admn') {
			return true;
		}
		return false;
	}
	
	$scope.workspace_select = function(workspaceId) {
		for (len = $scope.workspaces.length, i=0; i<len; ++i) {
			if ($scope.workspaces[i] && $scope.workspaces[i].resourceId == workspaceId) {
				$rootScope.activeWorkspace = $scope.workspaces[i];
				breadcrumbResource.setActiveWorkspace($scope.workspaces[i]);
				$scope.activeWorkspaceName = $rootScope.activeWorkspace.resourceName;
			}
		}
		
		$location.path('/workspace/' + workspaceId);
	}
	
	$scope.openFtem = function(newTab) {
		if (!$scope.revealFtem)  return;
		userResource.updateSession($rootScope.current_user_id).
			then(function(response) {
				ftemPrivilegesService.hasFtemViewerAccess($rootScope.current_user_id).
					then(function(response) {
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
					}, function(errorResponse) {
						console.log("Error opening FTEM: " + errorResponse);
						return;
					});
			}, function(errorResponse) {
				console.log("Error updating session: " + errorResponse);
				return;
			});
	}
	
	$rootScope.$on('showSessionNotValidDialog', function() {
		$scope.showSessionNotValidDialog();
	});
	
	$scope.showSessionNotValidDialog = function() {
		if ($scope.logOutDetectionOn && $scope.logOutDetectionOn == true) {
			$("#sessionNotValidDialog").modal('show');
		}
	}
	
	$scope.logout = function(openLoginDropdown) {
		var userId = $rootScope.current_user_id;
		$rootScope.current_user_id = null;
		$rootScope.user_record = {firstName:"", lastName:""};
		var nullWorkspace = {resourceName:'', resourceId:-1};
		breadcrumbResource.setActiveWorkspace(nullWorkspace);
		persistanceUserService.removeLoggedInUser();
		if (userId == null || typeof userId == "undefined") return;
		
		// Log the user out and return them to the landing page
		userResource.logout(userId).then(function(response){
			if (response.data) {
			} else {
				error_message = "Error loading user record";
			}
		});
		if (openLoginDropdown && openLoginDropdown == true) {
	 		// .search adds '?openLoginDropdown=true' to the URL
			$location.path('/landing_page').search({openLoginDropdown:'true'});
		} else {
			$location.path('/landing_page');
		}
	}	
	
	$scope.openWorkspace = function(workspace) {	
		//$rootScope.activeFolder = null;
		breadcrumbResource.setActiveWorkspace(workspace);
		breadcrumbResource.navigateToWorkspaceView();
		//$location.path("/workspace/"+workspace.resourceId);
	}
	
	$scope.getPageHelp = function() {
		breadcrumbResource.getTopicHelp();
	}
	
	$scope.gotoFeedback = function() {
		$location.path("/iftdssfeedback/");
	}
	
	$scope.retrieveUserRecord = function(userId) {
		if (!userId)  return;
		if (userId.length < 1)  return;
		
		// Retrieve the user's full record for name, etc. - could be done in login controller instead
		userResource.getRequest(userId).then(function(response){
			if (response.data) {
				$rootScope.user_record = response.data;
				$scope.loggedInName = $rootScope.user_record.firstName + ' ' + $rootScope.user_record.lastName;
			} else {
				$rootScope.user_record = {firstName:"", lastName:""};
				error_message = "Error loading user record";
				$scope.showSessionNotValidDialog();
			}
		});
	}
	
	$rootScope.$on('logoutCurrentUser', function() { 
		$scope.logout(true);
	});
	
	$rootScope.$on('geobot_workspace', function() { 
		$scope.openWorkspace($rootScope.activeWorkspace);
		$rootScope.$apply();
	});	
	
	$rootScope.$on('geobot_create_lcp', function() { 
		 $location.path("/iftdssDataStudio/index.html\?containId="+$rootScope.activeWorkspace+"&action=newLandscape");		  
		 $rootScope.$apply();
	});	
	
	
//	$rootScope.$on('userLoginSuccessful', function() {
	$rootScope.$watch('current_user_id', function() { 
		if ($rootScope.current_user_id) {
			$scope.retrieveUserRecord($rootScope.current_user_id);
			if ($rootScope.changingPassword != true) {
				$scope.retrieveWorkspaces($rootScope.current_user_id);
			}
		}
	});
}

mainApp.directive("navbarDirective",function(){
	if (window != window.top) { //  in iframe)
		return null;
	}
	var dirConfig = {
		templateUrl: "pages/common/navbar_partial.html",
		controller: "navbarController"
	}
	return dirConfig;
})