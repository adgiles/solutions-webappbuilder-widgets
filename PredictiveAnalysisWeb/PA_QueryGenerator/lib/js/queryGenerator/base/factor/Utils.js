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
  './ContinuousFactor',
  './DiscreteFactor',
  '../../../base/rasterSources/AttributedRasterSource',
  '../../../base/rasterSources/RasterSource',
  '../../../base/rasterSources/UnitRasterSource'
],
  function(declare, ContinuousFactor, DiscreteFactor, AttributedRasterSource, RasterSource, UnitRasterSource) {
  var Utils = declare(
    null,
    {
      createFactor: function(rasterSource) {
        if (!rasterSource || rasterSource.__type) {
          return null;
        }

        switch(rasterSource.__type) {
          case AttributedRasterSource.prototype.__type:
            return new DiscreteFactor({factorSource: rasterSource});
          case RasterSource.prototype.__type:
            return new ContinuousFactor({factorSource: rasterSource});
          case UnitRasterSource.prototype.__type:
            return new ContinuousFactor({factorSource: rasterSource});
          default:
            return null;
        }
      },

      createFactorFromServerJson: function(jsonObj) {
        if (!jsonObj || !(jsonObj.__type)) {
          return null;
        }

        var factor;
        if (jsonObj.__type === ContinuousFactor.prototype.__type) {
          factor = new ContinuousFactor();
          factor.fromServerJson(jsonObj);
          return factor;
        }
        else if (jsonObj.__type === DiscreteFactor.prototype.__type) {
          factor = new DiscreteFactor();
          factor.fromServerJson(jsonObj);
          return factor;
        }
        else {
          return null;
        }
      }
    });

  return new Utils();
});
