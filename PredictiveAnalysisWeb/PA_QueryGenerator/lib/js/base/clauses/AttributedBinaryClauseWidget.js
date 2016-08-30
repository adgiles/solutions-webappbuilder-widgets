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
  'dojo/dom-construct',
  'dojo/text!./template/AttributedBinaryClauseWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  './BaseBinaryClauseWidget',
  '../operator/Utils'
],
  function(declare, lang, Deferred, domConstruct, template, _TemplatedMixin, BaseBinaryClauseWidget, operatorUtils) {
    return declare(
      [BaseBinaryClauseWidget, _TemplatedMixin],
      {
        templateString: template,

        constructor: function(/* args */) {
          this._supportedOperators = operatorUtils.attributedOperators;
        },

        postCreate: function() {
          if (this.clause.rasterSource.attributedValues instanceof Deferred) {
            this.clause.rasterSource.attributedValues.then(lang.hitch(this, this._createAttributeValueOptionElements));
          }
          else {
            this._createAttributeValueOptionElements();
          }

          this.inherited(arguments);
        },

        _createAttributeValueOptionElements: function() {
          domConstruct.empty(this.rightOperandNode);

          // Create an empty option element to exist as the default option.
          var optionElem = domConstruct.create('option');
          this.rightOperandNode.appendChild(optionElem);

          var attributeValues = Object.getOwnPropertyNames(this.clause.rasterSource.attributedValues);
          for (var i = 0; i < attributeValues.length; i++) {
            optionElem = domConstruct.create('option');
            optionElem.value = attributeValues[i];
            optionElem.innerHTML = this.clause.rasterSource.attributedValues[attributeValues[i]];
            this.rightOperandNode.appendChild(optionElem);
          }
        },

        replaceDataSource: function(rasterSource) {
          this.inherited(arguments);
          this.clause.constraint = '';
          this._createAttributeValueOptionElements();
        }
      }
    );
  }
);