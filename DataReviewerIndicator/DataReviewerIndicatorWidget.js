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
  "esri/productiondashboard/D3Charts/D3IndicatorChart",
  "dojo/domReady!"  
   
], function (declare, lang, _WidgetBase, _TemplatedMixin, WidgetProxy, PDInit, DRSRequest,pdChart) {

  return declare("DataReviewerIndicatorWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {      
    templateString: '<div data-dojo-attach-point="chartPreview"></div>',
    margin : {top: 0, right: 0, bottom: 05, left: 0}, 
    drsRequest: null,
    widgetConfig: null,
    data: null,
    yellow: 'Yellow',
    red: 'Red' ,
    green:'Green',    

    postCreate: function () { 
      this.inherited(arguments);              
      this.chart = new pdChart().placeAt(this.chartPreview);
    },
    
    visualizeIt:function (){         
      var self = lang.hitch(this);
       this.chart.margin = this.margin;
       this.chart.fill_color = this.data[0].symbolColor;
       this.chart.symbolStyle = this.data[0].symboleStyle;
       this.chart.indicator = this.data[0].value;
       this.chart.showChart();
    },
    
    dataSourceExpired: function (dataSourceProxy, dataSourceConfig) {     
      if (!dataSourceConfig) return;
      var self = lang.hitch(this);   
      this.dataSourceConfig = dataSourceConfig;
      this.dataSource = dataSourceProxy;      
      this.widgetConfig = this.dataSourceConfig.widgetConfig;

      // instantiate a drsRequest
      this.drsRequest = new DRSRequest({url:this.widgetConfig.drsUrl, context:this});
      this.drsRequest.getDashboardResults(
             this.widgetConfig.drsVariableValue.fieldname,
             lang.hitch(this,function(data){
                if (data.data.length == 0) {
                    alert('empty dataset!');
                    return;
                }  
                var d = {};
                switch(this.widgetConfig.operation){
                  case PDInit.CALCULATE_BY_MIN :{
                    d.value = Number(data.minCount.toFixed(2));
                    break;
                  }
                  case PDInit.CALCULATE_BY_MAX:{
                    d.value = Number(data.maxCount.toFixed(2));
                    break;
                  }
                  case PDInit.CALCULATE_BY_AVERAGE:{
                    d.value = Number(data.average.toFixed(2));
                    break;
                  }
                  case PDInit.CALCULATE_BY_SUM:{
                    d.value = Number(data.sum.toFixed(2));
                    break;
                  }
                  case PDInit.CALCULATE_BY_UNKNOWN:{
                    d.value = Number(data.sum.toFixed(2));
                    break;  
                  }
                  default:
                      d.value = Number(data.sum.toFixed(2));
                }
                d.type = this.widgetConfig.indicatorType 
                switch (d.type){
                  case "twostates": {
                    switch (this.widgetConfig.comparisonType){
                      case "equal":{
                        if (d.value == this.widgetConfig.highTargetValue){
                          d.symboleStyle = this.widgetConfig.aboveValuesSymbol;
                          d.symbolColor = this.widgetConfig.aboveValuesColor;
                        } else {
                          d.symboleStyle = this.widgetConfig.belowValuesSymbol;
                          d.symbolColor = this.widgetConfig.belowValuesColor;
                        }
                        break;
                      }
                      case "notequal":{
                        if (d.value != this.widgetConfig.highTargetValue){
                          d.symboleStyle = this.widgetConfig.aboveValuesSymbol;
                          d.symbolColor = this.widgetConfig.aboveValuesColor;
                        } else {
                          d.symboleStyle = this.widgetConfig.belowValuesSymbol;
                          d.symbolColor = this.widgetConfig.belowValuesColor;
                        }
                        break;
                      }
                      case "greaterthan":{
                        if (d.value > this.widgetConfig.highTargetValue){
                          d.symboleStyle = this.widgetConfig.aboveValuesSymbol;
                          d.symbolColor = this.widgetConfig.aboveValuesColor;
                        } else {
                          d.symboleStyle = this.widgetConfig.belowValuesSymbol;
                          d.symbolColor = this.widgetConfig.belowValuesColor;
                        }
                        break;
                      }
                      case "greaterthanorequal":{
                        if (d.value >= this.widgetConfig.highTargetValue){
                          d.symboleStyle = this.widgetConfig.aboveValuesSymbol;
                          d.symbolColor = this.widgetConfig.aboveValuesColor;
                        } else {
                          d.symboleStyle = this.widgetConfig.belowValuesSymbol;
                          d.symbolColor = this.widgetConfig.belowValuesColor;
                        }
                        break;
                      }
                      case "lessthan" : {
                        if (d.value < this.widgetConfig.highTargetValue){
                          d.symboleStyle = this.widgetConfig.aboveValuesSymbol;
                          d.symbolColor = this.widgetConfig.aboveValuesColor;
                        } else {
                          d.symboleStyle = this.widgetConfig.belowValuesSymbol;
                          d.symbolColor = this.widgetConfig.belowValuesColor;
                        }
                        break;
                      }
                      case "lessthanorequal" : {
                        if (d.value <= this.widgetConfig.highTargetValue){
                          d.symboleStyle = this.widgetConfig.aboveValuesSymbol;
                          d.symbolColor = this.widgetConfig.aboveValuesColor;
                        } else {
                          d.symboleStyle = this.widgetConfig.belowValuesSymbol;
                          d.symbolColor = this.widgetConfig.belowValuesColor;
                        }
                        break;
                      }
                    }
                    break;
                  }
                  case "threestates": {
                    if (d.value < this.widgetConfig.lowTargetValue){
                          d.symboleStyle = this.widgetConfig.belowValuesSymbol;
                          d.symbolColor = this.widgetConfig.belowValuesColor;
                        } else if (d.value > this.widgetConfig.highTargetValue){
                          d.symboleStyle = this.widgetConfig.aboveValuesSymbol;
                          d.symbolColor = this.widgetConfig.aboveValuesColor;
                        } else {
                          d.symboleStyle = this.widgetConfig.betweenValuesSymbol;
                          d.symbolColor = this.widgetConfig.betweenValuesColor;
                        }
                    break;
                  }
                }
                self.data = [];
                self.data.push(d);              
                self.visualizeIt();                                           
             }), 
             function (error){
               console.log(error.error.message); 
             },
             this.widgetConfig.drsFilters);
    }
  });
});