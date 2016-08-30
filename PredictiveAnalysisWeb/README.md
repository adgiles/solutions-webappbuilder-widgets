# Predictive Analysis - Query Editor Widget
The Predictive Analysis Query Editor Widget allows a user to combine and constrain many image services together to perform rapid predictive and suitability analysis.

![Query Editor Widget](PA_QueryEditor.png)

## Sections

* [Features](#features)
* [Requirements](#requirements)
* [Instructions](#instructions)
* [Using](#using)
* [Resources](#resources)
* [Issues](#issues)
* [Contributing](#contributing)
* [Licensing](#licensing)

## Features
* Boolean and weighted sum analysis modes
* Predefined queries
* Supported Image Service Features:
  * Categorical image services with class name attributes
  * Image services with unit attribution metadata
  * Multiple image service end points
  * Image services from different ArcGIS Server instances

## Requirements
* Web AppBuilder for ArcGIS version 1.0 to 1.2
* One or more Image Services
* ArcGIS Predictive Analysis Web Services
  * ArcGIS for Server Advanced edition 10.2.0 to 10.3.1

## Instructions
* Download, install, and configure the ArcGIS Predictive Analysis Web Services.
* Configure the widget default geoprocessing service end point:
  * Navigate to the [config.json](./config.json) file in the root of the PA_QueryEditor Folder
  * Change the gpServiceUrl parameter to point to the geoprocessing service created from installing the ArcGIS Predictive Analysis Web Services in the previous step.
* Deploy the PA_QueryEditor widget to the client/stemapp/widgets folder of your Web AppBuilder for ArcGIS installation.

## Using
![Query Editor Widget](Using_the_QueryEditor.png)

1.  Available data sources: This area contains all the image services that have been added to the web map.
  * 1a represents an example of the currently selected data source.
2.  Add Button: This button is available for a user to add additional image services that are not in the web map.  Performing this operation will not add the service to the map or web map.
3.  Query Editor Toolbar: From left to right contains the following functions:
  * Add Clause: Adds the selected data source from the available data sources as a clause to the expression.
  * Remove Clause: Removes the selected clause(s) that is/are selected in the expression area.
  * Swap Data Source: Replaces the data source of the selected clause(fig. 4b) with the selected available data source(fig. 1a).
  * Move Clause Up: Moves the selected clause(fig. 4b) up in the expression(fig. 4)
  * Move Clause Down: Moves the selected clause(fig. 4b) down in the expression(fig. 4)
  * Group Clauses: Converts the selected clause(s)(fig. 4b) into a group clause.
  * Un-Group Clauses: Removes selected group clause and adds the grouped clauses back into the expression.
  * Toggle Weighted Mode: Toggle button that represents if the query is in weighted mode or boolean mode.
4.  Query Expression: This tabular list represents the query expression that will be executed when the Run button(fig. 5) is pressed.
  * 4a represents a sample of a clause.  A Clause is a component of an expression.  Add a clause by double clicking an available data source(fig. 1) or by clicking the Add Clause button.
  * 4b represents a sample of the currently selected clause.
5.  Run Button: This button executes the current expression(fig. 4).
6.  Status Bar: The status bar represents the status of the executing query expression(fig. 4).
7.  Results Pane: Displays the symbology for the layer that was generated from the query expression(fig. 4).

## Resources
[Web AppBuilder for ArcGIS] (https://developers.arcgis.com/web-appbuilder/)

## Issues
Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing
Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

If you are using [JS Hint](http://http://www.jshint.com/) there is a .jshintrc file included in the root folder which enforces this style.
We allow for 120 characters per line instead of the highly restrictive 80.

## Licensing
Copyright 2014 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's
[license.txt](license.txt) file.

[](Esri Tags: ArcGIS Defense and Intelligence Military Environment Planning Predictive Analysis Emergency Management Local-Government Local Government State-Government State Government Utilities)
[](Esri Language: Javascript)