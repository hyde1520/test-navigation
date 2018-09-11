mainApp.directive('reportButtonDirective',function(){
	return {
		templateUrl: "pages/report/reportRequestButton.html",
		scope: {
				resource4Summary: '=input',
				runId: '=runid',
				mask: '=optinput',
				showbutton: '=showbutton',
				textbutton: "=textbutton",
				disablebut: "=disablebut",
				model: "@model",
				summarybutton: '@summarybutton'
			   },
		link: {
			
		},
		controller: "reportButtonController"
	}
}).controller('reportButtonController',["$scope","$filter","$rootScope","$location", "$timeout","reportService","workspaceResource","breadcrumbResource",
  function($scope,$filter,$rootScope,$location,$timeout, reportService,workspaceResource,breadcrumbResource){
	
	$scope.reportTypes =  reportService.reportTypes;
	if (typeof($scope.textbutton) == 'undefined') {
		$scope.textbutoon = true;
	}
	$scope.selectedReportType = false;
	$scope.data = {};
	$scope.disableGenerateButton = true;
	$scope.disableViewButton = true;
	$scope.displaySuccess = false;
	$scope.displayError = false;
	$scope.reportsStatus = {'raut': {},
			'rfbh': {},
			'rlcp': {},
			'rclp': {},
			'rcfb': {}};
		
	$scope.canOpenReport = function() {
		if ($scope.disablebut == true) {
			return false;
		}
		$scope.clearMessages();
		$scope.popupLCPName = "Unspecified Landscape Name";
		if (typeof($scope.resource4Summary) == 'undefined') {
			return (false);
		}
		if (( $scope.resource4Summary.resourceType == 'land') || 
			(($scope.resource4Summary.resourceType == 'run_') &&
					
			(($scope.resource4Summary.runStatus == 'done') ||
					($scope.resource4Summary.modelRunStatus == 'Completed') )
			)){
			if ($scope.mask) {
				$scope.resource4Summary.mask = $scope.mask;
			}
			return (true);
		}
		return (false);
	}
/*	$scope.rerunSummary = function() {
		var status = false;
		if ($scope.resource4Summary.summaryId) {
			reportService.rerunSummary($scope.resource4Summary.summaryId).
			then(function(response){
				if (response.data.success == false) {
					$scope.setSummaryStatusFailed($scope.resource4Summary);
				}
				else {
					$scope.setSummaryBuilding(response, $scope.resource4Summary);
				}
			},function(errorResponse){
				$scope.setSummaryStatusFailed($scope.resource4Summary);
			});
		}
		return status;
	}*/
	
	$scope.setupStatus4Reports = function() {
		$scope.clearMessages();
		
		$scope.resource4Summary.summaryId = -1;
		var runId = "0";  //for now - fix when have a true run id
		var shapeId = -1;
		if (($scope.resource4Summary.resourceType == 'land')  ||
			($scope.resource4Summary.resourceType == 'rprt') ||
			($scope.resource4Summary.resourceType == 'run_') ){
			
			if ((!$scope.resource4Summary.mask) || (typeof($scope.resource4Summary.mask) == "undefined") ){
				$scope.resource4Summary.mask = $scope.mask;
			}

			if ((typeof($scope.resource4Summary.mask) != 'undefined') && ($scope.resource4Summary.mask != null)) {
				if ($scope.resource4Summary.mask.shapeId > 0) {
					$scope.resource4Summary.mask.shapeOrShapefileId = $scope.resource4Summary.mask.shapeId;
				}
				if ($scope.resource4Summary.mask.shapeOrShapefileId) {
					shapeId = $scope.resource4Summary.mask.shapeOrShapefileId;
				}
			}
			if ($scope.resource4Summary.resourceType == 'run_')  {
				runId = $scope.resource4Summary.resourceId;
				if (typeof(runId) == 'undefined') {
					runId = $scope.resource4Summary.runId;
				}
			}
			else if ($scope.resource4Summary.runId) {
				runId = $scope.resource4Summary.runId;
			}
				
			var landscapeId  = -1;
			if (($scope.resource4Summary.resourceType == 'land') &&
				((typeof(landscapeId) == 'undefined') || (landscapeId == -1)) ) {
				landscapeId = $scope.resource4Summary.resourceId;
				if ((typeof( landscapeId) == 'undefined')) {
					landscapeId = $scope.resource4Summary.landscapeId;
				}
			}
			else if ((typeof( $scope.resource4Summary.landscapeId) != 'undefined')) {
				landscapeId = $scope.resource4Summary.landscapeId;
			}
			$scope.sumLandscapeId = landscapeId;
			$scope.sumRunId = runId;
			$scope.sumShapeId = shapeId;
		}
	}
	
	$scope.setInitialStatus = function() {
		$scope.gotStatus = false;
		$scope.clearMessages();
		$scope.setupStatus4Reports();
		if ((!$scope.resource4Summary.reportTypeList) || (typeof($scope.resource4Summary.reportTypeList) == "undefined") ){
			if ($scope.reportTypeList) {
				$scope.resource4Summary.reportTypeList = $scope.reportTypeList;
			}
			else {
					$scope.resource4Summary.reportTypeList = $scope.reportTypes;
					if (!$scope.resource4Summary.reportTypeList) {
						$scope.resource4Summary.reportTypeList = reportService.reportTypes;
						if ((!$scope.resource4Summary.reportTypeList) && ($scope.$parent)) {
							$scope.resource4Summary.reportTypeList = $scope.$parent.reportTypes;
						}
					}
			}
		}
		return reportService.getReportStatusByTypes($scope.sumLandscapeId, $scope.sumShapeId, $scope.sumRunId, $scope.resource4Summary.reportTypeList).
		then(function(response){
			$scope.handleStatusResponse(response.data);
			return;
		},function(errorResponse){
			$scope.handleErrorResponse(response);
			$scope.gotStatus = true;
			return;
		});
	}

	$scope.handleStatusResponse = function(responseData) {
		$scope.resource4Summary.reportStatus = $scope.reportsStatus;
		$scope.resource4Summary.reportdisplayError = false;
		$scope.resource4Summary.reportdisplaySuccess = false;
		for (var i=0; i < responseData.length; i++) {
			var lcpSumRptResource = responseData[i];
			if (typeof(lcpSumRptResource) == 'undefined') continue;
			if (typeof(lcpSumRptResource.basicRunId) != 'undefined' ) {
				$scope.resource4Summary.runId = lcpSumRptResource.basicRunId;
			}
			var reportType = lcpSumRptResource.reportSubType;
			var reportName = reportService.getReportName(reportType);
			if (lcpSumRptResource.summaryStatus == "none") {
				$scope.resource4Summary.reportStatus[reportType].failedReport = false;
				$scope.resource4Summary.reportStatus[reportType].completeReport = false;
				$scope.resource4Summary.reportStatus[reportType].buildingReport = false;
				$scope.resource4Summary.reportStatus[reportType].notCreatedReport = true;
			}
			else if (lcpSumRptResource.summaryStatus == "fail") {
				$scope.resource4Summary.reportStatus[reportType].failedReport = false;
				$scope.resource4Summary.reportStatus[reportType].completeReport = false;
				$scope.resource4Summary.reportStatus[reportType].buildingReport = false;
				$scope.resource4Summary.reportStatus[reportType].notCreatedReport = false;
				var errMsg = "Failure occurred: " + lcpSumRptResource.summaryStatusMsg;
				if (lcpSumRptResource.modelStatus == "fail") {
					errMsg += ". The Auto 97th fire behavior model run failed.";
				}
				$scope.resource4Summary.reportErrorMessage = errMsg;
				$scope.resource4Summary.reportDisplayError = true;
			}
			else if (lcpSumRptResource.summaryStatus == "done") {
				$scope.resource4Summary.reportStatus[reportType].failedReport = false;
				$scope.resource4Summary.reportStatus[reportType].completeReport = true;
				$scope.resource4Summary.reportStatus[reportType].buildingReport = false;
				$scope.resource4Summary.reportStatus[reportType].notCreatedReport = false;
				$scope.resource4Summary.reportSuccessMessage = "The " + reportName + " has been created. Click the link to open the report";
				$scope.resource4Summary.reportDisplaySuccess = true;
			}
			else if ((lcpSumRptResource.summaryStatus == "init") || 
					(lcpSumRptResource.summaryStatus == "prt1")) {
				$scope.resource4Summary.reportStatus[reportType].failedReport = false;
				$scope.resource4Summary.reportStatus[reportType].completeReport = false;
				$scope.resource4Summary.reportStatus[reportType].buildingReport = true;
				$scope.resource4Summary.reportStatus[reportType].notCreatedReport = false;
				$scope.resource4Summary.reportSuccessMessage = "The " + reportName + " is being built. Please check back in a few minutes";
				$scope.resource4Summary.reportDisplaySuccess = true;
			}
		}
	}
	$scope.clearMessages = function() {
		$scope.resource4Summary.reportSuccessMessage = "";
		$scope.resource4Summary.reportErrorMessage = "";
		$scope.resource4Summary.reportDisplayError = false;
		$scope.resource4Summary.reportDisplaySuccess = false;
	}

}])