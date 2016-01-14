/** @module sectionCuriousPlayfulInformative */

/*globals Power4:true */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    _base = require('../_base/_base.js'),
    _ = require('underscore'),
    TweenMax = require('gsap/src/uncompressed/TweenMax.js');

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
     * @property {boolean} ballCloned have we cloned ball1 and appended to .rotator?
     * @property {boolean} ballDropped have we dropped ball1?
     * @property {boolean} sectionLeaveEventOn have we added the section leave event?
     * @property {number} sectionHeight
     * @property {number} sectionTopRotateStart waypoint position (px) at which to start rotation
     * @property {number} sectionHalfway waypoint position (px) halfway through section
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
        ballCloned: false,
        ballDropped: false,
        sectionLeaveEventOn: false,
        sectionHeight: null,
        sectionTopRotateStart: null, //
        sectionHalfway: null
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
     * @property {function} sectionLeave
     */

    this.events.pageScroll = null;
    this.events.refreshDimensions = null;
    this.events.sectionLeave = null;

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
        this.events.sectionLeave = dropBall.bind(this);

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

                if (!props.sectionLeaveEventOn && !props.ballDropped) {
                    controller.emitter.on('section:sectionLeave', this.events.sectionLeave);
                    props.sectionLeaveEventOn = true;
                }

                if (!props.ballCloned) {
                    controller.emitter.emit('balls:cloneBall1', cache.$rotator);
                    props.ballCloned = true;
                }

            }.bind(this))
            .on('leave', function() {
                $section.removeClass('section--title-fixed');
            });

        // ScrollMagic Safari/Firefox bug
        // https://github.com/janpaepke/ScrollMagic/issues/458
        cache.$window.scrollTop(scrollTop);

        this.sceneFixTitle.addTo(controller.props.scrollScenes);
    };

    /**
     * Drop ball out of view when leaving scene
     *
     * @function dropBall
     * @param {jQuery} $sectionLeaving
     * @param {event} e scrollMagic event
     */

    var dropBall = function($sectionLeaving, e) {
        if ($sectionLeaving === $section &&
            e.scrollDirection === 'FORWARD' &&
            props.ballCloned &&
            !props.ballDropped) {

            TweenMax.to($section.find('.ball'), 0.4, {
                x: '-=' + controller.props.windowHeight * 2, // ball going down, but is rotated 90
                                                             // so need to use X-axis
                ease: Power4.easeIn,
                onComplete: function() {
                    props.ballDropped = true;
                }
            });

            if (props.sectionLeaveEventOn) {
                controller.emitter.removeListener('section:sectionLeave', this.events.sectionLeave);
                props.sectionLeaveEventOn = false;
            }

        }
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
            controller.emitter.on('window:resize', this.events.refreshDimensions);
            //controller.emitter.on('section:sectionLeave', this.events.sectionLeave); added on entering scene
            cache.$window.on('scroll', this.events.pageScroll);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('window:resize', this.events.refreshDimensions);
            controller.emitter.removeListener('section:sectionLeave', this.events.sectionLeave);
            cache.$window.off('scroll', this.events.pageScroll);
        }
    };

    /**
     * On scroll: rotate surface from 0 to 90/-90 degrees depending on mouse position
     * @method pageScroll
     */

    this.rotateSurface = function() {
        var progress = Math.min(Math.max((cache.$window.scrollTop() - props.sectionTopRotateStart), 0) / (props.sectionHalfway - props.sectionTopRotateStart), 1),
            rotate = props.surfaceStyles.end.rotate * progress,
            translate = props.surfaceStyles.start.translate - (props.surfaceStyles.start.translate * progress);

        cache.$rotator.css('transform', 'translateX(' + translate + 'vw)  rotate(' + rotate + 'deg)');
    };

    /**
     * Get and store dimensions
     * @method refreshDimensions
     */

    this.refreshDimensions = function() {
        props.sectionHeight = $section.height();
        props.sectionTopRotateStart = $section.offset().top  - (controller.props.windowHeight / 3); // starts 1/3 of window above sectionTop
        props.sectionHalfway = props.sectionTopRotateStart + (props.sectionHeight / 2);
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
