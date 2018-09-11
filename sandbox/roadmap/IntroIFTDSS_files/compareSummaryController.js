mainApp.controller("compareSummaryController", ["$scope", '$rootScope','$location','$filter','$route','$window',"breadcrumbResource", "reportService", compareSummaryController])

function compareSummaryController($scope,$rootScope,$location,$filter,$route,$window,breadcrumbResource, reportService){

	$rootScope.simple_nav_bar=true;
	$rootScope.no_breadcrumbs=true;

	$rootScope.navbar_title="Compare Landscape Summary";
	$scope.reportType = $route.current.params.reportType;
	$rootScope.navbar_title=reportService.reportTypesAll[$scope.reportType];
	$scope.reportName = reportService.reportTypesAll[$scope.reportType];

	$scope.init = function()
	{
		$scope.layerNameFilter={"layerId": ""};
		$scope.compareSummaryId = $route.current.params.summaryId;
		$scope.lcpAttrIds = ['fm', 'cc', 'ch', 'cbh', 'cbd'];
		$scope.allAttrIds = ['fm', 'cc', 'ch', 'cbh', 'cbd','asp', 'slp', 'elv', 'flm', 'spr', 'int', 'hta', 'crn'];
		$scope.basicOutputIds = ['flm', 'spr', 'int', 'hta', 'crn'];
		$scope.attrIds = $scope.lcpAttrIds;
		$scope.compare_title  = "";		
		$scope.pdfPages = {
			// pending:,
			processed:[]
		};


		$scope.allLayerNameArr = {
				'fm': "Fuel Model (FBFM)",
                'cc': "Canopy Cover",
                'ch': "Stand Height",
                'cbh': "Canopy Base Height",
                'cbd': "Canopy Bulk Density",
                'asp': "Aspect",
                'slp': "Slope",
                'elv': "Elevation",
                'flm': 'Flame Length',
				'spr': 'Spread Rate',
				'int': 'Intensity',
				'hta': 'Heat/Area',
				'crn': 'Crown Fire'};
		$scope.landscapeOnlyNameArr = {
				'fm': "Fuel Model (FBFM)",
                'cc': "Canopy Cover",
                'ch': "Stand Height",
                'cbh': "Canopy Base Height",
                'cbd': "Canopy Bulk Density"
		};
		$scope.basicOutputNameArr= {
			'flm': 'Flame Length',
			'spr': 'Spread Rate',
			'int': 'Intensity',
			'hta': 'Heat/Area',
			'crn': 'Crown Fire'
		};
		$scope.colorPair = ['blue', 'green'];
		$scope.lcpColorPair = ['blue', 'green'];
		$scope.outputColorPair = ['blue', 'green'];
		$scope.showBasicOutput = false;
		$scope.showAutoBasicOutput = false;

		$scope.queueMsg = "A request has been made for summary data. Check back later!";
		if (!$scope.compareData) {
			if ($scope.$parent.$resolve) {
				$scope.compareData = $scope.$parent.$resolve.compareData;
			}
		}
		$scope.layerNameArr = $scope.allLayerNameArr;
		if ($scope.reportType == "rclp") {
			$scope.layerNameArr = $scope.landscapeOnlyNameArr;
			$scope.attrIds = $scope.lcpAttrIds;
			$scope.colorPair = $scope.outputColorPair;
		}
		else if ($scope.reportType == "rcfb") {
			$scope.layerNameArr = $scope.basicOutputNameArr;
			$scope.attrIds = $scope.basicOutputIds;
			$scope.colorPair = $scope.outputColorPair;
		}

		if (typeof($scope.compareData) != 'undefined') {
			if ($scope.compareData.responseMessage) {
				$scope.queueMsg = $scope.compareData.responseMessage;
			}
		}
		var pageName = $scope.reportName;
   		breadcrumbResource.setLeafView(pageName, "#");
  		$rootScope.navbar_title = pageName;

		// Create the filter list
		if (typeof($scope.landscape_layers) == "undefined" || $scope.landscape_layers == null) {
			$scope.landscape_layers = [];
		}
		$scope.landscape_layers.push( {"type":"", "name":"All"} );
		for (i=0; i < $scope.attrIds.length; i++) {
			var attribEnum = $scope.attrIds[i];
			$scope.landscape_layers.push( {"type":attribEnum, "name":$scope.layerNameArr[attribEnum]} );;
		}
		//Set showAutoBasicOutput && showBasicOutput booleans for displaying Model Parameters
		for (var k in $scope.layerNameArr){
		    if ($scope.layerNameArr.hasOwnProperty(k) && !$scope.showBasicOutput) {
		    	$scope.showBasicOutput = $scope.isBasicOutput(k);
	         	// console.log("Key is " + k + ", value is " + $scope.layerNameArr[k]);
		    }
		    if ($scope.layerNameArr.hasOwnProperty(k) && !$scope.showAutoBasicOutput) {
		    	$scope.showAutoBasicOutput = $scope.isAutoBasicOutput(k);
	         	// console.log("Key is " + k + ", value is " + $scope.layerNameArr[k]);
		    }
		}
		// console.log($scope.showBasicOutput);
		// console.log($scope.showAutoBasicOutput);
		// console.log($scope.layerNameArr);

	} //end init()

	$scope.getLayerName = function(layerId) {
		return $scope.layerNameArr[layerId];
	}

	$scope.setTitle = function() {
		$scope.landscapeName  = "Summary Compare Report - ";
		var reportType = ""
		if ($scope.reportType) {
			reportType = $scope.reportType;
		}
		else {
			reportType = $scope.$resolve.reportType;
		}
		if (reportType) {
			$scope.landscapeName = (reportService.getReportName(reportType) + " - ");
		}
		breadcrumbResource.setLeafView( $scope.landscapeName + "-" +  $scope.reportName , '#');
		// $scope.landscapeSource = $scope.compareData.landscapeSource;
	}

	$scope.getImageUrl = function() {
        layerEnum = this.tableId;
        var layercompareData = $scope.compareData.layerSummary;
        var imageUrl = layercompareData[layerEnum].summaryImage.replace(/\\/g, "/");
        return imageUrl;
    }

	$scope.openBigImage = function() {
	/*	imgsrc = "images/testLandscape.gif";
		layerEnum = this.tableId;
		var layercompareData = $scope.compareData.layerSummary;
		//layercompareData[layerEnum].summaryImage;
		viewwin = window.open(imgsrc,'viewwin', 'width=600,height=300'); */
	}

	$scope.refreshPage = function () {
		//$scope.fetchcompareDataForRefresh();
		$route.reload();
	};

	$scope.setFilter = function(layerEnum) {
		$scope.layerNameFilter = {"layerId": layerEnum};
	}

	$scope.isALayerFilterMatch = function(layerEnum) {
		if ($scope.layerNameFilter.layerId == '')  return true; // All
		if ($scope.layerNameFilter.layerId == layerEnum)  return true;
		return false;
	}

	$scope.isBasicOutput = function(basicOutputId) {
    	return ($scope.basicOutputIds.indexOf(basicOutputId) !== -1);
	}

	$scope.isAutoBasicOutput = function(basicOutputId) {
		return ($scope.reportType == "rcfb" && $scope.isBasicOutput(basicOutputId)); 
	}

	$scope.landscapeName = "";
	$scope.landscapeSource = "";
	$scope.landToBOMap = [];

	// Don't load chart data and draw charts until table with ng-repeat is in the DOM
	angular.element(document).ready(function ()
	{
		
		// console.log($scope.layerNameArr);
		$scope.setTitle();
		$scope.compare_title = "";
		var sep = " : ";
		for (var landId in $scope.compareData) {
			$scope.compare_title += ($scope.compareData[landId] + sep);
			sep = "";
		}
		console.log($scope);
		$scope.drawHighCharts();
		// console.log($scope.compareData.landscapeNames);
		// console.log($scope.layerNameArr);
	});

	function setDisplayStyle(elementId, styleVal) {
		 var element = document.getElementById(elementId);
		 if (element && element.style) {
			 element.style.display = styleVal;
		 }
	 }

	// This function will be called after page is loaded to render the
	// pie chart, data table and column chart (and eventually image)
	$scope.drawHighCharts = function() {
	 console.log('Drawing High Charts');
	 	if ((!$scope.compareData) && ($scope.$resolve)) {
		 	$scope.compareData = $scope.$resolve.compareData;
	 	}
	 	// console.log($scope.compareData);
	 	if ($scope.reportType == "rclp") {
			$scope.layerNameArr = $scope.landscapeOnlyNameArr;
			$scope.attrIds = $scope.lcpAttrIds;
			$scope.colorPair = $scope.lcpColorPair;
		} else if ($scope.reportType == "rcfb") {
			$scope.layerNameArr = $scope.basicOutputNameArr;
			$scope.attrIds = $scope.basicOutputIds;
			$scope.colorPair = $scope.outputColorPair;
		}

	 	$scope.reportName = reportService.reportTypesAll[$scope.reportType];
	 	$scope.landscapeSource = $scope.compareData.landscapeSource;
	 	
	 	if (($scope.compareData == null) || (typeof($scope.compareData.landSummaryBOMap) == "undefined" )){
		 	console.log("Comparison Report Data invalid");
		 	$scope.queueMsg = "Comparison Report Data invalid";
		}else{
			var landscapeToSummaryMap = $scope.compareData.landSummaryBOMap;
			var diffSummaryMap = $scope.compareData.diffSummaryBOMap;
			var summaryDataForLandscapes = [];
			for (var i=0; i < $scope.compareData.summaryIdsByOrder.length; i++) {
				summaryDataForLandscapes.push(landscapeToSummaryMap[$scope.compareData.summaryIdsByOrder[i]]);
			}
			$scope.landName = [] ;
			for (var k=0; k < $scope.compareData.summaryIdsByOrder.length; k++) {
				$scope.landName.push($scope.compareData.landscapeNames[$scope.compareData.summaryIdsByOrder[k]]);
				$scope.landToBOMap.push($scope.compareData.landToBOMap[$scope.compareData.summaryIdsByOrder[k]]);
			}
		}
	 	
	 	var firstBO = $scope.compareData.landToBOMap[$scope.compareData.summaryIdsByOrder[0]];



	 	var shapeName = null;
	 	if (firstBO) {
	 		shapeName = firstBO.shapeName;
	 	}
	
		// For each layer that we have summary data for, show it on the page.
		//var name = $scope.layerNameArr['crn'];
		for ( var layer in $scope.layerNameArr) {
			var unitStr = summaryDataForLandscapes[0][layer].unit;
			if ((typeof(unitStr) == "undefined") || (unitStr == 'n/a')) {
				unitStr = "";
			} else {
			 	unitStr = " (" + summaryDataForLandscapes[0][layer].unit.trim() + ")";
		 	}
			var layerName = summaryDataForLandscapes[0][layer].layerName;
			var binValueToCounts = $scope.compareData.layerToNameToValues[layer];
			var orderedShortNameList = $scope.compareData.layerToOrderedBinShortname[layer];
			if ((orderedShortNameList.length < 2) && (orderedShortNameList[0] == null)) {
				orderedShortNameList = [];
				for ( var binName in binValueToCounts) {
					orderedShortNameList.push(binName);
				}	
			}
			var layerStr = replaceAll(layerName, "_", " ");
		 	var xAxisLabel = layerStr + unitStr;
		 	var chartObj = {
 				xAxisLabel : xAxisLabel,
 				layerName : layerName,
 				shapeName: shapeName,
 				unitStr : unitStr,
 				layer: layer,
 				layerType: layerStr +unitStr
 			}

		 	// Build Comparison Bar Chart
		 	var layerNameStr = replaceAll(chartObj.layerName, "_", " ");
		 	var landscapeName = replaceAll($scope.landscapeName,"-","");
 			// var title = landscapeName + "<br>" + layerNameStr + chartObj.unitStr;
 			var title = layerNameStr+ chartObj.unitStr+' Summary Compare';
			if (shapeName != null) {
 				title += ' for Area of Interest "' + shapeName + '"';
 			}
 			title += '<br> "'+ $scope.landName[0] + '"(1) vs "' +$scope.landName[1] + '"(2) Landscapes';
 			/*
				Onscreen chart title should include:
				Source Landscape Name:
				Source Landscape Acres:
				Area of Interest Name:
				Area of Interest ACres:
				Title Example: Canopy Cover Data Summary for Area of Interst {AOIname} within {Landscape Name}

				if $scope.showBasicOutput == true
				
				For Model Runs
				Source Landscape Name:
				Source Landscape Acres:
				Area of Interest Name:
				Area of Interest Acres:
				Model name: 
				Model Output Name:
				Title Example: {Flame Length} Data Summary for Area of Interest {AOI name} within {Landscape Name}
		  	*/

			var subTitleData = []; 
			var landscapeL = $scope.landName.length;
			for (var i = 0; i < landscapeL; i++) {
				var no = i+1;
				subTitleData[i] = 
	 				'Source Landscape Name: '+ $scope.landName[i] + '('+no+')' +
					'<br>Landfire Version: '+  $scope.landToBOMap[i].landscapeSource;
				if(typeof($scope.landToBOMap[i].acreage) != 'undefined'){
					subTitleData[i] += '<br>Source Landscape Acres: '+ $scope.landToBOMap[i].acreage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				} 
	 			if(typeof($scope.landToBOMap[i].shapeName) != 'undefined'){
	 				subTitleData[i] += '<br>' + 'Area of Interest Name: ' + $scope.landToBOMap[i].shapeName;
	 				if(typeof($scope.landToBOMap[i].aoiAcreage) != 'undefined'){
						subTitleData[i] += '<br>Area of Interest Acres: '+ $scope.landToBOMap[i].aoiAcreage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
					}
	 			}
	 			if($scope.showBasicOutput){
	 				// console.log($scope.landToBOMap[i].basicRunBO);
	 				subTitleData[i] += '<br>' + 'Model Name: ' +  $scope.landToBOMap[i].basicRunBO.runName;
	 			}
	 		};

 			// console.log(subTitleData);

 			$scope.drawComparisonBarChart(title,subTitleData,chartObj, binValueToCounts, orderedShortNameList);
			
			// Build data table
			var serviceSumData = diffSummaryMap[layer].compareDataTableEntries;
 		    $scope.drawComparisonDataTable(title,subTitleData,chartObj, serviceSumData);

 			// Build Pie charts
 			// console.log(summaryDataForLayer);
			for (var j=0; j < summaryDataForLandscapes.length; j++) {
				var no2 = j+1;
				var summaryDataForLayer = summaryDataForLandscapes[j];
				//Create Comparison Pie Charts For Layer
	 			var pieChartData = summaryDataForLayer[layer].pieChartEntries;
	 			var pieChartColors = summaryDataForLayer[layer].pieChartColors;
	 			// var name = $scope.landName[j] + "<br>" + layerNameStr + chartObj.unitStr;

	 			// var title = landscapeName + "<br>" + layerNameStr + chartObj.unitStr;
	 			var name = layerNameStr+ chartObj.unitStr+' Summary';
				if(typeof($scope.landToBOMap[j].shapeName) != 'undefined'){
	 				name += ' for Area of Interest "' + $scope.landToBOMap[j].shapeName + '"' +' within "'+$scope.landName[j]+'('+no2+')" Landscape';
	 			}

	 			// console.log(name);
	 			$scope.drawSummaryPieChart(name,subTitleData[j],chartObj, pieChartData,j);
			}

			// Build Difference Comparison Bar Charts
			var serviceSumData = diffSummaryMap[layer].barChartEntries;
			var title = layerNameStr+ chartObj.unitStr+' Percent Difference';
			if (shapeName != null) {
 				title += ' for Area of Interest "' + shapeName + '"';
 			}
 			title += '<br> "'+ $scope.landName[0] + '"(1) vs "' +$scope.landName[1] + '"(2) Landscapes';
			$scope.drawComparisonDifferenceBarChart(title,subTitleData,chartObj, serviceSumData, layerNameStr);
		}
		$('#loader').hide();
	}

	$scope.drawComparisonDifferenceBarChart = function(title,subTitleData,chartObj,chartData, layerNameStr){
  	 	// console.log(chartData.length);
  	 	// console.log(chartData);
		var dataLength = chartData.length;
		var xDataSeries = [];
		var xDataCatagories = [];
		var xDataColors = [];
		var chart_div = 'barchart_' + chartObj.layer;
		var landscapeInfo = $scope.landscapeName + " (" +  $scope.landscapeSource + ")";
		for (var i = 0; i < dataLength; i++) {
	 	 	xDataCatagories.push(chartData[i].xShortLabel);
	 	 	xDataSeries.push(chartData[i].percentage);
	  	} 
		// console.log(xDataCatagories);
		// console.log(xDataSeries);
	  	var options = {
		 	chart: {
			 	type: 'column',
		 		height: 500,
			 	events: {
		            load: function () {
		            	// console.log(this.renderer);
		            	var width = (this.renderer.width/2) ;
		            	//Footer
		            	var subtitleExt = 'Landscape 2 is always the landscape being compared against';
		            	subtitleExt += (chartObj.layer == 'fm')? '<br>Distribution under 1% not shown':'';
		                
		                this.footer = this.renderer.label(subtitleExt)
		                .css({
		                    fontSize: '11px',
		                })
		                .add();
		                 this.footer.align(Highcharts.extend( this.footer.getBBox(), {
		                    align: 'left',
		                    x: 0, // offset
		                    verticalAlign: 'bottom',
		                    y: 25 // offset
		                }), null, 'spacingBox');

		                //First Compare Subtitle
		                this.compareTitle1 = this.renderer.label(subTitleData[0])
		                .css({
		                    fontSize: '11px',
		                    width: width-10+'px',
		                })
		                .add();
		                this.compareTitle1.align(Highcharts.extend(this.compareTitle1.getBBox(), {
		                    align: 'middle',
		                    verticalAlign: 'Top',
		                    y:this.renderer.plotBox.y-100,
		                }), null, 'spacingBox');

		                //Second Compare Title
		                this.compareTitle2 = this.renderer.label(subTitleData[1])
		                .css({
		                    fontSize: '11px',
		                    width: width-10+'px',
		                })
		                .add();
		                this.compareTitle2.align(Highcharts.extend(this.compareTitle2.getBBox(), {
		                    align: 'middle',
		                    x: width, // offset
		                    verticalAlign: 'Top',
		                    y:this.renderer.plotBox.y-100,
		                }), null, 'spacingBox');
		            },
		            redraw: function () {
		            	// console.log( this.title);
		            	var width = (this.renderer.width/2) ;
		            	this.compareTitle1.align(Highcharts.extend(this.compareTitle1.getBBox(), {
		                    align: 'middle',
		                    verticalAlign: 'Top',
		                    y:this.renderer.plotBox.y-100,
		                }), null, 'spacingBox');


		            	this.compareTitle2.align(Highcharts.extend(this.compareTitle2.getBBox(), {
		                    align: 'middle',
		                    x: width, // offset
		                    verticalAlign: 'Top',
		                    y:this.renderer.plotBox.y-100,
		                }), null, 'spacingBox');
			      	}
		        },
		        spacingBottom: 25,
		 	},
		 	exporting:{
		 		chartOptions: {
	                title: {
	                    style: {
	                        fontSize: '14px'
	                    }
	                },
		            subtitle: {  
		            	style: {
						 	fontSize: '9px',
					 	},
					}
				},
		 	},
		 	legend: {
		        enabled: false
		    },
		 	title: {
				align: "left",
				text: title,
			 	style: {
					fontSize: '21px',
					fontWeight:'900',
			 	},
			 	margin: 100,
		 	},
		 	/*subtitle:{
			 	align: "left",
				text:  '<div style="width:50%; display:inline-block;">'+subTitleData[0]+'</div><div style="width:50%; display:inline-block;">'+subTitleData[1]+'</div>',
		 		style: {
				 	fontSize: '11px',
				 	fontWeight:'900',
			 	},
			 	useHTML: true,
		 	},*/
		 	tooltip: {
			 	headerFormat: '<span style="font-size:19px;color:black">{point.x}</span><br>',
			 	pointFormat: '<span style="color:black">Percentage</span>: <b>{point.y}%</b><br/>'
		 	},
		 	xAxis: {
			 	categories: xDataCatagories,
			 	title: {
				 	text: chartObj.xAxisLabel,
			 	},
		 	},
		 	yAxis: {
			 	title: {
					text: 'Percent Difference'
			 	},
			 	gridLineColor: 'black',
			 	gridLineWidth: .5
		 	},
	 	 	series: [
 		 		{
 		 			name:layerNameStr +' Percent Difference',
	 			 	data: xDataSeries,
	 			 	pointWidth: 18,
	                pointPadding: 0,
	                groupPadding: 0.6
	 		 	}
	 	 	],
		}
	  	if ($('#'+chart_div).length) {
	 	 	Highcharts.chart(chart_div, options );
	  	}else {
	 	 	console.log("Div element not found for '" + chart_div + "'");
	  	}
	}
	$scope.drawSummaryPieChart = function(title,subTitleData,chartObj,chartData,index) {
	 	// console.log(chartData);
		var dataLength = chartData.length;
		var layerStr = replaceAll(chartObj.layerName, "_", " ");
		var xDataSeries = [];
		var xDataColors = [];
		var chart_div = 'piechart_' + index + '_' + chartObj.layer;
		var landscapeInfo = $scope.landscapeName + " (" +  $scope.landscapeSource + ")";
		 for (var i = 0; i < dataLength; i++) {
		 	xDataSeries.push({
		 		name: chartData[i].xShortLabel,
		 		y:chartData[i].pixelCount
		 	});
		 	xDataColors.push(chartData[i].color);
		 }
		 // console.log(xDataSeries);
		 // console.log(xDataColors);
		 var options = {
		 	chart: {
		 		type:'pie',
		 		height: 500,
		 		events: {
		            load: function () {
		            	var subtitleExt = 'Landscape 2 is always the landscape being compared against';
		                var label = this.renderer.label(subtitleExt)
		                .css({
		                    fontSize: '11px'
		                })
		                .add();
		                label.align(Highcharts.extend(label.getBBox(), {
		                    align: 'left',
		                    x: 0, // offset
		                    verticalAlign: 'bottom',
		                    y: 0 // offset
		                }), null, 'spacingBox');
		                
		            }
		        },
		        marginBottom: 100
		 	},
		 	exporting:{
		 		allowHTML:true,
		 		chartOptions: {
	                title: {
	                    style: {
	                        fontSize: '14px'
	                    }
	                },
		            subtitle: {  
		            	style: {
						 	fontSize: '9px',
					 	},
					}
				}
		 	},
		 	legend:{
		 		y:-25,
		 	},
		 	title: {
		 		align: "left",
		 		text: title,
		 		style: {
		 			fontSize: '18px',
		 			fontWeight:'600',
		 		},
		 	},
		 	subtitle:{
		 		align: "left",
		 		text:  subTitleData,
		 		style: {
		 			fontSize: '11px',
		 			fontWeight:'900',
		 			fontStyle:'italics',
		 		},
		 	},
		 	tooltip: {
		 		headerFormat: '<span style="font-size:19px;color:black">{point.key}</span><br/>',
		 		// pointFormat: '<span style="color:black">Percentage</span>: <b>{point.y}%</b><br/>'
		 		pointFormat: 'Pixels:<b>{point.y}</b><br/>{series.name}: <b>{point.percentage:.0f}%</b>'
		 	},
		 	colors: xDataColors,
		 	plotOptions: {
				pie: {
					borderColor: 'black',
					borderWidth: .3,
			      	size: '80%',
				  	data: xDataSeries,
			   	}
		 	},
		 	series: [
				{
	                type: 'pie',
					name:'Percentage',
		 			showInLegend: true,
					dataLabels: {
						useHtml:true,
		 				formatter: function() {
		 					// return  this.percentage < 7 ? '' :  this.point.name + '<br/>' + Highcharts.numberFormat(this.percentage,1) + ' %';
		 					return  this.percentage < 7 ? '' :  Highcharts.numberFormat(this.percentage,0) + ' %';
		 				},
	 					distance: -30,
		 				color:'black',
					},
	            },
				/*
				//Labels
				{
	                type: 'pie',
					name:'Percentage',
		 			showInLegend: false,
					dataLabels: {
						useHtml:true,
                    	connectorColor: "black",
		 				formatter: function() {
		 					// return  this.percentage >= 7 ? null :  this.point.name + '<br/>' + Highcharts.numberFormat(this.percentage,1) + ' %';
		 					return  this.percentage >= 7 ? null :  Highcharts.numberFormat(this.percentage,1) + ' %';
		 				},
	 					distance: 20,
                        color:'black',
					},
	            },*/
		 	],
		 }
		 if ($('#'+chart_div).length) {
		 	Highcharts.chart(chart_div, options );
		 }else {
		 	console.log("Div element not found for '" + columnchart_div_name + "'");
		 }
	  }

	$scope.drawComparisonDataTable = function(title,subTitleData,chartObj,chartData) {
		var aoi = (chartObj.shapeName == null)?'':'/AOI';
		// console.log(chartData);
		var landscapeInfo = $scope.landscapeName + " (" +  $scope.landscapeSource + ")";
		$('#tablechartTitle_'+chartObj.layer).html(title);
		$('#tablechartSubTitle_'+chartObj.layer).html('<div class="col-xs-6">'+subTitleData[0]+'</div><div class="col-xs-6">'+subTitleData[1]+'</div>');
		var dataSet = [];
		var dataLength = chartData.length;
		var datatable_div = 'tablechart_' + chartObj.layer;
		for (var i = 0; i < dataLength; i++) {
			dataSet.push([
				chartData[i].xLabel,
				chartData[i].pixelCount1,
				chartData[i].pixelCount2,
				chartData[i].acres1,
				chartData[i].acres2,
				chartData[i].percentage1,
				chartData[i].percentage2,
			]);
		}
		// console.log(chartData);
		// console.log(dataSet)
		// console.log( $('#'+datatable_div));
		if ( $('#'+datatable_div).length) {
			$('#'+datatable_div).DataTable({
			   	data: dataSet,
        		deferRender: true,
        		order: [],
			   	columns: [
				   	{ title: chartObj.layerType, orderable: false},
				   	{ title: "Pixel Count "+$scope.landName[0]+'(1)'+aoi,render: $.fn.dataTable.render.number(',', '.')},
				   	{ title: "Pixel Count "+$scope.landName[1]+'(2)'+aoi,render: $.fn.dataTable.render.number(',', '.')},
				   	{ title: "Acres "+$scope.landName[0]+'(1)'+aoi,render: $.fn.dataTable.render.number(',', '.')},
				   	{ title: "Acres "+$scope.landName[1]+'(2)'+aoi,render: $.fn.dataTable.render.number(',', '.')},
				   	{ title: "Percent "+$scope.landName[0]+'(1)'+aoi},
				   	{ title: "Percent "+$scope.landName[1]+'(2)'+aoi},
			   	],
                dom: '<"row" <"col-xs-12"B>  <"col-xs-12"l> <"col-xs-12"r> <"col-xs-12"t><"col-xs-12"i> <"col-xs-12"p> >',
                drawCallback: function(settings) {
				    var pagination = $(this).closest('.dataTables_wrapper').find('.dataTables_paginate');
				    pagination.toggle(this.api().page.info().pages > 1);
			  	},
        		scrollX: true,
        		autoWidth: true,
				scrollCollapse: true,
				/*
				// Enable Scroll
				scrollY: "400px",
				scrollCollapse: true,
				paging: false,
				dom: 'Blrtip',
				*/
		        buttons: [
		            'copy',
					{
					   	extend: 'csv',
						filename:title,
				   	},
					{
					   	extend: 'excel',
						filename:title,
				   	},
					{
					   	extend: 'pdf',
						filename:title,
						title:title,
				   	},
					{
					   	extend: 'print',
						title:title,
				   	},
		        ]
			});
	    } else {
	    	console.log("Div element not found for 'tablechart" + layer + "'");
	    }
  	}

	$scope.drawComparisonBarChart = function(title,subTitleData,chartObj,chartData, orderedShortNameList){
  	 	// console.log(chartData.length);
  	 	// console.log(chartData);
		var dataLength = chartData.length;
		var xDataSeries = [];
		var xDataCatagories = [];
		var xDataColors = [];
		var landscapeInfo = [];
		var chart_div = 'columnchart_' + chartObj.layer;
		  
		for (var i = 0; i < orderedShortNameList.length; i++) {
			var data = chartData[orderedShortNameList[i]];
			if ((typeof(data) != "undefined") && ( data != null )) {
			    if (chartData.hasOwnProperty(orderedShortNameList[i])) {
		        	xDataCatagories.push(orderedShortNameList[i]);
		        	var length = chartData[orderedShortNameList[i]].length;
		        	for (var j = 0; j < length; j++) {
		        		var no = j+1
		        		if(typeof(xDataSeries[j]) == 'undefined'){
		        			xDataSeries.push(j);
		        			xDataSeries[j] = {
		        				name:$scope.landName[j]+'('+no+')',
		        				color:$scope.colorPair[j],
		        				data:[]
		        			};
		        		}
		        		xDataSeries[j].data.push(chartData[orderedShortNameList[i]][j]);
		        	};
		        }
			}
	    }

		// console.log(xDataCatagories);
		// console.log(xDataSeries);

	  	var options = {
		 	chart: {
			 	type: 'column',
        		height: 500,
			 	events: {
		            load: function () {
		            	// console.log(this.renderer);
		            	var width = (this.renderer.width/2) ;
		            	//Footer
		            	var subtitleExt = 'Landscape 2 is always the landscape being compared against';
		            	subtitleExt += (chartObj.layer == 'fm')? '<br>Distribution under 1% not shown':'';
		                
		                this.footer = this.renderer.label(subtitleExt)
		                .css({
		                    fontSize: '11px',
		                })
		                .add();
		                this.footer.align(Highcharts.extend( this.footer.getBBox(), {
		                    align: 'left',
		                    x: 0, // offset
		                    verticalAlign: 'bottom',
		                    y: 0 // offset
		                }), null, 'spacingBox');

		                // console.log(this.footer);

		                //First Compare Subtitle
		                this.compareTitle1 = this.renderer.label(subTitleData[0])
		                .css({
		                    fontSize: '11px',
		                    width: width-10+'px',
		                })
		                .add();
		                this.compareTitle1.align(Highcharts.extend(this.compareTitle1.getBBox(), {
		                    align: 'middle',
		                    verticalAlign: 'Top',
		                    y:this.renderer.plotBox.y-100,
		                }), null, 'spacingBox');

		                //Second Compare Title
		                this.compareTitle2 = this.renderer.label(subTitleData[1])
		                .css({
		                    fontSize: '11px',
		                    width: width-10+'px',
		                })
		                .add();
		                this.compareTitle2.align(Highcharts.extend(this.compareTitle2.getBBox(), {
		                    align: 'middle',
		                    x: width, // offset
		                    verticalAlign: 'Top',
		                    y:this.renderer.plotBox.y-100,
		                }), null, 'spacingBox');
		            },
		            redraw: function () {
		            	// console.log( this.title);
		            	var width = (this.renderer.width/2) ;
		            	this.compareTitle1.align(Highcharts.extend(this.compareTitle1.getBBox(), {
		                    align: 'middle',
		                    verticalAlign: 'Top',
		                    y:this.renderer.plotBox.y-100,
		                }), null, 'spacingBox');


		            	this.compareTitle2.align(Highcharts.extend(this.compareTitle2.getBBox(), {
		                    align: 'middle',
		                    x: width, // offset
		                    verticalAlign: 'Top',
		                    y:this.renderer.plotBox.y-100,
		                }), null, 'spacingBox');
			      	},
		        	spacingBottom: 100,
		        },
		 	},
		 	exporting:{
		 		// useHtml:true,
		 		chartOptions: {
	                title: {
	                    style: {
	                        fontSize: '14px'
	                    }
	                },
		            subtitle: {  
		            	style: {
						 	fontSize: '9px',
					 	},
					}
				}
		 	},
		 	legend:{
		 		y:-25,
		 	},
		 	title: {
				align: "left",
				text: title,
			 	style: {
					fontSize: '21px',
					fontWeight:'900',
			 	},
			 	margin: 100,
		 	},
		 	/*subtitle:{
			 	align: "left",
				// text:  landscapeInfo + subtitleExt ,
				// text:  '<div style="width:50%; display:inline-block;">'+subTitleData[0]+'</div><div style="width:50%; display:inline-block;">'+subTitleData[1]+'</div>',
		 		style: {
				 	fontSize: '11px',
				 	fontWeight:'900',
			 	},
			 	useHTML: true,
		 	},*/
		 	tooltip: {
			 	headerFormat: '<span style="font-size:19px;color:black">{point.x}</span><br>',
			 	pointFormat: '<span style="color:black">Percentage</span>: <b>{point.y}%</b><br/>'
		 	},
		 	xAxis: {
			 	categories: xDataCatagories,
			 	title: {
				 	text: chartObj.xAxisLabel,
			 	},
		 	},
		 	yAxis: {
			 	title: {
					text: 'Percent'
			 	},
			 	gridLineColor: 'black',
			 	//gridLineColor: '#197F07',
			 	gridLineWidth: 1.5
		 	},
		 	series:xDataSeries,
		}
	  	if ($('#'+chart_div).length) {
	 	 	Highcharts.chart(chart_div, options );
	  	}else {
	 	 	console.log("Div element not found for '" + chart_div + "'");
	  	}
	}

	function getImageData(svg) {
		var canvas = document.createElement('canvas');
		canvas.setAttribute('width', 600);
		canvas.setAttribute('height',500);
		canvg(canvas, svg);
		var imgData = canvas.toDataURL("image/png");
		return imgData;
	}
	function convertImgToDataURLviaCanvas(url, rowIndex, outputFormat) {
		  var img = new Image();
		  img.crossOrigin = 'Anonymous';
		  img.onload = function() {
		    var canvas = document.createElement('CANVAS');
		    var ctx = canvas.getContext('2d');
		    var dataURL;
		    canvas.height = this.height;
		    canvas.width = this.width;
		    ctx.drawImage(this, 0, 0);
		    dataURL = canvas.toDataURL(outputFormat);
			$scope.pdfPages.pending[rowIndex].data = dataURL;
		    canvas = null;
		  };
		  img.src = url;
	}

	function convertFileToDataURLviaFileReader(url,rowIndex) {
	  var xhr = new XMLHttpRequest();
	  xhr.onload = function() {
	    var reader = new FileReader();
	    reader.onloadend = function() {
			_processPdfPage(reader.result,rowIndex);
	    }
	    reader.readAsDataURL(xhr.response);
	  };
	  xhr.open('GET', url);
	  xhr.responseType = 'blob';
	  xhr.send();
	}

	function _addPdfPage(data){
		// Push new element into pdfPages Pending
		if(!$scope.pdfPages.hasOwnProperty("processed")){
			$scope.pdfPages.processed = [data];
			$rowIndex = 0;
		}else{
			var rowIndex = $scope.pdfPages.processed.push(data)-1;
		}
		return rowIndex;
	}

	function _processPdfPage(data,rowIndex){
		// console.log($scope.pdfPages.pending);
		// console.log('incoming index=> '+ rowIndex);
		//set Data Element
		$scope.pdfPages.processed[rowIndex].data = data;
		//Now remove element from pending array
		var index = $scope.pdfPages.pending.indexOf(rowIndex);
		// console.log('suggested removing index=> '+index);
		if (index > -1) {
			// console.log('removing index=> '+index);
		    $scope.pdfPages.pending.splice(index, 1);
		}
		// console.log($scope.pdfPages.pending);
		_printPage();
	}

	function _printPage(){
		// console.log($scope.pdfPages.pending.length);
		//See if this was the last element to be processed.
		if($scope.pdfPages.pending.length > 0){
			return false;
		}
		//https://github.com/MrRio/jsPDF/blob/176a605da06c7f18d9a00f3c60c897f1fa61c5e1/jspdf.js
		var doc = new jsPDF('p', 'pt', 'letter');
		doc.page = 1; // use this as a counter.

		//Set Line Counter
		var line = 150;
		//Start With Logo

		//jsPDFAPI.addImage = function(imageData, format, x, y, w, h, alias, compression, rotation) {
		var iftdssLogo = 'data:image/png;base64,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';
		doc.addImage(iftdssLogo, 'PNG', 165, line);

		//Move Line down 100pts
		line = line+100;

		//Set Bolder Font
		doc.setFontSize(20).setTextColor(40).setFontStyle('bold');

		//Add Title
		var title = ReportHelpers.strToNewLine(replaceAll($scope.landscapeName, "-", " "));
		var tL = title.length;
		for (var i = 0; i < tL; i++) {
			doc.myText(title[i],{align: "center"},0,line);
			line = line+25;
		};
		// doc.myText($scope.landscapeName +" Report",{align: "center"},0,line);
		
		//Add Title if title is set 
		var obj = $scope.compareData.landscapeNames
		if(typeof($scope.allLayerNameArr[$scope.layerNameFilter.layerId]) == 'undefined'){
			var title = $scope.landscapeName;
			line = line+25;
			//Add in Layer Names
			//counter
			var vs = 0;
			for (var key in obj) {
			    if (Object.prototype.hasOwnProperty.call(obj, key)) {

			        var layerTitle = ReportHelpers.strToNewLine(obj[key]);
			        var lT = layerTitle.length;
					for (var i = 0; i < lT; i++) {
						doc.myText(layerTitle[i],{align: "center"},0,line);
						line = line+25;
					};
					if(vs === 0){
						doc.myText('vs',{align: "center"},0,line);
					};
					line = line+25;
			        // console.log(val);
			        vs++;

			    }
			}
			line = line+20;

		}else{
			line = line+25;
			var title = $scope.landscapeName + ' ' +$scope.allLayerNameArr[$scope.layerNameFilter.layerId];
			//Add in Layer Names
			//counter
			var vs = 0;
			for (var key in obj) {
			    if (Object.prototype.hasOwnProperty.call(obj, key)) {

			        var layerTitle = ReportHelpers.strToNewLine(obj[key]);
			        var lT = layerTitle.length;
					for (var i = 0; i < lT; i++) {
						doc.myText(layerTitle[i],{align: "center"},0,line);
						line = line+25;
					};
					if(vs === 0){
						doc.myText('vs',{align: "center"},0,line);
					};
					line = line+25;
			        // console.log(val);
			        vs++;

			    }
			}
			doc.myText($scope.allLayerNameArr[$scope.layerNameFilter.layerId],{align: "center"},0,line);
			line = line+20;
		}

		//Add prepared "For" signature
		doc.setFontSize(10).setFontStyle('italic');
		doc.myText('Prepared for: '+$scope.loggedInName,{align: "center"},0,line);
		line = line+15;
		doc.myText(new Date(Date.now()).toLocaleString(),{align: "center"},0,line);
		doc.setFontStyle('normal');
		
		//Set footer Pages Counter;
		var pl = $scope.pdfPages.processed.length;
		var totalPages = pl+1;

		// console.log( $scope.pdfPages.processed);
		for (var i = 0; i < pl; i++) {
			var el = $scope.pdfPages.processed[i];
			// console.log(el);
			doc.page ++;
			doc.addPage();

			// SET HEADER
			if(typeof(el.sectionInfo.tableName) != 'undefined'){
				doc.setFontSize(20).setTextColor(40).setFontStyle('normal');
				doc.text(el.sectionInfo.tableName, 50, 40);
			}
			if(typeof(el.sectionInfo.landscapeName) != 'undefined'){
				doc.setFontSize(7);
				doc.text(el.sectionInfo.landscapeName, 50, 55);
			}
			// doc.setFontStyle('italic');
			// doc.text(el.sectionInfo.reportName, 50, 65);
			// doc.text('Distribution under 1% not shown', 50, 65);
			doc.setFontSize(20).setTextColor(40).setFontStyle('normal');

			// SET FOOTER
			var str = "Page " + doc.page  + " of " +  totalPages;
			doc.setFontSize(10);
			var bottom = doc.internal.pageSize.height - 10;
			var right = doc.internal.pageSize.width - 10;
			doc.text(str, 50, bottom);
			doc.addImage(iftdssLogo, 'PNG', right - 85, bottom -13, 60, 15);

			// ADD REPORT ELEMENT TO PAGE
			if(el.type == 'h'){
				//Process Html
        		doc.fromHTML(el.data, 50, 80);
				// console.log(el.type);
			}else if (el.type == 'i') {
				//JPEG for IFTDSS
				var margin = 50;
				var width = doc.internal.pageSize.width - (margin*2);
				doc.addImage(el.data, 'PNG', margin, 80,width,width);
				// doc.addImage(el.data, 'PNG', 50, 80, 500, 350);
				// console.log(el.type);
			}else if (el.type == 'c') {
				doc.addImage(el.data, 'PNG', 50, 80, 500, 417);
				// console.log(el.type);
			}else if (el.type == 'd') {
        		var resp = doc.fromHTML(el.data.html, 50, 80);
        		doc.autoTable(el.data.table.columns, el.data.table.rows,{
					theme: 'grid',
    				startY:resp.y,
					headerStyles: {
				        fillColor: [46, 62, 78],
				        textColor: [255, 255, 255],
				    },
			        styles: {
			        	overflow: 'linebreak', 
    					// columnWidth:50,
			        },
			        columnStyles: {
			         	0: {columnWidth: 100},
			     	}
				});
				// console.log(el.type);
			}else if (el.type == 't') {
				// Get Data
				// Table Data
				//https://github.com/simonbengtsson/jsPDF-AutoTable/blob/409ae6a0f6b21af849ff950e8404dc795c3153e1/README.md#options
				doc.autoTable(el.data.columns, el.data.rows,{
					theme: 'grid',
    				margin: {top: 80},
					headerStyles: {
				        fillColor: [46, 62, 78],
				        textColor: [255, 255, 255],
				    },
			        styles: {
			        	overflow: 'linebreak', 
			        },
				});
				// console.log(el.type);
				// console.log(el.data);
			}
		}
		// console.log('printing '+title+'.pdf');
		doc.save(title+'.pdf');
		$scope.pdfPages = {pending:[],processed:[]};
     	$('#loader').hide();
	}

	$scope.printPage =  function(){
		$('#loader').show({
			complete:function(){
				//Find all visible .summary-report-table
				$('.basic-meta-container:not(.ng-hide), .summary-report-table:not(.ng-hide)').each(function(i, o) {
				// $('.summary-report-table:not(.ng-hide)').each(function(i, o) {
					//Get Header Info for this Section
					var $headerContainer = $(this).siblings( ".header-group" );
					sectionInfo = {
						tableName : $headerContainer.find("[data-el='tableName']").data('val'),
						landscapeName : $headerContainer.find("[data-el='landscapeSource']").text(),
						reportName : $headerContainer.find("[data-el='compare_title']").data('val'),
					};
					//Set Process Pending List
					$(this).find('.stage-show:not(.ng-hide)').each(function(ii, oo) {
						//DataTables creates two Elements so make sure the element truly exists
						var idd = $(this).attr('id');
						if(typeof(idd) != 'undefined'){
							//Get Element type
							/*
							* h = Html
							* i = Image
							* c = Chart (High Charts)
							* t = Data Tables
							* d = Dyynamic Html + Tables
							*/
							var type = (idd == 'basicTableOutput' && $scope.showAutoBasicOutput) ? 'd' : $(this).attr('data-type');
							// var type = $(this).attr('data-type');
							var rowIndex = _addPdfPage({
								id: idd,
								type: type,
								data:null,
								sectionInfo:sectionInfo,
							});
							// console.log(rowIndex);
							if(!$scope.pdfPages.hasOwnProperty("pending")){
								$scope.pdfPages.pending = [rowIndex];
							}else{
								$scope.pdfPages.pending.push(rowIndex);
							}
						}
					});
				});

				//Process Pending List
				// console.log($scope.pdfPages.pending);
				// console.log($scope.pdfPages.processed);
				var processedLength = $scope.pdfPages.processed.length;
				// console.log(processedLength);
				for (var rowIndex = 0; rowIndex < processedLength; rowIndex++) {
					var obj = $scope.pdfPages.processed[rowIndex];
					// console.log(obj);
					// console.log(rowIndex);
					if(obj.type == 'h'){
						//Process Html
						var $clone = $('#'+obj.id).clone();
						if(obj.id == 'basicTableOutput'){
							$clone.find("#autoBasicOutput").remove();
    					}
						$clone = $clone.wrap('<div/>').parent().html();

						_processPdfPage($clone,rowIndex);
						// _processPdfPage($('#'+obj.id).clone().wrap('<div/>').parent().html(),rowIndex);
						// console.log(type);
					}else if (obj.type == 'd') {
						var $clone = $('#'+obj.id).clone();
						if(obj.id == 'basicTableOutput'){
							$clone.find("#autoBasicOutput").remove();
    					}

    					var $el = {
							html:  $clone.wrap('<div/>').parent().html(),
							table: undefined
						}

  						if($scope.showAutoBasicOutput){
							var rows = [];
    						var columns = [
						   		'Fuel \nModel',
						   		"1 Hr \nFuel Moisture", 
						   		"10 Hr \nFuel Moisture", 
						   		"100 Hr \nFuel Moisture", 
						   		"Live Herbaceous \nFuel Moisture",
						   		"Live Woody \nFuel Moisture",
						   	];
						   	var dataLength = $scope.compareData.basicRunBO.fuelMoistures.length;
							for (var i = 0; i < dataLength; i++) {
								rows.push([
									$scope.compareData.basicRunBO.fuelMoistures[i].modelCodeOrName,
									$scope.compareData.basicRunBO.fuelMoistures[i].fm1Hr,
									$scope.compareData.basicRunBO.fuelMoistures[i].fm10Hr,
									$scope.compareData.basicRunBO.fuelMoistures[i].fm100Hr,
									$scope.compareData.basicRunBO.fuelMoistures[i].fmLiveHerbaceous,
									$scope.compareData.basicRunBO.fuelMoistures[i].fmLiveWoody,
								]);
							}
							
							$el.table = {
								columns:columns,
								rows:rows,
							}
    					}
						_processPdfPage($el,rowIndex);
					}else if (obj.type == 'i') {
						//Get Base64 IMG
						var url = $('#'+obj.id).prop('src');
						console.log(url);
						//Use this image for dev purposes.
						// var url = 'https://lh4.ggpht.com/wKrDLLmmxjfRG2-E-k5L5BUuHWpCOe4lWRF7oVs1Gzdn5e5yvr8fj-ORTlBF43U47yI=w300';
						convertFileToDataURLviaFileReader(url,rowIndex);
					}else if (obj.type == 'c') {
						// Convert to Chart to SVG then Base 64
						var dataURI = getImageData($('#'+obj.id).highcharts().getSVG());
						_processPdfPage(dataURI,rowIndex);
					}else if (obj.type == 't') {
						// Get Data
						var layer = obj.id.split('_')[1];
						// Table Data
						var rows = [];
						var dataTable = $scope.compareData.diffSummaryBOMap[layer].compareDataTableEntries;
						var dataLength = dataTable.length;

						var aoi = ($scope.landToBOMap[0].shapeName == null)?'':'/AOI';
						
						var summaryDataForLandscapes = $scope.compareData.landSummaryBOMap[$scope.compareData.summaryIdsByOrder[0]];
						var unitStr = "";
					 	if (typeof(summaryDataForLandscapes[layer].unit) != 'undefined') {
						 	unitStr = " (" + summaryDataForLandscapes[layer].unit.trim() + ")";
					 	}
						var column1 = replaceAll(summaryDataForLandscapes[layer].layerName, "_", " ") + ' ' + unitStr ;
					   	var columns = [
					   		column1,
					   		"Pixel Count  "+$scope.landName[0]+'(1)'+aoi, 
					   		"Pixel Count(2) "+$scope.landName[1]+'(2)'+aoi, 
					   		"Acres "+$scope.landName[0]+'(1)'+aoi, 
					   		"Acres "+$scope.landName[1]+'(2)'+aoi,
					   		"Percent "+$scope.landName[0]+'(1)'+aoi,
					   		"Percent "+$scope.landName[1]+'(2)'+aoi
					   	];
						for (var i = 0; i < dataLength; i++) {
							// name:$scope.landName[i],
							rows.push([
								dataTable[i].xLabel,
								dataTable[i].pixelCount1,
								dataTable[i].pixelCount2,
								dataTable[i].acres1,
								dataTable[i].acres2,
								dataTable[i].percentage1,
								dataTable[i].percentage2,
							]);
						}
						_processPdfPage({
							columns:columns,
							rows:rows,
						},rowIndex);
					}
				};
			}
		});
	}

}
