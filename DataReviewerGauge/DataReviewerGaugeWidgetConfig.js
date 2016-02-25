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
  "dojo/dom-style",
  "dijit/ConfirmDialog",
  "dijit/registry",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane", 
  "dijit/layout/BorderContainer",
  "dijit/form/RadioButton", 
  "dijit/form/Select", 
  "dijit/form/TextBox",
  "dijit/form/ValidationTextBox",
  "dojox/validate/regexp",
  "dijit/form/Button",
  "dojox/form/BusyButton",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./DataReviewerGaugeWidgetConfigTemplate.html",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",
  "dojo/data/ItemFileWriteStore",
  "dojox/layout/TableContainer",
  "dojox/grid/DataGrid",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/ColorPickerWidget",
  "esri/productiondashboard/DRSRequest",
  "esri/productiondashboard/PDChartEnum",
  "esri/productiondashboard/PDGaugeChart",
  "dojo/domReady!" 

], function (declare, 
             lang,
             domStyle,
             ConfirmDialog,
             registry,
             TabContainer,
             ContentPane,
             BorderContainer,
             RadioButton,         
             Select,
             TextBox,
             ValidationTextBox,
             regexp,
             Button,
             BusyButton,
             _WidgetBase, 
             _TemplatedMixin, 
             _WidgetsInTemplateMixin,
             templateString,
             Memory,
             ObjectStore,
             ItemFileWriteStore,
             TableContainer,
             DataGrid,            
             WidgetConfigurationProxy, 
             PDInit,
             ColorPickerWidget,
             DRSRequest,
             PDChartEnum,
             PDPieChart
            ){

    return declare("DataReviewerGaugeWidgetConfig", 
    	           [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy],
    	   {

	    		templateString: templateString,
          margin: {top: 05, right: 05, bottom: 05, left: 05},
          defaultSelectValuesStore : [
                                      { value: "loading", label: " "}
                                      ],

          calculationMethodStoreData: [
              {value:PDInit.CALCULATE_BY_MAX , label: "Maximum"},
              {value:PDInit.CALCULATE_BY_MIN , label: "Minimum"},
              {value:PDInit.CALCULATE_BY_AVERAGE, label: "Average"},
              {value:PDInit.CALCULATE_BY_SUM, label: "Sum"}
          ],

          emptyDistinctValuesStore : [
               { id: '99', label: "No Values Found"}
          ],    
                           

          widgetConfig: {}, 
          drsRequest: null,
          drsFilters: null, 
       emptyDistinctValuesStore : [
               { id: '99', label: "No Values Found"}
          ],    

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

          resetSelectStore: function(selectId){
             this.setSelectStore(selectId,this.defaultSelectValuesStore,"value","label");             
          },

          isValidSelectValue: function(value) {
              return (value == undefined)? 
                       false: 
                       !(value.toString().localeCompare(this.defaultSelectValuesStore[0].value) == 0);
          },

          getSelectSelectedItem: function(selectId){
            if ((selectId instanceof Select) && (selectId.store != undefined)) {               
               return selectId.store.objectStore.get(selectId.get("value"));
            }
            return null;
          }, 


          initWidgetConfig: function(currentConfig){
            if (currentConfig == undefined) {            
                this.drsUrl.set('value',PDInit.DRS_SERVICE.url + '/exts/DataReviewerServer'); 
                this.widgetConfig = {
                  drsUrl: this.drsUrl.get('value'),
                  drsVariableValue: null,
                  drsVariableLabel: null,
                  drsFilters: [],
                  chartConfig: {
                    donut_factor            :0.5,
                    style                   : 'half-donut-with-no-pointer',                      
                    minValue                :0,
                    maxValue                :0,
                    calculateValueMethod    :'average',
                    threshold               :0,
                    minAngle                :-90,
                    maxAngle                :90,
                    from_color              :"green",
                    to_color                :"#dfdfdf",
                    thresholdColor          :'#6aa84f',
                    pointerColor            :'red',                
                    showLabels              :false,
                    select_on_map           :false,
                    showThreshold           :false,
                  }
                }
            } else {
              this.widgetConfig = currentConfig;  
              this.drsUrl.set('value',this.widgetConfig.drsUrl);              
             }
             this.dataSourceConfig.widgetConfig = this.widgetConfig;
             this.intializeQueryTab();           
             this.intializeAppearanceTab();    
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
            this.aboveThresholdColorPicker.on('selectedColor', lang.hitch(this,this.aboveThresholdColorChangeEventHandler));
            this.minValueTB.validator = lang.hitch(this,this.minValueValidator);
            this.maxValueTB.validator = lang.hitch(this,this.maxValueValidator);
            this.thresholdTB.validator = lang.hitch(this,this.thresholdTBValidator);            
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
            this.chartPreview.resizeMe();
            this.chartPreviewOverThreshold.resizeMe();
          },
          

          colorChangeEventHandler: function(color){            
            this.widgetConfig.chartConfig.from_color = color;
            this.previewChart();
            this.validateConfig();
          },

          aboveThresholdColorChangeEventHandler: function(color){
            this.widgetConfig.chartConfig.thresholdColor = color;
            this.previewChart();
            this.validateConfig();
          },

          includeThreshold:function(){
            domStyle.set(this.thresholdRow, "visibility", "visible");
            domStyle.set(this.thresholdColorCellValue, "visibility", "visible");            
            domStyle.set(this.thresholdColorCellLabel, "visibility", "visible"); 
            domStyle.set(this.chartPreviewOverThreshold.id, "visibility", "visible");
            this.previewChart();
          },

          removeThreshold:function(){
            domStyle.set(this.thresholdRow, "visibility", "hidden" );
            domStyle.set(this.thresholdColorCellValue, "visibility", "hidden");
            domStyle.set(this.thresholdColorCellLabel, "visibility", "hidden"); 
            domStyle.set(this.chartPreviewOverThreshold.id, "visibility", "hidden");
            this.previewChart();
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

          runDRSQuery: function(){
            var selectedItem = this.drsVariableValue.store.objectStore.get(this.drsVariableValue.get("value"));
            var self = lang.hitch(this);           
            this.drsRequest.getDashboardResults(
                              selectedItem.fieldname,
                              function(data){ 
                                 console.log(data);

                              },
                              function(error){
                                console.log(error.message);
                              },
                              this.drsFilters);
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

          addTofiltersGrid: function(drsFieldname,drsFieldValue){

             this.filtersDG.store.newItem({
                            id: this.getGuid(),                                    
                            drsFieldnameId:drsFieldname.id, 
                            fieldname:drsFieldname.fieldname,
                            fieldvalue:drsFieldValue.item
                          });
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

          onDrsVariableValueChange: function(e){
            if (this.widgetConfig.drsVariableValue.id == e) {
              return;
            }            
            this.filtersDG.destroyRecursive(true);
            this.initializeFiltersGrid(); 
            this.validateConfig();
          },

          onDrsFieldNameChange: function(e){
            var selectedItem = this.drsFieldName.store.objectStore.get(this.drsFieldName.get("value"));
            if (selectedItem) {                  
              this.fillDistinctValues(selectedItem.fieldname);
            }
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

          onMinValueChange: function(e){
            if (e.target.value != '-' && isNaN(e.target.value)) {
              alert('Unvalid value!');
              e.target.value = '';
              return;
            }
            this.widgetConfig.chartConfig.minValue = Number(e.target.value);
            this.validateConfig();
          },

          onMaxValueChange: function(e){
             if (e.target.value != '-' && isNaN(e.target.value)) {
              alert('Unvalid value!');
              e.target.value = '';
              return;
            }
            this.widgetConfig.chartConfig.maxValue = Number(e.target.value);
            this.validateConfig();
          },

          onThresholdChange: function(e){
             if (e.target.value == '-'){
              return;
            }
            if (isNaN(e.target.value)) {
              alert('Unvalid value!');
              e.target.value = '';              
              return;
            }
            var th = Number(e.target.value);
            if (th > Number(this.widgetConfig.chartConfig.maxValue)) {
              alert('Unvalid threshold value!');
              return;
            }
            this.widgetConfig.chartConfig.threshold = Number(e.target.value);
            this.validateConfig();
          },

          onShowLabelsClick: function(e){
            this.widgetConfig.chartConfig.showLabels = e.currentTarget.checked;
            this.previewChart();
            this.validateConfig();
          },

          previewChart : function(){
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

          onDrsUrlChange: function(e){
            this.validateConfig();
          },

          onChangeDRSConnection: function(){
            this.widgetConfig.drsUrl = this.drsUrl.get('value');
            this.intializeQueryTab();            
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