// BAR CHART
/* global d3, crossfilter */
(function(viz) {
	'use strict';

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


	// // SORTING FUNCTION
	// var sortBars = function() {
	//     console.log('pls');
	//     chartWrapper.selectAll('rect') 
	//         .sort(function(a, b) {
	//             return d3.ascending(a.uas, b.uas);
	//         })
	//         // .transition()
	//         // .duration(1000)
	//         .attr('y', function(d) {
	//             return yScale(d.course);
	//         });
	// };

	// // SORT BUTTON
	// d3.select('#sort-button')
	//     .on('click', function() {
	//         sortBars();
	//     });



	// FUNCTION THAT UPDATES POSITON OF BARS
	viz.sortBars = function() {
		var data = viz.sortData( viz.keyDim.top(Infinity) );
		yScale.domain(data.map(function(d) { return d.course; }));
		yAxis.scale(yScale);
		svg.select('.y_axis')
			.transition().duration(1000)
			.call(yAxis);
		chartWrapper.selectAll('rect') 
					.data(data, viz.key)
					.transition().duration(1000)
					.attr('y', function(d) { return yScale(d.course); });
	};

	// SCORE FILTERING FUNCTION



	// UPDATE DIMENSIONS FUNCTION
	viz.updateDimensions = function() {
		// var winWidth = parseInt(d3.select('#chart').style('width'), 10);
		// console.log(winWidth);
		console.log('resizing');
		var winWidth = window.innerWidth;
		if (winWidth > 960) {
			winWidth = 960;
		}
	    viz.w = winWidth - viz.margin.left - viz.margin.right;
	    xScale.range([0, viz.w]);
	    svg
	    	.attr('width', viz.w+viz.margin.left+viz.margin.right);
	    xAxis.scale(xScale);
	    svg.select('.x_axis')
	    	.transition()
	    	.call(xAxis);
	    xGrid.scale(xScale);
	    svg.select('.grid')
	    	.transition()
	    	.call(xGrid);
	    chartWrapper.selectAll('rect') 
	    	.transition()
	    	.attr('width', function(d) {
	    		return xScale(d.uas);
	    	});
	};

	// FUNCTION THAT IS CALLED WHEN CHART FIRST INITIALIZES
	viz.initBar = function(data) {
		// DEFINING/UPDATING THE SCALES
		yScale.rangeRoundBands([0, 30*data.length], 0.3)
				.domain(data.map(function(d) {
					return d.course;
				}));

		xScale.range([0, viz.w])
				.domain([60, 85]);

		// UPDATE SVG
		svg
			.attr('width', viz.w+viz.margin.left+viz.margin.right)
			.attr('height', viz.h+viz.margin.top+viz.margin.bottom);
		chartWrapper
			.attr('transform', 'translate('+viz.margin.left+','+viz.margin.top+')');

		// UPDATE AXIS
		xAxis.scale(xScale);
		yAxis.scale(yScale);
		svg.select('.x_axis')
			.call(xAxis);
		svg.select('.y_axis')
			.call(yAxis);

		// UPDATE GRID
		xGrid.scale(xScale)
				.tickSize(-viz.h,0,0);
		svg.select('.grid')
			.call(xGrid);

		// width only gets updated upon initialization
		// ACTIVATING THE BARS
		// join data to bar group
		var bars = chartWrapper.selectAll('rect') 
								.data(data, viz.key);
		// append bars for unbound data
		bars.enter() 
			.insert('rect', '.x_axis'); // insert below the axes
			

		// update all bars with bound data
		bars
			.attr('class', function(d) { return d.faculty; }) 

			.attr('y', function(d) { return yScale(d.course); })
			.attr('x', 0)
			.attr('height', yScale.rangeBand())
			.attr('width', function(d) { return xScale(d.uas); }); // ?????


		// remove any bars without bound data
		bars.exit()
			.remove();
		// tooltips
		bars.on('mouseover', function(d) {
			tooltip
				.style('opacity', 1.0)
				.style('left', (d3.event.pageX+20)+'px')
				.style('top', (d3.event.pageY)+'px')
				.select('#course_name')
				.text(d.course);
			tooltip
				.select('#uas_value')
				.text(d.uas);
		})
			.on('mouseout', function() {
				tooltip
					.style('opacity', 0);
		});

		// UPDATE DIMENSIONS (just the width actually)
		viz.updateDimensions();


	};

	// FUNCTION THAT ADDS OR REMOVES BARS
	viz.updateBar = function() {
		// gets latest working data and sorts accordingly
		var data = viz.sortData( viz.keyDim.top(Infinity) );
		
		// updates y scale first
		yScale.rangeRoundBands([0, 30*data.length], 0.3)
				.domain(data.map(function(d) {
					return d.course;
				}));
		yAxis.scale(yScale);
		svg.select('.y_axis')
			.transition().duration(1000)
			.call(yAxis);

		// then bars
		var bars = chartWrapper.selectAll('rect')
								.data(data, viz.key);
		// enter
		bars.enter()
			.insert('rect', '.x_axis')
			.attr('class', function(d) { return d.faculty; }) 
			.style('opacity', 0) // first hides the bar
			.attr('x', 0) 
			.attr('y', function(d) { return yScale(d.course); })
			.attr('height', yScale.rangeBand())
			.attr('width', function(d) { return xScale(d.uas); });
			// .attr('width', 0);
		// update
		bars.transition().duration(1000)
			.style('opacity', 1.0) // then fades it into view
			.attr('x', 0) 
			.attr('y', function(d) { return yScale(d.course); })
			.attr('height', yScale.rangeBand())
			.attr('width', function(d) { return xScale(d.uas); });
		// exit
		bars.exit()
			.transition().duration(1000)
			// .attr('width', 0)
			.style('opacity', 0) // fades out removed bar
			.remove();
		// tooltips
		bars.on('mouseover', function(d) {
			tooltip
				.style('opacity', 1.0)
				.style('left', (d3.event.pageX+20)+'px')
				.style('top', (d3.event.pageY)+'px')
				.select('#course_name')
				.text(d.course);
			tooltip
				.select('#uas_value')
				.text(d.uas);
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

