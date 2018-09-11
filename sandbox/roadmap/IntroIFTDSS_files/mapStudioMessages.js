mainApp.factory('mapStudioMessages', function($window, $rootScope, $route, $location) {
    var listenerLoaded = false;
    function subsFunc() {
    	if (!listenerLoaded){
    	      $window.addEventListener('message', function(e) {
    	    	  if (e.data && typeof(e.data) == "string") {
    	    		  var extentMsg = e.data;
    	    		  // see mapStudioMessages.js in the 'ftemUI' project for additional messages
    	    		  if (extentMsg.startsWith("mouse-clicked-on-map")) {
    	    			  $rootScope.$broadcast('user-mouse-clicked');
    	    		  }  
    	    		  if (extentMsg.startsWith("geobot_cycle")) {
    	    			  $location.path("/cycle/landscape_eval");
    	    			  $rootScope.$apply();
    	    		  }  
    	    		  if (extentMsg.startsWith("geobot_home")) {
    	    			  $location.path("/home");
    	    			  $rootScope.$apply();
    	    		  } 
    	    		  if (extentMsg.startsWith("geobot_workspace")) {
    	    			  $rootScope.$broadcast('geobot_workspace');
    	    		  } 
    	    		  if (extentMsg.startsWith("geobot_map")) {
    	    			  $location.path("/iftdssDataStudio");
    	    			  $rootScope.$apply();
    	    		  } 
    	    		  if (extentMsg === "geobot_create_lcp") {
    	    			  if ($rootScope.isMapVisible($window)){
    	    				  $rootScope.postGeoBotMessageToMapStudio($window, 'newlandscape');
    	    				  $rootScope.$apply();
    	    			  } else{
    	    				  $rootScope.$broadcast('geobot_create_lcp');
    	    			  } 
    	    		  }
    	    		  if (extentMsg === "geobot_create_lcp_help") {
	    			      window.open("/firenetHelp/help/pageHelp/content/10-mapstudio/files/lcpcreate.htm","_blank");
    	    	      }
    	    		  //working with map
    	    		  if (extentMsg.startsWith("geobot_zoom_in")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_zoom_in');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_zoom_out")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_zoom_out');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_zoomToCA")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_zoomToCA');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_zoomToCO")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_zoomToCO');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_fires_2016")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_fires_2016');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_fires_2017")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_fires_2017');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_fires_2015")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_fires_2015');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_fires_size")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_fires_size');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_agency")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_agency');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  if (extentMsg.startsWith("geobot_landfire")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_landfire');
    	    			  $rootScope.$apply();
    	    		  }
    	    		  
    	    		  //http://192.255.42.9/firenetHelp/help/pageHelp/content/10-mapstudio/files/lcpcreate.htm
    	    		  if (extentMsg.startsWith("geobot_clear_map")) {
    	    			  $rootScope.postGeoBotMessageToMapStudio($window, 'geobot_clear_map');
    	    			  $rootScope.$apply();
    	    		  }
    	    	  }    	    	          
    	      });
    	      listenerLoaded = true;
    	}
    }

    return {
      "subscribe": subsFunc }
  });