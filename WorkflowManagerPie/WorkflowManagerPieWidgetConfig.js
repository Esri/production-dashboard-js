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
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane",
  "dijit/form/Select",
  "dijit/form/TextBox",
  "dijit/form/ValidationTextBox",
  "dojox/validate/regexp",
  "dijit/form/RadioButton",
  "dijit/form/NumberSpinner",
  "dijit/form/HorizontalSlider",
  "dijit/form/HorizontalRuleLabels",
  "dijit/form/HorizontalRule",
  "dijit/form/CheckBox",
  "dojox/form/BusyButton",
  "dojox/layout/TableContainer",
  "dojo/on",
  "dojo/fx/Toggler",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",  
  "dojo/json",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "dojo/text!./WorkflowManagerPieWidgetConfigTemplate.html",
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/WMXEnum",
  "esri/productiondashboard/WMXRequest",
  "esri/productiondashboard/WMXQueriesWidget",
  "esri/productiondashboard/ColorRampPickerWidget", 
  "esri/productiondashboard/D3Charts/D3PieChart",
  "dojo/domReady!"  
], function (declare, 
             lang,
             Dialog,
             BorderContainer,
             TabContainer,
             ContentPane,
             Select,
             TextBox,
             ValidationTextBox,
             regexp,
             RadioButton,
             NumberSpinner,
             HorizontalSlider,
             HorizontalRuleLabels,
             HorizontalRule, 
             CheckBox,
             Button,
             TableContainer,
             on,
             Toggler,
             Memory,
             ObjectStore,
             json, 
             _WidgetBase, 
             _TemplatedMixin, 
             _WidgetsInTemplateMixin, 
             WidgetConfigurationProxy, 
             templateString,
             PDInit,
             WMXEnum,
             WMXRequest,
             WMXQueriesWidget,
             ColorRampPickerWidget,           
             pdChartPreview
             ){

    return declare("WorkflowManagerPieWidgetConfig", 
    	           [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy],
    	   {

	    		templateString: templateString,
          margin : {top: 10, right: 10, bottom: 10, left: 10},
          widgetConfig: {},
          defaultSelectValuesStore : [
                             { value: "loading", label: " "}],          

          groupDateByStoreData: [
              {value:PDInit.GROUP_BY_DAY, label: "Day"},
              {value:PDInit.GROUP_BY_MONTH, label: "Month"},
              {value:PDInit.GROUP_BY_YEAR, label: "Year"}
          ],

           calculationMethodStoreData: [
              {value:PDInit.CALCULATE_BY_SUM, label: "Sum"},
              {value:PDInit.CALCULATE_BY_AVERAGE, label: "Average"},
              {value:PDInit.CALCULATE_BY_COUNT, label: "Count"}
          ],
          gGroupDateByToggler:  null,              
          gGroupDateBylabelToggler: null,
          vGroupDateByToggler:  null,              
          vGroupDateBylabelToggler: null,
 

          postCreate: function(){            
            this.inherited(arguments);            
            this.enablevGroupDate(false);
            this.enablegGroupeDate(false);
          },

          dataSourceSelectionChanged: function (dataSourceProxy, dataSourceConfig) {            
            this.dataSourceConfig = dataSourceConfig;                        
            this.initWidgetConfig(this.dataSourceConfig.widgetConfig);
          },


          initWidgetConfig: function(currentConfig){             
             
            if (currentConfig == undefined) {
              this.wmxUrl.set('value',PDInit.WMX_SERVICE.url);   
              this.wmxUsername.set('value',PDInit.WMX_SERVICE.username);

              this.widgetConfig = {
                 wmxUrl                  :this.wmxUrl.get('value'),
                 userName                :this.wmxUsername.get('value'),
                 connectionTested        :false, // values : true for life/ false for broken;
                 queryId                 :null,
                 valueField              :null,                  
                 groupByField            :null,  
                 datasourceId            :null,               
                 groupValueField         :false,                                    
                 idGroupBy               :null,
                 vGroupBy                :null,
                 method                  :PDInit.CALCULATE_BY_COUNT,
                 addMapIntegration       :false,
                 addDataGroupping        :true,
                 chartConfig             :{
                  donut_factor              :0,
                  showLabelTotal            :false,
                  useColorRamp              : true,
                  colorRamp                 :[],
                  placeWedgeLabel           :'onWedgeHover',
                  labelContent              :'data&label'
                }
              }
            } else {
              this.widgetConfig.connectionTested = false;
              this.widgetConfig = currentConfig;  
              this.wmxUrl.set('value',this.widgetConfig.wmxUrl);
              this.wmxUsername.set('value',this.widgetConfig.userName);              
            }
            this.WMXQueriesTree.on('selected', lang.hitch(this, this.onWMXQueryDropDownChanged));
            this.WMXQueriesTree.on('error', lang.hitch(this, this.onWMXQueryDropDownErrored));
            this.WMXQueriesTree.on('loaded', lang.hitch(this, this.onWMXQueryDropDownLoaded));   
            this.intializeAppearanceTab();
            this.initQueryTab();
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
            var status = (this.widgetConfig.chartConfig.placeWedgeLabel == 'onWedgeHover')
            this.onWedgeHoverRB.set('checked', Boolean(status));
            this.aroundPieRB.set('checked', !Boolean(status));  
            this.crpw.on('selectedColorRamp',lang.hitch(this,this.colorRampChangeEventHandler));
            this.widgetConfig.chartConfig.colorRamp = this.crpw.getSelectedColorRamp();
            this.previewChart();                 
          },

           colorRampChangeEventHandler: function(colorRamp){            
            this.widgetConfig.chartConfig.colorRamp = colorRamp;
            this.validateConfig();
            this.previewChart();
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
              this.validateConfig();   
            } else {             
              if (!this.widgetConfig.connectionTested){
                this.showConnectionError(errorMsg);
                this.widgetConfig.connectionTested = true;
              }
            }
          },
          
          enablegGroupeDate: function(status){
            this.gGroupDateBy.set('disabled', !status);           
          },

          enablevGroupDate: function(status){
            this.vGroupDateBy.set('disabled', !status);         
          },

          enableValueField: function(status){
            this.valueField.set('disabled', !status);
          },

          checkgroupDateBystatus: function(){
            var selectedItem = this.getSelectSelectedItem(this.groupByField);
            if (selectedItem) {
                this.enablegGroupeDate((selectedItem.type == WMXEnum.DATE_DATATYPE));            
            }
            selectedItem = this.getSelectSelectedItem(this.valueField);  
            if (selectedItem) {
              this.enablevGroupDate((selectedItem.type == WMXEnum.DATE_DATATYPE));                          
            }
          },

           checkValueFieldStatus: function(){
            var selectedItem = this.getSelectSelectedItem(this.calculationMethod);
            if (selectedItem) {
              this.enableValueField((selectedItem.value != PDInit.CALCULATE_BY_COUNT));                          
            }
          },
 
          captureWidgetConfig: function() {

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

            selectedItem = this.getSelectSelectedItem(this.valueField);
            if (selectedItem == undefined || !this.isValidSelectValue(this.valueField.get("value"))) return false;
            this.widgetConfig.valueField = selectedItem;

            selectedItem = this.getSelectSelectedItem(this.groupByField);
            if (selectedItem == undefined || !this.isValidSelectValue(this.groupByField.get("value"))) return false;
            this.widgetConfig.groupByField = selectedItem;

            selectedItem  = this.getSelectSelectedItem(this.calculationMethod);
            if (selectedItem == undefined || !this.isValidSelectValue(this.calculationMethod.get("value"))) return false;
            this.widgetConfig.method = selectedItem.value;

            this.widgetConfig.addMapIntegration = false;
            if (this.isValidSelectValue(this.datasourceId.get("value"))) {
              this.widgetConfig.addMapIntegration = true;
              selectedItem = this.getSelectSelectedItem(this.datasourceId);
              if (selectedItem == undefined || !this.isValidSelectValue(this.datasourceId.get("value"))) return false;
              this.widgetConfig.datasourceId = selectedItem;  
            }
     
            return true;
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

          getSelectSelectedItem: function(selectId){
            if (selectId instanceof Select && selectId.store != undefined) {               
               return selectId.store.objectStore.get(selectId.get("value"));
            }
            return null;
          }, 

          isValidSelectValue: function(value) {
            return (value == undefined)? 
                    false: 
                    !(value.toString().localeCompare(this.defaultSelectValuesStore[0].value) == 0);
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
            this.setSelectStore(this.gGroupDateBy,this.groupDateByStoreData,"value","label",this.widgetConfig.idGroupBy);
            this.setSelectStore(this.vGroupDateBy,this.groupDateByStoreData,"value","label",this.widgetConfig.vGroupBy);
            this.setSelectStore(this.calculationMethod,this.calculationMethodStoreData,"value","label",this.widgetConfig.method); 
            this.setConnectionStatus(true);  
          },

          onWMXUrlChange: function(){            
            this.validateConfig()
          },

          onPieLabelRBChange: function(event){
            this.widgetConfig.chartConfig.placeWedgeLabel = (event.currentTarget.value == 'hover')? 'onWedgeHover':
                                                            'aroundPie';
            this.previewChart();
            this.validateConfig();
          },

          previewChart : function(){            
            this.chartPreview.margin = this.margin;
            this.chartPreview.donut_factor = this.widgetConfig.chartConfig.donut_factor;
            this.chartPreview.showLabelTotal = this.widgetConfig.chartConfig.showLabelTotal;
            this.chartPreview.placeWedgeLabel = this.widgetConfig.chartConfig.placeWedgeLabel;
            this.chartPreview.labelContent = this.widgetConfig.chartConfig.labelContent;
            this.chartPreview.useColorRamp =  this.widgetConfig.chartConfig.useColorRamp;
            this.chartPreview.colorRamp = this.widgetConfig.chartConfig.colorRamp;
            this.chartPreview.showChart();          
          },

          onValueFieldChange: function(){
            this.checkgroupDateBystatus()              
            this.validateConfig();
          },

          onVgroupDateByChange: function(){
             this.validateConfig(); 
          },

          onGroupByFieldChange: function(){
            this.checkgroupDateBystatus()           
            this.validateConfig();
          },

          onVgroupDateByChange: function(){
             this.validateConfig(); 
          },

          onGgroupDateByChange: function(){
             this.validateConfig(); 
          },

          onCalculationMethodChange: function(){
            this.checkValueFieldStatus();
             this.validateConfig(); 
          },

          onDatasourceIdChange:function(){
             this.validateConfig(); 
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

          fillFieldNames: function(queryId) {            
            this.resetSelectStore(this.valueField);
            this.resetSelectStore(this.groupByField);
            this.resetSelectStore(this.datasourceId);            
            var self = lang.hitch(this);            
            var request = new WMXRequest({url:this.widgetConfig.wmxUrl});
            request.runQuery(queryId,
                this.widgetConfig.userName,
                function(data){ 
                  var dateFields = [];
                  data.fields.forEach(function(field) {
                      if (field.type == WMXEnum.SHORT_DATATYPE || 
                          field.type == WMXEnum.LONG_DATATYPE ||
                          field.type == WMXEnum.DATE_DATATYPE ||
                          field.type == WMXEnum.DOUBLE_DATATYPE) {
                        dateFields.push(field);
                      }
                  });                                          
                  self.setSelectStore(self.valueField, dateFields,"name","alias",(self.widgetConfig.valueField != undefined)?self.widgetConfig.valueField.name: "");                   
                  dateFields = [];
                  data.fields.forEach(function(field) {
                      if (field.type !=  WMXEnum.OBJECTID_DATATYPE) {
                         dateFields.push(field);
                      }
                  });  
                  self.setSelectStore(self.groupByField,dateFields,"name","alias",(self.widgetConfig.groupByField != undefined)? self.widgetConfig.groupByField.name: ""); 
                  ObjectIDFields = [];
                  var firstItem = {name: self.defaultSelectValuesStore[0].value, alias: self.defaultSelectValuesStore[0].label+ 'None'};
                  ObjectIDFields.push(firstItem);
                  data.fields.forEach(function(field) {
                      if (field.type ==  WMXEnum.OBJECTID_DATATYPE) {
                         ObjectIDFields.push(field);
                      }
                  });
                  if (self.widgetConfig.addMapIntegration){
                    self.setSelectStore(self.datasourceId,ObjectIDFields,"name","alias",(self.widgetConfig.datasourceId != undefined)? self.widgetConfig.datasourceId.name: ""); 
                  } else {
                    self.setSelectStore(self.datasourceId,ObjectIDFields,"name","alias", " None"); 
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