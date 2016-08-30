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
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dojo/text!./template/UnitBinaryClauseWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  './BaseBinaryClauseWidget',
  '../operator/Utils',
  '../units/Utils'
],
  function(array, declare, domAttr, domConstruct, template, _TemplatedMixin, BaseBinaryClauseWidget,
           operatorUtils, unitsUtils) {
    return declare(
      [BaseBinaryClauseWidget, _TemplatedMixin],
      {
        templateString: template,
        supportedUnits: null,
        rightOperandUnitNode: null,

        constructor: function() {
          this._supportedOperators = operatorUtils.binaryClauseOperators;
          this.supportedUnits = unitsUtils.getSupportedUnitsFromUnitInfo(this.clause.rasterSource.displayUnit);
        },

        postCreate: function() {
          this.inherited(arguments);

          this._createUnitOptionElements();
          this._initConstraintUnitContent();
        },

        _createUnitOptionElements: function() {
          var optionElem;

          for (var i = 0; i < this.supportedUnits.length; i++) {
            optionElem = domConstruct.create('option');
            optionElem.value = i;
            optionElem.innerHTML = this.supportedUnits[i].abbreviation;
            this.rightOperandUnitNode.appendChild(optionElem);
          }
        },

        _initConstraintUnitContent: function() {
          var filteredResults = array.filter(this.supportedUnits, function(unitInfo) {
            return unitInfo.abbreviation === this.clause.rasterSource.displayUnit.abbreviation;
          }, this);

          if (filteredResults.length > 0) {
            this.rightOperandUnitNode.selectedIndex = array.indexOf(this.supportedUnits, filteredResults[0]);
            this.rightOperandUnitNode.title = filteredResults[0].pluralUnitName;
          }
          else {
            console.error('UnitBinaryClauseWidget: clause unit is not in the supported list of units.');
          }
        },

        _handleRightOperandUnitChanged: function(evt) {
          this.clause.rasterSource.displayUnit = this.supportedUnits[evt.target.value];
          this.rightOperandUnitNode.title = this.supportedUnits[evt.target.value].pluralUnitName;
        },

        setEnabled: function(isEnabled) {
          this.inherited(arguments);

          if (isEnabled) {
            domAttr.remove(this.rightOperandUnitNode, 'disabled');
          }
          else {
            domAttr.set(this.rightOperandUnitNode, 'disabled', 'true');
          }
        }
      }
    );
  }
);
