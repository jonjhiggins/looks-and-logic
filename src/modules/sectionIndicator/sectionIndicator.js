/** @module sectionIndicator */

var $ = require('jquery'),
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
        $list: $('#sectionIndicator > .sectionIndicator__list'),
        $links: null, // created via JS
        $sections: $('.section')
    };

    /**
     * Module properties, states and settings
     * @namespace $prop
     * @property {object} waypoints
     * @property {number} scrollToFitViewportTimeout
     */

    var props = {
        waypoints: {},
        scrollToFitViewportTimeout: null
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

        // Bind events
        this.events.resize = this.resize.bind(this);
        this.events.pageScroll = _.throttle(this.scrollResize.bind(this));

        // Attach events
        this.attachDetachEvents(true);

        // Build list up from sections in page
        cache.$sections.each(this.buildItem.bind(this));
        cache.$links = $('#sectionIndicator .sectionIndicator__link');

        // Add waypoints for each component
        this.updateWaypoints();

        /*globals console*/
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
     * Build each item in the sectionIndicator from sections in page
     * @method buildItem
     * @property {number} index
     * @property {element} item
     */

    this.buildItem = function(index, item) {
        // Build item
        var $section = $(item),
            $sectionIndicatorItem = $('<li class="sectionIndicator__item"></li>'),
            $sectionIndicatorLink = $('<a href="#' + $section.attr('id') + '" class="sectionIndicator__link"><span class="sectionIndicator__link-ring"></span><span class="sectionIndicator__link-dot"></span></a>');

        // Add item to DOM
        cache.$list.append($sectionIndicatorItem.append($sectionIndicatorLink));
        // @TODO click event
        //$componentIndicatorLink.on('click', this._componentIndicatorOnClickLink.bind(this, $componentIndicatorLink));
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
        // @TODO only need top or componentTop
        props.waypoints[id] = {
            top: (index === 0) ? 0 : top, // Set first section top to 0 so it's active on page load
            componentTop: top, // Used for getting section top of first section
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
            componentTriggerHook = controller.props.windowHeight;

        // Find components currently in view and add to activeWaypoints array
        $.each(props.waypoints, function(key) {
            var waypoint = props.waypoints[key];

            if ((scrollTop >= (waypoint.top - componentTriggerHook)) && (scrollTop <= (waypoint.bottom - 1))) {
                activeWaypoints.push(key);
            }

            if (activeWaypoints.length > 1) {
                return false; // Can only be two waypoints being transitioned in componentIndicator, break out of loop
            }
        });

        // Store currently active waypoint
        activeWaypoint = activeWaypoints[0];

        // Clear any ScollToFitViewport that may have been previously started
        window.clearTimeout(props.scrollToFitViewportTimeout);

        // If two components are in view (and we are not autoscrolling after clicking a nav dot):
        // - transition the componentIndicator dot from active to next dot (_componentIndicatorTransitionLinks)
        // - see if we need to autoscroll to component top to fit in viewport (_componentIndicatorScrollToFitViewport)
        //

        // @TODO hook up
        if (this._componentIndicatorTransitionStylingApplied) {
            this._componentIndicatorRemoveTransitionStyling();
        }

        // @TODO hook up
        // if (activeWaypoints.length > 1 && !this._componentIndicatorIsScrolling) {
        //     nearestWaypoint = this._componentIndicatorTransitionLinks(activeWaypoints, scrollTop);
        //     this._componentIndicatorScrollToFitViewport(scrollTop, nearestWaypoint);
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
        console.log( cache.$links);
        return cache.$links
                .filter(function() {
                    console.log($(this).attr('href'), '#' + href);
                    return $(this).attr('href') === '#' + href;
                });
    };


    this.init();
};
