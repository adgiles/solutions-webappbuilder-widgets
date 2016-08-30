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
  'dojo/_base/declare',
  '../BaseFactorStrategy'
],
  function(declare, BaseFactorStrategy) {
    return declare(
      [BaseFactorStrategy],
      {
        __type: 'MinMaxFactorStrategy',
        maxValue: null,
        minValue: null,
        valueCount: null,
        valueRange: null,

        constructor: function(/* args */) {
          this.strategyName = 'All';
        },

        getStrategyResultProperties: function() {
          return [
            {property: 'Min Value', value: this.minValue},
            {property: 'Max Value', value: this.maxValue},
            {property: 'Value Range', value: this.valueRange},
            {property: '# Values', value: this.valueCount}
          ];
        },

        convertToClause: function() {
          return this._createGroupClauseFromRange(this.minValue, this.maxValue);
        }
      }
    );
  }
);