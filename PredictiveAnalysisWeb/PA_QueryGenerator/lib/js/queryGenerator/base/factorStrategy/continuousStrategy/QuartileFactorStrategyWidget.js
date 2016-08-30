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
  'dojo/text!./templates/QuartileFactorStrategyWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  './BaseContinuousFactorStrategyWidget'
],
  function(declare, template, _TemplatedMixin, BaseContinuousFactorStrategyWidget) {
    return declare(
      [BaseContinuousFactorStrategyWidget, _TemplatedMixin],
      {
        _firstQuartileCheckBoxNode: null,
        _secondQuartileCheckBoxNode: null,
        _thirdQuartileCheckBoxNode: null,
        _fourthQuartileCheckBoxNode: null,
        _fencesTypeRadioButtonNode: null,
        _quartilesTypeRadioButtonNode: null,
        templateString: template,

        postCreate: function() {
          this.inherited(arguments);

          this._firstQuartileCheckBoxNode.checked = this._factorStrategy.includeFirstQuartile;
          this._secondQuartileCheckBoxNode.checked = this._factorStrategy.includeSecondQuartile;
          this._thirdQuartileCheckBoxNode.checked = this._factorStrategy.includeThirdQuartile;
          this._fourthQuartileCheckBoxNode.checked = this._factorStrategy.includeFourthQuartile;

          this._fencesTypeRadioButtonNode.checked =
            this._factorStrategy.selectionType === this._factorStrategy.selectionTypeEnum.Fences;

          this._quartilesTypeRadioButtonNode.checked =
            this._factorStrategy.selectionType === this._factorStrategy.selectionTypeEnum.Quartiles;
        },

        _getFactorStrategySeriesData: function() {
          var seriesData = [];

          if (this._factorStrategy.selectionType === this._factorStrategy.selectionTypeEnum.Quartiles) {
            seriesData = this._generateSeriesDataFromQuartiles();
          }
          else if (this._factorStrategy.selectionType === this._factorStrategy.selectionTypeEnum.Fences) {
            seriesData = this._generateSeriesDataFromFences();
          }

          return seriesData;
        },

        _generateSeriesDataFromQuartiles: function() {
          var seriesStats = this._chart.getPlot(this._plotName).getSeriesStats();
          var seriesData = [];

          if (this._factorStrategy.includeFirstQuartile) {
            this._addQuartileSeriesData(
              seriesData,
              this._factorStrategy.minimum,
              this._factorStrategy.lowerQuartile,
              seriesStats.vmax
            );
          }

          if (this._factorStrategy.includeSecondQuartile) {
            this._addQuartileSeriesData(
              seriesData,
              this._factorStrategy.lowerQuartile,
              this._factorStrategy.median,
              seriesStats.vmax
            );
          }

          if (this._factorStrategy.includeThirdQuartile) {
            this._addQuartileSeriesData(
              seriesData,
              this._factorStrategy.median,
              this._factorStrategy.upperQuartile,
              seriesStats.vmax
            );
          }

          if (this._factorStrategy.includeFourthQuartile) {
            this._addQuartileSeriesData(
              seriesData,
              this._factorStrategy.upperQuartile,
              this._factorStrategy.maximum,
              seriesStats.vmax
            );
          }

          return seriesData;
        },

        _generateSeriesDataFromFences: function() {
          var seriesStats = this._chart.getPlot(this._plotName).getSeriesStats();

          return [
            {x: this._factorStrategy.lowerFence, y: 0},
            {x: this._factorStrategy.lowerFence, y: seriesStats.vmax},
            {x: this._factorStrategy.upperFence, y: seriesStats.vmax},
            {x: this._factorStrategy.upperFence, y: 0}
          ];
        },

        _addQuartileSeriesData: function(seriesData, fromValue, toValue, vmax) {
          seriesData.push({x: fromValue, y: 0});
          seriesData.push({x: fromValue, y: vmax});
          seriesData.push({x: toValue, y: vmax});
          seriesData.push({x: toValue, y: 0});
        },

        _handleQuartileTypeClicked: function(evt) {
          if (evt.target.value === this._factorStrategy.selectionTypeEnum.Quartiles.toString()) {
            this._factorStrategy.selectionType = this._factorStrategy.selectionTypeEnum.Quartiles;
          }
          else if (evt.target.value === this._factorStrategy.selectionTypeEnum.Fences.toString()) {
            this._factorStrategy.selectionType = this._factorStrategy.selectionTypeEnum.Fences;
          }
          else {
            return;
          }

          this._onFactorStrategyWidgetChanged();
        },

        _handleQuartileChanged: function(evt) {
          switch(evt.target.value) {
            case '1':
              this._factorStrategy.includeFirstQuartile = evt.target.checked;
              break;
            case '2':
              this._factorStrategy.includeSecondQuartile = evt.target.checked;
              break;
            case '3':
              this._factorStrategy.includeThirdQuartile = evt.target.checked;
              break;
            case '4':
              this._factorStrategy.includeFourthQuartile = evt.target.checked;
              break;
            default:
              return;
          }

          this._onFactorStrategyWidgetChanged();
        }
      }
    );
  }
);
