/** @module Section */
/*globals Power2:true, console*/

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic');

/**
 * jQuery elements
 * @namespace cache
 * @property {jQuery} window
 */

var cache = {
    $window: $(window)
};

/**
 * Common JS for all section components
 * @constructor Section
 * @param {object} controller
 * @param {jQuery} $section
 * @param {number} sectionIndex
 * @param {number} sectionsLength
 */

var Section = module.exports = function(controller, $section, sectionIndex, sectionsLength) {
    'use strict';

    /**
     * App properties, states and settings
     * @namespace $prop
     * @property {boolean} isLast
     * @property {object} scene scrollMagic scene
     */

    this.props = {
        isLast: sectionIndex === (sectionsLength - 1),
        scene: null,
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        // Run for each section
        this.setBackgroundColours();
        this.addScrollScene();
        this.addId();

        // All sections initialised - must remain at end of init function
        if (this.props.isLast) {
            cache.$window.trigger('section:sectionsInited');
        }
    };

    /**
     * Set the background colours of a section
     * These should alternate white/black - unless data-background-same is set to true
     * @method setBackgroundColours
     */

    this.setBackgroundColours = function() {

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

    this.addScrollScene = function() {
        this.props.scene = new ScrollMagic.Scene({
                triggerElement: $section.get(0),
                duration: $section.height()
            })
            .on('start', function() {
                $section.trigger('sectionEnter');
                $section.attr('data-section-in-view', true);

                // On scrolling into last section, duplicate sections
                // for infinite loop effect
                if (this.props.isLast) {
                    cache.$window.trigger('sections:duplicateSections', $section);
                }

            }.bind(this))
            .on('end', function() {
                $section.trigger('sectionLeave');
                $section.attr('data-section-in-view', '');
            });

        this.props.scene.addTo(controller.props.scrollScenes);
    };

    /**
     * Add ID (used for navigation, component indicator etc)
     * @method addId
     */

     this.addId = function() {
         if (!$section.attr('id')) {
             $section.attr('id', 'section--' + sectionIndex);
         }
     };

    this.init();

    return this;

};
