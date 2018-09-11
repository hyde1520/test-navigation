mainApp.factory('workspaceResource', ['$http','__env', workspaceResource]);

function workspaceResource ($http,__env) {

  function createWorkspace (workspace) {
	var sendData = "";
	sendData += "{'resourceName':'"+workspace.resourceName+"'";
	sendData += ",'owner':'"+ workspace.owner + "'";
	sendData += ",'resourceScope':'" + workspace.resourceScope + "'";

    return $http({
      method: 'PUT',
      url: __env.src("/iftdssREST/workspace"),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: $.param({"data":sendData+"}"})
    }).
    then(function(response) {
        return response;
      }, function(response) {
        return response || {data:{message: "Request failed"}};
    });
  }

  function getUserWorkspaces (userId) {
	    return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/workspace/user/"+userId),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }

  function getUserFolders (userId) {
	    return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/resource/folders/user/"+userId),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });

	  }

  return {
	  createWorkspace: createWorkspace,
	  getUserWorkspaces: getUserWorkspaces,
	  getUserFolders: getUserFolders
	  };
}
