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
  'dojo/text!./templates/ManualRangeFactorStrategyWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  './BaseContinuousFactorStrategyWidget'
],
  function(declare, template, _TemplatedMixin, BaseContinuousFactorStrategyWidget) {
    return declare(
      [BaseContinuousFactorStrategyWidget, _TemplatedMixin],
      {
        templateString: template,

        _getFactorStrategySeriesData: function() {
          var seriesStats = this._chart.getPlot(this._plotName).getSeriesStats();

          return [
            {x: this._factorStrategy.minValue, y: 0},
            {x: this._factorStrategy.minValue, y: seriesStats.vmax},
            {x: this._factorStrategy.maxValue, y: seriesStats.vmax},
            {x: this._factorStrategy.maxValue, y: 0}
          ];
        },

        _handleMinValueChanged: function(evt) {
          var value = Number(evt.target.value);

          if (value <= this._factorStrategy.maxValue) {
            this._factorStrategy.minValue = value;
          }
          else {
            if (evt.type === 'change') {
              evt.target.value = this._factorStrategy.maxValue;
            }

            this._factorStrategy.minValue = this._factorStrategy.maxValue;
          }

          this._onFactorStrategyWidgetChanged();
        },

        _handleMaxValueChanged: function(evt) {
          var value = Number(evt.target.value);

          if (value >= this._factorStrategy.minValue) {
            this._factorStrategy.maxValue = value;
          }
          else {
            if (evt.type === 'change') {
              evt.target.value = this._factorStrategy.minValue;
            }

            this._factorStrategy.maxValue = this._factorStrategy.minValue;
          }

          this._onFactorStrategyWidgetChanged();
        }
      }
    );
  }
);