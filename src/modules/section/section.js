/** @module Section */
/*globals Power2:true, console*/

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic');

/**
* jQuery elements
* @namespace $cache
* @property {jQuery} $window
*/

var $cache = {
    $window: $(window)
};

/**
* ScrollMagic controller
* @var {Object} scrollScenes
*/

var scrollScenes = new ScrollMagic.Controller();

/**
 * Common JS for all section components
 * @constructor Section
 * @param {Number} sectionIndex
 * @param {jQuery} $section
 */

var Section = module.exports = function(sectionIndex, $section, totalSections) {
  'use strict';

  /**
  * jQuery elements
  * @namespace $prop
  * @property {boolean} isFirst is it first section?
  */

  var props = {
    isFirst: (sectionIndex === 0),
    isLast: (sectionIndex === totalSections - 1)
  };

  /**
   * @function init
   */

  var init = function() {

    // Run once for first section only
    if (props.isFirst) {
      initSectionController();
    }

    // Run for each section
    setBackgroundColours();
    addScrollScene();
  };

  /**
   * Controller methods that only need to be run once,
   * rather than for all sections
   * @function initSectionController
   */

  var initSectionController = function() {

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
   * Add waypoint to scrollmagic controller so scroll events are triggered
   * @function addScrollScene
   */

  var addScrollScene = function() {
      var scene = new ScrollMagic.Scene({
                        triggerElement: $section.get(0)
                      })
                      .on('start', function () {
                          // On scrolling into last section, duplicate sections
                          // for infinite loop effect
                          if (props.isLast) {
                            duplicateSections();
                          }
                      })
                      .addTo(scrollScenes);
  };

  /**
   * Duplicate previous sections so that they appear in an infinite loop
   * @function duplicateSections
   */

  var duplicateSections = function () {
    // Only duplicate if there are no sections after current "last" section
    // @TODO unset old last section when new one is in place
    if (!$section.next().length) {
      var $parent = $section.parent('.sections'),
          $newSections = $parent.find('.section').clone();

      $parent.append($newSections);

    }
  };

  init();

};
