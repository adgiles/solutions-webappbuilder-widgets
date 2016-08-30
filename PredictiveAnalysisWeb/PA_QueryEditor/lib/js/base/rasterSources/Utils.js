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
  './AttributedRasterSource',
  './RasterSource',
  './UnitRasterSource'
],
  function(declare, AttributedRasterSource, RasterSource, UnitRasterSource) {
    var Utils = declare(
      null,
      {
        createRasterSourceFromJson: function(json) {
          if (!json) {
            console.error('Error: undefined json object cannot convert to raster source.');
            return null;
          }

          if (!(json.rasterSourceType)) {
            console.error('Error. The clause raster source is not specified.', json);
            return null;
          }

          var rasterSource;
          switch (json.rasterSourceType) {
            case 'AttributedRasterSource':
              rasterSource = new AttributedRasterSource();
              break;
            case 'MakoUnitRasterSource':
              rasterSource = new UnitRasterSource();
              break;
            case 'RasterSource':
              rasterSource = new RasterSource();
              break;
            default:
              console.error('Error. The raster source type: ' + json.rasterSourceType + ' is not recognized.');
              return null;
          }

          rasterSource.fromJson(json);
          return rasterSource;
        },

        createRasterSourceFromServerJson: function(serverJson) {
          if (!serverJson || !(serverJson.__type)) {
            return null;
          }

          var rasterSource;
          switch(serverJson.__type)
          {
            case RasterSource.prototype.__type:
              rasterSource = new RasterSource();
              break;
            case AttributedRasterSource.prototype.__type:
              rasterSource = new AttributedRasterSource();
              break;
            case UnitRasterSource.prototype.__type:
              rasterSource = new UnitRasterSource();
              break;
            default:
              return null;
          }

          rasterSource.fromServerJson(serverJson);
          return rasterSource;
        }
      }
    );

    return new Utils();
  }
);