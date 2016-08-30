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
  'dojo/_base/array',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'exports',
  './AttributedBinaryClause',
  './BaseBinaryClause',
  './BinaryClause',
  './ClauseConstants',
  './ConcatenationClause',
  './GroupClause',
  './UnitBinaryClause',
  '../rasterSources/AttributedRasterSource',
  '../rasterSources/RasterSource',
  '../rasterSources/UnitRasterSource'
],
  function(array, declare, lang, exports, AttributedBinaryClause, BaseBinaryClause, BinaryClause,
           ClauseConstants, ConcatenationClause, GroupClause, UnitBinaryClause, AttributedRasterSource,
           RasterSource, UnitRasterSource) {
    /*
     * This utility module uses exports because it is part of a circular dependency chain with the
     * GroupClause module.  the reason this utility module exists is because there are a series of
     * methods that are common to the GroupClause and Query modules but the two do not share a common
     * base class.
     */

    exports.createBinaryClause = function(rasterSource) {
      if (rasterSource instanceof RasterSource) {
        return new BinaryClause({rasterSource: rasterSource});
      }
      else if (rasterSource instanceof UnitRasterSource) {
        return new UnitBinaryClause({rasterSource: rasterSource});
      }
      else if (rasterSource instanceof AttributedRasterSource) {
        return new AttributedBinaryClause({rasterSource: rasterSource});
      }
      else {
        return null;
      }
    };

    exports.createClauseFromJson = function(jsonClause) {
      if (!jsonClause) {
        return null;
      }

      if (!(jsonClause.clauseType)) {
        console.error('Error. The clause type is not specified.', jsonClause);
        return null;
      }

      var clause;
      switch (jsonClause.clauseType) {
        case 'AttributedBinaryClause':
          clause = new AttributedBinaryClause();
          break;
        case 'BinaryClause':
          clause = new BinaryClause();
          break;
        case 'MakoUnitBinaryClause':
          clause = new UnitBinaryClause();
          break;
        case 'ConcatenationClause':
          clause = new ConcatenationClause();
          break;
        case 'GroupClause':
          if (typeof GroupClause === 'object') {
            clause = new GroupClause.GroupClause();
          }
          else {
            clause = new GroupClause();
          }
          break;
        default:
          console.error('Error. The clause type is not recognized.', jsonClause.clauseType);
          return null;
      }

      clause.fromJson(jsonClause);
      return clause;
    };

    exports.createClausesFromJson = function(serializedClauseArray) {
      if (!serializedClauseArray) {
        return [];
      }

      if (!(Array.isArray(serializedClauseArray))) {
        return [];
      }

      var clauses = [];
      var clause;

      for(var i = 0; i < serializedClauseArray.length; i++) {
        clause = this.createClauseFromJson(serializedClauseArray[i]);
        clauses.push(clause);
      }

      return clauses;
    };

    exports.evaluate = function(inspectionResult, clauseList) {
      var processingStack = [];
      var operatorStack = [];
      var currentClause;

      // A basic implementation of Dijkstra's shunting yard algorithm
      for (var i = 0; i < clauseList.length; i++) {
        currentClause = clauseList[i];

        switch (currentClause.clauseType) {
          case 'AttributedBinaryClause':
          case 'BinaryClause':
          case 'MakoUnitBinaryClause':
            this._resolveBinaryClause(inspectionResult, currentClause, processingStack);
            break;
          case 'ConcatenationClause':
            this._processConcatenationClause(currentClause, processingStack, operatorStack);
            break;
          case 'GroupClause':
            this._resolveGroupClause(inspectionResult, currentClause, processingStack);
            break;
          default:
            return 'Indeterminate';
        }
      }

      while (operatorStack.length > 0) {
        this._resolveConcatenationClause(operatorStack.pop(), processingStack);
      }

      return processingStack[0];
    };

    exports._processConcatenationClause = function(clause, processingStack, operatorStack) {
      var operatorStackPrecedence = -1;
      var clausePrecedence = ClauseConstants.precedenceLookup[clause.operation.operator];

      if (operatorStack.length > 0) {
        var operatorStackTop = operatorStack[operatorStack.length - 1];
        operatorStackPrecedence = ClauseConstants.precedenceLookup[operatorStackTop.operation.operator];
      }

      if (operatorStackPrecedence < clausePrecedence) {
        operatorStack.push(clause);
      }
      else {
        this._resolveConcatenationClause(operatorStack.pop(), processingStack);
        this._processConcatenationClause(clause, processingStack, operatorStack);
      }
    };

    exports._resolveBinaryClause = function(inspectionResult, clause, processingStack) {
      var result = clause.evaluate(inspectionResult[clause.rasterSource.sourceUrl]);
      processingStack.push(result);
    };

    exports._resolveGroupClause = function(inspectionResult, clause, processingStack) {
      var result = clause.evaluate(inspectionResult);
      processingStack.push(result);
    };

    exports._resolveConcatenationClause = function(clause, processingStack) {
      var val1 = processingStack.pop();
      var val2 = processingStack.pop();

      var result = clause.evaluate(val1, val2);
      processingStack.push(result);
    };

    exports.evaluateClauseWidgets = function(clauseWidgets, inspectionResult) {
      var leftOperand;
      var rightOperand;
      var unprocessedConcatenationClauseWidget;
      var currentClauseWidget;
      for (var i = 0; i < clauseWidgets.length; i++) {
        currentClauseWidget = clauseWidgets[i];

        // Case for even values of i greater than 0
        if (currentClauseWidget.clause.clauseType === 'ConcatenationClause') {
          unprocessedConcatenationClauseWidget = currentClauseWidget;
        }
        else {
          // Case for odd values of i greater than 0
          if (unprocessedConcatenationClauseWidget) {
            rightOperand = this._evaluateClauseWidget(currentClauseWidget, inspectionResult);
            unprocessedConcatenationClauseWidget.evaluate(leftOperand, rightOperand);

            unprocessedConcatenationClauseWidget = null;
            leftOperand = rightOperand;
          }
          // Case for i = 0
          else {
            leftOperand = this._evaluateClauseWidget(currentClauseWidget, inspectionResult);
          }
        }
      }
    };

    exports._evaluateClauseWidget = function(clauseWidget, inspectionResult) {
      switch (clauseWidget.clause.clauseType) {
        case 'AttributedBinaryClause':
        case 'BinaryClause':
        case 'MakoUnitBinaryClause':
          var inspectionArg = inspectionResult[clauseWidget.clause.rasterSource.sourceUrl];
          return clauseWidget.evaluate(inspectionArg);
        case 'GroupClause':
          return clauseWidget.evaluate(inspectionResult);
        default:
          return null;
      }
    };
  }
);