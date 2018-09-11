function LFLURule(lfluTreatmentId, categoryType, severityType, timeType, vdist, ruleId) 
{
	this.lfluTreatmentId = lfluTreatmentId;
	this.categoryType = categoryType;
	this.severityType = severityType;
	this.timeType = timeType;
	this.vdist = vdist;
	this.ruleId = ruleId;
}

LFLURule.prototype.fillFromLandscapeRuleView = function(ruleView)
{
	this.lfluTreatmentId = ruleView.lfluTreatmentId;
	this.categoryType = ruleView.lfluCategory;
	this.severityType = ruleView.lfluSeverity;
	this.timeType = ruleView.lfluTime;
	this.vdist = ruleView.lfluVdist;
	this.ruleId = ruleView.ruleId;
}