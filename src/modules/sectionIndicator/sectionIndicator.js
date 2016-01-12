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
        $sections: $('.section')
    };

    /**
     * Module properties, states and settings
     * @namespace $prop
     * @property {object} waypoints
     * @property {number} scrollToFitViewportTimeout
     * @property {number} scrollDuration time auto scrolling on click should take
     * @property {boolean} isScrolling are we currently auto scrolling
     * @property {number} linkSize height / width of link buttons
     * @property {number} linkMargin bottom margin of link buttons
     */

    var props = {
        waypoints: {},
        scrollToFitViewportTimeout: null,
        scrollDuration: 0.8,
        isScrolling: false,
        linkSize: 16,
        linkMargin: 10
    };

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} resize
     * @property {function} pageScroll
     */

    this.events.resize = null;
    this.events.pageScroll = null;

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

        // Attach events
        this.attachDetachEvents(true);

        // Build list up from sections in page
        this.renderLinks();

        // Add waypoints for each section
        this.updateWaypoints();

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
            cache.$window.on('scroll', this.events.pageScroll);
        } else {
            controller.emitter.removeListener('window:resize', this.events.resize);
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
            $sectionIndicatorLink = $('<a href="#' + $section.attr('id') + '" class="sectionIndicator__link"><span class="sectionIndicator__link-ring"></span><span class="sectionIndicator__link-dot"></span></a>'),
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
        // @TODO only need top or sectionTop
        props.waypoints[id] = {
            top: (index === 0) ? 0 : top, // Set first section top to 0 so it's active on page load
            sectionTop: top, // Used for getting section top of first section
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
        var activeWaypoint = this.getActiveWaypoint(scrollTop);
        this.highlightLink(activeWaypoint);
    };

    /**
     * Check waypoints and update nav position
     *
     * @method getActiveWaypoint
     * @param {number} scrollTop
     * @returns {string} activeWaypoint
     */

    this.getActiveWaypoint = function(scrollTop) {
        var activeWaypoint = false,
            activeWaypoints = [],
            nearestWaypoint,
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

        // Store currently active waypoint
        activeWaypoint = activeWaypoints[0];

        // Clear any ScollToFitViewport that may have been previously started
        window.clearTimeout(props.scrollToFitViewportTimeout);

        // If two sections are in view (and we are not autoscrolling after clicking a nav dot):
        // - transition the sectionIndicator dot from active to next dot (_sectionIndicatorTransitionLinks)
        // - see if we need to autoscroll to section top to fit in viewport (_sectionIndicatorScrollToFitViewport)
        //

        // @TODO hook up
        if (this._sectionIndicatorTransitionStylingApplied) {
            this._sectionIndicatorRemoveTransitionStyling();
        }

        // @TODO hook up
        // if (activeWaypoints.length > 1 && !this._sectionIndicatorIsScrolling) {
        //     nearestWaypoint = this._sectionIndicatorTransitionLinks(activeWaypoints, scrollTop);
        //     this._sectionIndicatorScrollToFitViewport(scrollTop, nearestWaypoint);
        // }

        return activeWaypoint;
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
            this.getLinkFromHref(activeWaypoint).addClass('active');
        }
    };

    /**
    * Get link element from a href string
    *
    * @method getLinkFromHref
    * @param {string} href
    * @returns {jQuery}
    */

    this.getLinkFromHref = function(href) {
        return cache.$links
                .filter(function() {
                    return $(this).attr('href') === '#' + href;
                });
    };


    this.init();
};
