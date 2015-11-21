/** @module Balls */
/*globals Power2:true, console*/

/**
 * @constructor Balls
 */

var $ = require('jquery');

/**
 * jQuery elements
 * @namespace cache
 * @property {jQuery} window
 * @property {jQuery} originalSections sections stored once for duplication
 * @property {jQuery} $parent containing .sections element
 */

var cache = {
    $window: $(window),
    $ball1: $('#ball--1'),
    $ball2: $('#ball--2')
};


var Balls = module.exports = function() {
    'use strict';


    /**
     * Initialise the component
     * @function init
     */

    var init = function() {
        cache.$window.on('ball1Drop', ball1Drop);
    };

    /**
     * Drop ball 1 down a screen
     * @function ball1Drop
     */

    var ball1Drop = function() {
        var windowHeight = cache.$window.height(),
            ball1TopPosition = cache.$ball1.offset().top,
            newPosition = (windowHeight * 2) + ball1TopPosition;

            console.log(newPosition);

            cache.$ball1.css('transform', 'translateY(' + newPosition + 'px)');
    };


    init();

};
