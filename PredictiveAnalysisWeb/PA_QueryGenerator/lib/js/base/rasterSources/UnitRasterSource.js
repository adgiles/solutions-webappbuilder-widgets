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
  './BaseRasterSource',
  '../units/BaseUnitInfo',
  '../units/Utils',
  '../xml/Utils'
],
  function(declare, BaseRasterSource, BaseUnitInfo, unitsUtils, xmlUtils) {
    return declare(BaseRasterSource,
      {
        __type: 'ImageServiceMakoUnitRasterSource',
        displayUnit: null,
        sourceUnit: null,

        constructor: function(imageServiceLayer, unitStr) {
          this.rasterSourceType = 'MakoUnitRasterSource';

          if (unitStr && typeof unitStr === 'string') {
            this.displayUnit = unitsUtils.getUnitInfoFromStr(unitStr);
            this.sourceUnit = unitsUtils.getUnitInfoFromStr(unitStr);
          } else {
            this.displayUnit = new BaseUnitInfo();
            this.sourceUnit = new BaseUnitInfo();
          }
        },

        fromServerJson: function(jsonObj) {
          this.inherited(arguments);

          if(jsonObj.DisplayUnit) {
            var convertedDisplayUnit = unitsUtils.getUnitInfoFromStr(jsonObj.DisplayUnit.Name);
            if (convertedDisplayUnit) {
              this.displayUnit = convertedDisplayUnit;
            }
          }

          if(jsonObj.SourceUnit) {
            var convertedSourceUnit = unitsUtils.getUnitInfoFromStr(jsonObj.SourceUnit.Name);
            if (convertedSourceUnit) {
              this.sourceUnit = convertedSourceUnit;
            }
          }
        },

        fromJson: function(serializedJson) {
          this.inherited(arguments);
          if(serializedJson.displayUnit) {
            var convertedDisplayUnit = unitsUtils.getUnitInfoFromStr(serializedJson.displayUnit.unitName);
            if (convertedDisplayUnit) {
              this.displayUnit = convertedDisplayUnit;
            }
          }

          if(serializedJson.sourceUnit) {
            var convertedSourceUnit = unitsUtils.getUnitInfoFromStr(serializedJson.sourceUnit.unitName);
            if (convertedSourceUnit) {
              this.sourceUnit = convertedSourceUnit;
            }
          }
        },

        toServerJson: function() {
          var jsonObj = this.inherited(arguments);
          jsonObj.DisplayUnit = this.displayUnit.toServerJson();
          jsonObj.SourceUnit = this.sourceUnit.toServerJson();
          return jsonObj;
        },

        convertToXml: function() {
          var baseClassElement = this.inherited(arguments);
          var rootNode = xmlUtils.copyElement(baseClassElement, 'MakoUnitRasterSource');
          rootNode.setAttribute('i:type', this.__type);

          var displayUnitNode = this.displayUnit.convertToXml();
          var renamedDisplayUnitNode = xmlUtils.copyElement(displayUnitNode, 'DisplayUnit');

          var sourceUnitNode = this.sourceUnit.convertToXml();
          var renamedSourceUnitNode = xmlUtils.copyElement(sourceUnitNode, 'SourceUnit');

          var servicePropertiesNode = rootNode.getElementsByTagName('ServiceProperties')[0];

          rootNode.insertBefore(renamedDisplayUnitNode, servicePropertiesNode);
          rootNode.insertBefore(renamedSourceUnitNode, servicePropertiesNode);

          return rootNode;
        }
      });
  });