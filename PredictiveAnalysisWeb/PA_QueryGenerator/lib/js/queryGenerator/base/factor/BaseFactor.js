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
  '../../../base/rasterSources/Utils'
],
  function(declare, rasterSourceUtils) {
    return declare(
      null,
      {
        factorSource: null,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }
        },

        fromServerJson: function(jsonObj) {
          if (!jsonObj || !(jsonObj.FactorSource)) {
            return;
          }

          this.factorSource = rasterSourceUtils.createRasterSourceFromServerJson(jsonObj.FactorSource);
        },

        fromJson: function(jsonObj) {
          if (jsonObj) {
            declare.safeMixin(this, jsonObj);
          }

          if (jsonObj.factorSource) {
            this.factorSource = rasterSourceUtils.createRasterSourceFromJson(jsonObj.factorSource);
          }
        }
      }
    );
  }
);