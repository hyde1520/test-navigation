mainApp.factory('breadcrumbResource', ['$location', '$http', '__env', breadcrumbResource]);

function breadcrumbResource ($location, $http, __env) 
{
	var _activeWorkspace = {};
	var _activeFolder = null;
	var _subtopic = null;
	var _guidance = null;
	var _leafView = null;
	var _helpContext = null;
	
	var topicHelp = {'Create Landscape Fire Behavior Model': 1095, 
					'Edit Landscape Fire Behavior Model': 1095,
					'Model Run Report': 1095,
					'Landscape Evaluation': 1081,
					'Strategic Planning': 1108,
					'Playground View': 1059,
					'Edit Landscape': 1076,
					'Generate Landscape Summary':1083,
					'other': 1000};
	var serverTopicHelp = {};
	var serverURLHelp = {};
	var topicHelpByURL = [
	{urlstr: 'cycle/landscape_eval', id: 1081},
	{urlstr: 'cycle/topic/landscape_eval/task/summary', id:1083}
			];
	var serverTopicHelpByURL = [];
	
	var service = {};
	
	// Web Help 
	service.getTopicHelp = function() {
		var helpId = -1;
		// Hard code now until we figure out why the url paths from 
		// the help table don't come down when we request the content of 
		// that table.
		if ($location.$$path.indexOf("cycle/topic/landscape_eval/task") > -1)  {
			helpId = 1086;
		}
		else if ($location.$$path.indexOf("landscape/edit") > -1)  {
			helpId = 1083;
		}
		else if ($location.$$path.indexOf("/report/summary") > -1)  {
			helpId = 1137;
		}
		else if ($location.$$path.indexOf("/createTreatmentAlternatives") > -1)  {
			helpId = 1111;
		}
		else if (_leafView != null) {
			// Get local default value (in case server value is not set
			var topicHelpId = serverTopicHelp[_leafView.name];
			if (topicHelpId == null) {
				topicHelpId = topicHelp[_leafView.name];
			}
			if ((topicHelpId != null) && (typeof topicHelpId != 'undefined')) {
				helpId = topicHelpId;
			}
		}
		else if (_subtopic != null) {
			var topicHelpId = serverTopicHelp[_subtopic.name];
			if (topicHelpId == null) {
				topicHelpId = topicHelp[_subtopics.name];
			}
			if ((topicHelpId != null) && (typeof topicHelpId != 'undefined')) {
				helpId = topicHelpId;
			}
		}
		// If help id not set, try to find help by a matching url fragment
		if (helpId == -1) {
			var id = topicHelpByURL.length;
			for (var i=0; i < topicHelpByURL.length; i++) {
				var ind = $location.$$path.indexOf(topicHelpByURL[i].urlstr);
				if ($location.$$path.indexOf(topicHelpByURL[i].urlstr) > -1)  {
					helpId = topicHelpByURL[i].id;
					break;
				}
			}
		} 
		if (helpId == -1) {
			helpId = topicHelp['other'];
		}
		
		MadCap.OpenHelp(helpId, null, null, null);
	}
	service.setHelpTopic = function(helpName) {
		_helpContext = helpName;
	}
	
	// Workspace functions
	service.setActiveWorkspace = function(workspace)  { 
		_activeWorkspace = workspace; 
	}
	service.getActiveWorkspace = function()  { 
		return _activeWorkspace; 
	}
	service.navigateToWorkspaceView = function() {
		this.removeActiveFolder();
		this.removeSubtopic();
		this.removeGuidance();
		this.removeLeafView();
		$location.path("/workspace/"+_activeWorkspace.resourceId);
	}
	
	// Folder functions
	service.setActiveFolder = function(folder)  { _activeFolder = folder; }
	service.removeActiveFolder = function()  { _activeFolder = null; }
	service.getActiveFolder = function()  { return _activeFolder; }
	service.activeFolderExists = function() {
		return (typeof(_activeFolder) != "undefined" && _activeFolder != null);
	}
	service.navigateToFolderView = function() {
		this.removeSubtopic();
		this.removeGuidance();
		this.removeLeafView();
		$location.path("/workspace/"+_activeFolder.resourceId);
	}
	
	// Sub-topic Page functions
	service.setSubtopic = function(name, uri)  { _subtopic = {"name": name, "uri": uri}; }
	service.removeSubtopic = function()  { _subtopic = null; }
	service.getSubtopic = function()  { return _subtopic; }
	service.getSubtopicName = function() {
		//console.log("getSubtopicName called");
		if (_subtopic)  return _subtopic.name;
		else 			return "";
	}
	service.subtopicExists = function() {
		return (typeof(_subtopic) != "undefined" && _subtopic != null);
	}
	service.navigateToSubtopicView = function() {
		if (this.subtopicExists()) {
			this.removeGuidance();
			this.removeLeafView();
			$location.path(_subtopic.uri);
		}
	}
	
	// Guidance Page functions
	service.setGuidance = function(name, uri)  { _guidance = {"name": name, "uri": uri}; }
	service.removeGuidance = function()  { _guidance = null; }
	service.getGuidance = function()  { return _guidance; }
	service.getGuidanceName = function() {
		if (_guidance)  return _guidance.name;
		else 			return "";
	}
	service.guidanceExists = function() {
		return (typeof(_guidance) != "undefined" && _guidance != null);
	}
	service.navigateToGuidanceView = function() {
		if (this.guidanceExists()) {
			this.removeLeafView();
			$location.path(_guidance.uri);
		}
	}
	
	// Leaf Page functions
	service.setLeafView = function(name, uri)  { _leafView = {"name": name, "uri": uri}; }
	service.removeLeafView = function()  { _leafView = null; }
	service.getLeafView = function()  { return _leafView; }
	service.getLeafViewName = function()  { 
		if (_leafView)  return _leafView.name;
		else 			return ""; 
	}
	service.leafViewExists = function() {
		return (typeof(_leafView) != "undefined" && _leafView != null);
	}
	service.navigateToLeafView = function() {
		if (this.leafViewExists()) {
			$location.path(_leafView.uri);
		}
	}
	
	service.getHelpContent = function() {
		if (!serverTopicHelp['Landscape Evaluation']) {
			  return $http({
				  method: 'GET',
				  url: __env.src("/iftdssREST/help/content")
			  }).then(function(response){
				  if ((response.data)  && (response.data.length > 0)) {
					  for (var index=0; index < response.data.length; index++) {
						  if (response.data[index].pageBreadcrumb) {
							  serverTopicHelp[response.data[index].pageBreadcrumb] = response.data[index].madcapHelpId;
						  }
						  if (response.data[index].pageBreadcrumb) {
							  serverTopicHelp[response.data[index].pageBreadcrumb] = response.data[index].madcapHelpId;
						  }
					  }
				  }
				  return response;
			  },function(response){
				  return response || {data:{responseMessage:"Request Failed"}};
			  });
		}
	}

	
	return service;


}