/** Fuels Moisture Input primary key class - input data that is saved and can be used to run a fire model. */

/** FuelMoistureDOPK empty constructor */
function FuelMoistureDOPK(runId) 
{
	this.runId = null;
	if (runId)  this.runId = runId;
	this.model = 0;    // fuel model, or 0 if for all
}

/** Set values from the old "input" object. */
FuelMoistureDOPK.prototype.fillFromInput = function(inputArrayElement)
{
	if (inputArrayElement) {
		this.model = inputArrayElement[0];
	}
}