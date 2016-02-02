/** @module sectionMakingDigitalHuman */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    Rotator = require('../rotator/rotator.js'),
    _base = require('../_base/_base.js');

/**
 * @constructor sectionMakingDigitalHuman
 * @param {object} controller
 */

var sectionMakingDigitalHuman = module.exports = function(controller, $section, index) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} window
     */

    var cache = {
        $window: $(window)
    };

    /**
     * properties, states and settings
     * @namespace props
     * @property {number} svgLoaded
     * @property {boolean} ball1Dropped has ball 1 dropped?
     */

    var props = {
        rotator: null,
        rotatorOptions: {
            moveSectionTopRotateStart: -1/3,
            moveSectionBottomRotateEnd: -1/3,
            surfaceStyles: {
                start: {
                    translate: 0,
                    gradient: 0,
                    rotate: 0
                },
                end: {
                    translate: 0,
                    gradient: 100,
                    rotate: 0
                }
            },
        }
    };

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} refreshDimensions
     */

    this.events.refreshDimensions = null;

    /**
     * scrollMagic scene for pinning title
     * @property {number} scenePinTitle
     */

    this.scenePinTitle = null;

    /**
     * Initialise the component
     * @TODO Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        this.refreshDimensions();
        // Bind events
        this.events.refreshDimensions = this.refreshDimensions.bind(this);
        // Set up screen rotation on scrolling
        props.rotator = new Rotator(controller, $section, props.rotatorOptions);
        // Attach events
        this.attachDetachEvents(true);
        // ScrollMagic scene
        this.setupScene();

        // Set associated module.
        // @TODO avoid accessing other module directly. event instead?
        controller.props.sections[index].props.associatedModule = this;
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
            controller.emitter.on('window:resize', this.events.refreshDimensions);
            props.rotator.attachDetachEvents(true);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('window:resize', this.events.refreshDimensions);
            props.rotator.attachDetachEvents(false);
        }
    };

    /**
     * ScrollMagic scene
     * @function setupScene
     */

    this.setupScene = function() {

        if (this.scenePinTitle) {
            this.scenePinTitle.destroy(true);
        }

        // ScrollMagic Safari/Firefox bug
        // https://github.com/janpaepke/ScrollMagic/issues/458
        var scrollTop = cache.$window.scrollTop();

        this.scenePinTitle = new ScrollMagic.Scene({
            triggerElement: $section.get(0),
            duration: $section.height(), // refreshed on resize in refreshDimensions
            triggerHook: 0
        })
        .setPin($section.get(0), {
            pushFollowers: false
        });

        this.scenePinTitle.on('start', function(event) {
            $section.removeClass('js--scene-leave');
        });

        this.scenePinTitle.on('end', function(event) {
            $section.addClass('js--scene-leave');
        });

        // ScrollMagic Safari/Firefox bug
        // https://github.com/janpaepke/ScrollMagic/issues/458
        cache.$window.scrollTop(scrollTop);

        this.scenePinTitle.addTo(controller.props.scrollScenes);
    };



    /**
     * Get and store dimensions
     * @method refreshDimensions
     */

    this.refreshDimensions = function() {
        if (this.scenePinTitle) {
            this.scenePinTitle.duration($section.height());
        }
    };

    /**
     * Destroy all
     * @method destroy
     */

    this.destroy = function() {
        // Remove event listenters
        this.attachDetachEvents(false);
        // Remove custom scrollmagic scene
        this.scenePinTitle.destroy(true);
    };

    this.init();
};
