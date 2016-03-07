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
  "dojo/dom-class",
  "dojo/dom-style",
  "dojo/Evented",
  "esri/productiondashboard/PDWidget"
  ],function(declare,
        lang,
        domConstruct,
        domClass,
        domStyle,
        Evented,
        PDWidget ){
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
    return declare("esri.productiondashboard.ColorPaletteWidget", [PDWidget,Evented], {

      baseClass : 'ColorPaletteWidget',
      templateString :'<span class="${baseClass}">' +
                        ' <span data-dojo-attach-point="colorPickerContainer" class="cpContainer"></span>' + 
                       '</span>',
      selectedColorDiv: null,
      colorsDivDisplayed: false,
      previousSelectedSwatch: null,
      alpha: 1,
     
     colors:[ 
              ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
              ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
              ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
              ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
              ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
              ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
            ],
     // see http://www.w3schools.com/HTML/html_colornames.asp
     colorNames: {
                    "aliceblue":"#f0f8ff",
                    "antiquewhite":"#faebd7",
                    "aqua":"#00ffff",
                    "aquamarine":"#7fffd4",
                    "azure":"#f0ffff",
                    "beige":"#f5f5dc",
                    "bisque":"#ffe4c4",
                    "black":"#000000",
                    "blanchedalmond":"#ffebcd",
                    "blue":"#0000ff",
                    "blueviolet":"#8a2be2",
                    "brown":"#a52a2a",
                    "burlywood":"#deb887",
                    "cadetblue":"#5f9ea0",
                    "chartreuse":"#7fff00",
                    "chocolate":"#d2691e",
                    "coral":"#ff7f50",
                    "cornflowerblue":"#6495ed",
                    "cornsilk":"#fff8dc",
                    "crimson":"#dc143c",
                    "cyan":"#00ffff",
                    "darkblue":"#00008b",
                    "darkcyan":"#008b8b",
                    "darkgoldenrod":"#b8860b",
                    "darkgray":"#a9a9a9",
                    "darkgreen":"#006400",
                    "darkkhaki":"#bdb76b",
                    "darkmagenta":"#8b008b",
                    "darkolivegreen":"#556b2f",
                    "darkorange":"#ff8c00",
                    "darkorchid":"#9932cc",
                    "darkred":"#8b0000",
                    "darksalmon":"#e9967a",
                    "darkseagreen":"#8fbc8f",
                    "darkslateblue":"#483d8b",
                    "darkslategray":"#2f4f4f",
                    "darkturquoise":"#00ced1",
                    "darkviolet":"#9400d3",
                    "deeppink":"#ff1493",
                    "deepskyblue":"#00bfff",
                    "dimgray":"#696969",
                    "dodgerblue":"#1e90ff",
                    "firebrick":"#b22222",
                    "floralwhite":"#fffaf0",
                    "forestgreen":"#228b22",
                    "fuchsia":"#ff00ff",
                    "gainsboro":"#dcdcdc",
                    "ghostwhite":"#f8f8ff",
                    "gold":"#ffd700",
                    "goldenrod":"#daa520",
                    "gray":"#808080",
                    "green":"#008000",
                    "greenyellow":"#adff2f",
                    "honeydew":"#f0fff0",
                    "hotpink":"#ff69b4",
                    "indianred ":"#cd5c5c",
                    "indigo":"#4b0082",
                    "ivory":"#fffff0",
                    "khaki":"#f0e68c",
                    "lavender":"#e6e6fa",
                    "lavenderblush":"#fff0f5",
                    "lawngreen":"#7cfc00",
                    "lemonchiffon":"#fffacd",
                    "lightblue":"#add8e6",
                    "lightcoral":"#f08080",
                    "lightcyan":"#e0ffff",
                    "lightgoldenrodyellow":"#fafad2",
                    "lightgrey":"#d3d3d3",
                    "lightgreen":"#90ee90",
                    "lightpink":"#ffb6c1",
                    "lightsalmon":"#ffa07a",
                    "lightseagreen":"#20b2aa",
                    "lightskyblue":"#87cefa",
                    "lightslategray":"#778899",
                    "lightsteelblue":"#b0c4de",
                    "lightyellow":"#ffffe0",
                    "lime":"#00ff00",
                    "limegreen":"#32cd32",
                    "linen":"#faf0e6",
                    "magenta":"#ff00ff",
                    "maroon":"#800000",
                    "mediumaquamarine":"#66cdaa",
                    "mediumblue":"#0000cd",
                    "mediumorchid":"#ba55d3",
                    "mediumpurple":"#9370d8",
                    "mediumseagreen":"#3cb371",
                    "mediumslateblue":"#7b68ee",
                    "mediumspringgreen":"#00fa9a",
                    "mediumturquoise":"#48d1cc",
                    "mediumvioletred":"#c71585",
                    "midnightblue":"#191970",
                    "mintcream":"#f5fffa",
                    "mistyrose":"#ffe4e1",
                    "moccasin":"#ffe4b5",
                    "navajowhite":"#ffdead",
                    "navy":"#000080",
                    "oldlace":"#fdf5e6",
                    "olive":"#808000",
                    "olivedrab":"#6b8e23",
                    "orange":"#ffa500",
                    "orangered":"#ff4500",
                    "orchid":"#da70d6",
                    "palegoldenrod":"#eee8aa",
                    "palegreen":"#98fb98",
                    "paleturquoise":"#afeeee",
                    "palevioletred":"#d87093",
                    "papayawhip":"#ffefd5",
                    "peachpuff":"#ffdab9",
                    "peru":"#cd853f",
                    "pink":"#ffc0cb",
                    "plum":"#dda0dd",
                    "powderblue":"#b0e0e6",
                    "purple":"#800080",
                    "red":"#ff0000",
                    "rosybrown":"#bc8f8f",
                    "royalblue":"#4169e1",
                    "saddlebrown":"#8b4513",
                    "salmon":"#fa8072",
                    "sandybrown":"#f4a460",
                    "seagreen":"#2e8b57",
                    "seashell":"#fff5ee",
                    "sienna":"#a0522d",
                    "silver":"#c0c0c0",
                    "skyblue":"#87ceeb",
                    "slateblue":"#6a5acd",
                    "slategray":"#708090",
                    "snow":"#fffafa",
                    "springgreen":"#00ff7f",
                    "steelblue":"#4682b4",
                    "tan":"#d2b48c",
                    "teal":"#008080",
                    "thistle":"#d8bfd8",
                    "tomato":"#ff6347",
                    "turquoise":"#40e0d0",
                    "violet":"#ee82ee",
                    "wheat":"#f5deb3",
                    "white":"#ffffff",
                    "whitesmoke":"#f5f5f5",
                    "yellow":"#ffff00",
                    "yellowgreen":"#9acd32"
                 },
     selectedColor: null,
     swatchDivs: [],

     buildRendering: function(){
            this.inherited(arguments); 
            this.refresh();           
        },      

        postCreate: function(){
            this.inherited(arguments);
        },

        buttonClick: function(e){
          //alert("ColorPickerWidget received a button click");
           if (this.colorsDivDisplayed){
                domStyle.set(this.colorPickerContainer,'display', 'none');
                this.colorsDivDisplayed = false;
           } else {
                domStyle.set(this.colorPickerContainer,'display', 'block');
                this.colorsDivDisplayed = true;
           }
            if (e != undefined) e.stopPropagation();
        },
     
        cpSwatchClick: function(e){
          //alert("cpSwat received a click event");

          if (this.previousSelectedSwatch != undefined){
                domClass.toggle(this.previousSelectedSwatch, "cpSwatchSelected");  
          }
          domClass.toggle(e.target, "cpSwatchSelected");
          this.previousSelectedSwatch = e.target;
          //this.selectedColor = e.target.id; 
          this.selectedColor = e.target.id.substring(this.id.length)
          this.emit("selectedColor", this.selectedColor);  
        },

        refresh: function(){
          if (this.selectedColor == undefined)
              this.selectedColor = this.colors[0][0];
          
          for(var i=0;i<this.colors.length;i++){
            var swatchRowDiv =  domConstruct.create('div',{className: 'cpSwatchRow'},this.colorPickerContainer);
            var rowColors = this.colors[i];
            for (var cIndex=0;cIndex < rowColors.length;cIndex++){
              var classes  = 'cpSwatch';
              if (rowColors[cIndex] == this.selectedColor) classes = 'cpSwatch cpSwatchSelected';
              var swatchDiv = domConstruct.create('div',{id:this.id+rowColors[cIndex], className: classes, onclick:lang.hitch(this,this.cpSwatchClick)},swatchRowDiv);
              if (rowColors[cIndex] == this.selectedColor) this.previousSelectedSwatch = swatchDiv
              this.swatchDivs.push(swatchDiv);
              domStyle.set(swatchDiv, 'background-color',rowColors[cIndex]);
            }
          }
        },

        findCPSwatch: function(color){
          for (var i = 0 ;i < this.swatchDivs.length; i++){              
              var bgColor = this.swatchDivs[i].id
              if (bgColor == this.id+color) {
                return this.swatchDivs[i];
              }
          }
          return null;
        },

        isColorExist: function(color){
           if (color == undefined) return false;
           if (!isNaN(color)) return false;
           if (color[0] != '#') return false;
           for (var i = 0; i< this.colors.length ; i++){
                var rowColors = this.colors[i];
                for(var j=0;j<rowColors.length;j++){
                  if (rowColors[j] == color)
                    return true
                }
            }
            return false;

        },

        setSelectedColor: function(color){
          var foundInColorsTable = false;
          if (color == undefined) return false;
          if (!isNaN(color)) return false;
          if (color[0] != '#' || this.isColorExist(color)){
            if (typeof this.colorNames[color.toLowerCase()] != 'undefined') color = this.colorNames[color.toLowerCase()];
          }
          if (color[0] != '#') return false;
          var selectedSwatchDiv = this.findCPSwatch(color);
          if (selectedSwatchDiv != undefined){
            if (this.previousSelectedSwatch != undefined){
                domClass.toggle(this.previousSelectedSwatch, "cpSwatchSelected");  
             }
             this.previousSelectedSwatch = selectedSwatchDiv;
             this.selectedColor = color;
             domClass.toggle(selectedSwatchDiv, "cpSwatchSelected");               
          }
          return false
        },

        rgb2hex: function (rgb){
                rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
                return (rgb && rgb.length === 4) ? "#" +
                        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
                        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
                        ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
        }

    });
  });