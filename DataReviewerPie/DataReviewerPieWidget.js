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
  "esri/productiondashboard/DRSRequest",
  "esri/productiondashboard/PDChartEnum",
  "esri/productiondashboard/PDPieChart"
], function (declare, 
            lang, 
            _WidgetBase, 
            _TemplatedMixin,
             WidgetProxy,
             DRSRequest,
             PDChartEnum,
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
      this.chart.svgType = PDChartEnum.PIE_CHART;
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