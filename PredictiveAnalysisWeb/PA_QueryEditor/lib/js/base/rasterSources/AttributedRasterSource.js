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
  'dojo/Deferred',
  'dojo/on',
  'dojox/xml/parser',
  'esri/layers/ArcGISImageServiceLayer',
  '../rasterSources/BaseRasterSource',
  '../xml/Utils'
],
  function(declare, lang, Deferred, on, parser, ArcGISImageServiceLayer, BaseRasterSource, xmlUtils) {
    return declare(
      [BaseRasterSource],
      {
        __type: 'ImageServiceAttributedRasterSource',
        attributedValues: null,
        attributedValuesFieldName: '',
        rasterSourceType: 'AttributedRasterSource',

        constructor: function(imageServiceLayer, fieldName, attributeTableData) {
          this.rasterSourceType = 'AttributedRasterSource';
          this.attributedValuesFieldName = '';

          if(fieldName && typeof fieldName === 'string') {
            this.attributedValuesFieldName = fieldName;
          }

          this._initAttributedValues(imageServiceLayer, attributeTableData);
        },

        toServerJson: function() {
          var jsonObj = this.inherited(arguments);
          jsonObj.AttributeFieldName = this.attributedValuesFieldName;
          return jsonObj;
        },

        fromServerJson: function(jsonObj) {
          if (!jsonObj) {
            return;
          }

          this.inherited(arguments);
          this.attributedValuesFieldName = jsonObj.AttributeFieldName;

          var layer = new ArcGISImageServiceLayer(this.sourceUrl);
          this._initAttributedValues(layer);
        },

        convertToXml: function() {
          var baseClassElement = this.inherited(arguments);
          var rootNode = xmlUtils.copyElement(baseClassElement, 'AttributedRasterSource');
          rootNode.setAttribute('i:type', this.__type);

          var doc = parser.parse();
          var fieldNameNode = xmlUtils.createXmlNode(doc, 'AttributeFieldName', this.attributedValuesFieldName);

          var servicePropertiesNode = rootNode.getElementsByTagName('ServiceProperties')[0];
          rootNode.insertBefore(fieldNameNode, servicePropertiesNode);
          return rootNode;
        },

        _initAttributedValues: function(imageServiceLayer, attributeTableData) {
          if(attributeTableData) {
            this.attributedValues = new Deferred();
            this._onGetRasterAttributeTableComplete(attributeTableData);
          }
          else if (imageServiceLayer) {
            this.attributedValues = new Deferred();
            if (imageServiceLayer.loaded) {
              imageServiceLayer.getRasterAttributeTable().then(
                lang.hitch(this, this._onGetRasterAttributeTableComplete));
            }
            else {
              on.once(imageServiceLayer, 'load', lang.hitch(this, function(evt) {
                evt.layer.getRasterAttributeTable().then(lang.hitch(this, this._onGetRasterAttributeTableComplete));
              }));
            }
          }
          else {
            this.attributedValues = {};
          }
        },

        _onGetRasterAttributeTableComplete: function(attributeTableData) {
          var valueFieldName = this._getValueFieldName(attributeTableData);
          this._initAttributedValueFieldName(attributeTableData);
          this._populateAttributedValues(attributeTableData, valueFieldName);
        },

        _getValueFieldName: function(attributeTableData) {
          var currentField;
          var valueFieldName;
          var fieldIndex = 0;

          while (fieldIndex < attributeTableData.fields.length && !(valueFieldName)) {
            currentField = attributeTableData.fields[fieldIndex];

            // Find the (value, Value, or VALUE) field to use as the pixel source
            if (currentField.type === 'esriFieldTypeInteger' && currentField.name.toLowerCase() === 'value') {
              valueFieldName = currentField.name;
            }

            fieldIndex++;
          }

          return valueFieldName;
        },

        _initAttributedValueFieldName: function(attributeTableData) {
          var fieldIndex = 0;

          while (fieldIndex < attributeTableData.fields.length && !(this.attributedValuesFieldName)) {
            if (attributeTableData.fields[fieldIndex].type === 'esriFieldTypeString') {
              this.attributedValuesFieldName = attributeTableData.fields[fieldIndex].name;
            }

            fieldIndex++;
          }
        },

        _populateAttributedValues: function(attributeTableData, valueFieldName) {
          var dfd = this.attributedValues;

          if (!valueFieldName || !(this.attributedValuesFieldName)) {
            var error = new Error('Insufficient attribute table data to create attributed values for: ' +
              this.sourceUrl);
            this.attributedValues = {};
            dfd.reject(error);
            return;
          }

          var currentRow;
          var attributedValues = {};
          for (var i = 0; i < attributeTableData.features.length; i++) {
            currentRow = attributeTableData.features[i];
            attributedValues[Number(currentRow.attributes[valueFieldName])] =
              currentRow.attributes[this.attributedValuesFieldName];
          }

          this.attributedValues = attributedValues;
          dfd.resolve();
        }
      }
    );
  }
);