/** @module Balls */
/*globals Power2:true, console*/

/**
 * @constructor Balls
 */

var $ = require('jquery'),
    _base = require('../_base/_base.js');

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

    // Extend _base module JS
    var base = _base.apply(this);

    /**
    * Module properties, states and settings
    * @namespace $prop
    * @property {boolean} ballDropped has ball dropped yet?
    */

    var props = {
      ballDropped: false
    };

    /**
    * Bound events for add/removal
    * @namespace events
    * @property {function} showBall1
    * @property {function} showBall2
    * @property {function} reset
    */

    var events = {
      showBall1: null,
      showBall2: null,
      reset: null
    };


    /**
     * Initialise the component
     * @function init
     */

    this.init = function() {
        // Bind events
        events.showBall1 = showBall.bind(cache.$ball1);
        events.showBall2 = showBall.bind(cache.$ball2);
        events.reset = this.reset.bind(this, true);
        // Attach events
        this.attachDetachEvents(true);
        // Reset ball1 position and dropped prop
        cache.$ball1.css({
            'transform': 'none',
        });
        props.ballDropped = false;
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', events.reset);
            controller.emitter.on('balls:ball1Drop', ball1Drop);
            controller.emitter.on('balls:showBall1', events.showBall1);
            controller.emitter.on('balls:showBall2', events.showBall2);
        } else {
            controller.emitter.removeListener('sections:reset', events.reset);
            controller.emitter.removeListener('balls:ball1Drop', ball1Drop);
            controller.emitter.removeListener('balls:showBall1', events.showBall1);
            controller.emitter.removeListener('balls:showBall2', events.showBall2);
        }
    };

    /**
     * Drop ball 1 down a screen
     * @function ball1Drop
     * @param {jQuery} $sectionIntro sectionIntro calling the ball drop
     */

    var ball1Drop = function($sectionIntro) {

        // Only drop ball once
        if (props.ballDropped) {
            return;
        }


        var $nextSection = controller.getNextSection($sectionIntro),
            $nextNextSection = controller.getNextSection($nextSection),
            nextNextSectionTop = $nextNextSection.offset().top, // first 2 sections height
            ball1TopPosition = cache.$ball1.offset().top + cache.$ball1.height(),
            newPosition = nextNextSectionTop - ball1TopPosition;

            cache.$ball1.css({
                'transform': 'translateY(' + newPosition + 'px) scale(0.9, 1)',
            });

        props.ballDropped = true;
    };

    /**
     * Show ball
     * @function showBall
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


    this.init();

};
