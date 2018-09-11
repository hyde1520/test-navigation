mainApp.factory('landscapeEditService', ['$http', '$q', '$rootScope','__env', landscapeEditService]);

function landscapeEditService ($http, $q, $rootScope,__env)
{
	var service = {};

	var _pendingLandscapeRuleViews = null;
	var _appliedLandscapeRuleViews = null;
	var _pendingLandscapeRules = null;  // rules that will be used to edit a landscape
	var _appliedLandscapeRules = null;  // landscape edit rules that were applied 
	var _pendingRulesLoadedForLandscapeId = null;
	var _appliedRulesLoadedForLandscapeId = null;

	var _ruleSetId = null;
	var _ruleSetOwner = null;

	var _lfluCategories = null;
	var _lfluSeverities = null;
	var _lfluSimulationTimes = null;

	var comparisonOperators = {EQ: 'is equal to', LT:'is less than', GT:'is greater than',
					 LE:'is less than or equal to', GE:'is greater than or equal to', NA:'has no assigned value'};

	var modifyOperators = {ST: 'set to', CM:'clamp to a minimum', CX:'clamp to a maximum',
			 MB:'multiply by', IB:'increase by', DB:'decrease by', CV:'clear value (set to no data)'};
	var fuelModelModifyOperators = {ST: 'set to'};

	var unitsOfMeasure = {disc: 'discrete value', feet: 'feet', met_:'meters',
						  perc: 'percent', deg_:'degrees', dens:'kg/m^3'};

	// The order of these attributes must be maintained.  They match the landscape id store in the landscape_attribute table
	var landscapeAttrib = [{attribKey:'elv', attribName:'Elevation', unitOfMeasure:'feet'},
	                       {attribKey:'slp', attribName:'Slope', unitOfMeasure:'perc'},
	                       {attribKey:'asp', attribName:'Aspect', unitOfMeasure:'deg_'},
	                       {attribKey:'fm', attribName:'Fuel Model', unitOfMeasure:'disc'},
	                       {attribKey:'cc', attribName:'Canopy Cover', unitOfMeasure:'perc'},
	                       {attribKey:'ch', attribName:'Stand Height', unitOfMeasure:'met_'},
	                       {attribKey:'cbh', attribName:'Canopy Base Height', unitOfMeasure:'met_'},
	                       {attribKey:'cbd', attribName:'Canopy Bulk Density', unitOfMeasure:'dens'}

		                  ];
	var landscapeModifyAttrib = [{attribKey:'fm', attribName:'Fuel Model', unitOfMeasure:'disc'},
	                       {attribKey:'cc', attribName:'Canopy Cover', unitOfMeasure:'perc'},
	                       {attribKey:'ch', attribName:'Stand Height', unitOfMeasure:'met_'},
	                       {attribKey:'cbh', attribName:'Canopy Base Height', unitOfMeasure:'met_'},
	                       {attribKey:'cbd', attribName:'Canopy Bulk Density', unitOfMeasure:'dens'},
	                      ];


	service.getRuleSetId = function() {  return _ruleSetId; }
	service.getRuleSetOwner = function()  { return _ruleSetOwner; }

	service.resetData = function() {
		_pendingLandscapeRuleViews = null;
		_applidLandscapeRuleViews = null;
		_pendingLandscapeRules = null;
		_appliedLandscapeRules = null;
		_ruleSetId = null;
		_ruleSetOwner = null;
	}

	// LFLU Categories
	service.getLfluCategoriesREST = function() {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscapeRule/lflu/categories")
	  }).then(function(response){
		  return response;
	  },function(response){
		  console.log("REST call to retrieve LFLU Treatment Categories failed.");
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
	}

	service.getLfluCategories = function()
	{
		//if (_lfluCategories)  return _lfluCategories;

		return this.getLfluCategoriesREST().then(function(response) {
			if (response.data && response.data.length > 0) {
				_lfluCategories = response.data;
			} else {
				console.log("Error: " + response);
			}
			return _lfluCategories;
		},function(response) {
			console.log("Error: " + response);
			return $q.reject("Error retrieving LFLU Categories from server.");
		});
	}

	// LFLU Severities
	service.getLfluSeveritiesREST = function() {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscapeRule/lflu/severities")
	  }).then(function(response){
		  return response;
	  },function(response){
		  console.log("REST call to retrieve LFLU Severities failed.");
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
	}

	service.getLfluSeverities = function()
	{
		//if (_lfluSeverities)  return _lfluSeverities;

		return this.getLfluSeveritiesREST().then(function(response) {
			if (response.data && response.data.length > 0) {
				_lfluSeverities = response.data;
			} else {
				console.log("Error: " + response);
			}
			return _lfluSeverities;
		},function(response) {
			console.log("Error: " + response);
			return $q.reject("Error retrieving LFLU Severities from server.");
		});
	}


	// LFLU Simulation Times
	service.getLfluSimulationTimesREST = function() 
	{
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscapeRule/lflu/simulationTimes")
	  }).then(function(response){
		  return response;
	  },function(response){
		  console.log("REST call to retrieve LFLU simulation times failed.");
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
	}

	/** @return  cached LFLU simulation times if they exist, otherwise get from server and return them. */
	service.getLfluSimulationTimes = function()
	{
		var deferred = $q.defer();
		
		if (_lfluSimulationTimes) {
			deferred.resolve(_lfluSimulationTimes); // return cached
		}

		this.getLfluSimulationTimesREST().then(function(response) {
			if (response.data && response.data.length > 0) {
				_lfluSimulationTimes = response.data;
				deferred.resolve(_lfluSimulationTimes);
			} else {
				var errMsg = "Error retrieving LFLU Severities from server: " + response;
				console.log(errMsg);
				deferred.reject(errMsg);
			}
			
		},function(response) {
			var errMsg = "Error retrieving LFLU Severities from server: " + response;
			console.log(errMsg);
			deferred.reject(errMsg);
		});
		
		return deferred.promise;
	}


	// Retrieve Pending Landscape Edit Rules
	service.getLandscapeRuleViewsREST = function(landscapeId) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscapeRule/ruleViews/" + landscapeId)
	  }).then(function(response){
		  return response;
	  },function(response){
		  _pendingRulesLoadedForLandscapeId = null;
		  console.log("REST call to retrieve pending rules failed.");
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
	}
	
	// Retrieve Applied Landscape Edit Rules
	service.getAppliedLandscapeRuleViewsREST = function(landscapeId) {
	  return $http({
		  method: 'GET',
		  url: __env.src("/iftdssREST/landscapeRule/appliedRuleViews/" + landscapeId)
	  }).then(function(response){
		  return response;
	  },function(response){
		  _appliedRulesLoadedForLandscapeId = null;
		  console.log("REST call to retrieve applied rules failed.");
		  return response || {data:{responseMessage:"Request Failed"}};
	  });
	}

	/** 
	 * Convert the rule (fragment) view objects into LandscapeRule objects
	 * @return  a list of landscape rule objects
	 */
	service.createLandscapeRulesFromViews = function(landscapeRuleViews, isPending)
	{
		var landscapeRules = new Array();
		if (landscapeRuleViews && landscapeRuleViews.length > 0) {
			for (var i=0; i<landscapeRuleViews.length; i++) {
				if (landscapeRuleViews[i]) {

					var ruleIndex = landscapeRuleViews[i].ruleSetSeq;
					var arrayIndex = ruleIndex - 1; // 0-based array index
					if (!landscapeRules[arrayIndex]) {
						landscapeRules[arrayIndex] = new LandscapeRule();
						landscapeRules[arrayIndex].fillFromLandscapeRuleView(landscapeRuleViews[i]);
						if (isPending && isPending == true && !_ruleSetId) {
							_ruleSetId = landscapeRuleViews[i].ruleSetId;
						}
						if (!_ruleSetOwner)  _ruleSetOwner = landscapeRuleViews[i].ruleOwner;
					}

					if (landscapeRuleViews[i].lfluTreatmentId) {
						var lfluRule = new LFLURule();
						lfluRule.fillFromLandscapeRuleView(landscapeRuleViews[i]);
						landscapeRules[arrayIndex].lfluRule = lfluRule;
					} else {
						var landscapeRuleFragment = new LandscapeRuleFragment();
						landscapeRuleFragment.fillFromLandscapeRuleView(landscapeRuleViews[i]);
						if (landscapeRuleViews[i].conditionFromFlag) {
							landscapeRules[arrayIndex].addWhereClause(landscapeRuleFragment);
						} else {
							landscapeRules[arrayIndex].addModifyClause(landscapeRuleFragment);
						}
					}

				} else {
					console.log("Null or undefined landscape rule view element returned from server.");
				}
			}
		}
		return landscapeRules;
	}

	service.getLandscapeRules = function() {
		return _pendingLandscapeRules;
	}
	
	service.getAppliedLandscapeRules = function() {
		return _appliedLandscapeRules;
	}

	service.addLandscapeRuleLocally = function(landscapeRule)
	{
		if (!_pendingLandscapeRules) {
			_pendingLandscapeRules = new Array();
		}
		if (_pendingLandscapeRules) {
    		_pendingLandscapeRules.push(landscapeRule);
    	}
	}

	service.loadPendingLandscapeRuleViews = function(landscapeId)
	{
		_pendingLandscapeRules = [];
		return this.getLandscapeRuleViewsREST(landscapeId).then(function(response) {
			if (response.data && response.data.length > 0) {
				_pendingLandscapeRuleViews = response.data;
				_pendingRulesLoadedForLandscapeId = landscapeId;
				_pendingLandscapeRules = service.createLandscapeRulesFromViews(_pendingLandscapeRuleViews, true);
				return response.data;
			} else if (response.data && response.data.length == 0) {
				_pendingLandscapeRuleViews = [];
				_pendingLandscapeRules = [];
				_pendingRulesLoadedForLandscapeId = landscapeId;
				console.log("No pending landscape rule view rows retrieved.");
				return response.data;
			} else {
				_pendingLandscapeRuleViews = null;
				_pendingLandscapeRules = null;
				_pendingRulesLoadedForLandscapeId = null;
				var errMsg = "Error retrieving pending landscape rule views";
				console.log(errMsg);
				return $q.reject(errMsg);
			}
		},function(errorResponse) {
			return $q.reject(errorResponse);
		});
	}
	
	service.loadAppliedLandscapeRuleViews = function(landscapeId)
	{
		return this.getAppliedLandscapeRuleViewsREST(landscapeId).then(function(response) {
			if (response.data && response.data.length > 0) {
				_appliedLandscapeRuleViews = response.data;
				_appliedRulesLoadedForLandscapeId = landscapeId;
				_appliedLandscapeRules = service.createLandscapeRulesFromViews(_appliedLandscapeRuleViews, false);
				return response.data;
			} else if (response.data && response.data.length == 0) {
				_appliedLandscapeRuleViews = [];
				_appliedLandscapeRules = [];
				_appliedRulesLoadedForLandscapeId = landscapeId;
				console.log("No applied landscape rule view rows retrieved.");
				return response.data;
			} else {
				_appliedLandscapeRuleViews = null;
				_appliedLandscapeRules = null;
				_appliedRulesLoadedForLandscapeId = null;
				var errMsg = "Error retrieving landscape rule views";
				console.log(errMsg);
				return $q.reject(errMsg);
			}
		},function(errorResponse) {
			return $q.reject(errorResponse);
		});
	}


	service.createLandscapeRule = function(landscapeRule)
	{
		var sendData = JSON.stringify(landscapeRule);

	    return $http({
	      method: 'PUT',
	      url: __env.src("/iftdssREST/landscapeRule/create"),
	      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	      data: $.param({"data":sendData+"}"})
	    }).
	    then(function(response) {
	    	service.addLandscapeRuleLocally(landscapeRule);
	        return response;
	      }, function(response) {
	    	
	    	var errorResponse = response || {data:{message: "Request failed"}};
	    	if (response && response.data && response.data.responseMessage) {
	    		errorResponse = response.data.responseMessage;
	    	}
	    	return $q.reject(errorResponse);
	    });
	}

	service.deleteRuleFromLocalList = function(rule) {
		if (!_pendingLandscapeRules || _pendingLandscapeRules.length == 0)  return;

		for (var i=0; i<_pendingLandscapeRules.length; i++) {
			if (_pendingLandscapeRules[i].ruleId == rule.ruleId) {
				 _pendingLandscapeRules.splice(i, 1);
				 return;
			}
		}
	}

	service.deleteLandscapeRule = function(rule) {
		return $http({
	      method: 'GET',
	      url: __env.src("/iftdssREST/landscapeRule/delete/rule/"+ rule.ruleId +"/ruleSet/"+ rule.ruleSetId)

	    }).
	    then(function(response) {
	    	service.deleteRuleFromLocalList(rule);
	        return response;
	      }, function(response) {
	        return response || {data:{responseMessage: "Failed to delete landscape edit rule (" + rule.ruleId + ")"}};
	    });
	}

	/** Return the maximum rule sequence number in the current rule set for the landscape */
	service.getMaxRuleSeqNumber = function()
	{
		var maxSeqNum = 0;
		if (!_pendingLandscapeRules)  return maxSeqNum;
		for (var i=0; i<_pendingLandscapeRules.length; i++) {
			if (_pendingLandscapeRules[i] &&_pendingLandscapeRules[i].ruleSequenceNum > maxSeqNum) {
				maxSeqNum = _pendingLandscapeRules[i].ruleSequenceNum;
			}
		}
		return maxSeqNum;
	}
	/**
	 * @param landscapeRule  is of type LandscapeRule
	 * @return  String
	 */
	service.getRuleAsString = function(landscapeRule)
	{
		var ruleString = "";
		if (!landscapeRule)  return ruleString;

		if (landscapeRule.lfluRule) {
			var lflu = landscapeRule.lfluRule;
			if (lflu.severityType != 'clrpre') {
				// Leave out 'thin .. removal' if clear-cut
				ruleString = service.getLfluCategoryName(lflu.categoryType) + ", ";
			}
			ruleString += service.getLfluSeverityName(lflu.severityType);
			ruleString += " for " + service.getLfluTimeName(lflu.timeType);
		} else {
			var whereString = "";
			var whereStarted = false;
			if (landscapeRule && landscapeRule.ruleConditionFragments) {
				for (var j=0; j<landscapeRule.ruleConditionFragments.length; j++) {
					var fragment = landscapeRule.ruleConditionFragments[j];
					if (whereStarted) {
						whereString += " AND ";
					} else {
						whereString += " Where (";
						whereStarted = true;
					}
					whereString += fragment.attributeName + " ";
					whereString += fragment.operatorName + " ";
					var lcpValueStr = '';
					if (fragment.landscapeValue != null && typeof(fragment.landscapeValue) != "undefined") {
						if (typeof(fragment.landscapeValue) == "number") {
							lcpValueStr = fragment.landscapeValue.toString();
						} else {
							lcpValueStr = fragment.landscapeValue;
						}
					}
					whereString += lcpValueStr;
					whereString += " ";
					whereString += this.getLandscapeUnitOfMeasureWithoutDiscreteVal(fragment.attributeKey);
				}
			}

			var modifyString = "";
			var changeStarted = false;
			if (landscapeRule && landscapeRule.ruleModifyFragments) {
				for (var j=0; j<landscapeRule.ruleModifyFragments.length; j++) {
					var fragment = landscapeRule.ruleModifyFragments[j];
					if (changeStarted) {
						modifyString += " AND ";
					} else {
						var chgStr = whereStarted ? ") change (" : "Change (";
						modifyString += chgStr;
						changeStarted = true;
					}
					modifyString += fragment.attributeName + " ";
					modifyString += fragment.operatorName + " ";
					if (fragment.operator != 'CV') {
						modifyString += fragment.landscapeValue + " ";
					}
					if (fragment.operator != 'MB' && fragment.operator != 'CV') {
						modifyString += this.getLandscapeUnitOfMeasureWithoutDiscreteVal(fragment.attributeKey);
					}
				}
			}

			if (modifyString.length > 0) {
				ruleString = whereString + modifyString + ")";
			}
		}

		return ruleString;
	}

	/* Return a list of strings to display to the user as the landscape edit rules
	 * @deprecated - not really used */
	service.getRulesAsStrings = function()
	{
		var ruleStrings = [];

		if (!_pendingLandscapeRules) {
			console.log("_pendingLandscapeRules is null or not defined so rule strings not generated.");
			return ruleStrings;
		}

		for (var i=0; i<_pendingLandscapeRules.length; i++) {
			var ruleString = service.getRuleAsString(_pendingLandscapeRules[i]);
			ruleStrings[i] = ruleString;
		} //endfor

		return ruleStrings;
	}

	service.getLandscapeAttributeValues = function() { return landscapeAttrib; }
	service.getLandscapeModifyAttributeValues = function() { return landscapeModifyAttrib; }
	service.getCompareOps = function() { return comparisonOperators;}
	service.getModifyOps = function(landscapeAttribKey) {
		if (landscapeAttribKey && landscapeAttribKey == 'fm') {
			return fuelModelModifyOperators;
		}
		return modifyOperators;
	}

	service.getLandscapeAttributeName = function(key)
	{
		if (!landscapeAttrib)  return '';
		for (var i=0; i<landscapeAttrib.length; i++) {
			if (landscapeAttrib[i].attribKey == key)  return landscapeAttrib[i].attribName;
		}
		return '';
	}

	service.getLandscapeUnitOfMeasureWithoutDiscreteVal = function(key) {
		if (key == 'disc' || key == 4) {
			return "";
		}
		return service.getLandscapeUnitOfMeasure(key);
	}

	service.getLandscapeUnitOfMeasure = function(key)
	{
		if (!landscapeAttrib)  return '';
		// First try finding by array index as the key
		if (!isNaN(key) && key > 0 && key <= landscapeAttrib.length && landscapeAttrib[key-1]) {
			var uom = landscapeAttrib[key-1].unitOfMeasure;
			if (unitsOfMeasure[uom])  return unitsOfMeasure[uom];
		}
		// Didn't find by integer index so now try by enum key
		for (var i=0; i<landscapeAttrib.length; i++) {
			if (landscapeAttrib[i].attribKey == key) {
				var uom = landscapeAttrib[i].unitOfMeasure;
				if (unitsOfMeasure[uom])  return unitsOfMeasure[uom];
			}
		}
		return "";
	}

	service.getRuleOperatorName = function(key)
	{
		var opName = comparisonOperators[key];
		if (opName && opName.length > 0)  return opName;
		opName = modifyOperators[key];
		if (opName && opName.length > 0)  return opName;
		opName = fuelModelModifyOperators[key];
		if (opName && opName.length > 0)  return opName;
		return '';
	}

	service.getLfluCategoryName = function(key) {
		if (!_lfluCategories)  return '';
		for (var i=0; i<_lfluCategories.length; i++) {
			if (_lfluCategories[i].categoryType == key)  return _lfluCategories[i].categoryName;
		}
		return '';
	}

	service.getLfluSeverityName = function(key) {
		if (!_lfluSeverities)  return '';
		for (var i=0; i<_lfluSeverities.length; i++) {
			if (_lfluSeverities[i].severityType == key)  return _lfluSeverities[i].severityName;
		}
		return '';
	}

	service.getLfluTimeName = function(key) {
		if (!_lfluSimulationTimes)  return '';
		for (var i=0; i<_lfluSimulationTimes.length; i++) {
			if (_lfluSimulationTimes[i].timeType == key)  return _lfluSimulationTimes[i].timeName;
		}
		return '';
	}

	/** Call a REST service to edit a landscape and thus creating a new one */
	service.editLandscape = function(landscapeId, newLandscapeName)
	{
		escapedLandscapeName = newLandscapeName.replace(/\//g, "~~~");
		console.log("landscapeEditService.editLandscape() called.  landscapeId=" + landscapeId + ", newLandscapeName=" + newLandscapeName);
		var getURL = "/iftdssREST/landscapeRule/edit/landscape/" + landscapeId + "/newname/" + escapedLandscapeName + "/rulesetid/" + service.getRuleSetId();

		return $http({
			  method: 'GET',
			  url: __env.src(getURL),
		      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		  }).then(function(response){
			  _pendingLandscapeRules = null; // rules get applied to new landcape so remove here
			  _ruleSetId = null; // previous rule set was applied against the new landscape so reset
			  //$rootScope.$broadcast('newLandscapeCreated', newLandscapeName); // notify all pages
			  return response;
		  },function(errorResponse) {
			  var errorMsg = "Request Failed";
			  if (errorResponse && errorResponse.data && errorResponse.data.responseMessage) {
				  errorMsg = errorResponse.data.responseMessage;
			  } else if (errorResponse && errorResponse.status && errorResponse.statusText) {
				  errorMsg = errorResponse.statusText + " (" + errorResponse.status + ")";
			  } 
			  console.log(errorMsg);
			  return $q.reject(errorMsg);
		  });
	}

	return service;
}
