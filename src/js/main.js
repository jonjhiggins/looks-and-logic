/** @module main */

// Requires

var $ = require('jquery'),
	Menu = require('./../modules/menu/menu'),
    ArrowDownButton = require('./../modules/ArrowDownButton/ArrowDownButton'),
	Balls = require('./../modules/balls/balls'),
    Section = require('./../modules/section/section'),
	SectionIntro = require('./../modules/sectionIntro/sectionIntro');

// Variables

var sections = [],
	$sections = $('.section'),
	sectionsLength = $sections.length;

// Init single modules
var menu = new Menu(),
    arrowDownButton = new ArrowDownButton(),
	balls = new Balls();


// Init each section

$('.section').each(function (index, item) {
	sections[index] = new Section(index, $(item), sectionsLength);
});

// Init single sections @TODO move to section.js?

var sectionIntro = new SectionIntro($('.section--intro'));
