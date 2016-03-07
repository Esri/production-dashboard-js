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
  "esri/productiondashboard/D3Charts/D3PieChart"
], function (declare, 
            lang, 
            _WidgetBase, 
            _TemplatedMixin,
             WidgetProxy,
             DRSRequest,  
             pdChart
  ) {

  return declare("DataReviewerPieWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {    
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
      if (this.data.length == 0) {
            alert('empty dataset!');
            return;
      }          
      this.chart.data = this.data;       
      this.chart.margin = this.margin;      
      this.chart.donut_factor = this.widgetConfig.chartConfig.donut_factor;
      this.chart.showLabelTotal = this.widgetConfig.chartConfig.showLabelTotal;
      this.chart.placeWedgeLabel = this.widgetConfig.chartConfig.placeWedgeLabel;
      this.chart.labelContent = this.widgetConfig.chartConfig.labelContent;
      this.chart.selectOnMap = this.widgetConfig.addMapIntegration;
      this.chart.showChart(this.chartData);     
    },
    
    dataSourceExpired: function (dataSourceProxy, dataSourceConfig) {     
      if (!dataSourceConfig)
           return;
      this.widgetConfig = dataSourceConfig.widgetConfig;      
      this.drsRequest = new DRSRequest({url:this.widgetConfig.drsUrl, context:this});         
      this.drsRequest.getDashboardResults(
            this.widgetConfig.drsVariableValue.fieldname,
            lang.hitch(this,function(data){
              this.data = data.data.map(function(d){
                return {d: d.count, value: d.variable + ' ' + d.count, id:d.id};
              });
              this.data = this.data.splice(1);
              this.visualizeIt();
            }),
            function (error){
               console.log(error.error.message); 
             },
             this.widgetConfig.drsFilters);
    }  
  });
});