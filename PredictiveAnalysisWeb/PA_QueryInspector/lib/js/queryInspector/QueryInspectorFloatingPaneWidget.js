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
  'dojo/dom-class',
  'dojo/dom-style',
  'dojox/layout/FloatingPane',
  './QueryInspectorWidget'
],
  function(declare, domClass, domStyle, FloatingPane, QueryInspectorWidget) {
    return declare(
      [FloatingPane],
      {
        _minimized: false,
        _originalHeight: null,
        _originalMinHeight: null,
        map: null,
        queryInspectorWidget: null,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }
        },

        postCreate: function() {
          this.inherited(arguments);

          this.queryInspectorWidget = new QueryInspectorWidget({map: this.map});
          this.queryInspectorWidget.placeAt(this.containerNode);
          this.queryInspectorWidget.startup();
        },

        minimize: function() {
          if (this._minimized) {
            this._restoreContentPane();
          }
          else {
            this._minimizeContentPane();
          }

          this._minimized = !(this._minimized);
        },

        _minimizeContentPane: function() {
          this._originalMinHeight = domStyle.get(this.domNode, 'minHeight');
          this._originalHeight = domStyle.get(this.domNode, 'height');

          domStyle.set(this.domNode, 'minHeight', '0px');
          domStyle.set(this.domNode, 'height', this.focusNode.offsetHeight + 'px');
          domClass.replace(this.dockNode, 'dojoxFloatingMaximizeIcon', 'dojoxFloatingMinimizeIcon');

          domStyle.set(this.canvas, 'display', 'none');
        },

        _restoreContentPane: function() {
          domStyle.set(this.domNode, 'minHeight', this._originalMinHeight + 'px');
          domStyle.set(this.domNode, 'height', this._originalHeight + 'px');
          domStyle.set(this.canvas, 'display', '');
          domClass.replace(this.dockNode, 'dojoxFloatingMinimizeIcon', 'dojoxFloatingMaximizeIcon');
        },

        resize: function(dim) {
          // Ignore the resize event that is derived from window resize and only handle resize events
          // that derive from the resize handle.
          if (dim === undefined) {
            return;
          }

          var minWidth = domStyle.get(this.domNode, 'minWidth');
          var minHeight = domStyle.get(this.domNode, 'minHeight');
          if (dim.w < minWidth) {
            dim.w = minWidth;
          }

          if ((dim.h - this.focusNode.offsetHeight) < minHeight) {
            dim.h = minHeight + this.focusNode.offsetHeight;
          }

          this.inherited(arguments);
          this.queryInspectorWidget.resize();
        }
      }
    );
  }
);

