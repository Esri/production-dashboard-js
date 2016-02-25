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
 "dojo/dom", 
 "dijit/_WidgetBase",
 "dijit/_TemplatedMixin",
 "dijit/_WidgetsInTemplateMixin",
 "esri/productiondashboard/d3.min",
 "esri/productiondashboard/PDChartEnum"
// "dojo/ready",
 
 ], function (declare,
              lang,              
              dom, 
              _WidgetBase, 
              _TemplatedMixin, 
              _WidgetsInTemplateMixin, 
              d3,
              PDChartEnum
              ) 
 {
    (function(){
        var css = [
                    require.toUrl("esri/productiondashboard/mp-dashboard.css")
                          ];
                var head = document.getElementsByTagName("head").item(0), link;
                for (var i = 0, il = css.length; i < il; i++) {
                    link = document.createElement("link");
                    link.type = "text/css";
                    link.rel = "stylesheet";
                    link.href = css[i].toString();
                    head.appendChild(link);
                }
     }());

 	return declare("esri.productiondashboard.PDChart",[_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
 		
    	baseClass                     :"chart",
    	templateString                :"<svg class='${baseClass}'></svg>",  
    	svgHeight                     :0,
    	svgWidth                      :0, 
      margin                        : {top: 0, right: 0, bottom: 0, left: 0},
    	svgType                       :PDChartEnum.UNKNOWN_CHART,
      data                          :[],
      selectOnMap                   :false,
      onChartClick                  :null,
      mode                          :'normal',
      widthFactor                   : 1,
      heightFactor                  : 1,
      showSampleData                : false,
      dataTipProperty               : 'value',
    
    startup: function(){
      this.inherited(arguments);       
      this.mode = 'normal';      
      var parent = this.parent();
      if (parent != undefined){
        this.widthFactor = this.calcultateSizeFactor(this.svgWidth), 
        this.heightFactor = this.calcultateSizeFactor(this.svgHeight);
        if (this.svgHeight != 0 && this.svgWidth != 0){
          this.svgWidth = Math.round(this.widthFactor * parseInt(this.svgWidth));
          this.svgHeight = Math.round(this.heightFactor * parseInt(this.svgHeight));  
        } else {
          this.svgWidth = Math.round(this.widthFactor * parent.clientWidth);
          this.svgHeight = Math.round(this.heightFactor * parent.clientHeight);
        }   
        this.showChart();
      }
      
    },
    

    postCreate: function (args) {
 		 	this.inherited(arguments);
      lang.mixin(this, args);
      this.svgId = this.getId();    
      window.addEventListener('resize', lang.hitch(this,function() {
          this.resizeMe();       
        }), 
        false
      );
    },

    calcultateSizeFactor: function(value){
      var widthPercentage = 1, 
          heightPercentage = 1, 
          iValue = parseInt(value),
          sValue = value.toString();

      if (isNaN(iValue)){
         return 0;   
      }
      if (sValue[sValue.length-1] == '%'){
         return iValue / 100;
      }
      return 1;
    },



    parent: function(){
     var parent = this.domNode.parentNode;
     if (this.parent == undefined){
        this.parent = document.getElementsByTagName('body');
     }
     return parent;
    },

    resizeMe:function(enForce){
      var enforce =  (enForce == 'true') || enForce;
      if (enforce){
        this.widthFactor = this.calcultateSizeFactor(this.svgWidth), 
        this.heightFactor = this.calcultateSizeFactor(this.svgHeight);
      }
      var parent = this.parent();
          if (parent != undefined){
            this.svgWidth = Math.round(this.widthFactor * parent.clientWidth);
            this.svgHeight = Math.round(this.heightFactor * parent.clientHeight);
            this.showChart();  
          }   
    },
        
    renderChart: function(data) {
      this.mode = 'normal';
      if (this.svgType == PDChartEnum.UNKNOWN_CHART) {
          console.log("Unknown Chart Type")
          return
      };
      this.visualizeIt(data);
    },
       
    renderChartThumbnail: function(){
        this.mode = 'icon';
        if (this.svgHeight == 0 || this.svgWidth == 0) {
            this.svgHeight = 72;
            this.svgWidth = 72;
        }
        this.visualizeIt(this.data);
    }, 

    isThumbnailMode: function(){
        return (this.mode == 'icon')
    },

    visualizeIt: function(data){
       // Implement by subclass 
    },
    showChart: function(){
      var nodeContainer = this.parent();
      if (nodeContainer != undefined && 
            nodeContainer.clientHeight > 0 && 
            nodeContainer.clientWidth > 0  &&
            this.svgHeight == 0 &&
            this.svgHeight == 0){
        this.svgHeight = nodeContainer.clientHeight ;//- 20;
        this.svgWidth = nodeContainer.clientWidth ;//- 20;    
      }   
      if (this.svgHeight <= 0 || this.svgWidth <= 0)
      return;  
      if (this.isThumbnailMode()) {
        this.renderChartThumbnail();
      } else {
        this.renderChart()
      }
      if (nodeContainer != undefined){ 
          if (nodeContainer.hasChildNodes) {
            if (!nodeContainer.hasChildNodes(this.id)) 
                this.placeAt(nodeContainer);
          } else {// add it any way
             this.placeAt(nodeContainer);
          }
      }
    },


    getBodyStylePropertyValue: function(propname){
        var body = document.querySelector('body');
        return window.getComputedStyle(body).getPropertyValue(propname);
    },

    // UTILS functions
    // Wrap a text using a  width
    wrap : function(text, width) {
      text.each(function() {
        var text = d3.select(this),
            //words = text.text().split(/(\s|-|_)+/).reverse(),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = Math.round(parseFloat(text.attr("dy")));
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em"),
            dx = Math.round(parseFloat(text.attr("dx")));
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").attr("dx", dx+"em").text(word);
          }
        }
      });
    },

    getDataTipProperty: function(){
      if (this.data == undefined || this.data.length == 0) return "";
      for (var prop in this.data[0]){
         if (prop === this.dataTipProperty)
            return this.dataTipProperty;
      }
      return 'value';
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