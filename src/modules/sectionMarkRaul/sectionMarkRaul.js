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
     */

    var cache = {
        $name: $section.find('.name')
    };

    /**
     * Module properties, states and settings
     * @namespace props
     * @property {object} rotator screen rotation module
     * @property {object} rotatorOptions options for screen rotation module
     */

    var props = {
        rotator: null,
        rotatorOptions: {
            moveSectionTopRotateStart: 0,
            easingArray: [{s:0,cp:0,e:0},{s:0,cp:0,e:0},{s:0,cp:0.5,e:1},{s:1,cp:1,e:1}],
            surfaceStyles: {
                start: {
                    gradient: 50,
                    rotate: -90
                },
                end: {
                    gradient: 75,
                    rotate: 0
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

        // @TODO do event properly
        cache.$name.on('click', function() {
            /*globals console*/ console.log('Name');
        });

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
