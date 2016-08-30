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
        __type: 'ManualRangeFactorStrategy',
        maxValue: null,
        minValue: null,

        constructor: function(/* args */) {
          this.strategyName = 'Manual';
        },

        getStrategyResultProperties: function() {
          return [
            {property: 'Manual Min', value: this.minValue},
            {property: 'Manual Max', value: this.maxValue}
          ];
        },

        convertToClause: function() {
          return this._createGroupClauseFromRange(this.minValue, this.maxValue);
        }
      }
    );
  }
);


