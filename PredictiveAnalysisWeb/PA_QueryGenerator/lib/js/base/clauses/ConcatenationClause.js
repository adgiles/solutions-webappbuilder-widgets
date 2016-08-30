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
  'dojox/xml/parser',
  './BaseClause',
  './ClauseConstants',
  '../operator/Utils',
  '../xml/Utils'
],
  function(declare, parser, BaseClause, ClauseConstants, operatorUtils, xmlUtils) {
    return declare(
      [BaseClause],
      {
        declaredClass: 'predictiveAnalysis.ConcatenationClause',
        operation: null,

        constructor: function(/* args */) {
          this.clauseType = 'ConcatenationClause';

          if (!(this.operation)) {
            // and operator is the default operator
            this.operation = operatorUtils.noOpOperator;
          }
        },

        fromJson: function(jsonObj) {
          this.inherited(arguments);

          if (this.operation) {
            this.operation = operatorUtils.getOperatorFromStr(this.operation.operator);
          }
          else {
            // and operator is the default operator
            this.operation = operatorUtils.noOpOperator;
          }
        },

        convertToXml: function() {
          var baseClassElement = this.inherited(arguments);
          var rootNode = xmlUtils.copyElement(baseClassElement, 'ConcatenationClause');

          var doc = parser.parse();

          var operationNode = xmlUtils.createXmlNode(doc, 'Operation', this.operation.operator);
          rootNode.appendChild(operationNode);

          var operationPrecedenceNode = xmlUtils.createXmlNode(doc, 'OperationPrecedence', 0);
          rootNode.appendChild(operationPrecedenceNode);

          return rootNode;
        },

        evaluate: function(leftOperand, rightOperand) {
          if (typeof leftOperand !== 'number' || typeof rightOperand !== 'number') {
            this.evaluateState = ClauseConstants.evaluateStateTypes.Indeterminate;
            return 'NoData';
          }

          if (this.useWeighting) {
            this.evaluateState = ClauseConstants.evaluateStateTypes.Passed;
            return operatorUtils.additionOperator.evaluate(leftOperand, rightOperand);
          }
          else {
            var result = this.operation.evaluate(leftOperand, rightOperand);
            if (result) {
              this.evaluateState = ClauseConstants.evaluateStateTypes.Passed;
            }
            else {
              this.evaluateState = ClauseConstants.evaluateStateTypes.Failed;
            }

            return result;
          }

        }
      }
    );
  }
);