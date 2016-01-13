/** @module sectionMarkRaul */

var $ = require('jquery'),
    _base = require('../_base/_base.js');

/**
 * @constructor sectionMarkRaul
 * @param {object} controller
 */

var sectionMarkRaul = module.exports = function(controller, $section, index) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} $window
     */

    var cache = {
        $window: $(window),
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {

    };

    this.init();
};
