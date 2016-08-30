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
        __type: 'ContinuousFactorAnalysis',
        _factorDisplayExtentEnumConversion: {
          0:'value',
          1:'studyArea',
          2:'dataset'
        },
        factorDisplayExtent: 'studyArea',

        getSeriesData: function() {
          switch(this.factorDisplayExtent) {
            case 'value':
              return this._generateSeriesDataFromStatsHistogram(this.inputFactor.valueStats);
            case 'studyArea':
              return this._generateSeriesDataFromStatsHistogram(this.inputFactor.studyAreaStats);
            case 'dataset':
              return this._generateSeriesDataFromStatsHistogram(this.inputFactor.datasetStats);
            default:
              return [];
          }
        },

        _generateSeriesDataFromStatsHistogram: function(statsHistogram) {
          if (statsHistogram.histogram.bins.length === 0) {
            return [];
          }
          else if (statsHistogram.histogram.bins.length === 1) {
            return this._generateSeriesFromSingleBinHistogram(statsHistogram);
          }
          else {
            return this._generateSeriesFromMultiBinHistogram(statsHistogram);
          }
        },

        _generateSeriesFromSingleBinHistogram: function(statsHistogram) {
          return [
            {x: statsHistogram.statistics.minimum - 1, y: 0},
            {x: statsHistogram.statistics.minimum, y: 0},
            {x: statsHistogram.statistics.minimum, y: statsHistogram.histogram.bins[0].count},
            {x: statsHistogram.statistics.maximum, y: statsHistogram.histogram.bins[0].count},
            {x: statsHistogram.statistics.maximum, y: 0},
            {x: statsHistogram.statistics.maximum + 1, y: 0}
          ];
        },

        _generateSeriesFromMultiBinHistogram: function(statsHistogram) {
          var seriesData = [];

          var minimum = this.inputFactor.valueStats.statistics.minimum;
          var maximum = this.inputFactor.valueStats.statistics.maximum;

          seriesData.push({x: statsHistogram.statistics.minimum, y: 0});

          var currentBin;
          for (var i = 0; i < statsHistogram.histogram.bins.length; i++) {
            currentBin = statsHistogram.histogram.bins[i];
            this._processBin(seriesData, currentBin, minimum, maximum);
          }

          seriesData.push({x: statsHistogram.statistics.maximum, y: 0});

          return seriesData;
        },

        _processBin: function(seriesData, bin, minimum, maximum) {
          // Bin intersects with the minimum data value
          if (bin.binMin <= minimum && bin.binMax >= minimum) {
            seriesData.push({x: minimum, y: 0});
            seriesData.push({x: minimum, y: bin.count});
          }

          // Bin intersects with the maximum data value
          if (bin.binMin <= maximum && bin.binMax >= maximum) {
            seriesData.push({x: maximum, y: bin.count});
            seriesData.push({x: maximum, y: 0});
          }

          // Bin is contained within the minimum and maximum data values
          if ((bin.binMin > minimum && bin.binMax < maximum)) {
            var binMid = (bin.binMin + bin.binMax) / 2.0;
            seriesData.push({x: binMid, y: bin.count});
          }
        },

        fromServerJson: function(serverJson) {
          this.inherited(arguments);
          this.factorDisplayExtent = this._factorDisplayExtentEnumConversion[this.factorDisplayExtent];
        }
      }
    );
  }
);


