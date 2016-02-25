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
  "dijit/ConfirmDialog",
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane",
  "dijit/form/CheckBox",
  "dijit/form/Button",
  "dijit/form/Select",
  "dojox/layout/TableContainer",
  "dojox/grid/DataGrid",
  "dojo/data/ItemFileWriteStore",
  "dijit/form/TextBox",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",  
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "dojo/text!./DataReviewerTrendWidgetConfigTemplate.html",  
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/ColorPickerWidget",
  "esri/productiondashboard/PDChartEnum",
  "esri/productiondashboard/DRSRequest",
  "esri/productiondashboard/PDTrendChart",
   "dojo/domReady!"  
], function (declare, 
             lang,
             ConfirmDialog,
             BorderContainer,
             TabContainer,
             ContentPane,
             CheckBox,
             Button,
             Select,
             TableContainer,
             DataGrid,
             ItemFileWriteStore,
             TextBox,
             Memory,
             ObjectStore,
             _WidgetBase, 
             _TemplatedMixin, 
             _WidgetsInTemplateMixin, 
             WidgetConfigurationProxy, 
             templateString,
             PDInit,
             ColorPickerWidget,
             PDChartEnum,
             DRSRequest,       
             pdChartPreview             
            ){
    return declare("DataReviewerTrendWidgetConfig", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy], {

  		templateString: templateString,
      widgetConfig: {},
      drsRequest: null, 
      drsFiltersObjectStore: null,
      drsSelectedFilter : null,
      drsFilters: null,
      margin : {top: 05, right: 05, bottom: 05, left: 05},  

      labelOrientationSelectValuesStore : [
               { value: 0, label: "Horizontal"},
               { value: 90, label: "Vertical"}
          ],    
      
      startup: function(){
        this.inherited(arguments);      
      },

  		postCreate: function(){      
  			this.inherited(arguments);
  		},

      dataSourceSelectionChanged: function (dataSourceProxy, dataSourceConfig) {
        this.dataSourceConfig = dataSourceConfig;                        
        this.initWidgetConfig(this.dataSourceConfig.widgetConfig);
      },

      initWidgetConfig: function(currentConfig){
        if (currentConfig == undefined) {
          this.drsUrl.set('value', PDInit.DRS_SERVICE.url+'/exts/DataReviewerServer');
          this.widgetConfig = {
             drsUrl: this.drsUrl.get('value'),
             drsVariableValue: null,
             drsVariableLabel: null,
             drsFilters: [],             
             chartConfig : {
                type: 'barChart',
                showHorizontalGridLines: false,
                show_horizontal_axis: true,
                horizontal_ticks_orientation: 90,
                wrapHAxisText:false,
                show_vertical_axis: true,
                from_color: "red",
                to_color: "blue",
                add_chart_tip: true,
                select_on_map:false 
              }                  
          };    
        } else {
          this.widgetConfig = currentConfig;  
          this.drsUrl.set('value', this.widgetConfig.drsUrl);            
        }
        this.dataSourceConfig.widgetConfig = this.widgetConfig;
        this.drsRequest = new DRSRequest({
                                       url:this.widgetConfig.drsUrl, 
                                       drsVariableValue: this.widgetConfig.drsVariableValue,
                                       drsVariableLabel:this.widgetConfig.drsVariableLabel,
                                       drsFilters: this.widgetConfig.drsFilters,
                                       threshold: this.widgetConfig.threshold,
                                       widgetConfig: this.widgetConfig
                                     }); 
        this.drsRequest.on("drsRequest_error", function(error){
                console.log("error="+ error);
                alert("received drsRequest_error: " + error);
        });   
        this.drsRequest.on("drsRequest_intialized", function(data){
          self.setSelectStore(self.drsVariableValue,self.drsRequest.drsDashboardFieldNames,"id","fieldname",(this.drsVariableValue != undefined)? this.drsVariableValue.id: null);
          self.setSelectStore(self.drsFieldName,self.drsRequest.drsDashboardFieldNames,"id","fieldname");                 
          self.fillDistinctValues(self.drsRequest.drsDashboardFieldNames[0].fieldname);          
          self.initializeFiltersGrid();
          if (this.drsFilters != undefined && this.drsVariableValue != undefined ){
            for(var i=0; i< this.drsFilters.length; i++){
                var fieldname = this.getDrsDasboardFieldNames(this.drsFilters[i].fieldName)
                if (fieldname != undefined){
                    self.addTofiltersGrid(fieldname,{item : this.drsFilters[i].fieldValue});
                }
            }
            self.drsFilters  = this.drsFilters;  
          }

          self.widgetConfig = this.widgetConfig;
          //self.previewChart();
          self.validateConfig();
        });  
        var self = lang.hitch(this);
        this.drsRequest.initialize();
        this.intializeAppearanceTab();        
      },

      getSelectSelectedItem: function(selectId){
        if ((selectId instanceof Select) && (selectId.store != undefined)) {               
          return selectId.store.objectStore.get(selectId.get("value"));
        }
         return null;
      }, 

      colorChangeEventHandler: function(color){            
        this.widgetConfig.chartConfig.from_color = color;
        this.validateConfig();
        this.previewChart();
      },

      color2ChangeEventHandler: function(color){           
        this.widgetConfig.chartConfig.to_color = color.toHexString();
        this.validateConfig();
        this.previewChart();
      },

      setSelectStore: function(selectId, store, idProperty, attributeLabel,selectedValue){
            var memStore = new Memory({
                idProperty: idProperty,
                data: store
               });

             var objectStore =  new ObjectStore({
                objectStore: memStore
             })
             selectId.set("labelAttr",attributeLabel);
             selectId.setStore(objectStore);
             if (selectedValue != undefined && 
                 store != undefined  && 
                 store.length > 0){
                selectId.set("value", selectedValue);            
             }          
          },

      initializeFiltersGrid: function(){
        var  data = {
          identifier: 'id',
          label: 'id',
          items: []
        };
        this.drsFiltersObjectStore = new dojo.data.ItemFileWriteStore({data: data});
        this.filtersDG = new DataGrid({                                        
                                    store: this.drsFiltersObjectStore ,
                                    selectionMode: 'single',
                                    context: this,
                                    onRowDblClick: this.filterGridDblclickHandler,   
                                    rowSelector: '10px',                                     
                                    structure:[
                                        {name: 'Field Name', field:'fieldname' ,width:'50%' },
                                        {name: 'Value', field:'fieldvalue' ,width:'50%' }
                                    ]
                                    
                            },"filterGrid");
        this.filtersDG.startup();
        this.drsFilters = null;          
      },

      filterGridDblclickHandler:  function(e){
        var myDialog =  new ConfirmDialog({
          title: 'Remove Filter',
          filtersDG: this,
          context: this.context,
          onExecute: function() {
              this.filtersDG.removeSelectedRows();
              this.context.filtersDG.store.fetch({context: this.context, onComplete: this.context.buildFilters});
          },
          content: 'Would you like to remove this filter?',
          style: "width: 100%"
        })
        myDialog.show();                        
       },


      intializeAppearanceTab: function(){
        this.showHorizontalGridLinesCB.set('checked', this.widgetConfig.chartConfig.showHorizontalGridLines);
        this.showHorizontalAxisCB.set('checked', this.widgetConfig.chartConfig.show_horizontal_axis);
        this.wraplabelCB.set('checked', this.widgetConfig.chartConfig.wrapHAxisText);
        this.showVerticalAxisCB.set('checked', this.widgetConfig.chartConfig.show_vertical_axis);           
        this.setSelectStore(this.labelOrientation,this.labelOrientationSelectValuesStore,"value","label",this.widgetConfig.chartConfig.horizontal_ticks_orientation);
        //this.hookUpColorPickers(this.color1ChangeEventHandler, this.color2ChangeEventHandler); 
        this.colorPicker.setSelectedSwatchColor(this.widgetConfig.chartConfig.from_color);
        this.colorPicker.on('selectedColor', lang.hitch(this,this.colorChangeEventHandler));
        this.previewChart();
     },

     captureWidgetConfig: function() {

        this.widgetConfig.drsUrl = this.drsUrl.value;
        var selectedItem = this.getSelectSelectedItem(this.drsVariableValue);
        this.widgetConfig.drsVariableValue = (selectedItem != undefined)? selectedItem : null;
          
        this.widgetConfig.drsFilters = this.drsFilters;

        return (this.widgetConfig.drsVariableValue != undefined);

        return true;
      },

      validateConfig: function () {
        this.readyToPersistConfig(this.captureWidgetConfig());
      },
      
      unValidateConfig: function() {           
        this.readyToPersistConfig(false);
      },

    
      onDrsVariableValueChange: function(e){
        if (this.widgetConfig.drsVariableValue.id == e) {
          return;
        }            
        this.filtersDG.destroyRecursive(true);
        this.initializeFiltersGrid(); 
        this.validateConfig();    
      },

      onDrsFieldNameChange: function(){
        var selectedItem = this.drsFieldName.store.objectStore.get(this.drsFieldName.get("value"));
        if (selectedItem) {                  
           this.fillDistinctValues(selectedItem.fieldname);
        }
      },

      fillDistinctValues:function(drsVariable){
        if (drsVariable == undefined) return;
        var self = lang.hitch(this);
        this.drsRequest.getDashboardResults(
          drsVariable, 
          function(data){
            self.setSelectStore(self.drsDistinctValues, data.data,"id","variable");             
          },
          function(error){
            console.log(error.error.message);
          },
          this.drsFilters);
      },

      onAddFilterBtnClick: function(){
        var item;
        if (this.filtersDG != undefined){
          var drsFieldName_item = this.drsFieldName.store.objectStore.get(this.drsFieldName.get("value"));           
          drsDistinctValues_item = this.drsDistinctValues.store.objectStore.get(this.drsDistinctValues.get("value"));             
          if (drsDistinctValues_item.id == 99){
            alert('Invalid entry');
            return;
          }
          this.addTofiltersGrid(drsFieldName_item,drsDistinctValues_item);
          this.fetchfiltersGD();         
        }    
      },

      addTofiltersGrid: function(drsFieldname,drsFieldValue){
        this.filtersDG.store.newItem({
          id: this.getGuid(),                                    
          drsFieldnameId:drsFieldname.id, 
          fieldname:drsFieldname.fieldname,
          fieldvalue:drsFieldValue.item
        });
      },

      fetchfiltersGD: function(){
          this.filtersDG.store.fetch({context: this, onComplete: this.buildFilters}); 
      },

      buildFilters: function(items, request){
        filters = [];
        if (items != undefined) {
          items.forEach(function(item){
            filters.push({fieldName: item.fieldname[0], fieldValue: (isNaN(item.fieldvalue[0]))? item.fieldvalue[0]: Number(item.fieldvalue[0])});
          });
        } 
        var self = request.context;
        var selectedItem = self.drsVariableValue.store.objectStore.get(self.drsVariableValue.get("value"));
        self.drsFilters = filters;
        self.validateConfig();
     }, 
      

      onDrsDistinctValuesChange: function(){
           
      },

      onShowHorizontalGridLinesCBClick: function(e){
        this.widgetConfig.chartConfig.showHorizontalGridLines = e.currentTarget.checked;
        this.previewChart();
        this.validateConfig(); 
      },

      onShowHorizontalAxisClick: function(e){
        this.widgetConfig.chartConfig.show_horizontal_axis = e.currentTarget.checked;
        this.previewChart();
        this.validateConfig(); 
      },

      onLabelOrientationChange: function(e){
        this.widgetConfig.chartConfig.horizontal_ticks_orientation = this.labelOrientation.getValue();
        this.previewChart();
        this.validateConfig(); 
      },

      onWrapLabelCBClick: function(e){
        this.widgetConfig.chartConfig.wrapHAxisText = e.currentTarget.checked;
        this.previewChart();
        this.validateConfig(); 
      },

      onShowVerticalAxisCBClick: function(e){
        this.widgetConfig.chartConfig.show_vertical_axis = e.currentTarget.checked;
        this.previewChart();
        this.validateConfig();
      },

      onDrsUrlChange: function(){           
        this.validateConfig()
      },

      onChangeDRSConnection: function(){
        this.widgetConfig.drsUrl = this.drsUrl.get('value');
        this.intializeQueryTab();            
      },
      
      updateChartProperties: function(){
        this.chartPreview.svgType = PDChartEnum.BAR_CHART;
        this.chartPreview.showHorizontalGridLines = this.widgetConfig.chartConfig.showHorizontalGridLines;
        this.chartPreview.showHorizontalAxis = this.widgetConfig.chartConfig.show_horizontal_axis;
        this.chartPreview.ticksOrientation = this.widgetConfig.chartConfig.horizontal_ticks_orientation;
        this.chartPreview.wrapHAxisText = this.widgetConfig.chartConfig.wrapHAxisText;
        this.chartPreview.showVerticalAxis = this.widgetConfig.chartConfig.show_vertical_axis;
        this.chartPreview.endColor = this.widgetConfig.chartConfig.to_color;
        this.chartPreview.startColor = this.widgetConfig.chartConfig.from_color;
        this.chartPreview.selectOnMap = this.widgetConfig.chartConfig.select_on_map;
      },

      previewChart: function(){
        this.updateChartProperties();
        this.chartPreview.showChart();     
      },

      getGuid: function(){
            function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
      }
    });
});