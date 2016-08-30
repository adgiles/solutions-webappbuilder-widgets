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
  'dojox/xml/parser',
  'esri/IdentityManager',
  'esri/layers/ArcGISImageServiceLayer',
  '../xml/Utils'
],
  function(declare, parser, IdentityManager, ArcGISImageServiceLayer, xmlUtils) {
    return declare(
      null,
      {
        __type: '',
        alias: '',
        name: '',
        sourceUrl: '',
        type: 'ImageService',
        rasterSourceType: '',
        renderingRuleName: '',

        constructor: function(imageServiceLayer) {
          this.alias = '';
          this.name = '';
          this.sourceUrl = '';
          this.renderingRuleName = '';
          this.type = 'ImageService';
          this.rasterSourceType = 'BaseRasterSource';

          if (imageServiceLayer) {
            if (imageServiceLayer instanceof ArcGISImageServiceLayer ||
              imageServiceLayer.declaredClass === 'esri.layers.ArcGISImageServiceLayer') {

              if (imageServiceLayer.arcgisProps && imageServiceLayer.arcgisProps.title) {
                this.alias = imageServiceLayer.arcgisProps.title;
              }
              else {
                this.alias = imageServiceLayer.name;
              }

              this.name = imageServiceLayer.name;
              this.sourceUrl = imageServiceLayer.url;

              if (imageServiceLayer.renderingRule) {
                this.renderingRuleName = imageServiceLayer.renderingRule.functionName;
              }
            }
          }
        },

        fromJson: function(serializedJson) {
          declare.safeMixin(this, serializedJson);
        },

        fromServerJson: function(jsonObj) {
          if (!jsonObj) {
            return;
          }

          this.alias = jsonObj.Alias;
          this.name = jsonObj.Name;
          this.sourceUrl = jsonObj.ConnectionPath;

          if (jsonObj.ServiceProperties) {
            this.renderingRuleName = jsonObj.ServiceProperties.RenderRuleName;
          }
        },

        toServerJson: function() {
          var resultObj = {
            __type: this.__type,
            Alias: this.alias,
            ConnectionPath: this.sourceUrl,
            Name: this.name,
            Type: 2,
            ServiceProperties: {
              __type: 'ImageServiceProperties',
              Referer: '',
              RenderRuleName: this.renderingRuleName,
              Token: ''
            }
          };

          var credential = esri.id.findCredential(this.sourceUrl);
          if (credential) {
            resultObj.ServiceProperties.Token = credential.token;
            resultObj.ServiceProperties.Referer = window.location.href;
          }

          return resultObj;
        },

        convertToXml: function() {
          var doc = parser.parse();
          var rootNode = doc.createElement('BaseRasterSource');
          rootNode.setAttribute('xmlns:i', 'http://www.w3.org/2001/XMLSchema-instance');

          var aliasNode = xmlUtils.createXmlNode(doc, 'Alias', this.alias);
          var connectionPathNode = xmlUtils.createXmlNode(doc, 'ConnectionPath', this.sourceUrl);
          var nameNode = xmlUtils.createXmlNode(doc, 'Name', this.name);
          var typeNode = xmlUtils.createXmlNode(doc, 'Type', this.type);

          var servicePropertiesNode = this._createServicePropertiesXml(doc);

          var childNodes = [aliasNode, connectionPathNode, nameNode, typeNode, servicePropertiesNode];
          parser.replaceChildren(rootNode, childNodes);

          return rootNode;
        },

        _createServicePropertiesXml: function(doc) {
          var token = '';
          var referer = '';

          var credential = esri.id.findCredential(this.sourceUrl);
          if (credential) {
            token = credential.token;
            referer = window.location.href;
          }

          var refererNode = xmlUtils.createXmlNode(doc, 'Referer', referer);
          var renderRuleNameNode = xmlUtils.createXmlNode(doc, 'RenderRuleName', this.renderingRuleName);
          var tokenNode = xmlUtils.createXmlNode(doc, 'Token', token);

          var servicePropertiesNode = doc.createElement('ServiceProperties');
          servicePropertiesNode.setAttribute('i:type', 'ImageServiceProperties');
          parser.replaceChildren(servicePropertiesNode, [refererNode, renderRuleNameNode, tokenNode]);

          return servicePropertiesNode;
        },


        convertToXmlStr: function() {
          var xml = this.convertToXml();
          return parser.innerXML(xml);
        }
      }
    );
  }
);