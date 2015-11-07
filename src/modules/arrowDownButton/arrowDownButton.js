/** @module ArrowDownButton */

/*globals Power2:true, console*/

var $ = require('jquery'),
	TweenLite = require('./../../../node_modules/gsap/src/uncompressed/TweenLite.js'),
  ScrollToPlugin = require('./../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');

var options = {
  scrollDownDuration: 0.8
};

var $button = $('#arrowDownButton');

/**
 * @constructor ArrowDownButton
 */

var ArrowDownButton = module.exports = function() {
  'use strict';
  $button.on('click', buttonClick);
};

/**
 * On clicking the arrow button
 * @function buttonClick
 */

var buttonClick = function (e) {

  e.preventDefault();

  var hash = $(this).prop('hash'),
      sectionTop = $(hash).offset().top;

  // Scroll to next section top
  TweenLite.to(window, options.scrollDownDuration, {
      scrollTo:{y: sectionTop},
      ease:Power2.easeOut,
      onComplete: scrollComplete
    });

  // Hide arrow
  buttonHide();
};

/**
 * When page scrolling is complete: show button and update hash
 * @function scrollComplete
 */

var scrollComplete = function () {
  // @TODO update hash
  buttonShow();
};

/**
 * @function buttonHide
 */

var buttonHide = function (argument) {
  $button.addClass('hidden');
};

/**
 * @function buttonShow
 */

var buttonShow = function (argument) {
  // @TODO change icon colour
  $button.removeClass('hidden');
};
