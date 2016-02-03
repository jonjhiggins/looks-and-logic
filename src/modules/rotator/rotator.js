/** Provides screen-rotation effect on scroll
 *
 * @module rotator
 */

var $ = require('jquery'),
    _base = require('../_base/_base.js'),
    _ = require('underscore'),
    TweenMax = require('gsap/src/uncompressed/TweenMax.js');

/**
 * @constructor rotator
 * @param {object} controller
 * @param {jQuery} $section
 * @param {object} options
 */

var rotator = module.exports = function(controller, $section, options) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    var $rotator = $('.rotator');

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} $window
     * @property {jQuery} $rotatorSurface
     */

    var cache = {
        $window: $(window),
        $rotatorSurface: $rotator.find('.rotator__surface'),
        $rotatorRotation: $rotator.find('.rotator__rotation')
    };

    /**
     * Module properties, states and settings
     * @namespace props
     * @property {number} moveSectionTopRotateStart float to specify how many viewports up or down to start rotation
     * @property {object} surfaceStyles start/end styles for surface to animate between on scroll
     * @property {number} sectionHeight
     * @property {number} sectionTopRotateStart waypoint position (px) at which to start rotation
     * @property {number} sectionBottom waypoint position (px) bottom of section
     */

    var props = {
        moveSectionTopRotateStart: options.moveSectionTopRotateStart,
        moveSectionBottomRotateEnd: options.moveSectionTopRotateStart ? options.moveSectionTopRotateStart : 0,
        surfaceStyles: options.surfaceStyles,
        sectionHeight: null,
        sectionTopRotateStart: null, //
        sectionBottom: null,
    };

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} refreshDimensions
     * @property {function} pageScroll
     */

    this.events.refreshDimensions = null;
    this.events.pageScroll = null;

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

        // Set start styles
        this.rotateSurface();

        // Attach events
        // this.attachDetachEvents(true); this is called from the section module
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {

            // BUG / SHAME
            // for some reason, on repeating sections the 2nd time, 1st set of sections don't
            // get scroll event added, unless there's this timeout :/
            window.setTimeout(function() {
                cache.$window.on('scroll', this.events.pageScroll);
            }.bind(this), 100);

            controller.emitter.on('window:resize', this.events.refreshDimensions);
        } else {
            cache.$window.off('scroll', this.events.pageScroll);
            controller.emitter.removeListener('window:resize', this.events.refreshDimensions);
        }
    };

    /**
     * Get and store dimensions
     * @method refreshDimensions
     */

    this.refreshDimensions = function() {

        props.sectionHeight = $section.height();

        // curiousPlayful rotation starts before scrolling into section top (1/3 of window above sectionTop)
        // markRaul and clients rotation starts when scrolling into section top
        props.sectionTopRotateStart = $section.offset().top + (controller.props.windowHeight * props.moveSectionTopRotateStart);

        if (props.moveSectionBottomRotateEnd) {
            props.sectionBottom = $section.offset().top + (props.sectionHeight - props.moveSectionBottomRotateEnd);
        } else {
            props.sectionBottom = $section.offset().top + (props.sectionHeight);
        }


    };

    /**
     * On scroll: rotate surface to a given angle
     * @method rotateSurface
     */

    this.rotateSurface = function() {

        // Sometimes throttled event is delayed until after module has been destroyed
        // Can't see a way of cancelling underscore's throttled event (lo-dash does seem to have that option)
        if (!props) {
            return;
        }

        var scrollTop = cache.$window.scrollTop();

        // Only run calculations and set styles if section is in view
        if (sectionIsInView(scrollTop)) {
            var progress = (scrollTop - props.sectionTopRotateStart) / (props.sectionBottom - props.sectionTopRotateStart),
                rotate = props.surfaceStyles.start.rotate + ((props.surfaceStyles.end.rotate  - props.surfaceStyles.start.rotate) * progress),
                scale = getGradientScale(controller.props.windowWidth, props.sectionHeight , rotate),
                surfaceHeight = props.surfaceStyles.start.gradient + ((props.surfaceStyles.end.gradient - props.surfaceStyles.start.gradient) * progress);

            setRotatorStyles(rotate, surfaceHeight, scale);
        }

    };

    /**
     * Is section that called rorator in view?
     *
     * @function sectionIsInView
     * @param {number} scrollTop window's scrolltop
     */

    var sectionIsInView = function(scrollTop) {
        return (scrollTop >= props.sectionTopRotateStart) && (scrollTop < props.sectionBottom);
    };

    /**
     * Update visual appearance of rotator
     * Both a linear-gradient (to totally fill viewport) and an element are used (so the ball can sit on it as it's rotated)
     *
     * @function setRotatorStyles
     * @param {number} rotate angle surface should rotate to
     * @param {number} surfaceHeight height of the surface within the rotator
     * @param {number} scale scale the surface's parent needs to be increased to fill the viewport
     */

    var setRotatorStyles = function(rotate, surfaceHeight, scale) {
        $rotator.css('background-image', ' linear-gradient(' + rotate + 'deg, #000 ' + surfaceHeight + '%, transparent ' + surfaceHeight + '%)');
        cache.$rotatorRotation.css('transform', 'scale(' + scale + ')  rotate(' + rotate + 'deg)');
        cache.$rotatorSurface.css('height', surfaceHeight + '%');
    };

    /**
     * How much do elements need to be scaled up so that gradient background will cover screen
     *
     * @function getGradientScale
     * @param {number} W width
     * @param {number} H height
     * @param {number} A angle in degrees
     */

    var getGradientScale = function(W, H, A) {
      var gradLine = getGradientLineLength(W, H, A);
      return gradLine / H;
    };

    /**
     * Get length of gradient line running through a box
     * Gradients have to be scaled up at certain angles to fill their container
     * https://drafts.csswg.org/css-images/#linear-gradient-syntax
     *
     *
     * @function getGradientLineLength
     * @param {number} W width
     * @param {number} H height
     * @param {number} A angle in degrees
     */

    var getGradientLineLength = function(W, H, A) {
      var radianAngle = A * Math.PI / 180; // Convert to radian
      return Math.abs(W * Math.sin(radianAngle)) + Math.abs(H * Math.cos(radianAngle));
    };

    /**
     * Destroy all
     * @method destroy
     */

    this.destroy = function() {
        this.attachDetachEvents(false);
        props = null;
    };

    this.init();
};
