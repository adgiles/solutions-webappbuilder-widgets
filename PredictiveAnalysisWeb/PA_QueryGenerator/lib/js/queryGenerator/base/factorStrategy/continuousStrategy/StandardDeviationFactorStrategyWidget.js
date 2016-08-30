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
        _deviationTypeKeys: null,
        _horizontalRuleLabelsNode: null,
        _horizontalRulesNode: null,
        _horizontalSlider: null,
        _horizontalSliderNode: null,
        _rulerTicks: null,
        _textLabels: null,
        templateString: template,

        postCreate: function() {
          var deviationTypeStrategies = this._factorStrategy.deviationTypeEnum;
          var initialValueKey = baseUtils.getKeyByValue(deviationTypeStrategies, this._factorStrategy.deviationType);
          this._deviationTypeKeys = Object.keys(deviationTypeStrategies);

          this._horizontalSlider = new HorizontalSlider({
            value: array.indexOf(this._deviationTypeKeys, initialValueKey),
            minimum: 0,
            maximum: this._deviationTypeKeys.length - 1,
            discreteValues: this._deviationTypeKeys.length,
            showButtons: false,
            onChange: lang.hitch(this, this._handleSliderValueChanged)
          }, this._horizontalSliderNode);

          this._rulerTicks = new HorizontalRule({
            container: 'bottomDecoration',
            count: this._deviationTypeKeys.length
          }, this._horizontalRulesNode);

          this._textLabels = new HorizontalRuleLabels({
            container: 'bottomDecoration',
            labels: [this._deviationTypeKeys[0], this._deviationTypeKeys[this._deviationTypeKeys.length - 1]]
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
          var seriesStats = this._chart.getPlot(this._plotName).getSeriesStats();
          var minValue = this._factorStrategy.mean - this._factorStrategy.standardDeviation;
          var maxValue = this._factorStrategy.mean + this._factorStrategy.standardDeviation;

          return [
            {x: minValue, y: 0},
            {x: minValue, y: seriesStats.vmax},
            {x: maxValue, y: seriesStats.vmax},
            {x: maxValue, y: 0}
          ];
        },

        _handleSliderValueChanged: function(newValueIndex) {
          var newDeviationTypeStrategyKey = this._deviationTypeKeys[newValueIndex];
          this._factorStrategy.setDeviationType(this._factorStrategy.deviationTypeEnum[newDeviationTypeStrategyKey]);
          this._onFactorStrategyWidgetChanged();
        }
      }
    );
  }
);



