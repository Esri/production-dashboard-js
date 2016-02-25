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