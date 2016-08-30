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
  'dojo/on',
  'dijit/_WidgetBase',
  'dijit/layout/AccordionContainer',
  'dijit/layout/ContentPane',
  './base/AnalysisInputWidget'  ,
  './base/QueryGenerationWidget'
],
  function(declare, lang, domClass, on, _WidgetBase, AccordionContainer, ContentPane, AnalysisInputWidget, QueryGenerationWidget) {
    return declare(
      [_WidgetBase],
      {
        _accordionContainerWidget: null,
        _analysisInputContentPane: null,
        _queryGenerationContentPane: null,
        analysisInputWidget: null,
        queryGenerationInputWidget: null,
        gpServiceUrl: null,
        map: null,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }

          if (!(this.map)) {
            throw new Error('A Query Generator Widget must contain a map argument.');
          }

          if (!(this.gpServiceUrl)) {
            throw new Error('A Query Generator Widget must contain an Analyze Query Factors GP Service Url endpoint.');
          }
        },

        postCreate: function() {
          this.inherited(arguments);
          domClass.add(this.domNode, 'query-generator-container');

          this.analysisInputWidget = new AnalysisInputWidget({map: this.map, gpServiceUrl: this.gpServiceUrl});
          on(this.analysisInputWidget, 'analysis-complete', lang.hitch(this, this._handleAnalysisComplete));

          this._analysisInputContentPane = new ContentPane({
            title: 'Analysis Inputs',
            content: this.analysisInputWidget
          });

          this.queryGenerationInputWidget = new QueryGenerationWidget();
          this._queryGenerationContentPane = new ContentPane({
            title: 'Query Generation',
            content: this.queryGenerationInputWidget
          });

          this._accordionContainerWidget = new AccordionContainer();
          this._accordionContainerWidget.placeAt(this.domNode);
          this._accordionContainerWidget.addChild(this._analysisInputContentPane);
          this._accordionContainerWidget.addChild(this._queryGenerationContentPane);
          this._accordionContainerWidget.watch('selectedChildWidget', lang.hitch(this, this.selectedChildChanged));
        },

        startup: function() {
          this.inherited(arguments);
          this._accordionContainerWidget.startup();
        },

        destroy: function() {
          this._accordionContainerWidget.destroy();
          this.inherited(arguments);
          this.analysisInputWidget.destroy();
        },

        resize: function() {
          this.inherited(arguments);
          this._accordionContainerWidget.resize();
        },

        activate: function() {
          this.analysisInputWidget.activate();
        },

        deactivate: function() {
          this.analysisInputWidget.deactivate();
        },

        _handleAnalysisComplete: function(evt) {
          this._accordionContainerWidget.selectChild(this._queryGenerationContentPane);
          this.queryGenerationInputWidget.createFactorAnalysis(evt);
        },

        selectedChildChanged: function(evt) {
          if (this._accordionContainerWidget.selectedChildWidget === this._analysisInputContentPane) {
            this.analysisInputWidget.activate();
          }
          else {
            this.analysisInputWidget.deactivate();
          }
        }

      }
    );
  }
);

