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
  './AdditionOperator',
  './AndOperator',
  './EqualToOperator',
  './GreaterThanOperator',
  './GreaterThanOrEqualToOperator',
  './LessThanOperator',
  './LessThanOrEqualToOperator',
  './NoOpOperator',
  './NotEqualToOperator',
  './OrOperator'
],
  function(declare, AdditionOperator, AndOperator, EqualToOperator, GreaterThanOperator,
           GreaterThanOrEqualToOperator, LessThanOperator, LessThanOrEqualToOperator,
           NoOpOperator, NotEqualToOperator, OrOperator) {
    var Utils = declare(
      null,
      {
        // Underlying support operators
        additionOperator: new AdditionOperator(),
        noOpOperator: new NoOpOperator(),

        // Concatenation clause operators
        andOperator: new AndOperator(),
        orOperator: new OrOperator(),

        // Attributed clause operators
        equalToOperator: new EqualToOperator(),
        notEqualToOperator: new NotEqualToOperator(),

        // Regular and Unit clause operators
        greaterThanOperator: new GreaterThanOperator(),
        greaterThanEqualToOperator: new GreaterThanOrEqualToOperator(),
        lessThanOperator: new LessThanOperator(),
        lessThanEqualToOperator: new LessThanOrEqualToOperator(),

        binaryClauseOperators: null,
        attributedOperators: null,
        concatenationOperators: null,

        constructor: function() {
          this.binaryClauseOperators = [
            this.noOpOperator,
            this.lessThanOperator,
            this.lessThanEqualToOperator,
            this.greaterThanOperator,
            this.greaterThanEqualToOperator
          ];

          this.attributedOperators = [this.noOpOperator, this.equalToOperator, this.notEqualToOperator];

          this.concatenationOperators = [this.noOpOperator, this.andOperator, this.orOperator];
        },

        // Factory method
        getOperatorFromStr: function(op) {
          switch (op) {
            case this.additionOperator.operator:
              return this.additionOperator;
            case this.noOpOperator.operator:
              return this.noOpOperator;
            case this.andOperator.operator:
              return this.andOperator;
            case this.orOperator.operator:
              return this.orOperator;
            case this.equalToOperator.operator:
              return this.equalToOperator;
            case this.notEqualToOperator.operator:
              return this.notEqualToOperator;
            case this.greaterThanOperator.operator:
              return this.greaterThanOperator;
            case this.greaterThanEqualToOperator.operator:
              return this.greaterThanEqualToOperator;
            case this.lessThanOperator.operator:
              return this.lessThanOperator;
            case this.lessThanEqualToOperator.operator:
              return this.lessThanEqualToOperator;
            default:
              return null;
          }
        }
      }
    );

    return new Utils();
  }
);
