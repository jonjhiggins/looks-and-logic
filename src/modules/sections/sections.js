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
        $('.section').each(initSection.bind(null, sectionsLength));

        // Init sections: specific
        $('.section--intro').each(initSectionIntro);
        $('.section--making-digital-human').each(initSectionMakingDigitalHuman);
        $('.section--curious-playful-informative').each(initSectionCuriousPlayfulInformative);


    };

    /**
     * Init a standard section. Only init new sections
     * @function initSection
     * @param {number} sectionsLength
     * @param {number} index
     * @param {element} section
     */

    var initSection = function(sectionsLength, index, section) {
        var sectionObject = controller.props.sections[index];
        if (typeof sectionObject === 'undefined' || !sectionObject) {
            controller.props.sections[index] = new Section(controller, $(section), index, sectionsLength);
        }
    };

    /**
     * Init a curiousPlayfulInformative section. Only init new sections
     * @function initSectionCuriousPlayfulInformative
     * @param {number} index
     * @param {element} section
     */

    var initSectionCuriousPlayfulInformative = function(index, section) {
        var sectionObject = controller.props.sectionCuriousPlayfulInformatives[index];
        if (typeof sectionObject === 'undefined' || !sectionObject) {
            var $section = $(section);
            controller.props.sectionCuriousPlayfulInformatives[index] = new SectionCuriousPlayfulInformative(controller, $section, $section.index());
        }
    };

    /**
     * Init a initSectionIntro section. Only init new sections
     * @function initSectionIntro
     * @param {number} index
     * @param {element} section
     */

    var initSectionIntro = function(index, section) {
        var sectionObject = controller.props.sectionIntros[index];
        if (typeof sectionObject === 'undefined' || !sectionObject) {
            var $section = $(section);
            controller.props.sectionIntros[index] = new SectionIntro(controller, $section, $section.index());
        }
    };

    /**
     * Init a initSectionMakingDigitalHuman section. Only init new sections
     * @function initSectionMakingDigitalHuman
     * @param {number} index
     * @param {element} section
     */

    var initSectionMakingDigitalHuman = function(index, section) {
        var sectionObject = controller.props.sectionMakingDigitalHumans[index];
        if (typeof sectionObject === 'undefined' || !sectionObject) {
            var $section = $(section);
            controller.props.sectionMakingDigitalHumans[index] = new SectionMakingDigitalHuman(controller, $section, $section.index());
        }
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
