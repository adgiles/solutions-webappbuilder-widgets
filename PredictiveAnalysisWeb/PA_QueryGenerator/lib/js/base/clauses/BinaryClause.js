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
  '../rasterSources/RasterSource',
  '../xml/Utils'
],
  function(declare, BaseBinaryClause, RasterSource, xmlUtils) {
    return declare(
      [BaseBinaryClause],
      {
        declaredClass: 'predictiveAnalysis.BinaryClause',

        constructor: function() {
          this.clauseType = 'BinaryClause';
        },

        convertToXml: function() {
          var baseClassElement = this.inherited(arguments);
          return xmlUtils.copyElement(baseClassElement, 'BinaryClause');
        },

        replaceDataSource: function(rasterSource) {
          if (!(rasterSource instanceof RasterSource)) {
            return false;
          }

          return this.inherited(arguments);
        }

      }
    );
  }
);