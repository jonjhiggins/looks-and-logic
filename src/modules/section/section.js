/** @module Section */
/*globals Power2:true, console*/

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic');

/**
 * jQuery elements
 * @namespace cache
 * @property {jQuery} window
 * @property {jQuery} originalSections sections stored once for duplication
 * @property {jQuery} $parent containing .sections element
 */

var cache = {
    $window: $(window),
    $originalSections: null,
    $parent: null
};

/**
 * ScrollMagic controller
 * @var {Object} scrollScenes
 */

var scrollScenes;

/**
 * Common JS for all section components
 * @constructor Section
 * @param {Number} sectionIndex
 * @param {jQuery} $section
 */

var Section = module.exports = function(sectionIndex, $section, totalSections) {
    'use strict';

    /**
     * Module properties, states and settings
     * @namespace $prop
     * @property {boolean} isFirst is it first section?
     * @property {boolean} isLast is it last section?
     */

    var props = {
        isFirst: (sectionIndex === 0),
        isLast: (sectionIndex === totalSections - 1)
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @function init
     */

    var init = function() {

        // Cache sections for later duplication
        if (!cache.$originalSections) {
            cacheOriginalSections();
        }

        // Run once for first section only
        if (props.isFirst) {
            initSectionController();
        }

        // Run for each section
        setBackgroundColours();
        addScrollScene();
        addId();


        // All sections initialised - must remain at end of init function
        if (props.isLast) {
            cache.$window.trigger('sections:sectionsInited');
        }
    };

    /**
     * Controller methods that only need to be run once,
     * rather than for all sections
     * @function initSectionController
     */

    var initSectionController = function() {
        scrollScenes = new ScrollMagic.Controller();
    };

    /**
     * Set the background colours of each section
     * These should alternate white/black - unless data-background-same is set to true
     * @function setBackgroundColours
     */

    var setBackgroundColours = function() {

        var background,
            previousSectionBackground = $section.prev().data('background') ? $section.prev().data('background') : $section.prev().find('.section').data('background');

        if ($section.data('section-first')) {
            // If first section set to white
            background = 'white';
        } else if ($section.data('background-same')) {
            // If background-same, repeat background of previous section
            background = previousSectionBackground;
        } else {
            // Else, reverse background of previous section
            background = previousSectionBackground === 'white' ? 'black' : 'white';
        }

        $section.attr('data-background', background);
    };

    /**
     * Add waypoint to scrollmagic controller so scroll events are triggered
     * @function addScrollScene
     */

    var addScrollScene = function() {
        var scene = new ScrollMagic.Scene({
                triggerElement: $section.get(0),
                duration: $section.height()
            })
            .on('start', function() {
                $section.trigger('sectionEnter');
                $section.attr('data-section-in-view', true);

                // On scrolling into last section, duplicate sections
                // for infinite loop effect
                if (props.isLast) {
                    duplicateSections();
                }
            })
            .on('end', function() {
                $section.trigger('sectionLeave');
                $section.attr('data-section-in-view', '');
            });

        //@TODO this shouldn't be here!
        if (sectionIndex === 1) {
            scene.setPin($section.get(0), {pushFollowers: false});
        }

        //@TODO this shouldn't be here!
        if (sectionIndex === 2) {
            //scene.setPin($section.find('.section__content').get(0), {pushFollowers: false});
            //scene.duration = $section.height() * 3;
        }


        scene.addTo(scrollScenes);
    };

    /**
     * Add ID (used for navigation, component indicator etc)
     * @function addId
     */

     var addId = function() {
         if (!$section.attr('id')) {
             $section.attr('id', 'section--' + sectionIndex);
         }
     };


    /**
     * Cache sections once for later duplication
     * @function cacheOriginalSections
     */

    var cacheOriginalSections = function() {
        var $parent = $section.parent('.sections');
        cache.$originalSections = $parent.find('.section').clone();
        cache.$parent = $parent;
    };

    /**
     * Duplicate previous sections so that they appear in an infinite loop
     * @function duplicateSections
     */

    var duplicateSections = function() {
        // Only duplicate if there are no sections after current "last" section
        if (!$section.next().length) {
            // Duplicate and append original sections
            cache.$parent.append(cache.$originalSections.clone());

            // Reset everything
            reset();
        }
    };

    /**
     * Reset all component behaviour, remove handlers
     * @function reset
     */

    var reset = function() {
        scrollScenes.destroy(true);

        // @TODO this seems like the wrong place for this
        var sections = [],
            $sections = $('.section'),
            sectionsLength = $sections.length;

        // Re-init each section
        $('.section').each(function(index, item) {
            sections[index] = new Section(index, $(item), sectionsLength);
        });

    };

    init();

};
