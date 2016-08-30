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

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojox/xml/parser'], function(declare, lang, parser) {
  var Utils = declare(
    null,
    {
      convertNodeListToArray: function(nodeList) {
        var nodeArray = [];
        for (var i = 0; i < nodeList.length; i++) {
          nodeArray.push(nodeList.item(i));
        }

        return nodeArray;
      },

      copyAttributes: function(sourceElement, targetElement) {
        var attr;
        for (var i = 0; i < sourceElement.attributes.length; i++) {
          attr = sourceElement.attributes.item(i);
          targetElement.setAttribute(attr.name, attr.value);
        }
      },

      copyElement: function(sourceElement, newName) {
        var doc = parser.parse();
        var newElement = doc.createElement(newName);

        this.copyAttributes(sourceElement, newElement);
        var sourceElementClone = lang.clone(sourceElement);
        var childNodeArray = this.convertNodeListToArray(sourceElementClone.childNodes);

        parser.replaceChildren(newElement, childNodeArray);

        return newElement;
      },

      createXmlNode: function(document, elementName, content) {
        if (typeof elementName !== 'string' || elementName.length === 0) {
          throw new Error('Must specify a name for the xmlNode.');
        }

        var xmlNode = document.createElement(elementName);

        if (arguments.length === 3) {
          parser.textContent(xmlNode, content);
        }

        return xmlNode;
      }
    });

  return new Utils();
});