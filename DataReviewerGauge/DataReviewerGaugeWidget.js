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
  "esri/productiondashboard/PDGaugeChart"
], function (declare, 
            lang, 
            _WidgetBase, 
            _TemplatedMixin,
             WidgetProxy,
             PDInit,
             DRSRequest,
             PDChartEnum,
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