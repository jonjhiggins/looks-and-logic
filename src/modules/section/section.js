/**
    Common properties and methods for all sections.

    Each have an associatedModule (sectionIntro, sectionMakingDigitalHuman etc)
    which provide unique behaviours for that particular module type.

    @module Section

*/

/*globals Power2:true, console*/

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    _base = require('../_base/_base.js');

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

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} remove
     */

    this.events.remove = null;

    /**
     * App properties, states and settings
     * @namespace prop
     * @property {object} associatedModule associated module e.g. sectionIntro for destroying etc
     * @property {string} id $section element's ID attribute
     * @property {boolean} isLast
     * @property {object} scene scrollMagic scene
     * @property {jquery} $section element exported for use in other modules
     */

    this.props = {
        associatedModule: null,
        id: null,
        isLast: sectionIndex === (sectionsLength - 1),
        scene: null,
        $section: $section,
        index: sectionIndex,
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        // Bind events
        this.events.remove = this.destroy.bind(this);
        // Attach events
        this.attachDetachEvents(true);
        this.setBackgroundColours();
        this.addId();
        this.addScrollScene();

        // All sections initialised - must remain at end of init function
        if (this.props.isLast) {
            controller.emitter.emit('section:sectionsInited');
        }
    };

    /**
     * @method attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {
        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
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

        // @TODO fold in to destroy / removeScrollScene
        if (this.props.scene) {
            this.props.scene.destroy(true);
        }

        this.props.scene = new ScrollMagic.Scene({
                triggerElement: $section.get(0),
                duration: $section.height() // this is updated on resize in sections.js
            })
            .on('enter', function() {
                controller.emitter.emit('section:sectionEnter', $section);
                $section.attr('data-section-in-view', true);
                // On scrolling into last section, duplicate sections
                // for infinite loop effect
                if (this.props.isLast) {
                    this.props.isLast = false;
                    controller.emitter.emit('sections:duplicateSections', $section);

                }

            }.bind(this))
            .on('leave', function() {
                controller.emitter.emit('section:sectionLeave', $section);
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
             var id = 'section--' + sectionIndex;
             $section.attr('id', id);
             this.props.id = id;
         }
     };

     /**
      * Destroy all
      * @method destroy
      */

     this.destroy = function() {
         // Remove scroll scene
         this.props.scene.destroy(true);
         this.attachDetachEvents(false);
     };

    this.init();

    return this;

};
