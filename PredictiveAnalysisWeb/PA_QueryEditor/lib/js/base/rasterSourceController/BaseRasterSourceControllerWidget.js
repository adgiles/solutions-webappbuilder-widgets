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
  'dojo/_base/lang',
  'dojo/Evented',
  'dojo/on',
  'dojo/promise/all',
  'dijit/_WidgetBase',
  'esri/layers/ArcGISImageServiceLayer',
  './RasterSourceController'
],
  function(declare, lang, Evented, on, all, _WidgetBase, ArcGISImageServiceLayer, RasterSourceController) {
    return declare(
      [_WidgetBase, Evented],
      {
        loaded: false,
        rasterSourceController: null,

        constructor: function(params) {
          this.rasterSourceController = new RasterSourceController({});

          if (!params || !(params.map) || params.map.declaredClass !== 'esri.Map') {
            this.loaded = true;
            return;
          }

          if (params.map.loaded) {
            this._addMapLayersToRasterSourceController(params.map);
          }
          else {
            on.once(params.map, 'load', lang.hitch(this, function(evt) {
              this._addMapLayersToRasterSourceController(evt.map);
            }));
          }
        },

        addImageService: function() {
          var arcgisServerUrl = prompt(
            'Enter ArcGIS Server Url',
            '<ArcGIS Server Url>'
          );

          if (null === arcgisServerUrl) {
            return;
          }

          var suffix = 'imageserver';
          var isSingleImageServiceUrl = arcgisServerUrl.toLowerCase().indexOf(
            suffix, arcgisServerUrl.length - suffix.length) !== -1;
          if (isSingleImageServiceUrl) {
            var rasterSourceAddedPromise = this.rasterSourceController.addRasterSource(arcgisServerUrl);
            this._handleRasterSourceAddedPromise(rasterSourceAddedPromise);
          }
          else { // Is a folder of image services
            this.rasterSourceController.addAllRasterSources(arcgisServerUrl).then(
              lang.hitch(this, function (rasterSourcesDeferreds) {
                for (var i = 0; i < rasterSourcesDeferreds.length; i++) {
                  this._handleRasterSourceAddedPromise(rasterSourcesDeferreds[i]);
                }
              }), function(error) {
                console.error('Error retrieving service list from server: ' + error.message);
              }
            );
          }
        },

        _handleRasterSourceAddedPromise: function(rasterSourceAddedPromise) {
          rasterSourceAddedPromise.then(
            lang.hitch(this, this._handleRasterSourceAdded),
            function(error) {
              console.error('Error converting image service to raster source: ' + error.message);
            }
          );
        },

        _addMapLayersToRasterSourceController: function(map) {
          var layerIds = map.layerIds;
          var layer;

          var rasterSourcePromises = [];
          for (var i = 0; i < layerIds.length; i++) {
            layer = map.getLayer(layerIds[i]);
            if (layer.isInstanceOf(ArcGISImageServiceLayer) ||
              layer.declaredClass === 'esri.layers.ArcGISImageServiceLayer') {

              var rasterSourceAddedPromise = this.rasterSourceController.addRasterSourceFromLayer(layer).then(
                lang.hitch(this, this._handleRasterSourceAdded),
                function(error) {
                  console.error('Error converting image service to raster source: ' + error.message);
                }
              );

              rasterSourcePromises.push(rasterSourceAddedPromise);
            }
          }

          all(rasterSourcePromises).then(lang.hitch(this, this._onLoadComplete));
        },

        _handleRasterSourceAdded: function(rasterSource) {
          // Implemented in derived classes
        },

        _onLoadComplete: function() {
          this.loaded = true;
          this.emit('loaded');
        }
      }
    );
  }
);

