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
  './BaseContinuousFactorStrategyWidget'
],
  function(declare, BaseContinuousFactorStrategyWidget) {
    return declare(
      [BaseContinuousFactorStrategyWidget],
      {
        _getFactorStrategySeriesData: function() {
          var seriesStats = this._chart.getPlot(this._plotName).getSeriesStats();

          return [
            {x: this._factorStrategy.minValue, y: 0},
            {x: this._factorStrategy.minValue, y: seriesStats.vmax},
            {x: this._factorStrategy.maxValue, y: seriesStats.vmax},
            {x: this._factorStrategy.maxValue, y: 0}
          ];
        }
      }
    );
  }
);


