mainApp.factory('genericResource', ['$http','__env', genericResource]);

function genericResource ($http,__env)
{
	/** @return  an element from resource_element_view */
	function getResourceElementView(resourceId) {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/resource/resourceId/" + resourceId)
	    }).
	    then(function(response) {
	        return response;
	    }, function(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });
	}
	
	function getResourceTypes() {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/resource/types")
	    }).
	    then(function(response) {
	    	console.log("Retrieved resource types");
	    	//setResourceTypes(response);
	        return response;
	    }, function(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });
	}

  function createResource (resource) {
	var sendData = "";
	sendData += "{'resourceName':'"+resource.resourceName+"'";
	sendData += ",'owner':'"+ resource.owner + "'";
	sendData += ",'resourceType':'" + resource.resourceType + "'";
	sendData += ",'resourceScope':'" + resource.resourceScope + "'";
	sendData += ",'containId':'" + resource.containId + "'";

    return $http({
      method: 'PUT',
      url: __env.src("/iftdssREST/resource"),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({"data":sendData+"}"})
    }).
    then(function(response) {
        return response;
      }, function(response) {
        return response || {data:{message: "Request failed"}};
    });
  }

  function getResourcesForParent (containId) {
    return $http({
      method: 'GET',
      url:__env.src("/iftdssREST/resource/viewparent/"+containId),
    }).
    then(function successCallback(response) {
        return response;
      }, function errorCallback(response) {
        return response || {data:{responseMessage: "Request failed"}};
    });
  }
  

  function getFolderResourcesForParent (containId) {
    return $http({
      method: 'GET',
      url:__env.src("/iftdssREST/resource/viewparent/"+containId+"/folders"),
    }).
    then(function successCallback(response) {
        return response;
      }, function errorCallback(response) {
        return response || {data:{responseMessage: "Request failed"}};
    });
  }

  function deleteResource(resourceId) {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/resource/delete/"+resourceId)
	    }).
	    then(function(response) {
	        return response;
	      }, function(response) {
	        return response || {data:{responseMessage: "Failed to delete resource element (" + resourceId + ")"}};
	    });
	}
  
  function deleteResourceList(deleteRequestBO) 
  {
	  var sendData = JSON.stringify(deleteRequestBO);

	return $http({
      method: 'PUT',
      url: __env.src("/iftdssREST/resource/delete"),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({"data":sendData})
    }).
    then(function(response) {
        return response;
      }, function(response) {
        return response || {data:{responseMessage: "Failed to delete the list of resources."}};
    });
  }
  

  function getResourceStatusDescription(statusName) {
	   	var description = "Unknown status"
		if (statusName) {
			switch(statusName) {
				case "init":
					description =  "Requested";
					break;
				case "run_":
					description = "Building";
					break;
				case "done":
					description = "Completed";
					break;
				case "cncl":
					description = "Canceled";
					break;
				case "fail":
					description = "Failed";
					break;
				case "rdy_":
					description = "Ready";
					break;
			}
		 		
		}
		return description;
	}
  
  
 /* TODO: Not used so remove for now
  function getDeleteStatus(resourceId) {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/resource/status/delete/"+resourceId)
	    }).
	    then(function(response) {
	        return response;
	      }, function(response) {
	        return response || {data:{responseMessage: "Failed to delete resource element (" + resourceId + ")"}};
	    });
	} */

  return {
	  getResourceElementView: getResourceElementView,
	  getResourceTypes: getResourceTypes,
	  createResource: createResource,
	  getResourcesForParent: getResourcesForParent,
	  deleteResource: deleteResource,
	  deleteResourceList: deleteResourceList,
	  getFolderResourcesForParent: getFolderResourcesForParent,
	  getResourceStatusDescription: getResourceStatusDescription
	  //getDeleteStatus: getDeleteStatus
	  };
}
