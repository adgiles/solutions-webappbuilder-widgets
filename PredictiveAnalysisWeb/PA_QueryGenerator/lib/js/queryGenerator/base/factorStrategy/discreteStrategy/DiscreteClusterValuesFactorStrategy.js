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
  '../../../../base/json/Utils',
  '../../../../base/operator/Utils'
],
  function(declare, BaseDiscreteFactorStrategy, jsonUtils, operatorUtils) {
    return declare(
      [BaseDiscreteFactorStrategy],
      {
        __type: 'DiscreteClusterValuesFactorStrategy',
        clusterPassingPercentage: 0,
        clusteredCategoriesCount: 0,
        clusteredValues: null,
        factorValueCount: 0,

        constructor: function(/* args */) {
          this.strategyName = 'Percentage';
          this.clusteredValues = [];
        },

        fromServerJson: function(serverJson) {
          this.inherited(arguments);
          jsonUtils.convertUppercasePropertiesToLowercase(this.clusteredValues, true);
        },

        getStrategyResultProperties: function() {
          return [
            {property: 'Min Percentage', value: this.clusterPassingPercentage + '%'},
            {property: '# Qualifying Categories', value: this.clusteredCategoriesCount}
          ];
        },

        convertToClause: function() {
          if (this.clusteredCategoriesCount === 0) {
            return null;
          }

          var clauses = [];
          for (var i = 0; i < this.clusteredValues.length; i++) {
            clauses.push(this._createEqualityBinaryClause(this.clusteredValues[i].factorValue.numericValue));
          }

          var title = this.factorSource.alias + ' - ' + this.clusterPassingPercentage + '% or greater';
          return this._createGroupClauseFromClauses(clauses, operatorUtils.orOperator, title);
        },

        setPassingPercentage: function(newPercentage) {
          this.clusterPassingPercentage = newPercentage;
          this.clusteredValues.splice(0, this.clusteredValues.length);

          var percentage;
          for (var i = 0; i < this.discreteValueCounts.length; i++) {
            percentage = (this.discreteValueCounts[i].count / this.factorValueCount) * 100;
            if (percentage >= this.clusterPassingPercentage) {
              this.clusteredValues.push(this.discreteValueCounts[i]);
            }
          }

          this.clusteredCategoriesCount = this.clusteredValues.length;
        }
      }
    );
  }
);


