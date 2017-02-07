// This script contains any code I might want to share among the other scripts/modules
/* global d3, crossfilter */
(function(viz) {
	'use strict';

	viz.data = []; // the main data object
	viz.initData = []; // a copy of the original data

	// DIMENSIONS
	viz.margin = { top:50, right:50, bottom:20, left:150 };
	viz.w = 960 - viz.margin.left - viz.margin.right;
	viz.h = 1000 - viz.margin.top - viz.margin.bottom;

	// KEY FUNCTION
	viz.key = function(d) {
	    return d.course;
	};

	// viz.filterByFaculty = function(faculty) {

	// };

	// viz.filterByCourse = function(course) {

	// };

	// viz.updateChart = function(data) {

	// };

	// viz.getFilteredData = function() {

	// };


	// CROSSFILTER FUNCTION
	viz.makeFilterAndDimensions = function(data) {
		// add the filter and create category dimensions
		viz.filter = crossfilter(data);
		// KEY dimension
		viz.keyDim = viz.filter.dimension(function(o) {
			return o.key;
		});
		// FACULTY dimension
		viz.facultyDim = viz.filter.dimension(function(o) {
			return o.faculty;
		});
		// COURSE dimension
		viz.courseDim = viz.filter.dimension(function(o) {
			return o.course;
		});
		// UAS dimension
		viz.uasDim = viz.filter.dimension(function(o) {
			return o.uas;
		});
	};

	// FUNCTION THAT IS CALLED WHENEVER DATASET CHANGES
	viz.onDataChange = function() {
		// var data = viz.data;
		// viz.updateBar(data); 
		viz.updateDimensions();
	};

	// RESIZES CHART ACCORDING TO WINDOW SIZE
	d3.select(window).on('resize', viz.onDataChange);


}(window.viz = window.viz || {}));

