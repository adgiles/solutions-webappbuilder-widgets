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
  '../rasterSources/AttributedRasterSource',
  '../xml/Utils'
],
  function(declare, BaseBinaryClause, AttributedRasterSource, xmlUtils) {
    return declare(
      [BaseBinaryClause],
      {
        declaredClass: 'predictiveAnalysis.AttributedBinaryClause',

        constructor: function() {
          this.clauseType = 'AttributedBinaryClause';
        },

        convertToXml: function() {
          var baseClassElement = this.inherited(arguments);
          return xmlUtils.copyElement(baseClassElement, 'AttributedBinaryClause');
        },

        replaceDataSource: function(rasterSource) {
          if (!(rasterSource instanceof AttributedRasterSource)) {
            return false;
          }

          return this.inherited(arguments);
        }

      }
    );
  }
);