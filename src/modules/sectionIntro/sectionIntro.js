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
 * @param {Number} sectionIndex
 * @param {jQuery} $section
 */

var SectionIntro = module.exports = function($element) {
  'use strict';

  /**
   * Initialise the component
   * Everything here should be undone using the "reset" function
   * @function init
   */

  var init = function() {
      $element.on('sectionLeave', function() {
          cache.$window.trigger('ball1Drop');
      });
  };

  /**
   * Reset all component behaviour, remove handlers
   * @function reset
   */

  var reset = function() {

  };


  init();

};
