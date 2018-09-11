mainApp.directive('compareReportButtonDirective',function(){
	return {
		templateUrl: "pages/report/compareReportButton.html",
		scope: false,
		controller: "compareReportButtonController"
	}
}).controller('compareReportButtonController',["$scope","$filter","$rootScope","$location","$timeout", "$window", "reportService",
  function($scope,$filter,$rootScope,$location,$timeout, $window, reportService){
	
	//var selectedLandscapes = $scope.getSelectedLandscapes();
	
	//$scope.reportTypes =  reportService.reportTypes;
	$scope.selectedReportType = false;
	$scope.data = {};
	$scope.displaySuccess = false;
	$scope.displayError = false;
	$scope.compareResources = {};
	$scope.containingReports = ['rlcp','rfbh'];
	$scope.compareRequest = { 'compareSummaryId':'',
								'ownerId':'',
								'reportName' : '',
								'reportType': '',
							  'reportTypes':'',
							  'landscapeRunList': []
							};
	$scope.compareStatusByReportType = {};
	$scope.reportStatus = {'rclp': {},
							'rcfb': {}};
	$scope.reportSummaryIds = {'rclp': -1, 'rcfb': -1};
	$scope.reportTypes = "";
	$scope.loading_label_class = "hide-with-fade";
	

	//openCompareReportPopup()
	$scope.openCompareReportPopup = function() {
		$scope.anObj = {}
		$scope.reportTypes = reportService.initializeReportResource( $scope.anObj, "compare");
		$scope.compareResources = $scope.getSelectedLandscapes();
		$scope.compareRequest.ownerId = $rootScope.user_record.userId;
		$scope.hasAOI = false;
		$scope.compareRequest.areaOfInterestId = -1;
		if ($scope.selectedAOI) {
			$scope.hasAOI = true;
			$scope.compareRequest.areaOfInterestId = $scope.selectedAOI.shapeOrShapefileId;
		}
		
		//$scope.compareRequest.reportType = null;
		var reportTypeNameList = [];
		for (var i=0; i < $scope.reportTypes.length; i++) {
			reportTypeNameList.push($scope.reportTypes[i].type);
		}
		$scope.compareRequest.reportTypes = reportTypeNameList;
		$scope.compareRequest.reportName = "Comparison Summary Reports";
		 for (var i=0; i < $scope.compareResources.length; i++) {
			 var compareResource = $scope.compareResources[i];
			 var order = compareResource.order;
			 $scope.compareRequest.landscapeRunList[order - 1] = {};
			 $scope.compareRequest.landscapeRunList[order - 1].landscapeId = compareResource.landscapeId;
			 var runId = -1;
			 if (compareResource.modelRunId) {
				 runId = compareResource.modelRunId;
			 }
			 $scope.compareRequest.landscapeRunList[order - 1].runId = runId;
		 }
		 $scope.compareRequest.compareSummaryId = -1;
		 return reportService.getCompareReportStatusByTypes($scope.compareRequest).
			then(function(response){
				$scope.compareStatusByReportType = response.data.typeToLcpSumRptResourceDOList;
				var typeToIdMap = response.data.reportTypeToSummaryId;
				if ((typeToIdMap != null) && (typeof(typeToIdMap) != "undefined")) {
					for (var reportType in typeToIdMap ) {
						$scope.reportSummaryIds[reportType] = typeToIdMap[reportType];
					}
				}
				$scope.setInitialStatus();
				return;
			},function(errorResponse){
				$scope.handleErrorResponse(response);
				$scope.gotStatus = true;
				return;
			});
	}
	$scope.createReport = function(selectedType) {
		 $scope.compareRequest.compareSummaryId = -1;
		 $scope.compareRequest.reportType = selectedType;
		 $scope.compareRequest.areaOfInterestId = -1;
		 if ((typeof($scope.selectedAOI) != 'undefined') &&
			 ($scope.selectedAOI != null) ) {
			 $scope.compareRequest.areaOfInterestId = $scope.selectedAOI.shapeOrShapefileId;
		 }
		 $scope.loading_label_class = "show-with-fade";
		 return reportService.createCompareReport($scope.compareRequest).
			then(function(response){
				$scope.compareStatusByReportType = response.data.typeToLcpSumRptResourceDOList;
				var typeToIdMap = response.data.reportTypeToSummaryId;
				if ((typeToIdMap != null) && (typeof(typeToIdMap) != "undefined")) {
					for (var reportType in typeToIdMap ) {
						$scope.reportSummaryIds[reportType] = typeToIdMap[reportType];
					}
				}
				$scope.updateStatus();
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				return;
			},function(errorResponse){
				$scope.handleErrorResponse(response);
				$scope.gotStatus = true;
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				return;
			});
		 return status;
	}
	$scope.checkReport = function(selectedType) {
		 $scope.compareRequest.compareSummaryId = -1;
		 $scope.compareRequest.reportType = selectedType;
		 $scope.loading_label_class = "show-with-fade";
		 return reportService.getCompareReportStatusByTypes($scope.compareRequest).
			then(function(response){
				$scope.compareStatusByReportType = response.data.typeToLcpSumRptResourceDOList;
				var typeToIdMap = response.data.reportTypeToSummaryId;
				if ((typeToIdMap != null) && (typeof(typeToIdMap) != "undefined")) {
					for (var reportType in typeToIdMap ) {
						$scope.reportSummaryIds[reportType] = typeToIdMap[reportType];
					}
				}
				$scope.updateStatus();
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				return;
			},function(errorResponse){
				$scope.handleErrorResponse(response);
				$scope.gotStatus = true;
				$timeout(function() { $scope.loading_label_class = "hide-with-fade"; }, 350);
				return;
			});
	}
	$scope.setInitialStatus = function() {
			
		$scope.reportStatus.displaySuccess = false;
		$scope.reportStatus.displayError = false;
		
		for (var i=0; i < $scope.containingReports.length; i++) {
			var containingReportType = $scope.containingReports[i];
			var containingReportStatus = $scope.compareStatusByReportType[containingReportType];
			var reportName = reportService.getReportName(containingReportType);
			var reportType = "rclp";
			if (containingReportType == "rfbh") {
				reportType = "rcfb";
			}
		
			var compareReportId = $scope.reportSummaryIds[reportType];
			
			var status = "";
			var failureMsg = null;
			if (compareReportId == -1) {
				status = "notCreated";
			}
			else {
				for (var j=0; j < containingReportStatus.length; j++) {
					if (containingReportStatus[j].summaryStatus  == null) {
						if ((status == "") || (status == "created") || (status == "building") ) {
							status = "notCreated";
						}
					}
					else if (containingReportStatus[j].summaryStatus  == "done") {
						if (status == "" )  {
							status = "created";
						}
					}
					else if (containingReportStatus[j].summaryStatus  == "fail") {
						status = "failed";
						failureMessage = containingReportStatus[j].summaryStatusMsg;
						
					}
					else {
						if ((status == "") || (status != "fail"))  {
							status = "building";
						}
					}
				}
			}
			if (status == "notCreated") {
				$scope.reportStatus[reportType].failedReport = false;
				$scope.reportStatus[reportType].buildingReport = false;
				$scope.reportStatus[reportType].completeReport = false;
				$scope.reportStatus[reportType].notCreatedReport = true;
			}
			else if (status == "created") {
				$scope.reportStatus[reportType].failedReport = false;
				$scope.reportStatus[reportType].buildingReport = false;
				$scope.reportStatus[reportType].completeReport = true;
				$scope.reportStatus[reportType].notCreatedReport = false;
				$scope.reportStatus.successMessage = "The " + reportName + " has been created. Click the link to open the report in a new browser tab";
				$scope.reportStatus.displaySuccess = true;
			}
			else if (status == "building") {
				$scope.reportStatus[reportType].failedReport = false;
				$scope.reportStatus[reportType].buildingReport = true;
				$scope.reportStatus[reportType].completeReport = false;
				$scope.reportStatus[reportType].notCreatedReport = false;
				$scope.reportStatus.successMessage = "The " + reportName + " is being built. Please check back in a few minutes";
				$scope.reportStatus.displaySuccess = true;
			
			}
			else if (status == "failed") {
				$scope.reportStatus[reportType].failedReport = true;
				$scope.reportStatus[reportType].buildingReport = false;
				$scope.reportStatus[reportType].completeReport = false;
				$scope.reportStatus[reportType].notCreatedReport = false;
				$scope.reportStatus.errorMessage = "Failed to create the " + reportName + ". ";
				if (failureMessage != null ) {
					$scope.reportStatus.errorMessage = failureMessage;
				}
				$scope.reportStatus.errorMessage += " You can delete this report from your workspace and try to generate it again. Individual reports used to build this one may have failed and should be deleted as well. ";
				
				$scope.reportStatus.displayError = true;

			}
		}
	}
	
	$scope.viewReportByType = function(selectedType) {
		var compareSummaryId = $scope.reportSummaryIds[selectedType];
		//$location.path("/report/compare/"+ compareSummaryId + "/reportType/" + selectedType);
		$scope.openInNewTab("/report/compare/"+ compareSummaryId + "/reportType/" + selectedType);
	}
	
	$scope.openInNewTab = function(new_path) {
		$window.open($location.$$absUrl.replace($location.$$path,new_path), '_cmprpt'); // in new tab
	}

	function hideSuccessNotification() {
		$scope.reportStatus.displaySuccess = false; 
		$scope.reportStatus.successMessage = "";
	}

	$scope.updateStatus = function() {
		
		for (var i=0; i < $scope.containingReports.length; i++) {
			var containingReportType = $scope.containingReports[i];
			var containingReportStatus = $scope.compareStatusByReportType[containingReportType];
			var reportName = reportService.getReportName(containingReportType);
			
			var reportType = "rclp";
			if (containingReportType == "rfbh") {
				reportType = "rcfb";
			}
			// When getting status for one report, don't automatically get status for others in the popup.
			// The user may not have requested it and if part of it is done, it will show a 'building' 
			// status which won't be valid.  The other part of the compare report for this other type
			// won't ever get triggered
			if ($scope.compareRequest.reportType && ($scope.compareRequest.reportType != reportType)) {
				continue;  // Only get status for the one being request. 
			}
			
			var containingReportStatus = $scope.compareStatusByReportType[containingReportType];
			if ((containingReportStatus == null) || (typeof(containingReportStatus) == "undefined")) {
				continue;
			}
			var status = "";
			var failureMessage = null;
			for (var j=0; j < containingReportStatus.length; j++) {
				if (containingReportStatus[j].summaryStatus  == null) {
					if (status == "") {
						status = "notCreated";
					}
				}
				else if (containingReportStatus[j].summaryStatus  == "done") {
					if (status == "")  {
						status = "created";
					}
				}
				else if (containingReportStatus[j].summaryStatus  == "fail") {
					status = "failed";
					failureMessage = containingReportStatus[j].summaryStatusMsg;
				}
				else {  // If you get here the report is in 'init' state so it's building unless
					// the first single report for this compare one failed.
					if ((status == "") || (status == "created") || (status == "notCreated")) {
						status = "building";
					}
				}
			}
			if (status == "notCreated") {
				$scope.reportStatus[reportType].failedReport = false;
				$scope.reportStatus[reportType].buildingReport = false;
				$scope.reportStatus[reportType].completeReport = false;
				$scope.reportStatus[reportType].notCreatedReport = true;
			}
			else if (status == "created") {
				$scope.reportStatus[reportType].failedReport = false;
				$scope.reportStatus[reportType].buildingReport = false;
				$scope.reportStatus[reportType].completeReport = true;
				$scope.reportStatus[reportType].notCreatedReport = false;
				$scope.reportStatus.successMessage = "The " + reportName + " has been created. Click the link to open the report in a new browser tab";
				$scope.reportStatus.displaySuccess = true;
			}
			else if (status == "building") {
				$scope.reportStatus[reportType].failedReport = false;
				$scope.reportStatus[reportType].buildingReport = true;
				$scope.reportStatus[reportType].completeReport = false;
				$scope.reportStatus[reportType].notCreatedReport = false;
				$scope.reportStatus.successMessage = "The " + reportName + " is still being built. Please check back in a few minutes";
				$scope.reportStatus.displaySuccess = true;
				$timeout(hideSuccessNotification, 4000);
			}
			else if (status == "failed") {
				$scope.reportStatus[reportType].failedReport = true;
				$scope.reportStatus[reportType].buildingReport = false;
				$scope.reportStatus[reportType].completeReport = false;
				$scope.reportStatus[reportType].notCreatedReport = false;
				$scope.reportStatus.errorMessage = "Failed to create the " + reportName + ". ";
				if (failureMessage != null ) {
					$scope.reportStatus.errorMessage = failureMessage;
				}
				$scope.reportStatus.errorMessage += "You can delete this report from your workspace and try to generate this report at a later time.";
				
				$scope.reportStatus.displayError = true;
			}
		}
	}
	
	
	
	$scope.clearMessages = function() {
		$scope.reportStatus.successMessage = "";
		$scope.reportStatus.errorMessage = "";
		$scope.compareRequest.displayError = false;
		$scope.compareRequest.displaySuccess = false;
	}	
	
	/*
	$scope.setInitialStatus = function() {
		$scope.gotStatus = false;
		$scope.clearMessages();
		$scope.setupStatus4Reports();
		if ((!$scope.resource4Summary.reportTypeList) || (typeof($scope.resource4Summary.reportTypeList) == "undefined") ){
			$scope.resource4Summary.reportTypeList = $scope.reportTypeList;
		}
		return reportService.getReportStatusByTypes($scope.sumLandscapeId, $scope.sumShapeId, $scope.sumRunId, $scope.resource4Summary.reportTypeList).
		then(function(response){
			$scope.resource4Summary.reports  = response.data;
			return;
		},function(errorResponse){
			$scope.handleErrorResponse(response);
			$scope.gotStatus = true;
			return;
		});
	}
	
	
	$scope.setupStatus4Reports = function() {
		$scope.clearMessages();
		
		$scope.resource4Summary.summaryId = -1;
		var runId = "0";  //for now - fix when have a true run id
		var shapeId = -1;
		if (($scope.resource4Summary.resourceType == 'land')  ||
			($scope.resource4Summary.resourceType == 'rprt') ||
			($scope.resource4Summary.resourceType == 'run_') ){
			
			var maskId = -1;
			if ((!$scope.resource4Summary.mask) || (typeof($scope.resource4Summary.mask) == "undefined") ){
				$scope.resource4Summary.mask = $scope.mask;
			}

			if ($scope.resource4Summary.mask) {
				if ($scope.resource4Summary.mask.shapeOrShapefileId) {
					maskId = $scope.resource4Summary.mask.shapeOrShapefileId;
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
	}*/

	/*TODO: Remove soon
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
			//( $scope.resource4Summary.resourceType == 'rprt') || 
			(($scope.resource4Summary.resourceType == 'run_') &&
					
			(($scope.resource4Summary.runStatus == 'done') ||
					($scope.resource4Summary.modelRunStatus == 'Completed') )
			)){
			// $scope.selectedReportType = false;
			// REMOVE - reportService.setReportTypes($scope.resource4Summary);
			if ($scope.mask) {
				$scope.resource4Summary.mask = $scope.mask;
			}
			return (true);
		}
		return (false);
	}*/
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
	

	/*
	$scope.setInitialStatus2 = function() {
		$scope.gotStatus = false;
		$scope.disableGenerateButton = true;
		$scope.disableViewButton = true;
		$scope.$parent.selectedReportType = false;
		$scope.clearMessages();
	}*/

}])