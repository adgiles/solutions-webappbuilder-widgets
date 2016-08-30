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
  '../../../../base/clauses/Utils',
  '../../../../base/json/Utils',
  '../../../../base/operator/Utils'
],
  function(declare, BaseFactorStrategy, clauseUtils, jsonUtils, operatorUtils) {
    return declare(
      [BaseFactorStrategy],
      {
        discreteValueCounts: null,

        constructor: function(/* args */) {
          this.discreteValueCounts = [];
        },

        fromServerJson: function(serverJson) {
          this.inherited(arguments);
          jsonUtils.convertUppercasePropertiesToLowercase(this.discreteValueCounts, true);
        },

        _createEqualityBinaryClause: function(val) {
          var clause = clauseUtils.createBinaryClause(this.factorSource);
          clause.operation = operatorUtils.equalToOperator;
          clause.constraint = val;

          return clause;
        }
      }
    );
  }
);
