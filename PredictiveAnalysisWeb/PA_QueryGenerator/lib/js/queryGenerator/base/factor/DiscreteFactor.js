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
  './BaseFactor',
  '../../../base/json/Utils'
],
  function(declare, lang, BaseFactor, jsonUtils) {
    return declare(
      [BaseFactor],
      {
        __type: 'DiscreteFactor',
        count: 0,
        discreteFactorValuesByCount: null,

        fromServerJson: function(jsonObj) {
          this.inherited(arguments);

          if (!jsonObj || !(jsonObj.FactorSource)) {
            return;
          }

          var clonedObj = lang.clone(jsonObj);
          delete clonedObj.FactorSource;

          jsonUtils.convertUppercasePropertiesToLowercase(clonedObj, true);
          declare.safeMixin(this, clonedObj);
        }
      }
    );
  }
);