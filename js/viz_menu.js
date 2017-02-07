// MENU BAR (SORT AND FILTERS AND INPUT)
/* global d3, crossfilter */
(function(viz) {
	'use strict';

	// GENERAL RESET FUNCTION
	// simply resets the working data
	var resetData = function() {
		viz.data = [];
		viz.initData.forEach(function(object) {
			viz.data.push(object);
		});
	};


	// GENERAL SORT FUNCTION
	var sortData = function() {
		if (sortStatus === null) { // does nothing if sort is not toggled
			return;
		}	

		else if (sortStatus) { // sorts descending if true
			viz.data.sort(function(a, b) {
				return parseFloat(b.uas)-parseFloat(a.uas);
			});
		}
		
		else { // sorts ascending if toggled again
			viz.data.sort(function(a, b) {
				return parseFloat(a.uas)-parseFloat(b.uas);
			});
		}
	};






	// SORT
	var sortStatus = null;
	var sortButton = d3.select('#sort-button');

	sortButton.on('click', function(d) {
		if (sortStatus === null) {
			sortStatus = false;
		}
		sortStatus = !sortStatus;
		sortData();
		// update the bar chart
		viz.sortBars(viz.data);
	});






	// RESET
	var resetButton = d3.select('#reset-button');

	resetButton.on('click', function(d) {
		resetData();
		sortStatus = null; // resets sort status too
		viz.updateBar(viz.data);
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
			filterCoursesUAS(totalUAS);
			sortData();
			viz.updateBar(viz.data);
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
	var filterCoursesUAS = function(totalUAS) {
		// resets working data first
		resetData();
		viz.data = viz.data.filter(function(d) {
			return d.uas <= totalUAS;
		});
		console.log(viz.data);
		
	};

	// function that filters out dataset based on faculty 
	var filterByFaculty = function(faculty, checked) {
		// viz.data = viz.data.filter(function(d) {
		// 	return d.faculty != faculty;
		// });
		// console.log(viz.data);
		if (checked) {
			viz.facultyData.filter();

		}

		else {
			viz.facultyDim.filterFunction(function(d) {
				return d != faculty;
			});
			var data = viz.keyDim.top(Infinity);
		}
		
		console.log(data);

	};




	// FILTER COURSES
	
	var facultyInput = d3.selectAll('label.faculty-checkbox input');

	// when label is clicked, check for the checked value and filter accordingly
	facultyInput.on('change', function() {

		var input = d3.select(this);

		console.log(input.property('checked'));
		var checked = input.property('checked');
		var faculty = input.property('name');
		console.log(faculty);

		if (checked) { // if checked, all courses from this faculty are included

		}

		else { // if unchecked, filter out all courses from this faculty
			filterByFaculty(faculty);
		}

		viz.updateBar();

	});

}(window.viz = window.viz || {}));