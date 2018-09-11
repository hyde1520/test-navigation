function UserPreferenceBO() 
{
	this.userId = null;
	this.nameValueMap = {};
	this.preferenceFields = ["unitid", "geoarea", "agency", "bbox_south", "bbox_north", "bbox_east", "bbox_west"];
	//for (var i=0; i < this.preferenceFields.length; i++) {
	//	this.nameValueMap[this.preferenceFields[i]] = null;
	//}
}

UserPreferenceBO.prototype.fillFromBO = function(prefBO) {
	this.userId = prefBO.userId;
	for (var i=0; i < this.preferenceFields.length; i++) {
		var fieldName = this.preferenceFields[i];
		if (prefBO.nameValueMap[fieldName]) {
			this.nameValueMap[fieldName] = prefBO.nameValueMap[fieldName];
		}
	}
}

UserPreferenceBO.prototype.fillAgencyInfo = function(prefUserId, agency, ga_area_cd, unit)
{
	this.userId = prefUserId;
	if (agency) {
		this.nameValueMap.agency = agency;
	}
	if (ga_area_cd) {
		this.nameValueMap.geoarea = ga_area_cd;
	}
	if (unit) {
		this.nameValueMap.unitid = unit.unitid;
		// if one of the bounding box values are set, this indicates this unit
		// has a bounding box
		if (unit.xMin) {
			this.nameValueMap.bbox_east = unit.xMax;
			this.nameValueMap.bbox_west = unit.xMin;
			this.nameValueMap.bbox_north = unit.yMax;
			this.nameValueMap.bbox_south = unit.yMin;
		}
	}
}

UserPreferenceBO.prototype.getAgency = function()
{
		return this.nameValueMap.agency;
}
UserPreferenceBO.prototype.getUnitId = function()
{
		return this.nameValueMap.unitid;
}
UserPreferenceBO.prototype.getGeoArea = function()
{
		return this.nameValueMap.geoarea;
}
UserPreferenceBO.prototype.getGeoAreaName = function(userPrefsService)
{
		return userPrefsService.getGeoAreaName(this.nameValueMap.geoarea);
}