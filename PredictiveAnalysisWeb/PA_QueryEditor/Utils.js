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
  'dojo/json',
  './lib/js/base/clauses/BaseClause',
  './lib/js/base/query/Query',
  './lib/js/base/rasterSources/BaseRasterSource'
],
  function(array, declare, lang, json, BaseClause, Query, BaseRasterSource) {
    var Utils = declare(null,
      {
        deserializeQuery: function(jsonQueryStr) {
          if (!jsonQueryStr) {
            return null;
          }

          // Deserialize the Query object
          var queryJsonObj = json.parse(jsonQueryStr);
          var query = new Query();
          query.fromJson(queryJsonObj);

          // Validate the clause list
          array.forEach(query.clauses, lang.hitch(this, function isClauseValid(clause, i) {
            if (!(clause instanceof BaseClause)) {
              console.error('Deserialized clause is not valid', i, clause);
              return null;
            }

            if (clause.rasterSource) {
              if (!(clause.rasterSource instanceof BaseRasterSource)) {
                console.error('Deserialized clause rastersource is not valid', i, clause.rasterSource);
                return null;
              }
            }
          }));

          return query;
        }
      }
    );

    return new Utils();
  }
);
