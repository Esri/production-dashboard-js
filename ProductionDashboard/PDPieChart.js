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
],function(declare,lang,PDChartEnum, PDChart){
	return declare("esri.productiondashboard.PDPieChart",[PDChart], {
		svgType                     : PDChartEnum.PIE_CHART,        
        data                        : [
                                        {d: 2, value:'2'},
                                        {d: 3, value:'3'},
                                        {d: 5, value:'5'},
                                        {d: 8, value:'8'},
                                        {d: 13, value:'13'},
                                        {d: 21, value:'21'},
                                        {d: 34, value:'34'},
                                        {d: 55, value:'55'},
                                        {d: 89, value:'89'}
                                     ],
        donut_factor                : 0,
        tweenDuration               : 250,
        textOffset                  : 14,
        showLabelTotal              : false,
        placeWedgeLabel             : 'onWedgeHover',  // possible values : 'aroundPie',  'insideWedge', 'onWedgeHover'
        labelContent                : 'data&label',   // possible values : 'data', 'label', 'data&label' 
       

        

        postCreate: function(args){
            this.inherited(arguments);
            lang.mixin(this, args);            
        }, 
       

        clearContent:function(){
            var selector =  '#'+this.svgId;
            d3.selectAll(selector).remove();
        },

        visualizeIt: function(data){
            
            this.clearContent();

        	var self = lang.hitch(this);
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
                //this.placeWedgeLabel = ' ';
               // this.labelContent = ' ';
            }

            var cMargins =  {top: this.margin.top, right: this.margin.right, bottom: this.margin.bottom, left: this.margin.right}; 

            var min_side_margins = this.svgWidth * 0.03;
            if (this.margin.right < min_side_margins) cMargins.right = min_side_margins;
            if (this.margin.left < min_side_margins) cMargins.left = min_side_margins;
            if (this.placeWedgeLabel == 'aroundPie' && this.margin.top < 45) cMargins.top = 45;
            if (this.placeWedgeLabel == 'aroundPie' && this.margin.left < 45) cMargins.left = 45;
            if (this.placeWedgeLabel == 'aroundPie' && this.margin.right < 45) cMargins.right = 45;
            if (this.placeWedgeLabel == 'aroundPie' && this.margin.bottom < 45) cMargins.bottom = 45;

       
            var width = this.svgWidth,
                height = this.svgHeight;

            var xCenter =  width / 2,
                yCenter = height / 2, 
                radius = ( d3.min([2 * xCenter, 2 * yCenter]) - (cMargins.left + cMargins.right)) /2,
                donutWidth = radius * this.donut_factor;

            var lines, 
                valueLabels, 
                nameLabels, 
                pieData = [],
                filteredPieData = [], 
                totalData = 0;   

            var donut = d3.layout.pie()
                    .value(function(d){
                            return d.d;
                        })
                    .sort(function(a,b){
                        return a.d - b.d; 
                    });

            var pieData =  donut(this.data);
            
            filteredPieData = pieData.filter(function(d,i){
                totalData += d.data.d;
                return (d.data.d > 0);
               });
            totalData = totalData.toFixed(1);

            var color = d3.scale.category20();

            var tempColor;

            var tip = d3.select(this.parent())
                .append('div')
                .attr('id', this.svgId)
                .attr('class', 'PDPieChart_Label')                
                .style('opacity', 0);


            var angle = function(d) {
                var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
                return a > 90 ? a - 180 : a;
            };  

            onMouseHoverLabel = function(context, tip,color, d,i,totalData){
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

             //D3 helper function to draw arcs, populates parameter "d" in path object
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
                var center_group = svg.append("g")                   
                    .attr("class", "center_group")
                    .attr("transform", centerTranslation);
    

                var whiteCircle = center_group.append("circle")                                    
                    .attr("fill", "white")
                    .attr("r", donutWidth);
                
                var totalLabel = center_group.append("text")                    
                    .attr("class", "label")
                    .attr("dy", -15)
                    .attr("text-anchor", "middle") // text-align: right
                    .text("TOTAL");       

                //TOTAL TRAFFIC VALUE
                var totalValue = center_group.append("svg:text")                    
                    .attr("class", "total")
                    .attr("dy", 7)
                    .attr("text-anchor", "middle") // text-align: right
                    .text("Waiting...");

                if(filteredPieData.length > 0){
                    //REMOVE PLACEHOLDER CIRCLE
                    //arc_group.selectAll("circle").remove();
                    totalValue.text(function(){
                         var t = totalData; 
                        return t;
                    });
                }
            }        

            // Draw arc paths
            paths = arc_group.selectAll('path').data(filteredPieData)
                .enter()
                .append('path')
                    .attr('stroke','white')
                    .attr('stroke-width', 0.5)
                    .attr('fill', function(d,i){
                        return color(i);
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
                    onMouseHoverLabel(self,tip, color, d,i,totalData);    
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
            if (this.placeWedgeLabel == 'aroundPie' ) {
                //Draw tick mark and lines for labels
                lines = label_group.selectAll('line')
                    .attr('id', this.id)
                    .data(filteredPieData)
                    .enter()
                    .append('g');
                
                lines.filter(function(d) { return d.endAngle - d.startAngle > .2; })
                    .append('line')
                        .attr('x1', 0)
                        .attr('x2',0)
                        .attr('y1',-radius - 3)
                        .attr('y2', -radius - 8)
                        .attr('stroke', 'gray')
                        .attr('transform', function(d){
                            return "rotate("+(d.startAngle+d.endAngle)/2 * 180/Math.PI + ")";
                        })
             }
             if (this.placeWedgeLabel != 'onWedgeHover') {
                    if (this.labelContent.indexOf('data') >= 0 ){
                  
                    valueLabels = label_group.selectAll('text.value') 
                        .attr('id', this.id)                        
                        .data(filteredPieData)
                        .enter()
                        .append('g');
                                            
                    valueLabels.filter(function(d) { return d.endAngle - d.startAngle > .2; })
                        .append('text')
                            .attr('class', 'value')
                         
                            .attr('text-anchor', function(d){
                                if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
                                    return "beginning";
                                } else {
                                    return "end";
                                }                    
                            })
                            .text(function(d){
                                var percentage = (d.data.d/totalData)*100;
                                return percentage.toFixed(1) + "%";
                            })

                }
                
                if (this.labelContent.indexOf('label') >= 0){

                    if (this.labelContent.indexOf('data') < 0 || this.placeWedgeLabel == 'aroundPie') {

                        nameLabels = label_group.selectAll('text.units')                         
                            .attr('id', this.id)
                            .data(filteredPieData)
                            .enter()
                            .append('g');

                        nameLabels = nameLabels.filter(function(d) { return d.endAngle - d.startAngle > .2; }) 
                            .append('text')
                                .attr('class', 'units')                                                                                            
                                .attr('text-anchor', function(d){
                                    if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
                                        return "beginning";
                                    } else {
                                        return "end";
                                    }                     
                                })
                                .text(function(d){
                                    return d.data.value;
                                })
                      }                       
                }

            }       
            
            
            switch (this.placeWedgeLabel){
                case 'aroundPie':{
                    label_group.selectAll('text')   
                        .attr('transform', function(d){
                                return "translate("+ Math.cos((d.startAngle+d.endAngle-Math.PI)/2) * (radius+self.textOffset)
                                                   + "," 
                                                   + Math.sin((d.startAngle+d.endAngle-Math.PI)/2) * (radius+self.textOffset)
                                                   + ")";
                        })
                    label_group.selectAll('text.value') .attr('dy', function(d){
                            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
                                return 5;
                            } else {
                                return -7;
                            }                    
                        });
                     label_group.selectAll('text.units')   
                          .attr('dy',function(d){
                            if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
                                return 17;
                            } else {
                                return 5;
                            }
                        }) 
                          
                    break;   
                }
                case 'insideWedge':{
                    label_group.selectAll('text')
                        .attr('stroke', 'white')   
                        .attr('transform', function(d){
                            return "translate(" + arc.centroid(d) + ") rotate(" + angle(d) + ")";
                        });
                    label_group.selectAll('text.value')
                           .attr("dy", ".35em")
                           .attr("text-anchor", "middle")  
                    break;
                }
                case 'onWedgeHover':{
                    paths.on('mouseover', function(d,i){ 
                        tempColor = this.style.fill;     
                        onMouseHoverLabel(self, tip, color, d,i,totalData);    
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
                    break;
                }
            }
 
        },

              
            
	});
});