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
  "dojo/dom-style",
  "dijit/layout/BorderContainer",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane",
  "dijit/form/ValidationTextBox",
  "dojox/validate/regexp",
  "dijit/form/Select",
  "dijit/form/CheckBox",
  "dojox/form/BusyButton",
  "dojox/layout/TableContainer",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",  
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "dojo/text!./WorkflowManagerGaugeWidgetConfigTemplate.html",
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/WMXEnum",
  "esri/productiondashboard/WMXRequest",
  "esri/productiondashboard/WMXChartDatasource",
  "esri/productiondashboard/ColorPickerWidget",
  "esri/productiondashboard/WMXQueriesWidget",
  "esri/productiondashboard/D3Charts/D3GaugeChart",
  "dojo/domReady!"  
], function (declare, 
             lang,
             Dialog,
             domStyle,
             BorderContainer,
             TabContainer,
             ContentPane,
             ValidationTextBox,
             regexp,
             Select,
             CheckBox,
             Button,
             TableContainer,
             Memory,
             ObjectStore,
             _WidgetBase, 
             _TemplatedMixin, 
             _WidgetsInTemplateMixin, 
             WidgetConfigurationProxy, 
             templateString,
             PDInit,
             WMXEnum,
             WMXRequest,
             WMXDatasource,
             ColorPickerWidget,
             WMXQueriesWidget,            
             pdChartPreview
             ){

    return declare("WorkflowManagerGaugeWidgetConfig", 
    	           [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy],
    	   {

	    		templateString: templateString,         
          widgetConfig: {},
          margin: {top: 05, right: 05, bottom: 05, left: 05},

          defaultSelectValuesStore : [
          { value: "loading", label: " "}],          

          calculationMethodStoreData: [
              {value:PDInit.CALCULATE_BY_COUNT, label: "Count"},
              {value:PDInit.CALCULATE_BY_AVERAGE, label: "Average"}
          ],

         
          postCreate: function(){            
            this.inherited(arguments);           
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
                    container               :null,
                    containerId             :null,
                    addDataGroupping        :false,
                    queryId                 :null,
                    valueField              :null,                  
                    groupByField            :null,  
                    datasourceId            :null,               
                    groupValueField         :true,                                    
                    idGroupBy               :null,
                    vGroupBy                :null,
                    method                  :'average',
                    addMapIntegration       :false,
                    chartConfig             :{
                      donut_factor            :0.5,
                      style                   : 'half-donut-with-no-pointer',  
                      minValue                :0,
                      maxValue                :0,
                      calculateValueMethod    :'average',
                      threshold               :0,
                      minAngle                :-90,
                      maxAngle                :90,                    
                      from_color              :"#f90",
                      to_color                :"#f90",                      
                      thresholdColor          :"#545454",                      
                      select_on_map           :false,
                      showLabels              :false,
                      showThreshold           :false
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
              var request = new WMXRequest({url:this.widgetConfig.wmxUrl, proxyURL: PDInit.WmxProxy});
              this.WMXQueriesTree.wmxRequest = request;
              this.WMXQueriesTree.load();                        
            }
          },

          intializeAppearanceTab: function(){
            this.minValueTB.set('value', Number(this.widgetConfig.chartConfig.minValue));
            this.maxValueTB.set('value', Number(this.widgetConfig.chartConfig.maxValue));
            this.thresholdTB.set('value',Number(this.widgetConfig.chartConfig.threshold));
            this.showLabelCB.set('checked',this.widgetConfig.chartConfig.showLabels);
            this.includeThresholdValueCB.set('checked',this.widgetConfig.chartConfig.showThreshold);
            if (this.widgetConfig.chartConfig.showThreshold){
              this.includeThreshold();
            } else {
              this.removeThreshold();
            }
            this.setSelectStore(this.calculationMethod,this.calculationMethodStoreData,"value", "label", this.widgetConfig.method);
            this.colorPicker.setSelectedSwatchColor(this.widgetConfig.chartConfig.from_color);
            this.colorPicker.on('selectedColor', lang.hitch(this,this.colorChangeEventHandler));
            this.aboveThresholdColorPicker.setSelectedSwatchColor(this.widgetConfig.chartConfig.thresholdColor);
            this.aboveThresholdColorPicker.on('selectedColor', lang.hitch(this,this.aboveThresholdColorChangeEvent));
            this.minValueTB.validator = lang.hitch(this,this.minValueValidator);
            this.maxValueTB.validator = lang.hitch(this,this.maxValueValidator);
            this.thresholdTB.validator = lang.hitch(this,this.thresholdTBValidator);

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
              // persist                  
              this.validateConfig();   
            } else {             
              if (!this.widgetConfig.connectionTested){
                this.showConnectionError(errorMsg);
                this.widgetConfig.connectionTested = true;
              }
            }
          },
          
          minValueValidator : function(value){
           if (isNaN(value)) {
              return false;
           }
           this.widgetConfig.chartConfig.minValue = Number(value);
           this.validateConfig(); 
           return true;
          },

          maxValueValidator: function(value) {
           if (isNaN(value)) {
              return false;
           }
           this.widgetConfig.chartConfig.maxValue = Number(value);
           this.validateConfig(); 
           return true;
          },

          thresholdTBValidator: function(value){
            if (isNaN(value)) {
                return false;
             }                           
             this.widgetConfig.chartConfig.threshold = Number(value);             
             this.validateConfig(); 
             return true;
          },

          onAppearanceTabShow: function(){
            this.chartPreview.showChart();
            this.chartPreviewOverThreshold.showChart();
          },
          
          colorChangeEventHandler: function(color){            
            this.widgetConfig.chartConfig.from_color = color;
            this.previewChart();
            this.validateConfig();
          },
          
          aboveThresholdColorChangeEvent: function(color){
            this.widgetConfig.chartConfig.thresholdColor = color;
            this.previewChart();
            this.validateConfig();
          },

          includeThreshold:function(){
            domStyle.set(this.thresholdRow, "visibility", "visible");
            domStyle.set(this.thresholdColorCellValue, "visibility", "visible");
            domStyle.set(this.thresholdColorCellLabel, "visibility", "visible");             
            domStyle.set(this.chartPreviewOverThreshold.id, "visibility", "visible");
            //this.chartPreviewOverThreshold.showChart();
            this.previewChart();
          },

          removeThreshold:function(){
            domStyle.set(this.thresholdRow, "visibility", "hidden" );
            domStyle.set(this.thresholdColorCellValue, "visibility", "hidden");
            domStyle.set(this.thresholdColorCellLabel, "visibility", "hidden"); 
            domStyle.set(this.chartPreviewOverThreshold.id, "visibility", "hidden");
            //this.chartPreviewOverThreshold.clearContent();
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
              
            selectedItem = this.getSelectSelectedItem(this.calculationMethod);
            if (selectedItem == undefined || !this.isValidSelectValue(this.calculationMethod.get("value"))) return false;
            this.widgetConfig.method = selectedItem.value;

            var max = Number(this.widgetConfig.chartConfig.maxValue), 
                min = Number(this.widgetConfig.chartConfig.minValue);            
                threshold = Number(this.widgetConfig.chartConfig.threshold);
            if (max<=min) 
              return false;

            if (this.widgetConfig.chartConfig.showThreshold && (threshold > max || threshold < min)) 
              return false;            


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
            this.validateConfig();
          },

          onWMXUsernameChange: function(){            
            this.validateConfig();
          },

          onCalculationMethodChange: function(){
             this.validateConfig(); 
          },

          onIncludeThresholdValueChange:function(e){
            this.widgetConfig.chartConfig.showThreshold = e.currentTarget.checked;
            this.validateConfig();
            if (this.widgetConfig.chartConfig.showThreshold)
               this.includeThreshold();
            else 
               this.removeThreshold(); 
          },

          onShowLabelsClick: function(e){
            this.widgetConfig.chartConfig.showLabels = e.currentTarget.checked;
            this.previewChart();
            this.validateConfig();
          },

          previewChart: function(){
            
            this.chartPreview.symbolStyle = this.chartPreviewOverThreshold.symbolStyle = this.widgetConfig.chartConfig.style;
            this.chartPreview.margin =  this.chartPreviewOverThreshold.margin = this.margin;
            this.chartPreview.mode = this.chartPreviewOverThreshold.mode = 'icon';     
            this.chartPreview.donut_factor = this.chartPreviewOverThreshold.donut_factor = this.widgetConfig.chartConfig.donut_factor;
            this.chartPreview.minAngle = this.chartPreviewOverThreshold.minAngle = this.widgetConfig.chartConfig.minAngle;
            this.chartPreview.maxAngle = this.chartPreviewOverThreshold.maxAngle = this.widgetConfig.chartConfig.maxAngle;
            this.chartPreview.startColor = this.widgetConfig.chartConfig.from_color;
            this.chartPreviewOverThreshold.startColor = this.widgetConfig.chartConfig.thresholdColor;            
            this.chartPreview.showLabels =  this.chartPreviewOverThreshold.showLabels = this.widgetConfig.chartConfig.showLabels;
            this.chartPreview.showThreshold = this.chartPreviewOverThreshold.showThreshold = this.widgetConfig.chartConfig.showThreshold;
            this.chartPreviewOverThreshold.data = [{d:80}];
            this.chartPreview.showChart();
            this.chartPreviewOverThreshold.showChart();
          },

          onValueFieldChange: function(){            
            this.validateConfig();
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
            var self = lang.hitch(this);            
            var request = new WMXRequest({url:this.widgetConfig.wmxUrl, proxyURL: PDInit.WmxProxy});
            request.runQuery(queryId,
                this.widgetConfig.userName,
                function(data){
                  var dataFields = [],dateFields = [], objectIdFields = [];
                  data.fields.forEach(function(field) {
                      if (field.type == WMXEnum.SHORT_DATATYPE || 
                          field.type == WMXEnum.DOUBLE_DATATYPE ||
                          field.type == WMXEnum.LONG_DATATYPE) {
                        dataFields.push(field);
                      }
                  });                                          
                  self.setSelectStore(self.valueField, dataFields,"name","alias",(self.widgetConfig.valueField != undefined)?self.widgetConfig.valueField.name: "");                                                 
                  self.setConnectionStatus(true);  
                },function(error){
                  console.log(error.message);  
                  self.widgetConfig.connectionTested = false;
                  self.setConnectionStatus(false, error.message);  
             });        
          }

  });
});