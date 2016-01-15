/** @module sectionMarkRaul */

var $ = require('jquery'),
    Rotator = require('../rotator/rotator.js'),
    _base = require('../_base/_base.js');

/**
 * @constructor sectionMarkRaul
 * @param {object} controller
 */

var sectionMarkRaul = module.exports = function(controller, $section, index) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} $rotator
     */

    var cache = {
        $rotator: $section.find('.rotator')
    };

    /**
     * Module properties, states and settings
     * @namespace props
     * @property {object} rotator screen rotation module
     */

    var props = {
        rotator: null,
        rotatorOptions: {
            startVertical: true,
            moveSectionTopRotateStart: 0,
        }
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        // Set up screen rotation on scrolling
        props.rotator = new Rotator(controller, $section, cache.$rotator, props.rotatorOptions);

        // Attach events
        this.attachDetachEvents(true);
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            props.rotator.attachDetachEvents(true);
        } else {
            props.rotator.attachDetachEvents(false);
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
