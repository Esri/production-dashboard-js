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
],function(declare,lang,D3ChartEnum, D3Chart){
	return declare("esri.productiondashboard.D3charts.D3PieChart",[D3Chart], {
		svgType                     : D3ChartEnum.PIE_CHART,
        baseClass                     :"D3PieChart",       
        data                        : [
                                        {d: 207, value:'Start Wars'},
                                        {d: 3, value:'Lost In Space'},
                                        {d: 20, value:'The Boston Pops'},
                                        {d: 150, value:'Indiana Jones'},
                                        {d: 75, value:'Harry Potter'},
                                        {d: 5, value:'Jaws'},
                                        {d: 1, value:'Lincoln'},
                                        /*{d: 55, value:'55'},
                                        {d: 89, value:'89'}*/
                                     ],
        donut_factor                : 0,
        tweenDuration               : 250,
      /*  textOffset                  : 14,*/
        showLabelTotal              : false,
        placeWedgeLabel             : 'aroundPie',  // possible values : 'aroundPie',  'insideWedge', 'onWedgeHover'
        labelContent                : 'data&label',   // possible values : 'data', 'label', 'data&label' 
       

        

        postCreate: function(args){
            this.inherited(arguments);                
        }, 
       

        clearContent:function(){
            var selector =  '#'+this.svgId;
            d3.selectAll(selector).remove();
        },

        visualizeIt: function(data){

            if (data != undefined) {
                this.data = data;
            }

            if (this.isThumbnailMode()){
                this.showLabelTotal = false;
                this.donut_factor = 0;
                this.container = null;
                this.margin = {top: 1, right: 1, bottom: 1, left: 1}; 
                this.onChartClick = null;
                this.showChartTip = true;                
            }
            
            switch (this.placeWedgeLabel){
                case 'onWedgeHover':{
                  this._visualizeWithLabelOnWedgeHover();
                  break;
              }
              case 'aroundPie':{
                this._visualizeWithLabelAroundPie();
                break;
              }
              case 'insideWedge':{
                // not supported for now.
                break;
              }
            } 
 
        },

        _visualizeWithLabelOnWedgeHover: function(){
            this.clearContent();
            
            var self = lang.hitch(this);
            var cMargins =  {top: this.margin.top, right: this.margin.right, bottom: this.margin.bottom, left: this.margin.right};            
            var width = Math.floor(this.svgWidth),
                height = Math.floor(this.svgHeight);

            var xCenter =  Math.floor(width / 2),
                yCenter = Math.floor(height / 2), 
                radius = ( d3.min([2 * xCenter, 2 * yCenter]) - (cMargins.left + cMargins.right)) /2,
                donutWidth = radius * this.donut_factor,
                totalData = 0;

            var donut = d3.layout.pie()
                    .value(function(d){
                            return d.d;
                        })
                    .sort(function(a,b){
                        return a.d - b.d; 
                    });

            var pieData =  donut(this.data);
            
            var filteredPieData = pieData.filter(function(d,i){
                totalData += d.data.d;
                return (d.data.d > 0);
               });
            totalData = totalData.toFixed(1);

            // decide wether or not to use colorRamp
            var colors , useRampArray = false;
            if (this.useColorRamp && 
                 this.colorRamp != undefined && 
                 this.colorRamp.constructor === Array  && 
                 this.colorRamp.length > 0) {
                useRampArray = true;
            } else {
                colors =  d3.scale.category20();
                useRampArray = false;    
            }

            var tempColor;

            var tip = d3.select(this.parent())
                .append('div')
                .attr('id', this.svgId)
                .attr('class', 'PieChart_Label')                
                .style('opacity', 0);
             

            var angle = function(d) {
                var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
                return a > 90 ? a - 180 : a;
            };  

            onMouseHoverLabel = function(context, tip, d,i,totalData){
                tip.transition().style('opacity', .5);  
                var percentage = (d.data.d/totalData)*100;          
                if (context.labelContent.indexOf('data&label') >= 0 ){
                    tip.html(d.data.value+' (<strong>'+percentage.toFixed(1) +'%</strong>)');                                                
                } else if (context.labelContent.indexOf('data') >= 0) {
                    tip.html(percentage.toFixed(1) + "%");
                } else if (context.labelContent.indexOf('label') >= 0){
                    tip.html(d.data.value);
                }

                var left = arc.centroid(d)[0] + radius, top = arc.centroid(d)[1] + radius;
                tip.style('left',left + 'px')
                   .style('top', top  + 'px');
                   //.style('background', color(i));                                                   
            };

            var arc = d3.svg.arc()
                .startAngle(function(d){ return d.startAngle; })
                .endAngle(function(d){ return d.endAngle; })
                .innerRadius(donutWidth)
                .outerRadius(radius)
                .padAngle(.01);

            var svg = this.chart = d3.select(this.domNode)
                .attr('id', this.id)
                .attr('width', width )
                .attr ('height', height);    

            var centerTranslation = 'translate('+ xCenter +','+ yCenter +')';    

            var arc_group = svg.append("g")
                .attr('id', this.svgId)
                .attr("class", "arc")
                .attr("transform", centerTranslation);

            var label_group = svg.append("g")
                .attr('id', this.svgId)
                .attr("class", "label_group")
                .attr("transform", centerTranslation);

            
            var paths = arc_group.append("circle")
                .attr('id', this.svgId)
                .attr("fill", "#EFEFEF")
                .attr("r", radius);

            if (this.showLabelTotal) {
                // Draw totaldata label
                this._showTotalLabel(svg,centerTranslation,donutWidth,totalData);
            }

            // Draw arc paths
            paths = arc_group.selectAll('path').data(filteredPieData)
                .enter()
                .append('path')
                    .attr('stroke','white')
                    .attr('stroke-width', 0.5)
                    .attr('fill', function(d,i){
                        return (useRampArray)? self.colorRamp[i %= self.colorRamp.length]: colors(i);
                    })
                    .on('click', function(d,i){
                        if (self.selectOnMap && self.onChartClick != undefined){
                             self.onChartClick(d,i);
                        }                                                  
                    });

            paths.transition()
                    .duration(this.tweenDuration)
                    .attrTween('d', function(d,i){
                            var i = d3.interpolate({startAngle: 0, endAngle: 0}, {startAngle: d.startAngle, endAngle: d.endAngle});
                            return function(t) {
                                var b = i(t);
                                return arc(b);
                            };
                        });

            paths.filter(function(d) { return d.endAngle - d.startAngle <= .2; })  
                .on('mouseover', function(d,i){ 
                    tempColor = this.style.fill;     
                    onMouseHoverLabel(self,tip, d,i,totalData);    
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

            // Draw labels with percentage values
            paths.on('mouseover', function(d,i){ 
                        tempColor = this.style.fill;     
                        onMouseHoverLabel(self, tip, d,i,totalData);    
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
    
        },

        _showTotalLabel: function(svg, centerTranslation,donutWidth, total){
            if (svg == undefined) return;

            var center_group = svg.append("g")
                    .attr('id', this.svgId)                   
                    .attr("class", "center_group")
                    .attr("transform", centerTranslation);

            var whiteCircle = center_group.append("circle")                                    
                    .attr("fill", "white")
                    .attr("r", donutWidth);   

            var totalLabel = center_group.append("text")                    
                    .attr("class", "label")
                    .attr("dy", -15)
                    .attr("text-anchor", "middle") 
                    .text("TOTAL");

            var totalValue = center_group.append("svg:text")                    
                    .attr("class", "total")
                    .attr("dy", 7)
                    .attr("text-anchor", "middle") // text-align: right
                    .text("Waiting...");
            if (total != undefined && !isNaN(total)){
                    totalValue.text(total);
            }            

        },

        _visualizeWithLabelAroundPie: function (){
            this.clearContent();

            var self = lang.hitch(this);            
            var cMargins =  {top: this.margin.top, right: this.margin.right, bottom: this.margin.bottom, left: this.margin.right};
            var width = Math.floor(this.svgWidth),
                height = Math.floor(this.svgHeight);

            var lengthiestValue = d3.max(this.data.map(function(d){ return d.value.toString().length})),
                currentfontsize =  Math.round(parseInt(this.getBodyStylePropertyValue('font-size')));

            var widthMargin = cMargins.left + cMargins.right + 2 * currentfontsize * lengthiestValue * .5    
            var w = width -  widthMargin,
                h = height;
            var oRadius = 0;
            if (w < h){
               oRadius = (w - w * .4) * .5; //account for label lines extend beyond arcs
            } else {
               oRadius = (h - w * .4) * .5;
            }
            var dMin = d3.min([width, height]);
            if (oRadius < dMin * .2){
                oRadius = dMin * .2
            }


            var xCenter = width/2, 
                yCenter = height/2, 
                iRadius = oRadius * this.donut_factor;
                labelRadius = oRadius * 1.1,
                totalData = 0;

            var donut = d3.layout.pie()
                    .value(function(d){
                            return d.d;
                        })
                    .sort(function(a,b){
                        return a.d - b.d; 
                    });

            var pieData =  donut(this.data);
            
            var filteredPieData = pieData.filter(function(d,i){
                totalData += d.data.d;
                return (d.data.d > 0);
               });
            totalData = totalData.toFixed(1);
    
            // decide wether or not to use colorRamp
            var colors , useRampArray = false;
            
            if (this.useColorRamp && 
                 this.colorRamp != undefined && 
                 this.colorRamp.constructor === Array  && 
                 this.colorRamp.length > 0) {
                useRampArray = true;
            } else {
                colors =  d3.scale.category20();
                useRampArray = false;    
            }

             var arc = d3.svg.arc()
                .startAngle(function(d){ 
                   return d.startAngle;
                 })
                .endAngle(function(d){ 
                  return d.endAngle; 
                })
                .innerRadius(iRadius)
                .outerRadius(oRadius)
                .padAngle(.02);


            var centerTranslation = 'translate('+ xCenter +','+ yCenter +')';            

            var svg = this.chart = d3.select(this.domNode)
                                    .attr('id', this.id)
                                    .attr("width", w)
                                    .attr("height", h);

            var arc_group = svg.append("g")
                .attr('id', this.svgId)                
                .attr("class", "arc")
                .attr("transform", centerTranslation);

            var label_group = svg.append("g")
                .attr('id', this.svgId)
                .attr("class", "label_group")
                .attr("transform", centerTranslation);

            var paths = arc_group.append("circle")                
                .attr('id', this.svgId)
                .attr("fill", "#EFEFEF")
                .attr("r", oRadius);           
     
            paths = arc_group.selectAll('path').data(filteredPieData)
                .enter()
                .append('path')                                     
                    .attr('fill', function(d,i){
                        return (useRampArray)? self.colorRamp[i %= self.colorRamp.length]: colors(i);;
                    });

            paths.transition()
               .duration(this.tweenDuration) 
               .attrTween('d', function(d,i){
                                var i = d3.interpolate({startAngle: 0, endAngle: 0}, {startAngle: d.startAngle, endAngle: d.endAngle});
                                return function(t) {
                                    var b = i(t);
                                    return arc(b);
                                };
                          }); 
           
            if (this.showLabelTotal) {
                // Draw totaldata label
                this._showTotalLabel(svg,centerTranslation,iRadius,totalData);
            }
 
            // add labels
            // add circles
            label_group.selectAll('circle').data(filteredPieData).enter()
                .append('circle')
                  .attr('x', 0) 
                  .attr('y', 0)
                  .attr('r',2)
                  .attr('transform', function (d, i) {
                              centroid = arc.centroid(d);
                              return "translate(" + arc.centroid(d) + ")";
                         })     
                  .attr('class',"label-circle");
                                          
            // add lines
            var lines;
            lines = label_group.selectAll('line').data(filteredPieData).enter()
                        .append('line')
                        .attr('x1', function(d,i){
                          return arc.centroid(d)[0];
                        })
                        .attr('y1', function(d,i){
                          return arc.centroid(d)[1];
                        })
                        .attr('x2', function(d,i){
                          centroid = arc.centroid(d);
                          midAngle = Math.atan2(centroid[1], centroid[0]);
                          x = Math.cos(midAngle) * labelRadius;
                          return x;
                        })
                        .attr('y2', function(d,i){
                          centroid = arc.centroid(d);
                          midAngle = Math.atan2(centroid[1], centroid[0]);
                          y = Math.sin(midAngle) * labelRadius;
                          return y;
                        })
                        .attr('class',"label-line");

            var labels
            labels = label_group.selectAll('text').data(filteredPieData).enter()
                      .append('text')
                        .attr('x', function(d,i){
                          centroid = arc.centroid(d);
                          midAngle = Math.atan2(centroid[1], centroid[0]);
                          x = Math.cos(midAngle) * labelRadius;
                          sign = (x>0)? 1:-1;
                          labelX = x + 5 * sign;
                          return labelX;
                        }) 
                        .attr('y', function(d,i){
                          centroid = arc.centroid(d);
                          midAngle = Math.atan2(centroid[1], centroid[0]);
                          y = Math.sin(midAngle) * labelRadius;
                          return y;

                        })
                        .attr('text-anchor', function(d,i){
                          centroid = arc.centroid(d);
                          midAngle = Math.atan2(centroid[1], centroid[0]);
                          x = Math.cos(midAngle) * labelRadius;
                          return (x > 0) ? "start" : "end";
                        })
                        .attr('class', 'label-text')
                        .text(function(d,i){
                            var percentage = (d.data.d/totalData)*100;    
                            if (self.labelContent.indexOf('data&label') >= 0 ){
                                return d.data.value + ' (' + percentage.toFixed(1) +'%)';                                                
                            } else if (self.labelContent.indexOf('data') >= 0) {
                                return percentage.toFixed(1) + "%";
                            } else if (self.labelContent.indexOf('label') >= 0){
                                return d.data.value;
                            }
                            return d.data.value;
                        });
            this._relaxLabelCollision(labels,labelRadius,lines);
   
        },

        _relaxLabelCollision: function(labels,labelRadius, lines){
            if (labels == undefined)  return;
            var   alpha = 0.5, spacing = 12;
            again = false;
            labels.each(function (d, i) {
            a = this;
            da = d3.select(a);
            y1 = da.attr("y");
            labels.each(function (d, j) {
                    b = this;
                    // a & b are the same element and don't collide.
                    if (a == b) return;
                    db = d3.select(b);
                    // a & b are on opposite sides of the chart and
                    // don't collide
                    if (da.attr("text-anchor") != db.attr("text-anchor")) return;
                    // Now let's calculate the distance between
                    // these elements. 
                    y2 = db.attr("y");
                    deltaY = y1 - y2;
                
                    // Our spacing is greater than our specified spacing,
                    // so they don't collide.
                    if (Math.abs(deltaY) > spacing) return;
                    
                    // If the labels collide, we'll push each 
                    // of the two labels up and down a little bit.
                    again = true;
                    sign = deltaY > 0 ? 1 : -1;
                    adjust = sign * alpha;
                    //adjust =  alpha;
                    var x1 = da.attr("x");
                    newLabelRadius = Math.sqrt(Math.pow(Number(y1)+adjust,2) + Math.pow(Number(x1),2))
                    if (newLabelRadius > labelRadius) da.attr("y",+y1 + adjust);
                    //da.attr("y",+y1 + adjust);
                    var x2 = db.attr("x");
                    newLabelRadius = Math.sqrt(Math.pow(Number(y2)-adjust,2) + Math.pow(Number(x2),2))
                    if (newLabelRadius > labelRadius)  db.attr("y",+y2 - adjust);
                });
            });
            // Adjust our line leaders here
            // so that they follow the labels. 
            if(again) {
                labelElements = labels[0];
                lines.attr("y2",function(d,i) {
                    labelForLine = d3.select(labelElements[i]);
                    return labelForLine.attr("y");
                });
                setTimeout(this._relaxLabelCollision(labels,labelRadius, lines),20)
            }
        }
            
	});        
});