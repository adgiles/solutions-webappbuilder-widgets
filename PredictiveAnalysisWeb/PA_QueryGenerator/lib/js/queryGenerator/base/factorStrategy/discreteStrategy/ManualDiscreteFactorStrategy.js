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
        __type: 'ManualDiscreteFactorStrategy',
        manualValues: null,

        constructor: function(/* args */) {
          this.strategyName = 'Manual';
          this.manualValues = [];
        },

        fromServerJson: function(serverJson) {
          this.inherited(arguments);
          jsonUtils.convertUppercasePropertiesToLowercase(this.manualValues, true);
        },

        getStrategyResultProperties: function() {
          return [
            {property: '# Manual Categories', value: this.manualValues.length}
          ];
        },

        convertToClause: function() {
          if (this.manualValues.length === 0) {
            return null;
          }

          var clauses = [];
          for (var i = 0; i < this.manualValues.length; i++) {
            clauses.push(this._createEqualityBinaryClause(this.manualValues[i].factorValue.numericValue));
          }

          return this._createGroupClauseFromClauses(clauses, operatorUtils.orOperator);
        }
      }
    );
  }
);