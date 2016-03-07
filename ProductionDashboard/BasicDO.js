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
  "esri/productiondashboard/WMXEnum"

], function(declare, lang, WMXEnum){
     return declare ("esri.productiondashboard.BasicDO", [],{
       values: [],
       id: null,        
       constructor: function(args){
           lang.mixin(this, args);
       } ,
       getCount: function() {
       	  return (this.values.length!=0)? this.values.length:1;
       },
       
       getSum: function() {
       	  return this.values.reduce(function(sum, a) {return sum + a },0);
       },

       getAverage: function(){
       	   return this.getSum()/this.getCount();       
       }, 

       getDOValue: function(method) {
       	 switch (method) {
          case WMXEnum.CALCULATE_BY_SUM: 
            return this.getSum();            
          case WMXEnum.CALCULATE_BY_COUNT:
            return this.getCount();                              
          case WMXEnum.CALCULATE_BY_AVERAGE:
            return this.getAverage();
          default:
            return 0;                           
          }
        },

        getDOIDValue: function(field, format) {
        	if (field == undefined) return this.id;
        	if (field.type == undefined) return this.id;

        	switch (field.type) {
        		case WMXEnum.WMXEnum.DATE_DATATYPE:{
        			var d = new Date(this.id);
        			if (format == undefined) 
        				return this.id; 
        			switch (format){
        				case WMXEnum.GROUP_BY_DAY:
        				  return this.id;
        				case WMXEnum.GROUP_BY_MONTH:
        				  return  (d.getMonth()+1) +  "/" + d.getFullYear();
        				case WMXEnum.GROUP_BY_YEAR:
    					  return d.getFullYear(); 	        			
        			}
        			break;
        		}
        		default: 
        		   return this.id;
        	}
        }       

     });
});