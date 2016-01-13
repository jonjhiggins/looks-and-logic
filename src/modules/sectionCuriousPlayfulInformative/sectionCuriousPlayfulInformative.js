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
     * ScrollMagic scene for fixing the title in position
     * @property {object} sceneFixTitle
     */

    this.sceneFixTitle = null;

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} pageScroll
     * @property {function} refreshDimensions
     */

    this.events.pageScroll = null;
    this.events.refreshDimensions = null;

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {

        this.refreshDimensions();

        // Bind events
        this.events.refreshDimensions = this.refreshDimensions.bind(this);
        this.events.pageScroll = _.throttle(this.rotateSurface.bind(this));

        // Attach events
        this.attachDetachEvents(true);

        // ScrollMagic scene
        this.setupScene();

        // Set associated module.
        // @TODO avoid accessing other module directly. event instead?
        controller.props.sections[index].props.associatedModule = this;
    };

    /**
     * ScrollMagic scene
     * On entering section above, title is fixed in center. On leaving section above,
     * title reverts to normal positioning
     *
     * @function setupScene
     */

    this.setupScene = function() {

        if (this.sceneFixTitle) {
            this.sceneFixTitle.destroy(true);
        }

        // ScrollMagic Safari/Firefox bug
        // https://github.com/janpaepke/ScrollMagic/issues/458
        var scrollTop = cache.$window.scrollTop();

        this.sceneFixTitle = new ScrollMagic.Scene({
            triggerElement: $section.prev().get(0),
            duration: $section.prev().height(), // refreshed on resize in refreshDimensions
            triggerHook: 0,
        });

        // Fix and unfix title
        this.sceneFixTitle
            .on('enter', function() {
                $section.addClass('section--title-fixed');
            })
            .on('leave', function() {
                $section.removeClass('section--title-fixed');
            });

        // ScrollMagic Safari/Firefox bug
        // https://github.com/janpaepke/ScrollMagic/issues/458
        cache.$window.scrollTop(scrollTop);

        this.sceneFixTitle.addTo(controller.props.scrollScenes);
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
            controller.emitter.on('window:resize', this.events.refreshDimensions);
            cache.$window.on('scroll', this.events.pageScroll);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('window:resize', this.events.refreshDimensions);
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
        //console.log(progress);
    };

    /**
     * Get and store dimensions
     * @method refreshDimensions
     */

    this.refreshDimensions = function() {
        if (this.sceneFixTitle) {
            this.sceneFixTitle.duration($section.prev().height());
        }
    };


    /**
     * Destroy all
     * @method destroy
     */

    this.destroy = function() {
        this.attachDetachEvents(false);

        if (this.sceneFixTitle) {
            this.sceneFixTitle.destroy(true);
        }
    };

    this.init();
};
