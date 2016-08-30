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

define(['dojo/_base/declare'], function(declare) {
  var Topics = declare(
    null,
    {
      // Contains two parameters.  The first parameter is the query object
      // The second parameter is the url to the result map service
      QUERY_EXECUTED: 'query/executed',

      // Contains one parameter, a query object
      QUERY_GENERATED: 'query/generated'
    });

  return new Topics();
});
