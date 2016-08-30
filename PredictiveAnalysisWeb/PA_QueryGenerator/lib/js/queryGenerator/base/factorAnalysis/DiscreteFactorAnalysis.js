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
  './BaseFactorAnalysis'
],
  function(declare, BaseFactorAnalysis) {
    return declare(
      [BaseFactorAnalysis],
      {
        __type: 'DiscreteFactorAnalysis',

        getSeriesData: function() {
          var seriesData = [];

          var factorValue;
          var percentage;
          var tooltip;
          for (var i = 0; i < this.inputFactor.discreteFactorValuesByCount.length; i++) {
            factorValue = this.inputFactor.discreteFactorValuesByCount[i];
            percentage = Number((factorValue.count / this.inputFactor.count) * 100);
            tooltip = '<B><INS>' + factorValue.factorValue.discreteValue + '</INS></B><BR>' +
              'Pixel Value: ' + factorValue.factorValue.numericValue + '<BR>' +
              'Count: ' + factorValue.count + '<BR>' +
              'Percentage: ' + percentage.toFixed(2) + '%';
            seriesData.push({x: factorValue.factorValue.numericValue, y: factorValue.count, tooltip: tooltip});
          }

          seriesData.sort(function(a, b) { return a.x - b.x; });
          return seriesData;
        }
      }
    );
  }
);
