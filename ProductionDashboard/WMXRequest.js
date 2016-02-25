/**
 * COPYRIGHT 2013 ESRI
 *
 * TRADE SECRETS: ESRI PROPRIETARY AND CONFIDENTIAL
 * Unpublished material - all rights reserved under the
 * Copyright Laws of the United States and applicable international
 * laws, treaties, and conventions.

 * For additional information, contact:
 * Environmental Systems Research Institute, Inc.
 * Attn: Contracts and Legal Services Department
 * 380 New York Street
 * Redlands, California, 92373
 * USA

 * email: contracts@esri.com
 */
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