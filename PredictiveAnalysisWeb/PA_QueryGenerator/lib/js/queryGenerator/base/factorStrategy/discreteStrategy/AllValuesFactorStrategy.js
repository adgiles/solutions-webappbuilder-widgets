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
  './BaseDiscreteFactorStrategy',
  '../../../../base/operator/Utils'
],
  function(declare, BaseDiscreteFactorStrategy, operatorUtils) {
    return declare(
      [BaseDiscreteFactorStrategy],
      {
        __type: 'AllValuesFactorStrategy',
        allCategoriesCount: 0,
        valueCount: 0,

        constructor: function(/* args */) {
          this.strategyName = 'All';
        },

        getStrategyResultProperties: function() {
          return [
            {property: '# Values', value: this.valueCount},
            {property: '# Categories', value: this.allCategoriesCount}
          ];
        },

        convertToClause: function() {
          if (this.allCategoriesCount === 0) {
            return null;
          }

          var clauses = [];
          for (var i = 0; i < this.discreteValueCounts.length; i++) {
            clauses.push(this._createEqualityBinaryClause(this.discreteValueCounts[i].factorValue.numericValue));
          }

          return this._createGroupClauseFromClauses(clauses, operatorUtils.orOperator);
        }
      }
    );
  }
);

