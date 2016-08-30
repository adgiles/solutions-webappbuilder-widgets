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
  'dojo/on',
  'dojo/text!./template/QueryEditorWidgetTemplate.html',
  'dojo/topic',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'esri/dijit/Legend',
  'esri/domUtils',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'esri/tasks/Geoprocessor',
  '../base/query/QueryWidget',
  '../base/rasterSourceController/RasterSourceControllerWidget',
  '../base/topics'
],
  function(declare, lang, on, template, topic, _TemplatedMixin, _WidgetBase, Legend, domUtils,
           ArcGISDynamicMapServiceLayer, Geoprocessor, QueryWidget, RasterSourceControllerWidget, paTopics) {
    return declare(
      [_WidgetBase, _TemplatedMixin],
      {
        defaultQuery: null,
        gp: null,
        gpServiceUrl: 'https://<base-url>/arcgis/rest/services/Geoprocessing/ExecuteQuery/GPServer/ExecuteQueryModel',
        hideRunButton: false,
        legend: null,
        legendContentPane: null,
        legendContainer: null,
        map: null,
        queryWidget: null,
        queryWidgetContainer: null,
        resultLayer: null,
        rasterSourceControllerWidget: null,
        rasterSourceControllerWidgetContainer: null,
        templateString: template,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }

          if (!(this.map)) {
            throw new Error('A Query Editor Widget must contain a map argument.');
          }
        },

        postCreate: function() {
          this.inherited(arguments);

          this.own(on(this.map, 'layers-add-result', lang.hitch(this, this._onLayerAdded)));

          this.own(topic.subscribe(paTopics.QUERY_GENERATED, lang.hitch(this, this.setQuery)));

          this.gp = new Geoprocessor(this.gpServiceUrl);

          this._initRasterSourceControllerWidget();
          this._initQueryWidget();
        },

        startup: function() {
          this.rasterSourceControllerWidget.startup();
          this.queryWidget.startup();
          this.inherited(arguments);
        },

        destroy: function() {
          this.rasterSourceControllerWidget.destroy();
          this.queryWidget.destroy();
          this.inherited(arguments);
        },

        _onLayerAdded: function() {
          if (this.resultLayer === null) {
            return;
          }

          var layerInfo = [{layer: this.resultLayer}];

          if (this.legend === null) {
            var legendParams = {map: this.map, layerInfos: layerInfo};
            this.legend = new Legend(legendParams, this.legendContainer);
            this.legend.startup();
            this.legend.refresh();
          }
          else {
            this.legend.refresh(layerInfo);
          }
        },

        _initRasterSourceControllerWidget: function() {
          this.rasterSourceControllerWidget = new RasterSourceControllerWidget({map: this.map});
          this.rasterSourceControllerWidget.placeAt(this.rasterSourceControllerWidgetContainer);

          this.own(
            on(
              this.rasterSourceControllerWidget,
              'onRasterSourceDblClick',
              lang.hitch(this, this._handleRasterSourceDblClick)
            )
          );

          this.own(
            on(
              this.rasterSourceControllerWidget,
              'onRasterSourceClick',
              lang.hitch(this, this._handleRasterSourceClick)
            )
          );
        },

        _initQueryWidget: function() {
          var queryWidgetArgs = {};

          if (this.defaultQuery) {
            queryWidgetArgs.query = this.defaultQuery;
          }
          if(this.hideRunButton) {
            queryWidgetArgs.hideRunButton = this.hideRunButton;
          }

          this.queryWidget = new QueryWidget(queryWidgetArgs);
          this.queryWidget.placeAt(this.queryWidgetContainer);

          this.own(on(this.queryWidget, 'onQueryExecuted', lang.hitch(this, this._handleQueryExecuted)));
        },

        _handleRasterSourceDblClick: function(rasterSource) {
          this.queryWidget.addClause(rasterSource);
        },

        _handleRasterSourceClick: function(rasterSource) {
          this.queryWidget.currentSelectedRasterSource = rasterSource;
        },

        _handleQueryExecuted: function(query) {
          var params = {'Query_File': query.convertToXmlStr()};
          this.gp.submitJob(
            params,
            lang.hitch(this, this.gpJobComplete),
            lang.hitch(this, this.gpJobStatus),
            lang.hitch(this, this.gpJobFailed));
        },

        getQuery: function() {
          return this.queryWidget.query;
        },

        setQuery: function(query) {
          if (query) {
            this.queryWidget.setQuery(query);
          }
        },

        gpJobStatus: function(jobInfo) {
          domUtils.show(this.status);
          var jobStatus = '';

          switch (jobInfo.jobStatus) {
            case 'esriJobSubmitted':
              jobStatus = 'Submitted...';
              break;
            case 'esriJobExecuting':
              jobStatus = 'Executing...';
              break;
            case 'esriJobSucceeded':
              jobStatus = 'Succeeded';
              break;
            case 'esriJobFailed':
              jobStatus = 'Error, see console.';
              console.error('GP job failed! See message log for more info: ', jobInfo.messages);
              break;
          }

          this.status.innerHTML = jobStatus;
        },

        gpJobFailed: function(error) {
          this.status.innerHTML = error;
          console.error('Error executing geoprocessing service: ' + error);
        },

        gpJobComplete: function(jobInfo) {
          if (jobInfo.jobStatus === 'esriJobFailed') {
            return;
          }

          this.cleanup();

          this.gp.getResultImageLayer(jobInfo.jobId, null, null, lang.hitch(this, function(layer){
            layer.setOpacity(0.7);
            this.map.addLayers([layer]);
            this.resultLayer = layer;
            topic.publish(paTopics.QUERY_EXECUTED, this.queryWidget.query, layer.url);
          }));
        },

        cleanup: function() {
          if (this.resultLayer !== null) {
            this.map.removeLayer(this.resultLayer);
            this.resultLayer = null;
          }
        },

        resize: function() {
          this.inherited(arguments);
          this.queryWidget.resize();
        }
      }
    );
  }
);
