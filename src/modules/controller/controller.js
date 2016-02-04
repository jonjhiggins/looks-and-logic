/** @module controller */

/**
 * @constructor controller
 */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    EventEmitter = require('events').EventEmitter,
    _ = require('underscore');

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
     * @property {array} sectionIntros app's sectionIntros
     * @property {array} sectionMakingDigitalHumans app's sectionMakingDigitalHumans
     * @property {array} sectionCuriousPlayfulInformative app's sectionCuriousPlayfulInformative
     * @property {array} sectionMarkRauls app's sectionMarkRauls
     * @property {array} sectionClientss app's sectionClients
     * @property {array} sectionTwoGuysWorkings app's sectionTwoGuysWorking
     * @property {object} scrollScenes scrollmagic controller
     * @property {string} staticAssetPath used for loading images via JS. differs between aerobatic and localhost
     * @property {number} windowHeight,
     * @property {number} windowWidth
     */

    this.props = {
        arrowDownButton: true,
        aerobatic: (typeof __aerobatic__ !== 'undefined'),
        autoScrolling: false,
        breakpoints: {
            medium: 740
        },
        orientationLandscape: true,
        sections: [],
        sectionIntros: [],
        sectionMakingDigitalHumans: [],
        sectionCuriousPlayfulInformatives: [],
        sectionMarkRauls: [],
        sectionClientss: [],
        sectionTwoGuysWorkings: [],
        scrollScenes: new ScrollMagic.Controller(),
        staticAssetPath: (typeof __aerobatic__ !== 'undefined') ? __aerobatic__.staticAssetPath : '',
        windowHeight: 0,
        windowWidth: 0
    };

    /**
     * Initialise component
     * @method init
     */

     this.init = function () {
         this.setEmitterMaxListeners();
         this.refreshDimensions();

         // All window resizes through common function
         cache.$window.on('resize', _.debounce(this.windowResize.bind(this)));

         // Attach events
         this.emitter.on('arrowDownButton:off', this.arrowDownButtonOff.bind(this));
         this.emitter.on('window:autoScrollingStart', this.autoScrolling.bind(this, true));
         this.emitter.on('window:autoScrollingEnd', this.autoScrolling.bind(this, false));
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
                            $('.section--intro').length +
                            $('.section--making-digital-human').length +
                            $('.section--curious-playful-informative').length +
                            $('.section--mark-raul').length +
                            $('.section--clients').length,
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
         this.emitter.emit('window:resize');
     };

     /**
      * Refresh dimensions
      * @method refreshDimensions
      */

      this.refreshDimensions = function () {
          this.props.windowHeight = cache.$window.height();
          this.props.windowWidth = cache.$window.width();
          this.props.orientationLandscape = Modernizr.mq('screen and (orientation: landscape)');
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
