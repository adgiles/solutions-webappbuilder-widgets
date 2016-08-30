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
    'dojo/Evented',
    'dojo/on',
    'esri/Color',
    'esri/graphic',
    'esri/geometry/Point',
    'esri/layers/GraphicsLayer',
    'esri/map',
    'esri/renderers/SimpleRenderer',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol'
  ],
  function(declare, lang, Deferred, Evented, on, Color, Graphic, Point, GraphicsLayer, Map, SimpleRenderer,
           SimpleMarkerSymbol, SimpleLineSymbol) {
    return declare([Evented],
      {
        _graphicsLayer: null,
        _mapOnClickHandle: null,
        _renderer: null,
        defaultSymbol: null,
        isActive: false,
        isGraphicsLayerVisible: true,
        map: null,
        selectionSymbol: null,

        constructor: function(args) {
          if (!(args) || !(args.map)) {
            throw new Error('The point manager requires a map parameter.');
          }

          if (!(args.map instanceof Map) && args.map.declaredClass !== 'esri.Map') {
            throw new Error('The map parameter must be an esri map object.');
          }

          declare.safeMixin(this, args);

          this._initGraphicsLayer();
        },

        _initGraphicsLayer: function() {
          this._initSymbology();

          this._renderer = new SimpleRenderer(this.defaultSymbol);
          this._graphicsLayer = new GraphicsLayer();
          this._graphicsLayer.setRenderer(this._renderer);

          if (this.map.loaded) {
            this.map.addLayer(this._graphicsLayer);
          }
          else {
            on.once(this.map, 'load', lang.hitch(this, function addGraphicsLayerToMap() {
              this.map.addLayer(this._graphicsLayer);
            }));
          }
        },

        updateSelection: function(graphics, isSelection) {
          var symbolToUse = isSelection ? this.selectionSymbol : null;

          for (var i = 0; i < graphics.length; i++) {
            graphics[i].symbol = symbolToUse;
          }

          this._graphicsLayer.redraw();
        },

        _initSymbology: function() {
          var white = new Color([255, 255, 255]);
          var black = new Color([0, 0, 0]);
          var cyan = new Color([0, 255, 255]);

          var whiteOutline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, white, 1);
          var blackOutline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, black, 1);

          if (!this.defaultSymbol) {
            this.defaultSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 10, whiteOutline, black);
          }

          this.selectionSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 12, blackOutline, cyan);
        },

        add: function(graphic) {
          if (!(graphic instanceof Graphic) && (graphic.declaredClass !== 'esri.Graphic')) {
            return;
          }

          this._graphicsLayer.add(graphic);
          on.emit(this, 'point-added', graphic);
        },

        addRange: function(graphics) {
          if (!(this._validateGraphics(graphics))) {
            return;
          }

          for (var i = 0; i < graphics.length; i++) {
            this.add(graphics[i]);
          }

          if (graphics.length > 0) {
            on.emit(this, 'points-added', graphics);
          }
        },

        deleteLastGraphic: function()  {
          var lastGraphicAdded = this._graphicsLayer.graphics[this._graphicsLayer.graphics.length -1];
          this.remove(lastGraphicAdded);
        },

        _validateGraphics: function(graphics) {
          for (var i = 0; i < graphics.length; i++) {
            if (!(graphics[i] instanceof Graphic) && (graphics[i].declaredClass !== 'esri.Graphic')) {
              return false;
            }
          }
          return true;
        },

        remove: function(graphic) {
          return this._graphicsLayer.remove(graphic);
        },

        removeRange: function(graphics) {
          for (var i = 0; i < graphics.length; i++) {
            this._graphicsLayer.remove(graphics[i]);
          }
        },

        clear: function() {
          this._graphicsLayer.clear();
        },

        getPoints: function(extent) {
          if (!extent) {
            return this._graphicsLayer.graphics;
          }
          else {
            var returnGraphics = [];
            var graphics = this._graphicsLayer.graphics;
            for (var i = 0; i < graphics.length; i++) {
              if (extent.contains(graphics[i].geometry)) {
                returnGraphics.push(graphics[i]);
              }
            }
            return  returnGraphics;
          }
        },

        getGraphicsLayerID: function() {
          return this._graphicsLayer.id;
        },

        activate: function() {
          var activateDeferred = new Deferred();

          try {
            if (this.isActive) {
              activateDeferred.resolve(this);
            }
            else if (this.map.loaded) {
              this._activate(activateDeferred);
            }
            else {
              on.once(this.map, 'load', lang.hitch(this, function handleMapLoaded() {
                this._activate(activateDeferred);
              }));
            }

            return activateDeferred;
          }
          catch (err) {
            activateDeferred.reject(err);
            return activateDeferred;
          }
        },

        _activate: function(activateDeferred) {
          this.isActive = true;
          this._mapOnClickHandle = this.map.on('click', lang.hitch(this, this._handleMapClick));
          activateDeferred.resolve(this);
        },

        _handleMapClick: function(evt) {
          var point = new Point(evt.mapPoint.x, evt.mapPoint.y, this.map.spatialReference);
          var graphic = new Graphic(point);
          this.add(graphic);
        },

        setPointsVisibility: function(visibility) {
          if (visibility) {
            this._graphicsLayer.show();
          }
          else {
            this._graphicsLayer.hide();
          }

          this.isGraphicsLayerVisible = visibility;
        },

        deactivate: function() {
          if (!this.isActive) {
            return;
          }

          this._mapOnClickHandle.remove();
          this.isActive = false;
        }

      });
  });
