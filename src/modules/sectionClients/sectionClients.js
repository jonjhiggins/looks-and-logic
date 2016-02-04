/** @module sectionClients */

var $ = require('jquery'),
    Rotator = require('../rotator/rotator.js'),
    _base = require('../_base/_base.js');

/**
 * @constructor sectionClients
 * @param {object} controller
 */

var sectionClients = module.exports = function(controller, $section, index) {
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
     * @property {object} rotator screen rotation module
     * @property {object} rotatorOptionsA options for clients--a screen rotation module
     * @property {object} rotatorOptionsB options for clients--b screen rotation module
     */

    var props = {
        rotator: null,
        rotatorOptionsA: {
            moveSectionTopRotateStart: 0,
            surfaceStyles: {
                start: {
                    gradient: 75,
                    rotate: 0
                },
                end: {
                    gradient: 25,
                    rotate: 180
                }
            }
        },
        rotatorOptionsB: {
            moveSectionTopRotateStart: 0,
            surfaceStyles: {
                start: {
                    gradient: 25,
                    rotate: -180
                },
                end: {
                    gradient: 100,
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

        var rotatorOptions = $section.hasClass('section--clients--a') ? props.rotatorOptionsA : props.rotatorOptionsB;
        props.rotator = new Rotator(controller, $section, rotatorOptions);

        // Attach events
        this.attachDetachEvents(true);

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
