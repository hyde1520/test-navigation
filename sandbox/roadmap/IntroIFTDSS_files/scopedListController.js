mainApp.controller("scopedListController",["$scope",scopedListController])

function scopedListController($scope) {
	$scope.toggle_scoped = function(index) {
		console.log($scope.list[index])
		if (!$scope.list[index]) {
			return;
		} else if (!$scope.list[index].scoped) {
			$scope.list[index].scoped = true;
		} else if ($scope.list[index].scoped) {
			$scope.list[index].scoped = false;
		}
	}
}

mainApp.directive("scopedList",function(){
	return {
		templateUrl: "pages/comparisonDashboard/scopedList.html",
		scope: {list:'='},
		controller: "scopedListController"
	}
});