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
  '../xml/Utils'
],
  function(declare, parser, xmlUtils) {
    return declare(
      null,
      {
        _unitTypeEnum: {
          DistanceUnit: 0,
          TimeUnit: 1,
          VelocityUnit: 2,
          CoordinateUnit: 3,
          SlopeUnit: 4,
          UnknownUnit: 5
        },
        abbreviation: '',
        pluralUnitName: '',
        type: '',
        unitName: '',

        constructor: function(args) {
          this.unitName = '';
          this.pluralUnitName = '';
          this.abbreviation = '';
          this.type = '';

          if (args) {
            declare.safeMixin(this, args);
          }
        },

        toServerJson: function() {
          return {
            __type: this.type,
            Abbreviation: this.abbreviation,
            Name: this.unitName,
            PluralName: this.pluralUnitName,
            type: this._unitTypeEnum[this.type]
          };
        },

        convertToXml: function() {
          var doc = parser.parse();
          var rootNode = doc.createElement('UnitInfo');
          rootNode.setAttribute('xmlns:i', 'http://www.w3.org/2001/XMLSchema-instance');
          rootNode.setAttribute('i:type', this.type);

          var abbreviationNode = xmlUtils.createXmlNode(doc, 'Abbreviation', this.abbreviation);
          var nameNode = xmlUtils.createXmlNode(doc, 'Name', this.unitName);
          var pluralNameNode = xmlUtils.createXmlNode(doc, 'PluralName', this.pluralUnitName);
          var typeNode = xmlUtils.createXmlNode(doc, 'Type', this.type);

          parser.replaceChildren(rootNode, [abbreviationNode, nameNode, pluralNameNode, typeNode]);

          return rootNode;
        },

        convertToXmlStr: function() {
          var xml = this.convertToXml();
          return parser.innerXML(xml);
        }
      }
    );
  }
);