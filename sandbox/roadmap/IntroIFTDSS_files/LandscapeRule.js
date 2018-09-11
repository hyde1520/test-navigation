/** Landscape Rule class - a collection of "where" and "modify" clauses that define changes to make to a landscape. */

/**
 * LandscapeRule empty constructor
 */
function LandscapeRule() 
{
	this.ruleId = null;
	this.owner = null;
	this.ruleName = null;
	this.ruleSetId = null;
	this.landscapeId = null;
	this.maskId = null;
	this.ruleSequenceNum = null;
	this.ruleConditionFragments = new Array();
	this.ruleModifyFragments = new Array();
	this.lfluRule = null;
	this.isLflu = false;
}

LandscapeRule.prototype.fillFromLandscapeRuleView = function(ruleView)
{
	this.owner = ruleView.ruleOwner;
	this.ruleId = ruleView.ruleId;
	this.ruleSetId = ruleView.ruleSetId;
	this.landscapeId = ruleView.landscapeId;
	if (ruleView.ruleMaskId)   this.maskId = ruleView.ruleMaskId;
	if (ruleView.ruleMaskName) this.maskName = ruleView.ruleMaskName;
	this.ruleSequenceNum = ruleView.ruleSetSeq;
	this.ruleAppliedFlag = ruleView.ruleAppliedFlag;
	this.isLflu = ruleView.isLflu;
}
	
/**
 * addWhereClause function
 *   @param landscapeRuleFragment - <LandscapeRuleFragment>
 */
LandscapeRule.prototype.addWhereClause = function(landscapeRuleFragment)
{
	if (!this.ruleConditionFragments)  this.ruleConditionFragments = [];
	if (landscapeRuleFragment) {
		this.ruleConditionFragments.push(landscapeRuleFragment);
	}
}

LandscapeRule.prototype.addModifyClause = function(landscapeRuleFragment)
{
	if (!this.ruleModifyFragments)  this.ruleModifyFragments = [];
	if (landscapeRuleFragment) {
		this.ruleModifyFragments.push(landscapeRuleFragment);
	}
}

LandscapeRule.prototype.removeWhereClause = function(ruleFragment) { 
	this.removeRuleFragment(ruleFragment, this.ruleConditionFragments);
}
LandscapeRule.prototype.removeModifyClause = function(ruleFragment) { 
	this.removeRuleFragment(ruleFragment, this.ruleModifyFragments);
}
LandscapeRule.prototype.removeRuleFragment = function(ruleFragment, fragmentList) {
	if (!ruleFragment)  return;
	if (!fragmentList)  return;
	for (i=0; i < fragmentList.length; i++) {
		if (ruleFragment.fragmentId == fragmentList[i].fragmentId) {
			fragmentList.splice(i, 1);
			return;
		}
	}
} 