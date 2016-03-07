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
 "dojo/dom", 
 "dijit/_WidgetBase",
 "dijit/_TemplatedMixin",
 "dijit/_WidgetsInTemplateMixin",
 "esri/productiondashboard/d3.min",
 "esri/productiondashboard/D3Charts/D3ChartEnum"
// "dojo/ready",
 
 ], function (declare,
              lang,              
              dom, 
              _WidgetBase, 
              _TemplatedMixin, 
              _WidgetsInTemplateMixin, 
              d3,
              D3ChartEnum
              ) 
 {
    (function(){
        var css = [
                    require.toUrl("esri/productiondashboard/D3Charts/D3Charts.css")
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

 	return declare("esri.productiondashboard.D3Charts.D3Chart",[_WidgetBase,_TemplatedMixin,_WidgetsInTemplateMixin], {
 		
    	baseClass                     :"D3Chart",
    	templateString                :"<svg class='${baseClass}'></svg>",  
    	svgHeight                     :0,
    	svgWidth                      :0, 
      margin                        : {top: 0, right: 0, bottom: 0, left: 0},
    	svgType                       :D3ChartEnum.UNKNOWN_CHART,
      data                          :[],
      selectOnMap                   :false,
      onChartClick                  :null,
      mode                          :'normal',
      widthFactor                   : 1,
      heightFactor                  : 1,
      showSampleData                : false,
      dataTipProperty               : 'value',
      clientHeightCorrection        : 5,
      currentTargetWindow           : null,
      mode                          :'normal',
      fixedWidth                    : false,
      fixedHeight                   : false,
      h                             : null,
      w                             : null,
     

    buildRendering: function(){
      this.inherited(arguments);
      this.h = this.svgHeight;
      this.w = this.svgWidth;
      var h = parseInt(this.svgHeight), w = parseInt(this.svgWidth);
      if (!isNaN(h) && h > 0){       
        this.fixedHeight = true;
      }
      if (!isNaN(w) && w > 0) {
        this.fixedWidth = true;
      }            
    },
    
    startup: function(){
      this.showChart(true);
    },
    
    postCreate: function () {
 		 	this.inherited(arguments);   
      this.svgId = this.getId();
      this.currentTargetWindow = window;
      window.addEventListener('resize', lang.hitch(this,function(e) {
          this.fixedWidth = false;
          this.fixedHeight = false;
          this.currentTargetWindow = e.currentTarget;
          this.showChart();       
        }), 
        false);
    },

    calcultateSizeFactor: function(value){
      var iValue = parseInt(value),  sValue = value.toString();
      if (Number(iValue)) return 1;
      var percentValue = this.getPercentage(value);
      if (percentValue != 0)
          return percentValue;
      return 1;
    },

    getPercentage: function(value){
        if (value == undefined ) return 0;
        var iValue = parseInt(value), sValue = value.toString();
        if (!isNaN(iValue)){
          var percent = sValue[sValue.length-1];
          var percentage = parseInt(sValue.substring(0,sValue.length-1));
          if (percent == '%' && !isNaN(percentage)) {
            return percentage / 100;
          } else {
            return 0;
          }
        }
        return 0;
    },

    parent: function(){
     var parent = this.domNode.parentElement;
     if (parent == undefined){
        parent = document.getElementsByTagName('body');
     }
     return parent;
    },

    showChart:function(enForce){
      var  cw = 0, ch = 0;
      var enforce =  (enForce == 'true') || enForce;
      
      /*if (enforce){
          this.widthFactor = this.calcultateSizeFactor(this.w), 
          this.heightFactor = this.calcultateSizeFactor(this.h);
      }*/
      var parent = this.parent();
      if (parent != undefined){
          
          ch = 0.95 * parent.clientHeight;
          cw = 0.9 *  parent.clientWidth ;
          var cth = 0, ctw = 0;
          if (this.currentTargetWindow != undefined){
             cth = this.currentTargetWindow.outerHeight;
             ctw = this.currentTargetWindow.outerWidth;
          }
          ch = (ch < cth)? ch: cth;
          cw = (cw < ctw)? cw: ctw;
      }
      var percent = this.getPercentage(this.w);
      this.svgWidth = (percent != 0)? Math.round(percent * cw): (this.fixedWidth)? this.w : cw; 
      percent = this.getPercentage(this.h)
      this.svgHeight = (percent != 0)? Math.round(percent * (ch - this.clientHeightCorrection)): (this.fixedWidth)? this.h:ch  ;
      this.prepareChart();
    },
        
    renderChart: function(data) {
      this.mode = 'normal';
      if (this.svgType == D3ChartEnum.UNKNOWN_CHART) {
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
    
    prepareChart: function(){
      var nodeContainer = this.parent();
      /*if (nodeContainer != undefined && 
            nodeContainer.clientHeight > 0 && 
            nodeContainer.clientWidth > 0  &&
            this.svgHeight == 0 &&
            this.svgHeight == 0){
        this.svgHeight = nodeContainer.clientHeight - this.clientHeightCorrection;//- 20;
        this.svgWidth = nodeContainer.clientWidth ;//- 20;    
      }*/   
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
             //this.placeAt(nodeContainer);
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