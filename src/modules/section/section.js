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
 * Common JS for all section components
 * @constructor Section
 * @param {Number} sectionIndex
 * @param {jQuery} $section
 */

var Section = module.exports = function(sectionIndex, $section) {
  'use strict';

  /**
   * @function init
   */

  var init = function() {
    setBackgroundColours();
    $cache.$window.on('scroll', onPageScroll); //@TODO debounce
  };

  /**
   * Set the background colours of each section
   * These should alternate white/black - unless data-background-same is set to true
   * @function setBackgroundColours
   */

  var setBackgroundColours = function() {

      var background,
          previousSectionBackground = $section.prev().data('background');

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
   * @function onPageScroll
   */

  var onPageScroll = function() {
      console.log('onPageScroll');
  };

  init();

};
