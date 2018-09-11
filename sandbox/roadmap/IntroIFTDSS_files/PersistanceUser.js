mainApp.service('persistanceUserService',["$window",persistanceUserService]);

function persistanceUserService($window) {
	
	this.getLoggedInUser = function() {
		if (typeof(Storage) !== "undefined") {
			return $window.sessionStorage.getItem("IFTpersistUser");
		}
	}	
	
	this.getLoggedInUserRole = function() {
		if (typeof(Storage) !== "undefined") {
			return $window.sessionStorage.getItem("IFTpersistUserRole");
		}
	}	
	
	this.setLoggedInUser = function(userId, role) {
		if (typeof(Storage) !== "undefined" && userId) {
			  $window.sessionStorage.setItem("IFTpersistUser", userId);
			  $window.sessionStorage.setItem("IFTpersistUserRole", role);
		}
	}
	
	this.removeLoggedInUser= function() {
		if (typeof(Storage) !== "undefined") {
			$window.sessionStorage.removeItem("IFTpersistUser");
			$window.sessionStorage.removeItem("IFTpersistUserRole");
		}
	}
	
}