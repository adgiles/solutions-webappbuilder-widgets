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
  'dojox/xml/parser',
  'exports',
  './AttributedBinaryClause',
  './BaseClause',
  './BinaryClause',
  './ClauseConstants',
  './ConcatenationClause',
  './UnitBinaryClause',
  './Utils',
  '../xml/Utils'
],
  function(array, declare, lang, parser, exports, AttributedBinaryClause, BaseClause, BinaryClause,
           ClauseConstants, ConcatenationClause, UnitBinaryClause, clauseUtils, xmlUtils) {

    /*
     * Declare a variable GroupClause so that the object can declare new instances of
     * itself within the module declaration.  This is used in the exported factory method
     * GroupClause.createGroupClause(args)
     * http://stackoverflow.com/questions/12661496/class-creation-with-dojo-1-8-declare
     */
    var GroupClause = declare(
      [BaseClause],
      {
        clauses: null,
        declaredClass: 'predictiveAnalysis.GroupClause',
        title: '',

        constructor: function() {
          this.clauseType = 'GroupClause';

          if (!(this.clauses)) {
            this.clauses = [];
          }

          if (!(this.title)) {
            this.title = '';
          }

          // Disable the weighting for the child clauses in a group
          array.forEach(this.clauses, function disableClauseWeighting(clause) {
            clause.useWeighting = false;
          });
        },

        fromJson: function(jsonObj) {
          if (!jsonObj) {
            return;
          }

          this.inherited(arguments);

          var deserializedClauses = [];
          var clause;
          array.forEach(this.clauses, lang.hitch(this, function deserializeClause(serializedClause) {
            clause = clauseUtils.createClauseFromJson(serializedClause);
            deserializedClauses.push(clause);
          }));

          this.clauses = deserializedClauses;
        },

        convertToXml: function() {
          var doc = parser.parse();
          var rootNode = doc.createElement('GroupClause');

          var titleNode = xmlUtils.createXmlNode(doc, 'Title', this.title.toString());
          var idNode = xmlUtils.createXmlNode(doc, 'Id', this.id.toString());
          var weightingNode = xmlUtils.createXmlNode(doc, 'Weighting', this.weighting.toString());
          var useWeightingNode = xmlUtils.createXmlNode(doc, 'UseWeighting', this.useWeighting.toString());
          var groupedClausesNode = this._createGroupedClausesNode(doc);

          var childNodes = [titleNode, idNode, weightingNode, useWeightingNode, groupedClausesNode];

          parser.replaceChildren(rootNode, childNodes);

          return rootNode;
        },

        _createGroupedClausesNode: function(doc) {
          var serializedClausesList = [];

          array.forEach(this.clauses, function serializeClause(clause) {
            var serializedClause = clause.convertToXml();
            serializedClausesList.push(serializedClause);
          });

          var groupedClausesNode = doc.createElement('GroupedClauses');
          groupedClausesNode.setAttribute('count', serializedClausesList.length);
          parser.replaceChildren(groupedClausesNode, serializedClausesList);

          return groupedClausesNode;
        },

        evaluate: function(inspectionResult) {
          var result = clauseUtils.evaluate(inspectionResult, this.clauses);

          if (typeof result !== 'number') {
            this.evaluateState = ClauseConstants.evaluateStateTypes.Indeterminate;
          }
          else if (result) {
            this.evaluateState = ClauseConstants.evaluateStateTypes.Passed;

            if (this.useWeighting) {
              result = result * this.weighting;
            }
          }
          else {
            this.evaluateState = ClauseConstants.evaluateStateTypes.Failed;
          }

          return result;
        }
      }
    );

    exports.GroupClause = GroupClause;

    return GroupClause;
  }
);
