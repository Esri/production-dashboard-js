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
  var WMXEnum = declare(null, {});
  WMXEnum.SHORT_DATATYPE        = 0;
  WMXEnum.LONG_DATATYPE         = 1;
  WMXEnum.DOUBLE_DATATYPE       = 3;
  WMXEnum.DATE_DATATYPE         = 5;
  WMXEnum.TEXT_DATATYPE         = 4;
  WMXEnum.OBJECTID_DATATYPE     = 6;
  WMXEnum.UNKNOWN_DATATYPE      = -1;

  WMXEnum.GROUP_BY_DAY          = 'day';
  WMXEnum.GROUP_BY_MONTH        = 'month';
  WMXEnum.GROUP_BY_YEAR         = 'year';

  WMXEnum.CALCULATE_BY_SUM      = 'sum';
  WMXEnum.CALCULATE_BY_COUNT    = 'count';
  WMXEnum.CALCULATE_BY_AVERAGE  = 'average';
  return WMXEnum;
});

