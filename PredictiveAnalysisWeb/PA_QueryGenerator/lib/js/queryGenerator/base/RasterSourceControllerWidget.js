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
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dojo/store/Memory',
  'dojo/store/Observable',
  'dojo/text!./templates/RasterSourceControllerWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  './RasterSourceListWidget',
  './RasterSourceWidget',
  '../../base/rasterSourceController/BaseRasterSourceControllerWidget'

],
  function(declare, lang, domConstruct, domGeometry, domStyle, Memory, Observable, template, _TemplatedMixin,
           RasterSourceListWidget, RasterSourceWidget, BaseRasterSourceControllerWidget) {
    return declare(
      [BaseRasterSourceControllerWidget, _TemplatedMixin],
      {
        _rasterSourceWidgetDataStore: null,
        _rasterSourceListWidget: null,
        _rasterSourceWidgetListNode: null,
        templateString: template,

        postCreate: function() {
          this.inherited(arguments);

          this._rasterSourceWidgetDataStore = new Observable(new Memory({data: [], idProperty: 'id'}));
          this._rasterSourceListWidget = new RasterSourceListWidget({store: this._rasterSourceWidgetDataStore});

          domConstruct.place(this._rasterSourceListWidget.domNode, this._rasterSourceWidgetListNode, 'last');
        },

        startup: function() {
          this._rasterSourceListWidget.startup();
          this.inherited(arguments);
        },

        destroy: function() {
          var rasterSourceWidgets = this._rasterSourceWidgetDataStore.query();
          for (var i = 0; i < rasterSourceWidgets.length; i++) {
            rasterSourceWidgets[i].destroy();
          }

          this._rasterSourceListWidget.destroy();
          this.inherited(arguments);
        },

        getRasterSources: function() {
          var rasterSourceWidgets = this._rasterSourceWidgetDataStore.query();
          var rasterSources = [];

          for (var i = 0; i < rasterSourceWidgets.length; i++) {
            if (rasterSourceWidgets[i].isSelected()) {
              rasterSources.push(rasterSourceWidgets[i].rasterSource);
            }
          }

          return rasterSources;
        },

        _handleRasterSourceAdded: function(rasterSource) {
          this.inherited(arguments);

          var newRasterSourceWidget = new RasterSourceWidget({rasterSource: rasterSource});
          newRasterSourceWidget.startup();

          this._rasterSourceWidgetDataStore.put(newRasterSourceWidget);
        },

        _handleSelectAllRasterSources: function() {
          this._rasterSourceListWidget.selectAll();
        },

        _handleDeselectAllRasterSources: function() {
          this._rasterSourceListWidget.clearSelection();
        },

        _handleAddImageService: function() {
          this.addImageService();
        },

        resize: function() {
          this.inherited(arguments);
          this._rasterSourceListWidget.resize();
        }
      }
    );
  }
);

