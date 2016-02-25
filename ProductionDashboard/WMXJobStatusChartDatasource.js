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
 "dojo/Evented",
 "esri/productiondashboard/WMXChartDatasource"
],function(declare, lang, Evented, WMXChartDatasource){
   return declare("esri.productiondashboard.WMXJobStatusChartDatasource",[WMXChartDatasource, Evented], {
       startDateFieldIndex: -1,
       percentCompeleteFieldIndex: -1,
       dueDateFieldIndex: -1,
       idFieldIndex :-1,
       calculateStatusFunction : null,       
     
       _isFunction: function(x) {
          return Object.prototype.toString.call(x) == '[object Function]';
       },

       _calculateStatus: function(dueDate , startDate,percentComplete){
           if (this._isFunction(this.calculateStatusFunction))
                 return this.calculateStatusFunction(dueDate, startDate, percentComplete);
           return "unknown";                 
       },

       _prepareDatasource: function()
       {       
       	 	var self = lang.hitch(this), data = [];
    			this.startDateFieldIndex = this._findFieldIndex(this.startDateField.name);
    			this.percentCompeleteFieldIndex = this._findFieldIndex(this.percentCompleteField.name);
    			this.dueDateFieldIndex = this._findFieldIndex(this.dueDateField.name);
          this.idFieldIndex = (this.idField != undefined) ? this._findFieldIndex(this.idField.name): -1;
    			if (this.startDateFieldIndex != -1 && 
    				this.dueDateFieldIndex != -1 && 
    				this.percentCompeleteFieldIndex != -1 &&
    				this.startDateField.type == 5 &&
    				this.percentCompleteField.type == 3 &&
    				this.dueDateField.type == 5){

    				this.datasource.rows.forEach(function (row, i){
    					var dueDate, startDate, percentComplete, today = new Date();
    					dueDate	= self._getFormattedDateValue(self._getFieldValue(row, self.dueDateFieldIndex),
    						                                  self.dueDateFieldIndex,
    						                                  'day');
    					startDate	= self._getFormattedDateValue(self._getFieldValue(row, self.startDateFieldIndex),
    						                                  self.startDateFieldIndex,
    						                                  'day');
    					percentComplete	= self._getFieldValue(row, self.percentCompeleteFieldIndex);
    						                                  

  		            if (startDate != null && dueDate != null){
  		                 var jobStatus = {
                            id:self._getFieldValue(row, self.idFieldIndex),
  		                 			due_Date: dueDate,
  		                 			start_Date: startDate,
  		                 			percent_Complete: percentComplete,
  		                 			status: self._calculateStatus(new Date(dueDate),
  		                 				                             new Date(startDate),
  		                 				                             percentComplete)
  		                 		 };
  		                 data.push(jobStatus);
  		                /* console.log("jobStatus = " + jobStatus.id + "\n" +
                                                   jobStatus.due_Date + "\n" + 
                                                   jobStatus.start_Date + "\n" + 
                                                   jobStatus.percent_Complete + "\n" +
                                                   jobStatus.status);		 */
  		            }
    			    });	
  				
  			}
        	this.emit("dataIsReady", {data: data});       	
       }         
  });
});