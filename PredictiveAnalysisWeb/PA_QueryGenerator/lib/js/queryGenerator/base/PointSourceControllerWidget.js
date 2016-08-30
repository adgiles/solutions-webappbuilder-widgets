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
  'dojo/Deferred',
  'dojo/dom-attr',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/on',
  'dojo/text!./templates/PointSourceControllerTemplate.html',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'esri/config',
  'esri/geometry/webMercatorUtils',
  'esri/graphicsUtils',
  'esri/layers/ArcGISDynamicMapServiceLayer',
  'esri/layers/FeatureLayer',
  'esri/map',
  'esri/request',
  'esri/SpatialReference',
  'esri/tasks/query',
  'esri/tasks/FeatureSet',
  'esri/tasks/ProjectParameters',
  '../../base/pointManager/PointManager',
  '../../base/pointSourceController/PointSourceController'
],
  function(declare, lang, Deferred, domAttr, domClass, domConstruct, on, template, _TemplatedMixin, _WidgetBase,
           esriConfig, WebMercatorUtils, GraphicsUtils, ArcGISDynamicMapServiceLayer, FeatureLayer, Map, esriRequest,
           SpatialReference, Query, FeatureSet, ProjectParameters, PointManager, PointSourceController) {
    return declare(
      [_WidgetBase, _TemplatedMixin],
      {
        _queryFullExtent: false,
        _selectedOptionValue: null,
        _onExtentChanged: null,
        defaultSelectedPointLayerName: null,
        isManualPointsMode: false,
        map: null,
        pointManager: null,
        pointSourceController: null,
        pointSourceControllerNode: null,
        templateString: template,
        deleteLastPointsButtonNode: null,
        deleteAllPointsButtonNode: null,
        togglePointsButtonNode: null,
        zoomToLayerExtentButtonNode: null,
        radioViewExtentButtonNode: null,
        radioFullExtentButtonNode: null,
        geometryServiceUrl: null,
        countTextArea: null,

        constructor: function(args) {
          this.pointSourceController = new PointSourceController();

          if (!(args) || !(args.map)) {
            throw new Error('A Point Source Controller Widget must contain a map argument.');
          }

          if (!(args.map instanceof Map) && args.map.declaredClass !== Map.prototype.declaredClass) {
            throw new Error('The map parameter must be an esri map object.');
          }

          declare.safeMixin(this, args);
        },

        postCreate: function() {
          this.inherited(arguments);
          this.pointManager = new PointManager({map: this.map});

          // Set the initial visibility state of the toggle button
          if (this.pointManager.isGraphicsLayerVisible) {
            domClass.add(this.togglePointsButtonNode, 'query-button-toggled-state');
          }

          this._addDefaultOptionElements();

          if (this.map.loaded) {
            this._addFeatureLayerOptionElements();
          }
          else {
            on.once(this.map, 'load', lang.hitch(this, function(evt) {
              this._addFeatureLayerOptionElements();
            }));
          }

          this._setButtonsEnabledState(false);
          this.own(on(this.pointManager, 'point-added', lang.hitch(this, this._updateCount)));
          this._onExtentChanged = on(this.map, 'extent-change', lang.hitch(this, this._updateCount));
        },

        startup: function() {
          this.inherited(arguments);
        },

        resize: function() {
          this.inherited(arguments);
        },

        activate: function() {
          if (this.isManualPointsMode) {
            return this.pointManager.activate();
          }
          else {
            var deferred = new Deferred();
            deferred.resolve();
            return deferred;
          }
        },

        deactivate: function() {
          if (this.isManualPointsMode) {
            this.pointManager.deactivate();
          }
        },

        destroy: function() {
          if(this._onExtentChanged != null) {
            this._onExtentChanged.remove();
          }
        },

        _addFeatureLayerOptionElements: function() {
          var layerIds = this.map.graphicsLayerIds.concat(this.map.layerIds);
          var layer;
          for (var i = 0; i < layerIds.length; i++) {
            layer = this.map.getLayer(layerIds[i]);
            if (layer.isInstanceOf(FeatureLayer) || layer.declaredClass === FeatureLayer.prototype.declaredClass) {
              this.pointSourceController.addFeatureServiceSourceFromLayer(layer).then(
                lang.hitch(this, this._addFeatureLayerOptionElement));
            }
            else if (layer.isInstanceOf(ArcGISDynamicMapServiceLayer) ||
              layer.declaredClass === ArcGISDynamicMapServiceLayer.prototype.declaredClass) {
              this.pointSourceController.addMapServiceSourceFromLayer(layer).then(
                lang.hitch(this, this._addMapServiceOptionElement));
            }
          }
        },

        _addFeatureLayerOptionElement: function(result) {
          this._convertPointSourceToOptionElement(result.pointSource, result.index);
        },

        _addMapServiceOptionElement: function(results) {
          for (var i = 0; i < results.length; i++) {
            this._convertPointSourceToOptionElement(results[i].pointSource, results[i].index);
          }
        },

        _convertPointSourceToOptionElement: function(pointSource, index) {
          var optionElem = domConstruct.create('option');
          optionElem.value = index;
          optionElem.innerHTML = pointSource.name;
          this.pointSourceControllerNode.appendChild(optionElem);

          if (this.defaultSelectedPointLayerName === name) {
            this._selectedOptionValue = optionElem.value;
            this.pointSourceControllerNode.selectedIndex = optionElem.index;
          }
        },

        _addDefaultOptionElements: function() {
          domConstruct.empty(this.pointSourceControllerNode);

          var emptyOptionElem = domConstruct.create('option');
          emptyOptionElem.value = -2;
          emptyOptionElem.innerHTML = '';
          this.pointSourceControllerNode.appendChild(emptyOptionElem);
          this._selectedOptionValue = emptyOptionElem.value;

          var manualPointsOptionElem = domConstruct.create('option');
          manualPointsOptionElem.value = -1;
          manualPointsOptionElem.innerHTML = 'Create Points';
          this.pointSourceControllerNode.appendChild(manualPointsOptionElem);

          if (this.defaultSelectedPointLayerName === manualPointsOptionElem.innerHTML) {
            this._selectedOptionValue = manualPointsOptionElem.value;
            this.pointSourceControllerNode.selectedIndex = manualPointsOptionElem.index;
          }
        },

        _handleClearPoints: function() {
          this.pointManager.clear();
          this._updateCount();
        },

        _handleDeleteLastPoint: function() {
          this.pointManager.deleteLastGraphic();
          this._updateCount();
        },

        _handleOptionChanged: function(evt) {
          if (evt.target.value === '-1') {
            this._enableManualPointsMode();
          }
          else if (this.isManualPointsMode) {
            this._disableManualPointsMode();
          }

          this._selectedOptionValue = evt.target.value;
          this._updateCount();
        },

        _enableManualPointsMode: function() {
          this.isManualPointsMode = true;
          this.pointManager.activate();
          this._setButtonsEnabledState(true);

          if (!(this.pointManager.isGraphicsLayerVisible)) {
            this.pointManager.setPointsVisibility(true);
            domClass.add(this.togglePointsButtonNode, 'query-button-toggled-state');
          }
        },

        _disableManualPointsMode: function() {
          this.isManualPointsMode = false;
          this.pointManager.deactivate();
          this._setButtonsEnabledState(false);
        },

        _setButtonsEnabledState: function(enabled) {
          if (enabled) {
            domAttr.set(this.deleteLastPointsButtonNode, 'disabled', false);
            domAttr.set(this.deleteAllPointsButtonNode, 'disabled', false);
            domAttr.set(this.zoomToLayerExtentButtonNode, 'disabled', false);
          }
          else {
            domAttr.set(this.deleteLastPointsButtonNode, 'disabled', true);
            domAttr.set(this.deleteAllPointsButtonNode, 'disabled', true);
          }
        },

        _handleTogglePointFeatures: function() {
          var previousState = this.pointManager.isGraphicsLayerVisible;
          var newState = !previousState;

          this.pointManager.setPointsVisibility(newState);

          if (newState) {
            domClass.add(this.togglePointsButtonNode, 'query-button-toggled-state');
          }
          else {
            domClass.remove(this.togglePointsButtonNode, 'query-button-toggled-state');
          }
        },

        _handleZoomToLayer: function() {
          var fullExtent;

          if (this._selectedOptionValue == -1) {
            var graphics = this.pointManager.getPoints();
            fullExtent = GraphicsUtils.graphicsExtent(graphics);
          }
          else {
            var pointSourceLayer = this.pointSourceController.pointSourceList[this._selectedOptionValue];
            fullExtent = pointSourceLayer.layer.fullExtent;
          }

          this._zoomToLayer(fullExtent);
        },

        _zoomToLayer: function(geometry) {
          if (this.map.spatialReference.equals(geometry.spatialReference)) {
            this.map.setExtent(geometry);
          }
          else if (this.map.spatialReference.isWebMercator() &&
            geometry.spatialReference.equals(new SpatialReference(4326))) {
            var extent = WebMercatorUtils.geographicToWebMercator(geometry);
            this.map.setExtent(geometry);
          }
          else if (this.map.spatialReference.equals(new SpatialReference(4326)) &&
            geometry.spatialReference.isWebMercator()) {
            var extent = WebMercatorUtils.webMercatorToGeographic(geometry);
            this.map.setExtent(geometry);
          }
          else {
            var params = new ProjectParameters();
            params.geometries = [geometry];
            params.outSR = this.map.spatialReference;

            if (esriConfig.defaults.geometryService) {
              esriConfig.defaults.geometryService.project(params).then(lang.hitch(this, function(geometries) {
                this.map.setExtent(geometries[0]);
              }), function(error) {
                console.error('Failed to project the extent to the map spatial reference: ' + error.message);
              });
            }
            else {
              console.error('No geometry service specified, cannot zoom to extent.  Set the default geometry service to utilize this feature.');
            }
          }
        },

        getPoints: function(countOnly) {
          var indexValue = this.pointSourceControllerNode.value;
          var extent;
          if (!this._queryFullExtent) {
            extent = this.map.extent;
          }

          if (indexValue === '-1') {
            return this._getPointsFromPointManager(extent, countOnly);
          }
          else if (indexValue === '-2') {
            return new Deferred().reject('No point source selected.');
          }
          else {
            return this.pointSourceController.pointSourceList[this._selectedOptionValue].getPoints(extent, countOnly);
          }
        },

        _getPointsFromPointManager: function(extent, countOnly) {
          var returnValue = null;
          var graphics = this.pointManager.getPoints(extent);
          if (countOnly) {
            returnValue = graphics.length;
          }
          else {
            returnValue = new FeatureSet();
            returnValue.features = graphics;
          }
          var deferred = new Deferred();
          deferred.resolve(returnValue);
          return deferred;
        },

        _toggleQueryToFullExtent: function() {
          var oppositeValue = !this._queryFullExtent;
          this._queryFullExtent = oppositeValue;
          if (this._queryFullExtent) {
            this._onExtentChanged.remove();
            this._onExtentChanged = null;
          }
          else {
            this._onExtentChanged = on(this.map, 'extent-change', lang.hitch(this, this._updateCount));
          }
          this._updateCount();
        },

        _updatePointCountValue: function(pointCount) {
          this.countTextArea.innerHTML = pointCount;
        },

        _updateCount: function() {
          if (this.pointSourceControllerNode.value === '-2') {
            this._updatePointCountValue(0);
          }
          else {
            var points = this.getPoints(true);
            points.then(lang.hitch(this, this._updatePointCountValue));
          }
        }

      }
    );
  }
);


