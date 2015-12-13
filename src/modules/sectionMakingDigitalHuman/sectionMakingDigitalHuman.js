/** @module sectionMakingDigitalHuman */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
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
        $window: $(window),
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
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('window:resize', this.events.refreshDimensions);
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
