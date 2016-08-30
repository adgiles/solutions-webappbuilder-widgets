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
  './ClauseConstants',
  '../xml/Utils'
],
  function(declare, parser, ClauseConstants, xmlUtils) {
  return declare(null,
    {
      clauseType: '',
      evaluateState: null,
      id: 1,
      useWeighting: false,
      weighting: 1,

      constructor: function(args) {
        this.clauseType = 'BaseClause';
        this.evaluateState = ClauseConstants.evaluateStateTypes.None;
        this.id = 1;
        this.useWeighting = false;
        this.weighting = 1;

        if (args) {
          declare.safeMixin(this, args);
        }
      },

      fromJson: function(jsonObj) {
        if (jsonObj) {
          declare.safeMixin(this, jsonObj);
        }
      },

      convertToXml: function() {
        var doc = parser.parse();
        var rootNode = doc.createElement('BaseClause');
        rootNode.setAttribute('xmlns:i', 'http://www.w3.org/2001/XMLSchema-instance');

        var idNode = xmlUtils.createXmlNode(doc, 'Id', this.id.toString());
        var useWeightingNode = xmlUtils.createXmlNode(doc, 'UseWeighting', this.useWeighting.toString());
        var weightingNode = xmlUtils.createXmlNode(doc, 'Weighting', this.weighting.toString());

        var childNodes = [idNode, useWeightingNode, weightingNode];

        parser.replaceChildren(rootNode, childNodes);

        return rootNode;
      },

      convertToXmlStr: function() {
        var xml = this.convertToXml();
        return parser.innerXML(xml);
      }
    }
  );
});