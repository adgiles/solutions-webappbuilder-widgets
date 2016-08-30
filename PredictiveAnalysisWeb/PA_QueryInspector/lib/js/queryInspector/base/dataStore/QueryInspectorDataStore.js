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

define(
  [
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/on',
    'dojo/promise/all',
    'dojo/store/Memory',
    'dojo/store/Observable',
    'esri/graphic',
    '../../../base/queryInspectionResult/QueryInspectionResult'
  ],
  function(array, declare, lang, Deferred, on, all, Memory, Observable, Graphic, QueryInspectionResult) {
    return declare(null,
      {
        query: null,
        dataStore: null,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }

          this.dataStore = new Observable(new Memory({data: []}));
        },

        add: function(graphic) {
          if (!graphic || !(graphic instanceof Graphic)) {
            return;
          }

          var newQueryInspection = new QueryInspectionResult({location: graphic});
          this.dataStore.add(newQueryInspection);

          if (this.query) {
            this._invokeInspection(newQueryInspection);
          }
        },

        _invokeInspection: function(queryInspection) {
          var inspectionDeferreds = queryInspection.inspectQuery(this.query);
          all(inspectionDeferreds).then(lang.hitch(this, this._handleInspectionComplete));
        },

        _handleInspectionComplete: function(inspectionDeferreds) {
          if (inspectionDeferreds.length === 0) {
            return;
          }

          this.dataStore.notify(inspectionDeferreds[0].inspectionResult, inspectionDeferreds[0].inspectionResult.id);
        },

        remove: function(rowObject) {
          if (!rowObject) {
            return;
          }

          var id = this.dataStore.getIdentity(rowObject);
          this.dataStore.remove(id);
        },

        clear: function() {
          this.dataStore.setData([]);
        },

        setQuery: function(query, resultUrl) {
          this.query = query;

          var data = this.dataStore.query();
          data.forEach(lang.hitch(this, function(inspectionResult) {
            this._invokeInspection(inspectionResult);
          }));
        }
      }
    );
  }
);


