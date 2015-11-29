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

    this.init();

    return this;
};
