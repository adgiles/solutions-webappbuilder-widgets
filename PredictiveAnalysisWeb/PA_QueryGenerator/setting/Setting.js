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
  './../lib/js/queryGenerator/QueryGeneratorWidget'
],
  function(declare, json, _WidgetsInTemplateMixin, CheckBox, TextBox, BaseWidgetSetting, QueryGeneratorWidget) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'jimu-widget-query-generator-setting',

      postCreate: function() {

      },

      startup: function() {
        this.inherited(arguments);

        this.setConfig(this.config);
      },

      setConfig: function(config) {
        this.gpServiceEndPointTextBox.set('value', this.config.gpServiceUrl);
        this.openQueryEditorOnQueryGenerateCheckBox.set('value', this.config.openQueryEditorOnQueryGenerate);
      },

      getConfig: function() {
        this.config.gpServiceUrl = this.gpServiceEndPointTextBox.get('value');
        this.config.openQueryEditorOnQueryGenerate = this.openQueryEditorOnQueryGenerateCheckBox.get('value');
        return this.config;
      }
    });
  });