var mainApp = angular.module("mainApp", ['ngRoute','ngWebSocket','ngAnimate','ngSanitize','ngIdle']);

ExternalLink = {template: "<div></div>",controller: function ($window, $location, $rootScope) {
        if (!$rootScope.isInitialLoad) {
            $window.location.href = $location.url();
        }}}

var env = {
    baseUrl:'',
    src : function(url) {
        return this.baseUrl + url;
    }
};
// Import variables if present (from env.js)
if(window.__env) {
  Object.assign(env, window.__env);
}
mainApp.constant('__env', env);

// Custom http intercepter 
mainApp.factory('httpIntercepter', ['$q', '$rootScope',
  function ($q, $rootScope) {
    return {
        request: function (config) {
        	if ($rootScope.current_user_id) { // bail if not logged in 
	        	var activityWithinApp = true;
	        	if (config && config.url) {
	        		if (config.url.includes("logout")) activityWithinApp = false;
	        		else if (config.url.includes("sessionTimeoutDialog_partial")) activityWithinApp = false;
	        		else if (config.url.includes("navbar_partial")) activityWithinApp = false;
	        		else if (config.url.includes("breadcrumb")) activityWithinApp = false;
	        		else if (config.url.includes("revealFtem")) activityWithinApp = false;
	        		else if (config.url.includes("/login/appMaint")) activityWithinApp = false;
	        		else if (config.url.includes("/workspace/user/null")) activityWithinApp = false;
	        	}
	            if (activityWithinApp)  $rootScope.$broadcast('userActivityToServer');
        	}
            return config || $q.when(config);
        },
        response: function (response) {
            return response || $q.when(response);
        },
        responseError: function (response) {
        	if (response && response.status == 401) {  // if unauthorized
        		$rootScope.$broadcast('showSessionNotValidDialog');
        	}
            return $q.reject(response);
        }
    };
  }
]);
//To use these angular URLS, you must prefix with #.. so for example localhost:8811/#/another, won"t work without the #
mainApp.config(function ($routeProvider, $httpProvider, IdleProvider, KeepaliveProvider) 
{
	$httpProvider.interceptors.push('httpIntercepter');
	
	IdleProvider.idle(3600); // change to 3600  // time before warning dialog is displayed to user
 	IdleProvider.timeout(120); // seconds - change to 120  // length of time to warn user and display dialog with countdown
 	IdleProvider.autoResume(false);
	KeepaliveProvider.interval(10); // seconds
	// KeepaliveProvider.http('/api/heartbeat');  // URL to keep session alive
	
    $routeProvider
       .when("/landing_page", ExternalLink)
       .when("/iftdss", { redirectTo: "/landing_page" })
       .when("/blank",{template: "<div></div>"})
       .when("/login", {controller: "loginController", templateUrl:"/pages/login/login.html"})
       .when("/logindone", {templateUrl:"/pages/login/login_done.html"})
       .when("/home", {templateUrl:"/pages/login/homePage.html",
    	   resolve: {breadcrumbData:
    		   function(breadcrumbResource)  {
    		   		breadcrumbResource.removeSubtopic();
    		   		breadcrumbResource.removeGuidance();
    		   		breadcrumbResource.setLeafView("Home", "#");
    		   }
    	   }
       })
       .when("/playground",  { controller: "modelrunController", templateUrl: "/pages/playgroundMain/main.html",
    	   resolve: {breadcrumbData:
    		   function(breadcrumbResource)  {
    		   		breadcrumbResource.removeSubtopic();
    		   		breadcrumbResource.removeGuidance();
    		   		breadcrumbResource.setLeafView("Playground View", "#");
    		   }
    	   }
       })
       .when("/cycle", {templateUrl:"/pages/cycle/cycleMainPage.html",
    	   resolve: {breadcrumbData:
    		   function(breadcrumbResource)  {
    		   		breadcrumbResource.removeSubtopic();
    		   		breadcrumbResource.removeGuidance();
    		   		breadcrumbResource.removeLeafView();
    		   }
    	   }
       })
       .when("/cycle/:topic", {templateUrl:"/pages/cycle/cycleMainPage.html",
    	   resolve: {breadcrumb:
    		   	function($route, $location, cycleGuidenceResource, breadcrumbResource) {
		   			var topic = $route.current.params.topic;
		   			var componentName = cycleGuidenceResource.getCycleComponentName(topic);
		   			breadcrumbResource.removeGuidance();
    		   		breadcrumbResource.removeLeafView();
		   			breadcrumbResource.setSubtopic(componentName, $location.path());
	   	   		}
    	   }
       })
      .when("/cycle/topic/plan/task/compare", {templateUrl:"/pages/cycle/compareGuide_partial.html",
    	   resolve: {landscapeData:
    		   function($rootScope, $route, $location, cycleGuidenceResource, breadcrumbResource, landscapeResource) {
    		   		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id);
    		   		var task = $route.current.params.task;
    		   		var taskName = cycleGuidenceResource.getTaskName('compare');
    		   		breadcrumbResource.removeLeafView();
    		   		breadcrumbResource.setGuidance(taskName, $location.path());
    	   	   }
    	   }
		})
		.when("/cycle/topic/plan/task/createEC", {templateUrl:"/pages/cycle/createECGuide_partial.html",
    	   resolve: {landscapeData:
    		   function($rootScope, $route, $location, cycleGuidenceResource, breadcrumbResource, landscapeResource) {
    		   		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id);
    		   		var task = $route.current.params.task;
    		   		var taskName = cycleGuidenceResource.getTaskName('compare');
    		   		breadcrumbResource.removeLeafView();
    		   		breadcrumbResource.setGuidance(taskName, $location.path());
    	   	   }
    	   }
		})
		.when("/cycle/topic/plan/task/createAlts", {templateUrl:"/pages/cycle/createAlternativesGuide_partial.html",
	    	   resolve: {landscapeData:
	    		   function($rootScope, $route, $location, cycleGuidenceResource, breadcrumbResource, landscapeResource) {
	    		   		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id);
	    		   		var task = $route.current.params.task;
	    		   		var taskName = cycleGuidenceResource.getTaskName('compare');
	    		   		breadcrumbResource.removeLeafView();
	    		   		breadcrumbResource.setGuidance(taskName, $location.path());
	    	   	   }
	    	   }
			})
		.when("/createTreatmentAlternatives", {controller: "createTreatmentAlternativesController",
			   templateUrl:"/pages/landscape/compare/createTreatmentAlternatives.html",
	    	   resolve: {landscapeData:
	    		   function($rootScope, $route, $location, cycleGuidenceResource, breadcrumbResource, landscapeResource) {
	    		   		//landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id);
	    		   		var task = $route.current.params.task;
	    		   		var taskName = cycleGuidenceResource.getTaskName('compare');
	    		   		breadcrumbResource.removeLeafView();
	    		   		breadcrumbResource.setGuidance(taskName, $location.path());
	    	   	   }
	    	   }
			})
		.when("/cycle/topic/:topic/task/:task", {templateUrl:"/pages/cycle/landSummaryGuide_partial.html",
    	   resolve: {landscapeData:
    		   function($rootScope, $route, $location, cycleGuidenceResource, breadcrumbResource, landscapeResource) {
    		   		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id);
    		   		var task = $route.current.params.task;
    		   		var taskName = cycleGuidenceResource.getTaskName(task);
    		   		breadcrumbResource.removeLeafView();
    		   		breadcrumbResource.setGuidance(taskName, $location.path());
    	   	   }
    	   }
		})
	   .when("/landscape/edit/:landscapeid", { templateUrl:"/pages/landscape/editLandscape.html",
		   resolve: {breadcrumb:
			 function($rootScope, $route, $location, breadcrumbResource, landscapeResource) {
			   	landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id);
		   		var taskName = "Edit Landscape";
		   		breadcrumbResource.removeLeafView();
		   		breadcrumbResource.setGuidance(taskName, $location.path());
	   	     }
		   }
	    })
	    .when("/report/reportType/:reportType/landscape/:landscapeid/shape/:shapeid/run/:runId",  { controller: "landscapeSummaryController", templateUrl: "/pages/report/summary.html",
    	   resolve: {summaryData:
              	function($rootScope, $route, reportService, breadcrumbResource) {
    		   		var pageName = "Landscape Summary Report";
    		   		if ($route.current.params.reportType == 'raut') {
    		   			pageName = "Auto97th Fire Behavior Report";
    		   		}
    		   		breadcrumbResource.setLeafView(pageName, "#");
              		$rootScope.navbar_title = pageName;
             		return reportService.getLandscapeSummaryBySubType($route.current.params.landscapeid, $route.current.params.shapeid, $route.current.params.runId, $route.current.params.reportType);
             	}
              }
       	})
	   .when("/report/summary/landscape/:landscapeid/shape/:shapeid",  { controller: "landscapeSummaryController", templateUrl: "/pages/report/summary.html",
    	   resolve: {summaryData:
              	function($rootScope, $route, reportService, breadcrumbResource) {
    		   		var pageName = "Landscape Summary Report";
    		   		breadcrumbResource.setLeafView(pageName, "#");
              		$rootScope.navbar_title = pageName;
             		return reportService.getLandscapeSummary($route.current.params.landscapeid, $route.current.params.shapeid);
             	}
              }
       	})
       	.when("/report/summary/:summaryid",  { controller: "landscapeSummaryController", templateUrl: "/pages/report/summary.html",
    	   resolve: {summaryData:
              	function($rootScope, $route, reportService, breadcrumbResource) {
    		   		var pageName = "Landscape Summary Report";
    		   		breadcrumbResource.setLeafView(pageName, "#");
              		$rootScope.navbar_title = pageName;
             		return reportService.getSummary($route.current.params.summaryid);
             	}
              }
       	})
       	.when("/report/compare/:compareSummaryId/reportType/:reportType",  { controller: "compareSummaryController", templateUrl: "/pages/report/compareSummary.html",
    	   resolve: {compareData:
              	function($rootScope, $route, reportService, breadcrumbResource) {
    		   		var pageName = "Treatment Alternatives Summary Report";
    		   		breadcrumbResource.setLeafView(pageName, "#");
              		$rootScope.navbar_title = pageName;
             		return reportService.getCompareSummary($route.current.params.compareSummaryId, $route.current.params.reportType);
             	}
              }
       	})
       	.when("/report/summary/:summaryid/reportType/:reportType",  { controller: "landscapeSummaryController", templateUrl: "/pages/report/summary.html",
    	   resolve: {summaryData:
              	function($rootScope, $route, reportService, breadcrumbResource) {
    		   		var pageName = "Landscape Summary Report";
    		   		breadcrumbResource.setLeafView(pageName, "#");
              		$rootScope.navbar_title = pageName;
             		return reportService.getSummary($route.current.params.summaryid);
             	}
              }
       	})

       	.when("/basic/new/",  { controller: "basicrunController", templateUrl: "/pages/modelpages/basicInput.html",
    	            resolve: {startingInputs:
    	            	function($rootScope,$filter, breadcrumbResource) {
    	            		$rootScope.navbar_title="Create Landscape Fire Behavior Model"
    	            		breadcrumbResource.setLeafView($rootScope.navbar_title, "#");
    	              		d = new Date();
    	            		var defaultInput = {
    	            			resourceDef: {
    	            			owner: $rootScope.current_user_id,
    	            			created: $filter('date')(d.getTime(), 'medium'),
    	            		    name: "",
    	            		    runId:"",
    	            		    modelType: "Landscape Fire Behavior",
    	            		    modelStatus: "init",
    	            			},
    	            			weather:{
    	            				ERC: 80,
    	            				HourlyWeatherArray: [[0,null,null,null,null,null,null]]
    	            			},
    	            			wind:{
    	            			windSpeed:null,
    	            			windDir:null,
    	            			},
    	            			crownFire: {
        	            			crownFireMethod:"Scott/Reinhardt",
        	            			foliarMoistureContent:100,
    	            			},
    	            			landscape: {
    	            				landscapeId:"",
    	            				resourceName:"", //landscape name
    	            				complete:false, //landscape name
    	            			},
    	            			fuelMoisture:{
    	            				fuelMoistureArray:[[0,null,null,null,null,null]],
    	            			}
    	            		  }
    	            		return defaultInput;
    	            	}
    	            }
       	})
       .when("/basic/edit/:runid",  { controller: "basicrunController", templateUrl: "/pages/modelpages/basicInput.html",
           resolve: {startingInputs:
           	function($rootScope, $route, basicResource, breadcrumbResource) {
           		$rootScope.navbar_title="Edit Landscape Fire Behavior Model";
           		breadcrumbResource.setLeafView($rootScope.navbar_title, "#");
          		createDate = ""; // TODO: How to set default $filter('date')(d.getTime(), 'medium');
           		return basicResource.setExistingRunInput($route.current.params.runid, $rootScope.current_user_id, createDate);
           	}
           }
         })
         .when("/basic/view/:runid",  { controller: "basicrunController", templateUrl: "/pages/modelpages/basicInput.html",
           resolve: {startingInputs:
           	function($rootScope, $route, basicResource, breadcrumbResource) {
           		$rootScope.navbar_title="View Landscape Fire Behavior Model";
           		breadcrumbResource.setLeafView($rootScope.navbar_title, "#");
          		createDate = ""; // TODO: How to set default $filter('date')(d.getTime(), 'medium');
          		return basicResource.viewExistingRunInput($route.current.params.runid, $rootScope.current_user_id, createDate);
           	}
           }
         })
       .when("/basic/copy/:runid",  { controller: "basicrunController", templateUrl: "/pages/modelpages/basicInput.html",
           resolve: {startingInputs:
           	function($rootScope, $route,$filter, basicResource) {
           		$rootScope.navbar_title="Copy Landscape Fire Basic Model"
           		d = new Date();
           		newInput = {resourceDef:{owner: $rootScope.current_user_id,
            			created: $filter('date')(d.getTime(), 'medium'),
            		    name: "",
            		    runId:$route.current.params.runid,
            		    modelType: "Landscape Fire Behavior",
            		    modelStatus: "init"}}
           		basicResource.getRun($route.current.params.runid).then(function(response){
           			if (response.data){
           				if (response.data.windDirection) {
           					newInput.wind.windDir = response.data.windDirection;
           				}
           				if (response.data.windSpeed) {
           					newInput.wind.windSpeed = response.data.windSpeed;
           				}
                   		return newInput
           			} else {
           				error_message = "Error loading previously entered data";
           			}});
           		return newInput
           	}
           }
         })
	   .when("/workspace/:workspaceId",  { templateUrl: "/pages/workspace/workspaceMain.html",
		   resolve: {breadcrumbData:
    		   function(breadcrumbResource)  {
    		   		breadcrumbResource.removeSubtopic();
    		   		breadcrumbResource.removeGuidance();
    		   		breadcrumbResource.setLeafView("My Workspace", "#");
    		   }
    	   }
	   })
	   .when("/iftdssfeedback/",  {templateUrl: "/pages/iftdss-web-page/iftdssWebFeedback.html"})
       .when("/signup",  { templateUrl: "/pages/login/signup.html" })
       .when("/acceptRoB/:userId",  {  templateUrl: "/pages/userPages/rulesOfBehavior.html" })
       .when("/userProfile",  { controller: "userProfileController", templateUrl: "/pages/userPages/userProfile.html" })
       .when("/changePassword",  { controller: "changePasswordController", templateUrl: "/pages/userPages/changePassword.html" })
       .when("/userList",  { templateUrl: "/pages/userPages/userList.html" })
       .when("/serviceTransactions",  { templateUrl: "/pages/admin/svcTxs.html" })
       .when("/resetPassword",  { templateUrl: "/pages/userPages/resetPassword.html" })
       .when("/changePasswordExpired/:userId",  { templateUrl: "/pages/userPages/changePasswordExpired.html" })
       .when("/changePasswordReset/:userId",  { templateUrl: "/pages/userPages/changePasswordReset.html" })
       .when("/iftdssDataStudio/", {templateUrl: "/pages/mapstudio/mapStudioMain.html",
		   resolve: {breadcrumbData:
    		   function(breadcrumbResource)  {
    		   		breadcrumbResource.removeSubtopic();
    		   		breadcrumbResource.removeGuidance();
    		   		breadcrumbResource.setLeafView("Map Studio", "#");
    		   }
    	   }
	   })
       .when("/iftdssDataStudio/:params*",  { templateUrl: "/pages/mapstudio/mapStudioMain.html" })
       .when("/emailconfirmation/:userid/:token",   {controller: "loginController", service:"loginResource", templateUrl:"/pages/login/landing_page.html"})
       .when("/",  { redirectTo: "/landing_page" })
       .when("/mydemos", {templateUrl:"/pages/demos/websocket_demo.html"})
       .when("/allNotifications", {templateUrl:"/pages/userPages/messageInboxPage.html"})
       .when("/basic/example/inputfile", {template:"<ng-include src='pages/modelpages/Basic_input.txt'></ng-include>"})
       .when("/404_page", {templateUrl:"/pages/common/404_page.html"})
       .when("/comparisonDashboard/:landscapeId", {controllers:"comparisonDashboardController",templateUrl:"/pages/comparisonDashboard/comparisonDashboard.html"})
       .when("/comparisonDashboard/landscapeId/:landscapeId/modelId/:modelId", {controllers:"comparisonDashboardController",templateUrl:"/pages/comparisonDashboard/comparisonDashboard.html"})
       .when("/ftem", {templateUrl:"/ftem/ftem_landing.html"})
       .otherwise({ redirectTo: "/404_page" });
});

