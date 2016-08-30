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
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/on',
  'dojo/store/Memory',
  'dojo/store/Observable',
  'dojo/text!./templates/QueryGenerationTemplate.html',
  'dojo/topic',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'dijit/layout/AccordionContainer',
  'dijit/layout/ContentPane',
  'dgrid/Grid',
  './factorAnalysis/FactorAnalysisGraphWidget',
  './factorAnalysis/FactorAnalysisPropertiesWidget',
  './factorAnalysis/FactorAnalysisListWidget',
  './factorAnalysis/FactorAnalysisWidget',
  '../../base/clauses/ConcatenationClause',
  '../../base/operator/Utils',
  '../../base/query/Query',
  '../../base/topics'
],
  function(declare, lang, domClass, domConstruct, on, Memory, Observable, template, topic, _TemplatedMixin, _WidgetBase,
           AccordionContainer, ContentPane, Grid, FactorAnalysisGraphWidget, FactorAnalysisPropertiesWidget,
           FactorAnalysisListWidget, FactorAnalysisWidget, ConcatenationClause, operatorUtils, Query, PATopics) {
    return declare(
      [_WidgetBase, _TemplatedMixin],
      {
        map: null,
        _factorAnalysisDataStore: null,
        _factorAnalysisGraphWidget: null,
        _factorAnalysisGraphWidgetNode: null,
        _factorAnalysisListWidget: null,
        factorAnalysisListNode: null,
        factorAnalysisControllerPane: null,
        selectedFactorAnalysisPropertiesNode: null,
        factorAnalysisPropertiesWidget: null,
        templateString: template,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }
        },

        postCreate: function() {
          this.inherited(arguments);
          this._factorAnalysisDataStore = new Observable(new Memory({data: [], idProperty: 'id'}));
          this._factorAnalysisListWidget = new FactorAnalysisListWidget({store: this._factorAnalysisDataStore});
          domConstruct.place(this._factorAnalysisListWidget.domNode, this.factorAnalysisListNode, 'last');

          this.own(on(
            this._factorAnalysisListWidget,
            'dgrid-select',
            lang.hitch(this, this._handleFactorAnalysisSelected)));

          this.own(on(
            this._factorAnalysisListWidget,
            'dgrid-deselect',
            lang.hitch(this, this._handleFactorAnalysisDeSelected)));

          this.factorAnalysisPropertiesWidget = new FactorAnalysisPropertiesWidget();
          this.factorAnalysisPropertiesWidget.placeAt(this.selectedFactorAnalysisPropertiesNode);

          this._factorAnalysisGraphWidget = new FactorAnalysisGraphWidget();
          this._factorAnalysisGraphWidget.placeAt(this._factorAnalysisGraphWidgetNode);
        },

        startup: function() {
          this.inherited(arguments);
          this.factorAnalysisPropertiesWidget.startup();
          this._factorAnalysisGraphWidget.startup();
        },

        destroy: function() {
          this.inherited(arguments);
          this.factorAnalysisPropertiesWidget.destroy();
          this._factorAnalysisGraphWidget.destroy();
        },

        resize: function() {
          this.inherited(arguments);
          this.factorAnalysisPropertiesWidget.resize();
          this._factorAnalysisGraphWidget.resize();
        },

        createFactorAnalysis: function(factorAnalysisResults) {
          if (this._factorAnalysisDataStore.data.length > 0) {
            this._removeFactorAnalysisResults();
          }

          for (var i = 0; i < factorAnalysisResults.length; i++) {
            var factorAnalysisWidget = new FactorAnalysisWidget({factorAnalysis: factorAnalysisResults[i]});
            this._factorAnalysisDataStore.put(factorAnalysisWidget);
          }

          if (factorAnalysisResults.length > 0) {
            this._factorAnalysisListWidget.select(this._factorAnalysisDataStore.data[0]);
          }
        },

        _removeFactorAnalysisResults: function() {
          this._factorAnalysisListWidget.clearSelection();

          while (this._factorAnalysisDataStore.data.length > 0) {
            this._factorAnalysisDataStore.remove(this._factorAnalysisDataStore.data[0].id);
          }
        },

        _handleFactorAnalysisSelected: function(evt) {
          var factorAnalysisWidget = evt.rows[0].data;

          this.factorAnalysisPropertiesWidget.setFactorAnalysisWidget(factorAnalysisWidget);
          this._factorAnalysisGraphWidget.setFactorAnalysisWidget(factorAnalysisWidget);
        },

        _handleFactorAnalysisDeSelected: function(evt) {
          this.factorAnalysisPropertiesWidget.setFactorAnalysisWidget(null);
          this._factorAnalysisGraphWidget.setFactorAnalysisWidget(null);
        },

        _handleGenerateQueryClicked: function(evt) {
          var clauses = this._getClausesFromFactorAnalysisResults();
          var query = new Query({title: 'Query Generator Query', clauses: clauses});

          topic.publish(PATopics.QUERY_GENERATED, query);
        },

        _getClausesFromFactorAnalysisResults: function() {
          var factorAnalysis;
          var factorStrategy;
          var clause;
          var results = this._factorAnalysisDataStore.query();
          var clauses = [];

          for (var i = 0; i < results.length; i++) {
            if (results[i].factorAnalysis.useInQueryGeneration) {
              factorAnalysis = results[i].factorAnalysis;
              factorStrategy = factorAnalysis.availableStrategies[factorAnalysis.selectedStrategyIndex];
              clause = factorStrategy.convertToClause();

              if (clause) {
                clauses.push(clause);
                clauses.push(new ConcatenationClause({operation: operatorUtils.andOperator}));
              }
              else {
                console.error('Failed to convert strategy to clause for ' +
                  factorStrategy.factorSource.alias + ' [' + factorStrategy.strategyName + ' strategy]');
              }
            }
          }

          // Remove trailing concatenation clause
          if (clauses.length > 0) {
            clauses.pop();
          }

          return clauses;
        }
      }
    );
  }
);