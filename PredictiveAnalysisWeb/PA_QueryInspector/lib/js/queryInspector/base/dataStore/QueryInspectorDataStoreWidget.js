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
    'dojo/Evented',
    'dojo/on',
    'dojo/topic',
    'dijit/_WidgetBase',
    'dijit/Tooltip',
    'dgrid/ColumnSet',
    'dgrid/Grid',
    'dgrid/Selection',
    'dgrid/extensions/ColumnReorder',
    'dgrid/extensions/ColumnResizer',
    'esri/geometry/webMercatorUtils',
    './QueryInspectorDataStore',
    '../../../base/query/Query',
    '../../../base/rasterSources/AttributedRasterSource',
    '../../../base/topics'
  ],
  function(array, declare, lang, Evented, on, topic, _WidgetBase, Tooltip, ColumnSet, Grid, Selection, ColumnReorder,
           ColumnResizer, webMercatorUtils, QueryInspectorDataStore, Query, AttributedRasterSource, topics) {

    return declare([_WidgetBase, Evented],
      {
        _gridSelectHandle: null,
        _gridDeselectHandle: null,
        _idColumnSet: null,
        _queryColumnSet: null,
        _queryExecutedTopicHandle: null,
        grid: null,
        queryInspectorDataStore: null,

        constructor: function(args) {
          this.queryInspectorDataStore = new QueryInspectorDataStore();

          if (args) {
            declare.safeMixin(this, args);
          }

          this._initIdColumnSet();
          this._initQueryColumnSet();
        },

        postCreate: function() {
          this.inherited(arguments);

          this.grid = new (declare([Grid, ColumnSet, Selection, ColumnResizer, ColumnReorder]))({
            selectionMode: 'extended',
            idProperty: 'id',
            minWidth: 50,
            cleanEmptyObservers: false,
            store: this.queryInspectorDataStore.dataStore
          }, this.domNode);

          this._gridSelectHandle = this.grid.on('dgrid-select', lang.hitch(this, this._handleTableSelection));
          this._gridDeselectHandle = this.grid.on('dgrid-deselect', lang.hitch(this, this._handleTableDeselection));

          this._createColumnSetFromQuery(this.queryInspectorDataStore.query);
          this.grid.renderArray(this.queryInspectorDataStore.dataStore.query());

          this._queryExecutedTopicHandle = topic.subscribe(
            topics.QUERY_EXECUTED,
            lang.hitch(this, this._handleQueryExecuted));
        },

        startup: function() {
          this.inherited(arguments);
          this.grid.startup();
          new Tooltip({
            connectId: this.id,
            position: ['above'],
            showDelay: 200,
            selector: '.dgrid-content .dgrid-cell',
            getContent: function(matchedNode) {
              return matchedNode.innerHTML;
            }
          });
        },

        destroy: function() {
          this._gridSelectHandle.remove();
          this._gridDeselectHandle.remove();
          this._queryExecutedTopicHandle.remove();

          this.inherited(arguments);
        },

        resize: function() {
          this.grid.resize();
        },

        clear: function() {
          this.queryInspectorDataStore.clear();
          this.grid.refresh();
          this.grid.renderArray(this.queryInspectorDataStore.dataStore.query());
        },

        setQuery: function(query, resultUrl) {
          //handle query executed called to refresh object.
          //just needed a public way to access it.
          this._handleQueryExecuted(query, resultUrl);
        },

        addQueryInspection: function(graphic) {
          this.queryInspectorDataStore.add(graphic);
        },

        _initIdColumnSet: function() {
          this._idColumnSet = [
            {
              field: 'id',
              label: '',
              sortable: false,
              resizable: false,
              renderCell: function(object, value, node, options) {
                // The 'this' context refers to the column object.  dgrid gives each column object a
                // reference to the grid object exposed through a property called grid.
                var val = this.grid._lastCollection.indexOf(object);
                node.innerHTML = val + 1;
              }
            }
          ];
        },

        _initQueryColumnSet: function() {
          this._queryColumnSet = [
            {
              field: 'location',
              label: 'Location',
              formatter: function(value) {
                if (value && value.geometry) {
                  // Format the point from web merc to lat/lon
                  var lonLat = webMercatorUtils.xyToLngLat(value.geometry.x, value.geometry.y);
                  return lonLat[1].toFixed(4) + ',' + lonLat[0].toFixed(4);
                }
                else {
                  return '';
                }
              }
            }
          ];
        },

        _handleQueryExecuted: function(query, resultUrl) {
          if (!query) {
            return;
          }

          if (query.declaredClass !== 'predictiveAnalysis.Query') {
            return;
          }

          this.queryInspectorDataStore.setQuery(query, resultUrl);
          this._createColumnSetFromQuery(query);
        },

        _createColumnSetFromQuery: function(query) {
          this._queryColumnSet.splice(1, this._queryColumnSet.length - 1);

          if (query) {
            this._addQueryColumns(query);
          }

          // Maintain selection and scroll position because it is lost when
          // the grid column sets are reset.
          var scrollPosition = this.grid.getScrollPosition();
          var selectionIds = Object.keys(this.grid.selection);

          // Temporarily remove selection changed event listeners due to a bug
          // in the deselection event that occurs when column sets are changed.
          this._gridSelectHandle.remove();
          this._gridDeselectHandle.remove();

          this.grid.set('columnSets', [
            [this._idColumnSet],
            [this._queryColumnSet]
          ]);

          // Restore selection and scroll position
          for (var i = 0 ; i < selectionIds.length; i++) {
            this.grid.select(selectionIds[i]);
          }

          // Restore selection changed listeners
          this._gridSelectHandle = this.grid.on('dgrid-select', lang.hitch(this, this._handleTableSelection));
          this._gridDeselectHandle = this.grid.on('dgrid-deselect', lang.hitch(this, this._handleTableDeselection));

          this.grid.scrollTo(scrollPosition);
        },

        _addQueryColumns: function(query) {
          var rasterSources = query.getDistinctRasterSources();

          if (query.clauses.length > 0) {
            this._queryColumnSet.push(this._createQueryColumn(query));
          }

          for (var i = 0; i < rasterSources.length; i++) {
            if (rasterSources[i].rasterSourceType === AttributedRasterSource.prototype.rasterSourceType) {
              this._queryColumnSet.push(this._createAttributedRasterSourceColumn(rasterSources[i]));
            }
            else {
              this._queryColumnSet.push({field: rasterSources[i].sourceUrl, label: rasterSources[i].alias});
            }
          }
        },

        _createQueryColumn: function(query) {
          return {
            field: 'query',
            label: query.title,
            useWeighting: query.useWeightings,

            formatter: function(value) {
              if (this.useWeighting) {
                return value;
              }
              else {
                if (value === 0) {
                  return 'Fail';
                }
                if (value === 1) {
                  return 'Pass';
                }
                else {
                  return value;
                }
              }
            }
          };
        },

        _createAttributedRasterSourceColumn: function(rasterSource) {
          return {
            field: rasterSource.sourceUrl,
            label: rasterSource.alias,
            lookupTable: rasterSource.attributedValues,

            formatter: function(value) {
              var convertedValue = this.lookupTable[value];

              if (convertedValue) {
                return convertedValue;
              }
              else {
                return value;
              }
            }
          };
        },

        _handleTableSelection: function(evt) {
          this._emitSelectionChangedEvent(evt.rows, true);
        },

        _handleTableDeselection: function(evt) {
          this._emitSelectionChangedEvent(evt.rows, false);
        },

        _emitSelectionChangedEvent: function(rows, isSelection) {
          var validRows = array.filter(rows, function(row) { return row.data ? true : false; });
          var queryInspectionResults = array.map(validRows, function(row) { return row.data; });

          if (queryInspectionResults.length > 0) {
            on.emit(this, 'selection-changed', {inspectionResults: queryInspectionResults, isSelection: isSelection});
          }
        }
      }
    );
  }
);



