/** @module controller */

/**
 * @constructor controller
 */

var controller = module.exports = function() {
  'use strict';

  /**
   * App properties, states and settings
   * @namespace $prop
   * @property {boolean} autoScrolling is app auto-scrolling? Used to differentiate manual scrolling
   */

  this.props = {
      autoScrolling: false
  };

  return this;
};
