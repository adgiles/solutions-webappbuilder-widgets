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
  'dojo/Evented',
  'dojo/on',
  'dojo/topic'
],
  function(array, declare, lang, Evented, on, topic) {
    return declare(
      [Evented],
      {
        _currentScope: null,
        _scopes: null,
        _scopeEventSignals: null,

        constructor: function() {
          this._scopes = [];
          this._scopeEventSignals = [];
          topic.subscribe('registerSelectionManagement/topic', lang.hitch(this, this.registerScope));
          topic.subscribe('unRegisterSelectionManagement/topic', lang.hitch(this, this.unregisterScope));
        },

        registerScope: function(scope) {
          if (!scope) {
            return;
          }

          var scopeSelectSignal = on(scope, 'dgrid-select', lang.hitch(this, this._handleSelectionChanged));
          if (!scopeSelectSignal) {
            console.log('Unable to connect to new scopes selection changed.  Scope will not be added');
            return;
          }

          this._scopes.push(scope);
          this._scopeEventSignals.push(scopeSelectSignal);

          if (!(this._currentScope)) {
            this._currentScope = scope;
          }

          this.emit('selection-manager-scope-registered', {scope: scope});
        },

        unregisterScope: function(scope) {
          var scopeIndex = array.indexOf(this._scopes, scope);
          if (scopeIndex !== -1) {
            this._scopes.splice(scopeIndex, 1);

            var scopeSelectSignal = this._scopeEventSignals.splice(scopeIndex, 1)[0];
            scopeSelectSignal.remove();

            this.emit('selection-manager-scope-unregistered', {scope: scope, scopes: this._scopes});
          }
          else {
            console.log('Could not find the scope to unregister.', scope);
          }
        },

        _handleSelectionChanged: function(evt) {
          if (this._currentScope !== evt.grid) {
            this._currentScope.clearSelection(null);
            this._currentScope = evt.grid;
          }

          evt.stopPropagation();
        }
      }
    );
  }
);