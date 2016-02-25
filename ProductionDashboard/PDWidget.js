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
 "dijit/_WidgetBase",
 "dijit/_TemplatedMixin",
 "dijit/_WidgetsInTemplateMixin", 
 ], function (declare, lang, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {

 	return declare("esri.productiondashboard.PDWidget",[_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
        

 		postCreate: function (args) {
 		 	this.inherited(arguments);
            lang.mixin(this, args);
        },

        getId: function(){
            function s4() {
              return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
            }
           return 'id'+ s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
      }
     	
 	}); 	
  });