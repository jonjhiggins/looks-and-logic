/** @module ArrowDownButton */

/*globals Power2:true, console*/

var $ = require('jquery'),
	TweenLite = require('./../../../node_modules/gsap/src/uncompressed/TweenLite.js'),
  ScrollToPlugin = require('./../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');

var options = {
  scrollDownDuration: 0.8
};

var $button = $('#arrowDownButton'),
	$window = $(window),
    $currentSection = $('.section').eq(0), //@TODO change depending on scroll position
    $nextSection;

/**
 * @constructor ArrowDownButton
 */

var ArrowDownButton = module.exports = function() {
  'use strict';
  changeIconColour();
  $button.on('click', buttonClick);
  $window.one('scroll', pageScroll);
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

  // Update button's hash to next section
  var hash = $button.prop('hash');

  $currentSection = $(hash);
  $nextSection = $currentSection.next();

  if ($nextSection.length) {
    $button.prop('hash', '#' + $nextSection.prop('id'));
    buttonShow();
  }

};

/**
 * @function buttonHide
 */

var buttonHide = function () {
  $button.addClass('hidden');
};

/**
 * @function buttonShow
 */

var buttonShow = function () {
  changeIconColour();
  $button.removeClass('hidden');
};

/**
 * Change icon colour to stand out from background
 * @function changeIconColour
 */

var changeIconColour = function () {
  if ($currentSection.attr('data-background') === 'white') {
    $button.attr('data-colour', 'black');
  } else {
    $button.attr('data-colour', 'white');
  }
};

/**
 * Hide the arrow when scrolling normally
 * @function pageScroll
 */

var pageScroll = function () {
  buttonHide();
};
