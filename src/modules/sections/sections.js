/** @module Sections */
/*globals console*/

var $ = require('jquery');

/**
 * jQuery elements
 * @namespace cache
 * @property {jQuery} window
 * @property {jQuery} originalSections sections stored once for duplication
 * @property {jQuery} currentSections live sections
 */

var cache = {
    $window: $(window),
    $originalSections: null,
    $currentSection: null
};

/**
 * Common JS for all section components
 * @constructor Section
 * @param {object} controller
 * @param {jQuery} $sections
 */

var Sections = module.exports = function(controller, $sections) {
    'use strict';

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @function init
     */

    var init = function() {

        // Cache sections for later duplication
        cacheOriginalSections();

        cache.$window.on('sections:duplicateSections', duplicateSections);


    };


    /**
     * Cache sections once for later duplication
     * @function cacheOriginalSections
     */

    var cacheOriginalSections = function() {
        cache.$originalSections = $sections.find('.section').clone();
    };

    /**
     * Duplicate previous sections so that they appear in an infinite loop
     * @function duplicateSections
     */

    var duplicateSections = function(event, section) {
        var $section = $(section);
        // Only duplicate if there are no sections after current "last" section
        if (!$section.next().length) {
            // Duplicate and append original sections
            $sections.append(cache.$originalSections.clone());

            // Reset everything
            reset();
        }
    };

    /**
     * Reset all component behaviour, remove handlers
     * @function reset
     */

    var reset = function() {

        controller.resetScrollScenes();

        // @TODO this seems like the wrong place for this
        var sections = [],
            $sections = $('.section'),
            sectionsLength = $sections.length;

        // Re-init each section
        // $('.section').each(function(index, item) {
        //     sections[index] = new Section(index, $(item), sectionsLength);
        // });

    };

    init();

    return this;

};
