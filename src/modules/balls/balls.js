/** @module Balls */
/*globals Power4:true*/

/**
 * @constructor Balls
 */

var $ = require('jquery'),
    _base = require('../_base/_base.js'),
    TweenMax = require('gsap/src/uncompressed/TweenMax.js');

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
    * @property {object} ball1DropTween TweenMax object for ball 1 dropping
    * @property {jQuery} $ball1DropSectionIntro $sectionIntro that last called ball1Drop
    * @property {nunber} resizeTimer timeout used to wait for mobile address bar to change size
    */

    var props = {
      ballDropped: false,
      ball1DropTween: null,
      $ball1DropSectionIntro: null,
      resizeTimer: null
    };

    /**
    * Bound events for add/removal. Inherits reset from _base
    * @namespace events
    * @property {function} showBall1
    * @property {function} cloneBall1
    * @property {function} removeClonedBall1
    * @property {function} showBall2
    */

    this.events.showBall1 = null;
    this.events.cloneBall1 = null;
    this.events.removeClonedBall1 = null;
    this.events.showBall2 = null;
    this.events.resize = null;


    /**
     * Initialise the component
     * @function init
     */

    this.init = function() {
        // Bind events
        this.events.showBall1 = showBall.bind(null, 1);
        this.events.cloneBall1 = cloneBall.bind(null, 1);
        this.events.removeClonedBall1 = removeClonedBall.bind(null, 1);
        this.events.showBall2 = showBall.bind(null, 2);
        this.events.cloneBall2 = cloneBall.bind(null, 2);
        this.events.removeClonedBall2 = removeClonedBall.bind(null, 2);
        this.events.resize = onResize.bind(this);
        // Attach events
        this.attachDetachEvents(true);
        // Reset ball1 position and dropped prop
        if (props.ball1DropTween) {
            TweenMax.set(cache.$ball1, {clearProps:'all'});
            props.ball1DropTween.kill();
        }
        // Clear resize timeout
        if (props.resizeTimer) {
            window.clearTimeout(props.resizeTimer);
        }
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
            controller.emitter.on('balls:cloneBall1', this.events.cloneBall1);
            controller.emitter.on('balls:removeClonedBall1', this.events.removeClonedBall1);
            controller.emitter.on('balls:showBall2', this.events.showBall2);
            controller.emitter.on('balls:cloneBall2', this.events.cloneBall2);
            controller.emitter.on('balls:removeClonedBall2', this.events.removeClonedBall2);
            controller.emitter.on('window:resize', this.events.resize);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('balls:ball1Drop', ball1Drop);
            controller.emitter.removeListener('balls:showBall1', this.events.showBall1);
            controller.emitter.removeListener('balls:cloneBall1', this.events.cloneBall1);
            controller.emitter.removeListener('balls:removeClonedBall1', this.events.removeClonedBall1);
            controller.emitter.removeListener('balls:showBall2', this.events.showBall2);
            controller.emitter.removeListener('balls:cloneBall2', this.events.cloneBall2);
            controller.emitter.removeListener('balls:removeClonedBall2', this.events.removeClonedBall2);
            controller.emitter.removeListener('window:resize', this.events.resize);
        }
    };

    /**
     * Drop ball 1 down a screen
     * @function ball1Drop
     * @param {jQuery} $sectionIntro sectionIntro calling the ball drop
     */

    var ball1Drop = function($sectionIntro) {

        props.$ball1DropSectionIntro = $sectionIntro;

        // Only drop ball once
        if (props.ballDropped) {
            return;
        }

        // Get new Y Position
        var newYPos = calculateNewYPos($sectionIntro);

        // Animate ball dropping.
        // TweenMax gets inited each time as updateTo doesn't seem to work with
        // transformY property
        props.ball1DropTween = TweenMax.to(cache.$ball1, 0.4, {
            y: newYPos,
            scaleX: 0.9,
            ease: Power4.ease
        });

        props.ballDropped = true;
    };

    /**
     * Show ball
     * @function showBall
     * @param {number} ballNo
     */

    var showBall = function(ballNo, position) {

        var $ball = cache['$ball' + ballNo];

        $ball.css({
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height
        });

        hideShowBall(ballNo, false);
    };

    /**
     * Append ball to another element
     * @function cloneBall
     * @param {number} ballNo
     * @param {jQuery} $element
     */

    var cloneBall = function(ballNo, $element) {

        // Check if SVG holding balls has been loaded
        if (!controller.props.introSvgLoaded) {
            controller.emitter.once('intro:svgLoaded', cloneBall.bind(this, ballNo, $element));
            return;
        }

        var $ball = cache['$ball' + ballNo],
            $ballClone = $ball.clone(),
            id = 'ball--' + ballNo + '-clone';

        // Set ID of cloned ball
        $ballClone.attr('id', id);
        cache['$ball' + ballNo + 'Clone'] = $('#' + id);

        // Append cloned ball
        $element.append($ballClone);

        if (ballNo === 1) {
            // @TODO this should probably be in sectionCuriousPlayfulInformative
            TweenMax.set($ballClone, {
                y: -$ballClone.height(),
                scaleX: 0.9
            });
        }


        hideShowBall(ballNo, true);
    };

    /**
     * Remove previously cloned ball, tidy up and show normal ball again
     *
     * @function removeClonedBall
     * @param {number} ballNo
     * @param {jQuery} $ball ball to remove
     */

    var removeClonedBall = function(ballNo, $ball) {

        $ball.remove();
        cache['$ball' + ballNo + 'Clone'] = null;

        // @TODO show normal ball1 again - wait until we position it properly
        // hideShowBall(1, false);
    };

    /**
     * Position ball1 on top of section #3
     * @function calculateNewYPos
     * @param {jQuery} $introSection
     * @returns {number}
     */

    var calculateNewYPos = function($introSection) {
        var newYPos = 0,
            $nextSection = controller.getNextSection($introSection),
            $nextNextSection = controller.getNextSection($nextSection),
            nextNextSectionTop = $nextNextSection.offset().top, // first 2 sections height
            ball1TopPosition = cache.$ball1.offset().top + cache.$ball1.height();

        newYPos = nextNextSectionTop - ball1TopPosition;

        return newYPos;
    };

    /**
     * Reposition balls on resize
     * @function onResize
     */

    var onResize = function() {

        if (props.ballDropped && props.$ball1DropSectionIntro) {
            props.resizeTimer = window.setTimeout(function() {

                var newYPos = calculateNewYPos(props.$ball1DropSectionIntro);

                props.ball1DropTween = TweenMax.set(cache.$ball1, {
                    y: '+=' + newYPos + 'px'
                });

            }, 100);
        }


    };

    /**
     * Hide/show ball
     * @function hideShowBall
     * @param {number} ballNo
     * @param {boolean} hide
     */

    var hideShowBall = function(ballNo, hide) {
        var $ball = cache['$ball' + ballNo];

        if (hide) {
            $ball.addClass('js--hidden');
        } else {
            $ball.removeClass('js--hidden');
        }
    };


    this.init();

};
