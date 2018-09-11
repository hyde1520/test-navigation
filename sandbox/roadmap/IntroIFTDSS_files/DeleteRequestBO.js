/** DeleteRequestBO class - a collection of resources that we want to delete. */

/**
 * DeleteRequestBO empty constructor
 */
function DeleteRequestBO() 
{
	this.originalDeleteResourceId = null;
	this.deleteResourceList = new Array;	
}
	
/**
 * addDeleteResource function
 *   @param resourceToDelete - <The resource object that we want to delete>
 */
DeleteRequestBO.prototype.addDeleteResource = function(resourceToDelete)
{
	if (!this.deleteResourceList)  this.deleteResourceList = [];
	if (resourceToDelete) {
		this.deleteResourceList.push(resourceToDelete);
	}
}