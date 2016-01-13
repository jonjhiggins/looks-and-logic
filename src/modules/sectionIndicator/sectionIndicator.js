/** @module sectionIndicator */

/*globals Power2:true*/

var $ = require('jquery'),
    TweenLite = require('./../../../node_modules/gsap/src/uncompressed/TweenLite.js'),
    _base = require('../_base/_base.js'),
    raf = require('raf'),
    _ = require('underscore');

/**
 * @constructor sectionIndicator
 */

var sectionIndicator = module.exports = function(controller) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} window
     */

    var cache = {
        $window: $(window),
        $sectionIndicator: $('#sectionIndicator'),
        $links: null, // created via JS
        $sections: $('.section') // updated via JS
    };

    /**
     * Module properties, states and settings
     * @namespace props
     * @property {object} waypoints
     * @property {number} scrollToFitViewportTimeout
     * @property {number} scrollDuration time auto scrolling on click should take
     * @property {boolean} isScrolling are we currently auto scrolling
     * @property {number} linkSize height / width of link buttons
     * @property {number} linkMargin bottom margin of link buttons
     * @property {boolean} transitionStylingApplied has transition styling been applied
     * @property {number} scrollToFitViewportTriggerHook When section top hits this point in viewport, autoscroll to section top
     * @property {number} linkRingScale $componentIndicatorLinkRingScale in SCSS
     * @property {number} scrollToFitViewportWait how long to wait after last scroll before auto scrolling to fit viewport
     * @property {number} sectionsLength how long a set of sections is
     */

    var props = {
        waypoints: {},
        scrollToFitViewportTimeout: null,
        scrollDuration: 0.8,
        isScrolling: false,
        linkSize: 16,
        linkMargin: 10,
        transitionStylingApplied: false,
        scrollToFitViewportTriggerHook: 0.3,
        linkRingScale: 0.625,
        scrollToFitViewportWait: 2000,
        sectionsLength: $('.section').length
    };

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} resize
     * @property {function} pageScroll
     * @property {function} duplicateSections
     */

    this.events.resize = null;
    this.events.pageScroll = null;
    this.events.duplicateSections = null;

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {

        if (!this.shouldInit()) {
            return;
        }

        // Bind events
        this.events.resize = this.resize.bind(this);
        this.events.pageScroll = _.throttle(this.scrollResize.bind(this));
        this.events.duplicateSections = this.duplicateSections.bind(this);

        // Attach events
        this.attachDetachEvents(true);

        // Build list up from sections in page
        this.renderLinks();

        // Add waypoints for each section
        this.updateWaypoints();

        // Set highlight initial section in indicator
        this.indicatorRefresh();

    };

    /**
     * Should module be initialised?
     * (It's not for use on certain size devices)
     *
     * @method attachDetachEvents
     */

    this.shouldInit = function() {
        var query = 'screen and (orientation: landscape) and (min-width: ' + controller.props.breakpoints.medium + 'px)';
        return Modernizr.mq(query);
    };

    /**
     * @method attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('window:resize', this.events.resize);
            controller.emitter.on('sections:duplicateSections', this.events.duplicateSections);
            cache.$window.on('scroll', this.events.pageScroll);
        } else {
            controller.emitter.removeListener('window:resize', this.events.resize);
            controller.emitter.removeListener('sections:duplicateSections', this.events.duplicateSections);
            cache.$window.off('scroll', this.events.pageScroll);
        }
    };

    /**
     * Called on window resize
     *
     * @method resize
     */

    this.resize = function() {
        this.updateWaypoints();
        this.scrollResize();
    };

    /**
     * Called on scrolling and resizing
     *
     * @method scrollResize
     */

    this.scrollResize = function() {
        raf(this.indicatorRefresh.bind(this));
    };

    /**
     * Build items in the sectionIndicator from sections in page
     * @method renderLinks
     */

    this.renderLinks = function() {
        var sectionsLength = cache.$sections.length,
            indicatorHeight = sectionsLength * (props.linkSize + props.linkMargin),
            indicatorTop = (controller.props.windowHeight - indicatorHeight) / 2;

        cache.$sections.each(this.renderLink.bind(this, indicatorTop));
        cache.$links = $('.sectionIndicator__link');
    };

    /**
     * Build each item in the sectionIndicator from sections in page
     * To get mix-blend-mode to work, have to position each one fixed, rather than whole list
     *
     * @method renderLink
     * @property {number} indicatorTop top position (offset) of the indicator
     * @property {number} index
     * @property {element} item
     */

    this.renderLink = function(indicatorTop, index, item) {
        // Build item
        var $section = $(item),
            sectionTitle = $section.find('.section__title').text(),
            $sectionIndicatorLink = $('<a href="#' + $section.attr('id') + '" data-section-title="' + sectionTitle + '" class="sectionIndicator__link">' +
                                      '<span class="sectionIndicator__link-ring"></span><span class="sectionIndicator__link-dot"></span></a>'),
            topPos = indicatorTop + (index * (props.linkSize + props.linkMargin));

        cache.$sectionIndicator.append($sectionIndicatorLink);
        $sectionIndicatorLink.css('top', topPos);

        // Add click event
        $sectionIndicatorLink.on('click', this.indicatorLinkClick.bind(this));
    };

    /**
     * On clicking a indicator click
     *
     * @method indicatorLinkClick
     * @param {event} e
     */

    this.indicatorLinkClick = function(e) {

        var $sectionIndicatorLink = $(e.currentTarget),
            sectionId = $sectionIndicatorLink.attr('href').replace('#', '');

        e.preventDefault();

        $sectionIndicatorLink.addClass('scrollingTo');
        cache.$sectionIndicator.addClass('sectionIndicatorScrolling');
        props.isScrolling = true;

        // Scroll to next section top
        TweenLite.to(window, props.scrollDuration, {
            scrollTo: {
                y: props.waypoints[sectionId].top
            },
            ease: Power2.easeOut,
            onComplete: function() {
                // @TODO may need extra 50ms delay
                $sectionIndicatorLink.removeClass('scrollingTo');
                cache.$sectionIndicator.removeClass('sectionIndicatorScrolling');
                props.isScrolling = false;
            }
        });
    };

    /**
     * Update waypoints that trigger sectionIndicator actions for each section
     *
     * @method updateWaypoints
     */

    this.updateWaypoints = function() {
        cache.$sections.each(this.updateWaypoint.bind(this));
    };

    /**
     * Update waypoints that trigger sectionIndicator actions for each section
     *
     * @method updateWaypoint
     * @param {number} index
     * @param {element} item
     */

    this.updateWaypoint = function(index, item) {
        var $section = $(item),
            id = $section.attr('id'),
            top = Math.round($section.offset().top),
            bottom = Math.round($section.height() + top);

        // Add to waypoints array
        props.waypoints[id] = {
            top: top,
            bottom: bottom
        };
    };

    /**
     * Check waypoints and update nav position
     *
     * @method indicatorRefresh
     */

    this.indicatorRefresh = function() {
        var scrollTop = cache.$window.scrollTop();
        var activeWaypoints = this.getActiveWaypoints(scrollTop);
        this.highlightLink(activeWaypoints[0]); // First item in array is activeWaypoint
        this.transitionLinksAndScrollToFitViewport(activeWaypoints, scrollTop);
    };

    /**
     * On scroll, check which waypoint is active and indicate in sectionIndicator
     *
     * @method getActiveWaypoints
     * @param {number} scrollTop
     * @returns {array} activeWaypoints
     */

    this.getActiveWaypoints = function(scrollTop) {
        var activeWaypoint = false,
            activeWaypoints = [],
            sectionTriggerHook = controller.props.windowHeight;

        // Find sections currently in view and add to activeWaypoints array
        $.each(props.waypoints, function(key) {
            var waypoint = props.waypoints[key];

            if ((scrollTop >= (waypoint.top - sectionTriggerHook)) && (scrollTop <= (waypoint.bottom - 1))) {
                activeWaypoints.push(key);
            }

            if (activeWaypoints.length > 1) {
                return false; // Can only be two waypoints being transitioned in sectionIndicator, break out of loop
            }
        });

        return activeWaypoints;
    };

    /**
     * Highlight a link in list/DOM from a waypoint
     *
     * @method highlightLink
     * @param {string} activeWaypoint
     */

    this.highlightLink = function(activeWaypoint) {
        // Remove active styling
        cache.$links.removeClass('active');


        if (activeWaypoint) {
            // Add active styling
            this.getLinkFromHash(activeWaypoint).addClass('active');
        }
    };

    /**
     * If two sections are in view (and we are not autoscrolling after clicking a nav dot):
     * - transition the sectionIndicator dot from active to next dot (transitionLinks)
     * - see if we need to autoscroll to section top to fit in viewport (scrollToFitViewport)
     *
     * @method transitionLinksAndScrollToFitViewport
     * @param {array} activeWaypoints
     * @param {number} scrollTop
     */

    this.transitionLinksAndScrollToFitViewport = function(activeWaypoints, scrollTop) {

        var nearestWaypoint;

        // Clear any ScollToFitViewport that may have been previously started
        window.clearTimeout(props.scrollToFitViewportTimeout);

        // Clear any transition styling applied
        if (props.transitionStylingApplied) {
            this.removeTransitionStyling();
        }
        if (activeWaypoints.length > 1 && !props.isScrolling) {
            nearestWaypoint = this.transitionLinks(activeWaypoints, scrollTop);
            this.scrollToFitViewport(scrollTop, nearestWaypoint);
        }
    };

    /**
     * Get link element from a href string
     *
     * @method getLinkFromHash
     * @param {string} hash
     * @returns {jQuery}
     */

    this.getLinkFromHash = function(hash) {
        return cache.$links
            .filter(function() {
                return $(this).attr('href') === '#' + hash;
            });
    };

    /**
     * Remove all styling applied in transitionLinks
     *
     * @method transitionLinks
     * @param {array} activeWaypoints
     * @param {number} scrollTop
     */

    this.transitionLinks = function(activeWaypoints, scrollTop) {

        var activeWaypoint = activeWaypoints[0],
            $activeLink = this.getLinkFromHash(activeWaypoint),
            $inactiveLink = this.getLinkFromHash(activeWaypoints[1]),
            sectionTriggerHook = controller.props.windowHeight,
            activeWaypointObj = props.waypoints[activeWaypoint],
            // What percent have we scrolled from active sections's top hitting sectionTriggerHook (100%)
            // to the top of viewport (0%)
            activeWaypointPercent = (activeWaypointObj.bottom - scrollTop) / sectionTriggerHook,
            inactiveWaypointPercent = 1 - activeWaypointPercent,
            nearestWaypointIndex = (activeWaypointPercent > props.scrollToFitViewportTriggerHook) ? 0 : 1,
            nearestWaypoint;

        this.setLinkSize($activeLink, activeWaypointPercent);
        this.setLinkSize($inactiveLink, inactiveWaypointPercent);

        props.transitionStylingApplied = true;

        nearestWaypoint = activeWaypoints[nearestWaypointIndex];

        return nearestWaypoint;
    };

    /**
    * When in between components (that are 1 viewport high or less)
    * auto scroll to component top when component top is past (scrollToFitViewportTriggerHook)%
    * of viewport height and component bottom is below 100 - (scrollToFitViewportTriggerHook)% of viewport
    *
    * @method scrollToFitViewport
    * @param {number} scrollTop
    * @param {string} nearestWaypoint
    */

    this.scrollToFitViewport = function(scrollTop, nearestWaypoint) {
        var waypointTop = props.waypoints[nearestWaypoint].top,
            scrollToFitViewportTriggerHook = props.scrollToFitViewportTriggerHook * controller.props.windowHeight,
            scrollNearTop = (scrollTop < (waypointTop + scrollToFitViewportTriggerHook)) && (scrollTop !== waypointTop);

        if (scrollNearTop) {

            props.scrollToFitViewportTimeout = window.setTimeout(
                function() {
                    TweenLite.to(window, props.scrollDuration, {
                        scrollTo: {
                            y: waypointTop
                        },
                        ease: Power2.easeOut,
                    });
                },
                props.scrollToFitViewportWait
            );
        }
    };

    /**
     * set link's dot and ring size based on a percentage
     *
     * @method setLinkSize
     * @param {jQuery} $link
     * @param {number} percent
     */

    this.setLinkSize = function($link, percent) {
        var ringScaleNew = (percent * (1 - props.linkRingScale)) + props.linkRingScale;

        $link.addClass('noTransition');

        $link.find('.sectionIndicator__link-ring').css({
            'transform': 'scale(' + ringScaleNew + ') translate3d(0,0,0)', // translate3d stops jagged edges
        });

        $link.find('.sectionIndicator__link-dot').css('transform', 'scale(' + percent + ')');
    };

    /**
     * Remove all styling applied in transitionLinks
     *
     * @method removeTransitionStyling
     */

    this.removeTransitionStyling = function() {
        cache.$links
            .removeClass('noTransition')
            .find('.sectionIndicator__link-ring, .sectionIndicator__link-dot')
            .css('transform', '');

        props.transitionStylingApplied = false;
    };

    /**
     * Called when sections.js duplicates a set of sections
     *
     * @method duplicateSections
     */

    this.duplicateSections = function() {

        // If currently autoscrolling, wait and re-run when finished
        if (controller.props.autoScrolling) {
            controller.emitter.once('window:autoScrollingEnd', this.duplicateSections.bind(this));
            return;
        }

        this.reset();
        this.init();
    };

    /**
     * Reset everything
     *
     * @method reset
     */

    var extendReset = this.reset.bind(this); // extend the reset from _base.js

    this.reset = function() {
        extendReset();

        // Reset props
        props.waypoints = {};
        props.isScrolling = false;

        // Clear out and reset $sectionIndicator in DOM
        cache.$sectionIndicator
            .removeClass('sectionIndicatorScrolling')
            .empty();

        // Set selectors: only want last set of sections
        cache.$sections = $('.section').slice(-props.sectionsLength);
    };




    this.init();
};
