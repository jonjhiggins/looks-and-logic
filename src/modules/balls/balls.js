/** @module Balls */
/*globals Power2:true, console*/

/**
 * @constructor Balls
 */

 var $ = require('jquery');

 /**
 * jQuery elements
 * @namespace cache
 * @property {jQuery} window
 * @property {jQuery} originalSections sections stored once for duplication
 * @property {jQuery} $parent containing .sections element
 */

 var cache = {
     $window: $(window),
     $ball1: $('#ball--1'),
     $ball2: $('#ball--2')
 };


var Balls = module.exports = function() {
  'use strict';


  /**
   * Initialise the component
   * @function init
   */

  var init = function() {

      cache.$window.on('ball1Drop', function() {
          cache.$ball1.css({
              position: 'fixed',
              bottom: 0,
              top: 'auto'
          });
      });
  };


  init();

};
