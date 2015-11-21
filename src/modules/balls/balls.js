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
    * Module properties, states and settings
    * @namespace $prop
    * @property {boolean} ballDropped has ball dropped yet?
    */

    var props = {
      ballDropped: false
    };


    /**
     * Initialise the component
     * @function init
     */

    var init = function() {
        cache.$window.on('ball1Drop', ball1Drop);
        cache.$window.on('balls:showBall1', showBall.bind(cache.$ball1));
        cache.$window.on('balls:showBall2', showBall.bind(cache.$ball2));
    };

    /**
     * Drop ball 1 down a screen
     * @function ball1Drop
     */

    var ball1Drop = function() {

        // Only drop ball once
        if (props.ballDropped) {
            return;
        }

        var $sections = $('.sections .section'),
            sectionsHeight = $sections.eq(0).height() + $sections.eq(1).height(), // first 2 sections height
            ball1TopPosition = cache.$ball1.offset().top + cache.$ball1.height(),
            newPosition = sectionsHeight - ball1TopPosition;

            cache.$ball1.css({
                'transform': 'translateY(' + newPosition + 'px) scale(0.9, 1)',
            });

        props.ballDropped = true;
    };

    /**
     * Show ball 1
     * @function showBall1
     * @param {object} event
     * @param {object} position
     */

    var showBall = function(event, position) {
        this.css({
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height
        });
    };


    init();

};
