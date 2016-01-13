/** @module Section */
/*globals Power2:true, console*/

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    snap = require('snapsvg'),
    _base = require('../_base/_base.js');

/**
 * @constructor SectionIntro
 * @param {object} controller
 * @param {jQuery} $element section element
 * @param {number} index which number section is this
 */

var SectionIntro = module.exports = function(controller, $element, index) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} window
     * @property {jQuery} $logo
     * @property {jQuery} $logoSvg logo's svg element
     */

    var cache = {
        $window: $(window),
        $logo: $element.find('.section__logo'),
        $logoSvg: $element.find('.section__logo svg')
    };

    /**
     * properties, states and settings
     * @namespace props
     * @property {number} svgLoaded
     * @property {boolean} ball1Dropped has ball 1 dropped?
     */

    this.props = {
        svgLoaded: false,
        ball1Dropped: false
    };

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} sectionLeave
     * @property {function} resize
     */

    this.events.sectionLeave = null;
    this.events.resize = null;

    /**
     * logo svgObject created by snap.svg
     * @var {object} svgObject
     */

    var svgObject = null;

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        // Bind events
        this.events.sectionLeave = this.sectionLeave.bind(this);
        this.events.resize = this.measureAndShowBalls.bind(this);
        // Attach events
        this.attachDetachEvents(true);

        // Set associated module.
        // @TODO avoid accessing other module directly. event instead?
        controller.props.sections[index].props.associatedModule = this;

        // Load the SVG
        var svgUrl = $element.data('svg-url');
        this.loadSVG(svgUrl);
    };

    /**
     * @method attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
            // On leave: drop ball
            if (!this.props.ball1Dropped) {
                controller.emitter.on('section:sectionLeave', this.events.sectionLeave);
            }
            // Refresh dimensions on resize
            controller.emitter.on('window:resize', this.events.resize);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('section:sectionLeave', this.events.sectionLeave);
            controller.emitter.removeListener('window:resize', this.events.resize);
        }
    };

    /**
     * @function loadSVG
     * @param {string} url
     */

    this.loadSVG = function(url) {

        if (this.props.svgLoaded || !url) {
            return;
        }

        svgObject = snap(cache.$logoSvg.get(0));
        snap.load(url, function(loadedSVG) {
            // Add SVG
            svgObject.append(loadedSVG);

            this.props.svgLoaded = true;

            // If autoscrolling, this may indicate sections are still being removed,
            // so positions will be wrong. If so, defer until autoscroll complete
            if (controller.props.autoScrolling) {
                controller.emitter.once('window:autoScrollingEnd', this.measureAndShowBalls.bind(this));
            }

            this.measureAndShowBalls();

        }.bind(this));
    };

    /**
     * @method measureAndShowBalls
     */

    this.measureAndShowBalls = function() {
        // Only run after snap.svg has done it's stuff
        if (!svgObject) {
            return;
        }

        // Temporarily show balls in background image for measuring
        cache.$logo.removeClass('section__logo--with-svg');
        // Measure balls within SVGs
        var ball1ClientRect = svgObject.select('#ball1').node.getBoundingClientRect(),
            ball2ClientRect = svgObject.select('#ball2').node.getBoundingClientRect(),
            ball1JQueryOffset = $element.find('#ball1').offset(),
            ball2JQueryOffset = $element.find('#ball2').offset(),
            ball1Position = {
                top: ball1JQueryOffset.top, // For some reason, this jQuery value is accurate
                                            // in iOS following address bar resize
                                            // when ClientRect is not
                left: ball1JQueryOffset.left,
                width: ball1ClientRect.width,
                height: ball1ClientRect.height
            },
            ball2Position = {
                top: ball2JQueryOffset.top,
                left: ball2JQueryOffset.left,
                width: ball2ClientRect.width,
                height: ball2ClientRect.height
            };

        // Hide background image
        cache.$logo.addClass('section__logo--with-svg');

        //@TODO promise
        if (!this.props.ball1Dropped){
            controller.emitter.emit('balls:showBall1', ball1Position);
        }
        controller.emitter.emit('balls:showBall2', ball2Position);
    };

    /**
     * On leaving component: drop ball and stop listening for resizes
     * @method sectionLeave
     * @param {jquery} $sectionLeave
     */

    this.sectionLeave = function($sectionLeave) {
        // When leaving this section, trigger ball1Drop
        if ($sectionLeave.get(0) === $element.get(0)) {
            controller.emitter.emit('balls:ball1Drop', $element);
            controller.emitter.removeListener('section:sectionLeave', this.events.sectionLeave);
            this.props.ball1Dropped = true;
        }
    };

    /**
     * Destroy all
     * @method destroy
     */

    this.destroy = function() {
        this.attachDetachEvents(false);
    };


    this.init();

};
