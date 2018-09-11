mainApp.directive('editLandscapeDirective',function(){
	return {
		templateUrl: "pages/landscape/editLandscape_partial.html",
		scope: { selected_landscape: '=input',
				 familyLandscapesOnly: '=familyOnly',
				 addedLandscapeToFamilyFlag: '=addedLandscapeToFamilyFlag',
				 selectedLandscapeForRulesDialog: '=selectedLandscapeForRulesDialog',
				 selectedLandscapeChangedFlag: '=selectedLandscapeChangedFlag'
			},
		controller: "editLandscapeDirectiveController"
	}
}).controller('editLandscapeDirectiveController',["$scope","$window","$location","$rootScope","$routeParams","$timeout","landscapeResource","landscapeEditService",
  function($scope,$window,$location,$rootScope,$routeParams,$timeout,landscapeResource,landscapeEditService)
{	
	$scope.editedLandscapeName = "";
	$scope.whereConditions = [];
	$scope.modifyValues = [];
	
	$scope.selected_landscape = null;
	$scope.selectedFamilyLandscape = null;
	$scope.familyOnly = false;
	$scope.landscapeContextEnum = landscapeResource.ScopeEnum.ALL;
	$scope.landscapeAttributes = landscapeEditService.getLandscapeAttributeValues();
	$scope.landscapeModifyAttributes = landscapeEditService.getLandscapeModifyAttributeValues();
	$scope.fuelModels = null;
	$scope.compareOps = landscapeEditService.getCompareOps();
	$scope.modifyOps = landscapeEditService.getModifyOps();
	$scope.landscapeRules = new Array();
	$scope.createdRules = false;
	$scope.saving_lflu_class = "hide-with-fade";
	$scope.saving_rule_class = "hide-with-fade";
	$scope.refreshing_rules_class = "hide-with-fade";
	
	$scope.emptyLandscapeList = false;
	$scope.resourceDeleteCandidate = null;
	$scope.resourceDeleteConfirmMsg = null;
	
	$scope.selectedMask = null;
	$scope.userShapes = [];
	$scope.sessionRules = [];
	
	$scope.lfluCategories = [];
	$scope.lfluSeverities = [];
	$scope.lfluSimulationTimes = [];
	$scope.selectedButtonCategory = 'none';
	$scope.selectedSeverity = null;
	$scope.selectedTime = null;
	
	$scope.useTimeButtons = true;
	
	$rootScope.selectedZeroLandscapeFlag = 0;

	
	if ($scope.familyLandscapesOnly) {
		$scope.familyOnly = true;
		$scope.landscapeContextEnum = landscapeResource.ScopeEnum.FAMILY;
	}
	$rootScope.$on('shape-create-completed', function(event, data) {
		if ($scope.selectedFamilyLandscape) {
			$scope.refreshMasks($scope.selectedFamilyLandscape.landscapeId);
		}
		//$scope.displayWarning = true;
		//$scope.warningMessage = "Your new shape was created. If it intersects with your selected landcape, refresh the Area of Interest list to see it in the list."
		//console.log("Received shape created msg from map studio");
		//if (data) {
			//$scope.mapExtent.fillFrom(data);
			//$scope.$broadcast('shapeCreated', $scope.mapExtent);
		//}
	});

	
	$scope.closeAllNotificationPanels = function() {
		$scope.displaySuccess = false;
		$scope.successMessage = "";
		$scope.displayError = false;
		$scope.errorMessage = "";
		$scope.errorSavingLfluRule = false;
		$scope.saveLfluRuleErrorText = '';
		$scope.warningSavingLfluRule = false;
		$scope.saveLfluRuleWarningText = '';
		$scope.errorSavingRule = false;
		$scope.saveRuleErrorText = '';
		$scope.warningSavingRule = false;
		$scope.saveRuleWarningText = '';
		$scope.userAddedNewRule = false;
	}
	
	$scope.closeAllNotificationPanels(); //initialize page
	
	$scope.displayingSplitMap = function() {
		if ($rootScope.splitMapOpen)  return true;
		return false;
	}
	
	$scope.selectButtonCategory = function(buttonId) {
		if ($scope.landscapeNotSelectedBeforeLfluRule())  return;
		if ($scope.selectedButtonCategory != buttonId) {
			$scope.selectedSeverity = null;
		}
		$scope.selectedButtonCategory = buttonId;
	}
	
	$scope.selectTime = function(time) {
		if ($scope.landscapeNotSelectedBeforeLfluRule())  return;
		$scope.selectedTime = time;
	}
	
	$scope.findCategoryForEnum = function(categoryEnum) {
		var category = {categoryType:'none'};
		if (!categoryEnum)  return category;
		if (!$scope.lfluCategories) return category;
		for (var i=0; i<$scope.lfluCategories.length; i++) {
			if ($scope.lfluCategories[i].categoryType == categoryEnum) {
				category = $scope.lfluCategories[i];
			}
		}
		return category;
	}
	
	$scope.getCategoryTitle = function(categoryEnum) {
		for (var i=0; i<$scope.lfluCategories.length ; i++) {
			if ($scope.lfluCategories[i].categoryType == categoryEnum) {
				return $scope.lfluCategories[i].categoryName;
			}
		}
	}
	
	$scope.assignSeveritiesToButtons = function()
	{
		if (!$scope.lfluSeverities)  return;
		for (var i=0; i<$scope.lfluSeverities.length; i++) {
			if ($scope.lfluSeverities[i].categoryType == "thinn") {
				$scope.lfluSeverities[i].group="bbar2";
			} else if ($scope.lfluSeverities[i].categoryType == "wildf") {
				$scope.lfluSeverities[i].group="bbar4";
			} else if ($scope.lfluSeverities[i].categoryType == "thinr") {
				if ($scope.lfluSeverities[i].severityType == "clrpre") {
					$scope.lfluSeverities[i].group="bbar3";
				} else {
					$scope.lfluSeverities[i].group="bbar1";
				}
			}
		}
	}
	
	$scope.assignTimeShortNames = function()
	{
		if (!$scope.lfluSimulationTimes)  return;
		for (i=0; i<$scope.lfluSimulationTimes.length; i++) {
			if ($scope.lfluSimulationTimes[i].timeType == 'year1') {
				$scope.lfluSimulationTimes[i].shortName = "1 Year";
			} else if ($scope.lfluSimulationTimes[i].timeType == 'year4') {
				$scope.lfluSimulationTimes[i].shortName = "2 to 5 Years";
			} else if ($scope.lfluSimulationTimes[i].timeType == 'year8') {
				$scope.lfluSimulationTimes[i].shortName = "5 to 10 Years";
			} else if ($scope.lfluSimulationTimes[i].timeType == 'all_') {
				$scope.lfluSimulationTimes[i].shortName = "All Timeframes";
			}
		}
	}
	
	landscapeEditService.getLfluCategories().then(function(response) {
		$scope.lfluCategories = response;
	},function(response) {
		$scope.displayError = true;
		$scope.errorMessage = response;
	});
	
	landscapeEditService.getLfluSeverities().then(function(response) {
		$scope.lfluSeverities = response;
		$scope.assignSeveritiesToButtons();
	},function(response) {
		$scope.displayError = true;
		$scope.errorMessage = response;
	});
	
	landscapeEditService.getLfluSimulationTimes().then(function(response) {
		$scope.lfluSimulationTimes = response;
		$scope.assignTimeShortNames();
	},function(response) {
		$scope.displayError = true;
		$scope.errorMessage = response;
	});
	
	landscapeResource.getFuelModels().then(function(response) {
		$scope.fuelModels = response;
		// derive a name for the pull-down list from the attributes
		for (var i=0; i<$scope.fuelModels.length;i++) {
			if ($scope.fuelModels[i].fuelModelCode) {
				$scope.fuelModels[i].descrip = $scope.fuelModels[i].fuelModelNumber + " (" + $scope.fuelModels[i].fuelModelCode + ")";
			} else if ($scope.fuelModels[i].name) {
				$scope.fuelModels[i].descrip = $scope.fuelModels[i].fuelModelNumber + " - " + $scope.fuelModels[i].name;
			}
		}
	},function(response) {
		$scope.displayError = true;
		$scope.errorMessage = response;
	});
	
	$scope.whereConditionInputComplete = function() {
//		if ($scope.input && modelValidationFactory.valid_fuelMoistureArray($scope.input.fuelMoistureArray)) {
//			$scope.fuelMoistureInputClass = "panel-success";
//			$scope.allInputsComplete();
//		} else {
//			$scope.fuelMoistureInputClass = "panel-default";
//		}
	}
	
	$scope.getModifierOptions = function(row) {
		if (row && row[0]) {
			return landscapeEditService.getModifyOps(row[0].attribKey);
		}
	}
	
	$scope.setModifierOptions = function(row) {
		if (row && row[0]) {
			$scope.modifyOps = landscapeEditService.getModifyOps(row[0].attribKey);
		}
		$scope.setUnitOfMeasure(row);
	}
	
	$scope.setUnitOfMeasure = function(row) {
		if (row && row[0]) {
			row[4] = landscapeEditService.getLandscapeUnitOfMeasure(row[0].attribKey);
		}
	}
	
	$scope.refreshRulesList = function() {
		$scope.userAddedNewRule = false; //clear any added rule notification
		$scope.retrieveRules($scope.selected_landscape.landscapeId, true);
	}
	
	// Retrieve pending landscape edit rules
	$scope.retrieveRules = function(landscapeId, refreshList) {
		$scope.createdRules = false;
		$scope.refreshing_rules_class = "show-with-fade";
		landscapeEditService.loadPendingLandscapeRuleViews(landscapeId).then(function(response) {
			$scope.createdRules = true;
			$scope.landscapeRules = landscapeEditService.getLandscapeRules();
			if (refreshList)  $scope.digest;
			$scope.refreshing_rules_class = "hide-with-fade";
		}, function(errorResponse) {
			//TODO: display error on the screen
			$scope.errorMessage = errorResponse.data.responseMessage || "Error retrieving landscapes edit rules.";
			$scope.displayError = true;
			$scope.refreshing_rules_class = "hide-with-fade";
			console.log($scope.errorMessage);
		});
	}
	
	// Retrieve user shapes that intersect with this landscape
	$scope.retrieveUserShapes = function(landscapeId) {
		landscapeResource.getIntersectingShapes(landscapeId, $rootScope.current_user_id).then(function(response) {
			if (response.data.success == false) {
				$scope.userShapes = [];
			}
			else {
				$scope.userShapes = response.data;
			}
		}, function(errorResponse) {
			//TODO: display error on the screen
			$scope.userShapes = [];
			$scope.errorMessage = errorResponse.data.responseMessage || "Error retrieving user shapes.";
			$scope.displayError = true;
			console.log(errorResponse);
		});
	}
	
	if ($routeParams.landscapeid) {
		$scope.retrieveRules($routeParams.landscapeid, false);
		$scope.retrieveUserShapes($routeParams.landscapeid);
	}
	
	$scope.refreshMasks = function() {
		if ($scope.selected_landscape){
			$scope.retrieveUserShapes($scope.selected_landscape.landscapeId);
		}else{
			$scope.retrieveUserShapes($routeParams.landscapeid);
		}
	}
	
	$scope.selectMask = function(mask) {
		//console.log("selectedMask: " + );
		$scope.selectedMask = mask;
		if($window.document.getElementById("mapStudioIframe")) {
			if (mask && mask.shapeOrShapefileId){
				if (mask.resourceType === 'shpf'){
					$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('shapefile='+JSON.stringify(mask), '*');					
				}
				if (mask.resourceType === 'shp_'){
					$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('shapeid='+mask.shapeOrShapefileId, '*');
					
				}
			}
		}
	}
	
	/** @return true if the landscape or certain inputs aren't ready */
	$scope.disableCreateLandscapeButton = function() {
		if (!$scope.selected_landscape)  return true;
		if (!$scope.editedLandscapeName || $scope.editedLandscapeName == "")  return true;
		if (!$scope.selected_landscape.complete)  return true;
		if (!$scope.landscapeRules)  return true
		if ($scope.landscapeRules.length == 0)  return true;
		
		return false;
	} 
	
	// Get a rule as a String to display to the user
	$scope.getRuleAsString = function(landscapeRule) {
		var ruleString = landscapeEditService.getRuleAsString(landscapeRule);
		return ruleString;
	}
	
	// Resolve the landscape attribute enumeration to the integer landscape attribue ID
	$scope.findLandscapeIdForEnum = function(enumVal) {
		for (var j=0; j<$scope.landscapeAttributes.length; j++) {
			if ($scope.landscapeAttributes[j].attribKey == enumVal) {
				return j+1;
			}
		}
		return -1;
	}
	
	$scope.displaySaveRuleWarning = function(warningText) {
		$scope.warningSavingRule = true;
		$scope.saveRuleWarningText = warningText;
		return false;  // shortcut so caller doesn't have to
	}
	
	$scope.clearSaveRuleWarning = function() {
		$scope.warningSavingRule = false;
		$scope.saveRuleWarningText = "";
	}
	
	$scope.getRuleValueMin = function(attribType, operator) {
		if (!attribType || attribType == 'fm') return null;
		if (operator == 'CV' || operator == 'NA') return null;
		if (attribType == 'elv')   		return -85;
		return 0;		
	}
	
	$scope.getRuleValueMax = function(attribType, operator) {
		if (!attribType || attribType == 'fm') return null;
		if (operator == 'CV' || operator == 'NA') return null;
		
		if (attribType == 'elv')   		return 20000;
		else if (attribType == 'slp') 	return 100;
		else if (attribType == 'asp')   return 359;
		else if (operator != 'MB') {
			if (attribType == 'ch')    return 50;
			else if (attribType == 'cc')    return 100;
			else if (attribType == 'cbh')   return 10;
			else if (attribType == 'cbd')   return .5;
		}
		
		return null;
	}
	
	
	
	/** @return false if the basic rule clauses or landscape mask don't exist*/
	$scope.haveRuleFragments = function() {
		var whereClauseExists = ($scope.whereConditions && $scope.whereConditions.length > 0);
		var modifyClauseExists = ($scope.modifyValues && $scope.modifyValues.length > 0);
		var haveMinimumClauses = (whereClauseExists || $scope.selectedMask) && modifyClauseExists;
		return haveMinimumClauses;
	}
	
	/** @return true if we have valid rule clauses, otherwise warn the user and return false */
	$scope.haveValidEditRule = function()
	{	
		if (!$scope.haveRuleFragments()) {
			return $scope.displaySaveRuleWarning("Where and Modify Clauses (or Landscape Mask) must be defined.");
		}
		
		for (var i=0; i < $scope.whereConditions.length; i++) {
			var whereItem = $scope.whereConditions[i];
			//console.log("whereItem[0].attribKey=" + whereItem[0].attribKey + ", whereItem[0].attribName=" + whereItem[0].attribName + ", whereItem[0].unitOfMeasure=" + whereItem[0].unitOfMeasure);
			//console.log("  whereItem[1]=" + whereItem[1] + ", whereItem[2]=" + whereItem[2]);
			var whereOper = whereItem[1];
			var whereVal = whereItem[2];
			if (!whereItem[0] || !whereItem[0].attribKey) {
				return $scope.displaySaveRuleWarning("Please select an attribute for your 'Where' condition.");
			}
			if (!whereOper) {
				return $scope.displaySaveRuleWarning("Please enter an operator for your 'Where' condition.");
			}
			if ((whereVal == null || typeof(whereVal) == "undefined") && whereOper != 'NA') {
				return $scope.displaySaveRuleWarning("Please enter a value for your 'Where' condition.");
			} 
		}
		for (var i=0; i < $scope.modifyValues.length; i++) {
			var modifyValue = $scope.modifyValues[i];
			//console.log("modValue[0].attribKey=" + modValue[0].attribKey + ", modValue[0].attribName=" + modValue[0].attribName + ", modValue[0].unitOfMeasure=" + modValue[0].unitOfMeasure);
			//console.log("  modValue[1]=" + modValue[1] + ", modValue[2]=" + modValue[2]);
			var modOper = modifyValue[1];
			var modVal = modifyValue[2];
			if (!modifyValue[0] || !modifyValue[0].attribKey) {
				return $scope.displaySaveRuleWarning("Please select an attribute for your 'Modify' clause.");
			}
			if (!modOper) {
				return $scope.displaySaveRuleWarning("Please enter an operator for your 'Modify' clause.");
			}
			if ((modVal == null || typeof(modVal) == "undefined") && modOper != 'CV') {
				return $scope.displaySaveRuleWarning("Please enter a value for your 'Modify' clause.");
			} 
		}
		return true;
	}
	

	$scope.landscapeNotSelectedBeforeRule = function() {
		if (!$scope.selected_landscape) {
			$scope.displaySaveRuleWarning("Please first select a landscape to save the edit rules against.");
			return true;
		}
		return false;
	}
	
	$scope.addEmptyWhereClause = function() {
		if ($scope.landscapeNotSelectedBeforeRule())  return;
		$scope.whereConditions.push([null,null,null]);
	}
	$scope.addEmptyModifyClause = function() {
		if ($scope.landscapeNotSelectedBeforeRule())  return;
		$scope.modifyValues.push([null,null,null]);
	}
	
	$scope.addRule = function() 
	{
		if ($scope.landscapeNotSelectedBeforeRule())  return;
		if (!$scope.haveValidEditRule())  return;
		var newRule = new LandscapeRule();
		newRule.isLflu = false;
		newRule.ruleSequenceNum = landscapeEditService.getMaxRuleSeqNumber() + 1;
		newRule.ruleSetId = landscapeEditService.getRuleSetId();
		newRule.owner = landscapeEditService.getRuleSetOwner() || $rootScope.user_record.userId;
		if ($scope.selectedMask) {
			newRule.maskId = $scope.selectedMask.shapeOrShapefileId;
			newRule.maskName = $scope.selectedMask.resourceName;
		}
		newRule.ruleName = "";
		newRule.landscapeId = $scope.selected_landscape.landscapeId;
		for (var i=0; i < $scope.whereConditions.length; i++) {
			var whereItem = $scope.whereConditions[i];
			var ruleFragment = new LandscapeRuleFragment(null, true, whereItem[0].attribKey, whereItem[1], whereItem[2], null);
			ruleFragment.landscapeAttrib = $scope.findLandscapeIdForEnum(whereItem[0].attribKey);
			ruleFragment.attributeName = landscapeEditService.getLandscapeAttributeName(whereItem[0].attribKey);
			ruleFragment.operatorName = landscapeEditService.getRuleOperatorName(whereItem[1]);
			newRule.addWhereClause(ruleFragment);
		}
		for (var i=0; i < $scope.modifyValues.length; i++) {
			var modValue = $scope.modifyValues[i];
			var ruleFragment = new LandscapeRuleFragment(null, false, modValue[0].attribKey, modValue[1], modValue[2], null);
			ruleFragment.landscapeAttrib = $scope.findLandscapeIdForEnum(modValue[0].attribKey);
			ruleFragment.attributeName = landscapeEditService.getLandscapeAttributeName(modValue[0].attribKey);
			ruleFragment.operatorName = landscapeEditService.getRuleOperatorName(modValue[1]);
			newRule.addModifyClause(ruleFragment);
		}
		
		$scope.saving_rule_class = "show-with-fade";
		landscapeEditService.createLandscapeRule(newRule).then(function(response) {
			$scope.createdRules = true;
			$scope.userAddedNewRule = true;
			// Retrieve rules again in case server re-sequenced them
			$scope.retrieveRules($scope.selected_landscape.landscapeId, true);
			$scope.selectedMask = null;
			$scope.whereConditions = [];
			$scope.modifyValues = [];
			$scope.saving_rule_class = "hide-with-fade";
			$scope.openEditLandscapePanel();
			$scope.addEditRuleForm.$setPristine();
			$scope.addEditRuleForm.$setUntouched();
		}, function(errorResponse) {
			$scope.errorSavingRule = true;
			$scope.saveRuleErrorText = "Error saving new rule: " + errorResponse;
			$scope.saving_rule_class = "hide-with-fade";
		});	
	}
	
	/** @return  a calculated vegetation disturbance (VDist) code using selected LFLU values */
	$scope.getSelectedVDist = function() 
	{   
		if (!$scope.selectedSeverity)  return '';
		if (!$scope.selectedTime)  return '';
		var selectedCategory = $scope.findCategoryForEnum($scope.selectedSeverity.categoryType);
		if ( (selectedCategory && selectedCategory.vdist) &&
			 ($scope.selectedSeverity && $scope.selectedSeverity.vdist) &&
			 ($scope.selectedTime && ($scope.selectedTime.vdist || $scope.selectedTime.vdist == 0)) )
		{
			return 100*selectedCategory.vdist + 10*$scope.selectedSeverity.vdist + $scope.selectedTime.vdist;
		}
		return '';
	}
	
	$scope.getSelectedVDistLabel = function()
	{
		var vdist = $scope.getSelectedVDist();
		if (vdist && vdist != '') {
			return "(VDist: " + vdist + ")";
		}
	}
	
	$scope.landscapeNotSelectedBeforeLfluRule = function() {
		if (!$scope.selected_landscape) {
			$scope.warningSavingLfluRule = true;
			$scope.saveLfluRuleWarningText = "Please first select a landscape to save the edit rules against.";
			return true;
		}
		return false;
	}
	
	$scope.unselectRadioButtons = function(groupName) 
	{
		var elem = document.getElementsByName(groupName);
		if (!elem)  return;
		for(var i=0; i<elem.length; i++) {
			elem[i].checked = false;
		}
	}
	$scope.unselectRadioButtonLabels = function(groupName) 
	{
		var elem = document.getElementsByName(groupName);
		if (!elem)  return;
		for(var i=0; i<elem.length; i++) {
			elem[i].classList.remove("active");
		}
	}
	
	$scope.unselectLFLUButtons = function() {
		$scope.unselectRadioButtons("buttons");
		$scope.unselectRadioButtonLabels("buttonlabels");
		$scope.unselectRadioButtons("rbuttons");
		$scope.unselectRadioButtonLabels("rbuttonlabels");
	}
	
	$scope.addLfluRule = function() 
	{
		if ($scope.landscapeNotSelectedBeforeLfluRule())  return;
		var newRule = new LandscapeRule();
		newRule.isLflu = true;
		newRule.ruleSequenceNum = landscapeEditService.getMaxRuleSeqNumber() + 1; 
		newRule.ruleSetId = landscapeEditService.getRuleSetId();
		newRule.owner = landscapeEditService.getRuleSetOwner() || $rootScope.user_record.userId;
		if ($scope.selectedMask) {
			newRule.maskId = $scope.selectedMask.shapeOrShapefileId;
			newRule.maskName = $scope.selectedMask.resourceName;
		}
		newRule.ruleName = "";
		newRule.landscapeId = $scope.selected_landscape.landscapeId;
		
		var vdist = $scope.getSelectedVDist();
		var newLfluRule = new LFLURule(null, $scope.selectedSeverity.categoryType, $scope.selectedSeverity.severityType, 
									$scope.selectedTime.timeType, vdist, null);
		newRule.lfluRule = newLfluRule;
		$scope.saveLfluRuleWaitingClass = "wait-spinning-md";
		
		$scope.saving_lflu_class = "show-with-fade";
		landscapeEditService.createLandscapeRule(newRule).then(function(response) {
			$scope.createdRules = true;
			$scope.userAddedNewRule = true;
			// Retrieve rules again in case server re-sequenced them
			$scope.retrieveRules($scope.selected_landscape.landscapeId, true);
			$scope.selectedMask = null;
			$scope.selectedButtonCategory = null;
			$scope.selectedSeverity = null;
			$scope.selectedTime = null;
			$scope.saveLfluRuleWaitingClass = null;
			$scope.unselectLFLUButtons(); // unselect all radio buttons
			$scope.saving_lflu_class = "hide-with-fade";
			$scope.openEditLandscapePanel();
			$scope.addLfluRuleForm.$setPristine();
			$scope.addLfluRuleForm.$setUntouched();
		}, function(errorResponse) {
			$scope.errorSavingLfluRule = true;
			$scope.saveLfluRuleErrorText = "Error saving new rule: " + errorResponse;
			$scope.saveLfluRuleWaitingClass = null;
			$scope.saving_lflu_class = "hide-with-fade";
		});	
	}
	
	/** Call the REST service to create a new edited landscape */
	$scope.createEditedLCP = function() 
	{
		$scope.closeAllNotificationPanels();
		if ($scope.landscapeNameAlreadyExists($scope.editedLandscapeName)) {
			$scope.displayError = true;
			$scope.errorMessage = "Please enter a different landscape name.  You already have a landscape with the name: " + $scope.editedLandscapeName;
			return;
		}
		$scope.createWaitingClass = "wait-spinning-md";
		var trimmedLandcapeName = $scope.editedLandscapeName.trim();
		landscapeEditService.editLandscape($scope.selected_landscape.landscapeId, trimmedLandcapeName).then(
			function(response) {
				$scope.displaySuccess = true;
				console.log(response);
				$scope.successMessage = "A request has been successfully submitted to create a new landscape '" + $scope.editedLandscapeName + "' from the edit rules.";
				$scope.landscapeRules = new Array();
				$scope.retrieveRules($scope.selected_landscape.landscapeId, true);
				$scope.refreshUserLandscapesFromServer();
				$scope.selectedMask = null; 
				$scope.addedLandscapeToFamilyFlag++;
				$scope.editedLandscapeName = "";
				$scope.createWaitingClass = null;
				$scope.createNewLandscape.$setPristine();
				$scope.createNewLandscape.$setUntouched();
			}, function(errorResponse) {
				$scope.displayError = true;
				$scope.errorMessage = "Error editing the landscape: " + errorResponse;
				window.scrollTo(0,0);
				$scope.createWaitingClass = null;
			}
		);	
	}
	
	$scope.deleteWhereCondition = function(index) {
		$scope.whereConditions.splice(index,1);
		$scope.clearSaveRuleWarning();
	}

	$scope.deleteModifyValues = function(index) {
		$scope.modifyValues.splice(index,1);
		$scope.clearSaveRuleWarning();
	}
	
	$scope.setDeleteCandidate = function(rule) {
		$scope.resourceDeleteCandidate = rule;
		var ruleAsString = $scope.getRuleAsString(rule);
		$scope.resourceDeleteConfirmMessage = "Do you really want to delete the following rule?: " + ruleAsString;
	}
	
	$scope.clearDeleteCandidate = function()  { $scope.resourceDeleteCandidate = null; }

	function hideSubmitSuccessAlert() {
		$scope.displaySuccess = false; 
		$scope.successMessage = "";
	}
	
	$scope.deleteRule = function() 
	{	
		$scope.userAddedNewRule = false; // hide add new rule notification now
		landscapeEditService.deleteLandscapeRule($scope.resourceDeleteCandidate).then(function(response){
			if (response.data && response.data.success) {
    			$scope.successMessage = 'Landscape rule (' + $scope.resourceDeleteCandidate.ruleId + ') has been deleted.';
    			$scope.displaySuccess = true; 
    			$timeout(hideSubmitSuccessAlert, 4000);
    			// Retrieve rules again in case server re-sequenced them
    			$scope.retrieveRules($scope.selected_landscape.landscapeId, true);
			} else {
				$scope.errorMessage = response.data.responseMessage;
    			$scope.displayError = true;
			}
		});
	}
	
	if ( $scope.landscapeContextEnum == landscapeResource.ScopeEnum.ALL || 
		($scope.landscapeContextEnum == landscapeResource.ScopeEnum.FAMILY && $rootScope.selectedZeroLandscapeFlag))
	{
		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id, $scope.landscapeContextEnum).then(function(response)
			{
				$scope.userLandscapes = response;
				
				if ($scope.userLandscapes && $scope.userLandscapes.length == 0) {
					$scope.emptyLandscapeList = true;
				} 
				
				// Set the selected landscape that is displayed if passed in as a param
				if ($routeParams.landscapeid && $scope.userLandscapes) {
					for (i=0; i < $scope.userLandscapes.length; i++) {
						if ($routeParams.landscapeid == $scope.userLandscapes[i].landscapeId) {
							$scope.selected_landscape = $scope.userLandscapes[i];
						}
					}
				}
			}, function(errorResponse) {
				$scope.errorMessage = errorResponse.data.responseMessage || "Error retrieving landscapes.";
				$scope.displayError = true;
				console.log(errorResponse);
		});
	}
	
	$scope.refreshUserLandscapesFromServer = function() {
		landscapeResource.refreshUserLandscapesFromServer($rootScope.current_user_id, $scope.landscapeContextEnum).then(
			function(response) {
				$scope.userLandscapes = response;
				if ($scope.userLandscapes && $scope.userLandscapes.length > 0) {
					$scope.emptyLandscapeList = false;
					if ($scope.selected_landscape != null) {
						for (var i=0; i<$scope.userLandscapes.length; i++) {
							var userLandscape = $scope.userLandscapes[i];
							if (userLandscape && userLandscape.landscapeId == $scope.selected_landscape.landscapeId) {
								$scope.selected_landscape.complete = userLandscape.complete;
								$scope.errorMessage = "";
								$scope.displayError = false;
							}
							
						}
					}
				}
			},
			function(errorResponse) {
				$scope.errorMessage = errorResponse.data.responseMessage || "Error retrieving landscapes.";
				$scope.displayError = true;
				console.log($scope.errorMessage);
			}
		);
		if ($scope.familyOnly) {
			$scope.userLandscapes = landscapeResource.getFamilyLandscapes();
		}
	}
	
	$scope.landscapeNameAlreadyExists = function(landscapeName)
	{
		if (!$scope.userLandscapes)  return false;
		var trimmedName = landscapeName.trim();
		for (var i=0; i<$scope.userLandscapes.length; i++) {
			var userLandscape = $scope.userLandscapes[i];
			if (userLandscape && userLandscape.resourceName == trimmedName)  return true;
		}
		return false;
	}
	
	$scope.getLandscapes = function() {
		if ($scope.familyOnly) {
			return landscapeResource.getFamilyLandscapes();
		} else {
			return $scope.userLandscapes;
		}
	}
	
	$scope.lcp_select = function(landscape) {
		landscapeEditService.resetData();
		$scope.emptyLandscapeList = false;
		$scope.selected_landscape = landscape;
		if ($scope.familyOnly) {
			$rootScope.selectedFamilyLandscapeFlag = true;
			landscapeResource.setSelectedFamilyLandscape(landscape);
			$scope.selectedFamilyLandscape = landscape;
		}
		$scope.retrieveRules(landscape.landscapeId, false);
		$scope.userShapes = [];
		if (landscape.complete) {
			$scope.retrieveUserShapes(landscape.landscapeId);
		}
		$scope.selectedButtonCategory = 'none';
		$scope.selectedSeverity = null;
		$scope.selectedMask = null;
		$scope.selectedTime = null;
		$scope.whereConditions = [];
		$scope.editedLandscapeName = null;
		$scope.closeAllNotificationPanels();
		$scope.modifyValues = [];
		if (!$scope.selected_landscape.complete) {
			$scope.displayError = true;
			$scope.errorMessage = "You have selected a landscape that is not complete so the panels for creating rules are hidden.";
		}
		if ($scope.familyOnly) {
			if($window.document.getElementById("mapStudioIframe")) {
				$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('addlandscapeid='+JSON.stringify(landscape), '*');
			}
		} else {
			if($window.document.getElementById("mapStudioIframe")) {
				$window.document.getElementById("mapStudioIframe").contentWindow.postMessage('landscapeid='+landscape.landscapeId, '*');
			}
		}
	}
	
	$scope.isSelectedLandscapeComplete = function()
	{
		if ($scope.selected_landscape && $scope.selected_landscape.complete && $scope.selected_landscape.complete == true) {
			return true;
		}
		return false;
	}
	
	$scope.openPanel = function(panelId) {
		var panelbodyElem = $window.document.getElementById(panelId);
		if (panelbodyElem)  panelbodyElem.classList.add('in');
	}
	
	$scope.closePanel = function(panelId) {
		var panelbodyElem = $window.document.getElementById(panelId);
		if (panelbodyElem)  panelbodyElem.classList.remove('in');
	}
	
	$scope.openLandscapeRulePanel = function() {
		// "collapse3" opened by button's data-target
		$scope.closePanel("collapse1");
		$scope.closePanel("collapse2");
		$scope.landscapeNotSelectedBeforeRule();
	}
	
	$scope.openLfluRulePanel = function() {
		// "collapse2" opened by button's data-target
		$scope.closePanel("collapse1");
		$scope.closePanel("collapse3");
		$scope.landscapeNotSelectedBeforeLfluRule();
	}
	
	$scope.openEditLandscapePanel = function() {
		$scope.openPanel("collapse1");
		$scope.closePanel("collapse2");
		$scope.closePanel("collapse3");
	}
	
	$scope.goToCreateLandscapePage = function() {
		$location.path("/cycle/topic/landscape_eval/task/summary");
	}
	
	$scope.selectLandscapeForRulesDialog = function(resource) {
		$scope.selectedLandscapeForRulesDialog = resource;
		$scope.selectedLandscapeChangedFlag++;
	}
	
	
	$rootScope.$on('shape-create-completed', function(event, data) {
		if ($scope.selected_landscape) {
			$scope.refreshMasks($scope.selected_landscape.landscapeId);
		}
		//$scope.displayWarning = true;
		//$scope.warningMessage = "Your new shape was created. If it intersects with your selected landcape, refresh the Area of Interest list to see it in the list."
		//console.log("Received shape created msg from map studio");
		//if (data) {
			//$scope.mapExtent.fillFrom(data);
			//$scope.$broadcast('shapeCreated', $scope.mapExtent);
		//}
	});
	
	$rootScope.$watch('selectedZeroLandscapeFlag', function() 
	{ 	
		if ($rootScope.selectedZeroLandscapeFlag) {
			$scope.refreshUserLandscapesFromServer();
		}
		
		if ($rootScope.selectedFamilyLandscapeFlag) {
			$scope.closeAllNotificationPanels();
				
			$scope.selectedFamilyLandscape = landscapeResource.getSelectedFamilyLandscape();
			if ($scope.familyOnly) {
				$scope.selected_landscape = null;
			}
		}
	});
	
}])