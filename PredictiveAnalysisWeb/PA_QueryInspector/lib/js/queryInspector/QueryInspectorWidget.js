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
  'dojo/Deferred',
  'dojo/dom-class',
  'dojo/on',
  'dojo/text!./template/QueryInspectorWidgetTemplate.html',
  'dojo/topic',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'dijit/layout/BorderContainer',
  'dijit/layout/ContentPane',
  './base/dataStore/QueryInspectorDataStoreWidget',
  '../base/pointManager/PointManager',
  '../base/query/QueryWidget',
  '../base/topics'
],
  function(array, declare, lang, Deferred, domClass, on, template, topic, _TemplatedMixin, _WidgetBase,
           BorderContainer, ContentPane, QueryInspectorDataStoreWidget, PointManager, QueryWidget, PATopics) {
    return declare([_WidgetBase, _TemplatedMixin],
      {
        _activeInspectionResults: null,
        _pointManagerPointAddedHandler: null,
        _queryExecutedTopicHandler: null,
        _queryInspectionResultSelectionChangedHandler: null,
        gridContentPaneWidget: null,
        isActive: false,
        mainContentContainerNode: null,
        mainContentContainerWidget: null,
        map: null,
        pointManager: null,
        queryContentPaneWidget: null,
        queryInspectorDataStoreWidget: null,
        queryViewToggleState: false,
        queryWidget: null,
        templateString: template,
        togglePointsButtonNode: null,
        viewQueryButtonNode: null,

        constructor: function(args) {
          this.queryViewToggleState = false;
          this._activeInspectionResults = [];
          if (args) {
            declare.safeMixin(this, args);
          }
        },

        postCreate: function() {
          this.inherited(arguments);

          this._initPointManager();
          this._initGridContentPane();
          this._initQueryViewContentPane();

          this._queryExecutedTopicHandler = topic.subscribe(
            PATopics.QUERY_EXECUTED,
            lang.hitch(this, this._handleQueryExecuted));
        },

        startup: function() {
          this.inherited(arguments);
          this.queryWidget.startup();
          this.queryInspectorDataStoreWidget.startup();
          this.mainContentContainerWidget.startup();
        },

        destroy: function() {
          this.pointManager.deactivate();
          this._pointManagerPointAddedHandler.remove();

          this._queryExecutedTopicHandler.remove();
          this._queryInspectionResultSelectionChangedHandler.remove();

          this.inherited(arguments);
        },

        resize: function() {
          this.queryInspectorDataStoreWidget.resize();
          this.queryWidget.resize();
          this.mainContentContainerWidget.resize();
        },

        setQuery: function(query, resultUrl) {
          this.queryInspectorDataStoreWidget.setQuery(query, resultUrl);
          this._handleQueryExecuted(query);
        },

        _initPointManager: function() {
          this.pointManager = new PointManager({map: this.map});

          this._pointManagerPointAddedHandler = on(
            this.pointManager,
            'point-added',
            lang.hitch(this, this._handlePointAdded));

          if (this.pointManager.isGraphicsLayerVisible) {
            domClass.add(this.togglePointsButtonNode, 'query-button-toggled-state');
          }
        },

        _initGridContentPane: function() {
          this.queryInspectorDataStoreWidget = new QueryInspectorDataStoreWidget();
          this._queryInspectionResultSelectionChangedHandler = on(
            this.queryInspectorDataStoreWidget,
            'selection-changed',
            lang.hitch(this, this._handleQueryInspectionResultSelectionChanged));

          this.gridContentPaneWidget = new ContentPane({
              region: 'center',
              content: this.queryInspectorDataStoreWidget.domNode
            }
          );

          var borderContainerArgs = { liveSplitters: true, gutters: true };
          this.mainContentContainerWidget = new BorderContainer(borderContainerArgs, this.mainContentContainerNode);
          this.mainContentContainerWidget.addChild(this.gridContentPaneWidget);
        },

        _initQueryViewContentPane: function() {
          this.queryWidget = new QueryWidget({hideRunButton: true, isEnabled: false});

          this.queryContentPaneWidget = new ContentPane({
              region: 'bottom',
              minSize: 100,
              splitter: true,
              style: 'height: 50%;',
              content: this.queryWidget.domNode
            }
          );

          if (this.queryViewToggleState) {
            this.mainContentContainerWidget.addChild(this.queryContentPaneWidget);
            domClass.add(this.viewQueryButtonNode, 'query-button-toggled-state');
          }
        },

        _handlePointAdded: function(graphic) {
          this.queryInspectorDataStoreWidget.addQueryInspection(graphic);
        },

        _handleQueryExecuted: function(query) {
          this.queryWidget.setQuery(query);

          // Trigger a re-evaluation because the new query may contain
          // different constraints, clauses, or operators.
          this._displayQueryWidgetEvaluation();
        },

        _handleQueryInspectionResultSelectionChanged: function(evt) {
          var graphics = array.map(
            evt.inspectionResults,
            function(inspectionResult) { return inspectionResult.location; });

          this.pointManager.updateSelection(graphics, evt.isSelection);

          if (evt.isSelection) {
            this._activeInspectionResults = this._activeInspectionResults.concat(evt.inspectionResults);
          }
          else {
            var currentIndex;
            for (var i = 0; i < evt.inspectionResults.length; i++) {
              currentIndex = array.indexOf(this._activeInspectionResults, evt.inspectionResults[i]);
              if (currentIndex !== -1) {
                this._activeInspectionResults.splice(currentIndex, 1);
              }
            }
          }

          this._displayQueryWidgetEvaluation();
        },

        _displayQueryWidgetEvaluation: function() {
          if (this._activeInspectionResults.length === 1) {
            if (this._activeInspectionResults[0].query instanceof Deferred) {
              this._activeInspectionResults[0].query.then(lang.hitch(this, function(result) {
                this.queryWidget.evaluate(this._activeInspectionResults[0]);
              }));
            }
            else {
              this.queryWidget.evaluate(this._activeInspectionResults[0]);
            }
          }
          else {
            this.queryWidget.clearEvaluateState();
          }
        },

        activate: function() {
          var  activateDeferred = this.pointManager.activate();
          activateDeferred.then(lang.hitch(this, function() { this.isActive = true; }));

          return activateDeferred;
        },

        deactivate: function() {
          this.pointManager.deactivate();
          this.isActive = false;
        },

        _handleClearPoints: function() {
          this.pointManager.clear();
          this.queryInspectorDataStoreWidget.clear();
        },

        _handleToggleViewQuery: function() {
          this.queryViewToggleState = !this.queryViewToggleState;

          if (this.queryViewToggleState) {
            this.mainContentContainerWidget.addChild(this.queryContentPaneWidget);
            domClass.add(this.viewQueryButtonNode, 'query-button-toggled-state');
          }
          else {
            this.mainContentContainerWidget.removeChild(this.queryContentPaneWidget);
            domClass.remove(this.viewQueryButtonNode, 'query-button-toggled-state');
          }
        },

        _handleTogglePointFeatures: function() {
          var previousState = this.pointManager.isGraphicsLayerVisible;
          var newState = !previousState;

          this.pointManager.setPointsVisibility(newState);

          if (newState) {
            domClass.add(this.togglePointsButtonNode, 'query-button-toggled-state');
          }
          else {
            domClass.remove(this.togglePointsButtonNode, 'query-button-toggled-state');
          }

        }
      }
    );
  }
);
