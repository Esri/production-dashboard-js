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
  "esri/productiondashboard/D3Charts/D3TrendChart",
  "dojo/domReady!"  
], function (declare, lang, _WidgetBase, _TemplatedMixin,  WidgetProxy, WMXEnum, WMXRequest, WMXChartDS, pdChart) {

  return declare("WorkflowManagerTrendWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {        
    templateString: '<div data-dojo-attach-point="chartPreview"></div>',
    margin : {top: 10, right: 10, bottom: 10, left: 10},   
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
                return {
                       d:d.getDOIDValue(self.widgetConfig.groupByField.type,self.widgetConfig.idGroupBy),
                       value:d.getDOValue(self.widgetConfig.method)
                     };       
            });
      if (this.widgetConfig.groupByField.type == WMXEnum.DATE_DATATYPE){
          this.chart.dateInterval = this.widgetConfig.idGroupBy;
          this.chart.dataType = 'date';
          switch (this.chart.dateInterval){
            case 'date':{
              this.chart.dateFormat = '%Y/%m/%d'
              break;
            }
            case 'month':{
              this.chart.dateFormat = '%Y/%m'
              break;
            }
            case 'year':{
              this.chart.dateFormat = '%Y'
              break;
            }
          }
      } else {
        this.chart.dataType = 'number';
      }     
      //this.chart.margin = this.margin
      this.chart.showHorizontalGridLines = this.widgetConfig.chartConfig.showHorizontalGridLines;
      this.chart.showHorizontalAxis = this.widgetConfig.chartConfig.show_horizontal_axis;
      this.chart.ticksOrientation = this.widgetConfig.chartConfig.horizontal_ticks_orientation;
      this.chart.wrapHAxisText = this.widgetConfig.chartConfig.wrapHAxisText;
      this.chart.showVerticalAxis = this.widgetConfig.chartConfig.show_vertical_axis;    
      this.chart.startColor = this.widgetConfig.chartConfig.from_color;
      this.chart.selectOnMap = this.widgetConfig.chartConfig.select_on_map;
      this.chart.onChartClick = lang.hitch(this, function(d,i){      
        this.selectFeaturesOnMap(this.data[i].datasourceId);                
      });
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