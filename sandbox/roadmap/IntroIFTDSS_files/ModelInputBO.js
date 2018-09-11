/** 
 * Fire Behavior Model Input class - input data that is saved and can be used to run a fire model.
 * This is the same structure as ModelInputBO.java so it creates JSON data that can be consumed
 * directly by that Java class. 
 */

/** ModelInputBO empty constructor */
function ModelInputBO(runId) 
{
	this.runId = null;  // The resource ID of the model input or run
	if (runId)  this.runId = runId;
	this.containId = null;
	this.owner = null;
	this.created = null;
	this.resourceName = null;
	this.modelType = "Flam";  // ModelTypeEnum
	this.zeroLandscapeId = null;
	this.wind = new InputWindDO(runId);
	this.crownFire = new InputCrownFireDO(runId);
	this.fuelMoistureList = new Array();
}

ModelInputBO.prototype.addFuelMoisture = function(fuelMoisture) 
{
	if (fuelMoisture) {
		this.fuelMoistureList.push(fuelMoisture);
	}
}

/** Copy-constructor-like function */
ModelInputBO.prototype.fillFromBO = function(other)
{
	if (other) {
		if (other.resourceId) {
			this.runId = other.resourceId;
		} else {
			this.runId = other.runId;
		}
		this.containId = other.containId;
		this.owner = other.owner;
		this.created = other.created;
		this.resourceName = other.resourceName;
		// this.modelType = other.modelType; //uncomment when we have > 1 model type 
		this.zeroLandscapeId = other.zeroLandscapeId;
		this.wind = other.wind;
		this.crownFire = other.crownFire;
		this.fuelMoistureList = other.fuelMoistureList;
	}
}

/** Set values from the old "input" object. */
ModelInputBO.prototype.fillFromInput = function(input)
{
	if (input) {
		if (input.resourceDef) {
			this.runId = input.resourceDef.runId;
			this.containId = input.resourceDef.containId;
			this.owner = input.resourceDef.owner;
			this.created = input.resourceDef.created;
			this.resourceName = input.resourceDef.name;
			// this.modelType = input.resourceDef.modelType; //uncomment when we have > 1 model type 
			this.zeroLandscapeId = input.resourceDef.zeroLandscapeId;
		}
		
		this.wind.fillFromInput(input);
		this.crownFire.fillFromInput(input);
		
		if (input.fuelMoisture && input.fuelMoisture.fuelMoistureArray) {
			for (var i=0; i<input.fuelMoisture.fuelMoistureArray.length; i++) {
				var fuelMoisture = new FuelMoistureDO(this.runId);
				fuelMoisture.fillFromInput(input.fuelMoisture.fuelMoistureArray[i]);
				this.addFuelMoisture(fuelMoisture);
			}
		}
	}
}
	
/** @return  this object as the old model "input" object used in "Playground" code. */
ModelInputBO.prototype.asInputObject = function(landscape)
{
	// Fuel Moisture conversion
	var fuelMoistureArray = new Array();
	if (this.fuelMoistureList && this.fuelMoistureList.length > 0) {
		for (var i=0; i<this.fuelMoistureList.length; i++) {
			var fuelMoistureDO = this.fuelMoistureList[i];  // not of type FuelMoistureDO here
			if (fuelMoistureDO) {
				var fmDO = new FuelMoistureDO();
				var arrayElement = fmDO.asInputArrayElement(fuelMoistureDO);
				if (arrayElement) {
					fuelMoistureArray.push(arrayElement);
				}
			}
		}
	} else {
		fuelMoistureArray.push([0,null,null,null,null,null]);
	}
	
	// Crown Fire Method conversion
	var crownFireMethodObj = {"id":2, "name":"Scott/Reinhardt"};
	if (this.crownFire && this.crownFire.crownFireMethod && (this.crownFire.crownFireMethod == 1 || this.crownFire.crownFireMethod.id == 1)) {
		crownFireMethodObj =  {"id":1, "name":"Finney"};
	}
	var foliarMoistureContentVal = 100;
	if (this.crownFire && this.crownFire.foliarMoisture) {
		foliarMoistureContentVal = this.crownFire.foliarMoisture;
	}
	
	// Wind conversion
	var windDirVal = null;
	if (this.wind && this.wind.windDirection != null && typeof(this.wind.windDirection) != "undefined")  windDirVal = this.wind.windDirection;
	var windSpeedVal = null;
	if (this.wind && this.wind.windSpeed != null && typeof(this.wind.windSpeed) != "undefined")  windSpeedVal = this.wind.windSpeed;
	
	var input = {
			resourceDef: {
				owner: this.owner,
				created: this.created,
		    	name: this.resourceName,
		    	runId: this.runId,
		    	containId: this.containId,
			    modelType: "Landscape Fire Behavior",
			    zeroLandscapeId: this.zeroLandscapeId,
			    modelStatus: null
			},
			weather:{
				ERC: 80,
				HourlyWeatherArray: [[0,null,null,null,null,null,null]]
			},
			wind:{
				windSpeed: windSpeedVal,
				windDir: windDirVal
			},
			crownFire:{
				crownFireMethod: crownFireMethodObj,
				foliarMoistureContent: foliarMoistureContentVal
			},
			landscape: {
				landscapeId: landscape.landscapeId,
				resourceName: landscape.resourceName,
				complete: landscape.complete
			},
			fuelMoisture: {
				fuelMoistureArray: fuelMoistureArray
			}
		};
	
	return input;
}