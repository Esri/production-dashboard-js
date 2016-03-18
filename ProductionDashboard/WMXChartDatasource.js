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
            if (id != undefined && value != undefined){
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