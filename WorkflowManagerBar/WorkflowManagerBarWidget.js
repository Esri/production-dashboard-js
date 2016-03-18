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
  "esri/productiondashboard/D3Charts/D3BarChart",
  "dojo/domReady!"  
], function (declare, lang, _WidgetBase, _TemplatedMixin,  WidgetProxy, WMXEnum, WMXRequest, WMXChartDS, pdChart) {

  return declare("WorkflowManagerBarWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {        
    templateString: '<div data-dojo-attach-point="chartPreview"></div>',
    margin : {top: 10, right: 10, bottom: 05, left: 0},   
    wmxRequest: null,
    wmxChartDS: null,
    widgetConfig: null,
    data: null,
    datasource: null,


    postCreate: function () {   
      this.inherited(arguments); 
      this.chart = new pdChart().placeAt(this.chartPreview);          
    },
    

    visualizeIt: function(){

      var self = lang.hitch(this);
      
      this.chartData = this.data.map(function(d){
       switch (self.widgetConfig.chartConfig.type){
        case 'barChart':
            return {
                   d:d.getDOIDValue(self.widgetConfig.groupByField.type,self.widgetConfig.idGroupBy),
                   value:d.getDOValue(self.widgetConfig.method)
                 };       
       }
      });
      
      this.chart.margin = this.margin
      this.chart.showHorizontalGridLines = this.widgetConfig.chartConfig.showHorizontalGridLines;
      this.chart.showHorizontalAxis = this.widgetConfig.chartConfig.show_horizontal_axis;
      this.chart.ticksOrientation = this.widgetConfig.chartConfig.horizontal_ticks_orientation;
      this.chart.wrapHAxisText = this.widgetConfig.chartConfig.wrapHAxisText;
      this.chart.showVerticalAxis = this.widgetConfig.chartConfig.show_vertical_axis;
      this.chart.endColor = this.widgetConfig.chartConfig.to_color;
      this.chart.startColor = this.widgetConfig.chartConfig.from_color;
      this.chart.selectOnMap = this.widgetConfig.chartConfig.select_on_map;
      this.chart.onChartClick = lang.hitch(this, function(d,i){      
        this.selectFeaturesOnMap(this.data[i].datasourceId);                
      });
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
      
      this.wmxRequest = new WMXRequest({url:this.widgetConfig.wmxUrl});
      
      this.wmxChartDS = new WMXChartDS({
                       wmxRequest: this.wmxRequest, 
                       queryId: this.widgetConfig.queryId, 
                       userName:this.widgetConfig.userName,
                       valueField: this.widgetConfig.valueField,
                       idField: this.widgetConfig.groupByField,
                       groupValueField: this.widgetConfig.groupValueField,
                       datasourceIdField: this.widgetConfig.datasourceId,
                       vGroupBy: this.widgetConfig.vGroupBy,
                       idGroupBy: this.widgetConfig.idGroupBy,
                       method: this.widgetConfig.method 
       });

       // listen to dataIsReady event
       this.wmxChartDS.on("dataIsReady", function(event){
        self.data = event.data;
        self.visualizeIt();
       });
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