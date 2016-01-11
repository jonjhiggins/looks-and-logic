/** @module Sections */
/*globals console*/

var $ = require('jquery'),
    Section = require('./../../modules/section/section'),
    SectionIntro = require('./../../modules/sectionIntro/sectionIntro'),
    SectionMakingDigitalHuman = require('./../../modules/sectionMakingDigitalHuman/sectionMakingDigitalHuman');

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
     * Make sure index is counted on from previously removed sections
     * @method initSections
     */

    this.initSections = function() {

        var $section = $sections.find('.section'),
            sectionsLength = $section.length + this.props.removedSections;

        $section.each(this.initSection.bind(this, sectionsLength));
    };

    /**
     * Init a single section with all common and specific section JS
     * @function initSection
     * @param {number} sectionsLength
     * @param {number} index
     * @param {element} item
     */

    this.initSection = function(sectionsLength, index, item) {
        var $section = $(item);

        // Init sections: common
        this.initSectionModule('section', Section, sectionsLength, index, $section);

        // Init sections: specific
        if ($section.hasClass('section--intro')) {
            this.initSectionModule('sectionIntro', SectionIntro, sectionsLength, index, $section);
        } else if ($section.hasClass('section--making-digital-human')) {
            this.initSectionModule('sectionMakingDigitalHuman', SectionMakingDigitalHuman, sectionsLength, index, $section);
        }
    };

    /**
     * Init a section module (either section, sectionIntro, sectionMakingDigitalHuman.. etc)
     * Only init new sections
     *
     * @method initSectionModule
     * @param {number} moduleName
     * @param {function} ModuleConstructor
     * @param {number} sectionsLength
     * @param {number} index
     * @param {jquery} $section
     */

    this.initSectionModule = function(moduleName, ModuleConstructor, sectionsLength, index, $section) {

        moduleName = moduleName + 's';

        var sectionIndex = index + this.props.removedSections,
            sectionObject = controller.props[moduleName][sectionIndex];

        if (typeof sectionObject === 'undefined' || !sectionObject) {
            controller.props[moduleName][sectionIndex] = new ModuleConstructor(controller, $section, sectionIndex, sectionsLength);
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

            // When there's too many sections in DOM, remove some
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

        // If we're currently scrolling, wait. Then run when finished scrolling
        if (controller.props.autoScrolling) {
            controller.emitter.once('window:autoScrollingEnd', this.removeSections.bind(this, $lastSection));
            return;
        }

        var sectionGroupLength = cache.$originalSections.length,
            startIndex = this.props.removedSections,
            countIndex = startIndex,
            endIndex = this.props.removedSections + sectionGroupLength,
            autoScollEndTimeout = null;

        // Begin autoscrolling section (scrolling to keep browser in same place)
        controller.emitter.emit('window:autoScrollingStart');

        // Remove sections and keep browser scroll in place
        while(countIndex < endIndex) {
            removeSection(countIndex);
            countIndex++;
        }

        // Fallback incase scroll isn't triggered on removing sections
        autoScollEndTimeout = window.setTimeout(this.autoScrollingEnd, 500);

        // Scroll is triggered when removed sections cause page to scroll up
        cache.$window.one('scroller', this.autoScrollingEnd.bind(this, autoScollEndTimeout));





        this.props.removedSections += sectionGroupLength;
        this.props.duplicateSectionsCount--;
    };

    /**
     * Call autoScrollingEnd event
     * @method autoScrollingEnd
     * @param {number} autoScollEndInterval timeout object
     */

    this.autoScrollingEnd = function(autoScollEndInterval) {
        // End autoscrolling section
        if (autoScollEndInterval) {
            window.clearInterval(autoScollEndInterval);
        }
        controller.emitter.emit('window:autoScrollingEnd');
    };

    /**
     * Remove a single section. Also destroy any associated modules
     * @function removeSection
     * @param {number} countIndex
     */

     var removeSection = function (countIndex) {
         var $thisSection = $sections.find('#section--' + countIndex),
             thisSectionHeight = $thisSection.height(),
             thisSectionAssociatedModule = controller.props.sections[countIndex].props.associatedModule,
             windowScrollTop = cache.$window.scrollTop(); // Needs to be re-check for each removed section
         // Trigger destroy method
         controller.props.sections[countIndex].destroy();
         // Destroy any associated modules
         if (thisSectionAssociatedModule) {
             thisSectionAssociatedModule.destroy();
         }
         // Remove from DOM
         $thisSection.remove();
         // Keep browser scroll in same position following the removal
         // of this element (which sits above current scroll position)
         cache.$window.scrollTop(windowScrollTop - thisSectionHeight);
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
