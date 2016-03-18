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
  "dijit/Dialog",
  "dijit/ConfirmDialog",
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane",
  "dijit/form/CheckBox",
  "dijit/form/Button",
  "dojox/form/BusyButton",
  "dijit/form/Select",
  "dojox/layout/TableContainer",
  "dojox/grid/DataGrid",
  "dojo/data/ItemFileWriteStore",
  "dijit/form/TextBox",
  "dijit/form/ValidationTextBox",
  "dojox/validate/regexp",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",  
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "dojo/text!./DataReviewerBarWidgetConfigTemplate.html",  
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/ColorRampPickerWidget",
  "esri/productiondashboard/D3Charts/D3ChartEnum",
  "esri/productiondashboard/DRSRequest",
  "esri/productiondashboard/D3Charts/D3BarChart",
   "dojo/domReady!"  
], function (declare, 
             lang,
             Dialog,
             ConfirmDialog,
             BorderContainer,
             TabContainer,
             ContentPane,
             CheckBox,
             Button,
             BusyButton,
             Select,
             TableContainer,
             DataGrid,
             ItemFileWriteStore,
             TextBox,
             ValidationTextBox,
             regexp,
             Memory,
             ObjectStore,
             _WidgetBase, 
             _TemplatedMixin, 
             _WidgetsInTemplateMixin, 
             WidgetConfigurationProxy, 
             templateString,
             PDInit,
             ColorRampPickerWidget, 
             D3ChartEnum,
             DRSRequest,       
             pdChartPreview             
            ){
    return declare("DataReviewerBarWidgetConfig", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy], {

  		templateString: templateString,
      margin : {top: 0, right: 10, bottom: 10, left: 0},
      defaultSelectValuesStore : [
                                      { value: "loading", label: " "}
                                 ],
      widgetConfig: {},
      drsRequest: null, 
      drsFiltersObjectStore: null,
      drsSelectedFilter : null,
      drsFilters: null,      

      labelOrientationSelectValuesStore : [
               { value: 0, label: "Horizontal"},
               { value: 90, label: "Vertical"}
          ],    
      emptyDistinctValuesStore : [
               { id: '99', label: "No Values Found"}
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
                useColorRamp: true,
                colorRamp:[],
                add_chart_tip: true,
                select_on_map:false 
              }                  
          };    
        } else {
          this.widgetConfig = currentConfig;  
          this.drsUrl.set('value', this.widgetConfig.drsUrl);            
        }
        this.dataSourceConfig.widgetConfig = this.widgetConfig;
        this.intializeQueryTab();
        this.intializeAppearanceTab();        
      },
      

      intializeQueryTab: function(){
        this.resetSelectStore(this.drsVariableValue);
        this.resetSelectStore(this.drsFieldName);
        this.resetSelectStore(this.drsDistinctValues);
        this.drsRequest = new DRSRequest({
                                       url:this.widgetConfig.drsUrl, 
                                       drsVariableValue: this.widgetConfig.drsVariableValue,
                                       drsVariableLabel:this.widgetConfig.drsVariableLabel,
                                       drsFilters: this.widgetConfig.drsFilters,                                                                        
                                       widgetConfig: this.widgetConfig
                                     });
        this.drsRequest.on("drsRequest_error", lang.hitch(this,function(error){          
                this.widgetConfig.drsUrl = null;
                this.validateConfig();             
                this.showErrorDialog("Unable to resolve Data Reviewer Service URL");
                this.connectBtn.cancel();
             }));
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
                self.connectBtn.cancel();
                self.validateConfig();
             });
             var self = lang.hitch(this);
             this.drsRequest.initialize();
      },

      getSelectSelectedItem: function(selectId){
        if ((selectId instanceof Select) && (selectId.store != undefined)) {               
          return selectId.store.objectStore.get(selectId.get("value"));
        }
         return null;
      }, 
      
      showErrorDialog: function(errorMsg){
            var errorDialog = new Dialog({
              title: "Error Message",
              style: "width: 300px;",
              content: "<strong>"+errorMsg+"!</strong>"
            });
            errorDialog.show();
      },
      
      resetSelectStore: function(selectId){
             this.setSelectStore(selectId,this.defaultSelectValuesStore,"value","label");             
      },

      isValidSelectValue: function(value) {
              return (value == undefined)? 
                       false: 
                       !(value.toString().localeCompare(this.defaultSelectValuesStore[0].value) == 0);
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
        var w = dijit.byId( 'filterGrid' );
        if (w != undefined){
          w.destroy(true);
        }
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
        this.crpw.on('selectedColorRamp',lang.hitch(this,this.colorRampChangeEventHandler));
        this.widgetConfig.chartConfig.colorRamp = this.crpw.getSelectedColorRamp();
     },

     colorRampChangeEventHandler: function(colorRamp){            
            this.widgetConfig.chartConfig.colorRamp = colorRamp;
            this.validateConfig();
            this.previewChart();
      }, 

     captureWidgetConfig: function() {

        var status = this.drsUrl.isValid();         
        if (!status) {
          this.connectBtn.set('disabled', true);
          return false;
        }

        this.connectBtn.set('disabled', false);
       
        this.widgetConfig.drsUrl = this.drsUrl.get('value');
        if (this.widgetConfig.drsUrl == undefined || this.widgetConfig.drsUrl == ''){
              return false;
        }
        
        var selectedItem = this.getSelectSelectedItem(this.drsVariableValue);            
        if (selectedItem == undefined ||  !this.isValidSelectValue(this.drsVariableValue.get("value"))) return false;
        this.widgetConfig.drsVariableValue = selectedItem;
          
        this.widgetConfig.drsFilters = this.drsFilters;          

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
        this.setSelectStore(this.drsDistinctValues, this.emptyDistinctValuesStore,"id","label");
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
            this.showErrorDialog('Invalid entry');
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
        this.chartPreview.margin = this.margin;
        this.chartPreview.showHorizontalGridLines = this.widgetConfig.chartConfig.showHorizontalGridLines;
        this.chartPreview.showHorizontalAxis = this.widgetConfig.chartConfig.show_horizontal_axis;
        this.chartPreview.ticksOrientation = this.widgetConfig.chartConfig.horizontal_ticks_orientation;
        this.chartPreview.wrapHAxisText = this.widgetConfig.chartConfig.wrapHAxisText;
        this.chartPreview.showVerticalAxis = this.widgetConfig.chartConfig.show_vertical_axis;
        this.chartPreview.selectOnMap = this.widgetConfig.chartConfig.select_on_map;
        this.chartPreview.useColorRamp =  this.widgetConfig.chartConfig.useColorRamp;
        this.chartPreview.colorRamp = this.widgetConfig.chartConfig.colorRamp;
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