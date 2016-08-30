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
  './continuousStrategy/ClusterFactorStrategy',
  './continuousStrategy/ClusterFactorStrategyWidget',
  './continuousStrategy/ManualRangeFactorStrategy',
  './continuousStrategy/ManualRangeFactorStrategyWidget',
  './continuousStrategy/MinMaxFactorStrategy',
  './continuousStrategy/MinMaxFactorStrategyWidget',
  './continuousStrategy/QuartileFactorStrategy',
  './continuousStrategy/QuartileFactorStrategyWidget',
  './continuousStrategy/StandardDeviationFactorStrategy',
  './continuousStrategy/StandardDeviationFactorStrategyWidget',
  './discreteStrategy/AllValuesFactorStrategy',
  './discreteStrategy/AllValuesFactorStrategyWidget',
  './discreteStrategy/DiscreteClusterValuesFactorStrategy',
  './discreteStrategy/DiscreteClusterValuesFactorStrategyWidget',
  './discreteStrategy/ManualDiscreteFactorStrategy',
  './discreteStrategy/ManualDiscreteFactorStrategyWidget',
  './discreteStrategy/MostCommonValueFactorStrategy',
  './discreteStrategy/MostCommonValueFactorStrategyWidget'
],
  function(declare, ClusterFactorStrategy, ClusterFactorStrategyWidget, ManualRangeFactorStrategy,
           ManualRangeFactorStrategyWidget, MinMaxFactorStrategy, MinMaxFactorStrategyWidget, QuartileFactorStrategy,
           QuartileFactorStrategyWidget, StandardDeviationFactorStrategy, StandardDeviationFactorStrategyWidget,
           AllValuesFactorStrategy, AllValuesFactorStrategyWidget, DiscreteClusterValuesFactorStrategy,
           DiscreteClusterValuesFactorStrategyWidget, ManualDiscreteFactorStrategy, ManualDiscreteFactorStrategyWidget,
           MostCommonValueFactorStrategy, MostCommonValueFactorStrategyWidget) {
    var Utils = declare(
      null,
      {
        createFactorStrategyFromServerJson: function(serverJson) {
          if (!serverJson || !(serverJson.__type)) {
            return null;
          }

          var factorStrategy;
          switch (serverJson.__type) {
            case ClusterFactorStrategy.prototype.__type:
              factorStrategy = new ClusterFactorStrategy();
              break;
            case ManualRangeFactorStrategy.prototype.__type:
              factorStrategy = new ManualRangeFactorStrategy();
              break;
            case MinMaxFactorStrategy.prototype.__type:
              factorStrategy = new MinMaxFactorStrategy();
              break;
            case QuartileFactorStrategy.prototype.__type:
              factorStrategy = new QuartileFactorStrategy();
              break;
            case StandardDeviationFactorStrategy.prototype.__type:
              factorStrategy = new StandardDeviationFactorStrategy();
              break;
            case AllValuesFactorStrategy.prototype.__type:
              factorStrategy = new AllValuesFactorStrategy();
              break;
            case DiscreteClusterValuesFactorStrategy.prototype.__type:
              factorStrategy = new DiscreteClusterValuesFactorStrategy();
              break;
            case ManualDiscreteFactorStrategy.prototype.__type:
              factorStrategy = new ManualDiscreteFactorStrategy();
              break;
            case MostCommonValueFactorStrategy.prototype.__type:
              factorStrategy = new MostCommonValueFactorStrategy();
              break;
            default:
              return null;
          }

          factorStrategy.fromServerJson(serverJson);
          return factorStrategy;
        },

        createFactorStrategyWidget: function(factorStrategy, chart, plotName) {
          if (!factorStrategy) {
            return null;
          }

          var args = {factorStrategy: factorStrategy, chart: chart, plotName: plotName};
          switch (factorStrategy.__type) {
            case ClusterFactorStrategy.prototype.__type:
              return new ClusterFactorStrategyWidget(args);
            case ManualRangeFactorStrategy.prototype.__type:
              return new ManualRangeFactorStrategyWidget(args);
            case MinMaxFactorStrategy.prototype.__type:
              return new MinMaxFactorStrategyWidget(args);
            case QuartileFactorStrategy.prototype.__type:
              return new QuartileFactorStrategyWidget(args);
            case StandardDeviationFactorStrategy.prototype.__type:
              return new StandardDeviationFactorStrategyWidget(args);
            case AllValuesFactorStrategy.prototype.__type:
              return new AllValuesFactorStrategyWidget(args);
            case DiscreteClusterValuesFactorStrategy.prototype.__type:
              return new DiscreteClusterValuesFactorStrategyWidget(args);
            case ManualDiscreteFactorStrategy.prototype.__type:
              return new ManualDiscreteFactorStrategyWidget(args);
            case MostCommonValueFactorStrategy.prototype.__type:
              return new MostCommonValueFactorStrategyWidget(args);
            default:
              return null;
          }
        }
      }
    );

    return new Utils();
  }
);
