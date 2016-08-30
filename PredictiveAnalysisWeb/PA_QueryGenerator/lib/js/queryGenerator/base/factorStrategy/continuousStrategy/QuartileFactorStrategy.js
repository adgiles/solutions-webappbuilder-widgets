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
  '../BaseFactorStrategy',
  '../../../../base/operator/Utils',
  '../../../../base/Utils'
],
  function(declare, BaseFactorStrategy, operatorUtils, baseUtils) {
    return declare(
      [BaseFactorStrategy],
      {
        __type: 'QuartileFactorStrategy',
        includeFirstQuartile: false,
        includeFourthQuartile: false,
        includeSecondQuartile: false,
        includeThirdQuartile: false,
        interquartileRange: null,
        lowerFence: null,
        lowerQuartile: null,
        maximum: null,
        median: null,
        minimum: null,
        selectionType: null,
        selectionTypeEnum: {
          'Quartiles': 0,
          'Fences': 1
        },
        upperFence: null,
        upperQuartile: null,

        constructor: function(/* args */) {
          this.strategyName = 'Quartiles';
        },

        getStrategyResultProperties: function() {
          return [
            {property: 'Lower Quartile', value: this.lowerQuartile},
            {property: 'Median', value: this.median},
            {property: 'Upper Quartile', value: this.upperQuartile},
            {property: 'Interquartile Range', value: this.interquartileRange},
            {property: 'Lower Fence', value: this.lowerFence},
            {property: 'Upper Fence', value: this.upperFence}
          ];
        },

        convertToClause: function() {
          if (this.selectionType === this.selectionTypeEnum.Fences) {
            return this._generateClauseFromFences();
          }
          else if (this.selectionType === this.selectionTypeEnum.Quartiles) {
            return this._generateClauseFromQuartiles();
          }
          else {
            return null;
          }
        },

        _generateClauseFromFences: function() {
          var groupClause = this._createGroupClauseFromRange(this.lowerFence, this.upperFence);
          groupClause.title = groupClause.title +
            '(' + baseUtils.getKeyByValue(this.selectionTypeEnum, this.selectionType) + ')';
          return groupClause;
        },

        _generateClauseFromQuartiles: function() {
          var quartileClauses = [];

          if (this.includeFirstQuartile) {
            var firstQuartile = this._createGroupClauseFromRange(this.minimum, this.lowerQuartile, 'First Quartile');
            quartileClauses.push(firstQuartile);
          }

          if (this.includeSecondQuartile) {
            var secondQuartile = this._createGroupClauseFromRange(this.lowerQuartile, this.median, 'Second Quartile');
            quartileClauses.push(secondQuartile);
          }

          if (this.includeThirdQuartile) {
            var thirdQuartile = this._createGroupClauseFromRange(this.median, this.upperQuartile, 'Third Quartile');
            quartileClauses.push(thirdQuartile);
          }

          if (this.includeFourthQuartile) {
            var fourthQuartile = this._createGroupClauseFromRange(this.upperQuartile, this.maximum, 'Fourth Quartile');
            quartileClauses.push(fourthQuartile);
          }

          return this._createGroupClauseFromClauses(quartileClauses, operatorUtils.orOperator);
        }
      }
    );
  }
);