/** @module _base */

var $ = require('jquery');

/**
 * @constructor _base
 */

var _base = module.exports = function() {
    'use strict';

    /**
     * Reset everything
     * @function reset
     * @param {boolean} reinitialise reinit the component after resetting
     */

    this.reset = function(reinitialise) {
        // Detach events
        this.attachDetachEvents(false);

        if (reinitialise) {
            this.init();
        }
    };
};
