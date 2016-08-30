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
  'dojox/xml/parser',
  'esri/config',
  'esri/IdentityManager',
  'esri/layers/ArcGISImageServiceLayer',
  'esri/request',
  '../rasterSources/AttributedRasterSource',
  '../rasterSources/RasterSource',
  '../rasterSources/UnitRasterSource',
  '../units/Utils'
],
  function(array, declare, lang, Deferred, on, parser, config, IdentityManager, ArcGISImageServiceLayer,
           esriRequest, AttributedRasterSource, RasterSource, UnitRasterSource, unitsUtils) {
    return declare(
      null,
      {
        rasterSourceList: null,

        constructor: function(args) {
          this.rasterSourceList = [];

          if (args) {
            declare.safeMixin(this, args);
          }
        },

        addAllRasterSources: function(serverUrl, getToken) {
          var addAllRasterSourcesDeferred = new Deferred();

          if (!serverUrl || typeof serverUrl !== 'string') {
            addAllRasterSourcesDeferred.reject('Invalid server url');
            return addAllRasterSourcesDeferred;
          }

          // Add the server url to the cors list, if not present
          var foundIndex = array.indexOf(config.defaults.io.corsEnabledServers, serverUrl);
          if (foundIndex === -1) {
            config.defaults.io.corsEnabledServers.push(serverUrl);
          }

          if (getToken === true || typeof getToken === 'undefined') {
            try {
              esri.id.getCredential(serverUrl).then(
                lang.hitch(this, function credentialSuccess(credential) {
                  this._getArcGISServerSiteMap(serverUrl, addAllRasterSourcesDeferred, true);
                }),
                lang.hitch(this, function credentialFailure(err) {
                  this._getArcGISServerSiteMap(serverUrl, addAllRasterSourcesDeferred, false);
                }));
            }
            catch(err) {
              addAllRasterSourcesDeferred.reject('Invalid server url');
              return addAllRasterSourcesDeferred;
            }
          }
          else {
            this._getArcGISServerSiteMap(serverUrl, addAllRasterSourcesDeferred, false);
          }

          return addAllRasterSourcesDeferred;
        },

        _determineIfTokenIsNeeded: function(serverUrl) {
          var deferred = new Deferred();

          // If a credential already exists return then you do not
          // need a token.
          var credential = esri.id.findCredential(serverUrl);
          if (credential) {
            deferred.resolve(false);
            return deferred;
          }

          this._getServerInfo(serverUrl, deferred);
          return deferred;
        },

        _getServerInfo: function(serverUrl, deferred) {
          var serverInfo = esri.id.findServerInfo(serverUrl);
          if (!serverInfo) {
            // If the server has not been queried yet then a token may
            // be needed... require token
            deferred.resolve(true);
            return;
          }

          if (serverInfo._restInfoDfd) {
            // Patch for JS API 3.14 where the Identity Manager will create
            // server info objects that are only partially populated.
            serverInfo._restInfoDfd.then(lang.hitch(this, function(restInfo) {
              this._inspectServerInfo(serverUrl, serverInfo, deferred);
            }));
          }
          else {
            this._inspectServerInfo(serverUrl, serverInfo, deferred);
          }
        },

        _inspectServerInfo: function(serverUrl, serverInfo, deferred) {
          if (serverInfo.webTierAuth) {
            // If the server uses web tier authorization then a token
            // is needed for the gp service to access the image service.
            deferred.resolve(true);
          }
          else if (serverInfo.owningSystemUrl) {
            // If the server info contains an owning system url then the server is
            // federated with a portal.  Check if the portal uses web tier authorization.
            this._inspectOwningServerInfo(serverInfo, deferred);
          }
          else {
            deferred.resolve(false);
          }
        },

        _inspectOwningServerInfo: function(serverInfo, deferred) {
          var owningSystemServerInfo = esri.id.findServerInfo(serverInfo.owningSystemUrl);
          if (!owningSystemServerInfo) {
            // Could not find the owning system server info
            deferred.resolve(false);
          }
          else if (owningSystemServerInfo._selfDfd) {
            // Still fetching the owning system server info
            owningSystemServerInfo._selfDfd.then(function(restInfo) {
              deferred.resolve(!!(owningSystemServerInfo.webTierAuth));
            });
          }
          else {
            deferred.resolve(!!(owningSystemServerInfo.webTierAuth));
          }
        },

        _getArcGISServerSiteMap: function(serverUrl, addAllRasterSourcesDeferred, getTokenForChildResources) {
          var requestParams = {url: serverUrl, content: {f: 'sitemap'}, handleAs: 'xml'};
          var serverContentsRequest = esriRequest(requestParams);
          serverContentsRequest.then(
            lang.hitch(this, function receivedSiteMapFromServer(siteContents) {
              this._convertImageServicesToRasterSources(
                siteContents,
                addAllRasterSourcesDeferred,
                getTokenForChildResources);
            }),
            function handleErrorRequestingSiteMap(error) {
              addAllRasterSourcesDeferred.reject(error);
            }
          );
        },

        _convertImageServicesToRasterSources: function(siteContents, addAllRasterSourcesDeferred,
                                                       getTokenForChildResources) {
          var urlList = siteContents.getElementsByTagName('loc');
          var urlText;
          var addRasterSourcePromises = [];

          for (var i = 0; i < urlList.length; i++) {
            urlText = parser.textContent(urlList[i]);

            if (urlText && urlText.search('ImageServer') !== -1) {
              addRasterSourcePromises.push(this.addRasterSource(urlText, getTokenForChildResources));
            }
          }

          addAllRasterSourcesDeferred.resolve(addRasterSourcePromises);
        },

        addRasterSource: function(url, getToken) {
          try {
            var imageServiceLayer = new ArcGISImageServiceLayer(url);
            return this.addRasterSourceFromLayer(imageServiceLayer, getToken);
          }
          catch(error) {
            var deferred = new Deferred();
            deferred.reject(error);
            return deferred;
          }
        },

        addRasterSourceFromLayer: function(imageServiceLayer, getToken) {
          var deferred = new Deferred();

          if(!(imageServiceLayer)) {
            deferred.reject(new Error('An imageServiceLayer must be specified.'));
            return deferred;
          }

          if(!(imageServiceLayer.url)) {
            deferred.reject(new Error('An imageServiceLayer with a valid URL parameter must be specified.'));
            return deferred;
          }

          try {
            if (imageServiceLayer.loaded !== true) {
              on.once(imageServiceLayer, 'load', lang.hitch(this, function imageServerLayerLoaded(args) {
                this._addRasterSourceFromLayer(args.layer, deferred, getToken);
              }));

              on.once(imageServiceLayer, 'error', function errorLoadingImageServiceLayer(error) {
                deferred.reject('Error loading ArcGISImageServiceLayer: ' + error.message);
              });
            }
            else {
              this._addRasterSourceFromLayer(imageServiceLayer, deferred, getToken);
            }
          }
          catch (error) {
            deferred.reject(error);
          }

          return deferred;
        },

        _addRasterSourceFromLayer: function(imageServiceLayer, rasterSourceAddedDeferred, getToken) {
          var getTokenType = typeof getToken;
          if (getTokenType === 'boolean') {
            this._handleImageServiceLayerLoaded(imageServiceLayer, rasterSourceAddedDeferred, getToken);
          }
          else if (getTokenType === 'undefined') {
            try {
              this._determineIfTokenIsNeeded(imageServiceLayer.url).then(lang.hitch(this, function(isTokenNeeded)
              {
                this._handleImageServiceLayerLoaded(imageServiceLayer, rasterSourceAddedDeferred, isTokenNeeded);
              }));
            }
            catch (error) {
              rasterSourceAddedDeferred.reject(error);
            }
          }
          else{
            rasterSourceAddedDeferred.reject(new Error('If specified, getToken must be a boolean type'));
          }
        },

        _handleImageServiceLayerLoaded: function(imageServiceLayer, rasterSourceAddedDeferred, getToken) {
          try {
            var credential = esri.id.findCredential(imageServiceLayer.url);

            if (getToken && !credential) {
              esri.id.getCredential(imageServiceLayer.url).then(
                lang.hitch(this, function onGetCredentialSuccess(credential) {
                  this._convertImageServiceLayerToRasterSource(imageServiceLayer, rasterSourceAddedDeferred);
                }),
                lang.hitch(this, function onGetCredentialError(error) {
                  this._convertImageServiceLayerToRasterSource(imageServiceLayer, rasterSourceAddedDeferred);
                }));
            }
            else {
              this._convertImageServiceLayerToRasterSource(imageServiceLayer, rasterSourceAddedDeferred);
            }
          }
          catch(error) {
            rasterSourceAddedDeferred.reject(error);
          }
        },

        _convertImageServiceLayerToRasterSource: function(imageServiceLayer, rasterSourceAddedDeferred) {
          var itemInfoUrl = imageServiceLayer.url + '/info/iteminfo';
          var requestParams = {
            url: itemInfoUrl,
            content: {f: 'json'},
            handleAs: 'json',
            callbackParamName: 'callback'
          };

          var imageServiceItemInfoRequest = esriRequest(requestParams);
          var getUnitMetadataRequest = imageServiceItemInfoRequest.then(this._getUnitMetadataFromItemInfo,
            function errorRequestingItemInfo(error) { rasterSourceAddedDeferred.reject(error); }
          );
          getUnitMetadataRequest.then(lang.hitch(this, function onMetadataReceived(unitStr) {
            this._validateUnitMetadata(unitStr, imageServiceLayer, rasterSourceAddedDeferred);
          }));
        },

        _getUnitMetadataFromItemInfo: function(itemInfo) {
          var unitStr = '';
          var index;

          for (var i = 0; i < itemInfo.tags.length; i++) {
            // Check for a tag that contains Unit or Units
            if (itemInfo.tags[i].indexOf('Unit:') >= 0 || itemInfo.tags[i].indexOf('Units:') >= 0) {
              index = itemInfo.tags[i].indexOf(':');
              unitStr = itemInfo.tags[i].substr(index + 1);
            }
          }

          return unitStr;
        },

        _validateUnitMetadata: function(unitStr, imageServiceLayer, rasterSourceAddedDeferred) {
          if (unitsUtils.isValidUnit(unitStr)) {
            var unitRasterSource = new UnitRasterSource(imageServiceLayer, unitStr);
            this.rasterSourceList.push(unitRasterSource);
            rasterSourceAddedDeferred.resolve(unitRasterSource);
          }
          else if (imageServiceLayer.hasRasterAttributeTable) {
            var requestForAttributeTable = imageServiceLayer.getRasterAttributeTable();
            requestForAttributeTable.then(
              lang.hitch(this, function onAttributeTableDataReceived(attributeTableData) {
                this._inspectAttributeTableData(imageServiceLayer, attributeTableData, rasterSourceAddedDeferred);
              }),
              function errorRequestingAttributeTableData(error) { rasterSourceAddedDeferred.reject(error); }
            );
          }
          else {
            var rasterSource = new RasterSource(imageServiceLayer);
            this.rasterSourceList.push(rasterSource);
            rasterSourceAddedDeferred.resolve(rasterSource);
          }
        },

        _inspectAttributeTableData: function(imageServiceLayer, attributeTableData, rasterSourceAddedDeferred) {
          var attributedFieldName;
          var newRasterSource;
          var fieldIndex = 0;

          while (fieldIndex < attributeTableData.fields.length && !(attributedFieldName)) {
            if (attributeTableData.fields[fieldIndex].type === 'esriFieldTypeString') {
              attributedFieldName = attributeTableData.fields[fieldIndex].name;
            }

            fieldIndex++;
          }

          // Check if the appropriate field was found in the attribute table that is necessary
          // to generate attribute values from.
          if (attributedFieldName) {
            newRasterSource = new AttributedRasterSource(imageServiceLayer, attributedFieldName, attributeTableData);
          }
          else {
            newRasterSource = new RasterSource(imageServiceLayer);
          }

          this.rasterSourceList.push(newRasterSource);
          rasterSourceAddedDeferred.resolve(newRasterSource);
        }
      }
    );
  }
);
