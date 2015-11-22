/** @module main */

// Requires

var $ = require('jquery'),
	Controller = require('./../modules/controller/controller'),
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
var controller = new Controller(),
	menu = new Menu(controller),
    arrowDownButton = new ArrowDownButton(controller),
	balls = new Balls(controller);


// Init each section

$('.section').each(function (index, item) {
	sections[index] = new Section(controller, index, $(item), sectionsLength);
});

// Init single sections @TODO move to section.js?

var sectionIntro = new SectionIntro(controller, $('.section--intro'));
