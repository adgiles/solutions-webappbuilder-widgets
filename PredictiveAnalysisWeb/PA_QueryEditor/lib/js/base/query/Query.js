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
  'dojox/xml/parser',
  '../clauses/Utils',
  '../clauses/ConcatenationClause',
  '../clauses/GroupClause',
  '../operator/Utils',
  '../xml/Utils'
],
  function(array, declare, parser, clauseUtils, ConcatenationClause, GroupClause, operatorUtils, xmlUtils) {
    return declare(
      null,
      {
        author: '',
        clauses: null,
        creationDate: null,
        description: '',
        declaredClass: 'predictiveAnalysis.Query',
        modifyDate: null,
        title: '',
        useWeightings: false,
        useRelativePaths: false,
        version: '',

        constructor: function(args) {
          this.version = '1.4.0';
          this.title = 'Query';
          this.author = '';
          this.description = '';
          this.creationDate = new Date();
          this.modifyDate = new Date();
          this.useWeightings = false;
          this.useRelativePaths = false;
          this.clauses = [];

          if (args) {
            declare.safeMixin(this, args);
          }
        },

        fromJson: function(jsonObj) {
          if (!jsonObj) {
            return;
          }

          declare.safeMixin(this, jsonObj);

          // Deserialize the json clauses
          this.clauses = clauseUtils.createClausesFromJson(this.clauses);

          // Convert the date strings to date objects
          this.creationDate = new Date(this.creationDate);
          this.modifyDate = new Date(this.modifyDate);
        },

        convertToXml: function() {
          var doc = parser.parse();
          var rootNode = doc.createElement('Query');

          var xmlQueryDocumentPropertiesArr = this._serializeQueryDocumentPropertiesToXml(doc);
          var clausesNode = this._serializeClauseListToXml(doc);

          xmlQueryDocumentPropertiesArr.push(clausesNode);

          parser.replaceChildren(rootNode, xmlQueryDocumentPropertiesArr);

          return rootNode;
        },

        convertToXmlStr: function() {
          var xml = this.convertToXml();
          return parser.innerXML(xml);
        },

        _serializeQueryDocumentPropertiesToXml: function(doc) {
          var versionNode = xmlUtils.createXmlNode(doc, 'Version', this.version);
          var titleNode = xmlUtils.createXmlNode(doc, 'Title', this.title);
          var authorNode = xmlUtils.createXmlNode(doc, 'Author', this.author);
          var descriptionNode = xmlUtils.createXmlNode(doc, 'Description', this.description);

          var creationDateStr = this.creationDate.getMonth() + 1 + '/' + this.creationDate.getDate() + '/' +
            this.creationDate.getFullYear();
          var creationDateNode = xmlUtils.createXmlNode(doc, 'CreationDate', creationDateStr);

          var modifyDateStr = this.modifyDate.getMonth() + 1 + '/' + this.modifyDate.getDate() + '/' +
            this.modifyDate.getFullYear();
          var modifyDateNode = xmlUtils.createXmlNode(doc, 'ModifyDate', modifyDateStr);

          var useWeightingsNode = xmlUtils.createXmlNode(doc, 'UseWeightings', this.useWeightings.toString());
          var useRelativePathsNode = xmlUtils.createXmlNode(doc, 'UseRelativePaths', this.useRelativePaths.toString());

          return [versionNode, titleNode, authorNode, descriptionNode, creationDateNode, modifyDateNode,
            useWeightingsNode, useRelativePathsNode];
        },

        _serializeClauseListToXml: function(doc) {
          var clausesNode = doc.createElement('Clauses');
          clausesNode.setAttribute('count', this.clauses.length);

          var clauseXmlArr = [];
          for (var i = 0; i < this.clauses.length; i = i + 1) {
            clauseXmlArr.push(this.clauses[i].convertToXml());
          }

          parser.replaceChildren(clausesNode, clauseXmlArr);

          return clausesNode;
        },

        addClause: function(rasterSource) {
          var newClause = clauseUtils.createBinaryClause(rasterSource);
          if (!newClause) {
            return -1;
          }

          if (this.clauses.length > 0) {
            var linkClause = new ConcatenationClause({operation: operatorUtils.andOperator});
            linkClause.useWeighting = this.useWeightings;
            this.clauses.push(linkClause);
          }

          newClause.useWeighting = this.useWeightings;
          return this.clauses.push(newClause);
        },

        toggleWeighting: function(weightingToggle) {
          if (typeof weightingToggle !== 'boolean') {
            return;
          }

          this.useWeightings = weightingToggle;

          for (var i = 0; i < this.clauses.length; i++) {
            this.clauses[i].useWeighting = weightingToggle;
          }
        },

        canRemoveClauses: function(startIndex, count) {
          if (typeof startIndex !== 'number' || typeof count !== 'number') {
            return false;
          }

          // The start index is out of range.
          if (startIndex < 0 || startIndex >= this.clauses.length) {
            return false;
          }

          // The number of clauses to remove is out of range.
          if (count < 1 || startIndex + count > this.clauses.length) {
            return false;
          }

          var firstClause = this.clauses[startIndex];
          var lastClause = this.clauses[startIndex + count - 1];

          // This case means deleting this group of clauses would produce a
          // malformed expression.
          if (firstClause instanceof ConcatenationClause &&
            lastClause instanceof ConcatenationClause) {
            return false;
          }

          return true;
        },

        /*
         * Since the query object currently creates concatenation clauses internally
         * it will automatically remove a dangling concatenation if one is detected.
         * This method returns an object indicating the actual start index and count
         * of the number of clauses deleted.
         */
        removeClauses: function(startIndex, count) {
          if (!(this.canRemoveClauses(startIndex, count))) {
            return {startIndex: -1, count: 0};
          }

          var firstClause = this.clauses[startIndex];
          var lastClause = this.clauses[startIndex + count - 1];
          var actualStartIndex = startIndex;
          var actualCount = count;

          if (!(firstClause instanceof ConcatenationClause) &&
            !(lastClause instanceof ConcatenationClause) &&
            count !== this.clauses.length) {

            actualCount++;

            // Prefer to remove the concatenation clause below the selection.
            // If there isn't a concatenation clause below the selection take
            // the concatenation clause above the selection.
            if ((startIndex + count) === this.clauses.length) {
              actualStartIndex--;
            }
          }

          this.clauses.splice(actualStartIndex, actualCount);
          return {startIndex: actualStartIndex, count: actualCount};
        },

        canMoveClauseUp: function(index) {
          if (typeof index !== 'number') {
            return false;
          }

          if (index <= 0 || index >= this.clauses.length) {
            return false;
          }

          if (this.clauses[index] instanceof ConcatenationClause) {
            return false;
          }

          return true;
        },

        moveClauseUp: function(index) {
          if (!(this.canMoveClauseUp(index))) {
            return -1;
          }

          var tmp = this.clauses[index];
          var newIndex = index - 2;
          this.clauses[index] = this.clauses[newIndex];
          this.clauses[newIndex] = tmp;

          return newIndex;
        },

        canMoveClauseDown: function(index) {
          if (typeof index !== 'number') {
            return false;
          }

          if (index < 0 || index >= this.clauses.length - 1) {
            return false;
          }

          if (this.clauses[index] instanceof ConcatenationClause) {
            return false;
          }

          return true;
        },

        moveClauseDown: function(index) {
          if (!(this.canMoveClauseDown(index))) {
            return -1;
          }

          var tmp = this.clauses[index];
          var newIndex = index + 2;
          this.clauses[index] = this.clauses[newIndex];
          this.clauses[newIndex] = tmp;

          return newIndex;
        },

        canGroupClauses: function(startIndex, count) {
          if (typeof startIndex !== 'number' || typeof count !== 'number') {
            return false;
          }

          if (count < 1 || startIndex < 0 || (startIndex + count > this.clauses.length)) {
            return false;
          }

          var firstClause = this.clauses[startIndex];
          var lastClause = this.clauses[startIndex + count - 1];

          if (firstClause instanceof ConcatenationClause || lastClause instanceof ConcatenationClause) {
            return false;
          }

          return true;
        },

        groupClauses: function(startIndex, count) {
          if (!(this.canGroupClauses(startIndex, count))) {
            return -1;
          }

          var clauses = this.clauses.splice(startIndex, count);

          var groupClause = new GroupClause({clauses: clauses});
          groupClause.useWeighting = this.useWeightings;

          this.clauses.splice(startIndex, 0, groupClause);
          return startIndex;
        },

        canUngroupClauses: function(groupClauseIndex) {
          if (typeof groupClauseIndex !== 'number') {
            return false;
          }

          if (groupClauseIndex < 0 || (groupClauseIndex > this.clauses.length - 1)) {
            return false;
          }

          var groupClause = this.clauses[groupClauseIndex];
          if (!(groupClause instanceof GroupClause)) {
            return false;
          }

          return true;
        },

        ungroupClauses: function(groupClauseIndex) {
          if (!(this.canUngroupClauses(groupClauseIndex))) {
            return {startIndex: -1, count: 0};
          }

          var groupClause = this.clauses.splice(groupClauseIndex, 1)[0];

          for (var i = 0; i < groupClause.clauses.length; i++) {
            if (this.useWeightings === true) {
              groupClause.clauses[i].useWeighting = this.useWeightings;
            }
            this.clauses.splice(groupClauseIndex + i, 0, groupClause.clauses[i]);
          }

          return {startIndex: groupClauseIndex, count: groupClause.clauses.length};
        },

        getDistinctRasterSources: function() {
          var rasterSources = {};
          this._addRasterSourcesToList(this.clauses, rasterSources);

          // Object.keys only supported in IE 9 and later
          return Object.keys(rasterSources).map(function(key) { return rasterSources[key]; });
        },

        _addRasterSourcesToList: function(clauses, rasterSources) {
          var currentDataSource;
          var dataSourceIndex;

          for (var i = 0; i < clauses.length; i++) {
            if (clauses[i].declaredClass === GroupClause.prototype.declaredClass) {
              this._addRasterSourcesToList(clauses[i].clauses, rasterSources);
            }
            else {
              currentDataSource = clauses[i].rasterSource;

              if (currentDataSource && !(rasterSources[currentDataSource.sourceUrl])) {
                rasterSources[currentDataSource.sourceUrl] = currentDataSource;
              }
            }
          }
        },

        evaluate: function(inspectionResult) {
          return clauseUtils.evaluate(inspectionResult, this.clauses);
        }
      });
  });