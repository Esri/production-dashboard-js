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

 	return declare("esri.productiondashboard.D3Charts.D3GaugeChart",[D3Chart], {
 		
    	baseClass                   :"D3GaugeChart", 
        svgType                     : D3ChartEnum.GAUGE_CHART,        
        symbolStyle                 : 'half-donut-with-no-pointer',    // domain values : 'half-donut-with-pointer', 'half-donut-with-no-pointer', 'horizontal', 'veritcal'
        minValue                    : 10,
        maxValue                    : 100,
        threshold                   : 60,
        data                        : [{d: 40}],
        minAngle                    : -90,
        maxAngle                    : 90,
        donut_factor                : 0.4,
        pointerHeadLengthPercent    : 0.9,
        pointerWidth                : 10,
        pointerTailLength           : 5,       
        transitionMs                : 4500,
        pointerFillColor            : 'yellow',
        pointerStrokeColor          : 'red',
        startColor                  : "green",
        endColor                    : "#dfdfdf",
        thresholdColor              : null,
        pointerValueColor           : null,        
        labelFormat                 : d3.format(',g'),
        labelInset                  : -10,
        calculateValueMethod        : 'sum' , //values are : sum, average, max, count
        showLabels                  : false ,
        showThreshold               : false ,
        //container                   : null,
         
        
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
                this.donut_factor = 0.5;                                
                this.onChartClick = null;
                this.symbolStyle = 'half-donut-with-no-pointer';
                this.minAngle = -90;
                this.maxAngle = 90;
                this.minValue = 0;
                this.maxValue = 100;
                this.threshold = 60;  
                this.calculateValueMethod = ''
            }           
            this.data = this.data.sort(function(a,b){
                         var v1 = a.d,v2=b.d;
                         if (v1 < v2) return -1  //sort string ascending 
                         if (v1 > v2) return 1
                         return 0 //default return value (no sorting)
                     });     
            this.clearContent();
            this._adjustMaxValue(this.data); 
            switch(this.symbolStyle){
                case 'half-donut-with-pointer':{
                    this._visualizeHDWPGaugeChart(this.data);
                    break;
                }
                case 'half-donut-with-no-pointer':{
                    this._visualizeHDWNPGaugeChart(this.data);
                    break;
                }    
                case 'horizontal':{
                    this._visualizeHGaugeChart(this.data);
                    break;
                }
                case 'veritcal':{
                    this._visualizeVGaugeChart(this.data);
                    break;
                }
            }
                    	
        },

        _adjustMaxValue: function(data){
            if (data.length  == 1){
                if (this.maxValue < data[0].d ){
                    this.maxValue = data[0].d    
                }
            } else {
                    var sum  = data.reduce(function(sum, a) {return sum + a.d ;} ,0);
                    var count = data.length;
                    var max = d3.max(data.map(function(d){return d.d;}));
                    switch (this.calculateValueMethod){
                        case 'sum':
                            if (this.maxValue < sum )
                                this.maxValue  = Math.round(sum);
                            break;
                        case 'average':
                            var avg = sum / count
                            if (this.maxValue < avg )
                                this.maxValue  = Math.round(avg);                            
                            break;
                        case 'max':
                            if (this.maxValue < max )
                                this.maxValue  = Math.round(max);
                            break;
                        case 'count':
                            if (this.maxValue < count)
                                this.maxValue  = count;
                            break;                   
                    }    
            }
        }, 
    
        _newAngle: function(d) {
            //var ratio = scale(d);
            var newAngle = this.minAngle + (d * (this.maxAngle - this.minAngle));
            return newAngle;
        },

        _prepareGaugeData: function(data, scale){
            
            var colors = d3.scale.linear()
                 .domain([0,this.data.length+1])
                 .interpolate(d3.interpolateRgb)
                 .range([this.startColor, this.endColor]);    
            
            var gaugeData = {} ,
                startAngle, 
                endAngle, 
                tickValue,
                maxvalue = this.maxValue ,
                arcsData = [], 
                thresholdData = []; 

            if (this.calculateValueMethod == 'count'){
                data = [{d: scale(data.length) * this.maxValue}]; 
                this.data = data;
            }


            for(var i = 0;i<data.length;i++){

                startAngle = (i==0)? this.minAngle: this._newAngle(scale(data[i-1].d))               
                endAngle = this._newAngle(scale(data[i].d));                

                switch (this.calculateValueMethod){
                    case 'count':
                    case 'max':
                    case 'average':
                    case 'sum':
                        tickValue =  data[i].d;
                        break;                                        
                    default:       
                        tickValue = i;
                        maxvalue =  data.length;
                }
                
                arcsData.push(lang.mixin(data[i], {
                    startAngle: startAngle,
                    endAngle: endAngle,
                    color: colors(i),
                    tick: tickValue 
                }));            
            }

            if (arcsData.length == 1 && this.showThreshold) {  // we have only on data value, we are a testing whether its value is greater than threshold.
                if (arcsData[0].tick > this.threshold) {
                    arcsData[0].color = (this.thresholdColor != undefined) ? this.thresholdColor: this.startAngle ;
                }
            }
            
            if (endAngle < this.maxAngle){
                arcsData.push({
                    startAngle: endAngle,
                    endAngle: this.maxAngle ,
                    //color: (data.length == 1)? this.endColor : colors(arcsData.length),
                    color: (data.length == 1)? this.endColor : (this.thresholdColor != undefined)? this.thresholdColor:this.startColor,
                    tick: maxvalue 
                })
            }
            gaugeData.arcsData = arcsData;
            

            if (this.data.length == 1){
                 gaugeData.value = this.data[0].d;
                 gaugeData.value = Number(gaugeData.value.toFixed(2));
            } else{
                var sum  = data.reduce(function(sum, a) {return sum + a.d ;} ,0);
                var count = gaugeData.arcsData.length;
                var max = d3.max(data.map(function(d){return d.d;}));
                switch (this.calculateValueMethod){
                    case 'sum':
                        gaugeData.value =  Math.round(sum);
                        break;
                    case 'average':                        
                        gaugeData.value = Math.round(sum / count);
                        break;
                    case 'max':
                        gaugeData.value = Math.round(max);
                        break;
                    case 'count':
                        gaugeData.value = count ;
                        break;
                    default:           
                      gaugeData.value = count; 
                }
                gaugeData.value = Number(gaugeData.value.toFixed(2));
            }
            var labelData = [];

            labelData.push({
                            startAngle: this.minAngle,
                            endAngle: this.minAngle,
                            color: (this.pointerValueColor != undefined)? this.pointerValueColor: this.startColor ,
                            tick: Number(this.minValue.toFixed(2))
                        });

            labelData.push({
                            startAngle: this.minAngle,
                            endAngle: this.maxAngle,
                            color: (this.pointerValueColor != undefined)? this.pointerValueColor: this.startColor,
                            tick: Number(this.maxValue.toFixed(2))
                        });

            gaugeData.labelData = labelData;
            
            var thresholdStartAngle =  this._newAngle(scale(this.threshold));
            gaugeData.thresholdData = [ {   
                            startAngle: thresholdStartAngle,
                            endAngle: thresholdStartAngle * 1.02,
                            color: (this.thresholdColor != undefined)? this.thresholdColor : this.startColor,
                            tick: Number(this.threshold.toFixed(2))
                        }
                ];  

            return gaugeData;
        },
        
        _calculateMinimumLeftMargin: function(gaugeData, currentfontsize){
            var minLeftMarginFactor =  2 ;
            if (gaugeData == undefined || 
                gaugeData.labelData == undefined ) return minLeftMarginFactor * currentfontsize;
            for(var i = 0 ; i<gaugeData.labelData.length;i++){
               if (gaugeData.labelData[i].tick != undefined &&
                   gaugeData.labelData[i].endAngle != undefined){
                    if (gaugeData.labelData[i].tick.toString().length > minLeftMarginFactor &&
                        gaugeData.labelData[i].endAngle == this.minAngle ) {
                        minLeftMarginFactor = gaugeData.labelData[i].tick.toString().length 
                    }
               }
            }
            return minLeftMarginFactor * currentfontsize;
        },

        _calculateMinimumRightMargin: function(gaugeData, currentfontsize){
            var minRightMarginFactor =  1 ;
            if (gaugeData == undefined || 
                gaugeData.labelData == undefined ) return currentfontsize;
            for(var i = 0 ; i<gaugeData.labelData.length;i++){
               if (gaugeData.labelData[i].tick != undefined &&
                   gaugeData.labelData[i].endAngle != undefined){
                    if (gaugeData.labelData[i].tick.toString().length > minRightMarginFactor &&
                        gaugeData.labelData[i].endAngle == this.maxAngle ) {
                        minRightMarginFactor = gaugeData.labelData[i].tick.toString().length 
                    }
               }
            }
            return minRightMarginFactor * currentfontsize;
        },

        _visualizeHDWPGaugeChart: function(){

            var self = lang.hitch(this);

            if (this.data == undefined) return;

            var width = this.svgWidth,  
                height = this.svgHeight;

            

            var range = this.maxAngle - this.minAngle;

            var scale = d3.scale.linear()
                .range([0,1])
                .domain([this.minValue, this.maxValue]);

            var  gaugeData = this._prepareGaugeData(data,scale);    

            var currentfontsize =  Math.round(parseInt(this.getBodyStylePropertyValue('font-size')));
            
            var minLeftMargin = this.labelInset - this._calculateMinimumLeftMargin(gaugeData,currentfontsize);

            var minRightMargin = this._calculateMinimumRightMargin(gaugeData,currentfontsize) - this.labelInset;              
    
            if (this.margin.left > this.svgWidth) this.margin.left = 0;
            if (this.margin.right > this.svgWidth) this.margin.right = 0;
            if (this.showLabels && this.margin.left < 20) this.margin.left = 20;
            if (this.showLabels && this.margin.right < 20) this.margin.right = 20; 
           

            var radius = (this.svgWidth - this.margin.left - this.margin.right) / 2,
                xCenter = width / 2,
                yCenter = height / 2,
                donutWidth = radius * this.donut_factor,
                pointerHeadLength = Math.round(radius * this.pointerHeadLengthPercent),
                majorTicks = data.length;
               
                
            radius = ( d3.min([2 * xCenter, 2 * yCenter]) - (this.margin.left + this.margin.right)) /2 ;
            pointerHeadLength = Math.round(radius * this.pointerHeadLengthPercent);
            donutWidth = radius * this.donut_factor;
            
             var tip = d3.select(this.parent())
                .append('div')
                .attr('id', this.svgId)
                .style('border-style','solid')
                .style('border-width','medium')
                .style('border-color', 'black')
                .style('color','white')
                .style('position', 'absolute')
                //.style('padding', '0 10px')              
                .style('opacity', 0);
              
            var deg2rad = function(deg) {
                    return deg * Math.PI / 180;
            };
            
            var arc = d3.svg.arc()
                .innerRadius(radius - donutWidth)
                .outerRadius(radius)
                .startAngle(function(d) {               
                        return deg2rad(d.startAngle);
                })
                .endAngle(function(d, i) {
                    return deg2rad(d.endAngle);
                })
                .padAngle(.02);

            

            var threshold_arc = d3.svg.arc()
                .innerRadius(radius - donutWidth)
                .outerRadius(radius)
                .startAngle(function(d) {               
                    return deg2rad(d.startAngle);
                })
                .endAngle(function(d, i) {
                    return deg2rad(d.endAngle);
                });
            //adjust width and height
            width = width - this.margin.left - this.margin.right;

            var svg = this.chart = d3.select(this.domNode)
                    .attr('width', width )
                    .attr ('height', height);
           
            var centerTranslation = 'translate('+ xCenter +','+ yCenter +')';

            var arcs =  svg.append('g')
                        .attr('id', this.svgId)
                        .attr('transform',centerTranslation );

            arcs.selectAll('path')
                .data(gaugeData.arcsData)
                .enter()
                .append('path')
                    .attr('fill', function(d){
                        return d.color;
                    })
                    .attr('d', arc)
                    .on('click', function(d,i){
                        if (self.selectOnMap && self.onChartClick != undefined){
                            self.onChartClick(d,i);
                        }
                    })
                    .on('mouseover', function(d,i){
                        if (d.tick < self.maxValue)
                           indicator.text(self.labelFormat(d.tick));
                    })
                    .on('mouseout', function(d,i){
                        if (d.tick < self.maxValue) 
                           indicator.text(self.labelFormat(gaugeData.value));
                    });;
            
            if (this.showThreshold){
                var threshold_arcs = svg.append('g')
                .attr('class', 'arc')
                .attr('id', this.svgId)
                .attr('transform',centerTranslation);

                threshold_arcs.selectAll('path')
                    .data(gaugeData.thresholdData)
                    .enter()
                    .append('path')
                        .attr('fill', function(d){
                            return d.color;
                        })
                    .attr('d', threshold_arc);    
            }

            var gaugeLabels = svg.append('g')
                    .attr('id', this.svgId)
                    .attr('class', 'label')
                    .attr('transform',  centerTranslation);
                    
            
            if (this.showLabels){
                gaugeLabels.selectAll('text')            
                    .data(gaugeData.labelData)
                    .enter()
                    .append('text')
                        .attr('transform', function(d) {
                        return 'rotate(' +d.endAngle +') translate(0,' +(self.labelInset - radius) +')';
                    })
                    .attr('fill', function(d){ return d.color;})
                    .text(function(d){
                        return self.labelFormat(d.tick);
                });
            }
            
             var thresholdLabel = svg.append('g')
                .attr('class', 'label')         
                .attr('id', this.svgId)                
                .attr('transform', centerTranslation);

            thresholdLabel.selectAll('#thresholdTextId')
                .data(gaugeData.thresholdData)
                .enter()
                .append('text')
                    .attr('transform', function(d) {            
                        return 'rotate(' +d.endAngle +') translate(0,' +(self.labelInset - radius) +')';
                    })
                    .attr('fill', function(d){ return d.color;})
                    .text(function(d){
                        return self.labelFormat(d.tick);
                    });

            var lineData = [ [this.pointerWidth / 2, 0], 
                        [0, -pointerHeadLength],
                        [-(this.pointerWidth / 2), 0],
                        [0, this.pointerTailLength],
                        [this.pointerWidth / 2, 0] ];
            
            var pointerLine = d3.svg.line().interpolate('monotone');
            
            var pg = svg.append('g').data([lineData])
                .attr('id', this.svgId)
                .attr('fill', this.pointerFillColor)
                .attr('stroke',this.pointerStrokeColor)
                .attr('transform', centerTranslation);
                
            pointer = pg.append('path')
                .attr('id', this.svgId)
                .attr('d', pointerLine )
                .attr('transform', 'rotate(' +this.minAngle +')');

            var ratio = scale(gaugeData.value);

            var newAngle = this.minAngle + (ratio * range);

            pointer.transition()
                .duration(this.transitionMs)
                .ease('elastic')
                .attr('transform', 'rotate(' +newAngle +')');    
            
            yCenter = yCenter +   0.4 * height;
            centerTranslation = 'translate('+ xCenter +','+ yCenter +')';
            var indicator_text = gaugeData.value;
            var max_text_length = radius * 2;
            var fontsize = max_text_length / (indicator_text.toString().length + 1);            
            var indicator = svg.append('text')
                .attr('id', this.svgId)
                .attr('transform',centerTranslation)
                .attr('font-size', fontsize)
                .attr('text-anchor','middle')
                .attr('fill', (this.pointerValueColor != undefined)? this.pointerValueColor: this.startColor)
                .text( this.labelFormat(gaugeData.value));
         },
 	
        _visualizeHDWNPGaugeChart:function(data){
            var self = lang.hitch(this);

            var cMargins =  {top: this.margin.top, right: this.margin.right, bottom: this.margin.bottom, left: this.margin.right};         
 
            var width = this.svgWidth,  
                height = this.svgHeight;

            var range = this.maxAngle - this.minAngle;
            
            var scale = d3.scale.linear()
                .range([0,1])
                .domain([this.minValue, this.maxValue]);

            var  gaugeData = this._prepareGaugeData(data,scale); 

            var currentfontsize =  Math.round(parseInt(this.getBodyStylePropertyValue('font-size')));

            var minLeftMargin = this.labelInset - this._calculateMinimumLeftMargin(gaugeData,currentfontsize);

            var minRightMargin = this._calculateMinimumRightMargin(gaugeData,currentfontsize) - this.labelInset;    
                    
            if (this.margin.left > this.svgWidth) cMargins.left = 0;
            if (this.margin.right > this.svgWidth) cMargins.right = 0;
            
            var min_side_margins = this.svgWidth * 0.03;
            if (this.margin.right < min_side_margins) cMargins.right = min_side_margins;
            if (this.margin.left < min_side_margins) cMargins.left = min_side_margins;
            if (this.showLabels && this.margin.left < minLeftMargin) cMargins.left = minLeftMargin;
            if (this.showLabels && this.margin.right < minRightMargin) cMargins.right = minRightMargin;
           // if (this.showLabels && this.margin.bottom < 40) cMargins.bottom = 40;

            this.labelInset = - 0.02 * this.svgWidth;
            
            var xCenter = width / 2,
                yCenter = height - cMargins.bottom,
                radius = ( d3.min([2 * xCenter, 2 * yCenter]) - (cMargins.left + cMargins.right)) /2 ;
                donutWidth = radius * this.donut_factor;
                

            
            var tip = d3.select(this.parent()).append('div')
                .attr('id', "tooltip"+this.svgId)
                .style('top','05px')
                .style('left','05px')
                .style('border-style','solid')
                .style('border-width','medium')
                .style('border-color', 'black')
                .style('color','white')
                .style('position', 'absolute')
                .style('padding', '0 10px')
                .style('opacity', 0);            

            var deg2rad = function(deg) {
                    return deg * Math.PI / 180;
            };

             var arc = d3.svg.arc()
                .innerRadius(radius - donutWidth)
                .outerRadius(radius)
                .startAngle(function(d) {               
                        return deg2rad(d.startAngle);
                })
                .endAngle(function(d, i) {
                    return deg2rad(d.endAngle);
                })
                .padAngle(.02);

            var threshold_arc = d3.svg.arc()
                .innerRadius(radius - donutWidth)
                .outerRadius(radius)
                .startAngle(function(d) {               
                    return deg2rad(d.startAngle);
                })
                .endAngle(function(d, i) {
                    return deg2rad(d.endAngle);
                });

            //adjust width and height
            width = width - this.margin.left - this.margin.right;    

            var svg = this.chart = d3.select(this.domNode)
                    .attr('width', width )
                    .attr ('height', height);

            

            var centerTranslation = 'translate('+ xCenter +','+ yCenter +')';

            var arcs =  svg.append('g')
                        .attr('id', this.svgId)
                        .attr('transform',centerTranslation );

            // draw arcs
            arcs.selectAll('path')
                .data(gaugeData.arcsData)
                .enter()
                .append('path')
                    .attr('fill', function(d){
                        return d.color;
                    })
                    .attr('d', arc)
                    .on('click', function(d,i){
                        if (self.selectOnMap && self.onChartClick != undefined){
                            self.onChartClick(d,i);
                        }
                    });
                /*    .on('mouseover', function(d,i){
                        if (d.tick < self.maxValue)
                           indicator.text(self.labelFormat(d.tick));
                    })
                    .on('mouseout', function(d,i){
                        if (d.tick < self.maxValue) 
                           indicator.text(self.labelFormat(gaugeData.value));
                    });*/

            // draw indicator
            var indicator_text = this.isThumbnailMode()? '[Value]' :this.labelFormat(gaugeData.value);
            var max_text_length = (donutWidth != 0)? donutWidth * 2  :radius * 2;
            var fontsize = max_text_length / (indicator_text.toString().length + 1);            
            var indicator = svg.append('text')
                .attr('id', this.svgId)
                .attr('transform',centerTranslation)
                .attr('font-size', fontsize)
                .attr('text-anchor','middle')
                .attr('fill', (this.pointerValueColor != undefined)? this.pointerValueColor: this.startColor)
                .text(indicator_text);
          
            // draw threshold
            var threshold_arcs = svg.append('g')
                .attr('class', 'arc')
                .attr('id', this.svgId)
                .attr('transform',centerTranslation);

            if (this.showThreshold){
                threshold_arcs.selectAll('path')
                .data(gaugeData.thresholdData)
                .enter()
                .append('path')
                    .attr('fill', function(d){
                        return d.color;
                    })
                .attr('d', threshold_arc); 

                var thresholdLabel = svg.append('g')
                    .attr('class', 'label')         
                    .attr('id', this.svgId)                
                    .attr('transform', centerTranslation);
                
                thresholdLabel.selectAll('#thresholdSymbolId')
                    .data(gaugeData.thresholdData)
                    .enter()
                    .append('path')
                        .attr('transform', function(d) {
                            var angle = (d.endAngle + d.startAngle)/2          
                            return 'rotate(' +angle +') translate(0,' +(self.labelInset - radius)  +')';
                        })
                        .attr('fill', function(d){ return d.color;})
                        .attr('d', d3.svg.symbol().type('triangle-down').size(radius)) 
                        .on('mouseover', function(d) {
                            tempColor = this.style.fill;
                            tip.transition().style('opacity', .6); 
                            
                        tip.style('background', (self.thresholdColor != undefined)? self.thresholdColor: self.startColor)
                            .html('<label>Threshold:</label><strong>'+d.tick+'</strong><br/>'+
                                       '<label>Min Value:</label><strong>'+self.minValue+'</strong><br/>'+
                                       '<label>Max Value:</label><strong>'+self.maxValue+'</strong>');
                            
                        var top = d3.event.pageY, left = d3.event.pageX;    
                        var sWidth = tip.style("width"), width = Number(sWidth.substr(0, sWidth.indexOf('px'))) + cMargins.right;
                        if (width > 2 * radius) width = 2 * radius;
                        
                        tip.style('left','0' + 'px')
                            .style('top', '0' + 'px')
                            .style('width', width + 'px');
      
                        d3.select(this)
                            .style('opacity', .5)
                            .style('fill', 'yellow');      
                        })
                        .on('mouseout',function(d){
                            d3.select(this)
                               .style('opacity', 1)
                               .style('fill', tempColor);
                            tip.transition()
                                .style('opacity', 0);
                        });
             
            }
            
            

            if (this.showLabels){
                var gaugeLabels = svg.append('g')
                    .attr('id', this.svgId)
                    .attr('class', 'label')
                    .attr('transform',  centerTranslation);
                    
            
            //.attr('text-anchor', function(d){
                gaugeLabels.selectAll('text')            
                    .data(gaugeData.labelData)
                    .enter()                  
                    .append('text')
                       .attr('transform', function(d) {
                            if ( d.endAngle < 0 ){
                                return 'translate(' +(self.labelInset - radius) + ',0)'
                            } else {
                                return 'translate(' +(radius - self.labelInset) + ',0)'
                            }                       
                        })
                        .attr('text-anchor',function (d){
                             if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
                                    return "beginning";
                                } else {
                                    return "end";
                                }
                        })
                    .attr('fill', function(d){ return d.color;})
                        .text(function(d){
                        return self.labelFormat(d.tick);
                    });

                /*gaugeLabels.selectAll('text')
                    .attr("transform", "rotate(-65)" );
*/

            }
        },

        _visualizeHGaugeChart:function(data){

        },

        _visualizeVGaugeChart:function(data){

        },


    }); 	
  });