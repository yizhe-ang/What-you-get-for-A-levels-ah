// The visualization is initialized by ths script
/* global d3, crossfilter */
(function(viz) {
	'use strict';

	// IMPORTING OF DATASET        
    queue()
        .defer(d3.csv, 'data/nus_uas.csv')
        .defer(d3.csv, 'data/nus_gender.csv')
        .defer(d3.csv, 'data/nus_salary.csv')
        .await(ready);

    // CALLED ONCE THE DATA IS LOADED
    function ready(error, uas_data, gender_data, salary_data) {
        // log any error to console
        if(error) {
            return console.warn(error);
        }
        // changes all the keys from strings to numbers
        uas_data.forEach(function(d) {
            d.key = +d.key;
        });
        gender_data.forEach(function(d) {
            d.key = +d.key;
        });
        salary_data.forEach(function(d) {
            d.key = +d.key;
        });
        
        viz.uasData = uas_data;
        viz.genderData = gender_data;
        viz.salaryData = salary_data;
        // Initializes the crossfilter function
        viz.makeFilterAndDimensions();
        // Initializes menu
        viz.initMenu();
    	// Initialize chart 
    	viz.onDataChange();
    }





}(window.viz = window.viz || {}));