// Add focus-on="eventName" to an <input> element for it to get focus for a fired event
mainApp.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on(attr.focusOn, function(e) {
          elem[0].focus();
      });
   };
});


mainApp.run(function($rootScope, $window, $document, Idle) 
{
	$document.on('click', function() {
		$rootScope.$broadcast('user-mouse-clicked');
	});
	
	// Session Timeout handling
	$rootScope.$on('userLoginSuccessful', function() {
		Idle.watch();  // start Idle timer
		console.log("User logged in so Idle.watch() was called.");
	});
	$rootScope.$on('userActivityToServer', function() {
		Idle.watch();  // start Idle timer
		//console.log("Server activity so Idle.watch() was called.");
	});
	$rootScope.$on('updateSessionTimeoutProps', 
		function(event, timeoutProperties) {
			Idle.setIdle(timeoutProperties.idleTimeout);  // time before warning dialog is displayed to user
			console.log("idle set to " + timeoutProperties.idleTimeout + " in IdleProvider.");
		 	Idle.setTimeout(timeoutProperties.warnTimeout);  // time to warn user and display dialog with countdown
		 	console.log("timeout set to " + timeoutProperties.warnTimeout + " in IdleProvider.");
		 	Idle.watch();
		}	
	);
	$rootScope.$on('IdleStart', function() {
		//console.log("Idle Start - display warning");
		$("#sessionTimeoutDialog").modal('show');
	});
	$rootScope.$on('IdleTimeout', function() {
		console.log("Idle Timeout - will logout user");
		$rootScope.$broadcast('logoutCurrentUser');
		Idle.unwatch();  // stop Idle timer
	});
//	$rootScope.$on('IdleEnd', function() {
//		console.log("Idle end in app.js.");
//		// the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
//	});
//	$rootScope.$on('userIdleSeconds', 
//		function(event, idleSeconds) {
//			var runningStr = Idle.running() ? "Watch is running.  " : "Watch is NOT running.  ";
//			console.log("User has been idle for " + idleSeconds + " seconds.  " + runningStr);
//		}
//	);		
//	$rootScope.$on('Keepalive', function() {
//		console.log("(Keepalive notification) idle = " + Idle.getIdle() + ", timeout = " + Idle.getTimeout());
//		//console.log("Keep alive - do something to keep the user's session alive");
//	});
	//    (see other ngIdle notification handling in sessionTimeoutDialogDirective.js)
	// end of Session Timeout handling
	
	$rootScope.showPopoverhelp = true;
	
	// When navigating to new page
	$rootScope.$on("$routeChangeStart", function(event, next, current) {
		$rootScope.splitMapOpen = false; // reset
		if (next && next.$$route && next.$$route.originalPath) {
			// We're logging out so don't broadcast user activity
			if (next.$$route.originalPath.includes("landing_page"))  return;
		}
		// Avoid triggering ngIdle if not in the app
		if ($rootScope.current_user_id) {
			$rootScope.$broadcast('userActivityToServer');
		}
	});

	$rootScope.openInNewTab = function(url) {
		$window.open(url, '_blank');
	}
	
	$rootScope.postGeoBotMessageToMapStudio = function($window,message) 
	{
		var iframe = $window.document.getElementById("mapStudioIframe");
		if (!iframe){
			iframe = $window.document.getElementById("mapStudio");
		}
		if(iframe) {
			var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
			var iframeLoaded = innerDoc.getElementById("map_load_complete");	
			if (iframeLoaded){
				iframe.contentWindow.postMessage(message, '*');	
			}			
		}
	}
	
	$rootScope.isMapVisible = function($window) {
		var mapvisible = false;
		var iframe = $window.document.getElementById("mapStudioIframe");
		if (!iframe){
			iframe = $window.document.getElementById("mapStudio");
		}
		if(iframe) {
			var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
			var iframeLoaded = innerDoc.getElementById("map_load_complete");	
			if (iframeLoaded){
				mapvisible = true;
			}			
		}
		return mapvisible;
	}

	 $rootScope.displayMessage = function($scope, $timeout, messageType, message, timeInMs) {
		 switch(messageType) {
		    case "error":
		    	$scope.errorMessage = message;
				$scope.displayError = true;
		        break;
		    case "success":
		    	$scope.successMessage = message;
				$scope.displaySuccess = true;
		        break;
		    case "warning":
		    	$scope.warningMessage = message;
				$scope.displayWarning = true;
		        break;
		    default:
		    	$scope.successMessage = message;
				$scope.displaySuccess = true;
		}
		 if ($timeout && timeInMs){
			 if (parseInt(timeInMs,10)>0){
				 $timeout(function(){
					 switch(messageType) {
					    case "error":
					    	$scope.errorMessage = "";
							$scope.displayError = false;
					        break;
					    case "success":
					    	$scope.successMessage = "";
							$scope.displaySuccess = false;
					        break;
					    case "warning":
					    	$scope.warningMessage = "";
							$scope.displayWarning = false;
					        break;
					    default:
					    	$scope.successMessage = "";
							$scope.displaySuccess = false;
					}
					 }, timeInMs);
			 }
		 }
     };
});
