/** LandscapeRuleFragment class - a where-condition clause or modify-value clause. */

/** 
 * LandscapeRuleFragment constructor 
 * 	 @param  fragmentId: <number> - the unique ID of this rule fragment
 *   @param  condition: <boolean> - true if this is a "where" condition, false if a "modify" condition
 *   @param  attributeKey: <number> - the landscape attribute identifier
 *   @param  operator: <String> - a two character operator enumeration
 *   @param  ruleId: <number> - the ID of the rule that this fragment belongs to
 **/
function LandscapeRuleFragment(fragmentId, condition, attributeKey, operator, landscapeValue, ruleId) 
{
	this.fragmentId = fragmentId;
	this.condition = condition;
	this.attributeKey = attributeKey;
	this.landscapeAttrib = null;
	this.operator = operator;
	this.landscapeValue = landscapeValue;
	//this.ruleId = ruleId;  // this attribute isn't needed at the business level
}

LandscapeRuleFragment.prototype.fillFromLandscapeRuleView = function(ruleView)
{
	this.fragmentId = ruleView.fragmentId;
	this.condition = ruleView.conditionFromFlag;
	this.attributeKey = ruleView.landscapeAttrib;
	this.attributeName = ruleView.landscapeAttribName;
	this.operator = ruleView.operator;
	this.operatorName = ruleView.operatorName;
	this.landscapeValue = ruleView.landscapeValue;
}
