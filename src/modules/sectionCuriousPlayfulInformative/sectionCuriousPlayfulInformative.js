/** @module sectionCuriousPlayfulInformative */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    _base = require('../_base/_base.js'),
    _ = require('underscore');

/**
 * @constructor sectionCuriousPlayfulInformative
 * @param {object} controller
 */

var sectionCuriousPlayfulInformative = module.exports = function(controller, $section, index) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} $window
     * @property {jQuery} $rotator
     */

    var cache = {
        $window: $(window),
        $rotator: $section.find('.rotator')
    };

    /**
     * Module properties, states and settings
     * @namespace props
     * @property {object} surfaceStyles start/end styles for surface to animate between on scroll
     */

    var props = {
        surfaceStyles: {
            start: {
                translate: 50,
                rotate: 0
            },
            end: {
                translate: 0,
                rotate: -90
            }
        },
    };

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} pageScroll
     */

    this.events.pageScroll = null;

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        // Bind events
        this.events.pageScroll = _.throttle(this.rotateSurface.bind(this));
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
            controller.emitter.on('sections:reset', this.events.reset);
            cache.$window.on('scroll', this.events.pageScroll);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            cache.$window.off('scroll', this.events.pageScroll);
        }
    };

    /**
     * On scroll: rotate surface from 0 to 90/-90 degrees depending on mouse position
     * @method pageScroll
     */

    this.rotateSurface = function() {
        var sectionTop = $section.offset().top,
            sectionHalfway = sectionTop + ($section.height() / 2), // @TODO move out of scroll
            progress = Math.min(Math.max((cache.$window.scrollTop() - sectionTop), 0) / (sectionHalfway - sectionTop), 1),
            rotate = props.surfaceStyles.end.rotate * progress,
            translate = props.surfaceStyles.start.translate - (props.surfaceStyles.start.translate * progress);
console.log(progress);
        cache.$rotator.css('transform', 'translateX(' + translate + 'vw)  rotate(' + rotate + 'deg)');

        // if (progress === 1) {
        //     $ball.addClass('drop');
        //     $ball.fadeOut(400);
        // }
        //
        // if (progress === 0) {
        //     $ball.removeClass('drop');
        //     $ball.show();
        // }

        /*globals console*/
        console.log(progress);
    };

    this.init();
};
