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
  'dgrid/List',
  'dgrid/Selection'
],
  function(declare, lang, List, Selection) {
    return declare(
      [List, Selection],
      {
        selectionMode: 'clauseList',

        renderRow: function(obj) {
          return obj.domNode;
        },

        removeRow: function(rowElement, justCleanup) {
          var rowObject = this._rowIdToObject[rowElement.id];
          if (!rowObject) {
            return;
          }
          rowObject.destroyRecursive();

          this.inherited(arguments);
        },

        _clauseListSelectionHandler: function(evt, target) {
          // Create a cloned event object to manipulate the ctrl and shift key properties
          var changedEvent = lang.mixin({}, evt);

          //Ignore the CTRL functionality to mimic the desktop tools
          if (evt.ctrlKey) {
            changedEvent.ctrlKey = false;
            changedEvent.shiftKey = true;
          }

          var rowObject = this._rowIdToObject[target.id];
          if (!rowObject) {
            return;
          }

          this._extendedSelectionHandler(changedEvent, target);
        }
      }
    );
  }
);
