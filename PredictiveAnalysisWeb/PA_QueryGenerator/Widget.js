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
  'jimu/PanelManager',
  './lib/js/queryGenerator/QueryGeneratorWidget',
  './lib/js/base/topics'
  //'dojo/text!/./../config.json'
],
  function(array, declare, lang, domClass, json, topic, config, BaseWidget, PanelManager, QueryGeneratorWidget, topics) {
    return declare([BaseWidget], {
      baseClass: 'jimu-widget-query-generator',

      containerNode: null,
      queryGeneratorWidget: null,
      _queryGeneratedTopicHandle: null,
      openQueryEditorOnQueryGenerate: true,


      postCreate: function() {
        this.inherited(arguments);

        this.openQueryEditorOnQueryGenerate = this.config.openQueryEditorOnQueryGenerate;
        var queryGeneratorWidgetArgs = {
          map: this.map,
          gpServiceUrl: this.config.gpServiceUrl
        };

        this.queryGeneratorWidget = new QueryGeneratorWidget(queryGeneratorWidgetArgs);
        this.queryGeneratorWidget.placeAt(this.containerNode);

        var foundIndex = array.indexOf(config.defaults.io.corsEnabledServers, this.config.gpServiceUrl);
        if (foundIndex === -1) {
          config.defaults.io.corsEnabledServers.push(this.config.gpServiceUrl);
        }

        this._queryGeneratedTopicHandle = topic.subscribe(
          topics.QUERY_GENERATED,
          lang.hitch(this, this.handleQueryGenerated));
      },

      handleQueryGenerated: function(query) {
        if (!query) {
          return;
        }

        this.publishData({
          message: 'Number of clauses is ' + query.clauses.length,
          jsonQuery: json.parse(json.stringify(query))
        });

        if (this.openQueryEditorOnQueryGenerate) {
          var allWidgets = this.appConfig.widgetOnScreen.widgets.concat(this.appConfig.widgetPool.widgets);
          var i = 0;
          var queryEditorWidget;
          while (!queryEditorWidget && (i < allWidgets.length)) {
            if (allWidgets[i].name === 'PA_QueryEditor') {
              queryEditorWidget = allWidgets[i];
            }
            i++;
          }

          if (queryEditorWidget) {
            PanelManager.getInstance().closePanel(this.id + '_panel');
            PanelManager.getInstance().showPanel(queryEditorWidget);
          }
        }
      },

      startup: function() {
        this.inherited(arguments);
      },

      destroy: function() {
        this.inherited(arguments);
        this._queryGeneratedTopicHandle.remove();
      },

      resize: function() {
        this.inherited(arguments);
        this.queryGeneratorWidget.resize();
      },

      onOpen: function() {
        this.queryGeneratorWidget.activate();
      },

      onClose: function() {
        this.queryGeneratorWidget.deactivate();
      }

    });
  });
