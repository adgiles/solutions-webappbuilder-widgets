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
  '../factor/Utils',
  '../factorStrategy/Utils',
  '../../../base/json/Utils'
],
  function(declare, lang, factorUtils, factorStrategyUtils, jsonUtils) {
    return declare(
      null,
      {
        availableStrategies: null,
        hasValidAnalysisResults: false,
        inputFactor: null,
        selectedStrategyIndex: 0,
        useInQueryGeneration: true,

        constructor: function(args) {
          this.availableStrategies = [];

          if (args) {
            declare.safeMixin(this, args);
          }
        },

        getSeriesData: function() {
          // Implemented in derived classes.
          return [];
        },

        fromServerJson: function(serverJson) {
          if (!serverJson) {
            return;
          }

          var cloneData = lang.clone(serverJson);
          jsonUtils.convertUppercasePropertiesToLowercase(cloneData);
          declare.safeMixin(this, cloneData);

          this.inputFactor = factorUtils.createFactorFromServerJson(cloneData.inputFactor);

          if (cloneData.availableStrategies) {
            for (var i = 0; i < this.availableStrategies.length; i++) {
              this.availableStrategies[i] =
                factorStrategyUtils.createFactorStrategyFromServerJson(this.availableStrategies[i]);
            }
          }
        }
      }
    );
  }
);

