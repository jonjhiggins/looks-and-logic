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
     * Initialise the component
     * @method init
     */

    this.init = function() {
        // Attach events
        this.attachDetachEvents(true);
        this.addScenePin();

        // Set associated module.
        // @TODO avoid accessing other module directly. event instead?
        controller.props.sections[index].props.associatedModule = this;
    };

    /**
     * @method attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
        }
    };

    /**
     * Pin the text via ScrollMagic
     * @method addScenePin
     */

    this.addScenePin = function() {
        // Get scrollmagic scene
        var sectionObject = controller.props.sections[index],
            scene = sectionObject.props.scene;

        // Set triggerHook to top of component (so it pins there)
        scene.triggerHook(0);
        // Add pin
        scene.setPin($section.get(0), {
            pushFollowers: false
        });
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
