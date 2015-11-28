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


var Balls = module.exports = function(controller) {
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
        controller.emitter.on('balls:ball1Drop', ball1Drop);
        controller.emitter.on('balls:showBall1', showBall.bind(cache.$ball1));
        controller.emitter.on('balls:showBall2', showBall.bind(cache.$ball2));
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
            section2Top = $sections.eq(2).offset().top, // first 2 sections height
            ball1TopPosition = cache.$ball1.offset().top + cache.$ball1.height(),
            newPosition = section2Top - ball1TopPosition;

            cache.$ball1.css({
                'transform': 'translateY(' + newPosition + 'px) scale(0.9, 1)',
            });

        props.ballDropped = true;
    };

    /**
     * Show ball 1
     * @function showBall1
     * @param {object} position
     */

    var showBall = function(position) {
        this.css({
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height
        });
    };


    init();

};
