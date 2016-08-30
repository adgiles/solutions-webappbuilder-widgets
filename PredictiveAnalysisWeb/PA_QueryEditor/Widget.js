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
  'dojo/dom-class',
  'dojo/json',
  'dojo/topic',
  'esri/config',
  'jimu/BaseWidget',
  './Utils',
  './lib/js/base/clauses/BaseClause',
  './lib/js/base/query/Query',
  './lib/js/base/rasterSources/BaseRasterSource',
  './lib/js/queryEditor/QueryEditorWidget',
  './lib/js/base/topics'
],
  function(array, declare, lang, domClass, json, topic, config, BaseWidget, Utils, BaseClause, Query, BaseRasterSource, QueryEditorWidget, topics) {
    return declare([BaseWidget], {
      baseClass: 'jimu-widget-query-editor',

      containerNode: null,
      queryEditorWidget: null,
      _queryExecutedTopicHandle: null,

      postCreate: function() {
        this.inherited(arguments);

        var query = Utils.deserializeQuery(this.config.queryToExecute);
        var queryEditorWidgetArgs = {
          map: this.map,
          defaultQuery: query,
          gpServiceUrl: this.config.gpServiceUrl
        };

        this.queryEditorWidget = new QueryEditorWidget(queryEditorWidgetArgs);
        this.queryEditorWidget.placeAt(this.containerNode);

        var foundIndex = array.indexOf(config.defaults.io.corsEnabledServers, this.config.gpServiceUrl);
        if (foundIndex === -1) {
          config.defaults.io.corsEnabledServers.push(this.config.gpServiceUrl);
        }

        this._queryExecutedTopicHandle = topic.subscribe(
          topics.QUERY_EXECUTED,
          lang.hitch(this, this.handleQueryExecuted));
      },

      handleQueryExecuted: function(query, resultUrl) {
        if (typeof query === 'undefined') {
          return;
        }

        this.publishData({
          message: 'Number of clauses is ' + query.clauses.length,
          jsonQuery: json.parse(json.stringify(query)),
          resultUrl: resultUrl
        });
      },

      startup: function() {
        this.inherited(arguments);
        this.fetchDataByName('PA_QueryGenerator');
        if (this.config.showRasterSourceAndLegendUi === false) {
          domClass.add(this.queryEditorWidget.queryEditorLeftColumnNode, 'hide-column');
          domClass.add(this.queryEditorWidget.queryEditorRightColumnNode, 'maximize-column');
        }

      },

      destroy: function() {
        this.inherited(arguments);
        this._queryExecutedTopicHandle.remove();
      },

      onReceiveData: function(name, widgetId, data, historyData) {
        //filter out messages
        if (name !== 'PA_QueryGenerator') {
          return;
        }
        var aQuery = new Query();
        aQuery.fromJson(data.jsonQuery);
        this.queryEditorWidget.setQuery(aQuery);
        this.resize();
      }

    });
  });
