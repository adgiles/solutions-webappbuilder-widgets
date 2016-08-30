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
  'dojo/_base/lang',
  '../../../base/clauses/ConcatenationClause',
  '../../../base/clauses/GroupClause',
  '../../../base/clauses/Utils',
  '../../../base/json/Utils',
  '../../../base/operator/Utils',
  '../../../base/rasterSources/Utils'
],
  function(declare, lang, ConcatenationClause, GroupClause, clauseUtils, jsonUtils, operatorUtils, rasterSourceUtils) {
    return declare(
      null,
      {
        factorSource: null,
        strategyName: null,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }
        },

        fromServerJson: function(serverJson) {
          if (!serverJson) {
            return;
          }

          var clonedObj = lang.clone(serverJson);
          jsonUtils.convertUppercasePropertiesToLowercase(clonedObj);
          declare.safeMixin(this, clonedObj);

          if (clonedObj.factorSource) {
            this.factorSource = rasterSourceUtils.createRasterSourceFromServerJson(clonedObj.factorSource);
          }
        },

        fromJson: function(jsonObj) {
          if (jsonObj) {
            declare.safeMixin(this, jsonObj);
          }

          if (jsonObj.factorSource) {
            this.factorSource = rasterSourceUtils.createRasterSourceFromJson(jsonObj.factorSource);
          }
        },

        convertToClause: function() {
          // Implemented in derived classes.
          return null;
        },

        getStrategyResultProperties: function() {
          // Implemented in derived classes.
          return [];
        },

        _createGroupClauseFromRange: function(minValue, maxValue, title) {
          var clause1 = clauseUtils.createBinaryClause(this.factorSource);
          clause1.operation = operatorUtils.greaterThanEqualToOperator;
          clause1.constraint = minValue;

          var clause2 = new ConcatenationClause();
          clause2.operation = operatorUtils.andOperator;

          var clause3 = clauseUtils.createBinaryClause(this.factorSource);
          clause3.operation = operatorUtils.lessThanEqualToOperator;
          clause3.constraint = maxValue;

          var groupClause = new GroupClause();
          groupClause.clauses = [clause1, clause2, clause3];

          this._setGroupClauseTitle(groupClause, title);

          return groupClause;
        },

        _createGroupClauseFromClauses: function(clauses, concatenationOperator, title) {
          if (!clauses || !(clauses.length) || clauses.length < 1) {
            return null;
          }

          var groupClause = new GroupClause();

          for (var i = 0; i < clauses.length; i++) {
            groupClause.clauses.push(clauses[i]);

            var concatenationClause = new ConcatenationClause();
            concatenationClause.operation = concatenationOperator;
            groupClause.clauses.push(concatenationClause);
          }

          // Remove the trailing concatenation clause
          groupClause.clauses.pop();
          this._setGroupClauseTitle(groupClause, title);


          return groupClause;
        },

        _setGroupClauseTitle: function(groupClause, title) {
          if (title) {
            groupClause.title = title;
          }
          else {
            groupClause.title = this.factorSource.alias + ' - ' + this.strategyName + ' Strategy';
          }
        }
      }
    );
  }
);

