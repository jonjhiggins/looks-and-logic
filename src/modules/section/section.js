/** @module Section */
/*globals Power2:true, console*/

var $ = require('jquery');

/**
* jQuery elements
* @namespace $cache
* @property {jQuery} $window
*/

var $cache = {
    $window: $(window)
};

/**
 * @constructor Section
 */

var Section = module.exports = function() {
  'use strict';

  /**
   * @function init
   */

  var init = function() {
      $cache.$window.on('scroll', onPageScroll); //@TODO debounce
  };

  /**
   * @function onPageScroll
   */

  var onPageScroll = function() {
      console.log('onPageScroll');
  };

  init();

};
