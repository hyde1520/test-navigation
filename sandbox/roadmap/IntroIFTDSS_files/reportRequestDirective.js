mainApp.directive('reportRequestDirective',function(){
	return {
		templateUrl: "pages/report/reportRequestPopup.html",
		scope: {
			resource4Summary: '=sumresource',
			selectedReportType: '=',
			reportTypes: '=',
			addedNewResourceFlag: '=addedNewResourceFlag'
		  },
		controller: "reportRequestController"
	}
}).controller('reportRequestController',["$scope","$filter","$rootScope","$location","$timeout","$window","reportService","workspaceResource","breadcrumbResource",
  function($scope,$filter,$rootScope,$location,$timeout,$window,reportService,workspaceResource,breadcrumbResource){
	
	$scope.reportTypes =  reportService.getReportTypes();
	$scope.selectedReportType = false;
	$scope.disableGenerateButton = true;
	$scope.disableViewButton = true;
	$scope.displaySuccess = false;
	$scope.displayError = false;
	$scope.reportTypeToStatus = {};
	$scope.reportsStatus = {'raut': {},
			'rfhb': {},
			'rlcp': {},
			'rclp': {},
			'rcfb': {}};
	$scope.loading_label_class = "hide-with-fade";

	
	$scope.viewReportByType = function(selectedType) {
		var status = false;
		if ((typeof($scope.resource4Summary.summaryId) != 'undefined') && ($scope.resource4Summary.summaryId != -1 )) {
			//$location.path("/report/summary/"+ $scope.resource4Summary.summaryId + "/reportType/" + selectedType);
			$scope.openInNewTab("/report/summary/"+ $scope.resource4Summary.summaryId + "/reportType/" + selectedType);
		}
		else if ($scope.resource4Summary.resourceType == 'land') {
			var maskId = -1;
			if ( (typeof($scope.resource4Summary.mask) != 'undefined') && ($scope.resource4Summary.mask != null) && ($scope.resource4Summary.mask.shapeOrShapefileId)){
				maskId = $scope.resource4Summary.mask.shapeOrShapefileId;
			}
			var runId = -1;
			if (typeof($scope.modelRunId) != 'undefined') {
				runId = $scope.modelRunId;
			}
			else if ((typeof($scope.resource4Summary.runId) != 'undefined') && ($scope.resource4Summary.runId > 0)) {
				runId = $scope.resource4Summary.runId;
			}
			var landscapeId = $scope.resource4Summary.landscapeId;
			if ((typeof(landscapeId) == 'undefined') || (landscapeId == null) || (landscapeId == -1)) {
				landscapeId = $scope.resource4Summary.resourceId;
			}
			//Open New Window - this not working.. figure it out
			var new_path = "/report/reportType/" + selectedType + "/landscape/"+ landscapeId +"/shape/" + maskId + "/run/" + runId + '/';
			$scope.openInNewTab(new_path);
			//Open Here
			//$location.path("/report/reportType/" + selectedType + "/landscape/"+ landscapeId +"/shape/" + maskId + "/run/" + runId);
		}
		else if ($scope.resource4Summary.resourceType == 'run_') {
			var maskId = -1;
			if ((typeof($scope.resource4Summary.mask) != 'undefined')  && ($scope.resource4Summary.mask.shapeOrShapefileId)){
				maskId = $scope.resource4Summary.mask.shapeOrShapefileId;
			}
			var runId = -1;
			if (typeof($scope.resource4Summary.modelRunId) != 'undefined') {
				runId = $scope.modelRunId;
			}
			else if (typeof($scope.resource4Summary.resourceId) != 'undefined') {
				runId = $scope.resource4Summary.resourceId;
			}
			else if (typeof($scope.resource4Summary.runId) != 'undefined') {
					runId = $scope.resource4Summary.runId;
			}
		
			var landscapeId = $scope.resource4Summary.landscapeId;
			if (typeof(landscapeId) == 'undefined') {
				landscapeId = -1;
			}
			var new_path =("/report/reportType/" + selectedType + "/landscape/"+ landscapeId +"/shape/" + maskId + "/run/" + runId);
			$scope.openInNewTab(new_path);
			//$location.path("/report/reportType/" + selectedType + "/landscape/"+ landscapeId +"/shape/" + maskId + "/run/" + runId);
		}
		else if ($scope.resource4Summary.resourceType == 'rprt') {
			var summaryId = $scope.resource4Summary.summaryId;
			if ((typeof(summaryId) == 'undefined') || (summaryId == -1 )) {
				summaryId = $scope.resource4Summary.resourceId;
			}
			$scope.openInNewTab("/report/summary/"+ summaryId);
			//$location.path("/report/summary/"+ summaryId);
		}
		return status;
	}
	$scope.openInNewTab = function(new_path) {
		$window.open($location.$$absUrl.replace($location.$$path,new_path), '_iftdssRpt'); // in new tab
	}
	$scope.createReport = function(selectedType) {
	
		if (!$scope.resource4Summary) {
			console.log("$scope.resource4Summary is not set for create report");
			return;
		}
		
		var runId = -1;
		if (typeof($scope.resource4Summary.runId) != 'undefined') {
			runId = $scope.resource4Summary.runId;
		}
		var status = false;
		if ($scope.resource4Summary.resourceType == 'land') {
			var landscapeId = $scope.resource4Summary.landscapeId;
			if ((typeof(landscapeId) == 'undefined') || (landscapeId == -1))  {
				landscapeId = $scope.resource4Summary.resourceId;
			}
			var maskId = -1;
			if ((typeof($scope.resource4Summary.mask) != 'undefined')  && ($scope.resource4Summary.mask != null) && (typeof($scope.resource4Summary.mask.shapeOrShapefileId) != 'undefined')) {
				maskId = $scope.resource4Summary.mask.shapeOrShapefileId;
			}
			$scope.loading_label_class = "show-with-fade";
			reportService.getReport(landscapeId, maskId, runId, selectedType).then(function(response){
				$scope.handleCreateStatusResponse(response, selectedType);
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				$scope.addedNewResourceFlag++;
			},function(errorResponse){
				$scope.handleErrorMsg(response);
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
			});
		}
		else if ($scope.resource4Summary.resourceType == 'run_') {
			var landscapeId = $scope.resource4Summary.landscapeId;
			if (typeof(landscapeId) == 'undefined') {
				landscapeId = -1;
			}
			var maskId = -1;
			if ((typeof($scope.resource4Summary.mask) != 'undefined') && (typeof($scope.resource4Summary.mask.shapeOrShapefileId) != 'undefined')) {
				maskId = $scope.resource4Summary.mask.shapeOrShapefileId;
			}
			runId = -1;
			if ($scope.resource4Summary.runId) {
				runId = $scope.resource4Summary.runId;
				if (typeof(runId) == 'undefined') {
					runId = $scope.resource4Summary.resourceId;
				}
			}
			else {
				runId = $scope.resource4Summary.resourceId;
			}
			$scope.loading_label_class = "show-with-fade";
			reportService.getReport(landscapeId, maskId, runId, selectedType).then(function(response){
				//$scope.checkReport(selectedType);
				$scope.handleCreateStatusResponse(response, selectedType);
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				$scope.addedNewResourceFlag++;
				//$scope.$digest();
			},function(errorResponse){
				$scope.handleErrorMsg(response);
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
			});
		}
		return status;
	}
	
	
	
	$scope.checkReport = function(selectedType) {
		$scope.clearMessages();
		$scope.setupStatus4Reports();
		$scope.loading_label_class = "show-with-fade";
		return reportService.getReportStatusByTypes($scope.sumLandscapeId, $scope.sumShapeId, $scope.sumRunId, $scope.resource4Summary.reportTypeList).
		then(function(response){
			$scope.handleCheckStatusResponse(response, selectedType);
			$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
			return;
		},function(errorResponse){
			$scope.handleErrorResponse(response);
			$scope.gotStatus = true;
			$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
			return;
		});
	}
	
	$scope.setupStatus4Reports = function() {
		//$scope.clearMessages();
		
		$scope.resource4Summary.summaryId = -1;
		var runId = -1;  //for now - fix when have a true run id
		var shapeId = -1;
		if (($scope.resource4Summary.resourceType == 'land')  ||
			($scope.resource4Summary.resourceType == 'rprt') ||
			($scope.resource4Summary.resourceType == 'run_') ){
			
			var shapeId = -1;
			if ($scope.resource4Summary.mask) {
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

	
	$scope.handleCreateStatusResponse = function(response, reportType) {
		$scope.clearMessages();
		if (!$scope.resource4Summary) {
			console.log("$scope.resource4Summary not set for handleStatusResponse");
			return;
		}
		
		if ((typeof(response.data) != 'undefined') && (response.data != null) && (response.data != "")) {
			var responseData = response.data;
			var lcpSumRptResource = responseData.lcpSumRptResourceDO;
			if (responseData.success == false) {
				$scope.setErrorMsg(response.data.responseMessage);
			}
			else {
				if (responseData.summaryId) {
					$scope.resource4Summary.summaryId = responseData.summaryId;
				}
				if (typeof(lcpSumRptResource) == "undefined") {
					if (response.data.length > 0) {
						for (var i=0; i < response.data.length; i++) {
							if (response.data[i].reportType == reportType) {
								lcpSumRptResource = response.data[i];
								$scope.setStatus(lcpSumRptResource, reportType);
								break;
							}
						}
					}
				}
				else {
					$scope.setStatus(lcpSumRptResource, reportType);
				}
			}
		}
		else {
		 	console.log("calling setCreateStatus() - should not hit this.");
			$scope.setCreateStatus();
		}
	}
	$scope.handleCheckStatusResponse = function(response, reportType) {
		$scope.clearMessages();
		if (!$scope.resource4Summary) {
			console.log("$scope.resource4Summary not set for handleStatusResponse");
			return;
		}
		
		if ((typeof(response.data) != 'undefined') && (response.data != null) && (response.data != "")) {
			var responseData = response.data;
			var lcpSumRptResource = responseData.lcpSumRptResourceDO;
			if (responseData.summaryId) {
				$scope.resource4Summary.summaryId = responseData.summaryId;
			}
			for (var i=0; i < responseData.length; i++) {
				var lcpSumRptResource = responseData[i];
				$scope.modelRunId = lcpSumRptResource.basicRunId;
				var reportType = lcpSumRptResource.reportSubType;
				var reportName = reportService.getReportName(reportType);
				$scope.setStatus(lcpSumRptResource, reportType);
			}
		}
		else {
			console.log("calling setCreateStatus() - should not hit this.");
			$scope.setErrorStatus("Failed to update status");
		}
	}
	
	$scope.setStatus = function(summaryStatusRec, reportType) {
		var reportName = reportService.getReportName(reportType);
		if (summaryStatusRec.summaryStatus == "none") {
			$scope.resource4Summary.reportStatus[reportType].failedReport = false;
			$scope.resource4Summary.reportStatus[reportType].completeReport = false;
			$scope.resource4Summary.reportStatus[reportType].buildingReport = false;
			$scope.resource4Summary.reportStatus[reportType].notCreatedReport = true;
		}
		else if (summaryStatusRec.summaryStatus == "done") {
			$scope.resource4Summary.reportStatus[reportType].failedReport = false;
			$scope.resource4Summary.reportStatus[reportType].completeReport = true;
			$scope.resource4Summary.reportStatus[reportType].buildingReport = false;
			$scope.resource4Summary.reportStatus[reportType].notCreatedReport = false;
			$scope.resource4Summary.reportSuccessMessage = "The " + reportName + " has been created. Click the link to open the report in a new browser tab";
			$scope.resource4Summary.reportDisplaySuccess = true;

		}
		else if (summaryStatusRec.summaryStatus == "fail") {
			$scope.resource4Summary.reportStatus[reportType].failedReport = false;
			$scope.resource4Summary.reportStatus[reportType].completeReport = false;
			$scope.resource4Summary.reportStatus[reportType].buildingReport = false;
			$scope.resource4Summary.reportStatus[reportType].notCreatedReport = false;
			var errMsg = "Failed to create the " + reportName;
			if (summaryStatusRec.modelStatus == "fail") {
				errMsg += ":  " + summaryStatusRec.summaryStatusMsg;
			}
			$scope.resource4Summary.reportErrorMessage = errMsg;
			$scope.resource4Summary.reportDisplayError = true;
		}
		else if ((summaryStatusRec.summaryStatus == "init") || (summaryStatusRec.summaryStatus == "prt1") || (summaryStatusRec.summaryStatus == "prt2")) {
			$scope.resource4Summary.reportStatus[reportType].failedReport = false;
			$scope.resource4Summary.reportStatus[reportType].completeReport = false;
			$scope.resource4Summary.reportStatus[reportType].buildingReport = true;
			$scope.resource4Summary.reportStatus[reportType].notCreatedReport = false;
			$scope.resource4Summary.reportSuccessMessage = "The " + reportName + " is being built. Please check back in a few minutes";
			$scope.resource4Summary.reportDisplaySuccess = true;
		}
		else {
			$scope.setErrorMsg("Unknown report status " + summaryStatusRec.summaryStatus); 
		}
	}
	
	$scope.handleErrorResponse = function(response) {
		$scope.setErrorMsg(response.data); // Not sure
	}
	$scope.setInitialStatus = function() {
		$scope.clearMessages();
	}
	// TODO should be able to delete this
	$scope.setInProgressStatus = function(reportType) {
		$scope.setInfoMsg("Your report is being built. Please check back in a few minutes.");
		$scope.resource4Summary.reportStatus = $scope.reportsStatus;
		$scope.resource4Summary.reportStatus[reportType].failedReport = false;
		$scope.resource4Summary.reportStatus[reportType].completeReport = false;
		$scope.resource4Summary.reportStatus[reportType].buildingReport = true;
		$scope.resource4Summary.reportStatus[reportType].notCreatedReport = false;
	}
	$scope.setErrorMsg = function(msg) {
		$scope.resource4Summary.reportErrorMessage = msg;
		$scope.resource4Summary.reportDisplayError = true;
		$scope.resource4Summary.reportDisplaySuccess = false;
	}
	
	$scope.setInfoMsg = function(msg) {
		$scope.resource4Summary.reportSuccessMessage = msg;
		$scope.resource4Summary.reportDisplayError = false;
		$scope.resource4Summary.reportDisplaySuccess = true;
	}
	
	$scope.clearMessages = function() {
		$scope.resource4Summary.reportErrorMessage = "";
		$scope.resource4Summary.reportSuccessMessage = "";
		$scope.resource4Summary.reportDisplayError = false;
		$scope.resource4Summary.reportDisplaySuccess = false;
	}

}])