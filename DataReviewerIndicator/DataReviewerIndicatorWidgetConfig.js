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
  "dojo/dom-style",
  "dijit/registry",
  "dijit/ConfirmDialog",
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer", 
  "dijit/layout/ContentPane",
  "dijit/form/Button",
  "dojox/form/BusyButton",
  "dijit/form/ValidationTextBox",
  "dojox/validate/regexp",
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
  "dojo/text!./DataReviewerIndicatorWidgetConfigTemplate.html",
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/ColorPickerWidget",
  "esri/productiondashboard/DRSRequest",
  "esri/productiondashboard/D3Charts/D3IndicatorChart",
  "esri/productiondashboard/SymbolPickerWidget",
  "dojo/domReady!"  
  
], function (declare, 
             lang,
             domStyle,
             registry,
             ConfirmDialog,
             BorderContainer,
             TabContainer,
             ContentPane,
             Button,
             BusyButton,
             ValidationTextBox,
             regexp,
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
             DRSRequest,
             pdChartPreview,
             SymbolPickerWidget
            ){

    return declare("DataReviewerIndicatorWidgetConfig", 
                 [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy],
         {

          templateString: templateString,
          defaultSelectValuesStore : [
                                      { value: "loading", label: " "}
                                      ],
          indicatorTypeSelectValuesStore : [
                                      { value: "twostates", label: "Two States Indicator"},
                                      { value: "threestates", label: "Three States Indicator"}
                                      ],
          comparisonTypeSelectValuesStore : [
                                      /*{ value: "equal", label: "Equal"},*/
                                      /*{ value: "notequal", label: "Not Equal"},*/
                                      /*{ value: "greaterthan", label: "Greater Than"},*/
                                      { value: "greaterthanorequal", label: "Greater Than Or Equal"},
                                      /*{ value: "lessthan", label: "Less Than"},*/
                                      { value: "lessthanorequal", label: "Less Than Or Equal"}
                                      ],

          operationValueSelectValuesStore : [
                                      { value: PDInit.CALCULATE_BY_AVERAGE, label: "Average"},
                                      { value: PDInit.CALCULATE_BY_MAX, label: "Maximum"},
                                      { value:  PDInit.CALCULATE_BY_MIN, label: "Minimum"},
                                      { value: PDInit.CALCULATE_BY_SUM, label: "Sum"},
                                      { value: PDInit.CALCULATE_BY_UNKNOWN, label: "No Operation"}
                                      ], 

          emptyDistinctValuesStore : [
               { id: '99', label: "No Values Found"}
          ],    
                            

          widgetConfig: {}, 
          drsRequest: null, 
          drsFiltersObjectStore: null,
          drsFilters: null,
          defaultDataValuesLoading: 'is loading...',

          startup: function(){
            this.inherited(arguments);
            this.appearanceTab.startup();           
          },

          postCreate: function(){          
            this.inherited(arguments);           
            esriConfig.defaults.io.corsEnabledServers.push("ogcedit.esri.com");  
          },

          dataSourceSelectionChanged: function (dataSourceProxy, dataSourceConfig) {         
            this.dataSourceConfig = dataSourceConfig;          
            this.initWidgetConfig(this.dataSourceConfig.widgetConfig);
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

          resetSelectStore: function(selectId){
             this.setSelectStore(selectId,this.defaultSelectValuesStore,"value","label");             
          },

          isValidSelectValue: function(value) {
              return (value == undefined)? 
                       false: 
                       !(value.toString().localeCompare(this.defaultSelectValuesStore[0].value) == 0);
          },

          initializeFiltersGrid: function(){
            var  data = {
              identifier: 'id',
              label: 'id',
              items: []
            };
            this.drsFiltersObjectStore = new dojo.data.ItemFileWriteStore({data: data});
            registry.remove("filterGrid");
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

          initWidgetConfig: function(currentConfig){
            if (currentConfig == undefined) {            
              this.drsUrl.set('value',PDInit.DRS_SERVICE.url + '/exts/DataReviewerServer');
              this.widgetConfig = {
                drsUrl: this.drsUrl.get('value'),
                drsVariableValue: null,
                drsVariableLabel: null,
                drsFilters: [],
                operation: PDInit.CALCULATE_BY_UNKNOWN,
                highTargetValue: 0,
                lowTargetValue: 0,
                indicatorType:'twostates',
                comparisonType: 'greaterthanorequal',
                aboveValuesColor: 'green',
                aboveValuesSymbol: "circle",
                betweenValuesColor: 'orange',
                betweenValuesSymbol: "circle",
                belowValuesColor: 'red',
                belowValuesSymbol: "circle",
                chartConfig: {
                  select_on_map: false
                }
              };
             } else {
              this.widgetConfig = currentConfig;  
              this.drsUrl.set('value',this.widgetConfig.drsUrl);              
             }
             this.dataSourceConfig.widgetConfig = this.widgetConfig; 
             this.intializeQueryTab()             
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
                                       highTargetValue: this.widgetConfig.highTargetValue,                                       
                                       widgetConfig: this.widgetConfig
                                     });
            this.drsRequest.on("drsRequest_error", lang.hitch(this,function(error){
                console.log("error="+ error.error.message);
                this.widgetConfig.drsUrl = null;
                this.validateConfig();
                alert("Unable to resolve Data Reviewer Service URL");
            }));
            this.drsRequest.on("drsRequest_intialized", function(data){
                self.setSelectStore(self.drsVariableValue,self.drsRequest.drsDashboardFieldNames,"id","fieldname",(this.drsVariableValue != undefined)? this.drsVariableValue.id: null);
                self.setSelectStore(self.drsFieldName,self.drsRequest.drsDashboardFieldNames,"id","fieldname");                 
                self.fillDistinctValues(self.drsRequest.drsDashboardFieldNames[0].fieldname);
                self.initializeFiltersGrid(this.drsFilters);              
                if (this.drsFilters != undefined && this.drsVariableValue != undefined ){
                  for(var i=0; i< this.drsFilters.length; i++){
                      var fieldname = this.getDrsDasboardFieldNames(this.drsFilters[i].fieldName)
                      if (fieldname != undefined){
                          self.addTofiltersGrid(fieldname,{item : this.drsFilters[i].fieldValue});
                      }
                  }
                  self.drsFilters  = this.drsFilters;
                }
                self.validateConfig();
             });
             var self = lang.hitch(this);
             this.drsRequest.initialize();
             this.setSelectStore(this.operationValue,this.operationValueSelectValuesStore,"value","label", this.widgetConfig.operation);
          },

          intializeAppearanceTab: function(){            
            this.setSelectStore(this.indicatorType,this.indicatorTypeSelectValuesStore,"value","label", this.widgetConfig.indicatorType);
            this.setIndicatorsTableStyle(this.widgetConfig.indicatorType);
            this.setSelectStore(this.comparisonType,this.comparisonTypeSelectValuesStore,"value","label", this.widgetConfig.comparisonType);            
            this.highTargetValue.set('value',this.widgetConfig.highTargetValue);
            this.lowTargetValue.set('value',this.widgetConfig.lowTargetValue);
            this.aboveValuesColor.setSelectedSwatchColor(this.widgetConfig.aboveValuesColor);
            this.aboveValuesColor.on('selectedColor',lang.hitch(this,this.onAboveValuesColorChange));
            this.betweenValuesColor.setSelectedSwatchColor(this.widgetConfig.betweenValuesColor);
            this.betweenValuesColor.on('selectedColor',lang.hitch(this,this.onBetweenValuesColorChange));
            this.belowValuesColor.setSelectedSwatchColor(this.widgetConfig.belowValuesColor);
            this.belowValuesColor.on('selectedColor',lang.hitch(this,this.onBelowValuesColorChange));
            this.aboveValues_spw.selectedSymbol = this.widgetConfig.aboveValuesSymbol;
            this.aboveValues_spw.symbolFillColor = this.widgetConfig.aboveValuesColor;
            this.aboveValues_spw.refresh();
            this.betweenValues_spw.selectedSymbol = this.widgetConfig.betweenValuesSymbol;
            this.betweenValues_spw.symbolFillColor = this.widgetConfig.betweenValuesColor;
            this.betweenValues_spw.refresh();
            this.belowValues_spw.selectedSymbol = this.widgetConfig.belowValuesSymbol;
            this.belowValues_spw.symbolFillColor = this.widgetConfig.belowValuesColor;
            this.belowValues_spw.refresh();
            this.aboveValuesIndicator.symbolStyle = this.widgetConfig.aboveValuesSymbol;
            this.aboveValuesIndicator.fill_color = this.widgetConfig.aboveValuesColor;
            this.betweenValuesIndicator.symbolStyle = this.widgetConfig.betweenValuesSymbol;
            this.betweenValuesIndicator.fill_color = this.widgetConfig.betweenValuesColor;
            this.belowValuesIndicator.symbolStyle = this.widgetConfig.belowValuesSymbol;
            this.belowValuesIndicator.fill_color = this.widgetConfig.belowValuesColor;
         },

          onAppeanranceTabShow: function(){
            this.aboveValuesIndicator.showChart();
            this.betweenValuesIndicator.showChart();
            this.belowValuesIndicator.showChart();
          },


          getSelectSelectedItem: function(selectId){
            if ((selectId instanceof Select) && (selectId.store != undefined)) {               
               return selectId.store.objectStore.get(selectId.get("value"));
            }
            return null;
          }, 

          captureWidgetConfig: function(){

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
          
            this.widgetConfig.highTargetValue =  Number(this.highTargetValue.get('value'));

            this.widgetConfig.lowTargetValue =  Number(this.lowTargetValue.get('value'));

            var selectedItem = this.getSelectSelectedItem(this.operationValue);            
            if (selectedItem == undefined ||  !this.isValidSelectValue(this.operationValue.get("value"))) return false;
            this.widgetConfig.operation = selectedItem.value;
            
            return true;
          },

          unValidateConfig: function() {           
            this.readyToPersistConfig(false);
          },
                
          validateConfig: function () {
            this.readyToPersistConfig(this.captureWidgetConfig());
          },

          setIndicatorsTableStyle: function(state){
            switch (state){
              case "threestates":{
                this.targteValueLabel.textContent = "High Target Value:";
                domStyle.set(this.betweenValuesIndicator.id, "display", "block");
                domStyle.set(this.comparisonTypeRowSetting, "display", "none");
                domStyle.set(this.lowTargetValueRowSetting, "display","")
                domStyle.set(this.betweenValuesSetting, "display", "");
                this.aboveValuesIndicator.svgHeight = "30%";
                this.betweenValuesIndicator.svgHeight = "30%";
                this.belowValuesIndicator.svgHeight = '30%';
              break;              
              }
              case "twostates":{
                this.targteValueLabel.textContent =  "Target Value:";
                domStyle.set(this.betweenValuesIndicator.id, "display", "none");
                domStyle.set(this.lowTargetValueRowSetting, "display","none");
                domStyle.set(this.comparisonTypeRowSetting, "display", "");
                domStyle.set(this.betweenValuesSetting, "display", "none"); 
                this.aboveValuesIndicator.svgHeight = "45%";
                this.betweenValuesIndicator.svgHeight = "10%";
                this.belowValuesIndicator.svgHeight = "45%";
               break;
              }            
            }
            this.aboveValuesIndicator.showChart(true);
            this.betweenValuesIndicator.showChart(true);
            this.belowValuesIndicator.showChart(true);
          },

          onIndicatorTypeChange: function(e){           
            this.widgetConfig.indicatorType = e;
            this.setIndicatorsTableStyle(this.widgetConfig.indicatorType);
            this.validateConfig();
          },

          onComparisonTypeChange: function(e){
            this.widgetConfig.comparisonType = e;
            this.validateConfig();
          },

          adjustAboveValuesSymbolColor: function(){
            this.aboveValues_spw.symbolFillColor = this.widgetConfig.aboveValuesColor;
            this.aboveValues_spw.refresh();
            this.aboveValuesIndicator.fill_color = this.widgetConfig.aboveValuesColor;
            this.aboveValuesIndicator.showChart();
          },

          onAboveValuesColorChange: function(color){
            this.widgetConfig.aboveValuesColor = color;
            this.adjustAboveValuesSymbolColor();
            this.validateConfig();
          },

          adjustAboveValuesSymbolStyle: function(){
            this.aboveValuesIndicator.symbolStyle = this.widgetConfig.aboveValuesSymbol;       
            this.aboveValuesIndicator.showChart();
          },

          onAboveValues_spwChange: function(e){
            this.widgetConfig.aboveValuesSymbol = this.aboveValues_spw.selectedSymbol;
            this.adjustAboveValuesSymbolStyle();
            this.validateConfig();
          },

          adjustBetweenValuesSymbolColor: function(){
            this.betweenValues_spw.symbolFillColor = this.widgetConfig.betweenValuesColor;
            this.betweenValues_spw.refresh();
            this.betweenValuesIndicator.fill_color = this.widgetConfig.betweenValuesColor;
            this.betweenValuesIndicator.showChart();
          },

          onBetweenValuesColorChange: function(color){
            this.widgetConfig.betweenValuesColor = color;
            this.adjustBetweenValuesSymbolColor();
            this.validateConfig();
          },

          adjustBetweenValuesSymbolStyle: function(){
            this.betweenValuesIndicator.symbolStyle = this.widgetConfig.betweenValuesSymbol;       
            this.betweenValuesIndicator.showChart();
          },

          onBetweenValues_spwChange: function(){
            this.widgetConfig.betweenValuesSymbol = this.betweenValues_spw.selectedSymbol;
            this.adjustBetweenValuesSymbolStyle();
            this.validateConfig();
          },

          adjustBelowValuesSymbolColor: function(){
            this.belowValues_spw.symbolFillColor = this.widgetConfig.belowValuesColor;
            this.belowValues_spw.refresh();
            this.belowValuesIndicator.fill_color = this.widgetConfig.belowValuesColor;
            this.belowValuesIndicator.showChart();
          },

          onBelowValuesColorChange: function(color){
            this.widgetConfig.belowValuesColor = color;
            this.adjustBelowValuesSymbolColor();
            this.validateConfig();
          },

          adjustBelowValuesSymbolStyle: function(){
            this.belowValuesIndicator.symbolStyle = this.widgetConfig.belowValuesSymbol;       
            this.belowValuesIndicator.showChart();
          },

          onBelowValues_spwChange: function(){
            this.widgetConfig.belowValuesSymbol = this.belowValues_spw.selectedSymbol;
            this.adjustBelowValuesSymbolStyle();
            this.validateConfig();
          },
        
          onDrsUrlChange: function(){           
            this.validateConfig();
          },

          onDrsVariableValueChange: function(e){
            if (this.widgetConfig.drsVariableValue == undefined) {
              return;
            }
            if (this.widgetConfig.drsVariableValue.id == e) {
              return;
            }            
            this.filtersDG.destroyRecursive(true);
            this.initializeFiltersGrid(); 
            this.validateConfig();        
            this.runDRSQuery()           
          },

          runDRSQuery: function(){
            var selectedItem = this.drsVariableValue.store.objectStore.get(this.drsVariableValue.get("value"));
            var self = lang.hitch(this);           
            this.drsRequest.getDashboardResults(
                              selectedItem.fieldname,
                              function(data){ 
                                 //console.log(data);
                              },
                              function(error){
                                console.log(error.error.message);
                                alert("received error");
                              },
                              this.drsFilters);
          },  

          onDrsFieldNameChange: function(){
            var selectedItem = this.drsFieldName.store.objectStore.get(this.drsFieldName.get("value"));
            if (selectedItem) {                  
               this.fillDistinctValues(selectedItem.fieldname);
            }
          },

          onHighTargetValueChange: function(e)
          {
             if (isNaN(this.highTargetValue.get('value'))) {
                 this.highTargetValue.value = 0; 
                 this.unValidateConfig();
                 return;

             }              
             this.validateConfig();
          },

          onLowTargetValueChange: function(e)
          {
             if (isNaN(this.lowTargetValue.get('value'))) {
                 this.lowTargetValue.value = 0; 
                 this.unValidateConfig();
                 return;

             }              
             this.validateConfig();
          },

          onChangeWMXConnection: function(event){            
            this.validateConfig();            
          },

          onAddFilterBtnClick: function(){
            //alert('Add Filter clicked');
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
            self.runDRSQuery()
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
              null);
          },

          onDrsVariableLabelChange: function(e){
              this.validateConfig();
          },

          onOperationValueChange: function(e){
            this.validateConfig();
          },

          onChangeDRSConnection: function(){
            this.widgetConfig.drsUrl = this.drsUrl.get('value');
            this.intializeQueryTab();            
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