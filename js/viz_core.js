// This script contains any code I might want to share among the other scripts/modules
/* global d3, crossfilter */
(function(viz) {
	'use strict';

	// DESIGNATED COLORS FOR EACH FACULTY
	viz.COLORS = { Engineering:'#BCAAA4',
				   Science:'#80CBC4',
				   DesignEnvironment:'#FFCC80',
				   FASS:'#FFF59D',
				   Business:'#B39DDB',
				   Computing:'#90CAF9',
				   Medicine:'#EF9A9A',
				   Law:'#F48FB1',
				   EnvironmentalStudies:'#C5E1A5' };

	// STORED DATA
	viz.uasData;
	viz.genderData;
	viz.salaryData;
	// stores input uas
	viz.uasData = 90.0;

	// DIMENSIONS
	viz.margin = { top:80, right:50, bottom:20, left:150 };
	viz.w = 700 - viz.margin.left - viz.margin.right;
	viz.h = 950 - viz.margin.top - viz.margin.bottom;

	// GENERAL STRIP FUNCTION
	viz.strip = function(string) {
		return string.replace(/ /g, '')
						.replace(/[^a-zA-Z0-9]/g,'');
	};

	// KEY FUNCTION
	viz.key = function(d) {
	    return d.course;
	};

	// CROSSFILTER FUNCTION
	viz.makeFilterAndDimensions = function() {
		// SCORE FILTER
		viz.scorefilter  = crossfilter(viz.uasData);
		// KEY dimension
		viz.scoreKeyDim = viz.scorefilter.dimension(function(o) {
			return o.key;
		});
		// VALUE dimension
		viz.scoreValueDim = viz.scorefilter.dimension(function(o) {
			return o.value;
		});


		// SALARY FILTER
		viz.salaryFilter = crossfilter(viz.salaryData);
		viz.salaryValueDim = viz.salaryFilter.dimension(function(o) {
			return o.value;
		});
		viz.employmentDim = viz.salaryFilter.dimension(function(o) {
			return +o.employment;
		});

		// GENDER FILTER
		viz.genderFilter = crossfilter(viz.genderData);
		viz.genderValueDim = viz.genderFilter.dimension(function(o) {
			return o.value;
		});
	};

	// FUNCTION THAT IS CALLED WHENEVER DATASET CHANGES
	viz.selectedData = 'Score'; // default chart when first initialized is scores
	viz.onDataChange = function() {
		// first checks for the selected data
		// activates the respective chart
		if (viz.selectedData=='Score') {
			viz.updateUAS();
		}
		if (viz.selectedData=='Gender') {
			viz.updateGender();
		}
		if (viz.selectedData=='Salary') {
			viz.updateSalary();
		}
		if (viz.selectedData=='Employment') {
			viz.updateEmployment();
		}
	};

	// RESIZES CHART ACCORDING TO WINDOW SIZE
	d3.select(window).on('resize', viz.onDataChange);


}(window.viz = window.viz || {}));

