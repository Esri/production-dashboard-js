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
  "dojo/dom",
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/Evented",
  "dijit/form/DropDownButton",
  "esri/productiondashboard/PDWidget", 
  "esri/productiondashboard/ColorPaletteWidget"
  ],function(declare,
        lang,
        domConstruct,
        dom,
        domClass,
        domStyle,
        Evented,
        DropDownButton,
        PDWidget,
        ColorPaletteWidget){
    (function (){
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
    return declare("esri.productiondashboard.ColorPickerWidget", [PDWidget,Evented], {

      baseClass : 'ColorPickerWidget',
      templateString :'<span class="${baseClass}">' +
                      '  <span data-dojo-type="dijit/form/DropDownButton">' +
                      '    <div><div id="${selected_color_div_id}" class="selectedColorSwatch"></div></div>' + 
                      '    <span data-dojo-type="esri/productiondashboard/ColorPaletteWidget" data-dojo-attach-point="colorPalette"></span>' +
                      '   </span>' + 
                      '</span>',

    selectedColor: 'red',
    selected_color_div_id : null,  
     postMixInProperties: function(){
      this.inherited(arguments);
      this.selected_color_div_id = this.getId();
     
    }, 
    buildRendering: function(){
      this.inherited(arguments);      
      this.refresh();                            
    },      

    postCreate: function(){
      this.inherited(arguments);
      
    },
    setSelectedSwatchColor: function(color){        
      var id = dom.byId(this.selected_color_div_id)
      domStyle.set(id, 'background-color',color);     
      this.setSelectedColor(color);
      this.emit("selectedColor", color);             
    },

    refresh: function(){          
      this.colorPalette.on('selectedColor', lang.hitch(this, this.setSelectedSwatchColor))
      this.setSelectedColor(this.selectedColor);   
    },

    setSelectedColor: function(color){  
      this.selectedColor = color;   
      this.colorPalette.setSelectedColor(this.selectedColor); 
    }
    });
  });