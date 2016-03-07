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
"dojo/_base/declare"
], function(declare){
  var PDInit = declare(null, {});
  PDInit.WMX_SERVICE 			= { 
                              url: 'https://ogcedit.esri.com/pmediting/rest/services/MyWorkflowManagerService/WMServer',
  									          //url: 'https://workflowsample.esri.com/arcgis/rest/services/Workflow/WMServer',
  									          username: 'imed3349'
  						 	 	          };
  PDInit.DRS_SERVICE			= {
  	 								          url: 'https://datareviewer.arcgisonline.com/arcgis/rest/services/Samples/reviewerDashboard/MapServer',
  	 								          username: '' 
  								          };
/*PDInit.WMX_SERVICE       = { 
                             url: '',
                             username: ''
                            };
  PDInit.DRS_SERVICE      = {
                              url: '',
                              username: '' 
                            };*/

  PDInit.COLORS_PALETTE =  [
                      ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
                      ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
                      ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
                      ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
                      ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
                      ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
                      ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
                      ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
                ];  


  PDInit.GROUP_BY_DAY          = 'day';
  PDInit.GROUP_BY_MONTH        = 'month';
  PDInit.GROUP_BY_YEAR         = 'year';
  
  // Compute Operations
  PDInit.CALCULATE_BY_SUM      = 'sum';
  PDInit.CALCULATE_BY_COUNT    = 'count';
  PDInit.CALCULATE_BY_AVERAGE  = 'average';
  PDInit.CALCULATE_BY_MAX      = 'max';
  PDInit.CALCULATE_BY_MIN      = 'min';
  PDInit.CALCULATE_BY_UNKNOWN  = 'noOperaton';
  
  return PDInit;
});
