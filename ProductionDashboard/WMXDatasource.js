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
  "dojo/Evented",
  "esri/productiondashboard/WMXEnum",
  "esri/productiondashboard/WMXDataObject"
],function(declare, lang, Evented, WMXEnum, WMXDataObject){
	return declare("esri.productiondashboard.WMXDatasource",[Evented], {
		datasource : null,
    
    constructor: function(args){
      lang.mixin(this, args);
    },

 	  _findFieldIndex: function(fieldname){
      var valueFieldIndex = -1;
      if (this.datasource == undefined) return valueFieldIndex;
      this.datasource.fields.forEach(function(field, i){
         if (field.name.toString().localeCompare(fieldname) == 0) {
           valueFieldIndex = i;               
         }
      });
      return valueFieldIndex;
    },
       
    _getFieldValue: function(row, fieldIndex){
      if (this.datasource == undefined) return null;
      var field = this.datasource.fields[fieldIndex];
      if (field == undefined) return null;
      var v = row[fieldIndex];
      switch (field.type) {
            case WMXEnum.DATE_DATATYPE: // Date field: format to m/d/Y
               var date = new Date(v);
               return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
             case WMXEnum.SHORT_DATATYPE:
             case WMXEnum.LONG_DATATYPE:
             case WMXEnum.OBJECTID_DATATYPE:  
             case WMXEnum.DOUBLE_DATATYPE: 
                return Number(v);  
            default: 
                return v;   
       }
      },
       
      _getFormattedDateValue: function(value, fieldIndex,format){
        if (this.datasource == undefined) return null;
         if (fieldIndex == -1) return null;
         if (value == undefined || value == null) return null;
         var field = this.datasource.fields[fieldIndex];
         if (field.type != WMXEnum.DATE_DATATYPE) return null           
         var date = new Date(value);
         if (date == undefined) return value;
         switch (format){
          case WMXEnum.GROUP_BY_DAY:
             return value;
          case WMXEnum.GROUP_BY_MONTH:
             return date.getFullYear() + "/" + (date.getMonth()+1);
          case WMXEnum.GROUP_BY_YEAR:
             return date.getFullYear();
         }
      },

      getFieldValues: function(field){
        var values = [];        
        if (this.datasource == undefined) return values;
        var fieldIndex = this._findFieldIndex(field.name)
        if (fieldIndex == -1) return values;
        for(var i=0; i< this.datasource.rows.length;i++){
           values.push(this._getFieldValue(this.datasource.rows[i],fieldIndex));
        } 
        return values;        
      }
  	});
});