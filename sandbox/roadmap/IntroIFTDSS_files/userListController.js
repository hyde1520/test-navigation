mainApp.controller('userListController', ['$scope', '$rootScope', '$location', 'userListResource', userListController]);

function userListController($scope, $rootScope, $location, userListResource) {
	console.log('Initiating userListController');
	$scope.user = {
		    userId: '',
			firstName: '',
			lastName: '',
			emailAddress: '',
			securityQuestion: '',
			securityAnswer: ''
	}

	$scope.user_list = [];
	$scope.user_types = [];
	$scope.loaded_user_list = false;
	$scope.userFilter = "All";
	$scope.hoverContext = "general";
	$scope.submenu_id = '';
	
	$scope.submitSuccess = false;
	$scope.submitSuccessMessage = "";
	$scope.submitFail = false;
	$scope.submitFailMessage = "";
	$scope.sort_by="userId";
	$scope.sort_order= false;
			  
	$scope.userList_error = '';

    // Get the user profile from the userListResource service
	userListResource.getUserList($scope.userFilter, $rootScope.current_user_id).then(function(response) {
			$scope.user_list = response.data;
		},function(response) {
			$scope.displayError = true;
			$scope.errorMessage = response;
		});

    // Get the list of user roles
	userListResource.getRoles().then(function(response) {
			$scope.user_types = response.data;
			$scope.user_types.unshift("All");
		},function(response) {
			$scope.displayError = true;
			$scope.errorMessage = response;
		});

	$scope.init = function() {
		$scope.retrieve_users('');
	}
	
	function clearMessages() {
		$scope.submitSuccess = false; 
		$scope.submitSuccessMessage = "";
		$scope.submitFail = false; 
		$scope.submitFailMessage = "";
	}
	
	// Retrieve resource list
	$scope.retrieve_users = function(userType) {
		clearMessages();
		userListResource.getUserList(userType, $rootScope.current_user_id).then(function(response) {
			if (response.data) {
				$scope.user_list = response.data;
				for (i=0; i < $scope.user_list.length; i++){
					var userId = $scope.user_list[i].userId;
				 } 
			}				
		});
	}
	
	$scope.setFilter = function(userType) {
		$scope.userFilter=userType;
		$scope.retrieve_users(userType);
	}
	
	$scope.set_sort = function(sort_tag){
		clearMessages();
		if (sort_tag == $scope.sort_by) {
			$scope.sort_order = !($scope.sort_order);
		}
		else {
			$scope.sort_order= false;			
			$scope.sort_by = sort_tag;
		}
	}
	
	// Set properties to show or hide a sub-menu for a resource in the main list
	$scope.reveal_menu = function(user){
		clearMessages();
		if (user.userId == $scope.submenu_id) {
			$scope.submenu_id = '';
			return false;
		}
		$scope.submenu_id = user.userId;
		return true;
	}
	
	$scope.denyRequest = function(userId) {
		clearMessages();
		userListResource.rejectRequest($rootScope.user_record.userId, userId).then( 
		 	function (response){
		 		if (response.data && response.data.success && response.data.success == true) {
		 			$scope.submitSuccessMessage = "The request by " + userId + " for IFTDSS privileges was removed from the system";
		 			$scope.submitSuccess = true;
		 			$scope.submenu_id = '';
					for (i=0; i < $scope.user_list.length; i++){
						if ($scope.user_list[i].userId == userId)
						{
							$scope.user_list.splice(i, 1);
							break;
						}
					} 
		 			return true;
		 		} else {
		 			$scope.submitFailMessage = response.data.responseMessage;
					$scope.submitFail = true;
		 			return false;
		 		}
		 	})
	}
	
	$scope.grantUserPrivileges = function(userId) {
		$scope.updatePrivileges(userId, "user", userId + " was granted IFTDSS User privileges");
	}
	
	$scope.grantAdminPrivileges = function(userId) {
		$scope.updatePrivileges(userId, "admn", userId + " was granted IFTDSS Administrator privileges");
	}
	
	$scope.disableAccount = function(userId) {
		$scope.updatePrivileges(userId, "disa", "The IFTDSS account for " + userId + " was disabled");
	}
	
	$scope.updatePrivileges = function(userId, role, successMessage) {
		clearMessages();
		userListResource.updatePrivileges($rootScope.user_record.userId, userId, role).then(function (response) {
	 		if (response.data && response.data.success && response.data.success == true) {
				$scope.submitSuccessMessage = successMessage;
				$scope.submitSuccess = true;
				$scope.submenu_id = '';
				for (i=0; i < $scope.user_list.length; i++){
					if ($scope.user_list[i].userId == userId)
					{
						if ($scope.userFilter == "All")	{
							if (role == "user") role = "User";
							else if (role == "admn") role = "Administrator";
							else role = "Disabled";
							$scope.user_list[i].role = role;
						} else {
							$scope.user_list.splice(i, 1);
						}	
						break;
					}
				} 
	 			return true;
	 		} else {
	 			$scope.submitFailMessage = response.data.responseMessage;
				$scope.submitFail = true;
	 			return false;
	 		}
	 	})
	}
	
	$scope.resetPassword = function(userId) {
		clearMessages();
		userListResource.resetPassword($rootScope.user_record.userId, userId).then( 
		 	function (response){
		 		if (response.data && response.data.success && response.data.success == true) {
					$scope.submitSuccessMessage = userId + " was sent an email informing them that their IFTDSS password was reset";
		 			$scope.submitSuccess = true;
		 			return true;
		 		} else {
		 			$scope.submitFailMessage = response.data.responseMessage;
					$scope.submitFail = true;
		 			return false;
		 		}
		 	})
	}
	
	$scope.unlock = function(userId) {
		clearMessages();
		userListResource.unlock($rootScope.user_record.userId, userId).then( 
		 	function (response){
		 		if (response.data && response.data.success && response.data.success == true) {
					$scope.submitSuccessMessage = userId + " was sent an email informing them that their IFTDSS account was unlocked";
		 			$scope.submitSuccess = true;
		 			for (i=0; i < $scope.user_list.length; i++){
		 				if ($scope.user_list[i].userId == userId) {
		 					$scope.user_list[i].locked = false;
		 					$scope.user_list[i].mustChange = true;
		 					$scope.submenu_id = '';
		 					break;
		 				}
		 			}
		 			return true;
		 		} else {
		 			$scope.submitFailMessage = response.data.responseMessage;
					$scope.submitFail = true;
		 			return false;
		 		}
		 	})
	}
	
	$scope.handleAuditLogDialogClose = function() {
	}
	
	$scope.generateAuditLog = function() {
		clearMessages();
		var userIdFromList = $scope.hoverUser.userId;
		userListResource.auditLog($rootScope.user_record.userId, userIdFromList);
	}

	$scope.setHoverContext = function(context, userId) {
		$scope.hoverContext = context;
		if (userId == -1)  return;
		for (i=0; i < $scope.user_list.length; i++){
			if ($scope.user_list[i].userId == userId) {
				$scope.hoverUser = $scope.user_list[i];
				break;
			}
		}
	}

}