/** Crown Fire Model Input class - input data that is saved and can be used to run a fire model. */

/** InputCrownFireDO empty constructor */
function InputCrownFireDO(runId) 
{
	this.resourceId = null;
	if (runId)  this.resourceId = runId;
	this.crownFireMethod = {"id":2, "name":"Scott/Reinhardt"};
	this.foliarMoisture = 100;
}

/** Set values from the old "input" object. */
InputCrownFireDO.prototype.fillFromInput = function(input)
{
	if (input && input.crownFire && input.crownFire.crownFireMethod) {
		this.crownFireMethod = input.crownFire.crownFireMethod.id;
		this.foliarMoisture = input.crownFire.foliarMoistureContent;
	}
}