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
  '../../base/BaseListWidget'
],
  function(declare, BaseListWidget) {
    return declare(
      [BaseListWidget],
      {
        selectionMode: 'toggle',

        _select: function(row, toRow, value) {
          this.inherited(arguments);

          var rowObj = this.row(row);
          if (value === null) {
            value = !!this.selection[rowObj.id];
          }

          rowObj.data.setSelected(value);
        }
      }
    );
  }
);

