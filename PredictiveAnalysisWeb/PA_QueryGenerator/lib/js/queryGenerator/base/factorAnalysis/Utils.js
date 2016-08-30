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
  './ContinuousFactorAnalysis',
  './DiscreteFactorAnalysis',
  '../../../base/rasterSources/AttributedRasterSource',
  '../../../base/rasterSources/RasterSource',
  '../../../base/rasterSources/UnitRasterSource'
],
  function(declare, ContinuousFactorAnalysis, DiscreteFactorAnalysis, AttributedRasterSource,
           RasterSource, UnitRasterSource) {
    var Utils = declare(
      null,
      {
        createFactorAnalysis: function(rasterSource) {
          if (!rasterSource || !(rasterSource.__type)) {
            return null;
          }

          switch(rasterSource.__type)
          {
            case RasterSource.prototype.__type:
              return new ContinuousFactorAnalysis({inputFactor: rasterSource});
            case AttributedRasterSource.prototype.__type:
              return new DiscreteFactorAnalysis({inputFactor: rasterSource});
            case UnitRasterSource.prototype.__type:
              return new ContinuousFactorAnalysis({inputFactor: rasterSource});
            default:
              return null;
          }
        },

        createFactorAnalysisFromServerJson: function(serverJson) {
          if (!serverJson || !(serverJson.__type)) {
            return null;
          }

          var factorAnalysis;
          switch(serverJson.__type)
          {
            case ContinuousFactorAnalysis.prototype.__type:
              factorAnalysis = new ContinuousFactorAnalysis();
              break;
            case DiscreteFactorAnalysis.prototype.__type:
              factorAnalysis = new DiscreteFactorAnalysis();
              break;
            default:
              return null;
          }

          factorAnalysis.fromServerJson(serverJson);
          return factorAnalysis;
        }
      }
    );

    return new Utils();
  }
);
