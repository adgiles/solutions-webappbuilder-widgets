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
  './BaseDiscreteFactorStrategyWidget'
],
  function(array, declare, BaseDiscreteFactorStrategyWidget) {
    return declare(
      [BaseDiscreteFactorStrategyWidget],
      {
        _plotActionHandle: null,

        constructor: function(/* args */) {
          if (this._chart) {
            this._plotActionHandle = this._chart.connectToPlot(this._plotName, this, '_handlePlotAction');
          }
        },

        destroy: function() {
          this.inherited(arguments);

          if (this._plotActionHandle) {
            this._plotActionHandle.remove();
            this._plotActionHandle = null;
          }
        },

        setChart: function() {
          if (this._plotActionHandle) {
            this._plotActionHandle.remove();
            this._plotActionHandle = null;
          }

          this.inherited(arguments);

          if (this._chart) {
            this._plotActionHandle = this._chart.connectToPlot(this._plotName, this, '_handlePlotAction');
          }
        },

        _handlePlotAction: function(plotActionEventArgs) {
          if (plotActionEventArgs.type !== 'onclick') {
            return;
          }

          // Determine if this click action was a de-selection
          var discreteValue;
          for (var i = 0; i < this._factorStrategy.manualValues.length; i++) {
            discreteValue = this._factorStrategy.manualValues[i];
            if (discreteValue.factorValue.numericValue === plotActionEventArgs.x) {
              this._handleDeselection(i, plotActionEventArgs);
              return;
            }
          }

          this._handleSelection(plotActionEventArgs);
        },

        _handleSelection: function(plotActionEventArgs) {
          var discreteValue;
          for (var i = 0; i < this._factorStrategy.discreteValueCounts.length; i++) {
            discreteValue = this._factorStrategy.discreteValueCounts[i];
            if (discreteValue.factorValue.numericValue === plotActionEventArgs.x) {
              this._factorStrategy.manualValues.push(discreteValue);
              plotActionEventArgs.shape.setFill(this._selectedFill);
              this._onFactorStrategyWidgetChanged();
              return;
            }
          }
        },

        _handleDeselection: function(index, plotActionEventArgs) {
          this._factorStrategy.manualValues.splice(index, 1);
          var originalFill = plotActionEventArgs.run.fill;
          plotActionEventArgs.shape.setFill(originalFill);
          this._onFactorStrategyWidgetChanged();
        },

        _alterSeriesDataElement: function(seriesDataElement) {
          var discreteValue;
          for (var i = 0; i < this._factorStrategy.manualValues.length; i++) {
            discreteValue = this._factorStrategy.manualValues[i];
            if (discreteValue.factorValue.numericValue === seriesDataElement.x) {
              seriesDataElement.color = this._selectedFill;
              return;
            }
          }
        },

        _removeSeriesDataElementAlteration: function(seriesDataElement) {
          delete seriesDataElement.color;
        },

        _onFactorStrategyWidgetChanged: function() {
          this.emit('factor-strategy-widget-changed');
        }
      }
    );
  }
);

