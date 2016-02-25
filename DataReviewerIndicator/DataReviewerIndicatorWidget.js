/**
 * COPYRIGHT 2013 ESRI
 *
 * TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
 * Unpublished material - all rights reserved under the
 * Copyright Laws of the United States and applicable international
 * laws, treaties, and conventions.

 * For additional information, contact:
 * Environmental Systems Research Institute, Inc.
 * Attn: Contracts and Legal Services Department
 * 380 New York Street
 * Redlands, California, 92373
 * USA

 * email: contracts@esri.com
 */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "esri/opsdashboard/WidgetProxy",
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/DRSRequest",
  "esri/productiondashboard/PDChartEnum",
  "esri/productiondashboard/PDIndicatorChart",
  "dojo/domReady!"  
   
], function (declare, lang, _WidgetBase, _TemplatedMixin, WidgetProxy, PDInit, DRSRequest,PDChartEnum,pdChart) {

  return declare("DataReviewerIndicatorWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {      
    templateString: '<div data-dojo-attach-point="chartPreview" style="overflow:hidden;"></div>',
    margin : {top: 03, right: 02, bottom: 0, left: 02}, 
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
                    d.value = data.minCount.toFixed(2);
                    break;
                  }
                  case PDInit.CALCULATE_BY_MAX:{
                    d.value = data.maxCount.toFixed(2);
                    break;
                  }
                  case PDInit.CALCULATE_BY_AVERAGE:{
                    d.value = data.average.toFixed(2);
                    break;
                  }
                  case PDInit.CALCULATE_BY_SUM:{
                    d.value = data.sum.toFixed(2);
                    break;
                  }
                  case PDInit.CALCULATE_BY_UNKNOWN:{
                    d.value = data.sum.toFixed(2);
                    break;  
                  }
                  default:
                      d.value = data.sum.toFixed(2);
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