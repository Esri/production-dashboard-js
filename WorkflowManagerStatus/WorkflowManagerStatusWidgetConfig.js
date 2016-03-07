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
  "dojo/dom",
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer",
  "dojox/layout/TableContainer",
  "dijit/layout/ContentPane",
  "dijit/form/ValidationTextBox",
  "dojox/validate/regexp",
  "dojox/form/BusyButton",
  "dijit/form/Select",
  "dijit/form/CheckBox",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",  
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "dojo/text!./WorkflowManagerStatusWidgetConfigTemplate.html",
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/ColorPickerWidget",  
  "esri/productiondashboard/WMXEnum",
  "esri/productiondashboard/WMXRequest",
  "esri/productiondashboard/WMXQueriesWidget",
  "esri/productiondashboard/D3Charts/D3IndicatorChart",
  "esri/productiondashboard/SymbolPickerWidget",
  "dojo/domReady!"  
  
], function (declare, 
             lang,
             Dialog,
             dom,
             BorderContainer,
             TabContainer,
             TableContainer,
             ContentPane,
             ValidationTextBox,
             regexp,
             Button,
             Select,
             CheckBox,
             Memory,
             ObjectStore,
             _WidgetBase, 
             _TemplatedMixin, 
             _WidgetsInTemplateMixin, 
             WidgetConfigurationProxy, 
             templateString,
             PDInit,
             ColorPickerWidget,
             WMXEnum,
             WMXRequest,
             WMXQueriesWidget,
             pdChartPreview,
             SymbolPickerWidget
            ){

    return declare("WorkflowManagerStatusWidgetConfig", 
    	           [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy],
    	   {

	    		templateString: templateString,
          defaultSelectValuesStore : [
                                      { value: "loading", label: " "}
                                      ],
          widgetConfig: {}, 

                     
	    		postCreate: function(){
      			this.inherited(arguments);
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

          initWidgetConfig: function(currentConfig){
            if (currentConfig == undefined) {            
              this.wmxUrl.set('value',PDInit.WMX_SERVICE.url);   
              this.wmxUsername.set('value',PDInit.WMX_SERVICE.username);     
              this.widgetConfig = {
                wmxUrl: this.wmxUrl.get('value'),
                userName: this.wmxUsername.get('value'),
                connectionTested: false, // values : true for life/ false for broken;                
                queryId: null,
                datasourceId: null,
                dueDateField: null,                  
                startDateField:null,                            
                percentCompleteField: null,
                addMapIntegration :false,
                chartConfig: {
                  show_indicator : true,
                  onscheduleColor: '#6aa84f',
                  onscheduleSymbolStyle: "face-up-arrow",
                  behindScheduleColor: '#f90',
                  behindSceduleSymbolStyle: 'circle',
                  overdueScheduleColor: '#f00',
                  overdueScheduleSymbolStyle: 'face-down-arrow',
                  is_percentage: false
                }
              };
            } else {
              this.widgetConfig.connectionTested = false;
              this.widgetConfig = currentConfig;  
              this.wmxUrl.set('value',this.widgetConfig.wmxUrl);
              this.wmxUsername.set('value',this.widgetConfig.userName);
            }                          
             
            this.WMXQueriesTree.on('selected', lang.hitch(this, this.onWMXQueryDropDownChanged));
            this.WMXQueriesTree.on('error', lang.hitch(this, this.onWMXQueryDropDownErrored));
            this.WMXQueriesTree.on('loaded', lang.hitch(this, this.onWMXQueryDropDownLoaded));   
            this.initQueryTab();
            this.intializeAppearanceTab();      
            this.dataSourceConfig.widgetConfig = this.widgetConfig; 
          },

          initQueryTab: function(){
            if (this.widgetConfig.wmxUrl == ""){
              this.setConnectionStatus(false, "No WMX Service Url")
            } else {
              var request = new WMXRequest({url:this.widgetConfig.wmxUrl});
              this.WMXQueriesTree.wmxRequest = request;
              this.WMXQueriesTree.load();              
            }
          },

          intializeAppearanceTab: function(){
            this.isPercentageCB.set('checked',this.widgetConfig.chartConfig.is_percentage)
            
            this.onSchedule_spw.selectedSymbol = this.widgetConfig.chartConfig.onscheduleSymbolStyle;
            this.onSchedule_spw.symbolFillColor = this.widgetConfig.chartConfig.onscheduleColor;
            this.onSchedule_spw.refresh();
            
            this.behindSchedule_spw.selectedSymbol = this.widgetConfig.chartConfig.behindSceduleSymbolStyle;
            this.behindSchedule_spw.symbolFillColor = this.widgetConfig.chartConfig.behindScheduleColor;
            this.behindSchedule_spw.refresh();

            this.overdue_spw.selectedSymbol = this.widgetConfig.chartConfig.overdueScheduleSymbolStyle;
            this.overdue_spw.symbolFillColor = this.widgetConfig.chartConfig.overdueScheduleColor;
            this.overdue_spw.refresh();
            
            this.onScheduleIndicator.symbolStyle = this.widgetConfig.chartConfig.onscheduleSymbolStyle; 
            this.onScheduleIndicator.fill_color = this.widgetConfig.chartConfig.onscheduleColor; 
            
            this.behindScheduleIndicator.symbolStyle = this.widgetConfig.chartConfig.behindSceduleSymbolStyle;
            this.behindScheduleIndicator.fill_color = this.widgetConfig.chartConfig.behindScheduleColor;
            
            this.overdueIndicator.symbolStyle = this.widgetConfig.chartConfig.overdueScheduleSymbolStyle;
            this.overdueIndicator.fill_color = this.widgetConfig.chartConfig.overdueScheduleColor;
            
            this.onScheduleColor.setSelectedSwatchColor(this.widgetConfig.chartConfig.onscheduleColor);
            this.onScheduleColor.on('selectedColor', lang.hitch(this,this.onOnScheduleColorChange));
            
            this.behindScheduleColor.setSelectedSwatchColor(this.widgetConfig.chartConfig.behindScheduleColor);
            this.behindScheduleColor.on('selectedColor', lang.hitch(this,this.onBehindScheduleColorChange));
            
            this.overdueColor.setSelectedSwatchColor(this.widgetConfig.chartConfig.overdueScheduleColor);
            this.overdueColor.on('selectedColor', lang.hitch(this,this.onOverdueColorChange));

          },

          setQueryTabStatus: function(status){
            this.queryTab.set('disabled', !status);
          },

          setApperanceTabStatus: function(status){
            this.appearanceTab.set('disabled', !status);
          },

          showErrorDialog: function(errorMsg){
            if (errorMsg == undefined || errorMsg == "") errorMsg = 'Error encountered';
            var last = errorMsg[errorMsg.length-1]
            if (last == '!' || last == '.' || last == ',' || last == '?') {
              errorMsg = errorMsg.substring(0,errorMsg.length-1)
            }
            var errorDialog = new Dialog({
              title: "Error Message",
              style: "width: 300px;",
              content: "<strong>"+errorMsg+"!</strong>"
            });
            errorDialog.show();
          },

          showConnectionError: function (errorMsg){
            if (errorMsg == undefined || errorMsg == "") errorMsg = 'Connection error';
            this.connectionTab.set('selected',true);
            this.setQueryTabStatus(false);
            this.setApperanceTabStatus(false);
            this.showErrorDialog(errorMsg);
            this.connectBtn.cancel();
          },

          setConnectionStatus: function(status, errorMsg){
            var con_status = Boolean(status);
            if (con_status){
              this.widgetConfig.connectionTested = true;
              this.setQueryTabStatus(true);
              this.setApperanceTabStatus(true);
              this.connectBtn.cancel();
              this.checkgroupDateBystatus();
              this.checkValueFieldStatus();
              // persist                  
              this.validateConfig();   
            } else {             
              if (!this.widgetConfig.connectionTested){
                this.showConnectionError(errorMsg);
                this.widgetConfig.connectionTested = true;
              }
            }
          },

          onAppeanranceTabShow: function(){
            this.onScheduleIndicator.showChart();
            this.behindScheduleIndicator.showChart();
            this.overdueIndicator.showChart();
          },

          resetSelectStore: function(selectId){
             this.setSelectStore(selectId,this.defaultSelectValuesStore,"value","label");             
          },

          isValidSelectValue: function(value) {
              return (value == undefined)? 
                       false: 
                       !(value.toString().localeCompare(this.defaultSelectValuesStore[0].value) == 0);
          },

          getSelectSelectedItem: function(selectId){
            if (selectId instanceof Select && selectId.store != undefined) {               
               return selectId.store.objectStore.get(selectId.get("value"));
            }
            return null;
          }, 

          
          captureWidgetConfig: function(){

            var status = this.wmxUrl.isValid();         
            if (!status) {
              this.connectBtn.set('disabled', true);
              return false;
            }

            status = this.wmxUsername.isValid();
            if (!status) {
              this.connectBtn.set('disabled', true);
              return false;
            }

            this.connectBtn.set('disabled', false);

            this.widgetConfig.wmxUrl = this.wmxUrl.get('value');
            this.widgetConfig.userName = this.wmxUsername.get('value');
            
            selectedItem = this.WMXQueriesTree.selectedQuery;
            if (selectedItem == undefined || selectedItem.type != 'query') return false;
            this.widgetConfig.queryId = selectedItem.id; 

            selectedItem = this.getSelectSelectedItem(this.startDateField); 
            if (selectedItem == undefined ||  !this.isValidSelectValue(this.startDateField.get("value"))) return false;
            this.widgetConfig.startDateField = selectedItem;
            
            selectedItem = this.getSelectSelectedItem(this.percentCompleteField); 
            if (selectedItem == undefined ||  !this.isValidSelectValue(this.percentCompleteField.get("value"))) return false;
            this.widgetConfig.percentCompleteField = selectedItem;
            
            selectedItem = this.getSelectSelectedItem(this.dueDateField); 
            if (selectedItem == undefined ||  !this.isValidSelectValue(this.dueDateField.get("value"))) return false;
            this.widgetConfig.dueDateField = selectedItem;

            this.widgetConfig.addMapIntegration = false;            
            if (this.isValidSelectValue(this.datasourceId.get("value"))) {
              this.widgetConfig.addMapIntegration = true;
              selectedItem = this.getSelectSelectedItem(this.datasourceId);
              if (selectedItem == undefined || !this.isValidSelectValue(this.datasourceId.get("value"))) return false;
              this.widgetConfig.datasourceId = selectedItem;  
            }          
            return true;
          },

          unValidateConfig: function() {           
            this.readyToPersistConfig(false);
          },
                
          validateConfig: function () {
            this.readyToPersistConfig(this.captureWidgetConfig());
          },

          onWMXQueryDropDownChanged: function(data){
            if (data != undefined && data.type == 'query'){              
              this.fillFieldNames(data.id);
              return;
             }  
             this.unValidateConfig();
          },

          onWMXQueryDropDownErrored: function(error){
            this.setConnectionStatus(false, error);
            this.unValidateConfig();
          },

           onWMXQueryDropDownLoaded: function(){
            if (this.widgetConfig.queryId != undefined) {                
                this.fillFieldNames(this.widgetConfig.queryId);
                this.WMXQueriesTree.setSelectedQuery(this.widgetConfig.queryId);                
              }
            this.setConnectionStatus(true);  
          },

          
          onWMXUrlChange: function(){           
            this.validateConfig()
          },

          onWMXUsernameChange: function(){            
            this.validateConfig()
          },

          onChangeWMXConnection: function(event){            
            this.validateConfig();
            this.setQueryTabStatus(false);
            this.setApperanceTabStatus(false);
            this.widgetConfig.connectionTested = false;
            this.initQueryTab();
          },

          onDatasourceIdChange: function(){
            this.validateConfig(); 
          },

          onStartDateFieldChange: function(){
            this.validateConfig();   
          },

          onDueDateFieldChange: function(){
            this.validateConfig();            
          },

          onPercentCompleteFieldChange: function(){
            this.validateConfig();             
          },

          adjustOnScheduleSymbolColor:function(){
            this.onSchedule_spw.symbolFillColor = this.widgetConfig.chartConfig.onscheduleColor;
            this.onSchedule_spw.refresh();
            this.onScheduleIndicator.fill_color = this.widgetConfig.chartConfig.onscheduleColor;
            this.onScheduleIndicator.showChart();
          },

          adjustOnScheduleSymbolStyle:function(){
            this.onScheduleIndicator.symbolStyle = this.widgetConfig.chartConfig.onscheduleSymbolStyle;       
            this.onScheduleIndicator.showChart();
          },

          onOnScheduleColorChange: function(color){
            this.widgetConfig.chartConfig.onscheduleColor = color;   
            this.adjustOnScheduleSymbolColor();         
            this.validateConfig();
          },

          onOnSchedule_spwChange: function(){ 
            this.widgetConfig.chartConfig.onscheduleSymbolStyle = this.onSchedule_spw.selectedSymbol;
            this.adjustOnScheduleSymbolStyle();
            this.validateConfig();
            
          },

          adjustBehindScheduleSymbolColor: function(){
            this.behindSchedule_spw.symbolFillColor = this.widgetConfig.chartConfig.behindScheduleColor;
            this.behindSchedule_spw.refresh();
            this.behindScheduleIndicator.fill_color = this.widgetConfig.chartConfig.behindScheduleColor;
            this.behindScheduleIndicator.showChart();
          },

          adjustBehindScheduleSymbolStyle: function(){
            this.behindScheduleIndicator.symbolStyle = this.widgetConfig.chartConfig.behindSceduleSymbolStyle;       
            this.behindScheduleIndicator.showChart();
          },

          onBehindScheduleColorChange: function(color){
            this.widgetConfig.chartConfig.behindScheduleColor = color;
            this.adjustBehindScheduleSymbolColor();
            this.validateConfig();
          },
               
          onOnbehindSchedule_spwChange: function(){
            this.widgetConfig.chartConfig.behindSceduleSymbolStyle = this.behindSchedule_spw.selectedSymbol;
            this.adjustBehindScheduleSymbolStyle();
            this.validateConfig();
          },

          adjustOverdueSymbolColor: function(){
            this.overdue_spw.symbolFillColor = this.widgetConfig.chartConfig.overdueScheduleColor;
            this.overdue_spw.refresh();
            this.overdueIndicator.fill_color = this.widgetConfig.chartConfig.overdueScheduleColor;
            this.overdueIndicator.showChart();
          },

          adjustOverdueSymbolStyle: function(){
            this.overdueIndicator.symbolStyle = this.widgetConfig.chartConfig.overdueScheduleSymbolStyle;
            this.overdueIndicator.showChart();
          },

          onOverdue_spwChange: function(){
            this.widgetConfig.chartConfig.overdueScheduleSymbolStyle = this.overdue_spw.selectedSymbol;       
            this.adjustOverdueSymbolStyle();
            this.validateConfig();
          },

          onOverdueColorChange: function(color){
            this.widgetConfig.chartConfig.overdueScheduleColor = color;
            this.adjustOverdueSymbolColor();
            this.validateConfig();
          },

          onIsPercentageCBClick: function(event){
            this.widgetConfig.chartConfig.is_percentage = event.currentTarget.checked
            if (this.widgetConfig.chartConfig.is_percentage){
              this.onScheduleIndicator.indicator = '[value%]';
              this.onScheduleIndicator.showChart();            
              this.behindScheduleIndicator.indicator = '[value%]'
              this.behindScheduleIndicator.showChart(); 
              this.overdueIndicator.indicator = '[value%]'
              this.overdueIndicator.showChart();   
            } else {
              this.onScheduleIndicator.indicator = '[value]';
              this.onScheduleIndicator.showChart();            
              this.behindScheduleIndicator.indicator = '[value]'
              this.behindScheduleIndicator.showChart(); 
              this.overdueIndicator.indicator = '[value]'
              this.overdueIndicator.showChart();   
            }
            
            this.validateConfig(); 
          },
       
          fillFieldNames: function(queryId) {
            this.resetSelectStore(this.dueDateField);
            this.resetSelectStore(this.startDateField);
            this.resetSelectStore(this.percentCompleteField);
            this.resetSelectStore(this.datasourceId);
            var self = lang.hitch(this);
            var request = new WMXRequest({url:this.widgetConfig.wmxUrl});
            request.runQuery(queryId,
                this.widgetConfig.userName,
                function(data){                   
                  var dateFields = [];
                  data.fields.forEach(function(field) {
                      if (field.type == WMXEnum.DATE_DATATYPE) {
                        dateFields.push(field);
                      }
                  });                  
                  self.setSelectStore(self.dueDateField, dateFields,"name","alias", (self.widgetConfig.dueDateField != undefined)? self.widgetConfig.dueDateField.name:"");                   
                  self.setSelectStore(self.startDateField,dateFields,"name","alias", (self.widgetConfig.startDateField != undefined)? self.widgetConfig.startDateField.name:""); 
                  var numberFields = [];
                  data.fields.forEach(function(field) {
                      if (field.type == WMXEnum.SHORT_DATATYPE ||
                          field.type == WMXEnum.LONG_DATATYPE ||
                          field.type == WMXEnum.DOUBLE_DATATYPE) {
                        numberFields.push(field);
                      }
                  });
                  self.setSelectStore(self.percentCompleteField,numberFields,"name","alias", (self.widgetConfig.percentCompleteField != undefined)? self.widgetConfig.percentCompleteField.name: "" ); 
                  var objectIdsFields = [];
                  var firstItem = {name: self.defaultSelectValuesStore[0].value, alias: self.defaultSelectValuesStore[0].label+ 'None'};
                  objectIdsFields.push(firstItem);
                  data.fields.forEach(function(field) {
                      if (field.type ==  WMXEnum.OBJECTID_DATATYPE) {
                         objectIdsFields.push(field);
                      }
                  });  
                  if (self.widgetConfig.addMapIntegration){
                    self.setSelectStore(self.datasourceId,objectIdsFields,"name","alias",(self.widgetConfig.datasourceId != undefined)? self.widgetConfig.datasourceId.name: ""); 
                  } else {
                    self.setSelectStore(self.datasourceId,objectIdsFields,"name","alias", ' None');   
                  }
                  self.setConnectionStatus(true); 
                },function(error){
                  self.widgetConfig.connectionTested = false;
                  console.log(error.message);
                  self.setConnectionStatus(false, error.message);  
             });
          }            
    	  });
});