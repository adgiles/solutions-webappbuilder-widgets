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
  '../BaseFactorStrategy',
  '../../../../base/json/Utils',
  '../../../../base/operator/Utils',
  '../../../../base/Utils'
],
  function(declare, BaseFactorStrategy, jsonUtils, operatorUtils, baseUtils) {
    return declare(
      [BaseFactorStrategy],
      {
        __type: 'ClusterFactorStrategy',
        clusters: null,
        clusterStrategy: null,
        clusterStrategyEnum: {
          'Low': 0,
          'Medium': 1,
          'High': 2
        },
        highClusters: null,
        lowClusters: null,
        mediumClusters: null,
        studyAreaMax: null,
        studyAreaMin: null,

        constructor: function(/* args */) {
          this.strategyName = 'Clusters';
          this.clusters = [];
        },

        fromServerJson: function(serverJson) {
          this.inherited(arguments);

          jsonUtils.convertUppercasePropertiesToLowercase(this.highClusters, true);
          jsonUtils.convertUppercasePropertiesToLowercase(this.mediumClusters, true);
          jsonUtils.convertUppercasePropertiesToLowercase(this.lowClusters, true);

          this.setClusterStrategy(this.clusterStrategy);
        },

        getStrategyResultProperties: function() {
          var properties = [
            {property: 'Study Area Min Value', value: this.studyAreaMin},
            {property: 'Study Area Max Value', value: this.studyAreaMax},
            {
              property: 'Cluster Strategy Type',
              value: baseUtils.getKeyByValue(this.clusterStrategyEnum, this.clusterStrategy)
            }
          ];

          switch (this.clusterStrategy) {
            case this.clusterStrategyEnum.Low:
              this._addClusterResultProperties(properties, this.lowClusters);
              break;
            case this.clusterStrategyEnum.Medium:
              this._addClusterResultProperties(properties, this.mediumClusters);
              break;
            case this.clusterStrategyEnum.High:
              this._addClusterResultProperties(properties, this.highClusters);
              break;
            default:
              break;
          }

          return properties;
        },

        _addClusterResultProperties: function(properties, clusters) {
          properties.push({property: 'Min Cluster Size', value: clusters.minValues});
          properties.push({property: 'Min Cluster Value Range', value: clusters.regionQualifier});
          properties.push({property: '# Clusters', value: clusters.results.length});
        },

        setClusterStrategy: function(clusterStrategy) {
          switch (clusterStrategy) {
            case this.clusterStrategyEnum.Low:
              this._setClusterStrategy(clusterStrategy, this.lowClusters);
              break;
            case this.clusterStrategyEnum.Medium:
              this._setClusterStrategy(clusterStrategy, this.mediumClusters);
              break;
            case this.clusterStrategyEnum.High:
              this._setClusterStrategy(clusterStrategy, this.highClusters);
              break;
            default:
              return;
          }
        },

        _setClusterStrategy: function(clusterStrategy, clustersToAdd) {
          this.clusterStrategy = clusterStrategy;
          this.clusters.length = 0;
          this.clusters.push.apply(this.clusters, clustersToAdd.results);
        },

        convertToClause: function() {
          var groupClauses = [];

          for (var i = 0; i < this.clusters.length; i++) {
            var groupClause = this._createGroupClauseFromRange(
              this.clusters[i].clusterMin,
              this.clusters[i].clusterMax,
              baseUtils.getKeyByValue(this.clusterStrategyEnum, this.clusterStrategy) + ' Cluster ' + (i + 1));

            groupClauses.push(groupClause);
          }

          var aggregateGroupClause = this._createGroupClauseFromClauses(groupClauses, operatorUtils.orOperator);
          if (aggregateGroupClause) {
            aggregateGroupClause.title = aggregateGroupClause.title +
              '(' + baseUtils.getKeyByValue(this.clusterStrategyEnum, this.clusterStrategy) + ')';
          }

          return aggregateGroupClause;
        }
      }
    );
  }
);
