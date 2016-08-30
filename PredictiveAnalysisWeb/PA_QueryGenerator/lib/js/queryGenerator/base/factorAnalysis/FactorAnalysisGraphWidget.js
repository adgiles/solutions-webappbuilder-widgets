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
  'dojo/_base/lang',
  'dojo/dom-construct',
  'dojo/dom-geometry',
  'dojo/dom-style',
  'dojo/on',
  'dojo/text!./templates/FactorAnalysisGraphWidgetTemplate.html',
  'dojox/charting/action2d/Tooltip',
  'dojox/charting/axis2d/Default',
  'dojox/charting/Chart',
  'dojox/charting/plot2d/Areas',
  'dojox/charting/plot2d/Columns',
  'dojox/charting/SimpleTheme',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  './ContinuousFactorAnalysis',
  './DiscreteFactorAnalysis'
],
  function(declare, lang, domConstruct, domGeometry, domStyle, on, template, Tooltip, Axis, Chart, Areas, Columns,
           SimpleTheme, _TemplatedMixin, _WidgetBase, ContinuousFactorAnalysis, DiscreteFactorAnalysis) {
    return declare(
      [_WidgetBase, _TemplatedMixin],
      {

        // This is a custom axis that only draws the min and max value using the major axis
        customAxis: declare([Axis], {
          calculate: function(min, max, span, labels) {
            this.inherited(arguments);

            if (min === Number.POSITIVE_INFINITY || min === Number.NEGATIVE_INFINITY) {
              return this;
            }

            if (max === Number.POSITIVE_INFINITY || max === Number.NEGATIVE_INFINITY) {
              return this;
            }

            if (this.ticks && this.ticks.major) {
              this.ticks.major = [];

              if (this.opt && typeof this.opt.min === 'number') {
                this.ticks.major.push(this._generateCustomTick(this.opt.min));
              }
              else {
                this.ticks.major.push(this._generateCustomTick(min));
              }

              if (this.opt && typeof this.opt.max === 'number') {
                this.ticks.major.push(this._generateCustomTick(this.opt.max));
              }
              else {
                this.ticks.major.push(this._generateCustomTick(max));
              }
            }

            return this;
          },

          _generateCustomTick: function(val) {
            var label = val.toString();
            if (val % 1 !== 0) {
              label = val.toFixed(3);
            }

            return {value: val, label: label};
          }
        }),

        _chart: null,
        _chartNode: null,
        _chartTooltip: null,
        _currentFactorStrategyWidgetNode: null,
        _factorAnalysisStrategyWidget: null,
        _factorAnalysisWidget: null,
        _factorAnalysisWidgetEventHandle: null,
        _zoomAction: null,
        templateString: template,

        postCreate: function() {
          var chartTheme = new SimpleTheme({
            chart: {fill: 'transparent'},
            plotarea: {fill: 'transparent'}
          });

          this._chart = new Chart(this._chartNode);
          this._chart.setTheme(chartTheme);

          this._chart.addAxis('x', {
            minorLabels: false,
            minorTicks: false,
            type: this.customAxis
          });

          this._chart.addAxis('y', {
            min: 0,
            minorLabels: false,
            minorTicks: false,
            type: this.customAxis,
            vertical: true
          });

          this._initContinuousFactorAnalysisChartElements();
          this._initDiscreteFactorAnalysisChartElements();

        },

        destroy: function() {
          this.inherited(arguments);

          if (this._factorAnalysisWidgetEventHandle) {
            this._factorAnalysisWidgetEventHandle.remove();
          }
        },

        resize: function() {
          domStyle.set(this._chartNode, 'display', 'none');

          var geometryInfo = domGeometry.position(this._chartNode.parentNode, false);

          domStyle.set(this._chartNode, 'display', '');

          this._chart.resize(geometryInfo.w, geometryInfo.h);
        },

        setFactorAnalysisWidget: function(factorAnalysisWidget) {

          // If there was a previous FactorAnalysisWidget set then clear
          if (this._factorAnalysisWidget) {
            this._clearPreviousFactorAnalysisWidget();
          }

          this._factorAnalysisWidget = factorAnalysisWidget;

          // If there is a new Factor Analysis widget then initialize
          if (this._factorAnalysisWidget) {
            this._setFactorAnalysisWidget();
          }
        },

        _setFactorAnalysisWidget: function() {
          this._factorAnalysisWidgetEventHandle = on(
            this._factorAnalysisWidget,
            'factor-analysis-selected-strategy-changed',
            lang.hitch(this, this._setFactorAnalysisCurrentStrategyWidget)
          );

          this._setSeries();

          this._setFactorAnalysisCurrentStrategyWidget();
        },

        _clearPreviousFactorAnalysisWidget: function() {
          this._clearSeries();

          this._factorAnalysisWidgetEventHandle.remove();

          if (this._factorAnalysisStrategyWidget) {
            // un-set the previous strategy widget
            this._factorAnalysisStrategyWidget.setChart(null, null);
            this._factorAnalysisStrategyWidget = null;
          }
        },

        _initContinuousFactorAnalysisChartElements: function() {
          this._chart.addPlot(ContinuousFactorAnalysis.prototype.__type + 'Plot', {
            type: 'Areas',
            markers: false
          });

          this._chart.addSeries(ContinuousFactorAnalysis.prototype.__type + 'Series', [], {
            stroke: {width: 1, color: 'black'},
            fill: [0, 100, 255, 1],
            plot: ContinuousFactorAnalysis.prototype.__type + 'Plot'
          });
        },

        _initDiscreteFactorAnalysisChartElements: function() {
          this._chart.addPlot(DiscreteFactorAnalysis.prototype.__type + 'Plot', {
            type: 'Columns',
            gap: 5,
            markers: false,
            maxBarSize: 50
          });

          this._chart.addSeries(DiscreteFactorAnalysis.prototype.__type + 'Series', [], {
            stroke: {width: 1, color: 'black'},
            fill: [0, 100, 255, 1],
            plot: DiscreteFactorAnalysis.prototype.__type + 'Plot'
          });

          this._chartTooltip = new Tooltip(this._chart, DiscreteFactorAnalysis.prototype.__type + 'Plot');
        },

        _clearSeries: function() {
          this._chart.updateSeries(this._factorAnalysisWidget.factorAnalysis.__type + 'Series', []);
          this._chart.render();
        },

        _setSeries: function() {
          var seriesData = this._factorAnalysisWidget.factorAnalysis.getSeriesData();
          this._chart.updateSeries(this._factorAnalysisWidget.factorAnalysis.__type + 'Series', seriesData);
          this._chart.render();
        },

        _setFactorAnalysisCurrentStrategyWidget: function() {
          if (this._factorAnalysisStrategyWidget) {
            // un-set the previous strategy widget
            this._factorAnalysisStrategyWidget.setChart(null, null);
          }

          var selectedIndex = this._factorAnalysisWidget.factorAnalysis.selectedStrategyIndex;

          this._factorAnalysisStrategyWidget =
            this._factorAnalysisWidget.factorAnalysisStrategyWidgets[selectedIndex];

          this._factorAnalysisStrategyWidget.setChart(
            this._chart,
            this._factorAnalysisWidget.factorAnalysis.__type + 'Plot');

          domConstruct.place(
            this._factorAnalysisStrategyWidget.domNode,
            this._currentFactorStrategyWidgetNode,
            'only');
        }
      }
    );
  }
);
