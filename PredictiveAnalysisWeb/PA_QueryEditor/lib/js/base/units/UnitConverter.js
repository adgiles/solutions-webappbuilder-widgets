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
define([
  'dojo/_base/declare' ,
  './BaseUnitInfo',
  './DistanceUnitInfo',
  './TimeUnitInfo',
  './SlopeUnitInfo',
],
  function(declare, BaseUnitInfo, DistanceUnitInfo, TimeUnitInfo, SlopeUnitInfo) {
    var UnitConverter = declare(null,
      {

        convertDistance: function(value, fromUnit, toUnit) {
          var valueInMeters;
          valueInMeters = value * fromUnit.metersPerUnit;
          return (valueInMeters / toUnit.metersPerUnit);
        },

        convertTime: function(value, fromUnit, toUnit) {
          var valueInHours;
          valueInHours = value * fromUnit.hoursPerUnit;
          return (valueInHours / toUnit.hoursPerUnit);
        },

        convertSlope: function(value, fromUnit, toUnit) {
          if (fromUnit.slopeUnitType === 'Percent' && toUnit.slopeUnitType === 'Degrees') {
            var radianValue = Math.atan((value / 100.0));
            return radianValue * (180.0 / Math.PI);
          }
          else if (fromUnit.slopeUnitType === 'Degrees' && toUnit.slopeUnitType === 'Percent') {
            var radians = value * Math.PI / 180;
            return (Math.tan(radians)) * 100;
          }
          return value;
        },

        convertUnit: function(value, fromUnit, toUnit) {

          if (fromUnit.type === DistanceUnitInfo.prototype.type && toUnit.type === DistanceUnitInfo.prototype.type) {

            return this.convertDistance(value, fromUnit, toUnit);
          }
          else if (fromUnit.type === TimeUnitInfo.prototype.type && toUnit.type === TimeUnitInfo.prototype.type) {
            return this.convertTime(value, fromUnit, toUnit);
          }
          else if (fromUnit.type === SlopeUnitInfo.prototype.type && toUnit.type === SlopeUnitInfo.prototype.type) {
            return this.convertSlope(value, fromUnit, toUnit);
          }
          else {
            throw new Error('Conversion Not Supported. Two Different Unit Types Used.');
          }
        }

      }
    );
    return new UnitConverter();
  }
);