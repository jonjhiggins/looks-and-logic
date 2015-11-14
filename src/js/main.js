/** @module main */

// Requires

var $ = require('jquery'),
	Menu = require('./../modules/menu/menu'),
    ArrowDownButton = require('./../modules/ArrowDownButton/ArrowDownButton'),
    Section = require('./../modules/section/section');

// Variables

var sections = [],
	menu = new Menu(),
    arrowDownButton = new ArrowDownButton();


// Init each section

$('.section').each(function (index, item) {
	sections[index] = new Section(index, $(item));
});
