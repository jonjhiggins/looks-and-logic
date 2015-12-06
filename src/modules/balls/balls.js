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
    * Bound events for add/removal. Inherits reset from _base
    * @namespace events
    * @property {function} showBall1
    * @property {function} showBall2
    */

    this.events.showBall1 = null;
    this.events.showBall2 = null;


    /**
     * Initialise the component
     * @function init
     */

    this.init = function() {
        // Bind events
        this.events.showBall1 = showBall.bind(cache.$ball1);
        this.events.showBall2 = showBall.bind(cache.$ball2);
        // Attach events
        this.attachDetachEvents(true);
        // Reset ball1 position and dropped prop
        cache.$ball1.css({
            'transform': 'none',
        });
        props.ballDropped = false;
    };

    /**
     * @method attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
            controller.emitter.on('balls:ball1Drop', ball1Drop);
            controller.emitter.on('balls:showBall1', this.events.showBall1);
            controller.emitter.on('balls:showBall2', this.events.showBall2);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('balls:ball1Drop', ball1Drop);
            controller.emitter.removeListener('balls:showBall1', this.events.showBall1);
            controller.emitter.removeListener('balls:showBall2', this.events.showBall2);
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
