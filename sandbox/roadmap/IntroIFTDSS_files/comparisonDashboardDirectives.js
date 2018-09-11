mainApp.directive('landscapeSummaryIncludeDirective',function(){
	return {
		templateUrl: "pages/report/summary.html",
		scope: {summaryData:'='},
		controller: "landscapeSummaryController"
	}
})
.directive('landscapeEditIncludeDirective',function(){
	return {
		templateUrl: "/pages/landscape/editLandscape.html",
		scope: {newLandscape:'='},
		controller: "editLandscapeController"
	}
})