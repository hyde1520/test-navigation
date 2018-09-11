mainApp.directive('weatherDefPanelDirective',function(){
	return {
		templateUrl: "pages/modelpages/weatherDefPanel_partial.html",
		scope: {validation:'<',
			    inputWeather: '=input'
			   },
		controller: "weatherDefController"
	}
}).controller('weatherDefController',["$scope","$filter","$rootScope","modelValidationFactory","workspaceResource","breadcrumbResource",
  function($scope,$filter,$rootScope,modelValidationFactory,workspaceResource,breadcrumbResource){
	
	$scope.weatherInputClass = "panel-default";
	
	console.log($scope.inputWeather);
	
	$scope.validateInputs = function() {
		if ($scope.inputWeather && modelValidationFactory.valid_weatherConditioning($scope.inputWeather)) {
			$scope.weatherInputClass = "panel-success";
			$scope.validation();
		} else {
			$scope.weatherInputClass = "panel-default";
		}
	}
	
	$scope.addWeatherHourly = function(index) {
		$scope.inputWeather.HourlyWeatherArray
			.splice(index, 0, [
			                    $scope.inputWeather.HourlyWeatherArray[index][0]+100,
			                    $scope.inputWeather.HourlyWeatherArray[index][1],
			                    $scope.inputWeather.HourlyWeatherArray[index][2],
			                    $scope.inputWeather.HourlyWeatherArray[index][3],
			                    $scope.inputWeather.HourlyWeatherArray[index][4],
			                    $scope.inputWeather.HourlyWeatherArray[index][5],
			                    $scope.inputWeather.HourlyWeatherArray[index][6]
			                    ]);
		$scope.inputWeather.HourlyWeatherArray[0][0] = 0;
		if ($scope.inputWeather.HourlyWeatherArray.length > 1) {
			for (i = 1; i < $scope.inputWeather.HourlyWeatherArray.length; i++) {
				$scope.inputWeather.HourlyWeatherArray[i][0] = $scope.inputWeather.HourlyWeatherArray[i-1][0] + 100;
			}
		}
		$scope.validateInputs();
	}
	
	$scope.deleteWeatherHourly = function(index) {
		$scope.inputWeather.HourlyWeatherArray.splice(index,1);
		$scope.inputWeather.HourlyWeatherArray[0][0] = 0;
		if ($scope.inputWeather.HourlyWeatherArray.length > 1) {
		for (i = 1; i < $scope.inputWeather.HourlyWeatherArray.length; i++) {
			$scope.inputWeather.HourlyWeatherArray[i][0] = $scope.inputWeather.HourlyWeatherArray[i-1][0] + 100;
		}
		}
		$scope.validateInputs();
	}

	$scope.$watch($scope.inputWeather,function(){$scope.validateInputs()})
	
}])