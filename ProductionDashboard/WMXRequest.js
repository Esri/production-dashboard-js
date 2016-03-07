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
"esri/productiondashboard/BasicRequest"
], function (declare, lang, BasicRequest) {

    return declare("esri.productiondashboard.WMXRequest",[BasicRequest], {
    	constructor: function(args){
    		//this.url = url;
            lang.mixin(this, args);
    		this.disableClientCaching = true;
    	},
         
        getServiceInfo: function (successCallBack, errorCallBack) {
            var params = {};
            this.sendRequest(params, "", successCallBack, errorCallBack);
        },
        // get Container Queries 
    	getContainerQueries: function(containerName, sucessCallBack, errorCallBack)
    	{
    		var params = {};
            this.sendRequest(params, "", function(data){                
                var queries = null;
                if (data === undefined)   errorCallBack("undefined data");
                var containers = data.publicQueries.containers;
                for(var i = 0; i < containers.length; i++)
                {
                    if (containers[i].name.toString().localeCompare(containerName) == 0){ 
                        queries = containers[i].queries;
                        break;
                    }
                }
                sucessCallBack(queries);
            },function(error){ 
                errorCallBack(error)
            });
    	}, 
        // get all Containers  
    	getContainers: function(sucessCallBack,errorCallBack)
    	{
            var params = {};
            this.sendRequest(params, "", function(data){
                if (data === undefined)   errorCallBack("undefined data");
                var containers = data.publicQueries.containers;               
                sucessCallBack(containers);
            },function(error){ 
                errorCallBack(error)
            });

    	}, 

        runQuery: function (id,user, sucessCallBack,errorCallBack)
        {
            var params = {};
            params.user = this.formatDomainUsername(user);
            params.id = id;
            this.sendRequest(params, "/jobs/query",sucessCallBack,errorCallBack);  
        }
        

    });
});