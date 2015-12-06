/** @module Sections */
/*globals console*/

var $ = require('jquery'),
    Section = require('./../../modules/section/section'),
    SectionIntro = require('./../../modules/sectionIntro/sectionIntro'),
    SectionMakingDigitalHuman = require('./../../modules/sectionMakingDigitalHuman/sectionMakingDigitalHuman'),
    SectionCuriousPlayfulInformative = require('./../../modules/sectionCuriousPlayfulInformative/sectionCuriousPlayfulInformative');

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

        // Attach events
        controller.emitter.on('sections:duplicateSections', duplicateSections);
        controller.emitter.on('window:resize', refreshDimensions);

        initSections();

    };

    /**
     * Init all common and specific section JS
     * @function initSections
     */

    var initSections = function() {

        var sectionsLength = $sections.find('.section').length;

        // Init sections: common


        $('.section').each(function (index, item) {
            var sectionObject = controller.props.sections[index];
            // Only init new sections
            if (typeof sectionObject === 'undefined' || !sectionObject) {
                controller.props.sections[index] = new Section(controller, $(item), index, sectionsLength);
            }
        });

        // Init sections: specific
        var $sectionIntro = $('.section--intro'),
        	$sectionMakingDigitalHuman = $('.section--making-digital-human'),
        	$sectionCuriousPlayfulInformative = $('.section--curious-playful-informative');

            $sectionIntro.each(function(index, item) {
                var $section = $(item),
                    isLastSectionIntro = index === ($sectionIntro.length - 1);
                new SectionIntro(controller, $section, $section.index(), isLastSectionIntro);
            });

            $sectionMakingDigitalHuman.each(function(index, item) {
                var $section = $(item);
                new SectionMakingDigitalHuman(controller, $section, $section.index());
            });

            $sectionCuriousPlayfulInformative.each(function(index, item) {
                var $section = $(item);
                new SectionCuriousPlayfulInformative(controller, $section, $section.index());
            });
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
     * Refresh dimensions
     * @function refreshDimensions
     */

     var refreshDimensions = function () {
         // Update scene duration for each section (as based off section/viewport height)
         $.each(controller.props.sections, function(index, item) {
             var scene = item.props.scene;
             scene.duration(item.props.$section.height());
        });
     };

    /**
     * Reset all component behaviour, remove handlers
     * @function reset
     */

    var reset = function() {
        controller.emitter.emit('sections:reset');

        // Need to reset each section

        initSections();

    };

    init();

    return this;

};
