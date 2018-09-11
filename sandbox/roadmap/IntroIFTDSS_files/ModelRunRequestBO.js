/** 
 * Fire Behavior Model Run Request class - input data needed to run a fire behavior model.
 * This is the same structure as ModelRunRequestBO.java so it creates JSON data that can be consumed
 * directly by that Java class. 
 */

/** ModelRunRequestBO empty constructor */
function ModelRunRequestBO() 
{	
	this.landscapeId = null;  // landscape to run model against
	this.modelInputId = null; // ID of model input record
	this.containId = null;    // folder to put run in
	this.created = null;
	this.owner = null;        // user ID that owns run
	this.resourceName = null; // model run name
	this.modelType = "Flam";  // for modelTypeEnum
	this.zeroLcpId = null;    // ID of the zero landscape
}
