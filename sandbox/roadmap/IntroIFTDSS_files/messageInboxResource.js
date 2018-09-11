mainApp.factory('messageInboxResource', ['$http','__env', messageInboxResource]);

function messageInboxResource ($http,__env) {
	getInbox = function (userId) {
		return $http({
			  method: 'GET',
			  url: __env.src("/iftdssREST/messageInbox/getActive/user/" + userId)
		  }).then(function(response){
			  return response;
		  },function(response){
			  return response || {data:{responseMessage:"Request Failed"}};
		  })
	}

	dismissMessage = function (message_id,user_id) {
		return $http({
		      method: 'PUT',
		      url: __env.src("/iftdssREST/messageInbox/dismissMessage/"),
		      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		      data: $.param({"data":"{'userId':"+user_id+", 'messageId':"+message_id+"}"})
		    }).
		    then(function(response) {
		        return response;
		      }, function(response) {
		        return response || {data:{message: "Request failed"}};
		    });
	}

	example_data = [{messageText:"Landscape 'Saranto Park' complete",alertLevel:3,recipient:"rtmah",messageId:8,expiration:null,resourceId:null,resType:null},
					{messageText:"Model 'Palomeno Hills Basic ERC85' complete",alertLevel:3,recipient:"rtmah",messageId:7,expiration:null,resourceId:null,resType:null},
					{messageText:"Model 'Palomeno Hills Basic ERC90' complete",alertLevel:3,recipient:"rtmah",messageId:6,expiration:null,resourceId:null,resType:null},
					{messageText:"Landscape 'Palomeno Hills' complete",alertLevel:3,recipient:"rtmah",messageId:5,expiration:null,resourceId:null,resType:null},
					{messageText:"Workfolder 'rtmah's playground' created",alertLevel:3,recipient:"rtmah",messageId:4,expiration:null,resourceId:null,resType:null},
					{messageText:"Workspace 'rtmah's workspace' created",alertLevel:3,recipient:"rtmah",messageId:3,expiration:null,resourceId:null,resType:null},
					{messageText:"Your account has been created, Welcome to IFTDSS",alertLevel:3,recipient:"rtmah",messageId:2,expiration:null,resourceId:null,resType:null},
					{messageText:"Error: Model 'Saranto Park Basic ERC90' failed",alertLevel:1,recipient:"rtmah",messageId:9,expiration:null,resourceId:null,resType:null},
	                {messageText:"Server Warning: Server Shutdown at 4pm today",alertLevel:1,recipient:"brdcst",messageId:1,expiration:null,resourceId:null,resType:null}]

	var functionList = {
		getInbox: getInbox,
		dismissMessage: dismissMessage

	}
	return functionList;

}
