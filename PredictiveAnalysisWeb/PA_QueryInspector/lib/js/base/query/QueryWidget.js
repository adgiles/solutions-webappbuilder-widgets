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
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dojo/Evented',
  'dojo/store/Observable',
  'dojo/store/Memory',
  'dojo/text!./template/QueryWidgetTemplate.html',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  './Query',
  '../clauses/AttributedBinaryClause',
  '../clauses/AttributedBinaryClauseWidget',
  '../clauses/BinaryClause',
  '../clauses/BinaryClauseWidget',
  '../clauses/ClauseListWidget',
  '../clauses/ConcatenationClause',
  '../clauses/ConcatenationClauseWidget',
  '../clauses/GroupClause',
  '../clauses/GroupClauseWidget',
  '../clauses/UnitBinaryClause',
  '../clauses/UnitBinaryClauseWidget',
  '../clauses/Utils',
  '../selectionManager/SelectionManager'
],
  function(array, declare, lang, domClass, domConstruct, domGeometry, domStyle, Evented, Observable, Memory,
           template, _TemplatedMixin, _WidgetBase, Query, AttributedBinaryClause, AttributedBinaryClauseWidget,
           BinaryClause, BinaryClauseWidget, ClauseListWidget, ConcatenationClause, ConcatenationClauseWidget,
           GroupClause, GroupClauseWidget, UnitBinaryClause, UnitBinaryClauseWidget, clauseUtils, SelectionManager) {
    return declare([_WidgetBase, _TemplatedMixin, Evented],
      {
        _selectionManager: null,
        addClauseButtonNode: null,
        clauseWidgetDataStore: null,
        containerNode: null,
        currentSelectedRasterSource: null,
        groupClausesButtonNode: null,
        hideRunButton: false,
        isEnabled: true,
        moveClauseDownButtonNode: null,
        moveClauseUpButtonNode: null,
        query: null,
        queryExecuteButtonNode: null,
        removeClauseButtonNode: null,
        results: null,
        selectableList: null,
        showWeightingsNode: null,
        swapClauseButtonNode: null,
        templateString: template,
        ungroupClausesButtonNode: null,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }

          this.clauseWidgetDataStore = new Observable(new Memory({data: [], idProperty: 'id'}));
          this._selectionManager = new SelectionManager({});
        },

        postCreate: function() {
          this.inherited(arguments);

          if (!(this.query)) {
            this.query = new Query();
          }

          this.selectableList = new ClauseListWidget({cleanEmptyObservers: false});
          domConstruct.place(this.selectableList.domNode, this.containerNode, 'last');

          if(this.hideRunButton) {
            domClass.add(this.queryExecuteButtonNode, 'hide-execute-button');
          }

          if (this.query.useWeightings === true) {
            domClass.add(this.showWeightingsNode, 'query-button-toggled-state');
          }
        },

        startup: function() {
          this.selectableList.startup();
          this.inherited(arguments);

          this.results = this.clauseWidgetDataStore.query();
          this.selectableList.renderArray(this.results);
          this._selectionManager.registerScope(this.selectableList);

          this._generateClauseWidgets();

          this.setEnabled(this.isEnabled);
        },

        setQuery: function(query) {
          if (!query) {
            this.query = new Query();
          }
          else {
            this.query = query;
          }

          this.clauseWidgetDataStore.setData([]);
          this.results = this.clauseWidgetDataStore.query();

          this.selectableList.refresh();
          this.selectableList.renderArray(this.results);

          this._generateClauseWidgets();
        },

        addClause: function(rasterSource) {
          var index = this.query.addClause(rasterSource);

          if (index !== -1) {
            this.selectableList.clearSelection();
            this._addClauseWidget();
          }
          else {
            console.error('QueryWidget: Failed to add clause to query.');
          }
        },

        _addClauseWidget: function() {
          if (this.query.clauses.length > 1) {
            // Since there is no button to generate link clauses, generate one
            // automatically if necessary.
            var linkClause = this.query.clauses[this.query.clauses.length - 2];
            var linkClauseWidget = new ConcatenationClauseWidget({clause: linkClause});
            this.clauseWidgetDataStore.put(linkClauseWidget);
          }

          var clause = this.query.clauses[this.query.clauses.length - 1];
          var clauseWidget = this._createClauseWidget(clause);
          if (clause === null) {
            console.error('Cannot convert clause to clause widget.');
            return;
          }

          this.clauseWidgetDataStore.put(clauseWidget);
          this._selectAndScrollTo(clauseWidget);
        },

        _createClauseWidget: function(clause) {
          if (clause.declaredClass === AttributedBinaryClause.prototype.declaredClass) {
            return new AttributedBinaryClauseWidget({clause: clause, isEnabled: this.isEnabled});
          }
          else if (clause.declaredClass === ConcatenationClause.prototype.declaredClass) {
            return new ConcatenationClauseWidget({clause: clause, isEnabled: this.isEnabled});
          }
          else if (clause.declaredClass === UnitBinaryClause.prototype.declaredClass) {
            return new UnitBinaryClauseWidget({clause: clause, isEnabled: this.isEnabled});
          }
          else if (clause.declaredClass === BinaryClause.prototype.declaredClass) {
            return new BinaryClauseWidget({clause: clause, isEnabled: this.isEnabled});
          }
          else if (clause.declaredClass === GroupClause.prototype.declaredClass) {
            return new GroupClauseWidget({clause: clause, isEnabled: this.isEnabled});
          }
          else {
            console.error('The clause type is not recognized.', Object.prototype.toString.call(clause));
            return null;
          }
        },

        _generateClauseWidgets: function() {
          array.forEach(this.query.clauses, lang.hitch(this, function generateClauseWidget(clause) {
            if (clause === null) {
              console.error('Cannot convert clause to clause widget.');
              return;
            }

            var clauseWidget = this._createClauseWidget(clause);
            if (clauseWidget) {
              clauseWidget.startup();
              this.clauseWidgetDataStore.put(clauseWidget);
            }
          }));

          var numberOfWidgets = this.clauseWidgetDataStore.data.length;
          if (numberOfWidgets > 0 && this.isEnabled) {
            this._selectAndScrollTo(this.clauseWidgetDataStore.data[numberOfWidgets - 1]);
          }
        },

        _handleAddNewClause: function(evt) {
          if (!(this.currentSelectedRasterSource)) {
            return;
          }

          this.addClause(this.currentSelectedRasterSource);
        },

        _handleRunClicked: function() {
          this.onQueryExecuted();
        },

        onQueryExecuted: function() {
          this.emit('onQueryExecuted', this.query);
        },

         // This method assumes a selection semantic that requires selected
         // objects to be contiguous.
        _getSelectionInfo: function() {
          var lowestIndex = this.clauseWidgetDataStore.data.length;
          var highestIndex = 0;
          var currentIndex;
          var count = 0;
          // Get the min and max selected index of selected clauses to determine the count.
          for(var rowId in this.selectableList.selection) {
            if (this.selectableList.selection.hasOwnProperty(rowId)) {
              currentIndex = array.indexOf(this.clauseWidgetDataStore.data, this.selectableList.row(rowId).data);

              if (lowestIndex > currentIndex && currentIndex >= 0) {
                lowestIndex = currentIndex;
              }

              if (highestIndex < currentIndex) {
                highestIndex = currentIndex;
              }

              count++;
            }
          }

          return {startIndex: lowestIndex, count: count};
        },

        _handleRemoveSelectedClause: function() {
          var selectionInfo = this._getSelectionInfo();

          if (this.query.canRemoveClauses(selectionInfo.startIndex, selectionInfo.count) === false) {
            return;
          }

          var removeInfo = this.query.removeClauses(selectionInfo.startIndex, selectionInfo.count);
          var removedClause;
          for (var i = 0; i < removeInfo.count; i++) {
            removedClause = this.clauseWidgetDataStore.get(this.clauseWidgetDataStore.data[removeInfo.startIndex].id);
            this.clauseWidgetDataStore.remove(removedClause.id);
          }

          this.selectableList.clearSelection();
          this._selectNextAvailableClause(selectionInfo);
        },

        _selectNextAvailableClause: function(selectionInfo) {
          // Set the selection to the next clause visually below the selected contents.
          var clauseCount = this.clauseWidgetDataStore.data.length;
          if (clauseCount !== 0) {
            var indexToSelect = selectionInfo.startIndex;

            // If there isn't a clause below then select the last clause.
            if (indexToSelect >= clauseCount) {
              indexToSelect = clauseCount - 1;
            }

            var clauseWidgetToSelect = this.clauseWidgetDataStore.data[indexToSelect];
            this._selectAndScrollTo(clauseWidgetToSelect);
          }
        },

        _handleReplaceDataSource: function() {
          var selectionInfo = this._getSelectionInfo();
          if (selectionInfo.count !== 1) {
            return;
          }

          var selectedWidget = this.clauseWidgetDataStore.data[selectionInfo.startIndex];

          if (selectedWidget instanceof ConcatenationClauseWidget) {
            return;
          }

          selectedWidget.replaceDataSource(this.currentSelectedRasterSource);
        },

        _handleMoveClauseUp: function() {
          var selectionInfo = this._getSelectionInfo();
          if (selectionInfo.count !== 1) {
            return;
          }

          if (this.query.canMoveClauseUp(selectionInfo.startIndex) === false) {
            return;
          }

          this.query.moveClauseUp(selectionInfo.startIndex);
          this._swapClauseWidgets(selectionInfo.startIndex, selectionInfo.startIndex - 2);
        },

        _handleMoveClauseDown: function() {
          var selectionInfo = this._getSelectionInfo();
          if (selectionInfo.count !== 1) {
            return;
          }

          if (this.query.canMoveClauseDown(selectionInfo.startIndex) === false) {
            return;
          }

          this.query.moveClauseDown(selectionInfo.startIndex);
          this._swapClauseWidgets(selectionInfo.startIndex, selectionInfo.startIndex + 2);
        },

        _swapClauseWidgets: function(index1, index2) {
          // Workaround solution: manipulate data, re-index, re-query, then re-render.
          var tmp = this.clauseWidgetDataStore.data[index1];

          this.clauseWidgetDataStore.data[index1] =
            this.clauseWidgetDataStore.data[index2];

          this.clauseWidgetDataStore.data[index2] = tmp;

          this._rerenderClauseWidgetArray();
          this._selectAndScrollTo(tmp);

          if (index1 > index2) {
            tmp.domNode.scrollIntoView();
          }
          else {
            tmp.domNode.scrollIntoView(false);
          }

        },

        _rerenderClauseWidgetArray: function() {
          this.clauseWidgetDataStore.setData(this.clauseWidgetDataStore.data);
          this.results = this.clauseWidgetDataStore.query();
          this.selectableList.renderArray(this.results);
        },

        _handleGroupClauses: function() {
          var selectionInfo = this._getSelectionInfo();

          if (this.query.canGroupClauses(selectionInfo.startIndex, selectionInfo.count) === false) {
            return;
          }

          this.query.groupClauses(selectionInfo.startIndex, selectionInfo.count);

          var groupClause = this.query.clauses[selectionInfo.startIndex];
          var groupClauseWidget = new GroupClauseWidget({clause: groupClause});
          groupClauseWidget.startup();

          for(var rowId in this.selectableList.selection) {
            if (this.selectableList.selection.hasOwnProperty(rowId)) {
              this.clauseWidgetDataStore.remove(this.selectableList.row(rowId).data.id);
            }
          }

          // WORKAROUND: MemoryStore does not support the before property of put() option parameters
          // therefore, MemoryStore does not support insert operations.  As a workaround, this section
          // of the code is performing a manual insert by manipulating the MemoryStore data manually,
          // re-indexing, re-querying, then re-rendering the clause widgets.

          // This is what the code should look like if it worked...
          //var beforeWidget = this.clauseWidgetDataStore.data[selectionInfo.startIndex];
          //this.clauseWidgetDataStore.put(groupClauseWidget, {before:beforeWidget});

          // Workaround solution: manipulate data, re-index, re-query, then re-render.
          this.clauseWidgetDataStore.data.splice(selectionInfo.startIndex, 0, groupClauseWidget);
          this._rerenderClauseWidgetArray();
          this._selectAndScrollTo(groupClauseWidget);
        },

        _handleUngroupClauses: function() {
          var selectionInfo = this._getSelectionInfo();

          if (selectionInfo.count !== 1) {
            return;
          }

          if (this.query.canUngroupClauses(selectionInfo.startIndex) === false) {
            return;
          }

          var ungroupInfo = this.query.ungroupClauses(selectionInfo.startIndex);
          this._addUngroupedClausesToDisplay(ungroupInfo);
        },

        _addUngroupedClausesToDisplay: function(ungroupInfo) {
          // Remove the GroupClauseWidget from the display
          var groupClauseWidget = this.clauseWidgetDataStore.data[ungroupInfo.startIndex];
          this.clauseWidgetDataStore.remove(groupClauseWidget.id);

          // Add the group clause child clause widgets to the display
          var clauseWidget;
          for (var i = 0; i < groupClauseWidget.clause.clauses.length; i++) {
            clauseWidget = this._createClauseWidget(groupClauseWidget.clause.clauses[i]);
            clauseWidget.startup();

            this.clauseWidgetDataStore.data.splice(ungroupInfo.startIndex + i, 0, clauseWidget);
          }

          // Re-render the clause list because of insert operations
          this._rerenderClauseWidgetArray();

          // Select the last child clause that was un-grouped
          var selectionClauseIndex = ungroupInfo.startIndex + groupClauseWidget.clause.clauses.length - 1;
          this._selectAndScrollTo(this.clauseWidgetDataStore.data[selectionClauseIndex]);
        },

        _handleToggleWeighting: function() {
          this.query.toggleWeighting(!(this.query.useWeightings));
          var i;
          if (this.query.useWeightings === true) {
            domClass.add(this.showWeightingsNode, 'query-button-toggled-state');

            for (i = 0; i < this.results.length; i++) {
              this.results[i].enableWeightingMode();
            }
          }
          else {
            domClass.remove(this.showWeightingsNode, 'query-button-toggled-state');
            for (i = 0; i < this.results.length; i++) {
              this.results[i].disableWeightingMode();
            }
          }
        },

        _selectAndScrollTo: function(widget) {
          this.selectableList.clearSelection();
          this.selectableList.select(widget.domNode);
          this.selectableList.scrollTo({y: widget.domNode.offsetTop});
        },

        resize: function() {
          this.inherited(arguments);

          // Setting the display to none on the d-grid allows the height that is returned
          // by the container node to be un-effected by overflow in the d-grid due to resizing
          domStyle.set(this.selectableList.domNode, 'display', 'none');

          // Set the max-height of the d-grid to the container height so overflow can
          // happen correctly.
          var geometryInfo = domGeometry.position(this.containerNode, false);
          domStyle.set(this.selectableList.domNode, 'maxHeight', geometryInfo.h + 'px');

          // Restore the display property on the d-grid
          domStyle.set(this.selectableList.domNode, 'display', '');
        },

        setEnabled: function(isEnabled) {
          if (isEnabled) {
            this.selectableList.set('selectionMode', 'clauseList');
          }
          else {
            this.selectableList.set('selectionMode', 'none');
          }

          for (var i = 0; i < this.results.length; i++) {
            this.results[i].setEnabled(isEnabled);
          }

          this.isEnabled = isEnabled;
        },

        evaluate: function(inspectionResult) {
          clauseUtils.evaluateClauseWidgets(this.results, inspectionResult);
        },

        clearEvaluateState: function() {
          for (var i = 0; i < this.results.length; i++) {
            this.results[i].clearEvaluateState();
          }
        }
      }
    );
  }
);