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
