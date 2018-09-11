mainApp.factory('iftdssMapStudioMessages', function($window, $rootScope) {
    var listenerLoaded = false;
    function subsFunc() {
    	if (!listenerLoaded){
    	      $window.addEventListener('message', function(e) {
    	    	  if (e.data && typeof(e.data) == "string") {
    	    		  var insertShapeMsg = e.data;
    	    		  var insertShapeMsgStart = "shape-created=";
    	    		  if (insertShapeMsg.startsWith(insertShapeMsgStart)) {
    	    			  var shapeJsonStr = insertShapeMsg.substr(insertShapeMsgStart.length);
    	    			  // TODO: add this back  var shapeObj = JSON.parse(shapeJsonStr);
    	    			  var shapeObj = JSON.parse("{}");
    	    			  $rootScope.$broadcast('shape-create-completed', shapeObj);
    	    		  }   	  
    	    	  }    	    	          
    	      });
    	      listenerLoaded = true;
    	}
    }

    return {
      "subscribe": subsFunc }
  });