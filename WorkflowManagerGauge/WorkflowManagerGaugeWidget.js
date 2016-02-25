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
  "esri/productiondashboard/WMXEnum",
  "esri/productiondashboard/WMXRequest",
  "esri/productiondashboard/WMXChartDatasource",
  "esri/productiondashboard/PDChartEnum",
  "esri/productiondashboard/PDGaugeChart",
  "dojo/domReady!"  
], function (declare, lang, _WidgetBase, _TemplatedMixin,  WidgetProxy, WMXEnum, WMXRequest, WMXChartDS, PDChartEnum, pdChart) {

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