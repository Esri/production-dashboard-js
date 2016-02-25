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

 	return declare("esri.productiondashboard.PDStoplight",[PDChart], {
 		
    	svgType                     : PDChartEnum.STOPLIGHT_CHART,
        stoplightChartData          : [
                    					{ d: 'Overdue', value: 10 , color: 'red'} ,
                                        { d: 'Behind Schedule', value: 20, color: 'orange'},
                                        { d: 'On schedule', value: 30, color: 'green' },
                                        { d: 'At Risk', value: 30, color: 'yellow' }       
                                      ],
        id                          :'',
        show_one_status             : true,
        donut_factor                :  1,
        show_label                  : true,
        label                       : 'indicator',        
        text_color                  : 'blue',
        is_percentage               : false,
        show_label_at_event         : '',
        select_on_map               : false,
        on_click_function           : null,
        data                        : [],

		postCreate: function (args) {            
 		 	this.inherited(arguments);
            lang.mixin(this, args);
        },

        clearContent:function(){
           var selector =  '#'+this.id;
            d3.selectAll(selector).remove();
        },

        visualizeIt: function(data){
            if (data != undefined ) 
                 this.data = data;
             else 
                this.data = this.stoplightChartData;
            this.clearContent();
            if (this.show_one_status)
                this.data = [this.data[0]];
            if (this.data == undefined) return;
            this._visualizeStopLightChart();        	
        },
        
        _getMaxLengthOfDataValues: function() {
            var value = '';
            this.data.forEach(function(d) {                
                if (value.length < d.d.length) value = d.d;
            });
            return value.length;
        },

        _getMaxLengthOfIndicatorValues: function() {
            var value = '';
            this.data.forEach(function(d) {               
                if (value.length < d.value.toString().length) value = d.value.toString();
            });
            return (this.is_percentage)? value.length + 1 : value.length;
        } ,     
            
        _visualizeStopLightChart: function(){

            var self = lang.hitch(this);

            var width = this.svgWidth,  
                height = this.svgHeight;

            var radius = Math.min(width,height) / 2,             
                donutWidth = radius * this.donut_factor,
                legendRectSize = (Math.SQRT2 * (radius - 10)),
                legendSpacing = 4;

            var max_text_length = (this.donut_factor == 1)?  radius * 2 : (radius - donutWidth) * 2 ;    
            
            var lengthestLabel =  (this.label == 'indicator')? this._getMaxLengthOfIndicatorValues() :
                                      d3.max([this._getMaxLengthOfIndicatorValues(), this._getMaxLengthOfDataValues()]) ;

            var fontSize = max_text_length / lengthestLabel;

            var color = d3.scale.ordinal()
                .domain(this.data.map(function (d){return d.d}))    
                .range(this.data.map(function (d){return d.color}));
            

            var renderLabel = function(value, labeltxt){
                if (self.show_label){
                    if (self.is_percentage) value = value + "%"; 
                    switch (self.label){
                        case 'indicator':{
                            indicator.attr('x',  0)     
                                .attr('y', fontSize * .35)    
                                .text(value);    
                                break;
                        }
                        case 'indicatorAndLabel': {
                            indicator.attr('x',  0)     
                                .attr('y', -2 * fontSize * .35)                               
                                .text(value);

                            label.attr('x',  0)     
                                .attr('y',fontSize +  fontSize * .35)                                
                                .text(labeltxt);      
                            break;
                        }   
                    }      
                }
            };

            var svg = this.chart = d3.select(this.domNode)
                .attr('width', width )
                .attr ('height', height)
                .append('g')
                .attr('id',this.id)                
                .attr('transform', 'translate('+ (width / 2) + ',' + (height / 2) + ')');

            var arc = d3.svg.arc()
                .innerRadius(radius - donutWidth)
                .outerRadius(radius);

            var pie = d3.layout.pie()
                        .value(function(d){ return d.value;})       
                        .sort(null);

            var path = svg.selectAll('path')
                .data(pie(this.data))
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill',function(d,i){ return color(d.data.d);});

            if (this.show_label && this.show_label_at_event == 'mouseover'){
                path.on('mouseover', function(d){            
                     renderLabel(d.data.value,d.data.d);                         
                });

                path.on('mouseout', function(){
                    self.chart.select(".PDStoplight_label_text")
                        .text('');
                    self.chart.select(".PDStoplight_indicator_text")
                        .text('');
                });
            } 

            if (this.select_on_map && this.on_click_function != undefined) {
                path.on('click',function(d,i){
                    self.on_click_function(d,i);
                });

            }
            var label = svg.append('text')               
                .attr('class','PDStoplight_label_text')
                .attr('font-size', fontSize )
                .attr('text-anchor','middle')
                .attr('fill', this.text_color);

               
            var indicator = svg.append('text')
                .attr('class','PDStoplight_indicator_text')                
                .attr('font-size', fontSize )
                .attr('text-anchor','middle')
                .attr('fill', this.text_color);

            if (this.show_label && this.show_one_status && (this.show_label_at_event == '')){
                renderLabel(this.data[0].value, this.data[0].d);
            }                       
        }
    	
 	}); 	
  });