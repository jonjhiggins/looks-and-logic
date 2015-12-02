/** @module controller */

/**
 * @constructor controller
 */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    EventEmitter = require('events').EventEmitter;

/**
 * jQuery elements
 * @namespace cache
 * @property {jQuery} window
 */

var cache = {
    $window: $(window),
};

var controller = module.exports = function() {
    'use strict';

    /**
     * @property {object} emitter trigger and listen to events
     */

    this.emitter = new EventEmitter();

    /**
     * App properties, states and settings
     * @namespace $prop
     * @property {boolean} autoScrolling is app auto-scrolling? Used to differentiate manual scrolling
     * @property {array} sections app's sections
     * @property {object} scrollScenes scrollmagic controller
     * @property {number} windowHeight
     */

    this.props = {
        autoScrolling: false,
        sections: [],
        scrollScenes: new ScrollMagic.Controller(),
        windowHeight: 0
    };

    /**
     * Initialise component
     * @method init
     */

     this.init = function () {
         this.refreshDimensions();

         // All window resizes through common function
         cache.$window.on('resize', this.windowResize.bind(this));

         // Attach events
         this.emitter.on('window:resize', this.refreshDimensions.bind(this));
         this.emitter.on('sections:reset', this.resetScrollScenes.bind(this));

     };

     /**
      * All window resizes through common function
      * @method windowResize
      */

     this.windowResize = function() {
         this.emitter.emit('window:resize');  //@TODO debouce
     };

     /**
      * Refresh dimensions
      * @method refreshDimensions
      */

      this.refreshDimensions = function () {
          this.props.windowHeight = cache.$window.height();
      };

    /**
     * Reset scrollScenes
     * @method resetScrollScenes
     */

    this.resetScrollScenes = function() {
        this.props.scrollScenes.destroy(true);
        this.props.scrollScenes = new ScrollMagic.Controller();
    };

    /**
     * Get next section, taking into account scrollmagic wrappers
     * @method getNextSection
     * @param {jQuery} $currentSection
     * @returns {jQuery} $nextSection
     */

    this.getNextSection = function($currentSection) {
        var $nextSection;
        // Normal section
        if ($currentSection.next('.section').length) {
            $nextSection = $currentSection.next();
        // Sections next to scrollmagic pin's extra div
        } else if ($currentSection.next('div').length) {
            $nextSection = $currentSection.next().find('.section');
        // Sections within scrollmagic pin's extra div
        } else {
            $nextSection = $currentSection.parent().next('.section');
        }
    	return $nextSection;
    };

    this.init();

    return this;
};
