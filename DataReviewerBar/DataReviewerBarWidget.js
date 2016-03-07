/* 
2  * Copyright 2016 Esri 
3  * 
4  * Licensed under the Apache License, Version 2.0 (the "License"); 
5  * you may not use this file except in compliance with the License. 
6  * You may obtain a copy of the License at 
7  *   http://www.apache.org/licenses/LICENSE-2.0 
8  
9  * Unless required by applicable law or agreed to in writing, software 
10  * distributed under the License is distributed on an "AS IS" BASIS, 
11  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
12  * See the License for the specific language governing permissions and 
13  * limitations under the License. 
14  */


 define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",  
  "esri/opsdashboard/WidgetProxy",
  "esri/productiondashboard/DRSRequest",
  "esri/productiondashboard/D3Charts/D3BarChart",
  "dojo/domReady!"  
 ],
 function (declare, lang, _WidgetBase, _TemplatedMixin, WidgetProxy, DRSRequest, pdChart ){
 	return declare("DataReviewerBarWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {
 		templateString: '<div data-dojo-attach-point="chartPreview" style="overflow:hidden;"></div>',
    	margin : {top: 05, right: 05, bottom: 05, left: 05},   
    	drsRequest: null,
    	widgetConfig: null,
    	data: null,
    	chartData: null,

      
    	postCreate: function(){    		
    		this.inherited(arguments); 
    		this.chart = new pdChart().placeAt(this.chartPreview);                      
    	},

        visualizeIt: function(){
          if (this.data.length == 0) {
            alert('empty dataset!');
            return;
          }
      	  this.chartData = this.data.map(function(d){
          	return {
          		d: d.item,
          		value: d.count
          	}
          });
          this.chartData = this.chartData.slice(1);
          this.chartData.sort(function(a,b){
          	var v1,v2;  
          	v1 = (isNaN(a.value))? a.value.toLowerCase(): a.value;
          	v2 = (isNaN(b.value))? b.value.toLowerCase(): b.value;
          	if (v1 < v2) return -1  //sort string ascending 
              if (v1 > v2) return 1
              return 0 //default return value (no sorting)
          });

          this.chart.margin = this.margin;
          this.chart.showHorizontalGridLines = this.widgetConfig.chartConfig.showHorizontalGridLines;
          this.chart.showHorizontalAxis = this.widgetConfig.chartConfig.show_horizontal_axis;
          this.chart.ticksOrientation = this.widgetConfig.chartConfig.horizontal_ticks_orientation;
          this.chart.wrapHAxisText = this.widgetConfig.chartConfig.wrapHAxisText;
          this.chart.showVerticalAxis = this.widgetConfig.chartConfig.show_vertical_axis;
          this.chart.endColor = this.widgetConfig.chartConfig.to_color;
          this.chart.startColor = this.widgetConfig.chartConfig.from_color;
          this.chart.selectOnMap = this.widgetConfig.chartConfig.select_on_map;
          this.chart.useColorRamp =  this.widgetConfig.chartConfig.useColorRamp;
          this.chart.colorRamp = this.widgetConfig.chartConfig.colorRamp,
          this.chart.data = this.chartData;
          this.chart.showChart();     
        },


    	dataSourceExpired: function (dataSourceProxy, dataSourceConfig) {    	 
      		if (!dataSourceConfig)
        		return;
        	 this.datasource =  dataSourceProxy;
        	 var self = lang.hitch(this);  
        	 this.dataSourceConfig = dataSourceConfig;
        	 this.widgetConfig = this.dataSourceConfig.widgetConfig;

        	 // instantiate a drsRequest
        	this.data = [];
      		this.drsRequest = new DRSRequest({url:this.widgetConfig.drsUrl, context:this});
        	this.drsRequest.getDashboardResults(
        		this.widgetConfig.drsVariableValue.fieldname,
        		function(data){
        			self.data = data.data;
        			self.visualizeIt();
        		},
        		function(error){
        			 console.log(error.error.message);
        		},
        		this.widgetConfig.drsFilters
        	);
    	}

 	});
 });