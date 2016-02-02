/** @module sectionCuriousPlayfulInformative */

/*globals Power4:true */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    _base = require('../_base/_base.js'),
    Rotator = require('../rotator/rotator.js'),
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
     */

    var cache = {
        $window: $(window),
        $rotatorSurface: $('.rotator__surface')
    };

    /**
     * Module properties, states and settings
     * @namespace props
     * @property {boolean} ballCloned have we cloned ball1 and appended to .rotator?
     * @property {boolean} ballDropped have we dropped ball1?
     * @property {boolean} sectionLeaveEventOn have we added the section leave event?
     * @property {object} rotator screen rotation module
     * @property {object} rotatorOptions options for screen rotation module
     */

    var props = {
        ballCloned: false,
        ballDropped: false,
        sectionLeaveEventOn: false,
        rotator: null,
        rotatorOptions: {
            startVertical: false,
            moveSectionTopRotateStart: -1 / 3, // starts before scrolling into section top (1/3 of window above sectionTop)
            //moveSectionTopRotateStart: 0, // @TODO add back in move start
            rotateClockwise: false,
            surfaceStyles: {
                start: {
                    translate: 0,
                    gradient: 66.6,
                    rotate: 0
                },
                end: {
                    translate: -50,
                    gradient: 50,
                    rotate: -90
                }
            },
        }
    };

    /**
     * ScrollMagic scene for fixing the title in position
     * @property {object} sceneFixTitle
     */

    this.sceneFixTitle = null;

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} refreshDimensions
     * @property {function} sectionLeave
     */

    this.events.refreshDimensions = null;
    this.events.sectionLeave = null;

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {

        this.refreshDimensions();

        // Set up screen rotation on scrolling
        props.rotator = new Rotator(controller, $section, props.rotatorOptions);

        // Bind events
        this.events.refreshDimensions = this.refreshDimensions.bind(this);
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
     * title reverts to normal positioning. Also add event for leaving scene to dropBall
     *
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
                    controller.emitter.emit('balls:cloneBall1', cache.$rotatorSurface);
                    props.ballCloned = true;
                }

            }.bind(this))
            .on('leave', function() {
                $section.removeClass('section--title-fixed');
            }.bind(this));

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

            var $ball = cache.$rotatorSurface.find('.ball');

            TweenMax.to($ball, 0.4, {
                x: '-=' + controller.props.windowHeight * 2, // ball going down, but is rotated 90
                                                             // so need to use X-axis
                ease: Power4.easeIn,
                onComplete: function() {
                    props.ballDropped = true;
                    controller.emitter.emit('balls:removeClonedBall1', $ball);
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
            //controller.emitter.on('section:sectionLeave', this.events.sectionLeave); added above on entering scene
            cache.$window.on('scroll', this.events.pageScroll);
            props.rotator.attachDetachEvents(true);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('window:resize', this.events.refreshDimensions);
            controller.emitter.removeListener('section:sectionLeave', this.events.sectionLeave);
            cache.$window.off('scroll', this.events.pageScroll);
            props.rotator.attachDetachEvents(false);
        }
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
        props.rotator.destroy();

        if (this.sceneFixTitle) {
            this.sceneFixTitle.destroy(true);
        }
    };

    this.init();
};
