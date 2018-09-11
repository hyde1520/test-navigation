/** Wind Model Input class - input data that is saved and can be used to run a fire model. */

/** InputWindDO empty constructor */
function InputWindDO(runId) 
{
	this.resourceId = null;
	if (runId)  this.resourceId = runId;
	this.windDirection = null;
	this.windSpeed = null;
}

/** Set values from the old "input" object. */
InputWindDO.prototype.fillFromInput = function(input)
{
	if (input && input.wind) {
		this.windDirection = input.wind.windDir;
		this.windSpeed = input.wind.windSpeed;
	}
}