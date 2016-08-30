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
  'dojo/dom-class',
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/text!./templates/AnalysisInputTemplate.html',
  'dijit/ProgressBar',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'esri/tasks/FeatureSet',
  'esri/tasks/Geoprocessor',
  'esri/domUtils',
  './factorAnalysis/Utils',
  './PointSourceControllerWidget',
  './RasterSourceControllerWidget'
],
  function(declare, domClass, lang, Evented, template, ProgressBar, _TemplatedMixin, _WidgetBase, FeatureSet,
           Geoprocessor, domUtils, factorAnalysisUtils, PointSourceControllerWidget, RasterSourceControllerWidget) {
    return declare(
      [_WidgetBase, _TemplatedMixin, Evented],
      {
        analyzeStatusTextNode: null,
        map: null,
        pointInputContentNode: null,
        pointSourceControllerWidget: null,
        progressBarContentNode: null,
        progressBarWidget: null,
        rasterInputContentNode: null,
        rasterSourceControllerWidget: null,
        gpServiceUrl: null,
        gp: null,
        templateString: template,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }

          if (!(this.map)) {
            throw new Error('The Analysis Input Widget must contain a map argument.');
          }

          if (!(this.gpServiceUrl)) {
            throw new Error('The Analysis Input Widget must contain an Analyze Query Factors GP Service Url endpoint.');
          }
        },

        postCreate: function() {
          this.inherited(arguments);

          this.pointSourceControllerWidget = new PointSourceControllerWidget({map: this.map});
          this.pointSourceControllerWidget.placeAt(this.pointInputContentNode);

          this.rasterSourceControllerWidget = new RasterSourceControllerWidget({map: this.map});
          this.rasterSourceControllerWidget.placeAt(this.rasterInputContentNode);

          this.progressBarWidget = new ProgressBar();
          this.progressBarWidget.placeAt(this.progressBarContentNode);

          domClass.add(this.progressBarWidget.domNode, 'analyze-progress-bar');

          this.analyzeStatusTextNode.innerHTML = 'Analysis has not started.';

          this.gp = new Geoprocessor(this.gpServiceUrl);
        },

        startup: function() {
          this.pointSourceControllerWidget.startup();
          this.rasterSourceControllerWidget.startup();
          this.progressBarWidget.startup();
          this.inherited(arguments);
        },

        destroy: function() {
          this.pointSourceControllerWidget.destroy();
          this.rasterSourceControllerWidget.startup();
          this.progressBarWidget.destroy();
          this.inherited(arguments);
        },

        resize: function() {
          this.inherited(arguments);
          this.rasterSourceControllerWidget.resize();
        },

        activate: function() {
          this.pointSourceControllerWidget.activate();
        },

        deactivate: function() {
          this.pointSourceControllerWidget.deactivate();
        },

        executeAnalyze: function() {
          this._handleExecuteAnalyze();
          this.progressBarWidget.set({value: 10});
        },

        _handleExecuteAnalyze: function() {

          var pointsDfd = this.pointSourceControllerWidget.getPoints();
          pointsDfd.then(
            lang.hitch(this, this._submitGeoprocessingJob),
            lang.hitch(this, this._gpJobFailed));
        },

        _submitGeoprocessingJob: function(pointFeatureSet) {
          var rasterSources = this._getRasterSourcesPamameter();
          if (rasterSources.length <= 0) {
            this.analyzeStatusTextNode.innerHTML = 'No Factors Selected.';
            this.progressBarWidget.set({value: 0});
            return;
          }

          if (pointFeatureSet.features.length <= 0) {
            this._gpJobFailed('No points to process from this source.');
            this.progressBarWidget.set({value: 0});
            return;
          }
          this.pointSourceControllerWidget.deactivate();
          var params = {
            'Input_Point_Feature_Class': pointFeatureSet,
            'Raster_Source_Collection_String__JSON_': JSON.stringify(rasterSources)
          };

          this.gp.submitJob(params,
            lang.hitch(this, this._gpJobComplete),
            lang.hitch(this, this._gpJobStatus),
            lang.hitch(this, this._gpJobFailed)
          );
        },

        _getRasterSourcesPamameter: function() {
          var rasterSources = this.rasterSourceControllerWidget.getRasterSources();
          var rasterSourcesParameter = [];

          for (var i = 0; i < rasterSources.length; i++) {
            rasterSourcesParameter.push(rasterSources[i].toServerJson());
          }

          return rasterSourcesParameter;
        },

        _gpJobStatus: function(jobInfo) {
          domUtils.show(this.analyzeStatusTextNode);
          var jobStatus = '';

          switch (jobInfo.jobStatus) {
            case 'esriJobSubmitted':
              jobStatus = 'Submitted...';
              this.progressBarWidget.set({value: 33});
              break;
            case 'esriJobExecuting':
              jobStatus = 'Executing...';
              this.progressBarWidget.set({value: 66});
              break;
            case 'esriJobSucceeded':
              jobStatus = 'Succeeded';
              this.progressBarWidget.set({value: 100});
              break;
            case 'esriJobFailed':
              jobStatus = 'Error, see console.';
              console.error('Geoprocessing job failed! See Server log for more info: ',
                jobInfo.messages);
              this.progressBarWidget.set({value: 0});
              this.pointSourceControllerWidget.activate();
              break;
          }
          this.analyzeStatusTextNode.innerHTML = jobStatus;
        },

        _gpJobFailed: function(error) {
          this.analyzeStatusTextNode.innerHTML = error;
          this.progressBarWidget.set({value: 0});
          this.pointSourceControllerWidget.activate();
        },

        _gpJobComplete: function(jobInfo) {
          if (jobInfo.jobStatus === 'esriJobFailed') {
            return;
          }

          for (var i = 0; i < jobInfo.messages.length; i++) {
            console.log('GP Log Message ', (i + 1), ': ', jobInfo.messages[i].description);
          }

          this.gp.getResultData(jobInfo.jobId, 'Analysis_Result').then(
            lang.hitch(this, this._handleGetAnalysisResultData));
        },

        _handleGetAnalysisResultData: function(result) {
          var resultData = result.value;
          var factorAnalysisResults = [];

          for (var i = 0; i < resultData.length; i++) {
            factorAnalysisResults.push(factorAnalysisUtils.createFactorAnalysisFromServerJson(resultData[i]));
          }

          console.log('Results: ', factorAnalysisResults);
          this.emit('analysis-complete', factorAnalysisResults);
        }
      }
    );
  }
);