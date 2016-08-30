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
  'dojo/text!../templates/SliderFactorStrategyWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  'dijit/form/HorizontalRuleLabels',
  'dijit/form/HorizontalRule',
  'dijit/form/HorizontalSlider',
  './BaseContinuousFactorStrategyWidget',
  '../../../../base/Utils'
],
  function(array, declare, lang, template, _TemplatedMixin, HorizontalRuleLabels, HorizontalRule,
           HorizontalSlider, BaseContinuousFactorStrategyWidget, baseUtils) {
    return declare(
      [BaseContinuousFactorStrategyWidget, _TemplatedMixin],
      {
        _clusterStrategyKeys: null,
        _horizontalRuleLabelsNode: null,
        _horizontalRulesNode: null,
        _horizontalSlider: null,
        _horizontalSliderNode: null,
        _rulerTicks: null,
        _textLabels: null,
        templateString: template,

        postCreate: function() {
          var clusterStrategies = this._factorStrategy.clusterStrategyEnum;
          var initialValueKey = baseUtils.getKeyByValue(clusterStrategies, this._factorStrategy.clusterStrategy);
          this._clusterStrategyKeys = Object.keys(clusterStrategies);

          this._horizontalSlider = new HorizontalSlider({
            value: array.indexOf(this._clusterStrategyKeys, initialValueKey),
            minimum: 0,
            maximum: this._clusterStrategyKeys.length - 1,
            discreteValues: this._clusterStrategyKeys.length,
            showButtons: false,
            onChange: lang.hitch(this, this._handleSliderValueChanged)
          }, this._horizontalSliderNode);

          this._rulerTicks = new HorizontalRule({
            container: 'bottomDecoration',
            count: this._clusterStrategyKeys.length
          }, this._horizontalRulesNode);

          this._textLabels = new HorizontalRuleLabels({
            container: 'bottomDecoration',
            labels: [this._clusterStrategyKeys[0], this._clusterStrategyKeys[this._clusterStrategyKeys.length - 1]]
          }, this._horizontalRuleLabelsNode);
        },

        startup: function() {
          this.inherited(arguments);

          this._horizontalSlider.startup();
          this._rulerTicks.startup();
          this._textLabels.startup();
        },

        destroy: function() {
          this.inherited(arguments);

          this._horizontalSlider.destroy();
          this._rulerTicks.destroy();
          this._textLabels.destroy();
        },

        _getFactorStrategySeriesData: function() {
          var seriesData = [];
          var seriesStats = this._chart.getPlot(this._plotName).getSeriesStats();

          for (var i = 0; i < this._factorStrategy.clusters.length; i++) {
            seriesData.push({x: this._factorStrategy.clusters[i].clusterMin, y: 0});
            seriesData.push({x: this._factorStrategy.clusters[i].clusterMin, y: seriesStats.vmax});
            seriesData.push({x: this._factorStrategy.clusters[i].clusterMax, y: seriesStats.vmax});
            seriesData.push({x: this._factorStrategy.clusters[i].clusterMax, y: 0});
          }

          return seriesData;
        },

        _handleSliderValueChanged: function(newValueIndex) {
          var newClusterStrategyKey = this._clusterStrategyKeys[newValueIndex];
          this._factorStrategy.setClusterStrategy(this._factorStrategy.clusterStrategyEnum[newClusterStrategyKey]);
          this._onFactorStrategyWidgetChanged();
        }
      }
    );
  }
);



