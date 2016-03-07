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
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/DRSRequest",
  "esri/productiondashboard/D3Charts/D3GaugeChart"
], function (declare, 
            lang, 
            _WidgetBase, 
            _TemplatedMixin,
             WidgetProxy,
             PDInit,
             DRSRequest,  
             pdChart
  ) {

  return declare("DataReviewerGaugeWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {    
    templateString: '<div data-dojo-attach-point="chartPreview" style="overflow:hidden;"></div>',
    margin : {top: 05, right: 05, bottom: 05, left: 05},  
    widgetConfig: null,
    data: null,
    drsRequest: null,
  

    postCreate: function () {              
      this.inherited(arguments); 
      this.chart = new pdChart().placeAt(this.chartPreview);        
    },
    
    visualizeIt:function (){                  
     this.chart.donut_factor = this.widgetConfig.chartConfig.donut_factor;
     this.chart.data = this.data; 
     this.chart.calculateValueMethod = this.widgetConfig.chartConfig.calculateValueMethod;
     this.chart.symbolStyle = this.widgetConfig.chartConfig.style;
     this.chart.showLabels = this.widgetConfig.chartConfig.showLabels;
     this.chart.minValue = Number(this.widgetConfig.chartConfig.minValue);
     this.chart.maxValue = Number(this.widgetConfig.chartConfig.maxValue);
     this.chart.threshold = Number(this.widgetConfig.chartConfig.threshold);
     this.chart.minAngle = Number(this.widgetConfig.chartConfig.minAngle);
     this.chart.maxAngle = Number(this.widgetConfig.chartConfig.maxAngle);
     this.chart.startColor = this.widgetConfig.chartConfig.from_color;    
     this.chart.showThreshold = this.widgetConfig.chartConfig.showThreshold;
     this.chart.thresholdColor = this.widgetConfig.chartConfig.thresholdColor;  
     this.chart.selectOnMap = this.widgetConfig.addMapIntegration;
     
      //render chart      
      this.chart.showChart();
    },

    processValue: function (data){
      var value = 0;
      if (data == undefined) return value;
      try {        
        switch (this.widgetConfig.method){
          case PDInit.CALCULATE_BY_SUM: {
            value = data.sum;
            break; 
          }
          case PDInit.CALCULATE_BY_AVERAGE:{
            value = data.average;
            break;
          }
          case PDInit.CALCULATE_BY_MAX:{
            value = data.maxCount;
            break;
          }
          case PDInit.CALCULATE_BY_MIN:{
            value = data.minCount;
            break;
          }
        }  
      }
      catch (err) {
        console.log(err);
        value = 0;
      }  
      return value;
    },

    dataSourceExpired: function (dataSourceProxy, dataSourceConfig) {     
      if (!dataSourceConfig)
           return;
      this.widgetConfig = dataSourceConfig.widgetConfig;      
      this.drsRequest = new DRSRequest({url:this.widgetConfig.drsUrl, context:this});         
      var self = lang.hitch(this);
      this.drsRequest.getDashboardResults(
            this.widgetConfig.drsVariableValue.fieldname,
            lang.hitch(this,function(data){              
              //data = data.splice(1);
              self.data = [];
              self.data.push({d: self.processValue(data)})
              this.visualizeIt();
            }),
            function (error){
               console.log(error.error.message); 
             },
             this.widgetConfig.drsFilters);
    }  
  });
});