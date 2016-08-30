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
  'dojo/dom-attr',
  'dojo/dom-class',
  'dojo/dom-construct',
  'dojo/store/Observable',
  'dojo/store/Memory',
  'dojo/text!./template/GroupClauseWidgetTemplate.html',
  'dojo/topic',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  './AttributedBinaryClause',
  './AttributedBinaryClauseWidget',
  './BinaryClause',
  './BinaryClauseWidget',
  './ClauseConstants',
  './ClauseListWidget',
  './ConcatenationClause',
  './ConcatenationClauseWidget',
  './GroupClause',
  './UnitBinaryClause',
  './UnitBinaryClauseWidget',
  './Utils'
],
  function(array, declare, lang, domAttr, domClass, domConstruct, Observable, Memory, template, topic,
           _TemplatedMixin, _WidgetBase, AttributedBinaryClause, AttributedBinaryClauseWidget, BinaryClause,
           BinaryClauseWidget, ClauseConstants, ClauseListWidget, ConcatenationClause, ConcatenationClauseWidget,
           GroupClause, UnitBinaryClause, UnitBinaryClauseWidget, clauseUtils) {
    // Declare a variable GroupClauseWidget so that the widget can declare new instances of
    // itself within the module declaration
    // http://stackoverflow.com/questions/12661496/class-creation-with-dojo-1-8-declare
    var GroupClauseWidget;
    GroupClauseWidget = declare(
      [_WidgetBase, _TemplatedMixin],
      {
        clause: null,
        clauseTitleNode: null,
        clauseWidgetDataStore: null,
        groupClauseHeaderNode: null,
        groupClausesNode: null,
        isEnabled: true,
        selectableList: null,
        templateString: template,
        weightingNode: null,

        constructor: function(args) {
          if (args) {
            declare.safeMixin(this, args);
          }

          if (!(this.clause)) {
            throw new Error('GroupClauseWidget must contain a valid clause object');
          }

          var memoryArgs = {data: args.clauseWidgetList, idProperty: 'id'};
          this.clauseWidgetDataStore = new Observable(new Memory(memoryArgs));
        },

        postCreate: function() {
          this.inherited(arguments);

          this.selectableList = new ClauseListWidget({cleanEmptyObservers: false});
          domConstruct.place(this.selectableList.domNode, this.groupClausesNode, 'last');

          topic.publish('registerSelectionManagement/topic', this.selectableList);

          if (this.clause.title !== '' && this.clause.title !== undefined) {
            this.clauseTitleNode.value = this.clause.title;
            this.clauseTitleNode.title = this.clause.title;
          }

          var results = this.clauseWidgetDataStore.query();
          if (results.length === 0 && this.clause.clauses.length > 0) {
            this._generateClauseView();
          }

          this._initWeightingContent();
          this.setEnabled(this.isEnabled);
        },

        startup: function() {
          this.selectableList.startup();
          this.inherited(arguments);

          var results = this.clauseWidgetDataStore.query();
          this.selectableList.renderArray(results);
        },

        destroy: function() {
          topic.publish('unRegisterSelectionManagement/topic', this.selectableList);
          this.inherited(arguments);
        },

        _initWeightingContent: function() {
          this.weightingNode.value = this.clause.weighting;
          this.weightingNode.title = this.clause.weighting;

          if (this.clause.useWeighting) {
            this.enableWeightingMode();
          }
        },

        _createClauseWidget: function(clause) {
          if (!clause) {
            console.log('Invalid clause object, cannot create clause widget.');
            return null;
          }
          else if (clause.declaredClass === AttributedBinaryClause.prototype.declaredClass) {
            return new AttributedBinaryClauseWidget({clause: clause});
          }
          else if (clause.declaredClass === ConcatenationClause.prototype.declaredClass) {
            return new ConcatenationClauseWidget({clause: clause});
          }
          else if (clause.declaredClass === UnitBinaryClause.prototype.declaredClass) {
            return new UnitBinaryClauseWidget({clause: clause});
          }
          else if (clause.declaredClass === BinaryClause.prototype.declaredClass) {
            return new BinaryClauseWidget({clause: clause});
          }
          else if (clause.declaredClass === GroupClause.prototype.declaredClass) {
            return new GroupClauseWidget({clause: clause});
          }
          else {
            console.log('The clause type is not recognized.', Object.prototype.toString.call(clause));
            return null;
          }
        },

        _generateClauseView: function() {
          array.forEach(this.clause.clauses, lang.hitch(this, this._addClauseWidgetToDataStore));
        },

        _addClauseWidgetToDataStore: function(clause) {
          var newClauseWidget = this._createClauseWidget(clause);

          if (newClauseWidget !== null) {
            newClauseWidget.startup();
            newClauseWidget.disableWeightingMode();
            this.clauseWidgetDataStore.put(newClauseWidget);
          }
        },

        _handleChildClauseVisibilityToggle: function() {
          if (domClass.contains(this.groupClausesNode, 'child-clause-content-collapsed')) {
            domClass.remove(this.groupClausesNode, 'child-clause-content-collapsed');
          }
          else {
            domClass.add(this.groupClausesNode, 'child-clause-content-collapsed');
          }
        },

        _handleWeightingChanged: function(evt) {
          this.clause.weighting = evt.target.value;
          this.weightingNode.title = evt.target.value;
        },

        _handleGroupClauseTitleInput: function(evt) {
          this.clause.title = this.clauseTitleNode.value;
          this.clauseTitleNode.title = this.clause.title;
        },

        enableWeightingMode: function() {
          domClass.add(this.clauseTitleNode, 'weighted-name-content');
          domClass.add(this.clauseTitleNode, 'weighted-title-content');
          domClass.replace(this.weightingNode, 'weighted-clause-input', 'non-weighted-clause-input');
        },

        disableWeightingMode: function() {
          domClass.remove(this.clauseTitleNode, 'weighted-name-content');
          domClass.remove(this.clauseTitleNode, 'weighted-title-content');
          domClass.replace(this.weightingNode, 'non-weighted-clause-input', 'weighted-clause-input');
        },

        setEnabled: function(isEnabled) {
          if (isEnabled) {
            domAttr.remove(this.clauseTitleNode, 'disabled');
            domAttr.remove(this.weightingNode, 'disabled');
            this.selectableList.set('selectionMode', 'clauseList');
          }
          else {
            domAttr.set(this.clauseTitleNode, 'disabled', 'true');
            domAttr.set(this.weightingNode, 'disabled', 'true');
            this.selectableList.set('selectionMode', 'none');
          }

          var results = this.clauseWidgetDataStore.query();
          for (var i = 0; i < results.length; i++) {
            results[i].setEnabled(isEnabled);
          }

          this.isEnabled = isEnabled;
        },

        evaluate: function(queryInspectionResult) {
          this.clearEvaluateState();

          var result = this.clause.evaluate(queryInspectionResult);
          clauseUtils.evaluateClauseWidgets(this.clauseWidgetDataStore.query(), queryInspectionResult);

          switch(this.clause.evaluateState) {
            case ClauseConstants.evaluateStateTypes.Indeterminate:
              domClass.add(this.groupClauseHeaderNode, 'clause-evaluate-indeterminate');
              domClass.add(this.groupClausesNode, 'clause-evaluate-indeterminate');
              break;
            case ClauseConstants.evaluateStateTypes.Passed:
              domClass.add(this.groupClauseHeaderNode, 'clause-evaluate-passed');
              domClass.add(this.groupClausesNode, 'clause-evaluate-passed');
              break;
            case ClauseConstants.evaluateStateTypes.Failed:
              domClass.add(this.groupClauseHeaderNode, 'clause-evaluate-failed');
              domClass.add(this.groupClausesNode, 'clause-evaluate-failed');
              break;
            default:
              break;
          }

          return result;
        },

        clearEvaluateState: function() {
          this.clause.evaluateState = ClauseConstants.evaluateStateTypes.None;
          domClass.remove(this.groupClauseHeaderNode, 'clause-evaluate-indeterminate');
          domClass.remove(this.groupClauseHeaderNode, 'clause-evaluate-passed');
          domClass.remove(this.groupClauseHeaderNode, 'clause-evaluate-failed');

          domClass.remove(this.groupClausesNode, 'clause-evaluate-indeterminate');
          domClass.remove(this.groupClausesNode, 'clause-evaluate-passed');
          domClass.remove(this.groupClausesNode, 'clause-evaluate-failed');

          var clauseWidgets = this.clauseWidgetDataStore.query();
          for (var i = 0; i < clauseWidgets.length; i++) {
            clauseWidgets[i].clearEvaluateState();
          }
        }
      }
    );

    return GroupClauseWidget;
  }
);