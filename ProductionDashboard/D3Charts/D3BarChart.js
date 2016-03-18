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
 "esri/productiondashboard/D3Charts/D3ChartEnum",
 "esri/productiondashboard/D3Charts/D3Chart",
 "dojo/domReady!"
 ], function (declare,lang,D3ChartEnum, D3Chart) {

 	return declare("esri.productiondashboard.D3Charts.D3BarChart",[D3Chart], {
 		svgType                 : D3ChartEnum.BAR_CHART,    	
        data           : [
                					{d: "26-Apr-12", value: 89.70},
                					{d: "25-Apr-12", value: 99.00},
                					{d: "24-Apr-12", value: 130.28},
                					{d: "23-Apr-12", value: 166.70},
                					{d: "20-Apr-12", value: 234.28},
                					{d: "19-Apr-12", value: 345.44},
                					{d: "18-Apr 12", value: 443.34},
                					{d: "17-Apr-12", value: 543.70}
                                  ],
     
        showHorizontalAxis      : false,
        showHorizontalGridLines : false,
        maxHorizontalAxis       : 5,
        ticksOrientation        : 0,
        showVerticalAxis        : false,        
        maxVerticalAxis         : 10,
        startColor              : "red",
        endColor                : "black",
        colorRamp               : [],
        showChartTip            : true,        
        d3DateFormat            : "%d-%b-%y",
        wrapHAxisText           : true,
        adjustBottomMargin      : true,
        useColorRamp            : true,
        fontWidthRatio          : 0.4,

		postCreate: function (args) {
 		 	this.inherited(arguments);
            lang.mixin(this, args);
        },

        clearContent:function(){        	
            var selector =  '#'+this.svgId;
            d3.selectAll(selector).remove();
            selector = selector + "tooltip"
            d3.selectAll(selector).remove();
        },

        visualizeIt: function(data){
            if (data != undefined)
                   this.data = data;
            if (this.isThumbnailMode()){
                this.showHorizontalAxis = false;
                this.showVerticalAxis = false;
                this.startColor =  "red";
                this.endColor = "blue",
                this.margin = {top: 5, right: 1, bottom: 5, left: 1}; 
                this.onChartClick = null;
                this.showChartTip = true;
            }
            this._visualizeBarChart();        	
        },

        _guessHAxisLabelLines: function(currentFontSize){
            var l = 1, lw=0;
            var cpl = (this.svgWidth - 20 - this.margin.left - this.margin.right) / this.data.length , charCounter = 0;
            cpl = Math.round(cpl / (currentFontSize * .66));
            var result = {lines:0, longuestWord:0}
            for(var i=0;i<this.data.length;i++){
                var d = this.data[i].d.toString(), lines = 1;
                if (this.wrapHAxisText){                    
                    var words = d.split(/\s+/)
                    //if (words.length > l) l = words.length;
                    while(word = words.pop()){
                        lines += Math.floor(word.length / cpl);
                        charCounter+=word.length % cpl;
                        if (charCounter > cpl){
                            lines++;
                            charCounter-=cpl; 
                        }
                        if (word.length > lw)
                            lw = word.length
                    }
                    if (lines > l) l = lines;
                } else {
                    if (d.length > lw ) {
                        lw = this.data[i].d.toString().length
                    } 
                                       
                }
                
            }
            result.lines = l;
            result.longuestWord = lw + 2; // count for two spaces wrapping the data
            return result;
        },

        _calculateMaxVerticalTicks:function(currentFontSize, height){
            var maxTicks = this.maxVerticalAxis;
            var step = Math.floor(height/currentFontSize);            
            while (step < maxTicks) {
                maxTicks = maxTicks / 2;
                if (maxTicks == 0) return 0;
            }
            return maxTicks;

        },

        _calculateOptimumHorizontalFontSize: function(currentFontSize, width, longuestWordSize, lines){
            var horizontalFontSize = currentFontSize;
            var ticksCount = this.data.length;
            if(this.ticksOrientation == 0){
                neededWidth = ticksCount * (longuestWordSize * currentFontSize * .5);
                if  (width < neededWidth ) {
                    // adjust fontsize
                    horizontalFontSize = Math.round(width / (longuestWordSize * ticksCount * .5))
                }       
            }
             if(this.ticksOrientation == 90){
                if (!this.wrapHAxisText){
                    neededWidth = ticksCount * currentFontSize ;
                    if  (width < neededWidth ) {
                        // adjust fontsize
                        horizontalFontSize = Math.round(width / currentFontSize);
                    }           
                } else {
                    neededWidth = ticksCount * currentFontSize * lines;
                    if  (width < neededWidth ) {
                        // adjust fontsize
                        horizontalFontSize = Math.round(width / (currentFontSize * lines));
                    }           
                }
                
             }
            return horizontalFontSize;
        },

        _calculateMinimumBottomMargin: function(currentFontSize, lines,longuestWordSize){
            var minBottomMargin = 0;
            var lineWidthFactor = 1.6;

            if(this.wrapHAxisText && this.ticksOrientation == 0){
                minBottomMargin = currentFontSize + Math.round(lines * currentFontSize * lineWidthFactor)
            }
            if(this.wrapHAxisText && this.ticksOrientation == 90){
                 minBottomMargin =  Math.round(longuestWordSize * currentFontSize * .66)
            }
            if(!this.wrapHAxisText && this.ticksOrientation == 0){
                minBottomMargin = lineWidthFactor * Math.round(currentFontSize)
            }
            if(!this.wrapHAxisText && this.ticksOrientation == 90){
                minBottomMargin = currentFontSize + Math.round(currentFontSize * longuestWordSize *.66)
            }
            return minBottomMargin;

        },

        _visualizeBarChart: function(){
            this.clearContent();
  
            if (this.data == undefined) return;

            var self = lang.hitch(this);

            var currentMargin = {top: this.margin.top, right: this.margin.right, bottom: this.margin.bottom, left: this.margin.left};

            var currentfontsize =  Math.round(parseInt(this.getBodyStylePropertyValue('font-size')));

            var show_horizontal_axis = this.showHorizontalAxis,
                show_vertical_axis = this.showVerticalAxis,              
                h_ticks = this.maxHorizontalAxis,
                showHorizontalGridLines = this.showHorizontalGridLines,
                linesInData = this._guessHAxisLabelLines(currentfontsize),
                maxLabelLines = linesInData.lines,
                minHAxesFontSize = currentfontsize
                minBottomMargin = this._calculateMinimumBottomMargin(currentfontsize,maxLabelLines,linesInData.longuestWord);
                      
            
            var maxValue = d3.max(this.data, function(d){
                                                return d.value;
                                             }),
                minLeftMargin = (maxValue.toString().length + 2) * currentfontsize * .8;  // counting for one decimal               
            
            if (show_vertical_axis){
                if (currentMargin.left  < minLeftMargin ) {
                    currentMargin.left = currentMargin.left + minLeftMargin; 
                }
            }
            if (show_horizontal_axis){
                if (currentMargin.bottom <  minBottomMargin) {
                    currentMargin.bottom = currentMargin.bottom + minBottomMargin;                    
                }
            }
            
            var width = this.svgWidth - currentMargin.left - currentMargin.right,
                height = this.svgHeight - currentMargin.top - currentMargin.bottom;
                

            var v_ticks = this._calculateMaxVerticalTicks(currentfontsize, height);
            if (v_ticks == 0 ){
                // make vertical axes unvisible
                show_vertical_axis = false;
                currentMargin.left = this.margin.left;
                currentMargin.right = this.margin.right;
                width = this.svgWidth - currentMargin.left - currentMargin.right;
            }

            // adjust horizontal font if no text wrapping 
            if (!this.wrapHAxisText)            
                minHAxesFontSize = this._calculateOptimumHorizontalFontSize(minHAxesFontSize,width,linesInData.longuestWord, maxLabelLines);
            
            var tempColor;
    
            var colors, useRampArray = false;
            if (this.useColorRamp && 
                 this.colorRamp != undefined && 
                 this.colorRamp.constructor === Array  && 
                 this.colorRamp.length > 0) {
                useRampArray = true;
            } else {
                colors = d3.scale.linear()
                     .domain([0,this.data.length])
                     .interpolate(d3.interpolateRgb)
                     .range([this.startColor, this.endColor]);
                 useRampArray = false;    
             }

            var yScale = d3.scale.linear()
                            .domain([0, maxValue])
                            .range([0, height]);     

            var xScale = d3.scale.ordinal()
                            .domain(d3.range(0, this.data.length))
                            .rangeBands([0, width], .2)         
            
            var tooltip = d3.select('body').append('div')
                            .attr('id', this.svgId+'tooltip')                        
                            .style('position', 'absolute')
                            .style('padding', '0 10px')
                            .style('background', 'white')
                            .style('opacity', 0);

            var dataTipProperty = this.getDataTipProperty();                

            var tooltipFunction = function(d){ return  d[dataTipProperty];}; 
            
            var svgId = this.svgId;
            
            var svg = this.chart = d3.select(this.domNode)
                      /*.attr('width', width + currentMargin.left + currentMargin.right)
                      .attr ('height', height + currentMargin.top + currentMargin.bottom)    */        
                      .attr('width', width)
                      .attr ('height', height)          
                      .attr('id',this.id)
                      .append('g')
                      .attr('id',this.svgId)
                      .attr('transform', 'translate('+ currentMargin.left +', ' + currentMargin.top +')')                      
                      .selectAll('rect').data(this.data)
                      .enter().append('rect')
                        .style('fill', function(d,i){
                            return (useRampArray)? self.colorRamp[i %= self.colorRamp.length]: colors(i);
                        })
                        .attr('width',xScale.rangeBand())
                        .attr('x', function(d,i){
                            return xScale(i);
                        })
                        .attr('height',0)
                        .attr('y',height)
                        .on('mouseover', function(d){
                            if (self.showChartTip){
                                tooltip.transition()
                                    .style('opacity', .9);
                                tooltip.html(tooltipFunction(d))                                 
                                    .style('left',(d3.event.pageX) + 'px')
                                    .style('top', (d3.event.pageY) + 'px');
                                tempColor = this.style.fill;
                                d3.select(this)
                                  .style('opacity', .5)
                                  .style('fill', 'yellow');    

                            }        
                        })
                        .on('mouseout', function(d){
                            if (self.showChartTip){
                                d3.select(this)
                                  .style('opacity', 1)
                                  .style('fill', tempColor);
                                tooltip.transition()
                                    .style('opacity', 0);
                            }
                        })
                        .on('click', function(d,i){
                            if(self.selectOnMap && self.onChartClick != undefined) {
                                self.onChartClick(d,i);
                            } 
                         });

            svg.transition()            
                .attr('height', function(d){
                    return yScale(d.value);
                })
                .attr('y', function(d){
                    return height - yScale(d.value);
                })
                .delay(function(d,i){
                    return i * 20;
                })
                .duration(1000)
                .ease('elastic');

            var vGuideScale = d3.scale.linear()
                                 .domain([0, maxValue])
                                 .range([height, 0])


            var vAxis = d3.svg.axis()
                        .scale(vGuideScale)
                        .orient('left') 
                        /*.tickFormat(d3.format('.1f'))*/
                        .ticks(v_ticks);


            var hAxis = d3.svg.axis()
                            .scale(xScale)
                            .orient('bottom')                              
                            .tickFormat(function(d) {           
                                return self.data[d].d;
                            })
                            .ticks(h_ticks);

            var yGrid = d3.svg.axis()
                        .scale(vGuideScale)
                        .tickSize(width)     
                        .orient("right")
                        .tickFormat("");

            var vGuide;
            if (show_vertical_axis) {
                vGuide = d3.select('#'+this.id)
                           .append('g')
                           .attr('id', this.svgId);

                vAxis(vGuide);
                vGuide.attr('transform', 'translate(' + currentMargin.left + ', ' + currentMargin.top + ')')
                vGuide.selectAll('path')
                      .style({ fill: 'none', stroke: "#000"})
                vGuide.selectAll('line')
                      .style({ stroke: "#000"});
            } 
    
            
            var hGuide;
            if (show_horizontal_axis){
                //hGuide = d3.select('svg').append('g')
                hGuide = d3.select('#'+this.id)
                            .append('g')
                            .attr('id', this.svgId)
                hAxis(hGuide);
                hGuide.attr('transform', 'translate(' + currentMargin.left + ', ' + (height + currentMargin.top) + ')');
                hGuide.selectAll('path')
                    .style({ fill: 'none', stroke: "#000"});
                hGuide.selectAll('line')
                   .style({ stroke: "#000"});
                hGuide.selectAll("text")
                    .style("text-anchor", function() {
                        if (self.ticksOrientation == 0 || self.ticksOrientation == 180) return "middle";
                        return "end";
                     })
                    .attr('currentfontsize',currentfontsize )
                    .attr("dx", function(){                                                
                        if (self.ticksOrientation == 0 || self.ticksOrientation == 180) return "-.8em";                       
                        return "-.8em";
                    })
                    .attr("dy", function(){
                        var currentfontsize = Number(d3.select(this).attr("currentfontsize"));
                        if (self.ticksOrientation == 0 || self.ticksOrientation == 180) return ".55em";
                        if (self.ticksOrientation == 90 && self.wrapHAxisText) return "-" + ((Math.round(xScale.rangeBand()) / 2) / currentfontsize) + "em";
                        return "-.55em";
                    })
                    .attr('font-size', minHAxesFontSize + "px")
                    .attr("transform", "rotate(-"+this.ticksOrientation+")" )
               if (this.wrapHAxisText) {
                 if (this.ticksOrientation == 0)
                        hGuide.selectAll("text")
                             .call(self.wrap, xScale.rangeBand()); 
                 if (this.ticksOrientation == 90)
                       hGuide.selectAll("text")
                             .call(self.wrap, minBottomMargin - currentfontsize );                                 
               }           
            }

            var yGridGuide;
            if (showHorizontalGridLines){
                yGridGuide = d3.select('#'+this.id)
                            .append('g')
                            .attr('id', this.svgId)

                yGrid(yGridGuide);
                yGridGuide.attr('transform', 'translate(' + currentMargin.left + ', ' + currentMargin.top + ')')
                yGridGuide.selectAll('path')            
                      .style({ display: 'none'})
                yGridGuide.selectAll('line')                      
                        .attr('stroke', 'lightgrey')
                        .attr('stroke-dasharray', '2,2');

            }            
        }   	
 	}); 	
  });