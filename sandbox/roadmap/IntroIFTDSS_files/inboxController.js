mainApp.controller("inboxController",['$rootScope','$scope','$location',"websocketService","messageInboxResource",inboxController])

function inboxController($rootScope,$scope,$location,websocketService,messageInboxResource) {
	
	$scope.showing_errors = false;
	$scope.showing_notes = false;
	inbox = [];
	$scope.errors = [];
	$scope.notifications = [];
	
	$rootScope.$watch('current_user_id', function() { 
		if ($rootScope.current_user_id) {
			$scope.getInbox();
			//websocketService.close();
			//websocketService.open();
		} else {
			//websocketService.close();
			$scope.notifications = []
			$scope.errors = []
		}
	});
	
	$scope.getInbox = function () {
		if ($rootScope.current_user_id) {
			$scope.loading_inbox = true;
			messageInboxResource.getInbox($rootScope.current_user_id).then(function(response){
				if (response.data && response.data.length > 0 && response.status != 500) {
					$scope.inbox = response.data;
					$scope.loading_inbox = false;
					if ($scope.inbox && $scope.inbox.length) {
						sort_inbox($scope.inbox);
					}
					
				} else {
    				error_message = "Error loading landscape sources";
    				$scope.loading_inbox = false;
    			}
    		})
		}
	}
	
//	$scope.$watch("websocketService.check_inbox",function () {
//		messageInboxResource.getInbox($rootScope.current_user_id);
//		websocketService.check_inbox = false;
//		console.log("auto updating inbox messages")
//	})
	
	$scope.show_errors = function() {
		if ($scope.showing_errors) {
			$scope.showing_errors = false;
		} else {
			$scope.showing_errors = true;
		}
	}
	
	$scope.show_Notifications = function() {
		if ($scope.showing_notes) {
			$scope.showing_notes = false;
		} else {
			$scope.showing_notes = true;
		}
	}
	
	$scope.goMessageLink = function(message) {
		switch(message.resourceType) {
		case "land":
			link = "/#/iftdssDataStudio/index.html?landscapeid="+message.resourceId;
			$location.path(link);
			return;
		case "run_":
			link = "/#/iftdssDataStudio/index.html?modelid="+message.resourceId;
			$location.path(link);
			return;
		default: 
			return;
		} 
	}
	
	$scope.dismissMessage = function(messageId) {
		messageInboxResource.dismissMessage(messageId,$rootScope.current_user_id).then(function(response){
			if (response.data && response.data.success == true && response.status != 500) {
				for (var i = 0; i < $scope.notifications.length; i++) {
					if ($scope.notifications[i].messageId == messageId) {
						$scope.notifications.splice(i, 1);
					}
				}	
				for (var i=0; i <$scope.errors.length; i++) {
					if ($scope.errors[i].messageId == messageId) {
						$scope.errors.splice(i, 1);
					}
				}
			} else {
				console.log(response.data);
				error_message = "Error dismissing message";
			}
		});
	}
	
	$scope.isActive = function (viewLocation1, viewLocation2) 
	{
		if (viewLocation1 && viewLocation1 == $location.path()) {
			return true;
		} else if (viewLocation2 && viewLocation2 == $location.path()) {
			return true;
		} else if (viewLocation1 && $location.path().includes(viewLocation1)) {
			return true;
		} else if (viewLocation2 && $location.path().includes(viewLocation2)) {
			return true;
		}
		return false;
	};
	
	sort_inbox = function (inbox) {
		$scope.errors = [];
		$scope.notifications = [];
		if (inbox && inbox.length) {
			for (i=0; i < inbox.length; i++) {
				if (inbox[i] && inbox[i].alertLevel && inbox[i].alertLevel == 1) {
					$scope.errors.push(inbox[i]);
				} else if (inbox[i]) {
					$scope.notifications.push(inbox[i]);
				} else {
					console.log("Malform inbox message found");
				}
			}
		}
	}
	
}

mainApp.directive("inboxDirective",function(){
	var dirConfig = {
		templateUrl: "pages/common/inboxButton_partial.html",
		controller: "inboxController"
	}
	return dirConfig;
})