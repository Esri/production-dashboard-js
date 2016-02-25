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
 	"esri/productiondashboard/BasicDO"
],function(declare, lang, BasicDO){
     return declare("esri.productiondashboard.WMXDataObject",[BasicDO], {
     	dsValues : [],
     	dsId : null,
     	datasourceId: [],

     	constructor: function(args){
           lang.mixin(this, args);
        }        
     });
});
