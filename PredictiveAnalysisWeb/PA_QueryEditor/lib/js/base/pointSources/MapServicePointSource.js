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
  'esri/tasks/query',
  'esri/tasks/QueryTask',
  './BasePointSource'
],
  function(declare, Query, QueryTask, BasePointSource) {
    return declare([BasePointSource],
      {
        layerInfo: null,

        constructor: function(mapServiceLayer, layerInfo) {
          if (!layerInfo) {
            throw new Error('Map Service Point Source requires an input map service sub layer ID.');
          }

          this.layerInfo = layerInfo;
          this.name = layerInfo.name;
        },

        getPoints: function(extent, countOnly) {
          var query = new Query();
          query.where = this._getQueryFilter();
          query.timeExtent = this._getTimeExtent();
          query.outFields = [];
          query.geometry = extent;
          query.returnGeometry = true;

          var queryTask = new QueryTask(this.layer.url + '/' + this.layerInfo.id);
          if (countOnly) {
            return queryTask.executeForCount(query);
          }
          else {
            return queryTask.execute(query);
          }
        },

        _getQueryFilter: function() {
          var queryFilter = '1=1';

          // If a filter has been applied to the map service sub layer then use that filter
          // instead of the default 1=1 filter.
          if (this.layer.layerDefinitions && this.layer.layerDefinitions[this.layerInfo.id]) {
            queryFilter = this.layer.layerDefinitions[this.layerInfo.id];
          }

          return queryFilter;
        },

        _getTimeExtent: function() {
          var timeExtent;

          // Web AppBuilder doesn't seem to use layerTimeOptions but rather a useMapTime
          // flag to see if a layer is utilizing time-based querying.
          if ((this.layer.layerTimeOptions && this.layer.layerTimeOptions[this.layerInfo.id].useTime) ||
            (this.layer.useMapTime)) {
            timeExtent = this.layer.getMap().timeExtent;
          }

          return timeExtent;
        }
      }
    );
  }
);
