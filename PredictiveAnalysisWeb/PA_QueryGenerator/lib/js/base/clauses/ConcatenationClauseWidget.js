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
  'dojo/dom-attr',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/text!./template/ConcatenationClauseWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  './ClauseConstants',
  '../operator/Utils'
],
  function(array, declare, domAttr, domClass, domConstruct, template, _TemplatedMixin,
           _WidgetBase, ClauseConstants, operatorUtils) {
    return declare(
      [_WidgetBase, _TemplatedMixin],
      {
        _supportedOperators: null,
        clause: null,
        clauseContentNode: null,
        isEnabled: true,
        operatorNode: null,
        templateString: template,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }

          if (!(this.clause)) {
            throw new Error('ConcatenationClauseWidget requires a clause argument.');
          }

          this._supportedOperators = operatorUtils.concatenationOperators;
        },

        postCreate: function() {
          this.inherited(arguments);

          this._createOperatorOptionElements();
          this._initOperatorContent();
          this.setEnabled(this.isEnabled);
        },

        _createOperatorOptionElements: function() {
          domConstruct.empty(this.operatorNode);

          var optionElem;
          for (var i = 0; i < this._supportedOperators.length; i++) {
            optionElem = domConstruct.create('option');
            optionElem.value = i;
            optionElem.innerHTML = this._supportedOperators[i].operator;
            this.operatorNode.appendChild(optionElem);
          }
        },

        _initOperatorContent: function() {
          var filteredResults = array.filter(this._supportedOperators, function(item) {
            return item.operator === this.clause.operation.operator;
          }, this);

          if (filteredResults.length > 0) {
            this.operatorNode.selectedIndex = array.indexOf(this._supportedOperators, filteredResults[0]);
            this.operatorNode.title = filteredResults[0].operator;
          }
          else {
            console.error('ConcatenationClauseWidget: clause operator is not in the supported list of operators.');
          }
        },

        _handleOperatorChanged: function(evt) {
          this.clause.operation = this._supportedOperators[evt.target.value];
          this.operatorNode.title = this._supportedOperators[evt.target.value].operator;
        },

        enableWeightingMode: function() {
          // Intentional No-op
        },

        disableWeightingMode: function() {
          // Intentional No-op
        },

        setEnabled: function(isEnabled) {
          if (isEnabled) {
            domAttr.remove(this.operatorNode, 'disabled');
          }
          else {
            domAttr.set(this.operatorNode, 'disabled', 'true');
          }

          this.isEnabled = isEnabled;
        },

        evaluate: function(leftOperand, rightOperand) {
          this.clearEvaluateState();
          var result = this.clause.evaluate(leftOperand, rightOperand);

          switch(this.clause.evaluateState) {
            case ClauseConstants.evaluateStateTypes.Indeterminate:
              domClass.add(this.clauseContentNode, 'clause-evaluate-indeterminate');
              break;
            case ClauseConstants.evaluateStateTypes.Passed:
              domClass.add(this.clauseContentNode, 'clause-evaluate-passed');
              break;
            case ClauseConstants.evaluateStateTypes.Failed:
              domClass.add(this.clauseContentNode, 'clause-evaluate-failed');
              break;
            default:
              break;
          }

          return result;
        },

        clearEvaluateState: function() {
          this.clause.evaluateState = ClauseConstants.evaluateStateTypes.None;
          domClass.remove(this.clauseContentNode, 'clause-evaluate-indeterminate');
          domClass.remove(this.clauseContentNode, 'clause-evaluate-passed');
          domClass.remove(this.clauseContentNode, 'clause-evaluate-failed');
        }
      }
    );
  }
);