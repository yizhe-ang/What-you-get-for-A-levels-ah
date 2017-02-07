// The visualization is initialized by ths script
/* global d3, crossfilter */
(function(viz) {
	'use strict';

	// IMPORTING OF DATASET        
    d3.csv('data/nus_uas.csv', init);

    // CALLED ONCE THE DATA IS LOADED
    function init(data) {
        // changes all the keys from strings to numbers
        data.forEach(function(d) {
            d.key = +d.key;
        })
    	viz.initData = data; // stores the original data
    	// clones the original daata as a working data copy
    	viz.initData.forEach(function(object) {
    		viz.data.push(object);
    	});
        // Initializes the crossfilter function
        viz.makeFilterAndDimensions(viz.data);
    	// Initialize bar chart first
    	viz.initBar(viz.data);
    	// Trigger update with full dataset
    	// viz.onDataChange();
    	// viz.updateDimensions();
    }



}(window.viz = window.viz || {}));