function UnitsBO() 
{
	this.unitsList = [];
	this.unitEntity = null
	this.nameValueMap = {};
}


UnitsBO.prototype.fillFromDOList = function(unitsDOList) {
	for (var i=0; i < this.unitsDOList.length; i++) {
		this.unitsList.push(unitsDOList[i])
	}
}

UnitsBO.prototype.fillFromDO = function(unitsDO) {
	this.unitEntity = unitsDO;
}
