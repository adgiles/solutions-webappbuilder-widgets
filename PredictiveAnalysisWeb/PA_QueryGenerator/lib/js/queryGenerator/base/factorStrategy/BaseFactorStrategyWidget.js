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
  'dojo/Evented',
  'dojo/on',
  'dijit/_WidgetBase'
],
  function(declare, Evented, on, _WidgetBase) {
    return declare(
      [_WidgetBase, Evented],
      {
        _chart: null,
        _factorStrategy: null,
        _plotName: null,

        constructor: function(args) {
          if ((args.chart)) { //optional
            this._chart = args.chart;
          }

          if ((args.plotName)) { //optional
            this._plotName = args.plotName;
          }

          if (!(args.factorStrategy)) {
            throw new Error('BaseFactorStrategyWidget requires a factorStrategy argument');
          }
          this._factorStrategy = args.factorStrategy;

        },

        startup: function() {
          this.inherited(arguments);

          if (this._chart && this._plotName) {
            this._initializeFactorStrategyChartDisplay();
            this._updateFactorStrategyChartDisplay();
          }
        },

        destroy: function() {
          this.inherited(arguments);

          if (this._chart && this._plotName) {
            this._removeFactorStrategyChartDisplay();
          }
        },

        setChart: function(chart, plotName) {
          if ((chart && !(plotName)) || (!(chart) && plotName)) {
            throw new Error('setChart() requires that both chart and plotName be either set or un-set');
          }

          // If a current chart exists them remove the strategy from the chart
          if (this._chart && this._plotName) {
            this._removeFactorStrategyChartDisplay();
          }

          this._chart = chart;
          this._plotName = plotName;

          // If a new chart exists them update the strategy contents on the chart
          if (this._chart && this._plotName) {
            this._initializeFactorStrategyChartDisplay();
            this._updateFactorStrategyChartDisplay();
          }
        },

        _initializeFactorStrategyChartDisplay: function() {
          // overridden in derived classes
        },

        _updateFactorStrategyChartDisplay: function() {
          // overridden in derived classes
          this._chart.render();
        },

        _removeFactorStrategyChartDisplay: function() {
          // overridden in derived classes
          this._chart.render();
        },

        _onFactorStrategyWidgetChanged: function() {
          if (this._chart) {
            this._updateFactorStrategyChartDisplay();
          }

          this.emit('factor-strategy-widget-changed');
        }
      }
    );
  }
);

