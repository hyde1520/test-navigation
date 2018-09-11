mainApp.factory('reportService', ['$http','$rootScope','__env', reportService]);

function reportService ($http, $rootScope,__env)
{
  var _reportLandscapes = null;
  var _landscapeMasks = null;
  var _compareRequest =  {
		reportName: '',
		reportType: 'rlcp',
		landscapes: [],
		runids: []
	}

  var service = {};
  
  // TODO: Remove this arrays after implementing the new report dialog 
  
  service.reportModelTypesMap = [];
  service.reportModelTypesMap.push({type: 'rfbh', name: 'Model Run Report'});
  service.reportModelTypes = [];
  service.reportModelTypes.push('rfbh');
  
  service.reportLcpTypesMap = [];
  service.reportLcpTypesMap.push({type: 'rlcp', name: 'Landscape Report'});
  service.reportLcpTypes = [];
  service.reportLcpTypes.push('rlcp');
  
  service.reportAutoTypesMap = [];
  service.reportAutoTypesMap.push({type: 'raut', name: 'Auto97th Percentile Fire Behavior Report'});
  service.reportAutoTypes = [];
  service.reportAutoTypes.push('raut');
  
  
  service.reportTypesSummaryMap = [];
  service.reportTypesSummaryMap.push({type: 'rlcp', name: 'Landscape Report'});
  service.reportTypesSummaryMap.push({type: 'raut', name: 'Auto97th FB Report'});
  service.reportSummaryTypes = [];
  service.reportSummaryTypes.push('rlcp');
  service.reportSummaryTypes.push('raut');
  
  service.reportTypesCompareMap = [];
  service.reportTypesCompareMap.push({type: 'rclp', name: 'Landscape Compare SummaryReport'});
  service.reportTypesCompareMap.push({type: 'rcfb', name: 'Fire Behavior Compare Summary Report'});
  service.reportTypesCompare = [];
  service.reportTypesCompare.push('rclp');
  service.reportTypesCompare.push('rcfb');
  
  
  service.reportTypesAll = {
		  'rlcp': 'Landscape Summary Report',
		  'rfbh': 'Fire Behavior Summary Report',
		  'raut': 'Landscape/Auto97th Fire Behavior Summary Report',
		  'rclp': 'Landscape Compare Summary Report',
		  'rcfb': 'Fire Behavior Compare Summary Report'};
  
  service.getLandscapeMasks = function()  { return this._landscapeMasks; }
  
  
  service.getReportName = function(reportType) {
	  return service.reportTypesAll[reportType];
  }
  
  // Load report types to display in the popup on various app pages
  service.initializeReportResource = function(resource4Summary, page) {
	  resource4Summary.reportTypeList = [];
	  if (page == "compare") {
	  		resource4Summary.reportTypeList = service.reportTypesCompare;
	  }
	  else if (page == "workspace") {
			if (resource4Summary.resourceType == "land") {
				resource4Summary.reportTypeList.push("rlcp");
			}
			else if (resource4Summary.resourceType == "run_") {
				if (resource4Summary.resourceName.startsWith("Auto")) {
					resource4Summary.reportTypeList = service.reportAutoTypes;
				}
				else {
					resource4Summary.reportTypeList= service.reportModelTypes;
				}
			}
	  }
	  else if (page == "summary") {
	  		resource4Summary.reportTypeList = service.reportAutoTypes;
	  }
	  else if (page == "playground") {
		  if (resource4Summary.resourceType == "run_") {
			if (resource4Summary.resourceName.startsWith("Auto")) {
				resource4Summary.reportTypeList = service.reportAutoTypes;
			}
			else {
				resource4Summary.reportTypeList= service.reportModelTypes;
			}
		  }
	  }
	  else if (page == "landscapeDir") {
	  	resource4Summary.reportTypeList = service.reportLcpTypes;
	  }
	 service.reportTypes = [];
	 for (var i=0; i < resource4Summary.reportTypeList.length; i++) {
		 if (resource4Summary.reportTypeList[i] == "rlcp") {
			 service.reportTypes.push({type: 'rlcp', name: 'Landscape Report'});
		 }
		 else if (resource4Summary.reportTypeList[i] == "raut") {
			 service.reportTypes.push({type: 'raut', name: 'Landscape/Auto97th Fire Behavior Report'});
		 }
		 else if (resource4Summary.reportTypeList[i] == "rfbh") {
			 service.reportTypes.push({type: 'rfbh', name: 'Model Run Report'});
		 }
		 else if (resource4Summary.reportTypeList[i] == "rclp") {
			 service.reportTypes.push({type: 'rclp', name: 'Landscape Compare Summary Report'});
		 }
		 else if (resource4Summary.reportTypeList[i] == "rcfb") {
			 service.reportTypes.push({type: 'rcfb', name: 'Fire Behavior Compare Summary Report'});
		 }
	 }
	 return service.reportTypes;
  }
	  /*
  service.getReportTypeList = function(resource4Summary) {
		if (resource4Summary.resourceType == "run_") {
			service.reportTypes = [];
			if (resource4Summary.resourceName.startsWith("Auto")) {
				service.reportTypes.push({type: 'raut', name: 'Auto97th Fire Behavior Report'});
			 }
			 else  {
				 service.reportTypes.push({type: 'rcfb', name: 'Model Compare Report'});
			 }
		}
		return service.reportTypes;
  }*/
  
  
  service.createCompareReport = function(compareReportRequest) {
	  var compareReportRequestStr = JSON.stringify(compareReportRequest);
	  console.log(compareReportRequestStr);
	 
	  return $http({
	      method: 'PUT',
	      url: __env.src("/iftdssREST/report/compare"),
	      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	      data: $.param({"data":compareReportRequestStr})
	    }).
	    then(function(response) {
	    	/*if (response && response.data && response.data.entityId) {
	    		var landscape = createLandscapeObject(input, response.data.entityId);
	    		_allLandscapes.push(landscape);
	    		//TODO: should we push it also on to this._zeroLandscapes ?fi
	    		$rootScope.createdLandscape = landscape;
	    		$rootScope.landscapeCreatedFlag = true;
	    	}*/
	        return response;
	      }, function(response) {
	        return response || {data:{message: "Request failed"}};
	    });

	  }
  
  
  service.getCompareReportStatusByTypes = function(compareReportRequest) {
	  var compareReportRequestStr = JSON.stringify(compareReportRequest);
	  console.log(compareReportRequestStr);
	  return $http({
	      method: 'PUT',
	      url: __env.src("/iftdssREST/report/status/compare"),
	      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	      data: $.param({"data":compareReportRequestStr})
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
   }

/* REMOVE
  service.setReportTypes = function(resource4Summary) {
	  if (resource4Summary.resourceType == "run_") {
		  service.reportTypes = service.reportModelTypes;
	  }
	  else {
		  service.reportTypes = service.reportTypesNoModel;
	  }
  }*/
  
 service.getReportTypes = function() {
	  return service.reportTypes;
  }

  service.getReport = function(landscapeId, shapeId, runId, reportType) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/report/reportType/" + reportType + "/landscape/" + landscapeId + "/shape/" + shapeId + "/run/" + runId)
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }
  service.getLandscapeSummaryBySubType = function(landscapeId, shapeId, runId, reportSubType) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/report/reportType/" + reportSubType + "/landscape/" + landscapeId + "/shape/" + shapeId + "/run/" + runId)
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }
  service.getLandscapeSummaryStatus = function(summaryId) {
	  return $http({
		  method: 'GET',
		  url:__env.src("/iftdssREST/report/status/" + summaryId)
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }
  // TODO: This can be deleted later.  This supported reports before we added report types
  // When you delete this, also delete the REST Java code.
  /*
  service.getLandscapeSummaryStatusByLandscapeIdShapeId = function(landscapeId, shapeId, runId) {
	  return $http({
		  method: 'GET',
		  url: "/iftdssREST/report/status/landscape/" + landscapeId + "/shape/" + shapeId + "/run/"+ runId
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }*/
  service.getReportStatus = function(landscapeId, shapeId, runId, reportType) {
	  return $http({
		  method: 'GET',
		  url: "/iftdssREST/report/status/reportType/" + reportType + "/landscape/" + landscapeId + "/shape/" + shapeId + "/run/"+ runId
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }
  
  // Get report status for all possible reports available within the context of this request
  service.getReportStatusByTypes = function(landscapeId, shapeId, runId, reportTypes) {
	  var typesStr = service.getReportTypesStr(reportTypes);
	  return $http({
		  method: 'GET',
		  url: "/iftdssREST/report/status/reportTypes/" + typesStr + "/landscape/" + landscapeId + "/shape/" + shapeId + "/run/"+ runId
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }

  service.getReportTypesStr = function(typesArr) {
	  // Build csv of the report types to pass as a parameter
	  var reportTypesStr = "";
	  for (var i=0; i < typesArr.length; i++) {
		  if (i > 0) {
			  reportTypesStr += ",";
		  }
		  if (typesArr[i].type) {
			  reportTypesStr += typesArr[i].type;
		  }
		  else {
			  reportTypesStr += typesArr[i];
				 
		  }
	  }
	  return reportTypesStr;
  }
  
 /* service.getReportTypesStr = function(typesArr) {
	  // Build csv of the report types to pass as a parameter
	  var reportTypesStr = "";
	  for (var i=0; i < typesArr.length; i++) {
		  if (i > 0) {
			  reportTypesStr += ",";
		  }
		  reportTypesStr += typesArr[i].type;
	  }
	  return reportTypesStr;
  }*/

  service.getSummary = function(summaryId) {
	  return $http( {
		  method: 'GET',
		  url: __env.src("/iftdssREST/report/summary/" + summaryId)
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }

  service.getCompareSummary = function(summaryId, reportType) {
	  return $http( {
		  method: 'GET',
		  url: __env.src("/iftdssREST/report/compare/" + summaryId + "/reportType/" + reportType )
	  }).then(function(response){
		  return response.data;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }
  
  service.getSummaryReport = function(summaryId, reportType) {
	  return $http( {
		  method: 'GET',
		  url: __env.src("/iftdssREST/report/summary/" + summaryId + "/reportType/" + reportType)
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  	}
  
	service.getCompareReport = function(compareReportData)
	{
		var sendData = JSON.stringify(compareReportData);

	    return $http({
	      method: 'PUT',
	      url: __env.src("/iftdssREST/report/rcmp"),
	      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	      data: $.param({"data":sendData+"}"})
	    }).
	    then(function(response) {
	    	service.addLandscapeRuleLocally(landscapeRule);
	        return response;
	      }, function(response) {
	    	var errorResponse = response || {data:{message: "Request failed"}};
	    	return $q.reject(errorResponse);
	    });
	}

  service.rerunSummary = function(summaryId) {
	  return $http( {
		  method: 'GET',
		  url: __env.src("/iftdssREST/report/rerun/summary/" + summaryId)
	  }).then(function(response){
		  return response;
	  },function(response){
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
  }

 return service;
}
