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
 "esri/productiondashboard/D3Charts/D3BarChart",
 "dojo/domReady!"
 ], function (declare,lang,D3ChartEnum, PDChart) {

 	return declare("esri.productiondashboard.D3Charts.D3TrendChart",[PDChart], {
 		svgType                 : D3ChartEnum.TREND_CHART,    	
        dateFormat              : "%m/%d/%Y",   // see other date formats ZT https://github.com/mbostock/d3/wiki/Time-Formatting
        dateInterval            : "day"  , // other valid values: 'day' , 'month', 'year' 
        dataType                : 'date', // other valid values : 'number'
        data                    : [
                                    {d: "1/30/2015", value: 5},
                                    {d: "2/15/2015", value: 12},
                                    {d: "2/26/2015", value: 1},
                                    {d: "5/13/2015", value: 2},
                                    {d: "6/4/2015", value: 6},
                                    {d: "7/18/2015", value: 1},
                                    {d: "9/6/2015", value: 3},
                                    {d: "10/26/2015", value: 1},
                                    {d: "10/30/2015", value: 3},
                                    {d: "11/10/2015", value: 1},
                                    {d: "12/26/2015", value: 1}
                                  ],
        addDataCircles          : false,  
        wrapHAxisText           : false,                        
                                  
        postCreate: function (args) {
 		 	this.inherited(arguments);
            lang.mixin(this, args);
        },

        visualizeIt: function(data){
            if (data != undefined)
                   this.data = data;
            if (this.showSampleData){
                  switch (this.dataType){
                    case 'date':{
                        this.data =  [
                                        {d: "1/30/2012", value: 5},
                                        {d: "2/15/2012", value: 12},
                                        {d: "2/26/2013", value: 1},
                                        {d: "5/13/2013", value: 2},
                                        {d: "6/4/2013", value: 6},
                                        {d: "7/18/2014", value: 1},
                                        {d: "9/6/2014", value: 3},
                                        {d: "10/26/2014", value: 1},
                                        {d: "10/30/2014", value: 3},
                                        {d: "11/10/2015", value: 2},
                                        {d: "12/26/2015", value: 1}
                                  ];
                        break;
                    }
                    case 'number':{
                        this.data =  [
                                        {d: "1", value: 5},
                                        {d: "2", value: 12},
                                        {d: "3", value: 1},
                                        {d: "4", value: 2},
                                        {d: "5", value: 6},
                                        {d: "6", value: 1},
                                        {d: "7", value: 3},
                                        {d: "8", value: 1},
                                        {d: "9", value: 3},
                                        {d: "10", value: 2},
                                        {d: "11", value: 1}
                                  ];
                        break;
                    }
                }
            }   

            if (this.isThumbnailMode()){
                this.showHorizontalAxis = false;
                this.showVerticalAxis = false;
                this.startColor =  "red";
                this.endColor = "blue",
                //this.margin = {top: 5, right: 1, bottom: 5, left: 1}; 
                this.onChartClick = null;
                this.showChartTip = true;
            }

            this._visualizeTrendChart(this.data);        	
        },

        _prepareData: function(){
            var trendData = {
                    longestLabelLength: 0,
                    longuestValueLength:0,
                    lineCount: 1,
                    timeInterval: d3.time.day,
                    labelFormat: d3.time.format("%Y-%m-%d"),
                    data: [] 
                }
            var parseDate = d3.time.format(this.dateFormat).parse;
            this.dataType = this.dataType.toString().toLowerCase().trim();    
            if (this.dataType == 'date') {
                if (this.dateInterval == undefined) this.dateInterval = 'day';
                if (this.dateInterval != 'day' && this.dateInterval != 'month' && this.dateInterval != 'year') this.dateInterval = 'day';
                switch (this.dateInterval){
                    case "day": {
                        trendData.timeInterval = d3.time.day;
                        trendData.label_format = d3.time.format("%Y-%m-%d");
                        trendData.longestLabelLength = 12
                        trendData.lineCount = (this.ticksOrientation == 0)? 1: trendData.longestLabelLength;
                        break;
                    }
                    case "month":{
                        trendData.timeInterval = d3.time.month;
                        trendData.label_format = d3.time.format('%B %Y');
                        trendData.longestLabelLength = 15
                        trendData.lineCount = (this.ticksOrientation == 0)? (this.wrapHAxisText)? 2: 1 : trendData.longestLabelLength;
                        break;
                    }
                    case "year":{
                        trendData.timeInterval = d3.time.year;
                        trendData.label_format = d3.time.format('%Y');
                        trendData.longestLabelLength = 4;
                        trendData.lineCount = (this.ticksOrientation == 0)? 1: trendData.longestLabelLength;
                        break;
                    }
                }                
                for (var i = 0 ; i<this.data.length;i++){
                    trendData.data.push({d:parseDate(this.data[i].d), value:this.data[i].value});  
                     trendData.longuestValueLength = (trendData.longuestValueLength < this.data[i].value.toString().length)? 
                                this.data[i].value.toString().length 
                                : trendData.longuestValueLength;
                }               
                
            } else if (this.dataType == 'number') {
                trendData.lineCount = 1;
                for (var i = 0 ; i<this.data.length;i++){
                    if (this.data[i].d.toString().length > trendData.longestLabelLength) 
                        trendData.longestLabelLength = this.data[i].d.toString().length; 
                    trendData.longuestValueLength = (trendData.longuestValueLength < this.data[i].value.toString().length)? 
                                this.data[i].value.toString().length 
                                : trendData.longuestValueLength;
                    trendData.data.push({d:Number(this.data[i].d), value:this.data[i].value});
                }
            }
            return trendData;
        },

        _calculateHorizontalAxisLabelSize: function(currentfontsize, labelLength, lineCount){
            var size  = { width: 0, height: 0}
            var charWidthFator = .5, lineHeight = 1.2;
            if (lineCount == undefined || lineCount < 1) lineCount = 1;
            if (labelLength == undefined || labelLength < 1) lineCount = 1;
            if (currentfontsize == undefined || currentfontsize < 0) lineCount = 12;
            if (this.ticksOrientation == 0){
                size.width = Math.round(((labelLength + 2 ) * charWidthFator) * labelLength);
                size.height = Math.round(currentfontsize * lineCount * lineHeight);
            } else {
               size.width = Math.round(currentfontsize * lineHeight  * lineCount);
               size.height = Math.round(labelLength * currentfontsize * charWidthFator); 
            }
            return size;
        },

         _calculateVeritcalAxisLabelSize: function(currentfontsize){
             var size  = { width: 0, height: 0}             
             var charWidthFator = .5, lineHeight = 1.2;
             var maxValue = d3.max(this.data, function(d){return d.value;});
             var labelLength = maxValue.toString().length + 3;
              size.width =   Math.round(labelLength * currentfontsize *  charWidthFator);
              size.height = currentfontsize;
              return size;
         },
       
        _visualizeTrendChart: function(){

            this.clearContent();

            if (this.data == undefined) return;

            var self = lang.hitch(this);

            //var parseDate = d3.time.format(this.dateFormat).parse;
            this.dataType = this.dataType.toString().toLowerCase().trim();
            // validate data type 
            if (this.dataType != 'date' && this.dataType != 'number') {
                return;
            }
            
            var tooltip = d3.select('body').append('div')
                            .attr('id', this.svgId)                        
                            .style('position', 'absolute')
                            .style('padding', '0 10px')
                            .style('background', 'white')
                            .style('opacity', 0);

            var tooltipFunction = function(d){ return  d.value;}; 

            var trendData = this._prepareData();

            var currentMargin = {top: this.margin.top, right: this.margin.right, bottom: this.margin.bottom, left: this.margin.left};

            var currentfontsize =  Math.round(parseInt(this.getBodyStylePropertyValue('font-size')));

            var show_horizontal_axis = this.showHorizontalAxis,
                show_vertical_axis = this.showVerticalAxis,              
                h_ticks = this.maxHorizontalAxis,
                showHorizontalGridLines = this.showHorizontalGridLines,
                //linesInData = this._guessHAxisLabelLines(currentfontsize),
                maxLabelLines = trendData.lineCount,
                minHAxesFontSize = currentfontsize,
                minBottomMargin = this._calculateMinimumBottomMargin(currentfontsize,maxLabelLines,trendData.longestLabelLength),
                timeInterval = trendData.timeInterval,
                labelSize = this._calculateHorizontalAxisLabelSize(currentfontsize,trendData.longestLabelLength, trendData.lineCount),
                label_width = labelSize.width, label_format = trendData.labelFormat;
                

            /*var minLeftMargin = Math.round(this.fontWidthRatio * trendData.longestLabelLength * minHAxesFontSize + 0.6 * minHAxesFontSize);*/
            var minLeftMargin = Math.round(this.fontWidthRatio * trendData.longuestValueLength * minHAxesFontSize);
            
            if (currentMargin.left  < minLeftMargin ) {
                    currentMargin.left = currentMargin.left + minLeftMargin; 
            }


            if (show_vertical_axis){
                minLeftMargin =  d3.max([this._calculateVeritcalAxisLabelSize(currentfontsize).width,minLeftMargin]);
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

            if (!this.wrapHAxisText && this.dataType != 'date')            
                minHAxesFontSize = this._calculateOptimumHorizontalFontSize(minHAxesFontSize,width,trendData.longestLabelLength, maxLabelLines);

            // Set the ranges

            var x = (this.dataType == 'date')? d3.time.scale().range([0, width]):
                    (this.dataType == 'number')? d3.scale.linear().range([0, width]):                       
                    null;
            if (x == undefined) return;
           
            var data = trendData.data;

            var maxValue = d3.max(this.data, function(d){return d.value;});           
            var y = d3.scale.linear()
                    .range([height, 0])
                    .domain([0, maxValue]);   
            
            var max_label_ct = width / label_width, label_skip = Math.ceil( data.length / max_label_ct) ;
            
            var hAxis = d3.svg.axis();
                
            if (this.dataType == 'date'){
                x.domain(d3.extent(data, function(d) { return d.d; }))
                
                hAxis.scale(x)
                hAxis.orient("bottom");

                if (timeInterval == null || timeInterval == undefined){
                    x.nice(this.maxHorizontalAxis)   
                } else {
                    x.nice(timeInterval, 1);   
                }

                var datesExtent = d3.extent(data, function(d) { return d.d; })
                /*var t1 = datesExtent[0], t2 = datesExtent[1];*/ 
                label_skip = Math.ceil(timeInterval.range( datesExtent[0], datesExtent[1]).length / max_label_ct);
                switch (this.dateInterval)
                {
                    case 'day':{
                        hAxis.tickValues(timeInterval.range(datesExtent[0], datesExtent[1]).filter(function(d, i) {
                                    return !(i % label_skip); 
                                }))
                            .tickFormat(d3.time.format('%Y-%m-%d'));
                        break;
                    }
                    case 'month':{
                        hAxis.tickValues(timeInterval.range(datesExtent[0], datesExtent[1]).filter(function(d, i) {
                                    return !(i % label_skip); 
                                }))
                            .tickFormat(d3.time.format('%B %Y'));
                        break;
                    }
                    case 'year':{
                        hAxis.tickValues(timeInterval.range(datesExtent[0], datesExtent[1]).filter(function(d, i) {
                                    return !(i % label_skip); 
                                })) 
                            .tickFormat(d3.time.format('%Y'));
                         break;
                    }                    
                }   
            } 
            if (this.dataType == 'number'){
                var tValues = data.filter(function(d, i) {
                                    return !(i % label_skip); 
                                });
                var maxData = d3.max(tValues, function(d){return d.d;});
                
                x.domain([0, maxData]);
                
                hAxis.scale(x)
                    .orient("bottom")
                    .ticks(tValues.length)
                   // .ticks(tValues);
            } 

             // Define the line
            var valueLine = d3.svg.line()
                .interpolate('basis')                        
                .x(function(d) {
                         return x(d.d); 
                })
                .y(function(d) { 
                    return y(d.value); 
                });

            var svgId = this.getId()
            
            var svg = this.chart = d3.select(this.domNode)                      
                    .attr("width", width)
                    .attr("height", height)
                    .attr('id',this.id)
                    .append("g")
                       .attr('id',this.svgId)
                       .attr("transform", 
                          "translate(" + currentMargin.left + "," +currentMargin.top + ")");

            svg.append("path")
                .attr("stroke", this.startColor)
                .attr("stroke-width",2)
                .attr("fill", "none")
                .attr("d", valueLine(data));   

            var tempColor;    
            if (this.addDataCircles){
                svg.selectAll('circle')
                .data(data)
                .enter().append('circle')
                    .attr('id',this.svgId)
                    .attr('cx', function(d){
                        return x(d.d);
                    })
                    .attr('cy', function(d){
                        return y(d.value);
                    })
                    .attr('r', 3)
                    .attr("stroke", this.startColor)
                    .attr("fill", 'white')
                    .on('mouseover', function(d){
                        if (self.showChartTip){
                            tooltip.transition()
                                .style('opacity', .9);
                            tooltip.html(tooltipFunction(d))                                 
                                .style('left',(d3.event.pageX) + 'px')
                                .style('top', (d3.event.pageY) + 'px');
                            tempColor = this.style.fill;
                            d3.select(this)
                                .style('opacity', 1)
                                .style('fill', self.startColor);
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
            }
            

            var vAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .ticks(v_ticks);

            var vGuideScale = d3.scale.linear()
                                 .domain([0, maxValue])
                                 .range([height, 0]);

            var yGrid = d3.svg.axis()
                        .scale(vGuideScale)
                        .tickSize(width)     
                        .orient("right")
                        .tickFormat("");                     

             var vGuide;            
            if (show_vertical_axis){
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
                    .attr('w',width )
                    .attr("dx", function(){                                                
                        if (self.ticksOrientation == 0 || self.ticksOrientation == 180) return "-.8em";                       
                        return "-.8em";
                    })
                    .attr("dy", function(){
                        var currentfontsize = Number(d3.select(this).attr("currentfontsize"));
                        var w = Number(d3.select(this).attr("w"));
                        if (self.ticksOrientation == 0 || self.ticksOrientation == 180) return ".55em";
                        if (self.ticksOrientation == 90 && self.wrapHAxisText) return "-" + ((Math.round(w / self.maxHorizontalAxis) / 2) / currentfontsize) + "em";
                        return "-.55em";
                    })
                    .attr('font-size', minHAxesFontSize + "px")
                    .attr("transform", "rotate(-"+this.ticksOrientation+")" )
               if (this.wrapHAxisText) {
                 if (this.ticksOrientation == 0)
                        hGuide.selectAll("text")
                             .call(self.wrap, Math.round(width / this.maxHorizontalAxis)); 
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