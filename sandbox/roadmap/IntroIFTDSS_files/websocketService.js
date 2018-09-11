mainApp.factory('websocketService', ['$rootScope','$websocket','$location', websocketService]) 

function websocketService ($rootScope,$websocket,$location) {
	
    var ws = null;
	var messages = null;
	var check_inbox = false;
	
    // Open a WebSocket connection
	openWS = function() {
    	ws = $websocket("ws://" + document.location.host + "/iftdssWebsocket/notifications/"+$rootScope.current_user_id);
	    messages = [];
	    ws.onMessage(function (event) {
	    	console.log(event);
	    	messageObj = JSON.parse(event.data);
	    	messages.push(messageObj);
	    	if (messageObj.wId && messageObj.rId && $rootScope.activeWorkspace.resourceId == messageObj.wId) {
	    		$rootscope.reload_rId = messageObj.rId;
	    	} else if (messageObj.uId && !messageObj.rId && !messageObj.wId) {
	    		check_inbox = true;
	    		console.log("New Inbox Messages");
	    	}
	    	//messageObj.wId
	    });
	    
	    ws.onError(function (event) {
	    	console.log('connection Error', event);
	    });

	    ws.onClose(function (event) {
	    	console.log('connection closed', event);
	    	messages=null;
	    });
	    
	    ws.onOpen(function () {
	    	console.log('connection open');
	    });
	}
    
    function messageToString(messageJson) {
    	messageString = "{";
    	messageString += "'wId':'" + messageJson.wId + "',";
    	messageString += "'rId':'" + messageJson.rId +"',";
    	messageString += "'uId':'" + messageJson.uId +"'";
    	messageString += "}";
    	return messageString;
    }
    
    return {
    	websocket_messages: messages,
    	status: function () {
    		if (ws == null) {
    			return "closed";
    		}
    		return ws.readyState;
    	},
    	close: function () {
    		if (ws == null) {
    			return null;
    		}
    		value = ws.close;
    		console.log(value);
    		ws = null;
    		return value;
    	},
    	open: openWS,
    	check_inbox: check_inbox
    };
	}