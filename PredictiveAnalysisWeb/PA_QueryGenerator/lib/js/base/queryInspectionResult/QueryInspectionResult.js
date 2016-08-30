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
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/Deferred',
    'dojo/promise/all',
    'esri/graphic',
    'esri/tasks/ImageServiceIdentifyParameters',
    'esri/tasks/ImageServiceIdentifyTask',
    '../query/Query'
  ],
  function(declare, lang, Deferred, all, Graphic, ImageServiceIdentifyParameters, ImageServiceIdentifyTask, Query) {
    return declare(null,
      {
        location: null,

        constructor: function(args) {
          if (!args || !args.location) {
            throw new Error('Input arguments must contain a location property.');
          }

          if (args.location.declaredClass !== Graphic.prototype.declaredClass) {
            throw new Error('The input location property must be of type ' + Graphic.prototype.declaredClass);
          }

          declare.safeMixin(this, args);
        },

        inspectQuery: function(query) {
          if (query.declaredClass !== Query.prototype.declaredClass) {
            return [];
          }

          var rasterSourceDeferreds = this._inspectRasterSources(query.getDistinctRasterSources());

          var queryDeferred = new Deferred();
          this.query = queryDeferred;

          all(rasterSourceDeferreds).then(lang.hitch(this, function handleRasterSourceInspectionComplete(results) {
            this._evaluateQuery(queryDeferred, query);
          }));

          var inspectionDeferreds = lang.clone(rasterSourceDeferreds);
          inspectionDeferreds.push(queryDeferred);

          return inspectionDeferreds;
        },

        _inspectRasterSources: function(rasterSources) {
          var deferreds = [];
          for(var i = 0; i < rasterSources.length; i++) {
            deferreds.push(this._inspectRasterSource(rasterSources[i]));
          }

          return deferreds;
        },

        _inspectRasterSource: function(rasterSource) {
          var deferred = new Deferred();

          if (this[rasterSource.sourceUrl] && !(this[rasterSource.sourceUrl] instanceof Deferred)) {
            deferred.resolve({inspectionResult:this, updatedPropertyName:rasterSource.sourceUrl});
            return deferred;
          }

          this[rasterSource.sourceUrl] = deferred;

          var taskParams = new ImageServiceIdentifyParameters();
          taskParams.geometry = this.location.geometry;
          taskParams.returnCatalogItems = false;
          taskParams.returnGeometry = false;

          var identifyTask = new ImageServiceIdentifyTask(rasterSource.sourceUrl);
          var identifyTaskDeferred = identifyTask.execute(taskParams);
          identifyTaskDeferred.then(
            lang.hitch(this, function(result) {
              this._handleImageServiceIdentifySuccessful(deferred, rasterSource, result);
            }),
            lang.hitch(this, function(error) {
              this._handleImageServiceIdentifyFailed(deferred, rasterSource, error);
            }));

          return deferred;
        },

        _handleImageServiceIdentifySuccessful: function(deferred, rasterSource, result) {
          if (result.value === 'NoData') {
            this[rasterSource.sourceUrl] = result.value;
          }
          else {
            // Display the value from the first band until band support is added to the web version
            var splicedValue = result.value.split(',');
            this[rasterSource.sourceUrl] = Number(splicedValue[0]);
          }

          deferred.resolve({inspectionResult:this, updatedPropertyName:rasterSource.sourceUrl});
        },

        _handleImageServiceIdentifyFailed: function(deferred, rasterSource, error) {
          this[rasterSource.sourceUrl] = 'Failed';
          deferred.resolve({inspectionResult:this, updatedPropertyName:rasterSource.sourceUrl});
        },

        _evaluateQuery: function(deferred, query) {
          this.query = query.evaluate(this);
          deferred.resolve({inspectionResult:this, updatedPropertyName:'query'});
        }
      }
    );
  }
);



