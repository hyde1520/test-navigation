mainApp.factory('runResource', ['$http','__env', runResource]);

function runResource ($http,__env) {

	function getRuns(userid) {
		return $http({
		      method: 'GET',
		      url: __env.src("/iftdssREST/model/viewmodels/"+userid),
		    }).
		    then(function(response) {
		    	//console.log(response.data.responseMessage)
		        return response;
		      }, function(response) {
		        return response || {data:{responseMessage: "Request failed"}};
		    });
	}

	function getRun(user,runid) {
	  user_runs = getRuns(user).then(function(response){
	    if (response.data && response.data.length > 0) {
			return response.data;
		} else if (response.data && response.data.length == 0) {
			return response.data;
		} else {
			error_message = "Error loading user runs"
			return false;
		}
	  });
	  for (i=0; i<user_runs.length; i++) {
	    if ((user_runs[i]).runId == runid) {
	      return true,user_runs[i]
	    }
	  }
	  return false, null
	}

	example_run_data = [
	  {name:"Windy risk projectVARs 2000ign 6hr",
	   id:"643",
       owner:"Kim Ernstrom",
       date_created:"04/20/2016",
       rate:"1",
       approvalstatus:"rejected",
       type:"Flammap",
       status:"done",
	  },
	  {name:"Windy risk prelim automatedVARS 1000ign 3hr",
	   id:"342",
	   owner:"Bre Schueller",
       date_created:"04/20/2016",
       rate:"9",
       approval_status:"approved",
       type:"Flammap",
       status:"done"
	  },
	  {name:"Windy MTT historicignitions 97thpercentile",
       owner:"Bre Schueller",
	   id:"632",
       date_created:"04/20/2016",
       rate:"3",
       approval_status:"approved",
       type:"MTT",
       status:"done"
	  },
	  {name:"Windy MTT manual ignitions 97thpercentile",
	   owner:"Kim Ernstrom",
	   id:"292",
	   date_created:"04/25/2016",
	   rate:"9",
	   approval_status:"",
	   type:"MTT",
	   status:"crashed"
      },
      {name:"Windy basic fire behavior S&R 90thpercentile",
       owner:"Bre Scheuller",
	   id:"457",
       date_created:"01/01/2015",
       rate:"5",
       approval_status:"",
       type:"Flammap",
       status:"not ready"
      }
	]


	return {
		    getRuns: getRuns,
		    getRun: getRun
	       };

}