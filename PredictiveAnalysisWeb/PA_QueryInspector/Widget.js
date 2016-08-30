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
  './lib/js/queryInspector/QueryInspectorWidget',
  './lib/js/base/query/Query'

],
  function(array, declare, lang, domClass, json, topic, config, BaseWidget, QueryInspectorWidget, Query) {
    return declare([BaseWidget], {
      baseClass: 'jimu-widget-query-inspector',
      containerNode: null,
      queryInspectorWidget: null,

      postCreate: function() {
        this.inherited(arguments);
        var aQuery = new Query();
        var queryInspectorWidgetArgs = { map: this.map};
        this.queryInspectorWidget = new QueryInspectorWidget(queryInspectorWidgetArgs);
        this.queryInspectorWidget.setQuery(aQuery);
        this.queryInspectorWidget.placeAt(this.containerNode);
      },

      startup: function() {
        this.inherited(arguments);

        this.fetchDataByName('PA_QueryEditor');
      },

      //Process the query object here in to the Inpsector widget.
      onReceiveData: function(name, widgetId, data, historyData) {
        //filter out messages
        if (name !== 'PA_QueryEditor') {
          return;
        }
        var aQuery = new Query();
        aQuery.fromJson(data.jsonQuery);
        this.queryInspectorWidget.setQuery(aQuery, data.resultUrl);
        this.resize();
      },

      resize: function() {
        this.inherited(arguments);
        this.queryInspectorWidget.resize();
      },

      onOpen: function(){
        this.resize();
        this.queryInspectorWidget.activate();
      },

      onClose: function(){
        this.queryInspectorWidget.deactivate();
      }

    });
  });