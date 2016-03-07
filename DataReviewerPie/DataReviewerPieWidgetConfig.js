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
  "dijit/registry",
  "dijit/layout/TabContainer",
  "dijit/layout/ContentPane", 
  "dijit/layout/BorderContainer",
  "dijit/form/RadioButton", 
  "dijit/form/Select", 
  "dijit/form/TextBox",
  "dijit/form/ValidationTextBox",
  "dojox/validate/regexp",
  "dojox/form/BusyButton",
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  "dijit/_WidgetsInTemplateMixin",
  "dojo/text!./DataReviewerPieWidgetConfigTemplate.html",
  "dojo/store/Memory",
  "dojo/data/ObjectStore",
  "dojo/data/ItemFileWriteStore",
  "dojox/layout/TableContainer",
  "dojox/grid/DataGrid",
  "esri/opsdashboard/WidgetConfigurationProxy",
  "esri/productiondashboard/PDInit",
  "esri/productiondashboard/DRSRequest",  
  "esri/productiondashboard/D3Charts/D3PieChart",
  "dojo/domReady!" 

], function (declare, 
             lang,
             Dialog,
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
             DRSRequest,             
             PDPieChart
            ){

    return declare("DataReviewerGaugetWidgetConfig", 
    	           [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, WidgetConfigurationProxy],
    	   {

	    		templateString: templateString,
          defaultSelectValuesStore : [
                                      { value: "loading", label: " "}
                                      ],

          emptyDistinctValuesStore : [
               { id: '99', label: "No Values Found"}
          ],    
                            
          widgetConfig: {}, 
          drsRequest: null,
          drsFilters: null, 
       
	    		postCreate: function(){   
	    			this.inherited(arguments);
            /*var h = this.chartPreviewCP.clientHeight  *.88 - 40, w = this.chartPreviewCP.clientWidth  *.88 - 40;
            this.chartPreview.svgHeight = h;
            this.chartPreview.svgWidth = w;            */
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
          
          showErrorDialog: function(errorMsg){
            var errorDialog = new Dialog({
              title: "Error Message",
              style: "width: 300px;",
              content: "<strong>"+errorMsg+"!</strong>"
            });
            errorDialog.show();
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
                    donut_factor :0,
                    placeWedgeLabel: 'onWedgeHover',
                    labelContent:'data&label',
                    select_on_map: false
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
                this.showErrorDialog("Unable to resolve Data Reviewer Service URL");
                this.connectBtn.cancel();
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
                self.connectBtn.cancel();
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

          intializeAppearanceTab: function(){
            var status = (this.widgetConfig.chartConfig.placeWedgeLabel == 'onWedgeHover')
            this.onWedgeHoverRB.set('checked', status);
            this.aroundPieRB.set('checked', !status);
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
                this.showErrorDialog("Invalid entry");
                showConnectionError
                return;
              }
              this.addTofiltersGrid(drsFieldName_item,drsDistinctValues_item);
              this.fetchfiltersGD();
             
            }   
          },

          onPieLabelRBChange: function(event){
            this.widgetConfig.chartConfig.placeWedgeLabel = (event.currentTarget.value == 'hover')? 'onWedgeHover':
                                                            'aroundPie';
            this.previewChart();
            this.validateConfig();
          },

          previewChart : function(){
            //this.chartPreview.container = this.chartPreviewCP;
            this.chartPreview.margin = {top: 0, right: 0, bottom: 0, left: 0},            
            this.chartPreview.donut_factor = this.widgetConfig.chartConfig.donut_factor;
            this.chartPreview.showLabelTotal = this.widgetConfig.chartConfig.showLabelTotal;
            this.chartPreview.placeWedgeLabel = this.widgetConfig.chartConfig.placeWedgeLabel;
            this.chartPreview.labelContent = this.widgetConfig.chartConfig.labelContent;
            this.chartPreview.showChart();          
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