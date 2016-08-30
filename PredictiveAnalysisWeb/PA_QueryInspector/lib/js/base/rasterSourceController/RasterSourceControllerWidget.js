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
  'dojo/_base/array',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/dom-construct',
  'dojo/Evented',
  'dojo/text!./template/RasterSourceControllerTemplate.html',
  'dojo/topic',
  'dijit/_TemplatedMixin',
  './BaseRasterSourceControllerWidget'
],
  function(array, declare, lang, domConstruct, Evented, template, topic, _TemplatedMixin,
           BaseRasterSourceControllerWidget) {
    return declare(
      [BaseRasterSourceControllerWidget, _TemplatedMixin, Evented],
      {
        _rasterSourceListNode: null,
        templateString: template,


        _handleRasterSourceAdded: function(rasterSource) {
          this.inherited(arguments);

          var index = array.indexOf(this.rasterSourceController.rasterSourceList, rasterSource);
          this._createNewRasterSourceOptionElement(rasterSource, index);
        },

        _createNewRasterSourceOptionElement: function(newRasterSource, index) {
          var newOption = domConstruct.create('option');
          newOption.value = index;
          newOption.innerHTML = newRasterSource.alias;
          newOption.style.cssText = 'text-align:left;';

          this._rasterSourceListNode.appendChild(newOption);
        },

        _handleAddImageService: function() {
          this.addImageService();
        },

        _handleRasterSourceListDblClick: function() {
          var selectedIndex = this._rasterSourceListNode.selectedIndex;

          if (selectedIndex === null || selectedIndex === undefined || selectedIndex === -1) {
            return;
          }

          var rasterSource = this.rasterSourceController.rasterSourceList[selectedIndex];
          this.onRasterSourceDblClick(rasterSource);
        },

        _handleRasterSourceListClick: function() {
          var selectedIndex = this._rasterSourceListNode.selectedIndex;

          if (selectedIndex === null || selectedIndex === undefined || selectedIndex === -1) {
            return;
          }

          var rasterSource = this.rasterSourceController.rasterSourceList[selectedIndex];
          this.onRasterSourceClick(rasterSource);
        },

        onRasterSourceDblClick: function(rasterSource) {
          this.emit('onRasterSourceDblClick', rasterSource);
        },

        onRasterSourceClick: function(rasterSource) {
          this.emit('onRasterSourceClick', rasterSource);
        }
      });
  });