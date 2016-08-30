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
  'dojo/dom-construct',
  'dojo/Evented',
  'dojo/on',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'dojo/text!./templates/FactorAnalysisWidgetTemplate.html',
  '../factorStrategy/Utils'

],
  function(declare, lang, domConstruct, Evented, on, _TemplatedMixin, _WidgetBase, template, factorStrategyUtils) {
    return declare(
      [_WidgetBase, _TemplatedMixin, Evented],
      {
        factorAnalysis: null,
        _checkBoxNode: null,
        _nameNode: null,
        _selectNode: null,
        templateString: template,
        factorAnalysisStrategyWidgets: null,

        constructor: function(args) {
          if (!args || !args.factorAnalysis) {
            throw new Error('factorAnalysisWidget requires a factorAnalysis parameter.');
          }
          declare.safeMixin(this, args);
          this.factorAnalysisStrategyWidgets = [];
        },

        postCreate: function() {
          this.inherited(arguments);

          this._checkBoxNode.checked = this.factorAnalysis.useInQueryGeneration;
          this._nameNode.innerHTML = this.factorAnalysis.inputFactor.factorSource.alias;
          this._addOptionElements();
          this._populateFactorAnalysisStrategyWidgets();
        },

        startup: function() {
          this.inherited(arguments);

          for (var i = 0; i < this.factorAnalysisStrategyWidgets.length; i++) {
            this.factorAnalysisStrategyWidgets[i].startup();
          }
        },

        destroy: function() {
          this.inherited(arguments);

          for (var i = 0; i < this.factorAnalysisStrategyWidgets.length; i++) {
            this.factorAnalysisStrategyWidgets[i].destroy();
          }
        },

        _addOptionElements: function() {
          domConstruct.empty(this._selectNode);

          for (var i = 0; i < this.factorAnalysis.availableStrategies.length; i++) {
            var optionElem = domConstruct.create('option');
            optionElem.value = i;
            optionElem.innerHTML = this.factorAnalysis.availableStrategies[i].strategyName;
            this._selectNode.appendChild(optionElem);
          }
        },

        _handleCheckBoxChanged: function(/* evt */) {
          this.factorAnalysis.useInQueryGeneration = this._checkBoxNode.checked;
        },

        _handleOptionChanged: function(/* evt */) {
          this.factorAnalysis.selectedStrategyIndex = this._selectNode.value;
          this.emit('factor-analysis-selected-strategy-changed');
        },

        _populateFactorAnalysisStrategyWidgets: function() {
          for (var i = 0; i < this.factorAnalysis.availableStrategies.length; i++) {
            var factorStrategy = this.factorAnalysis.availableStrategies[i];
            var factorAnalysisStrategyWidget = factorStrategyUtils.createFactorStrategyWidget(
              factorStrategy,
              null,
              null);

            this.factorAnalysisStrategyWidgets.push(factorAnalysisStrategyWidget);
          }
        }
      }
    );
  }
);
