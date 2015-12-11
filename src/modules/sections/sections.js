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
     * properties, states and settings
     * @namespace props
     * @property {number} duplicateSectionsCount how many times have we duplicated sections?
     * @property {number} duplicateSectionsLimit max number of times sections are duped before others are removed
     * @property {number} removedSections number of sections removed from DOM
     */

    this.props = {
        duplicateSectionsCount: 0,
        duplicateSectionsLimit: 3,
        removedSections: 0
    };

    /**
     * Bound events for add/removal.
     * @namespace events
     * @property {function} duplicateSections
     */

    this.events = {
        duplicateSections: null
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {

        // Cache sections for later duplication
        cacheOriginalSections();

        // Bind events
        this.events.duplicateSections = this.duplicateSections.bind(this);

        // Attach events
        controller.emitter.on('sections:duplicateSections', this.events.duplicateSections);
        controller.emitter.on('window:resize', refreshDimensions);

        this.initSections();

    };

    /**
     * Init all common and specific section JS
     * @function initSections
     */

    this.initSections = function() {

        var $section = $sections.find('.section'),
            sectionsLength = $section.length + this.props.removedSections;

        // Init sections: common
        $section.each(initSection.bind(this, sectionsLength));

        // Init sections: specific
        // $('.section--intro').each(initSectionIntro);
        // $('.section--making-digital-human').each(initSectionMakingDigitalHuman);
        // $('.section--curious-playful-informative').each(initSectionCuriousPlayfulInformative);


    };

    /**
     * Init a standard section. Only init new sections
     * @function initSection
     * @param {number} sectionsLength
     * @param {number} index
     * @param {element} section
     */

    var initSection = function(sectionsLength, index, section) {
        var sectionIndex = index + this.props.removedSections,
            sectionObject = controller.props.sections[sectionIndex];
        if (typeof sectionObject === 'undefined' || !sectionObject) {
            controller.props.sections[sectionIndex] = new Section(controller, $(section), sectionIndex, sectionsLength);
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
     * @method duplicateSections
     * @param {jquery} $lastSection last section
     */

    this.duplicateSections = function($lastSection) {
        // Only duplicate if there are no sections after current "last" section
        if (!$lastSection.next().length) {
            // Duplicate and append original sections
            $sections.append(cache.$originalSections.clone());

            // Increase dup count
            this.props.duplicateSectionsCount++;

            if (this.props.duplicateSectionsCount >= this.props.duplicateSectionsLimit) {
                this.removeSections($lastSection);
            }

            // Reset everything
            this.reset();

        }
    };

    /**
     * Remove sections after duplication, so the browser memory isn't overloaded
     * @method removeSections
     */

    this.removeSections = function($lastSection) {
        var sectionGroupLength = cache.$originalSections.length,
            startIndex = this.props.removedSections,
            countIndex = startIndex,
            endIndex = this.props.removedSections + sectionGroupLength;

        while(countIndex < endIndex) {
            var $thisSection = $sections.find('#section--' + countIndex),
                thisSectionHeight = $thisSection.height(),
                windowScrollTop = cache.$window.scrollTop();
            // Trigger destroy method
            controller.props.sections[countIndex].destroy();
            // Remove from DOM
            $thisSection.remove();
            // Keep browser scroll in same position following the removal
            // of this element (which sits above current scroll position)
            cache.$window.scrollTop(windowScrollTop - thisSectionHeight);
            countIndex++;
        }

        this.props.removedSections += sectionGroupLength;
        this.props.duplicateSectionsCount--;
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
     * @method reset
     */

    this.reset = function() {
        controller.emitter.emit('sections:reset');

        // Need to reset each section

        this.initSections();

    };

    this.init();

    return this;

};
