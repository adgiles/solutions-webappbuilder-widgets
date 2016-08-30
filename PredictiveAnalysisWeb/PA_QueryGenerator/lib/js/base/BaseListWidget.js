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
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dgrid/_StoreMixin',
  'dgrid/List',
  'dgrid/Selection'
],
  function(declare, lang, domGeometry, domStyle, _StoreMixin, List, Selection) {
    return declare(
      [List, Selection, _StoreMixin],
      {
        cleanEmptyObservers: false,

        renderRow: function(obj) {
          return obj.domNode;
        },

        refresh: function() {
          this.inherited(arguments);

          if (!this.store) {
            return;
          }

          return this._trackError(lang.hitch(this, function() {
            var queryOptions = this.get('queryOptions');
            var results = this.store.query(this.query, queryOptions);

            return _StoreMixin.prototype.renderArray.call(this, results, null, queryOptions);
          }));
        },

        resize: function() {
          this.inherited(arguments);

          // Setting the display to none on the d-grid allows the height that is returned
          // by the container node to be un-effected by overflow in the d-grid due to resizing
          domStyle.set(this.domNode, 'display', 'none');

          // Set the max-height of the d-grid to the container height so overflow can
          // happen correctly.
          var geometryInfo = domGeometry.position(this.domNode.parentNode, false);
          domStyle.set(this.domNode, 'maxHeight', geometryInfo.h + 'px');

          // Restore the display property on the d-grid
          domStyle.set(this.domNode, 'display', '');
        }
      }
    );
  }
);


