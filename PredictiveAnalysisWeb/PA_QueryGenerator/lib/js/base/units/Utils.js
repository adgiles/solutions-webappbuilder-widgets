/*******************************************************************************
 * Copyright 2014 Esri
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 ******************************************************************************/

/* jshint indent: false */
define([
  'dojo/_base/declare',
  './DistanceUnitInfo',
  './SlopeUnitInfo',
  './TimeUnitInfo'
],
  function(declare, DistanceUnitInfo, SlopeUnitInfo, TimeUnitInfo) {
    var Utils = declare(
      null,
      {
        meterUnit: new DistanceUnitInfo(
          {
            unitName: 'Meter',
            pluralUnitName: 'Meters',
            abbreviation: 'm',
            distanceUnitCode: 'esriMeters',
            conversionFactorToMeters: 1,
            metersPerUnit: 1
          }
        ),

        kilometerUnit: new DistanceUnitInfo(
          {
            unitName: 'Kilometer',
            pluralUnitName: 'Kilometers',
            abbreviation: 'km',
            distanceUnitCode: 'esriKilometers',
            conversionFactorToMeters: 0.001,
            metersPerUnit: 1000
          }
        ),

        footUnit: new DistanceUnitInfo(
          {
            unitName: 'Foot',
            pluralUnitName: 'Feet',
            abbreviation: 'ft',
            distanceUnitCode: 'esriFeet',
            conversionFactorToMeters: 3.28084,
            metersPerUnit: 0.3048
          }
        ),

        mileUnit: new DistanceUnitInfo(
          {
            unitName: 'Mile',
            pluralUnitName: 'Miles',
            abbreviation: 'mi',
            distanceUnitCode: 'esriMiles',
            conversionFactorToMeters: 0.000621371,
            metersPerUnit: 1609.34
          }
        ),

        nauticalMileUnit: new DistanceUnitInfo(
          {
            unitName: 'Nautical Mile',
            pluralUnitName: 'Nautical Miles',
            abbreviation: 'nmi',
            distanceUnitCode: 'esriNauticalMiles',
            conversionFactorToMeters: 0.000539957,
            metersPerUnit: 1853
          }
        ),

        millisecondUnit: new TimeUnitInfo(
          {
            unitName: 'Millisecond',
            pluralUnitName: 'Milliseconds',
            abbreviation: 'ms',
            timeUnitCode: 'esriTimeUnitsMilliseconds',
            conversionFactorToHours: 3600000,
            hoursPerUnit: parseFloat( 2.77777777777778e-07)
          }
        ),

        secondUnit: new TimeUnitInfo(
          {
            unitName: 'Second',
            pluralUnitName: 'Seconds',
            abbreviation: 'sec',
            timeUnitCode: 'esriTimeUnitsSeconds',
            conversionFactorToHours: 3600,
            hoursPerUnit: 0.000277777777778
          }
        ),

        minuteUnit: new TimeUnitInfo(
          {
            unitName: 'Minute',
            pluralUnitName: 'Minutes',
            abbreviation: 'min',
            timeUnitCode: 'esriTimeUnitsMinutes',
            conversionFactorToHours: 60,
            hoursPerUnit:  0.01666667
          }
        ),

        hourUnit: new TimeUnitInfo(
          {
            unitName: 'Hour',
            pluralUnitName: 'Hours',
            abbreviation: 'hr',
            timeUnitCode: 'esriTimeUnitsHours',
            conversionFactorToHours: 1,
            hoursPerUnit: 1
          }
        ),

        dayUnit: new TimeUnitInfo(
          {
            unitName: 'Day',
            pluralUnitName: 'Days',
            abbreviation: 'days',
            timeUnitCode: 'esriTimeUnitsDays',
            conversionFactorToHours: 0.04166667,
            hoursPerUnit: 24
          }
        ),

        weekUnit: new TimeUnitInfo(
          {
            unitName: 'Week',
            pluralUnitName: 'Weeks',
            abbreviation: 'wks',
            timeUnitCode: 'esriTimeUnitsWeeks',
            conversionFactorToHours: 0.00595238,
            hoursPerUnit: 168
          }
        ),

        degreeUnit: new SlopeUnitInfo(
          {
            unitName: 'Degree',
            pluralUnitName: 'Degrees',
            abbreviation: '\u00B0',
            slopeUnitType: 'Degrees'
          }
        ),

        percentUnit: new SlopeUnitInfo(
          {
            unitName: 'Percent',
            pluralUnitName: 'Percent',
            abbreviation: '%',
            slopeUnitType: 'Percent'
          }
        ),

        supportedDistanceUnits: null,
        supportedTimeUnits: null,
        supportedSlopeUnits: null,

        constructor: function() {
          this.supportedDistanceUnits = [this.meterUnit, this.kilometerUnit, this.footUnit,
            this.mileUnit, this.nauticalMileUnit];

          this.supportedTimeUnits = [this.millisecondUnit, this.secondUnit, this.minuteUnit,
            this.hourUnit, this.dayUnit, this.weekUnit];

          this.supportedSlopeUnits = [this.degreeUnit, this.percentUnit];
        },

        isValidUnit: function(unitStr) {
          return this.getUnitInfoFromStr(unitStr) !== null;
        },

        getUnitInfoFromStr: function(unitStr) {
          var unit = unitStr.toLowerCase();

          for (var i = 0; i < this.supportedDistanceUnits.length; i++) {
            if (unit === this.supportedDistanceUnits[i].unitName.toLowerCase() ||
              unit === this.supportedDistanceUnits[i].pluralUnitName.toLowerCase()) {
              return this.supportedDistanceUnits[i];
            }
          }

          for (var j = 0; j < this.supportedTimeUnits.length; j++) {
            if (unit === this.supportedTimeUnits[j].unitName.toLowerCase() ||
              unit === this.supportedTimeUnits[j].pluralUnitName.toLowerCase()) {
              return this.supportedTimeUnits[j];
            }
          }

          for (var k = 0; k < this.supportedSlopeUnits.length; k++) {
            if (unit === this.supportedSlopeUnits[k].unitName.toLowerCase() ||
              unit === this.supportedSlopeUnits[k].pluralUnitName.toLowerCase()) {
              return this.supportedSlopeUnits[k];
            }
          }

          return null;
        },

        getSupportedUnitsFromUnitInfo: function(unitInfo) {
          if (!unitInfo)
          {
            return [];
          }
          else if (unitInfo.declaredClass === 'predictiveAnalysis.DistanceUnitInfo') {
            return this.supportedDistanceUnits;
          }
          else if (unitInfo.declaredClass === 'predictiveAnalysis.TimeUnitInfo') {
            return this.supportedTimeUnits;
          }
          else if (unitInfo.declaredClass === 'predictiveAnalysis.SlopeUnitInfo') {
            return this.supportedSlopeUnits;
          }
          else {
            return [];
          }
        }
      }
    );

    return new Utils();
  }
);