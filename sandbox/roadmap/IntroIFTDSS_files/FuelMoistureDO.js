/** Fuels Moisture Input class - input data that is saved and can be used to run a fire model. */

/** FuelMoistureDO empty constructor */
function FuelMoistureDO(runId) 
{
	this.id = new FuelMoistureDOPK(runId);
	this.fm1Hr = null;
	this.fm10Hr = null;
	this.fm100Hr = null;
	this.fmLiveHerbaceous = null;
	this.fmLiveWoody = null;
}

/** Set values from the old "input" object. */
FuelMoistureDO.prototype.fillFromInput = function(inputArrayElement)
{
	if (inputArrayElement) {
		this.id.model = inputArrayElement[0];
		this.fm1Hr = inputArrayElement[1];
		this.fm10Hr = inputArrayElement[2];
		this.fm100Hr = inputArrayElement[3];
		this.fmLiveHerbaceous = inputArrayElement[4];
		this.fmLiveWoody = inputArrayElement[5];
	}
}

FuelMoistureDO.prototype.asInputArrayElement = function(otherFuelMoistureDO)
{
	var arrayElement = [otherFuelMoistureDO.id.model, otherFuelMoistureDO.fm1Hr, otherFuelMoistureDO.fm10Hr, otherFuelMoistureDO.fm100Hr, otherFuelMoistureDO.fmLiveHerbaceous, otherFuelMoistureDO.fmLiveWoody];
	return arrayElement;
}