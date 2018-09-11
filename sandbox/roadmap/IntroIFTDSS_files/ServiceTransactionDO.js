/** Service Transaction class that reflects the Java version of this data object */

/** ServiceTransactionDO empty constructor */
function ServiceTransactionDO() 
{
	this.transactionId = null;
	this.serviceType = null;
	this.completedTime = null;
	this.lastUpdated = null;
	this.queueTopic = null;
	this.requestTime = null;
	this.resourceId = null;
	this.serviceTxStatus = null;
	this.statusMsg = null;
	this.userId = null;
	this.serviceName = null;
	this.hostname = null;
	this.cancelRequested = null;
}

ServiceTransactionDO.prototype.fillFromOther = function(otherSvcTx)
{
	this.transactionId = otherSvcTx.transactionId;
	this.serviceType = otherSvcTx.serviceType;
	this.completedTime = otherSvcTx.completedTime;
	this.lastUpdated = otherSvcTx.lastUpdated;
	this.queueTopic = otherSvcTx.queueTopic;
	this.requestTime = otherSvcTx.requestTime;
	this.resourceId = otherSvcTx.resourceId;
	this.serviceTxStatus = otherSvcTx.serviceTxStatus;
	this.statusMsg = otherSvcTx.statusMsg;
	this.userId = otherSvcTx.userId;
	this.serviceName = otherSvcTx.serviceName;
	this.hostname = otherSvcTx.hostname;
	this.cancelRequested = otherSvcTx.cancelRequested;
}
