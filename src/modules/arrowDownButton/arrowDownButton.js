/** @module ArrowDownButton */

var $ = require('jquery');

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
  var hash = $(this).prop('hash');
  $('html, body').animate({scrollTop: $(hash).offset().top }, 400);
};
