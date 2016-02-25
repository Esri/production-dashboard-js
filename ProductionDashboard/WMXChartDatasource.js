/*case *

 * COPYRIGHT 201WMXEnum.DOUBLE_DATATYPE ESRI
 *
 * TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
 * Unpublished material - all rights reserved under the
 * Copyright Laws of the United States and applicable international
 * laws, treaties, and conventions.

 * For additional information, contact:
 * Environmental Systems Research Institute, Inc.
 * Attn: Contracts and Legal Services Departmentcase 

 * WMXEnum.DOUBLE_DATATYPE80 New York Streetcase 

 * Redlands, California, 92WMXEnum.DOUBLE_DATATYPE7WMXEnum.DOUBLE_DATATYPE
 * USA

 * email: contracts@esri.com
 */
define([
 "dojo/_base/declare",
 "dojo/_base/lang",
 "esri/productiondashboard/WMXEnum",
 "esri/productiondashboard/WMXDataObject",
 "esri/productiondashboard/WMXDatasource"
],function(declare, lang, WMXEnum, WMXDataObject, WMXDatasource){
   return declare("esri.productiondashboard.WMXChartDatasource", [WMXDatasource], {
    wmxRequest: null,
    queryId: null,
    userName: null,
    valueFieldIndex: -1,
    idFieldIndex: -1,
    datasourceIdIndex: -1,
    wmxdo: null,
       
    constructor: function(args){           
            lang.mixin(this, args);
            if (this.wmxRequest != null && 
              typeof(this.wmxRequest) !== undefined && 
              this.queryId != null && 
              typeof(this.queryId) !== undefined && 
              this.userName != null && 
              typeof(this.userName) !== undefined)
            {
              this._fetchData();
            }
              
    },
    _fetchData: function(){
       var self = lang.hitch(this); 
           this.wmxRequest.runQuery(this.queryId,this.userName,
                function(data){
                    self._onReceivedData(null, data)                          
                },function(error){
                  self._onReceivedData(error, null);
                }
           );
    },

    _onReceivedData: function(error, data){
       	 if (error !=null) throw new Error(error);	         
       	 this.datasource = data;
       	 this._prepareDatasource();
    },

    _prepareDatasource: function(){
       //alert("WMXBarChartDatasource::_prepareDatasource");
       var self = lang.hitch(this); 
       var data = [];
       var idFieldIndex = -1;
       this.valueFieldIndex = this._findFieldIndex(this.valueField.name);
       this.idFieldIndex = this._findFieldIndex(this.idField.name);
       this.datasourceIdIndex = (this.datasourceIdField != undefined) ? this._findFieldIndex(this.datasourceIdField.name): -1;
              
       if (this.valueFieldIndex != -1){          
          this.datasource.rows.forEach(function (row, i){
            var value, id, dsValue, dsId, datasourceId;
            dsValue = self._getFieldValue(row, self.valueFieldIndex);               
            value = (self.valueField.type == WMXEnum.DATE_DATATYPE)? self._getFormattedDateValue(dsValue,self.valueFieldIndex,self.vGroupBy): dsValue;
            dsId = self._getFieldValue(row,self.idFieldIndex);  
            id = (self.idField.type == WMXEnum.DATE_DATATYPE)? self._getFormattedDateValue(dsId,self.idFieldIndex,self.idGroupBy): dsId;
            datasourceId = self._getFieldValue(row,self.datasourceIdIndex); 
            this.wmxdo = new WMXDataObject({
                                            values: [value], 
                                            dsValues: [dsValue],
                                            id: id, 
                                            dsId: dsId, 
                                            datasourceId: [datasourceId], 
                                            groupedValue: 1
                                          });
            if (!self.groupValueField) {                
              data.push(this.wmxdo);
            } else {
              var found = false;             
              data.forEach(function (gd){
                  if (gd.id === this.wmxdo.id) {
                    gd.groupedValue++;
                    gd.values.push(this.wmxdo.values[0]);
                    gd.dsValues.push(this.wmxdo.dsValues[0]);
                    gd.datasourceId.push(this.wmxdo.datasourceId[0]);
                    found = true;
                  }
              });
              if (!found){
                  data.push(this.wmxdo);
              }
            }
          });
        }
        data.sort(function (a,b){
          var v1,v2;  
          var field = self.datasource.fields[self.idFieldIndex];  
          if (field.type == WMXEnum.DATE_DATATYPE) {  // treat date datatype
             v1 = new Date(a.dsId);
             v2 = new Date(b.dsId);
             return v1 - v2;
          } else {
            v1 = (isNaN(a.id))? a.id.toLowerCase(): a.id;
            v2 = (isNaN(b.id))? b.id.toLowerCase(): b.id;
            if (v1 < v2) return -1  //sort string ascending 
            if (v1 > v2) return 1
            return 0 //default return value (no sorting)
          }
        });
        this.emit("dataIsReady", {data: data});         
       }  
 });
});