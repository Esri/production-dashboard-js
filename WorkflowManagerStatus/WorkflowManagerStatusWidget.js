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
  "esri/productiondashboard/WMXRequest",
  "esri/productiondashboard/WMXJobStatusChartDatasource",
  "esri/tasks/query",
  "esri/productiondashboard/PDChartEnum",
  "esri/productiondashboard/PDIndicatorChart",
  "dojo/domReady!"  
 
], function (declare, lang, _WidgetBase, _TemplatedMixin, WidgetProxy,WMXRequest,WMXJSChartDS,Query,PDChartEnum,pdChart) {

  return declare("WorkflowManagerStatusWidget", [_WidgetBase, _TemplatedMixin, WidgetProxy], {    

    templateString: '<div data-dojo-attach-point="chartPreview" style="overflow:hidden;"></div>',
    margin : {top: 0, right: 0, bottom: 0, left: 0},   
    wmxRequest: null,
    wmxJSChartDS : null,
    widgetConfig: null,
    datasource: null,
    data: null,
    yellow: 'Yellow',
    red: 'Red' ,
    green:'Green',
    data: null,
    chartData: null,

    postCreate: function () {        
       this.inherited(arguments);
       this.chart = new pdChart().placeAt(this.chartPreview);       
    },
    
    visualizeIt:function (){
      if (this.data != undefined && this.data.length > 0){          
          this.chartData = this.data[0];
          this.chart.margin = this.margin;
          this.chart.indicator = (!this.widgetConfig.chartConfig.is_percentage)? this.chartData.value.toString(): this.chartData.value.toString() + "%";
          if (this.widgetConfig.addMapIntegration) {
            this.chart.selectOnMap = true;
            this.chart.onChartClick = lang.hitch(this,this.selectFeaturesOnMap);
          }          
          switch (this.chartData.d){
            case "Overdue": {
              this.chart.fill_color = this.widgetConfig.chartConfig.overdueScheduleColor;
              this.chart.symbolStyle = this.widgetConfig.chartConfig.overdueScheduleSymbolStyle;              
              break;
            }
            case "Behind Schedule": {
              this.chart.fill_color = this.widgetConfig.chartConfig.behindScheduleColor;
              this.chart.symbolStyle = this.widgetConfig.chartConfig.behindSceduleSymbolStyle;
              break;
            }
            case "On Schedule": {
              this.chart.fill_color = this.widgetConfig.chartConfig.onscheduleColor;
              this.chart.symbolStyle = this.widgetConfig.chartConfig.onscheduleSymbolStyle;
              break;
            }
          }         
          this.chart.showChart();

      }
    },
    
    dataSourceExpired: function (dataSourceProxy, dataSourceConfig) {
      //alert("received a onDataSourceExpired event");
      if (!dataSourceConfig) return;
      var self = lang.hitch(this);   
      this.dataSourceConfig = dataSourceConfig;
      this.datasource = dataSourceProxy;
      this.widgetConfig = this.dataSourceConfig.widgetConfig;

      // instanciate a wwmxRequest
      this.wmxRequest = new WMXRequest({url:this.widgetConfig.wmxUrl});
      // instanciate a WMXChartDS
      this.wmxJSChartDS = new WMXJSChartDS({
                       wmxRequest: this.wmxRequest,
                       calculateStatusFunction: this.calculateStatusfunction, 
                       queryId: this.widgetConfig.queryId, 
                       userName:this.widgetConfig.userName,
                       idField: this.widgetConfig.datasourceId,
                       dueDateField: this.widgetConfig.dueDateField,
                       startDateField: this.widgetConfig.startDateField,
                       percentCompleteField:this.widgetConfig.percentCompleteField                       
       });

       // listen to dataIsReady event
       this.wmxJSChartDS.on("dataIsReady", function(event){
         self.data = event.data;
         if (self.data.length == 0)  {
            alert('Empty dataset');
            return;
         }
         var numOfOverdues = [], numOfBehindSchedule = [], numOfOnSchedule = [], numOfOthers = [];
         self.data.forEach(function(d){
             id = Number(d.id);
             switch(d.status)
             {
               case "Overdue":
                  numOfOverdues.push(id);
                  break;
               case "Behind Schedule":
                  numOfBehindSchedule.push(id);
                  break;
               case "On Schedule":
                  numOfOnSchedule.push(id);
                  break;
               default:
                  numOfOthers.push(id);
                  break; 
             }  
         });
         self.data  = [];
         if (numOfOverdues.length > 0) {
            self.data.push({d: 'Overdue', value:numOfOverdues.length, color: self.red, datasourceIds : numOfOverdues });
         }
         if (numOfBehindSchedule.length > 0) {
            self.data.push({d: 'Behind Schedule', value:numOfBehindSchedule.length, color: self.yellow, datasourceIds : numOfBehindSchedule });
         } 
         if (numOfOnSchedule.length > 0){
            self.data.push({d: 'On Schedule', value:numOfOnSchedule.length, color: self.green, datasourceIds : numOfOnSchedule });
         }         
         if (numOfOthers.length > 0){
            self.data.push({d: 'Others', value:numOfOthers.length, color: 'orange', datasourceIds : numOfOthers });   
         }

         self.visualizeIt();
       });
    },

    calculateStatusfunction: function(dueDate , startDate,percentComplete){
      if (!(dueDate instanceof Date)) return "wrong Date parameter";
      if (!(startDate instanceof Date)) return "wrong Date parameter";
      if (isNaN(percentComplete)) return "wrong Number parameter";
      if (percentComplete < 0 || percentComplete > 100) return "wrong percentage value";
      var today = new Date(), oneDay = 1000*60*60*24;
      if (dueDate < today) return "Overdue";
      var scheduledTotalDays = Math.round((dueDate.getTime() - startDate.getTime())/oneDay);
      var daysPassed = Math.round((today.getTime() - startDate.getTime())/oneDay);
      var sceduledPercentage = (daysPassed / scheduledTotalDays) * 100;
      return (sceduledPercentage > percentComplete)? "Behind Schedule": "On Schedule";
    },

    selectFeaturesOnMap: function(){ 
      var datasourceIds = this.chartData.datasourceIds;   
      if (datasourceIds == undefined) return;
      if (lang.isArray(datasourceIds)) {
          this.datasource.clearSelection();                  
          this.datasource.selectFeaturesByObjectIds(datasourceIds);
      }
    }


  });
});