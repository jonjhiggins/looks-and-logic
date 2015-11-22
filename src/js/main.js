/** @module main */

// Requires

var $ = require('jquery'),
	Controller = require('./../modules/controller/controller'),
	Menu = require('./../modules/menu/menu'),
    ArrowDownButton = require('./../modules/ArrowDownButton/ArrowDownButton'),
	Balls = require('./../modules/balls/balls'),
    Sections = require('./../modules/sections/sections'),
	Section = require('./../modules/section/section'),
	SectionIntro = require('./../modules/sectionIntro/sectionIntro'),
	SectionMakingDigitalHuman = require('./../modules/sectionMakingDigitalHuman/sectionMakingDigitalHuman'),
	SectionCuriousPlayfulInformative = require('./../modules/sectionCuriousPlayfulInformative/sectionCuriousPlayfulInformative');


// Variables

var $sections = $('.section'),
	sectionsLength = $sections.length;

// Init single modules
var controller = new Controller(),
    arrowDownButton = new ArrowDownButton(controller),
	menu = new Menu(controller),
	balls = new Balls(controller),
	sections = new Sections(controller, $('.sections').eq(0));


// Init sections: common

$('.section').each(function (index, item) {
	controller.props.sections[index] = new Section(controller, $(item), index, sectionsLength);
});

// Init sections: specific
var $sectionIntro = $('.section--intro').eq(0),
	$sectionMakingDigitalHuman = $('.section--making-digital-human').eq(0),
	$sectionCuriousPlayfulInformative = $('.section--curious-playful-informative').eq(0);


var sectionIntro = new SectionIntro(controller, $sectionIntro, $sectionIntro.index()),
	sectionMakingDigitalHuman = new SectionMakingDigitalHuman(controller, $sectionMakingDigitalHuman, $sectionMakingDigitalHuman.index()),
	sectionCuriousPlayfulInformative = new SectionCuriousPlayfulInformative(controller, $sectionCuriousPlayfulInformative, $sectionCuriousPlayfulInformative.index());
