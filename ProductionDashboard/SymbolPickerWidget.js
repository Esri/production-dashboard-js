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
        "dojo/dom-construct",
        "dojo/dom-style",             
        "esri/productiondashboard/PDWidget",
        "esri/productiondashboard/D3Charts/D3IndicatorChart"
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