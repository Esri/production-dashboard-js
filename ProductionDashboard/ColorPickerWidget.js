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

/**
* Run Query, 
* count records for the same value of "Value Field"
* for each value label with the "Label Field"
*/
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