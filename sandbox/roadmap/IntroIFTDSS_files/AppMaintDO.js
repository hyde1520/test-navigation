/** Application Maintenance class */

/** AppMaintDO empty constructor */
function AppMaintDO() 
{
	this.pseudoKey = null;
	this.exemptUserIds = null;
	this.underMaint = false;
}

/** Set values from another object. */
AppMaintDO.prototype.fillFrom = function(other)
{
	this.pseudoKey = other.pseudoKey;
	this.exemptUserIds = other.exemptUserIds;
	this.underMaint = other.underMaint;
}

AppMaintDO.prototype.isUnderMaint = function() {
	if (!this.underMaint)  return false
	else if (this.underMaint == true) return true
	else return false;
}

AppMaintDO.prototype.getExemptUserArray = function() 
{
	if (this.exemptUserIds && this.exemptUserIds.length > 0) {
		var exemptUserArray = this.exemptUserIds.split(",");
		if (exemptUserArray && exemptUserArray.length > 0) {
			return exemptUserArray;
		}
	}
	return [];
}