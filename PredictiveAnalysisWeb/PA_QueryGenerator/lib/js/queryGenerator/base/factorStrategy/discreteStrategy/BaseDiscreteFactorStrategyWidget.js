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
  '../BaseFactorStrategyWidget'
],
  function(declare, BaseFactorStrategyWidget) {
    return declare(
      [BaseFactorStrategyWidget],
      {
        _selectedFill: null,

        constructor: function(/* args */) {
          this._selectedFill = {r: 0, g: 255, b: 255, a: 1};
        },

        _updateFactorStrategyChartDisplay: function() {
          var plot = this._chart.getPlot(this._plotName);
          var series = plot.series[0];
          for (var i = 0; i < series.data.length; i++) {
            this._alterSeriesDataElement(series.data[i]);
          }

          this._chart.dirty = true;
          this.inherited(arguments);
        },

        _removeFactorStrategyChartDisplay: function() {
          var plot = this._chart.getPlot(this._plotName);
          var series = plot.series[0];
          for (var i = 0; i < series.data.length; i++) {
            this._removeSeriesDataElementAlteration(series.data[i]);
          }

          this._chart.dirty = true;
          this.inherited(arguments);
        },

        _alterSeriesDataElement: function(seriesDataElement) {
          // Implemented in derived classes
        },

        _removeSeriesDataElementAlteration: function(seriesDataElement) {
          // Implemented in derived classes
        }
      }
    );
  }
);

