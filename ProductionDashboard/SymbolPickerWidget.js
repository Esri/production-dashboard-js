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
        "dojo/dom-construct",
        "dojo/dom-style",             
        "esri/productiondashboard/PDWidget",
        "esri/productiondashboard/PDIndicatorChart"
 ], function(declare, 
            lang,
            domConstruct,
            domStyle,           
            PDWidget,
            PDIndicatorChart){
     
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
      return declare("esri.productiondashboard.SymbolPickerWidget", [PDWidget], {
         
        baseClass : 'SymbolPickerWidget',
        templateString :'<div class="${baseClass}">' +
                          ' <button data-dojo-attach-point="symbolButton" data-dojo-attach-event="onclick: buttonClick"><div ></div></button>' +
                          '  <div data-dojo-attach-point="symbolContainer" class="${baseClass}Container"></div>' + 
                          '</div>',
        symbolsDivDisplayed: false,

        onSymbolclickIsAttached: false,

        symbolFillColor: 'green',

        selectedSymbol: 'face-up-arrow',

        selectedStyle: null,


        buildRendering: function(){
            this.inherited(arguments);
            this.refresh();
        },

        buttonClick: function(e){
             //alert('received click')
           if (this.symbolsDivDisplayed){
                domStyle.set(this.symbolContainer,'display', 'none');
                this.symbolsDivDisplayed = false;
           } else {
                domStyle.set(this.symbolContainer,'display', 'block');
                this.symbolsDivDisplayed = true;
           }
            if (e != undefined) e.stopPropagation();
         },

         postCreate: function(){
            this.inherited(arguments);
        },
        
        
         symbolClick: function(e){
            var currentStyle = e.currentTarget.title;            
            this.selectedSymbol = currentStyle;
           
            domConstruct.empty(this.symbolButton);
            this.selectedSymbolDiv = domConstruct.create("div",
                                                         {
                                                           title:this.selectedSymbol ,
                                                           className: this.baseClass+'Symbol',
                                                           onclick: lang.hitch(this,this.buttonClick)
                                                         },
                                                         this.symbolButton);

           var chart = new PDIndicatorChart({
                                                symbolStyle: this.selectedSymbol, 
                                                mode:'icon',
                                                container: this.selectedSymbolDiv ,
                                                fill_color:this.symbolFillColor,
                                                svgHeight: 36,
                                                svgWidth: 36
                                              });          
           chart.showChart();
           domConstruct.place(chart.domNode, this.selectedSymbolDiv);
           this.buttonClick();
        },

        _setSymbolFillColorAttr: function(/* COLOR STRING*/color){
            //this._set(symbolFillColor, color);
            this.symbolFillColor = color;
            
            
        },

        refresh: function(){
            domConstruct.empty(this.symbolButton);
            domConstruct.empty(this.symbolContainer);
            
            this.selectedSymbolDiv = domConstruct.create("div",
                                                         {
                                                           title:this.selectedSymbol ,
                                                            className: this.baseClass+'Symbol',
                                                            onclick: lang.hitch(this,this.buttonClick)
                                                         },
                                                         this.symbolButton);
            var chart = new PDIndicatorChart({
                                                symbolStyle: this.selectedSymbol, 
                                                mode:'icon',
                                                container: this.selectedSymbolDiv ,
                                                fill_color:this.symbolFillColor,
                                                svgHeight: 36,
                                                svgWidth: 36
                                              });          
            chart.showChart();
            domConstruct.place(chart.domNode, this.selectedSymbolDiv);
            var styles = chart.getPDIndictorStyles(); 
            
            for (var i = 0; i < styles.length ; i++){
               var symbolDiv = domConstruct.create("div",
                                                      { 
                                                        title:styles[i] , 
                                                        className: this.baseClass+'Symbol' , 
                                                        onclick: lang.hitch(this,this.symbolClick)
                                                      }, 
                                                    this.symbolContainer);            
              chart = new PDIndicatorChart({
                                            symbolStyle: styles[i],
                                            mode:'icon',
                                            fill_color:this.symbolFillColor,
                                            svgHeight: 36,
                                            svgWidth: 36
                                          });
              chart.showChart();
              domConstruct.place(chart.domNode,symbolDiv);   
            }           
 
            /*this.faceUpArrowDiv = domConstruct.create("div",
                                                      { 
                                                        title:'face-up-arrow' , 
                                                        className: this.baseClass+'Symbol' , 
                                                        onclick: lang.hitch(this,this.symbolClick)
                                                      }, 
                                                    this.symbolContainer);            
            chart = new PDIndicatorChart({
                                            symbolStyle: 'face-up-arrow',
                                            mode:'icon',
                                            fill_color:this.symbolFillColor,
                                            svgHeight: 36,
                                            svgWidth: 36
                                          });
            chart.showChart();
            domConstruct.place(chart.domNode,this.faceUpArrowDiv);

            this.faceDownArrowDiv = domConstruct.create("div",
                                                      { 
                                                        title:'face-down-arrow' , 
                                                        className: this.baseClass+'Symbol' , 
                                                        onclick: lang.hitch(this,this.symbolClick)
                                                      }, 
                                                    this.symbolContainer);            
            chart = new PDIndicatorChart({
                                            symbolStyle: 'face-down-arrow',
                                            mode:'icon',
                                            fill_color:this.symbolFillColor,
                                            svgHeight: 36,
                                            svgWidth: 36
                                          });
            chart.showChart();
            domConstruct.place(chart.domNode,this.faceDownArrowDiv);

            this.circleDiv = domConstruct.create("div",
                                                      { 
                                                        title:'circle' , 
                                                        className: this.baseClass+'Symbol' , 
                                                        onclick: lang.hitch(this,this.symbolClick)
                                                      }, 
                                                    this.symbolContainer);            
            chart = new PDIndicatorChart({
                                            symbolStyle: 'circle', 
                                            mode:'icon', 
                                            fill_color:this.symbolFillColor,
                                            svgHeight: 36,
                                            svgWidth: 36
                                          });
            chart.showChart();
            domConstruct.place(chart.domNode,this.circleDiv);

            this.crossDiv = domConstruct.create('div', { 
                                                        title:'cross' , 
                                                        className: this.baseClass+'Symbol' , 
                                                        onclick: lang.hitch(this,this.symbolClick)
                                                      }, 
                                                    this.symbolContainer);

            chart = new PDIndicatorChart({
                                            symbolStyle: 'cross', 
                                            mode:'icon', 
                                            fill_color:this.symbolFillColor,
                                            svgHeight: 36,
                                            svgWidth: 36
                                          });
            chart.showChart();
            domConstruct.place(chart.domNode,this.crossDiv);
*/


        }


     });

     /*ready(function(){
         parser.parse();
     });*/
 });