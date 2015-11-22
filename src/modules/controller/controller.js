/** @module controller */

/**
 * @constructor controller
 */

 var ScrollMagic = require('scrollmagic');

var controller = module.exports = function() {
  'use strict';

  /**
   * App properties, states and settings
   * @namespace $prop
   * @property {boolean} autoScrolling is app auto-scrolling? Used to differentiate manual scrolling
   * @property {array} sections app's sections
   * @property {object} scrollScenes scrollmagic controller
   */

  this.props = {
      autoScrolling: false,
      sections: [],
      scrollScenes: new ScrollMagic.Controller()
  };

  /**
   * Reset scrollScenes
   * @method resetScrollScenes
   */

  this.resetScrollScenes = function() {
      this.props.scrollScenes.destroy(true);
      this.props.scrollScenes = new ScrollMagic.Controller();
  };

  return this;
};
