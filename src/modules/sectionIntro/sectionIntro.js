/** @module Section */
/*globals Power2:true, console*/

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    snap = require('snapsvg'),
    Rotator = require('../rotator/rotator.js'),
    _base = require('../_base/_base.js');

/**
 * @constructor SectionIntro
 * @param {object} controller
 * @param {jQuery} $section section element
 * @param {number} index which number section is this
 */

var SectionIntro = module.exports = function(controller, $section, index) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} window
     * @property {jQuery} $logo
     * @property {jQuery} $logoSvg logo's svg element
     */

    var cache = {
        $window: $(window),
        $logo: $section.find('.section__logo'),
        $logoSvg: $section.find('.section__logo svg')
    };

    /**
     * properties, states and settings
     * @namespace props
     * @property {number} svgLoaded
     * @property {boolean} isFirstSection is this first of ALL sections (i.e. not repeated)
     * @property {boolean} ball1Dropped has ball 1 dropped?
     * @property {object} sceneFixTitle scrollMagic scene for fixing the title in position
     */

    var props = {
        svgLoaded: false,
        isFirstSection: true,
        ball1Dropped: false,
        sceneFixTitle: null,
        rotator: null,
        rotatorOptions: {
            moveSectionTopRotateStart: 0, // @TODO add back in move start
            surfaceStyles: {
                start: {
                    gradient: 0,
                    rotate: 0
                },
                end: {
                    gradient: 0,
                    rotate: 0
                }
            },
        }
    };

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} sectionLeave
     * @property {function} resize
     */

    this.events.sectionLeave = null;
    this.events.resize = null;

    /**
     * logo svgObject created by snap.svg
     * @var {object} svgObject
     */

    var svgObject = null;

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        // Check if first sectionLeave
        props.isFirstSection = checkIfFirstSection();
        // Bind events
        this.events.sectionLeave = this.sectionLeave.bind(this);
        this.events.resize = this.refreshDimensions.bind(this);
        // Set up screen rotation on scrolling
        props.rotator = new Rotator(controller, $section, props.rotatorOptions);
        // Attach events
        this.attachDetachEvents(true);

        // Set associated module.
        // @TODO avoid accessing other module directly. event instead?
        controller.props.sections[index].props.associatedModule = this;

        if (!props.isFirstSection) {
            // ScrollMagic scene
            this.setupScene();
        }


        // Load the SVG
        var svgUrl = $section.data('svg-url');
        this.loadSVG(svgUrl);
    };

    /**
     * @method checkIfFirstSection
     * @returns {boolean}
     */

    var checkIfFirstSection = function() {
        return $('.section--intro').get(0) === $section.get(0);
    };

    /**
     * @method attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
            // On leave: drop ball
            if (!props.ball1Dropped) {
                controller.emitter.on('section:sectionLeave', this.events.sectionLeave);
            }
            // Refresh dimensions on resize
            controller.emitter.on('window:resize', this.events.resize);
            props.rotator.attachDetachEvents(true);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('section:sectionLeave', this.events.sectionLeave);
            controller.emitter.removeListener('window:resize', this.events.resize);
            props.rotator.attachDetachEvents(false);
        }
    };

    /**
     * @function loadSVG
     * @param {string} url
     */

    this.loadSVG = function(url) {

        if (props.svgLoaded || !url) {
            return;
        }

        svgObject = snap(cache.$logoSvg.get(0));
        snap.load(url, function(loadedSVG) {
            // Add SVG
            svgObject.append(loadedSVG);

            props.svgLoaded = true;

            if (props.isFirstSection) {

                // If autoscrolling, this may indicate sections are still being removed,
                // so positions will be wrong. If so, defer until autoscroll complete
                if (controller.props.autoScrolling) {
                    controller.emitter.once('window:autoScrollingEnd', this.measureAndShowBalls.bind(this));
                }

                this.measureAndShowBalls();

            }

        }.bind(this));
    };

    /**
     * @method measureAndShowBalls
     */

    this.measureAndShowBalls = function() {
        // Only run after snap.svg has done it's stuff
        if (!svgObject) {
            return;
        }

        // Temporarily show balls in background image for measuring
        cache.$logo.removeClass('section__logo--with-svg');
        // Measure balls within SVGs
        var ball1ClientRect = svgObject.select('#ball1').node.getBoundingClientRect(),
            ball2ClientRect = svgObject.select('#ball2').node.getBoundingClientRect(),
            ball1JQueryOffset = $section.find('#ball1').offset(),
            ball2JQueryOffset = $section.find('#ball2').offset(),
            ball1Position = {
                top: ball1JQueryOffset.top, // For some reason, this jQuery value is accurate
                                            // in iOS following address bar resize
                                            // when ClientRect is not
                left: ball1JQueryOffset.left,
                width: ball1ClientRect.width,
                height: ball1ClientRect.height
            },
            ball2Position = {
                top: ball2JQueryOffset.top,
                left: ball2JQueryOffset.left,
                width: ball2ClientRect.width,
                height: ball2ClientRect.height
            };

        // Hide background image
        cache.$logo.addClass('section__logo--with-svg');

        //@TODO promise
        if (!props.ball1Dropped){
            controller.emitter.emit('balls:showBall1', ball1Position);
        }
        controller.emitter.emit('balls:showBall2', ball2Position);
    };

    /**
     * On leaving component: drop ball and stop listening for resizes
     * @method sectionLeave
     * @param {jquery} $sectionLeave
     */

    this.sectionLeave = function($sectionLeave) {
        // When leaving this section, trigger ball1Drop
        if ($sectionLeave.get(0) === $section.get(0)) {
            controller.emitter.emit('balls:ball1Drop', $section);
            controller.emitter.removeListener('section:sectionLeave', this.events.sectionLeave);
            props.ball1Dropped = true;
        }
    };

    /**
     * ScrollMagic scene
     * When repeating the section, it should be pinned behind the last section of previous set
     *
     *
     * @function setupScene
     */

    this.setupScene = function() {

        if (props.sceneFixTitle) {
            props.sceneFixTitle.destroy(true);
        }

        // ScrollMagic Safari/Firefox bug
        // https://github.com/janpaepke/ScrollMagic/issues/458
        var scrollTop = cache.$window.scrollTop();

        props.sceneFixTitle = new ScrollMagic.Scene({
            triggerElement: $section.prev().get(0),
            duration: $section.prev().height(), // refreshed on resize in refreshDimensions
            triggerHook: 0,
        });

        // Fix and unfix title
        props.sceneFixTitle
            .on('enter', function() {
                $section.addClass('section--title-fixed');
            }.bind(this))
            .on('leave', function() {
                $section.removeClass('section--title-fixed');
            }.bind(this));

        // ScrollMagic Safari/Firefox bug
        // https://github.com/janpaepke/ScrollMagic/issues/458
        cache.$window.scrollTop(scrollTop);

        props.sceneFixTitle.addTo(controller.props.scrollScenes);
    };

    /**
     * Get and store dimensions
     * @method refreshDimensions
     */

    this.refreshDimensions = function() {
        if (props.isFirstSection) {
            this.measureAndShowBalls();
        }


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

        if (props.sceneFixTitle) {
            props.sceneFixTitle.destroy(true);
        }
    };


    this.init();

};
