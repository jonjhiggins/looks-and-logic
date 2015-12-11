/**
    Provides a button that automatically scrolls a user down a screen
    at a time. Is hidden as soon as the user free-scrolls (mouse/mousewheel/touch)
    and is never shown again.

    @module ArrowDownButton */

/*globals Power2:true, console*/

var $ = require('jquery'),
    TweenLite = require('./../../../node_modules/gsap/src/uncompressed/TweenLite.js'),
    ScrollToPlugin = require('./../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js'),
    _base = require('../_base/_base.js');

var options = {
    scrollDownDuration: 0.8
};

var $button = $('#arrowDownButton'),
    $window = $(window),
    $currentSection = $('.section').eq(0); //@TODO change depending on scroll position


/**
 * @constructor ArrowDownButton
 * @param {object} controller
 */

var ArrowDownButton = module.exports = function(controller) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} sectionsInited
     */

    this.events.sectionsInited = null;

    /**
     * @function init
     */

    this.init = function() {
        // Don't initialise if arrowDownButton has already been hidden.
        // It only shows once
        if (!controller.props.arrowDownButton) {
            return;
        }

        // Bind events
        this.events.sectionsInited = this.setInitialHash.bind(this);
        // Attach events
        this.attachDetachEvents(true);
        // Everything else
        buttonShow();
        this.setInitialHash();
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
            $button.on('click', buttonClick);
            $window.on('scroll', pageScroll); // @TODO debounce
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            $button.off('click', buttonClick);
            $window.off('scroll', pageScroll);
            controller.emitter.removeListener('section:sectionsInited', this.events.sectionsInited); // Added in setInitialHash
        }
    };



    /**
     * Set hash/href of button to next section
     * @method setInitialHash
     */

    this.setInitialHash = function() {

        var $nextSection = controller.getNextSection($currentSection),
            nextSectionId = $nextSection.attr('id');
        if (nextSectionId) {
            $button.prop('hash', nextSectionId);
            controller.emitter.removeListener('section:sectionsInited', this.events.sectionsInited);
        } else {
            controller.emitter.on('section:sectionsInited', this.events.sectionsInited);
        }
    };

    /**
     * On clicking the arrow button
     * @function buttonClick
     */

    var buttonClick = function(e) {

        e.preventDefault();

        var hash = $(this).prop('hash'),
            sectionTop = $(hash).offset().top;

        // Update controller state
        controller.emitter.emit('arrowDownButton:autoScrollingStart');

        // Hide button while scrolling - so it doesn't cover content
        $button.addClass('arrowDownButton--is-scrolling');

        // Scroll to next section top
        TweenLite.to(window, options.scrollDownDuration, {
            scrollTo: {
                y: sectionTop
            },
            ease: Power2.easeOut,
            onComplete: scrollComplete
        });
    };

    /**
     * When page scrolling is complete: show button and update hash
     * @function scrollComplete
     */

    var scrollComplete = function() {

        var hash,
            $nextSection;

        // Update controller state. Seems to need timeout for extra scrolls after scrollComplete event
        window.setTimeout(function() {
            controller.emitter.emit('arrowDownButton:autoScrollingEnd');
        }, 300);

        // Show button following being hidden while scrolling
        $button.removeClass('arrowDownButton--is-scrolling');

        // Update button's hash to next section
        hash = $button.prop('hash');
        $currentSection = $(hash);
        $nextSection = controller.getNextSection($currentSection);

        if ($nextSection.length) {
            $button.prop('hash', '#' + $nextSection.prop('id'));
            buttonShow();
        }

    };

    /**
     * @function buttonHide
     */

    var buttonHide = function() {
        $button.addClass('hidden');
        controller.emitter.emit('arrowDownButton:off');
    };

    /**
     * @function buttonShow
     */

    var buttonShow = function() {
        changeIconColour();
        $button.removeClass('hidden');
    };

    /**
     * Change icon colour to stand out from background
     * @function changeIconColour
     */

    var changeIconColour = function() {

        var $backgroundSection; // section behind the arrowDownButton

        // If no background colour, section hasn't been inited yet
        if (!$currentSection.attr('data-background')) {
            controller.emitter.once('section:sectionsInited', changeIconColour);
            return;
        }

        // Check if next section is overlapping current section,
        // requiring arrow to take into account that section's background colour
        if (controller.props.windowHeight === $currentSection.height()) {
            $backgroundSection = $currentSection; // normal
        } else {
            $backgroundSection = controller.getNextSection($currentSection); // overlapping
        }

        if ($backgroundSection.attr('data-background') === 'white') {
            $button.attr('data-colour', 'black');
        } else {
            $button.attr('data-colour', 'white');
        }
    };

    /**
     * Hide the arrow when scrolling normally
     * @function pageScroll
     */

    var pageScroll = function(e) {
        // Only hide button when user manually scrolls
        if (!controller.props.autoScrolling) {
            $window.off('scroll', pageScroll);
            buttonHide();
        }

    };

    this.init();

};
