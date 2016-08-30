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
  'dijit/_WidgetBase',
  './ClauseConstants'
],
  function(array, declare, domAttr, domClass, domConstruct, _WidgetBase, ClauseConstants) {
    return declare(
      [_WidgetBase],
      {
        _supportedOperators: null,
        clause: null,
        clauseContentNode: null,
        constraintContainerNode: null,
        isEnabled: true,
        nameContentNode: null,
        operatorNode: null,
        rightOperandNode: null,
        weightingNode: null,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }

          if (!(this.clause)) {
            throw new Error('BaseBinaryClauseWidget requires a clause argument.');
          }
        },

        postCreate: function() {
          this.inherited(arguments);

          this._createOperatorOptionElements();

          this._initOperatorContent();
          this._initConstraintContent();
          this._initWeightingContent();

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
            console.error('BaseBinaryClauseWidget: clause operator is not in the supported list of operators.');
          }
        },

        _initConstraintContent: function() {
          this.rightOperandNode.value = this.clause.constraint;
          this.rightOperandNode.title = this.clause.constraint;
        },

        _initWeightingContent: function() {
          this.weightingNode.value = this.clause.weighting;
          this.weightingNode.title = this.clause.weighting;

          if (this.clause.useWeighting) {
            this.enableWeightingMode();
          }
        },

        _handleOperatorChanged: function(evt) {
          this.clause.operation = this._supportedOperators[evt.target.value];
          this.operatorNode.title = this._supportedOperators[evt.target.value].operator;
        },

        _handleRightOperandChanged: function(evt) {
          this.clause.constraint = Number(evt.target.value);
          this.rightOperandNode.title = evt.target.value;
        },

        _handleWeightingChanged: function(evt) {
          this.clause.weighting = Number(evt.target.value);
          this.weightingNode.title = evt.target.value;
        },

        enableWeightingMode: function() {
          domClass.add(this.nameContentNode, 'weighted-name-container');
          domClass.add(this.constraintContainerNode, 'weighted-constraint-container');
          domClass.replace(this.weightingNode, 'weighted-clause-input', 'non-weighted-clause-input');
        },

        disableWeightingMode: function() {
          domClass.remove(this.nameContentNode, 'weighted-name-container');
          domClass.remove(this.constraintContainerNode, 'weighted-constraint-container');
          domClass.replace(this.weightingNode, 'non-weighted-clause-input', 'weighted-clause-input');
        },

        replaceDataSource: function(rasterSource) {
          var replaced = this.clause.replaceDataSource(rasterSource);
          if (replaced) {
            this.nameContentNode.innerHTML = rasterSource.alias;
          }
        },

        setEnabled: function(isEnabled) {
          if (isEnabled) {
            domAttr.remove(this.operatorNode, 'disabled');
            domAttr.remove(this.rightOperandNode, 'disabled');
            domAttr.remove(this.weightingNode, 'disabled');
          }
          else {
            domAttr.set(this.operatorNode, 'disabled', 'true');
            domAttr.set(this.rightOperandNode, 'disabled', 'true');
            domAttr.set(this.weightingNode, 'disabled', 'true');
          }

          this.isEnabled = isEnabled;
        },

        evaluate: function(value) {
          this.clearEvaluateState();
          var result = this.clause.evaluate(value);

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
