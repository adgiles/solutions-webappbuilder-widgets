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
  'dojo/json',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/form/CheckBox',
  'dijit/form/TextBox',
  'jimu/BaseWidgetSetting',
  './../Utils',
  './../lib/js/queryEditor/QueryEditorWidget'
],
  function(declare, json, _WidgetsInTemplateMixin, CheckBox, TextBox, BaseWidgetSetting, Utils, QueryEditorWidget) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-query-editor-setting',
      containerNode: null,
      queryEditorWidget: null,

      postCreate: function() {
        try {
          var queryEditorWidgetArgs = {
            map: this.map,
            hideRunButton: true
          };

          this.queryEditorWidget = new QueryEditorWidget(queryEditorWidgetArgs);
          this.queryEditorWidget.placeAt(this.queryEditorContainerNode);
        }
        catch (err) {
          console.error(err.message);
        }
      },

      startup: function() {
        this.inherited(arguments);
        this.queryEditorWidget.startup();

        this.setConfig(this.config);
      },

      setConfig: function(config) {
        this.gpServiceEndPointTextBox.set('value', this.config.gpServiceUrl);
        this.showRasterSourceAndLegendUiCheckBox.set('value', this.config.showRasterSourceAndLegendUi);
        var query = Utils.deserializeQuery(this.config.queryToExecute);

        if (query) {
          this.queryEditorWidget.setQuery(query);
        }

        this.queryEditorWidget.gpServiceUrl = this.config.gpServiceUrl;
      },

      getConfig: function() {
        this.config.gpServiceUrl = this.gpServiceEndPointTextBox.get('value');
        this.config.showRasterSourceAndLegendUi = this.showRasterSourceAndLegendUiCheckBox.get('value');

        var query = this.queryEditorWidget.getQuery();
        this.config.queryToExecute = json.stringify(query);

        return this.config;
      }
    });
  });