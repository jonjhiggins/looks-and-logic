/** @module main */

// Requires

var $ = require('jquery'),
	Controller = require('./../modules/controller/controller'),
	Menu = require('./../modules/menu/menu'),
    ArrowDownButton = require('./../modules/ArrowDownButton/ArrowDownButton'),
	Balls = require('./../modules/balls/balls'),
    Sections = require('./../modules/sections/sections'),
	SectionIndicator = require('./../modules/sectionIndicator/sectionIndicator');

window.$ = $;

// Init modules
var controller = new Controller(),
    arrowDownButton = new ArrowDownButton(controller),
	menu = new Menu(controller),
	balls = new Balls(controller),
	sections = new Sections(controller, $('.sections').eq(0)),
	sectionIndicator = new SectionIndicator(controller);
