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
     * @property {boolean} arrowDownButton is arrowDownButton active / visible? It is only shown/hidden once
     * @property {boolean} autoScrolling is app auto-scrolling? Used to differentiate manual scrolling
     * @property {array} sections app's sections
     * @property {array} sectionCuriousPlayfulInformatives app's sectionCuriousPlayfulInformatives
     * @property {array} sectionIntros app's sectionIntros
     * @property {object} scrollScenes scrollmagic controller
     * @property {number} windowHeight
     */

    this.props = {
        arrowDownButton: true,
        autoScrolling: false,
        sections: [],
        sectionCuriousPlayfulInformatives: [],
        sectionIntros: [],
        sectionMakingDigitalHumans: [],
        scrollScenes: new ScrollMagic.Controller(),
        windowHeight: 0
    };

    /**
     * Initialise component
     * @method init
     */

     this.init = function () {
         this.setEmitterMaxListeners();
         this.refreshDimensions();

         // All window resizes through common function
         cache.$window.on('resize', this.windowResize.bind(this));

         // Attach events
         this.emitter.on('arrowDownButton:off', this.arrowDownButtonOff.bind(this));
         this.emitter.on('arrowDownButton:autoScrollingStart', this.autoScrolling.bind(this, true));
         this.emitter.on('arrowDownButton:autoScrollingEnd', this.autoScrolling.bind(this, false));
         this.emitter.on('window:resize', this.refreshDimensions.bind(this));
         this.emitter.on('sections:reset', this.sectionsReset.bind(this));

     };

     /**
      * Called when sections are reset
      * @method setEmitterMaxListeners
      */

     this.sectionsReset = function() {
         this.resetScrollScenes();
         this.setEmitterMaxListeners();
     };

     /**
      * Set the event emitters max listeners
      * Important as the infinite scroll behaviour is prone to memory leaks
      * @method setEmitterMaxListeners
      */

     this.setEmitterMaxListeners = function() {
         var modules = ['controller',
                        'arrowDownButton',
                        'balls'],
            sectionLength = $('.section').length +
                            $('.section--curious-playful-informative').length +
                            $('.section--intro').length +
                            $('.section--making-digital-human').length,
            maxListeners = modules.length + sectionLength;

         this.emitter.setMaxListeners(maxListeners);
     };

     /**
      * When arrowDownButton is hidden, permantly hide and don't re-init
      * @method arrowDownButtonOff
      */

     this.arrowDownButtonOff = function() {
         this.props.arrowDownButton = false;
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
     * Set autoScrolling property when start / end events are called
     * @method autoScrolling
     * @param {boolean} start is autoScrolling starting?
     */

    this.autoScrolling = function(start) {
        if (start){
            this.props.autoScrolling = true;
        } else {
            this.props.autoScrolling = false;
        }
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
