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
  'dojo/text!../templates/SliderFactorStrategyWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  'dijit/form/HorizontalRuleLabels',
  'dijit/form/HorizontalRule',
  'dijit/form/HorizontalSlider',
  './BaseDiscreteFactorStrategyWidget'
],
  function(declare, lang, template, _TemplatedMixin, HorizontalRuleLabels, HorizontalRule, HorizontalSlider,
           BaseDiscreteFactorStrategyWidget) {
    return declare(
      [BaseDiscreteFactorStrategyWidget, _TemplatedMixin],
      {
        _horizontalRuleLabelsNode: null,
        _horizontalRulesNode: null,
        _horizontalSlider: null,
        _horizontalSliderNode: null,
        _rulerTicks: null,
        _textLabels: null,
        templateString: template,

        postCreate: function() {
          this._horizontalSlider = new HorizontalSlider({
            value: this._factorStrategy.clusterPassingPercentage,
            minimum: 0,
            maximum: 50,
            discreteValues: 11,
            showButtons: false,
            onChange: lang.hitch(this, this._handleSliderValueChanged)
          }, this._horizontalSliderNode);

          this._rulerTicks = new HorizontalRule({
            container: 'bottomDecoration',
            count: 11
          }, this._horizontalRulesNode);

          this._textLabels = new HorizontalRuleLabels({
            container: 'bottomDecoration',
            labels: ['0%', '25%', '50%']
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

        _handleSliderValueChanged: function(newValue) {
          this._factorStrategy.setPassingPercentage(newValue);
          this._onFactorStrategyWidgetChanged();
        },

        _alterSeriesDataElement: function(seriesDataElement) {
          var percentage = (seriesDataElement.y / this._factorStrategy.factorValueCount) * 100;
          if (percentage >= this._factorStrategy.clusterPassingPercentage) {
            seriesDataElement.color = this._selectedFill;
          }
          else if (seriesDataElement.color) {
            delete seriesDataElement.color;
          }
        },

        _removeSeriesDataElementAlteration: function(seriesDataElement) {
          if (seriesDataElement.color) {
            delete seriesDataElement.color;
          }
        }
      }
    );
  }
);
