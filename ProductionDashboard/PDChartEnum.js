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
define([
"dojo/_base/declare"
], function(declare){
  var PDChartEnum = declare(null, {});
  PDChartEnum.UNKNOWN_CHART = 'unknownChart';
  PDChartEnum.TREND_CHART = 'trendChart';
  PDChartEnum.BAR_CHART = 'barChart';
  PDChartEnum.STOPLIGHT_CHART = 'stoplightChart';
  PDChartEnum.INDICATOR_CHART = 'indicatorChart';
  PDChartEnum.GAUGE_CHART = 'gaudgeChart';
  PDChartEnum.PIE_CHART = 'pieChart';  
  return PDChartEnum;
});
