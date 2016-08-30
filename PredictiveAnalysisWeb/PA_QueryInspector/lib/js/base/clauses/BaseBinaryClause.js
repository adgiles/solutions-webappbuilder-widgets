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
  '../rasterSources/BaseRasterSource',
  '../rasterSources/Utils',
  '../xml/Utils'
],
  function(declare, parser, BaseClause, ClauseConstants, operatorUtils, BaseRasterSource,
           rasterSourcesUtils, xmlUtils) {
    return declare(
      [BaseClause],
      {
        constraint: '',
        operation: null,
        rasterSource: null,

        constructor: function(/* args */) {
          // Supply default instance values (so json serialization will work)
          // if values were not already mixed in from the base class constructor.
          this.clauseType = 'BaseBinaryClause';

          if (!(this.rasterSource instanceof BaseRasterSource)) {
            // Initialize a default raster source if one is not specified
            this.rasterSource = new BaseRasterSource();
          }

          if (!(this.operation)) {
            this.operation = operatorUtils.noOpOperator;
          }

          if (!(this.constraint)) {
            this.constraint = '';
          }
        },

        fromJson: function(jsonObj) {
          this.inherited(arguments);

          this.rasterSource = rasterSourcesUtils.createRasterSourceFromJson(this.rasterSource);

          if (this.operation) {
            this.operation = operatorUtils.getOperatorFromStr(this.operation.operator);
          }
          else {
            this.operation = operatorUtils.noOpOperator;
          }
        },

        convertToXml: function() {
          var baseClassElement = this.inherited(arguments);
          var rootNode = xmlUtils.copyElement(baseClassElement, 'BaseBinaryClause');

          var doc = parser.parse();

          var operationNode = xmlUtils.createXmlNode(doc, 'Operation', this.operation.operator);
          rootNode.appendChild(operationNode);

          var operationPrecedenceNode = xmlUtils.createXmlNode(doc, 'OperationPrecedence', 0);
          rootNode.appendChild(operationPrecedenceNode);

          var rightOperandNode = xmlUtils.createXmlNode(doc, 'RightOperand', this.constraint);
          rootNode.appendChild(rightOperandNode);

          var rasterSourceNode = this.rasterSource.convertToXml();
          rootNode.appendChild(rasterSourceNode);

          return rootNode;
        },

        replaceDataSource: function(rasterSource) {
          this.rasterSource = rasterSource;
          return true;
        },

        evaluate: function(value) {
          if (typeof value !== 'number') {
            this.evaluateState = ClauseConstants.evaluateStateTypes.Indeterminate;
            return value;
          }

          var result = this.operation.evaluate(value, this.constraint);
          if (result) {
            this.evaluateState = ClauseConstants.evaluateStateTypes.Passed;
            if (this.useWeighting) {
              return this.weighting;
            }
            return 1;
          }
          else {
            this.evaluateState = ClauseConstants.evaluateStateTypes.Failed;
            return 0;
          }
        }
      }
    );
  }
);