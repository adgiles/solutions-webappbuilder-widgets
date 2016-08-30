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
        _seriesFill: null,
        _seriesName: 'ContinuousFactorStrategySeries',
        _seriesStroke: null,

        constructor: function(/* args */) {
          this._seriesFill = [0, 200, 50, 0.50];
          this._seriesStroke = {width: 2, color: 'black'};
        },

        _initializeFactorStrategyChartDisplay: function() {
          this.inherited(arguments);

          this._chart.addSeries(this._seriesName, [], {
            fill: this._seriesFill,
            stroke: this._seriesStroke,
            plot: this._plotName
          });

          this._chart.moveSeriesToFront(this._seriesName);
        },

        _getFactorStrategySeriesData: function() {
          // Implemented in derived classes
        },

        _updateFactorStrategyChartDisplay: function() {
          var seriesData = this._getFactorStrategySeriesData();
          this._chart.updateSeries(this._seriesName, seriesData);

          this.inherited(arguments);
        },

        _removeFactorStrategyChartDisplay: function() {
          this._chart.removeSeries(this._seriesName);

          this.inherited(arguments);
        }
      }
    );
  }
);
