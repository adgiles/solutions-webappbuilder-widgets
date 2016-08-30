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

define(['dojo/_base/declare'], function(declare) {
  var Utils = declare(
    null,
    {
      convertUppercasePropertiesToLowercase: function(jsonObj, deepConversion) {
        if (!jsonObj) {
          return;
        }

        var keys = Object.keys(jsonObj);
        var firstCharCode;
        var firstChar;
        var newPropertyName;

        for (var i = 0; i < keys.length; i++) {
          firstCharCode = keys[i].charCodeAt(0);

          // 65 through 90 represent capital letters
          if (firstCharCode >= 65 && firstCharCode <= 90) {
            firstChar = keys[i].charAt(0).toLowerCase();
            newPropertyName = firstChar.concat(keys[i].substr(1));
            jsonObj[newPropertyName] = jsonObj[keys[i]];
            delete jsonObj[keys[i]];
          }
          else {
            newPropertyName = keys[i];
          }

          if (deepConversion && jsonObj[newPropertyName] !== null && typeof jsonObj[newPropertyName] === 'object') {
            this.convertUppercasePropertiesToLowercase(jsonObj[newPropertyName], deepConversion);
          }
        }
      }
    });

  return new Utils();
});