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
  'dojo/_base/array',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/Deferred',
  'dojo/on',
  'dojo/promise/all',
  'dojox/xml/parser',
  'esri/config',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'esri/layers/FeatureLayer',
  'esri/request',
  '../pointSources/FeatureServicePointSource',
  '../pointSources/MapServicePointSource'
],
  function(array, declare, lang, Deferred, on, all, parser, config, ArcGISDynamicMapServiceLayer, FeatureLayer,
           esriRequest, FeatureServicePointSource, MapServicePointSource) {
    return declare(
      null,
      {
        pointSourceList: null,

        constructor: function(args) {
          this.pointSourceList = [];

          if (args) {
            declare.safeMixin(this, args);
          }
        },

        /*
        The commented out code below is the start of ad-hoc map and feature service support
        */

        /*

        addAllPointSources: function(serverUrl) {
          var addAllPointSourcesDeferred = new Deferred();

          if (!serverUrl || typeof serverUrl !== 'string') {
            addAllPointSourcesDeferred.reject('Invalid server url');
            return addAllPointSourcesDeferred;
          }

          // Add the server url to the cors list, if not present
          var foundIndex = array.indexOf(config.defaults.io.corsEnabledServers, serverUrl);
          if (foundIndex === -1) {
            config.defaults.io.corsEnabledServers.push(serverUrl);
          }

          this._getArcGISServerSiteMap(serverUrl, addAllPointSourcesDeferred);
          return addAllPointSourcesDeferred;
        },

        _getArcGISServerSiteMap: function(serverUrl, addAllPointSourcesDeferred) {
          var requestParams = {url: serverUrl, content: {f: 'sitemap'}, handleAs: 'xml'};
          var serverContentsRequest = esriRequest(requestParams);
          serverContentsRequest.then(
            lang.hitch(this, function receivedSiteMapFromServer(siteContents) {
              this._convertServicesToPointSources(
                siteContents,
                addAllPointSourcesDeferred);
            }),
            function handleErrorRequestingSiteMap(error) {
              addAllPointSourcesDeferred.reject(error);
            }
          );
        },

        _convertServicesToPointSources: function(siteContents, addAllPointSourcesDeferred) {
          var urlList = siteContents.getElementsByTagName('loc');
          var urlText;
          var addPointSourcePromises = [];

          for (var i = 0; i < urlList.length; i++) {
            urlText = parser.textContent(urlList[i]);

            if (urlText && urlText.search('MapServer') !== -1) {
              addPointSourcePromises.push(this.addMapServiceSource(urlText));
            }
            else if (urlText && urlText.search('FeatureServer') !== -1) {
              addPointSourcePromises.push(this.addFeatureServiceSource(urlText));
            }
          }

          addAllPointSourcesDeferred.resolve(addPointSourcePromises);
        },

        addMapServiceSource: function(url) {
          try {
            var mapServiceLayer = new ArcGISDynamicMapServiceLayer(url);
            return this.addMapServiceSourceFromLayer(mapServiceLayer);
          }
          catch(error) {
            var deferred = new Deferred();
            deferred.reject(error);
            return deferred;
          }
        },

        addFeatureServiceSource: function(url) {

        },

        */

        addFeatureServiceSourceFromLayer: function(featureLayer) {
          var deferred = new Deferred();

          this._validateSourceLayer(featureLayer).then(
            lang.hitch(this, this._handleFeatureServiceLayerLoaded, featureLayer, deferred),
            function errorValidatingFeatureServiceLayer(error) {
              deferred.reject('Error validating FeatureServiceLayer: ' + error.message);
            });

          return deferred;
        },

        addMapServiceSourceFromLayer: function(mapServiceLayer) {
          var deferred = new Deferred();

          this._validateSourceLayer(mapServiceLayer).then(
            lang.hitch(this, this._handleMapServiceLayerLoaded, mapServiceLayer, deferred),
            function errorValidatingMapServiceLayer(error) {
              deferred.reject('Error validating MapServiceLayer: ' + error.message);
            });

          return deferred;
        },

        _validateSourceLayer: function(layer) {
          var deferred = new Deferred();

          if(!(layer)) {
            deferred.reject(new Error('The source layer must be specified.'));
            return deferred;
          }

          try {
            if (!(layer.loaded)) {
              on.once(layer, 'load', lang.hitch(this, function layerLoaded(args) {
                deferred.resolve(layer);
              }));

              on.once(layer, 'error', function errorLoadingLayer(error) {
                deferred.reject('Error loading layer: ' + error.message);
              });
            }
            else {
              deferred.resolve(layer);
            }
          }
          catch (error) {
            deferred.reject(error);
          }

          return deferred;
        },

        _handleFeatureServiceLayerLoaded: function(featureLayer, deferred) {
          var pointSource = new FeatureServicePointSource(featureLayer);
          var index = this.pointSourceList.push(pointSource) - 1;
          deferred.resolve({pointSource: pointSource, index: index});
        },

        _handleMapServiceLayerLoaded: function(mapServiceLayer, deferred) {
          var subLayerDeferreds = [];
          var subLayerDeferred;

          var layerInfos = mapServiceLayer.layerInfos;
          if (mapServiceLayer.dynamicLayerInfos) {
            layerInfos = mapServiceLayer.dynamicLayerInfos;
          }

          for (var i = 0; i < layerInfos.length; i++) {
            subLayerDeferreds.push(
              this._getMapServiceSubLayerData(mapServiceLayer, layerInfos[i]).then(
                lang.hitch(this, this._createMapServicePointSource, mapServiceLayer, layerInfos[i])
              )
            );
          }

          all(subLayerDeferreds).then(
            function handleMapServiceSubLayerInspectionComplete(results) {
              var validResults = array.filter(results, function(result) {
                // If the result is undefined the filter returns falsy and it is excluded.
                return result;
              });

              deferred.resolve(validResults);
            },
            function mapServiceSubLayerInfoFailed(error) {
              deferred.reject(error);
            }
          );
        },

        _getMapServiceSubLayerData: function(mapServiceLayer, subLayerInfo) {
          var subLayerDetailsUrl = mapServiceLayer.url + '/' + subLayerInfo.id;

          var requestParams = {
            url: subLayerDetailsUrl,
            content: {f: 'json'},
            handleAs: 'json',
            callbackParamName: 'callback'
          };

          return esriRequest(requestParams);
        },

        _createMapServicePointSource: function(mapServiceLayer, layerInfo, mapServiceSubLayerDetails) {
          var mapServicePointSource;
          var index;
          var result;

          if (mapServiceSubLayerDetails.geometryType === 'esriGeometryPoint') {
            mapServicePointSource = new MapServicePointSource(mapServiceLayer, layerInfo);
            index = this.pointSourceList.push(mapServicePointSource) - 1;
            result = {pointSource: mapServicePointSource, index: index};
          }

          return result;
        }
      }
    );
  }
);

