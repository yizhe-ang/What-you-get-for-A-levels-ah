// MENU BAR (SORT AND FILTERS AND INPUT)
/* global d3, crossfilter */
(function(viz) {
	'use strict';

	// INITIALIZE MENU
	viz.initMenu = function() {
		var data = viz.scoreKeyDim.top(Infinity);

		// creates a nest based on faculty
		var dataByFaculty = d3.nest()
								.key(function(d) { return d.faculty; })
								.entries(data);

		// attaches the nested data to 'tab' container (created for each faculty)
		d3.selectAll('.tab').remove();
		var tabGroup = d3.select('#tab-group');
		var tab = tabGroup.selectAll('.tab')
						.data(dataByFaculty)
						.enter()
						.append('div').attr('class', 'tab')
										.attr('id', function(d) { 
											var faculty = viz.strip(d.key);
											return faculty+'-tab'; 
										});

		// creates the tab header
		tab.append('div').attr('class', 'tab-header');
		// creates the label
		tab.select('.tab-header')
							.append('label').attr('class', 'filter-label faculty-checkbox')
											.text(function(d) { return d.key; } )
							// input checkbox
							.append('input').attr('type', 'checkbox')
											// .attr('checked', 'checked')
											.attr('name', function(d) { return viz.strip(d.key); } );
		// checkbox indicator
		tab.select('.faculty-checkbox')
			.append('div').attr('class', function(d) { 
				return 'filter-indicator '+viz.strip(d.key); });



		// FILTER COURSES
		var facultyInput = d3.selectAll('.faculty-checkbox input');
		var coursesInput  = d3.selectAll('.course-checkbox input');

		// when FACULTY LABEL is changed, update colors of chart
		facultyInput.on('change', function() {
			if (viz.selectedData=='Gender') { // ignore for gender chart
				return;
			}
			colorBars();
		});

	};

	var colorBars = function() {
		var facultyInput = d3.selectAll('.faculty-checkbox input');
		facultyInput.each(function() {
			var input = d3.select(this);
			var checked = input.property('checked');
			var faculty = viz.strip(input.property('name'));
			var rects = d3.selectAll('svg .'+faculty);
			if (checked) {
				rects.transition().style('fill', viz.COLORS[faculty]);
			}
			else {
				rects.transition().style('fill', 'gainsboro');
			}
		});
	};





	// GENERAL RESET FUNCTION
	// simply resets the working data
	var resetData = function() {
		viz.uasData = 90.0;

		// check all checkboxes
		d3.selectAll('.tab input') 
			.each(function() {
			var input = d3.select(this);

			input.property('checked', false);
		});

		// resets grade input
		inputData = {};
		inputGrades
			.each(function() {
				this.value = null;
			});

		viz.sortStatus = null; // resets sort status too
	};




	// RESET
	var resetButton = d3.select('#reset-button');

	resetButton.on('click', function(d) {
		resetData();
		
		viz.onDataChange();
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


		// stores the data if input is valid
		if (gradeData in GRADES_PTS) {
			inputData[gradeNo] = gradeData;
		}
		// verifies if all input have been entered
		var inputCount = 0;
		inputGrades.each(function() {
			if (this.value !== '') {
				inputCount++;
			}
		});
		// if so, calculate UAS and update the bars
		if (inputCount==6) {
			viz.uasData = calculateGrade();
			// filters courses according to computed UAS
			// filterByUAS(viz.uasData);
			viz.onDataChange();
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
		// filters for courses in which uas is lesser than input uas
		viz.scoreUasDim.filter(function(d) {
			return d <= totalUAS;
		});
		viz.salaryUasDim.filter(function(d) {
			return d <= totalUAS;
		});
		viz.genderUasDim.filter(function(d) {
			return d <= totalUAS;
		});

	};




	// DATA SELECTION BUTTONS
	var dataSelection = d3.selectAll('.data-selection input');
	// when selection button is clicked, update selection data and activate the respective chart
	dataSelection.on('change', function() {
		dataSelection.each(function() {
			var input = d3.select(this);
			var checked = input.property('checked');
			if (checked) {
				viz.selectedData = input.property('value');
			}
		});
		viz.onDataChange();
	});


	// SIDEBAR TOGGLER
	var sidebarToggler = d3.select('input#sidebartoggler');
	sidebarToggler.on('change', function() {
		var input = d3.select(this);
		var checked = input.property('checked');

		if (checked) {
			d3.select('#sidebar')
				.style('left', '0px');
		}
		else {
			d3.select('#sidebar')
				.style('left', '-300px');
		}
	});
	

	


}(window.viz = window.viz || {}));