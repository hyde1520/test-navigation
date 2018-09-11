mainApp.factory('cycleGuidenceResource', ['$http','__env', cycleGuidenceResource]);

function cycleGuidenceResource ($http,__env)
{	
	var taskNameMap = {
		'summary': "Generate Landscape Summary",
		'compare': "Develop Treatment Alternatives"
	};
	
	getTaskName = function(taskParam) {
		return taskNameMap[taskParam];
	}
	
	var cycleComponentMap = {
		'landscape_eval': "Landscape Evaluation",
		'plan': "Strategic Planning",
		'implement': "Implementation Planning",
		'monitor': "Monitoring",
		'report': "Reporting"
	}
	
	getCycleComponentName = function(topic) {
		return cycleComponentMap[topic];
	}
	
	getRequiredResources= function(task) {
		if (task=="summary") {
		  return ["land"];
		}
	}
	
	getGuidenceDialog = function (task) {
		if (task=="summary") {
			return {title:"Landscape Summary", html:"<h4>Here we generate a statistic summary of a landscape to better understand the fuels and conditions.</h4><ul><li>Select or create a landscape</li><li>Review landscape summary</li><li>Or review in mapstudio</li><ul>" +
					"<p>On the summary pages right click and save images, or use the print report button on the left hand side.</p>"}
		}
	}
  function getUserAccess (userId, appName) {
	    return $http({
	      method: 'GET',
	      url:__env.src("/firenetREST/app/access/user/" + userId + "/appname/" + appName),
	    }).
	    then(function successCallback(response) {
	        return response;
	      }, function errorCallback(response) {
	        return response || {data:{responseMessage: "Request failed"}};
	    });
  }
  return {
	  taskNameMap: taskNameMap,
	  getTaskName: getTaskName,
	  cycleComponentMap: cycleComponentMap,
	  getCycleComponentName: getCycleComponentName,
	  getRequiredResources: getRequiredResources,
	  getGuidenceDialog: getGuidenceDialog,
	  getUserAccess: getUserAccess
	  };
}