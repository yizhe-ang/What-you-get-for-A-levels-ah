// CHART (Score, Salary, Employment Gender)
/* global d3, crossfilter */
(function(viz) {
	'use strict';

	// function that colors elements according to faculty selected
	var colorElements = function(d) {
		var faculty = viz.strip(d.faculty);
		var input = d3.select('input[name="'+faculty+'"]');
		var checked = input.property('checked');

		if (checked) {
			return viz.COLORS[faculty];
		}
		else {
			return 'gainsboro';
		}
	};

	// function that reduces opacity of elements according to uas input
	var fadeElements = function(d) {
		var score = d.uas;
		if (score > viz.uasData) {
			return 0.2;
		}
		else {
			return 1.0;
		}
	};

	var SALARY_TT_HTML = 
		'<div><span class="value-header">75<sup>th</sup> </span><span id="first-value" class="secondary-value"></span></div><div><span class="value-header">25<sup>th</sup> </span><span id="second-value" class="secondary-value"></span></div>';

	// format function
	var format = d3.format(',.0f');


	// FIRST INITIALIZES ELEMENTS/DETAILS INDEPENDENT OF DATA
	// DEFINING THE SCALES (domain)

	var yScale = d3.scale.ordinal();
	var xScale = d3.scale.linear();

	// DEFINING THE AXES
	var xAxis = d3.svg.axis()
					.orient('top')
					.ticks(5);
	var yAxis = d3.svg.axis()
					.orient('left')
					.tickSize(0)
					.tickPadding(6);

	// DEFINING THE GRID
	var xGrid = d3.svg.axis()
					.orient('top')
					.ticks(5)
					.tickFormat('');

	// SVG ELEMENTS
	var svg = d3.select('#chart').append('svg');
	var chartWrapper = svg.append('g'); // chart wrapper
	chartWrapper.append('g').classed('grid', true);

	chartWrapper.append('g').classed('x_axis', true);
	chartWrapper.append('g').classed('y_axis', true);
	var tooltip = d3.select('#tooltip')
					.style('opacity', 0);

	// BAR GROUPS
	var firstGroup = chartWrapper.insert('g', '.x_axis');
	var secondGroup = chartWrapper.insert('g', '.x_axis');
						

	// DEFINING LABELS
	var label = svg.append('text').attr('class', 'chart-title')
					.attr('x', 150)
					.attr('y', 45);



	// UPDATE SVG
	svg
		.attr('width', viz.w+viz.margin.left+viz.margin.right)
		.attr('height', viz.h+viz.margin.top+viz.margin.bottom);
	chartWrapper
		.attr('transform', 'translate('+viz.margin.left+','+viz.margin.top+')');


	// UPDATE DIMENSIONS FUNCTION
	// updates width of chart according to current window width
	var updateDimensions = function() {
		var winWidth = window.innerWidth;
		if (winWidth > 960) {
			winWidth = 960;
		}
		if (winWidth < 550) {
			winWidth = 550;
		}
	    viz.w = winWidth - viz.margin.left - viz.margin.right;
	};


	// UPDAES UAS CHART
	viz.updateUAS = function() {
		updateDimensions();
		var data = viz.scoreValueDim.top(Infinity);
		// update footer
		d3.select('#footer-content a')
			.property('href', 'http://www.nus.edu.sg/oam/gradeprofile/sprogramme-igp.html');
		d3.select('#footer-content p')
			.text('NUS AY2017/2018 Indicative Grade Profile');
		// update tooltip
		tooltip.selectAll('div')
				.remove();
		tooltip
			.append('div')
			.append('span').attr('id', 'main-value');
		
		// updates y scale first
		yScale.rangeRoundBands([0, 25*data.length], 0.3)
				.domain(data.map(function(d) {
					return d.course;
				}));
		xScale.range([0, viz.w])
		        .domain([65, 85]);
		yAxis.scale(yScale);
		xAxis.ticks(5)
				.tickFormat(null);
		xAxis.scale(xScale)
				.tickValues(null);
		svg.select('.y_axis')
			.transition().duration(1000).delay(500)
			.call(yAxis);
		svg.select('.x_axis')
			.call(xAxis);

		// UPDATE GRID
		xGrid.scale(xScale)
		        .tickSize(-(25*data.length),0,0)
		        .tickValues(null);
		svg.select('.grid')
			.style('opacity', 0)
		    .call(xGrid)
		    .style('opacity', 1.0);

		// UPDATE LABELS
		label
			.text('10th Percentile of University Admission Scores');
		// then bars
		var bars = firstGroup.selectAll('rect')
								.data(data, viz.key);
		// enter
		bars.enter()
			.insert('rect', '.x_axis')
			.attr('class', function(d) { return viz.strip(d.faculty); }) 
			.attr('id', function(d) { return viz.strip(d.course); })
			.style('opacity', 0); // first hides the bar
		// update
		bars.transition().duration(1000).delay(500)
			.style('fill', colorElements)
			.style('opacity', fadeElements) // then fades it into view
			.attr('x', 0) 
			.attr('y', function(d) { return yScale(d.course); })
			.attr('height', yScale.rangeBand())
			.attr('width', function(d) { return xScale(d.value); });
		// exit
		bars.exit()
			.transition().duration(1000).delay(500)
			.style('opacity', 0) // fades out removed bar
			.remove();
		secondGroup.selectAll('rect')
					.transition().duration(500)
					.style('opacity', 0)
					.remove();
		secondGroup.selectAll('circle')
					.transition().duration(500)
					.style('opacity', 0)
					.remove();
		// tooltips
		bars.on('mouseover', function(d) {
			tooltip
				.style('opacity', 1.0)
				.style('left', (d3.event.pageX+20)+'px')
				.style('top', (d3.event.pageY)+'px')
				.select('#course-name')
				.text(d.course);
			tooltip
				.select('#main-value')
				.text(d.value);
		})
			.on('mouseout', function() {
				tooltip
					.style('opacity', 0);
		});

	};









	// UPDATES GENDER CHART
	viz.updateGender = function() {
		updateDimensions();
		var data = viz.genderValueDim.top(Infinity);
		// UPDATE LABELS
		label
			.text('Percentage of Male Students | Female Students');

		// update footer
		d3.select('#footer-content a')
			.property('href', 'http://nus.edu.sg/registrar/info/statistics/ug-enrol-20162017.pdf');
		d3.select('#footer-content p')
			.text('NUS AY2016/2017 Undergraduate Student Enrolment Statistics');

		// DEFINING THE TOOLTIP
		tooltip.selectAll('div')
				.remove();
		tooltip
			.append('div').attr('id', 'male-value');
		tooltip
			.append('div').attr('id', 'female-value');


		// DEFINING/UPDATING THE SCALES
		yScale.rangeRoundBands([0, 25*data.length], 0.3)
				.domain(data.map(function(d) {
					return d.course;
				}));

		xScale.range([0, viz.w])
				.domain([0, 100]);

		// UPDATE AXES
		xAxis.tickFormat(function(d) { 
				return d+'%';
		});
		xAxis.scale(xScale)
				.tickValues([50]);
		yAxis.scale(yScale);
		svg.select('.x_axis')
			.call(xAxis);
		svg.select('.y_axis')
			.transition().duration(1000).delay(500)
			.call(yAxis);

		// UPDATE GRID
		xGrid.scale(xScale)
				.tickValues([50])
				.tickSize(-(25*data.length),0,0);
		svg.select('.grid')
			.call(xGrid);

		// BARS TIME
		// define color interpolater
		var maleColor = d3.interpolateRgb('rgb(221,221,221)','rgb(33,97,250)');
		var femaleColor = d3.interpolateRgb('rgb(221,221,221)', 'rgb(255,51,51)');
		// male
		var maleBars = firstGroup.selectAll('rect')
								.data(data, viz.key);
		maleBars.enter()
				.append('rect')
				.attr('class', function(d) { return d.faculty; }) 
				.attr('id', function(d) { return viz.strip(d.course); })
				.style('opacity', 0); // first hides the bar
		maleBars.transition().duration(1000).delay(500)
				.style('opacity', 1.0)
				.style('fill', function(d) { return maleColor(d.value/100); })
				.attr('x', 0)
				.attr('y', function(d) { return yScale(d.course); })
				.attr('height', yScale.rangeBand())
				.attr('width', function(d) { return xScale(d.value); });
		maleBars.exit()
				.transition().duration(1000)
				.style('opacity', 0)
				.remove();
		// female
		var femaleBars = secondGroup.selectAll('rect')
									.data(data, viz.key);
		femaleBars.enter()
				.append('rect')
				.attr('class', function(d) { return d.faculty; }) 
				.attr('id', function(d) { return viz.strip(d.course); })
				.style('opacity', 0);
		femaleBars.transition().duration(1000).delay(1000)
				.style('opacity', 1.0)
				.style('fill', function(d) { return femaleColor((100-d.value)/100); })
				.attr('x', function(d) { return xScale(d.value); })
				.attr('y', function(d) { return yScale(d.course); })
				.attr('height', yScale.rangeBand())
				.attr('width', function(d) { return xScale(100-d.value); });
		femaleBars.exit()
				.transition().duration(1000)
				.style('opacity', 0)
				.remove();
		secondGroup.selectAll('circle')
		            .transition().duration(500)
		            .style('opacity', 0)
		            .remove();
		// tooltips
		var bars = chartWrapper.selectAll('rect');
		bars.on('mouseover', function(d) {
			tooltip
				.style('opacity', 1.0)
				.style('left', (d3.event.pageX+20)+'px')
				.style('top', (d3.event.pageY)+'px')
				.select('#course-name')
				.text(d.course);
			tooltip
				.select('#male-value')
				.style('color', maleColor(d.value/100))
				.text(d.value);
			tooltip
				.select('#female-value')
				.style('color', femaleColor((100-d.value)/100))
				.text(100-d.value);
		})
			.on('mouseout', function() {
			tooltip
				.style('opacity', 0);
		});


	};


	// INITIALIZES SALARY DATA AND CHART
	viz.updateSalary = function() {
		updateDimensions();
		var data = viz.salaryValueDim.top(Infinity);
		// update footer
		d3.select('#footer-content a')
			.property('href', 'https://www.moe.gov.sg/docs/default-source/document/education/post-secondary/files/nus.pdf');
		d3.select('#footer-content p')
			.text('NUS Graduate Employment Survey (Nov 2016)');

		// UPDATE LABELS
		label
			.text('Median Gross Monthly Salary');
		// DEFINING THE SCALES
		yScale.rangeRoundBands([0, 25*data.length], 0.3)
				.domain(data.map(function(d) {
					return d.course;
				}));
		xScale.range([0, viz.w])
				.domain([2000, 6000]);

		// UPDATE AXES
		xAxis
			.tickFormat(function(d) { return '$'+format(d); });
		xAxis.scale(xScale)
				.tickValues(null);
		yAxis.scale(yScale);
		svg.select('.x_axis')
			.call(xAxis);
		svg.select('.y_axis')
			.transition().duration(1000).delay(500)
			.call(yAxis);

		// UPDATE GRID
		xGrid.scale(xScale)
				.tickValues(null)
				.tickSize(-(25*data.length),0,0);
		svg.select('.grid')
			.style('opacity', 0)
			.call(xGrid)
			.style('opacity', 1.0);

		// UPDATE BARS
		var bars = firstGroup.selectAll('rect')
								.data(data, viz.key);
		bars.enter()
			.insert('rect', '.x_axis')
			.attr('class', function(d) { return viz.strip(d.faculty); })
			.attr('id', function(d) { return viz.strip(d.course); })
			.style('opacity', 0);
		bars.transition().duration(1000).delay(500)
			.style('fill', colorElements)
			.style('opacity', fadeElements)
			.attr('x', 0)
			.attr('y', function(d) { return yScale(d.course); })
			.attr('height', yScale.rangeBand())
			.attr('width', function(d) { return xScale(d.value); });
		bars.exit()
			.transition().duration(1000)
			.style('opacity', 0)
			.remove();

		// UPDATE CIRCLES(percentiles)
		var firstCircles = secondGroup.selectAll('.lowerPercent')
									.data(data, viz.key);
		firstCircles.enter()
					.append('circle').attr('class', 'lowerPercent')
					.style('opacity', 0);
		firstCircles.transition().duration(1000).delay(1000)
					.style('opacity', fadeElements)
					.attr('cx', function(d) { return xScale(d.salary_25); })
					.attr('cy', function(d) { return yScale(d.course)+8; })
					.attr('r', 4)
					.attr('fill', 'none')
					.attr('stroke', 'grey')
					.attr('stroke-width', '2px');
		firstCircles.exit()
			.transition().duration(1000)
			.style('opacity', 0)
			.remove();

		var secondCircles = secondGroup.selectAll('.upperPercent')
									.data(data, viz.key);
		secondCircles.enter()
					.append('circle').attr('class', 'upperPercent')
					.style('opacity', 0);
		secondCircles.transition().duration(1000).delay(1000)
					.style('opacity', fadeElements)
					.attr('cx', function(d) { return xScale(d.salary_75); })
					.attr('cy', function(d) { return yScale(d.course)+8; })
					.attr('r', 4)
					.attr('fill', 'grey')
					.attr('stroke', 'grey')
					.attr('stroke-width', '2px');
		secondCircles.exit()
			.transition().duration(1000)
			.style('opacity', 0)
			.remove();
		secondGroup.selectAll('rect')
		            .transition().duration(500)
		            .style('opacity', 0)
		            .remove();
		// UPDATE TOOLTIP
		tooltip.selectAll('div')
				.remove();
		tooltip
			.append('div')
			.append('span').attr('id', 'main-value');
		tooltip
			.append('div')
			.html(SALARY_TT_HTML);

		bars.on('mouseover', function(d) {
			tooltip
				.style('opacity', 1.0)
				.style('left', (d3.event.pageX+20)+'px')
				.style('top', (d3.event.pageY)+'px')
				.select('#course-name')
				.text(d.course);
			tooltip
				.select('#main-value')
				.text('$'+format(d.value));
			tooltip
				.select('#first-value')
				.text('$'+format(d.salary_75));
			tooltip
				.select('#second-value')
				.text('$'+format(d.salary_25));
		})
			.on('mouseout', function() {
				tooltip
					.style('opacity', 0);
		});


	};


	// UPDATES EMPLOYMENT CHART
	viz.updateEmployment = function() {
	    updateDimensions();
	    var data = viz.employmentDim.top(Infinity);
	    // update footer
	    d3.select('#footer-content a')
	    	.property('href', 'https://www.moe.gov.sg/docs/default-source/document/education/post-secondary/files/nus.pdf');
	    d3.select('#footer-content p')
	    	.text('NUS Graduate Employment Survey (Nov 2016)');
	    // update tooltip
	    tooltip.selectAll('div')
	            .remove();
	    tooltip
	        .append('div')
	        .append('span').attr('id', 'main-value');
	    
	    // updates y scale first
	    yScale.rangeRoundBands([0, 25*data.length], 0.3)
	            .domain(data.map(function(d) {
	                return d.course;
	            }));
	    xScale.range([0, viz.w])
	            .domain([0, 100]);
	    yAxis.scale(yScale);
	    xAxis.ticks(5)
	            .tickFormat(function(d) { return d+'%'; });
	    xAxis.scale(xScale)
	            .tickValues(null);
	    svg.select('.y_axis')
	        .transition().duration(1000).delay(500)
	        .call(yAxis);
	    svg.select('.x_axis')
	        .call(xAxis);


	    // UPDATE GRID
	    xGrid.scale(xScale)
	            .tickSize(-(25*data.length),0,0)
	            .tickValues(null);
	    svg.select('.grid')
	        .style('opacity', 0)
	        .call(xGrid)
	        .style('opacity', 1.0);

	    // UPDATE LABELS
	    label
	        .text('Full-Time Permanent Employment Rate');
	    // then bars
	    var bars = firstGroup.selectAll('rect')
	                            .data(data, viz.key);
	    // enter
	    bars.enter()
	        .insert('rect', '.x_axis')
	        .attr('class', function(d) { return viz.strip(d.faculty); }) 
	        .attr('id', function(d) { return viz.strip(d.course); })
	        .style('opacity', 0); // first hides the bar
	    // update
	    bars.transition().duration(1000).delay(500)
	        .style('fill', colorElements)
	        .style('opacity', fadeElements) // then fades it into view
	        .attr('x', 0) 
	        .attr('y', function(d) { return yScale(d.course); })
	        .attr('height', yScale.rangeBand())
	        .attr('width', function(d) { return xScale(d.employment); });
	    // exit
	    bars.exit()
	        .transition().duration(1000).delay(500)
	        // .attr('width', 0)
	        .style('opacity', 0) // fades out removed bar
	        .remove();
	    secondGroup.selectAll('rect')
	                .transition().duration(500)
	                .style('opacity', 0)
	                .remove();
	    secondGroup.selectAll('circle')
	                .transition().duration(500)
	                .style('opacity', 0)
	                .remove();
	    // tooltips
	    bars.on('mouseover', function(d) {
	        tooltip
	            .style('opacity', 1.0)
	            .style('left', (d3.event.pageX+20)+'px')
	            .style('top', (d3.event.pageY)+'px')
	            .select('#course-name')
	            .text(d.course);
	        tooltip
	            .select('#main-value')
	            .text(d.employment+'%');
	    })
	        .on('mouseout', function() {
	            tooltip
	                .style('opacity', 0);
	    });

	};




}(window.viz = window.viz || {}));


// #1 FUNCTION THAT INIT CHART
// #2 FUNCTION THAT UPDATES CHART BASED ON (DATA)
// #3 FUNCTION THAT UPDATES CHART BASED ON (WIDTH)



