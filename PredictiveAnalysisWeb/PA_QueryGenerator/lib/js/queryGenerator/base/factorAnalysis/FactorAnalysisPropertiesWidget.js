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
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dojo/on',
  'dojo/text!./templates/FactorAnalysisPropertiesWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'dijit/layout/ContentPane',
  'dijit/TitlePane',
  'dijit/Tooltip',
  'dgrid/Grid'

],
  function(declare, lang, domConstruct, domGeometry, domStyle, on, template, _TemplatedMixin, _WidgetBase, ContentPane,
           TitlePane, Tooltip, Grid) {
    return declare(
      [_WidgetBase, _TemplatedMixin],
      {
        _factorAnalysisWidget: null,
        _factorStrategyEventHandles: null,
        _tooltipWidget: null,
        factorAnalysisPropertiesContentPane: null,
        factorAnalysisPropertiesNode: null,
        factorAnalysisHeaderPropertiesNode: null,
        templateString: template,

        constructor: function(args) {
          if (args && args.factorAnalysisWidget) {
            this._factorAnalysisWidget = args.factorAnalysisWidget;
          }

          this._factorStrategyEventHandles = [];
        },

        postCreate: function() {
          this.inherited(arguments);

          this.factorAnalysisPropertiesContentPane = new ContentPane();
          this.factorAnalysisPropertiesContentPane.placeAt(this.factorAnalysisPropertiesNode);
        },

        startup: function() {
          this.inherited(arguments);

          this.factorAnalysisPropertiesContentPane.startup();

          this._tooltipWidget = new Tooltip({
            connectId: this.factorAnalysisPropertiesContentPane.id,
            position: ['above'],
            showDelay: 200,
            selector: '.dijitTitlePane .dgrid-cell',
            getContent: function(matchedNode) {
              return matchedNode.innerHTML;
            }
          });

          if (this._factorAnalysisWidget) {
            this._populateFactorAnalysisStrategyProperties();
          }
        },

        destroy: function() {
          this.inherited(arguments);
          this.factorAnalysisPropertiesContentPane.destroy();
        },

        resize: function() {
          this.inherited(arguments);
          this.factorAnalysisPropertiesContentPane.resize();
        },

        setFactorAnalysisWidget: function(factorAnalysisWidget) {
          this._clearEventsForEachStrategyWidget();

          this._factorAnalysisWidget = factorAnalysisWidget;

          if (this._factorAnalysisWidget) {
            this._populateFactorAnalysisStrategyProperties();
            this._setEventsForEachStrategyWidget();
          }
          else {
            this._clearFactorAnalysisStrategyProperties();
          }
        },

        _setEventsForEachStrategyWidget: function() {
          for (var i = 0; i < this._factorAnalysisWidget.factorAnalysisStrategyWidgets.length; i++) {
            this._factorStrategyEventHandles.push(on(
              this._factorAnalysisWidget.factorAnalysisStrategyWidgets[i],
              'factor-strategy-widget-changed',
              lang.hitch(this, this.updateFactorAnalysisStrategyProperties)));
          }
        },

        _clearEventsForEachStrategyWidget: function() {
          while (this._factorStrategyEventHandles.length > 0) {
            this._factorStrategyEventHandles.pop().remove();
          }
        },

        _populateFactorAnalysisStrategyProperties: function() {
          this.factorAnalysisHeaderPropertiesNode.innerHTML =
            this._factorAnalysisWidget.factorAnalysis.inputFactor.factorSource.alias;

          var currentStrategy;
          var titlePane;
          for (var i = 0; i < this._factorAnalysisWidget.factorAnalysis.availableStrategies.length; i++) {
            currentStrategy = this._factorAnalysisWidget.factorAnalysis.availableStrategies[i];
            titlePane = new TitlePane({
              title: currentStrategy.strategyName,
              content: this._createPropertyGrid(currentStrategy)
            });

            this.factorAnalysisPropertiesContentPane.addChild(titlePane);
          }
        },

        _clearFactorAnalysisStrategyProperties: function() {
          this.factorAnalysisHeaderPropertiesNode.innerHTML = 'Properties';

          var children = this.factorAnalysisPropertiesContentPane.getChildren();

          for (var i = 0; i < children.length; i++) {
            this.factorAnalysisPropertiesContentPane.removeChild(children[i]);
            children[i].destroyRecursive();
          }
        },

        _createPropertyGrid: function(factorStrategy) {
          var grid = new Grid({
            columns: {
              property: '',
              value: ''
            },
            style: 'height:300px'
          });

          grid.set('showHeader', false);
          grid.renderArray(factorStrategy.getStrategyResultProperties());
          grid.resize();

          return grid;
        },

        updateFactorAnalysisStrategyProperties: function() {
          var titlePaneToUpdateValue = this._factorAnalysisWidget._selectNode.value;
          var titlePaneNodes = this.factorAnalysisPropertiesContentPane.getChildren();
          var currentStrategy = this._factorAnalysisWidget.factorAnalysis.availableStrategies[titlePaneToUpdateValue];

          titlePaneNodes[titlePaneToUpdateValue].content = this._createPropertyGrid(currentStrategy);
          this._clearFactorAnalysisStrategyProperties();

          this.factorAnalysisHeaderPropertiesNode.innerHTML =
            this._factorAnalysisWidget.factorAnalysis.inputFactor.factorSource.alias;

          for (var i = 0; i < titlePaneNodes.length; i++) {
            var titlePane;
            currentStrategy = this._factorAnalysisWidget.factorAnalysis.availableStrategies[i];
            titlePane = new TitlePane({
              title: titlePaneNodes[i].title,
              content: titlePaneNodes[i].content,
              open: titlePaneNodes[i].open
            });
            this.factorAnalysisPropertiesContentPane.addChild(titlePane);
          }
        }
      }
    );
  }
);


