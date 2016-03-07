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
	"dojo/_base/array",
	"dojo/Deferred",
	"dojo/Evented",
	"esri/tasks/datareviewer/ReviewerLifecycle",
	"esri/tasks/datareviewer/DashboardTask",
	"esri/tasks/datareviewer/ReviewerFilters"
],function (declare,lang, Array, Deffered, Evented, ReviewerLifecycle, DashboardTask,ReviewerFilters) {
 return declare("esri.productiondashboard.DRSRequest",[Evented], {
  url:null,
 	drsDashboardFieldNames: null,
  drsDashboardCustomFieldNames: null,
 	reviewerSessions: null,
  successCallBack: null,
  errorCallBack: null,

	constructor: function(args){
    lang.mixin(this, args);
   	this.disableClientCaching = true;
    this.dashboardTask = new DashboardTask(this.url);
    this.attach_event_error(); 
    this.attach_event_dashboard_result_complete(); 
	},
  
  attach_event_error: function(){
    var me = lang.hitch(this);    
    this.dashboardTask.on('error',function(error){
      if (me.errorCallBack != undefined) 
          me.errorCallBack(error) 
        else{          
          me.emit("drsRequest_error", {error: error});
          /*if (error.error.stopPropagation != undefined) {
             try {
              error.error.stopPropagation();  
            } catch (error){
              // ignore.
            }
          }*/ 
      }
    });
  },

  attach_event_dashboard_result_complete: function(){
    var me = lang.hitch(this);
    this.dashboardTask.on("get-dashboard-results-complete",function(response){
          var drs_variable = response.dashboardResult.fieldName;
          var data = [];
          var minCount = 0, maxCount = 0, sum = 0, average = 0;          
          switch (drs_variable){
            case "LIFECYCLESTATUS":{             
              Array.forEach(response.dashboardResult.fieldValues, function(item, i) {
                  var variable = ReviewerLifecycle.LIFECYCLESTATUS_DESCRIPTIONS[item];
                  var count = response.dashboardResult.getCount(item);
                  if (i == 0){
                    data.push({id: 99, item: 99, variable: 'Any..', count: 0});
                    minCount = maxCount = sum = count;
                  }  
                  data.push({
                    id: ++i, 
                    item: item,
                    variable : variable,
                    count : count
                  });
                  if (minCount > count) minCount = count;
                  if (maxCount < count) maxCount = count;
                  sum+=count;
                  average = sum/i; 
              });                            
              break;
            }
            case "SESSIONID": {             
              Array.forEach(response.dashboardResult.fieldValues, function(item, i){
                  var variable =  item;
                  var count = response.dashboardResult.getCount(item);
                  if (me.reviewerSessions != undefined){
                    for(var i=0; i< me.reviewerSessions.length;i++){
                      if (me.reviewerSessions[i].id == Number(item)){
                        variable = me.reviewerSessions[i].sessionName + ' :: ' + me.reviewerSessions[i].userName + ' :: ' + me.reviewerSessions[i].versionName;
                        break; 
                      }
                    }
                  }

                  if (i == 0){
                   data.push({id: 99,  item: 99, variable: 'Any..', count: 0});
                   minCount = maxCount = count;
                  }
                  data.push({
                    id: ++i, 
                    item: item,
                    variable : variable,
                    count : response.dashboardResult.getCount(item)
                  });
                  if (i > 0 && minCount > count) minCount = count;
                  if (maxCount < count) maxCount = count;
                  sum+=count;
                  average = sum/i; 
              });
              break;
            }
            case "BATCHJOBCHECKGROUP":
            case "CHECKTITLE":
            case "FEATUREOBJECTCLASS":                 
            case "SEVERITY":
            case "SUBTYPE": {              
              Array.forEach(response.dashboardResult.fieldValues, function(item, i) {
                var variable = item;
                var count = response.dashboardResult.getCount(item);
                if (i == 0){
                  data.push({id: 99,  item: 99, variable: 'Any..', count: 0});
                  minCount = maxCount = count;
                } 
                data.push({
                  id: ++i, 
                  item: item,
                  variable : variable,
                  count : response.dashboardResult.getCount(item)
                });
                if (i > 0 && minCount > count) minCount = count;
                if (maxCount < count) maxCount = count;
                sum+=count;
                average = sum/i; 
              });
              break;
            }
          }
          if (me.sucessCallBack != undefined)
               me.sucessCallBack({minCount: minCount, maxCount: maxCount, sum: sum, average: average, data:data});
      });
  },
  
  attach_event_getCustomFieldNames: function(){

  },

	initialize: function(){
    	var me = lang.hitch(this);      
    	this.getDashboardFieldNames(function(data){
                me.drsDashboardFieldNames = data;
                me.getReviewerSessions(function(data){
                	me.reviewerSessions = data;
                  me.getDasboardCustomFieldNames(function(data){
                     me.drsDashboardCustomFieldNames = data;
                     if (me.drsDashboardCustomFieldNames.length > 0){
                       for (var i=0; i<me.drsDashboardCustomFieldNames.length;i++){
                         me.drsDashboardFieldNames.push(me.drsDashboardCustomFieldNames[i]);
                       } 
                     }
                     me.emit("drsRequest_intialized", {drsDashboardFieldNames: me.drsDashboardFieldNames, reviewerSessions: me.reviewerSessions, drsDashboardCustomFieldNames: me.drsDashboardCustomFieldNames});
                    }, 
                    function(error){
                      // ignore 
                    });
                },
                function(error){
                	//ignore
                });
             }, function (error){
                // ignore
             });
	},

  getDrsDasboardFieldNames: function(fieldname){
     if (this.drsDashboardFieldNames == undefined) return null;
     for(var i=0; i<this.drsDashboardFieldNames.length; i++){
        if (this.drsDashboardFieldNames[i].fieldname == fieldname)
            return this.drsDashboardFieldNames[i]
     }
     return null;
  },
  
	buildReviewerFilters: function (filters){
		var reviewerFilters = null;
		if (filters != undefined  && lang.isArray(filters) && filters.length > 0) {
        	reviewerFilters = new ReviewerFilters();
        	for(var i=0;i<filters.length;i++){        			
        		switch (filters[i].fieldName){         			
              case 'CHECKTITLE':
              case 'BATCHJOBCHECKGROUP':
              case 'SUBTYPE':
              case 'FEATUREOBJECTCLASS':{
                reviewerFilters.addAttributeFilter(filters[i].fieldName, filters[i].fieldValue);
                break;              
              }
              case 'LIFECYCLESTATUS':
              case 'SEVERITY':
              case 'SESSIONID':{
                reviewerFilters.addAttributeFilter(filters[i].fieldName, parseInt(filters[i].fieldValue));
                break;
              }              
        		}
        		
        	}
        }
        return reviewerFilters;       
	},
     
    getLifecycleStatusDescription: function() {
    	var lifecycle_descriptions = [];    	
    	for (var key in ReviewerLifecycle.LIFECYCLESTATUS_DESCRIPTIONS)
    	{           
           lifecycle_descriptions.push({ id: key, 
           	                            description : ReviewerLifecycle.LIFECYCLESTATUS_DESCRIPTIONS[key]
           	                           });
    	}
    	return lifecycle_descriptions;
    },
    
    getLifecyclesDescription: function(){
    	var lifecycle_descriptions = [];
    	for (var key in ReviewerLifecycle.LIFECYCLESTATUS_DESCRIPTIONS){
    	   var lifecycle = ReviewerLifecycle.getCurrentLifecyclePhase(Number(key));   
    	   var found = false;
    	   for(var i = 0; i<lifecycle_descriptions.length;i++){
    	   		  if (lifecycle_descriptions[i].description == lifecycle){
    	   		  	 found = true;
    	   		  	 break;
    	   		  } 
    	   }        
    	   if (!found) 
           	   lifecycle_descriptions.push({ id: key,  description : lifecycle});
    	}
    	return lifecycle_descriptions;
    },

    getDashboardResults: function(drs_db_variable, sucessCallBack,errorCallBack, filters){
      var reviewerFilters = this.buildReviewerFilters(filters);      
      this.sucessCallBack = sucessCallBack;
      this.errorCallBack = errorCallBack;
      this.dashboardTask.getDashboardResults(drs_db_variable,reviewerFilters);
	}, 

    getReviewerSessions: function(sucessCallBack,errorCallBack){
    	var deferred = this.dashboardTask.getReviewerSessions();
    	deferred.then(function(response){
			var data = [];
            Array.forEach(response.reviewerSessions, function(item, i) {
                   data.push({
                       sessionName : item.sessionName,
                       id : item.sessionId,
                       userName: item.userName,
                       versionName: item.versionName
                   });
                   
            });
            sucessCallBack(data);
		}, function(error){
			console.log("DRSRequest Error occured: " + error.message);
			errorCallBack(error);
		});
    },
  
  getDasboardCustomFieldNames: function(sucessCallBack,errorCallBack){
     var deferred = this.dashboardTask.getCustomFieldNames();
     deferred.then(function(response){
      var data = [];
            Array.forEach(response.customFieldNames, function(item, i) {
                   data.push({
                       fieldname : item,
                       id : 'custom' + i
                   });
                   
            });
            sucessCallBack(data);
    }, function(error){
      //console.log("DRSRequest Error occured: " + error.message);
      errorCallBack(error);
    });
  },

	getDashboardFieldNames: function(sucessCallBack,errorCallBack) {
		var deferred = this.dashboardTask.getDashboardFieldNames();
		deferred.then(function(response){
			var data = [];
            Array.forEach(response.fieldNames, function(item, i) {
                   data.push({
                       fieldname : item,
                       id : i
                   });
                   
            });
            sucessCallBack(data);
		}, function(error){
			//console.log("DRSRequest Error occured: " + error.message);
			errorCallBack(error);
		});
	}

	/*getMaxAndMinCounts: function (drs_db_variable, values){
        var data = { min: 0, max:0}
        switch (variable){
          case: 
        }


        return data;

    }*/
 });
});