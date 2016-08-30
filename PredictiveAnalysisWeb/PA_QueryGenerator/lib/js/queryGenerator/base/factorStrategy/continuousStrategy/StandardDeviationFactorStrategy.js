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
  '../../../../base/Utils'
],
  function(declare, BaseFactorStrategy, baseUtils) {
    return declare(
      [BaseFactorStrategy],
      {
        __type: 'StandardDeviationFactorStrategy',

        deviationType: null,
        deviationTypeEnum: {
          'First': 0,
          'Second': 1,
          'Third': 2
        },
        mean: null,
        standardDeviation: null,
        firstStandardDeviation: null,
        secondStandardDeviation: null,
        thirdStandardDeviation: null,

        constructor: function(/* args */) {
          this.strategyName = 'Std. Dev.';
        },

        getStrategyResultProperties: function() {
          return [
            {property: 'Mean', value: this.mean},
            {property: 'Standard Deviation', value: this.standardDeviation},
            {property: 'First Std. Dev.', value: this.firstStandardDeviation},
            {property: 'Second Std. Dev.', value: this.secondStandardDeviation},
            {property: 'Third Std. Dev', value: this.thirdStandardDeviation}
          ];
        },

        convertToClause: function() {
          var clause = this._createGroupClauseFromRange(
            this.mean - this.standardDeviation,
            this.mean + this.standardDeviation);

          if (clause) {
            clause.title = clause.title +
              '(' + baseUtils.getKeyByValue(this.deviationTypeEnum, this.deviationType) + ')';
          }

          return clause;
        },

        setDeviationType: function(deviationTypeEnum) {
          switch (deviationTypeEnum) {
            case this.deviationTypeEnum.First:
              this.standardDeviation = this.firstStandardDeviation;
              this.deviationType = deviationTypeEnum;
              break;
            case this.deviationTypeEnum.Second:
              this.standardDeviation = this.secondStandardDeviation;
              this.deviationType = deviationTypeEnum;
              break;
            case this.deviationTypeEnum.Third:
              this.standardDeviation = this.thirdStandardDeviation;
              this.deviationType = deviationTypeEnum;
              break;
            default:
              return;
          }
        }
      }
    );
  }
);