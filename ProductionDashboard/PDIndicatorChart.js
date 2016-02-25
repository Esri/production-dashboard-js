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
 "esri/productiondashboard/PDChartEnum",
 "esri/productiondashboard/PDChart",
 "dojo/domReady!"
 ], function (declare,lang,PDChartEnum, PDChart) {

 	return declare("esri.productiondashboard.PDIndicatorChart",[PDChart], {
 		
    	svgType                     : PDChartEnum.INDICATOR_CHART,
    	symbolStyle						      : 'face-up-arrow',  // values are: 'face-up-arrow', 'down-arrow', 'circle'       
      indicator                   : '[value]',
      stroke_color                : '#c1c1c0',
      stroke_width                : 3,
      fill_color                  : 'blue',
      show_indicator              : true,
      //margin                      : {top: 10, right: 10, bottom: 10, left: 10},

		postCreate: function (args) {            
 		 	this.inherited(arguments);      		 	 		 
      lang.mixin(this, args);
    },

    clearContent:function(){
       var selector =  '#'+this.svgId;
        d3.selectAll(selector).remove();
    },

    visualizeIt: function(data){
        if (this.isThumbnailMode()){
          this.show_indicator = false;
          this.svgHeight = 36;
          this.svgWidth = 36;
          this.margin = {top: 0, right: 0, bottom: 0, left: 0};
        }
        if (data != undefined ) 
             this.data = data;
         else 
            this.data = this.stoplightChartData;
        this.clearContent();
        switch(this.symbolStyle){
          case 'face-up-arrow':{
            this._visualizeFaceUpArrowChart();
            break;
          }
          case 'face-down-arrow':{
            this._visualizeFaceDownArrowChart();
            break;
          }
          case 'circle':{
            this._visualizeCircleChart();
            break;
          }
          case 'cross':{
            this._visualizeCrossChart();
            break;
          }
          case 'square':{
            this._visualizeSquareChart();
            break;
          }
          case 'summet-up-triangle':{
            this._visualizeSummetUpTriangleChart();
            break;
          }
          case 'summet-down-triangle':{
            this._visualizeSummetDownTriangleChart();
            break;
          }
          case "star":{
            this._visualizeStarChart()
            break;
          }

        }             
    },

    _renderFaceUpArrow: function (x,y, w, h){

     	return "M " + x + ' ' + (y +  (.4 * h)) + ' ' +
    	       "L " + (x + (0.5 *  w)) + ' ' + y + ' ' + 
    	       "L " + (x + w) + ' ' + (y + (.4 * h)) + ' '  +
    	       "L " + (x + (0.8 * w))  + ' ' + (y + (.4 * h)) + ' ' +
    	       "L " + (x + (0.8 * w)) + ' ' + (y + h) + ' '  +
    	       "L " + (x + (0.2 * w)) + ' ' + (y + h) + ' ' +
    	       "L " + (x + (0.2 * w)) + ' ' + (y + (.4 * h)) + ' ' +
    	       "L " +  x + ' ' + (y +  (.4 * h))


    },

     _renderFaceDownArrow: function (x,y, w, h){

      return "M " + x + ' ' + (y +  (.6 * h)) + ' ' +
             "L " + (x + (0.5 *  w)) + ' ' + (y + h) + ' ' + 
             "L " + (x + w) + ' ' + (y + (.6 * h)) + ' '  +
             "L " + (x + (0.8 * w))  + ' ' + (y + (.6 * h)) + ' ' +
             "L " + (x + (0.8 * w)) + ' ' + y + ' '  + 
             "L " + (x + (0.2 * w)) + ' ' + y + ' ' +
             "L " + (x + (0.2 * w)) + ' ' + (y + (.6 * h)) + ' ' +
             "L " +  x + ' ' + (y +  (.6 * h));


    },

    _renderCross: function(x,y, w, h) {
      horizontalStep = Math.floor(w / 3)
      verticalStep = Math.floor(h/ 3)
      return "M " + (x + horizontalStep)     + ' ' + y                      + ' ' +
             "L " + (x + w - horizontalStep) + ' ' + y                      + ' ' + 
             "L " + (x + w - horizontalStep) + ' ' + (y + verticalStep)     + ' ' + 
             "L " + (x + w)                  + ' ' + (y + verticalStep)     + ' ' + 
             "L " + (x + w)                  + ' ' + (y + h - verticalStep) + ' ' +
             "L " + (x + w - horizontalStep) + ' ' + (y + h - verticalStep) + ' ' +
             "L " + (x + w - horizontalStep) + ' ' + (y + h)                + ' ' +
             "L " + (x + horizontalStep)     + ' ' + (y + h)                + ' ' +
             "L " + (x + horizontalStep)     + ' ' + (y + h - verticalStep) + ' ' +
             "L " + x                        + ' ' + (y + h - verticalStep) + ' ' +
             "L " + x                        + ' ' + (y + verticalStep)     + ' ' +
             "L " + x + horizontalStep       + ' ' + (y + verticalStep)     + ' ' +
             "L " + x + horizontalStep       + ' ' + y;

    },

    _renderCrossPoints: function(x,y,w,h){
      var results = "", xValue , yValue;

      // first point
      xValue =  x + .2 * w;
      yValue = y;
      results = xValue + "," + yValue;

      // second point
      xValue =  x + .5 * w;
      yValue = y + 0.3 * h;
      results += ", " + xValue + "," + yValue;
      
      // third point
      xValue =  x + .8 * w;
      yValue = y
      results += ", " + xValue + "," + yValue;  

     //fourth point
      xValue =  x + w;
      yValue = y + .2 * h;
      results += ", " + xValue + "," + yValue;

      //fifth point
      xValue =  x + 0.7 * w;
      yValue = y + .5 * h;
      results += ", " + xValue + "," + yValue;

      //sixth point
      xValue =  x + w ;
      yValue = y + .8 * h;
      results += ", " + xValue + "," + yValue;

      //seventh point
      xValue =  x + .8 * w ;
      yValue = y + h;
      results += ", " + xValue + "," + yValue;

      //eighth point
      xValue =  x + .5 * w ;
      yValue = y + 0.7 * h
      results += ", " + xValue + "," + yValue;

      //nineth point
      xValue =  x + .2 * w ;
      yValue = y + h;
      results += ", " + xValue + "," + yValue;

      //tenth point
      xValue =  x ;
      yValue = y + .8 * h;
      results += ", " + xValue + "," + yValue;

      //eleventh point
      xValue =  x  + .3 * w;
      yValue = y + .5 * h;
      results += ", " + xValue + "," + yValue;

      //twelveth point
      xValue =  x;
      yValue = y + .2 * h;
      results += ", " + xValue + "," + yValue;
       
      return results;
    },


    _renderSquare: function(x, y, w, h){

      return "M " + x       + ' ' + y       + ' ' +
             "L " + x + w   + ' ' + y       + ' ' +
             "L " + (x + w) + ' ' + (y + h) + ' ' +
             "L " + x       + ' ' + (y + h) + ' ' +
             "L " + x       + ' ' + y ;
    },

    _renderSummetUpTriangle: function(x, y, w, h){

      return  "M " + (x + .5 * w) + ' ' + y       + ' ' +
              "L " + (x + w)      + ' ' + (y + h) + ' ' +
              "L " + x            + ' ' + (y + h) + ' ' +
              "L " + (x + .5 * w) + ' ' + y;
    },

    _renderSummetDownTriangle: function(x, y, w, h){

      return  "M " + x       + ' ' + y + ' ' +
              "L " + (x + w) + ' ' + y + ' ' +
              "L " + (x + .5 * w) + ' ' + (y + h) + ' ' +
              "L " + x + ' ' + y;
    },

    _renderStar: function(x, y, w, h){
      return "M " + (x + .5 * w) + ' ' + (y + h * .05) + ' '  + 
             "L " + (x + .2 * w) + ' ' + (y + h - (.05 * h))  + ' ' +
             "L " + (x + (w - .05 * w)) + ' ' + (y + 0.4 * h) + ' ' +
             "L " + (x + .05 * w) + ' ' + (y + 0.4 * h)       + ' ' +
             "L " + (x + .8 * w) + ' ' + (y + h - (.05 * h))  + ' ' +
             "L " + (x + .5 * w) + ' ' + (y + h * .05) ; 
    },
    

    _renderStarPoints: function (cX, cY, arms, outerRadius, innerRadius)
    {
      var results = "";
      var angle = Math.PI / arms;

      for (var i = 0; i < 2 * arms; i++)
      {
        var r = (i & 1) == 0 ? outerRadius : innerRadius;
        var currX = cX + Math.cos(i * angle) * r;
        var currY = cY + Math.sin(i * angle) * r;
  
        if (i == 0)
        {
          results = currX + "," + currY;
        } else {
          results += ", " + currX + "," + currY;
        }
      }

   return results;
},
    /*_renderStarAsPoints: function(x, y, w, h){
      return (x + .5 * w).toString()      +',' + (y + h * .05).toString()       + ' ' + 
             (x + .2 * w).toString()       +',' + (y + h - (.05 * h)).toString() + ' ' +
             (x + (w - .05 * w)).toString()+',' + (y + 0.4 * h).toString()       + ' ' + 
             (x + .05 * w).toString()      +',' + (y + 0.4 * h).toString()       + ' ' + 
             (x + .8 * w).toString()       +',' + (y + h - (.05 * h)).toString()             
    },*/

    

    _addIdicator: function(svg, ix, iy,fontSize){

      return svg.append('text')
            .attr('id', this.id)
            .attr('x', ix)
            .attr('y',iy)               
            .attr('font-family','sans-serif')
            .attr('font-size', fontSize + 'px')
            .attr('font-weight', 900 )
            .attr('stroke', this.stroke_color)         
            .attr('text-anchor','middle')
            .attr('fill', this.fill_color)
            .text(this.indicator)
            .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });       
    },
    
    _visualizeFaceUpArrowChart: function(){

    	var self = lang.hitch(this);

      //if (this.data == undefined) return;

    	var width = this.svgWidth,  
            height = this.svgHeight;            

      var x = this.margin.top,
          y = this.margin.left, 
          w = (this.show_indicator)? (width - this.margin.right - this.margin.left) / 2 : (width - this.margin.right - this.margin.left),
          h = height - this.margin.top - this.margin.bottom;
        

      var max_indicator_length = w,
          fontSize = 1.5 * Math.round(max_indicator_length / this.indicator.toString().length);

      var ix = x + (1.5 * w),
          iy = y + (0.5 * h) + fontSize/2 ;    
      
      var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)                    
                .attr('id', this.id)
                .append ('g')
                   .attr('id', this.svgId);
              

      svg.append('path')            		
        	 	.attr('d', this._renderFaceUpArrow(x, y, w, h))
        	 	.attr('stroke', this.stroke_color)
        	 	.attr('stroke-width',this.stroke_width)
        	 	.attr('fill',this.fill_color)
            .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });

      if (this.show_indicator){
          this._addIdicator(svg, ix, iy,fontSize);
      }
    },

    _visualizeFaceDownArrowChart : function(){

      var self = lang.hitch(this);

     // if (this.data == undefined) return;

      var width = this.svgWidth,  
          height = this.svgHeight;            

      var x = this.margin.top,
          y = this.margin.left, 
          w = (this.show_indicator)? (width - this.margin.right - this.margin.left) / 2: (width - this.margin.right - this.margin.left),
          h = height - this.margin.top - this.margin.bottom;
        

       var max_indicator_length = w,
          fontSize = 1.5 * Math.round(max_indicator_length / this.indicator.toString().length);

      var ix = x + (1.5 * w),
          iy = y + (0.5 * h) + fontSize/2 ;      
       
      
      var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)
                .attr('id', this.id)
                .append ('g')
                  .attr('id', this.svgId);
              

      svg.append('path')               
            .attr('d', this._renderFaceDownArrow(x, y, w, h))
            .attr('stroke', this.stroke_color)
            .attr('stroke-width',this.stroke_width)
            .attr('fill',this.fill_color)
            .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });

      if (this.show_indicator){
        this._addIdicator(svg, ix, iy,fontSize);
      }      

    }, 

    _visualizeCircleChart: function(){

      var self = lang.hitch(this);
      
      //if (this.data == undefined) return;
     
      var width = this.svgWidth,  
          height = this.svgHeight; 

      var x = this.margin.top,
          y = this.margin.left, 
          w = (this.show_indicator)? (width - this.margin.right - this.margin.left) / 2: (width - this.margin.right - this.margin.left),
          h = height - this.margin.top - this.margin.bottom ,
          cx = x + (0.5 * w),
          cy = y + (0.5 * h),
          r = d3.min([w,h]) / 2;
              

      var max_indicator_length = w,
          fontSize = 1.5 * Math.round(max_indicator_length / this.indicator.toString().length); 

      var ix = x + (1.5 * w) ,
          iy = y + (0.5 * h) + fontSize/2;      

      var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)
                .attr('id', this.id)
                .append ('g')
                  .attr('id', this.svgId); 

      svg.append('circle')
        .attr('cx', cx)
        .attr('cy',cy)           
        .attr('r',r)
        .attr('stroke', this.stroke_color)
        .attr('stroke-width',this.stroke_width)
        .attr('fill',this.fill_color)
        .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });

      if (this.show_indicator){
          this._addIdicator(svg, ix, iy,fontSize);
      }    

    },

    _visualizeCrossChart: function(){

      var width = this.svgWidth,  
          height = this.svgHeight; 


      var x = this.margin.top,
          y = this.margin.left, 
          w = (this.show_indicator)? (width - this.margin.right - this.margin.left) / 2: (width - this.margin.right - this.margin.left),
          h = height - this.margin.top - this.margin.bottom,
          cx = x + (0.5 * w),
          cy = y + (0.5 * h);
          

       var max_indicator_length = w,
          fontSize = 1.5 * Math.round(max_indicator_length / this.indicator.toString().length);

      var ix = x + (1.5 * w),
          iy = y + (0.5 * h) + fontSize/2 ;  
          
       var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)                
                .attr('id', this.id)
               // .attr("transform", function(d) { return "translate(" + x + "," + y + ")"; })
                .append ('g')
                  .attr('id', this.svgId); 


     /*svg.append('path')               
            .attr('d', this._renderCross(x, y, w, h))
            .attr("transform", function(d) { return "rotate(45 "+cx+","+cy+")"; })
            .attr('stroke', this.stroke_color)
            .attr('stroke-width',this.stroke_width)
            .attr('fill',this.fill_color)
            .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });*/

         svg.append('polygon')               
            .attr('points', this._renderCrossPoints(x, y, w, h))
          //  .attr("transform", function(d) { return "rotate(45 "+cx+","+cy+")"; })
            .attr('stroke', this.stroke_color)
            .attr('stroke-width',this.stroke_width)
            .attr('fill',this.fill_color)
            .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });
      if (this.show_indicator){
        this._addIdicator(svg, ix, iy,fontSize);
      }       
    },

    _visualizeSquareChart: function(){

      var width = this.svgWidth,  
          height = this.svgHeight; 


      var x = this.margin.top,
          y = this.margin.left, 
          w = (this.show_indicator)? (width - this.margin.right - this.margin.left) / 2: (width - this.margin.right - this.margin.left),
          h = height - this.margin.top - this.margin.bottom;
          

       var max_indicator_length = w,
          fontSize = 1.5 * Math.round(max_indicator_length / this.indicator.toString().length);

      var ix = x + (1.5 * w),
          iy = y + (0.5 * h) + fontSize/2 ;  
          
      var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)                
                .attr('id', this.id)
                .attr("transform", function(d) { return "translate(" + x + "," + y + ")"; })
                .append ('g')
                  .attr('id', this.svgId); 

      svg.append('path')               
            .attr('d', this._renderSquare(x, y, w, h))
            .attr('stroke', this.stroke_color)
            .attr('stroke-width',this.stroke_width)
            .attr('fill',this.fill_color)
            .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });
      if (this.show_indicator){
        this._addIdicator(svg, ix, iy,fontSize);
      }
    },

    _visualizeSummetUpTriangleChart: function(){

      var width = this.svgWidth,  
          height = this.svgHeight; 


      var x = this.margin.top,
          y = this.margin.left, 
          w = (this.show_indicator)? (width - this.margin.right - this.margin.left) / 2: (width - this.margin.right - this.margin.left),
          h = height - this.margin.top - this.margin.bottom;
          

       var max_indicator_length = w,
          fontSize = 1.5 * Math.round(max_indicator_length / this.indicator.toString().length);

      var ix = x + (1.5 * w),
          iy = y + (0.5 * h) + fontSize/2 ;  
          
      var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)                
                .attr('id', this.id)
                .attr("transform", function(d) { return "translate(" + x + "," + y + ")"; })
                .append ('g')
                  .attr('id', this.svgId); 

      svg.append('path')               
            .attr('d', this._renderSummetUpTriangle(x, y, w, h))
            .attr('stroke', this.stroke_color)
            .attr('stroke-width',this.stroke_width)
            .attr('fill',this.fill_color)
            .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });
      if (this.show_indicator){
        this._addIdicator(svg, ix, iy,fontSize);
      }
    },

    _visualizeSummetDownTriangleChart: function(){
      var width = this.svgWidth,  
          height = this.svgHeight; 


      var x = this.margin.top,
          y = this.margin.left, 
          w = (this.show_indicator)? (width - this.margin.right - this.margin.left) / 2: (width - this.margin.right - this.margin.left),
          h = height - this.margin.top - this.margin.bottom;
          

       var max_indicator_length = w,
          fontSize = 1.5 * Math.round(max_indicator_length / this.indicator.toString().length);

      var ix = x + (1.5 * w),
          iy = y + (0.5 * h) + fontSize/2 ;  
          
      var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)                
                .attr('id', this.id)
                .attr("transform", function(d) { return "translate(" + x + "," + y + ")"; })
                .append ('g')
                  .attr('id', this.svgId); 

      svg.append('path')               
            .attr('d', this._renderSummetDownTriangle(x, y, w, h))
            .attr('stroke', this.stroke_color)
            .attr('stroke-width',this.stroke_width)
            .attr('fill',this.fill_color)
            .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });
      if (this.show_indicator){
        this._addIdicator(svg, ix, iy,fontSize);
      }
    },

    _visualizeStarChart: function(){
      var width = this.svgWidth,  
          height = this.svgHeight; 


      var x = this.margin.top,
          y = this.margin.left, 
          w = (this.show_indicator)? (width - this.margin.right - this.margin.left) / 2: (width - this.margin.right - this.margin.left),
          h = height - this.margin.top - this.margin.bottom,
          cx = x + (0.5 * w),
          cy = y + (0.5 * h),
          r = d3.min([w,h]) / 2;
          

       var max_indicator_length = w,
          fontSize = 1.5 * Math.round(max_indicator_length / this.indicator.toString().length);

      var ix = x + (1.5 * w),
          iy = y + (0.5 * h) + fontSize/2 ;  
          
      var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)                
                .attr('id', this.id)
                
                
                .attr("transform", function(d) { return "translate(" + x + "," + y + ")"; })
                .append ('g')
                  .attr('id', this.svgId); 

      svg.append('polygon')
          .attr("points",this._renderStarPoints(cx, cy,5, r, Math.round(r*0.6)))
          .attr('stroke', this.stroke_color)
            //.attr('stroke', this.fill_color)
          .attr('stroke-width',this.stroke_width)
          .attr('fill',this.fill_color)
          .on('click', function(){
                if (self.selectOnMap && self.onChartClick != undefined){
                         self.onChartClick();
                    }                                                  
            });
      if (this.show_indicator){
        this._addIdicator(svg, ix, iy,fontSize);
      }
    },

    getPDIndictorStyles: function(){
      return ['face-up-arrow',
                'face-down-arrow',
                'circle',
                'cross',
                'square',
                'summet-up-triangle',
                'summet-down-triangle',
                'star'];
    }
       
    	
 	}); 	
  });