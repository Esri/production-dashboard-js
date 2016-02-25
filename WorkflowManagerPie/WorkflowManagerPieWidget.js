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
  "esri/productiondashboard/PDPieChart",
  "dojo/domReady!"  
], function (declare, lang, _WidgetBase, _TemplatedMixin,  WidgetProxy, WMXEnum, WMXRequest, WMXChartDS, PDChartEnum, pdChart) {

  return declare("WorkflowManagerBarWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {      
    templateString: '<div  data-dojo-attach-point="chartPreview"  style="overflow:hidden;"></div>',
    margin : {top: 05, right: 05, bottom: 05, left: 05},   
    wmxRequest: null,
    wmxChartDS: null,
    widgetConfig: null,
    data: null,
    datasource: null,
    wmxDatasource : null,


    postCreate: function () {   
      this.inherited(arguments); 
      this.chart = new pdChart().placeAt(this.chartPreview);     
    },
    

    visualizeIt: function(){

      var self = lang.hitch(this);
      this.chart.data = this.data; 
      this.chart.margin = this.margin,
      this.chart.svgType = PDChartEnum.PIE_CHART;
      this.chart.donut_factor = this.widgetConfig.chartConfig.donut_factor;
      this.chart.showLabelTotal = this.widgetConfig.chartConfig.showLabelTotal;
      this.chart.placeWedgeLabel = this.widgetConfig.chartConfig.placeWedgeLabel;
      this.chart.labelContent = this.widgetConfig.chartConfig.labelContent;
      this.chart.selectOnMap = this.widgetConfig.addMapIntegration;
      this.chart.onChartClick = lang.hitch(this, function(d,i){
          this.selectFeaturesOnMap(d.data.dsId);
      });      
      this.chart.showChart();   
    },

    dataSourceExpired: function (dataSourceProxy, dataSourceConfig) {
     if (!dataSourceConfig)
           return;
     this.datasource =  dataSourceProxy;
      var self = lang.hitch(this);   
      this.dataSourceConfig = dataSourceConfig;
      this.widgetConfig = dataSourceConfig.widgetConfig;
      
      this.wmxRequest = new WMXRequest({url:this.widgetConfig.wmxUrl});
      
       if (!this.widgetConfig.addDataGroupping && !this.widgetConfig.addMapIntegration){
           this.wmxRequest.runQuery(this.widgetConfig.queryId,
                this.widgetConfig.userName,
                function(data){
                  self.wmxDatasource = data;
                  var valueField = self.widgetConfig.valueField
                  var wmxDatasource = new WMXChartDS({datasource: data});  
                  var values = wmxDatasource.getFieldValues(valueField);
                  self.data = values.map(function(d){
                     return {d:d, value:d};
                  });
                  self.visualizeIt();
                },
                function(error){
                  console.log(error);
                }
            );
       } else if (!this.widgetConfig.addDataGroupping && this.widgetConfig.addMapIntegration) {
          var wmxDatasource = new WMXChartDS({
                  wmxRequest: this.wmxRequest,
                  userName: this.widgetConfig.userName,
                  queryId: this.widgetConfig.queryId,
                  valueField: this.widgetConfig.valueField,
                  idField: this.widgetConfig.datasourceId,
                  datasourceIdField:this.widgetConfig.datasourceId,
                  groupValueField: false
                });
           wmxDatasource.on("dataIsReady", function(event){        
                self.wmxDatasource = event.data;
                self.data = event.data.map(function(d){
                   return {d:d.values[0], value:d.values[0], dsId: d.datasourceId};  
                });
                self.visualizeIt();
           });  
       } else if (this.widgetConfig.addDataGroupping && !this.widgetConfig.addMapIntegration){
           var wmxDatasource = new WMXChartDS({
                  wmxRequest: this.wmxRequest,
                  userName: this.widgetConfig.userName,
                  queryId: this.widgetConfig.queryId,
                  valueField: this.widgetConfig.valueField,
                  idField: this.widgetConfig.groupByField,
                  idGroupBy: this.widgetConfig.idGroupBy,
                  datasourceIdField:this.widgetConfig.groupByField,
                  groupValueField: true,
                  method: this.widgetConfig.method 
            });
            wmxDatasource.on("dataIsReady", function(event){
                self.wmxDatasource = event.data;

                self.data = event.data.map(lang.hitch(self,function(d){
                  var processedValue = self.processValue(d)
                  var ret =  {d:processedValue , value:d.id + ' ' + processedValue} 
                  return ret;
                })); 
             
                self.visualizeIt();
             });  

       } else if (this.widgetConfig.addDataGroupping && this.widgetConfig.addMapIntegration){
          var wmxDatasource = new WMXChartDS({
                  wmxRequest: this.wmxRequest,
                  userName: this.widgetConfig.userName,
                  queryId: this.widgetConfig.queryId,
                  valueField: this.widgetConfig.valueField,
                  idField: this.widgetConfig.groupByField,
                  idGroupBy: this.widgetConfig.idGroupBy,
                  datasourceIdField:this.widgetConfig.datasourceId,
                  groupValueField: true,
                  method: this.widgetConfig.method 
            });
            wmxDatasource.on("dataIsReady", function(event){
                self.wmxDatasource = event.data;

                self.data = event.data.map(lang.hitch(self,function(d){
                  var processedValue = self.processValue(d)
                   var ret =  {d:processedValue , value:d.id + ' ' + processedValue, dsId: d.datasourceId} 
                   return ret;
                }));             
                self.visualizeIt();
             });

       }
    },

     processValue: function (data){
      var value = 0;
      if (data == undefined || data.values == undefined) return value;
      try {
        var sum = data.values.reduce(function(sum, a){return sum + a;},0);
        var count = data.values.length;
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