/** @module Menu */

var $ = require('jquery');

/**
 * @constructor Menu
 * @param {object} controller
 */

var Menu = module.exports = function(controller) {
  'use strict';

  /**
   * jQuery elements
   * @namespace cache
   * @property {jQuery} window
   */

  var cache = {
      $menuButton: $('#menu__button'),
      $body: $('body')
  };

  /**
   * Module properties, states and settings
   * @namespace $prop
   * @property {boolean} open is menu active
   */

  var props = {
      open: false
  };

  /**
   * Initialise the component
   * @method init
   */

  this.init = function() {
      cache.$menuButton.on('click', buttonClick);
  };

  /**
   * @function buttonClick
   */

  var buttonClick = function() {

      if (!props.open) {
          cache.$body.addClass('js--menuOpen');
      } else {
          cache.$body.removeClass('js--menuOpen');
      }

      props.open = !props.open;
  };

  this.init();

};
