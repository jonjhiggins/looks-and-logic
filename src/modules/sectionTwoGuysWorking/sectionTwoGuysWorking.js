/** @module sectionTwoGuysWorking */

var $ = require('jquery'),
    Rotator = require('../rotator/rotator.js'),
    _base = require('../_base/_base.js');

/**
 * @constructor sectionTwoGuysWorking
 * @param {object} controller
 */

var sectionTwoGuysWorking = module.exports = function(controller, $section, index) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     */

    var cache = {
    };

    /**
     * Module properties, states and settings
     * @namespace props
     * @property {boolean} ballCloned has ball been cloned?
     * @property {object} rotator screen rotation module
     * @property {object} rotatorOptions options for screen rotation module
     */

    var props = {
        ballCloned: false,
        rotator: null,
        rotatorOptions: {
            moveSectionTopRotateStart: 0,
            surfaceStyles: {
                start: {
                    gradient: 100,
                    rotate: -180
                },
                end: {
                    gradient: 0,
                    rotate: -180
                }
            }
        }
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        // Set up screen rotation on scrolling
        props.rotator = new Rotator(controller, $section, props.rotatorOptions);

        // Attach events
        this.attachDetachEvents(true);

        // Set associated module.
        // @TODO avoid accessing other module directly. event instead?
        controller.props.sections[index].props.associatedModule = this;

        // Clone ball2 into the section
        if (!props.ballCloned) {
            controller.emitter.emit('balls:cloneBall2', $section);
            props.ballCloned = true;
        }
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            props.rotator.attachDetachEvents(true);
            controller.emitter.on('sections:reset', this.events.reset);
        } else {
            props.rotator.attachDetachEvents(false);
            controller.emitter.removeListener('sections:reset', this.events.reset);
        }
    };

    /**
     * Destroy all
     * @method destroy
     */

    this.destroy = function() {
        this.attachDetachEvents(false);
        props.rotator.destroy();
    };

    this.init();
};
