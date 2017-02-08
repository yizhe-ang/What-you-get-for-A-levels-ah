// MENU BAR (SORT AND FILTERS AND INPUT)
/* global d3, crossfilter */
(function(viz) {
	'use strict';

	// GENERAL RESET FUNCTION
	// simply resets the working data
	var resetData = function() {
		viz.keyDim.filter();
		viz.courseDim.filter();
		viz.uasDim.filter();

		// check all checkboxes
		d3.selectAll('label.control--checkbox input') 
			.each(function() {
			var input = d3.select(this);

			input.property('checked', true);
		});

	};


	








	// SORT
	var sortButton = d3.select('#sort-button');

	sortButton.on('click', function(d) {
		if (viz.sortStatus === null) {
			viz.sortStatus = false;
		}
		viz.sortStatus = !viz.sortStatus;

		// update the bar chart
		viz.sortBars();
	});






	// RESET
	var resetButton = d3.select('#reset-button');

	resetButton.on('click', function(d) {
		resetData();
		viz.sortStatus = null; // resets sort status too
		viz.updateBar();
	});






	// GRADES INPUT
	var GRADES_PTS = { 'A':20.0,
					   'B':17.5,
					   'C':15.0,
					   'D':12.5,
					   'E':10.0,
					   'S': 5.0,
					   'U': 0.0  };
	var inputData = {};

	var inputGrades = d3.selectAll('input[type="text"]');

	inputGrades.on('input', function() {
		var gradeNo = d3.select(this).attr('name'); 
		var gradeData = this.value.toUpperCase();
		console.log(gradeNo);
		console.log(gradeData);
		// stores the data if input is valid
		if (gradeData in GRADES_PTS) {
			inputData[gradeNo] = gradeData;
		}
		console.log(inputData);
		// if all grades have been entered, calculate UAS
		if (Object.keys(inputData).length == 6) {
			console.log('calculate!');
			var totalUAS = calculateGrade();
			// filters courses according to computed UAS
			console.log(totalUAS);
			filterByUAS(totalUAS);
			viz.updateBar();
		}

	});
	// function that calculates UAS
	var calculateGrade = function() {
		var totalUAS = 0.0; // stores final UAS
		for (var i in inputData) {
			var grade = inputData[i.toString()];
			// calculate H2 subjects
			if (i <= 3) {
				totalUAS += GRADES_PTS[grade];
			}
			else {
				totalUAS += GRADES_PTS[grade]/2;
			}
		}

		return totalUAS;
	};

	// function that filters dataset based on UAS score
	var filterByUAS = function(totalUAS) {
		// resets uas filter first
		viz.uasDim.filter();
		// filters for courses in which uas is lesser than input uas
		viz.uasDim.filter(function(d) {
			return d <= totalUAS;
		});
		// viz.data = viz.data.filter(function(d) {
		// 	return d.uas <= totalUAS;
		// });
		// console.log(viz.data);
		
	};


	// function that checks through all the filter inputs and updates the crossfilter accordinly
	var filterByCourse = function() {
		// resets the course filter first
		viz.courseDim.filter();
		// list of courses to be included
		var filterList = [];
		// selects all inputs and starts the loop
		coursesInput.each(function() {
			var input = d3.select(this);
			var checked = input.property('checked');
			var course = input.property('name');
			// if checked, filter for that course
			if (checked) {
				filterList.push(course);
			}
		});
		viz.courseDim.filter(function(d) {
			// if course is in filter list, filter for it
			return filterList.indexOf(d) > -1;
		});
	};




	// FILTER COURSES
	
	var facultyInput = d3.selectAll('label.faculty-checkbox input');
	var coursesInput  = d3.selectAll('label.course-checkbox input');

	// when FACULTY LABEL is clicked, update the checkboxes of the rest of the courses
	// then updates the crossfilter
	facultyInput.on('change', function() {

		var input = d3.select(this);

		var checked = input.property('checked');
		console.log(checked);
		var faculty = input.property('name');
		console.log(faculty);

		// uncheck/check the rest of the courses
		d3.selectAll('label.'+faculty+' input') 
			.each(function() {
			var input = d3.select(this);

			input.property('checked', checked);
		});

		filterByCourse();
		viz.updateBar();

	});

	// when COURSE LABEL is changed, loop through all the inputs and 
	// update the crossfilter and hence bar chart
	coursesInput.on('change', function() {
		filterByCourse();
		viz.updateBar();
	});


}(window.viz = window.viz || {}));