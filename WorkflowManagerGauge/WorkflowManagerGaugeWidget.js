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
  "esri/productiondashboard/WMXEnum",
  "esri/productiondashboard/WMXRequest",
  "esri/productiondashboard/WMXChartDatasource",
  "esri/productiondashboard/D3Charts/D3GaugeChart",
  "dojo/domReady!"  
], function (declare, lang, _WidgetBase, _TemplatedMixin,  WidgetProxy, WMXEnum, WMXRequest, WMXChartDS,  pdChart) {

  return declare("WorkflowManagerGaugeWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {    
    templateString: '<div data-dojo-attach-point="chartPreview" style="overflow:hidden;"></div>',    
    wmxRequest: null,
    wmxChartDS: null,
    widgetConfig: null,
    data: null,
    wmxDatasource: null,
    datasource: null,


    postCreate: function () {   
      this.inherited(arguments); 
      this.chart = new pdChart().placeAt(this.chartPreview);  
    },
    
    visualizeIt: function(){          
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
      this.chart.onChartClick = lang.hitch(this, function(d,i){
        var value = Number(d.tick);
        var dsIds = []
        this.wmxDatasource.forEach(lang.hitch(this, function(d){
           var dValue = (this.widgetConfig.addDataGroupping)? this.processValue(d): d.values[0];
           if (dValue == value){
              for(var i=0;i<d.datasourceId.length;i++){
                  dsIds.push(d.datasourceId[i])
              }
           }
        }));
        if (dsIds.length > 0){
          this.selectFeaturesOnMap(dsIds);
        }
      });
      //render chart      
      this.chart.showChart();
    },

    dataSourceExpired: function (dataSourceProxy, dataSourceConfig) {
      if (!dataSourceConfig)
           return;
      this.datasource =  dataSourceProxy;
      this.widgetConfig = dataSourceConfig.widgetConfig;
      this.wmxRequest = new WMXRequest({url:this.widgetConfig.wmxUrl});
      var self = lang.hitch(this);
      if (!this.widgetConfig.addDataGroupping && !this.widgetConfig.addMapIntegration){
           this.wmxRequest.runQuery(this.widgetConfig.queryId,
                this.widgetConfig.userName,
                function(data){
                  self.wmxDatasource = data;
                  var valueField = self.widgetConfig.valueField
                  var wmxDatasource = new WMXChartDS({datasource: data});  
                  var values = wmxDatasource.getFieldValues(valueField);
                  self.data = [];
                  self.data.push({d: self.processValue(values)})
                  self.visualizeIt();
                },
                function(error){
                  console.log(error);
                }
            );
      } 
    },
     
    processValue: function (data){
      var value = 0;
      if (data == undefined) return value;
      try {
        var sum = data.reduce(function(sum, a){return sum + a;},0);
        var count = data.length;
        switch (this.widgetConfig.method){
          case 'sum': {
            value = sum;
            break; 
          }
          case 'average':{
            value = Math.round(sum /count);
            break;
          }
          case 'count':{
            value = count;
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

    selectFeaturesOnMap: function(datasourceIds){     
      if (datasourceIds == undefined) return;
      if (lang.isArray(datasourceIds)) {
          this.datasource.clearSelection();                  
          this.datasource.selectFeaturesByObjectIds(datasourceIds);
      }
    }
  });
});