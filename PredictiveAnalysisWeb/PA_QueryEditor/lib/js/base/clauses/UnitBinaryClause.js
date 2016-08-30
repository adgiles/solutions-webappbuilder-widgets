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
  './BaseBinaryClause',
  '../rasterSources/UnitRasterSource',
  '../xml/Utils',
  '../units/UnitConverter'
],
  function(declare, BaseBinaryClause, UnitRasterSource, xmlUtils, UnitConverter) {
    return declare(
      [BaseBinaryClause],
      {
        declaredClass: 'predictiveAnalysis.UnitBinaryClause',

        constructor: function() {
          this.clauseType = 'MakoUnitBinaryClause';

          if (!(this.rasterSource instanceof UnitRasterSource)) {
            this.rasterSource = new UnitRasterSource();
          }
        },

        convertToXml: function() {
          var baseClassElement = this.inherited(arguments);
          return xmlUtils.copyElement(baseClassElement, 'MakoUnitBinaryClause');
        },

        replaceDataSource: function(rasterSource) {
          if (!(rasterSource instanceof UnitRasterSource)) {
            return false;
          }

          // We want to replace the rasterSource if the the source units match or
          // when the instance rasterSource is invalid and the parameter rasterSource is valid.
          // Otherwise, we do not replace the rasterSource.
          var isParameterRasterSourceValid = rasterSource.sourceUnit && rasterSource.sourceUnit.constructor;
          if (!isParameterRasterSourceValid) {
            return false;
          }

          var isInstanceRasterSourceValid = this.rasterSource.sourceUnit && this.rasterSource.sourceUnit.constructor;
          if (isInstanceRasterSourceValid) {
            // At this point, both the instance and parameter rasterSources are valid, and we can compare their
            // source units.
            var sourceUnitsMatch = this.rasterSource.sourceUnit.constructor === rasterSource.sourceUnit.constructor;
            if (sourceUnitsMatch) {
              return this.inherited(arguments);
            } else {
              return false;
            }
          } else {
            // The instance raster source was not valid, but the parameter one is.
            // Replace the instance raster source with the parameter one.
            return this.inherited(arguments);
          }
        },

        evaluate: function(value) {
          if (typeof value === 'number') {
            value = UnitConverter.convertUnit(value, this.rasterSource.sourceUnit, this.rasterSource.displayUnit);
          }

          return this.inherited(arguments);
        }

      }
    );
  }
);