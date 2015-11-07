/** @module ArrowDownButton */

/*globals Power2:true, console*/

var $ = require('jquery'),
	TweenLite = require('./../../../node_modules/gsap/src/uncompressed/TweenLite.js'),
  ScrollToPlugin = require('./../../../node_modules/gsap/src/uncompressed/plugins/ScrollToPlugin.js');

var options = {
  scrollDownDuration: 0.8
};

/**
 * @constructor ArrowDownButton
 */

var ArrowDownButton = module.exports = function() {
  'use strict';

  var $arrowDownButton = $('#arrowDownButton');

  $arrowDownButton.on('click', arrowDownClick);
};

var arrowDownClick = function (e) {
  e.preventDefault();
  var hash = $(this).prop('hash'),
      sectionTop = $(hash).offset().top;
  TweenLite.to(window, options.scrollDownDuration, {scrollTo:{y: sectionTop}, ease:Power2.easeOut});
};
