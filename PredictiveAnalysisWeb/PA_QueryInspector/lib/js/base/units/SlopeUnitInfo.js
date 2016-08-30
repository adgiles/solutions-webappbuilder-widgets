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
  './BaseUnitInfo',
  '../xml/Utils'
],
  function(declare, parser, BaseUnitInfo, xmlUtils) {
    return declare(
      [BaseUnitInfo],
      {
        _slopeUnitTypeEnum: {
          Degrees: 0,
          Percent: 1
        },
        type: 'SlopeUnit',
        slopeUnitType: '',
        declaredClass: 'predictiveAnalysis.SlopeUnitInfo',

        constructor: function() {
          this.type = 'SlopeUnit';

          if (!(this.slopeUnitType)) {
            this.slopeUnitType = '';
          }
        },

        toServerJson: function() {
          var jsonObj = this.inherited(arguments);
          jsonObj.SlopeUnitType = this._slopeUnitTypeEnum[this.slopeUnitType];
          return jsonObj;
        },

        convertToXml: function() {
          var doc = parser.parse();
          var baseClassElement = this.inherited(arguments);
          var rootNode = xmlUtils.copyElement(baseClassElement, 'SlopeUnitInfo');

          var unitTypeNode = xmlUtils.createXmlNode(doc, 'SlopeUnitType', this.slopeUnitType);
          rootNode.appendChild(unitTypeNode);

          return rootNode;
        }
      }
    );
  }
);