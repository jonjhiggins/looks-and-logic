/** @module Section */
/*globals Power2:true, console*/

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    snap = require('snapsvg');

/**
 * @constructor SectionIntro
 * @param {object} controller
 * @param {jQuery} $element section element
 */

var SectionIntro = module.exports = function(controller, $element) {
    'use strict';

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} window
     * @property {jQuery} $logo
     * @property {jQuery} $logoSvg logo's svg element
     */

    var cache = {
        $window: $(window),
        $logo: $element.find('.section__logo'),
        $logoSvg: $element.find('.section__logo svg')
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @function init
     */

    var init = function() {
        controller.emitter.on('section:sectionLeave', function($sectionLeave) {
            // When leaving this section, trigger ball1Drop
            if ($sectionLeave.get(0) === $element.get(0)) {
                controller.emitter.emit('balls:ball1Drop');
            }
        });

        loadSVG();


    };

    /**
     * Reset all component behaviour, remove handlers
     * @function reset
     */

    var loadSVG = function() {

        var svgObject = snap(cache.$logoSvg.get(0));
        snap.load('../img/logo.svg', function(loadedSVG) {
            // Add SVG
            svgObject.append(loadedSVG);
            // Hide background image
            cache.$logo.addClass('section__logo--with-svg');

            var ball1Position = svgObject.select('#ball1').node.getBoundingClientRect(),
                ball2Position = svgObject.select('#ball2').node.getBoundingClientRect();
            //@TODO promise

            controller.emitter.emit('balls:showBall1', ball1Position);
            controller.emitter.emit('balls:showBall2', ball2Position);
        });
    };

    /**
     * Reset all component behaviour, remove handlers
     * @function reset
     */

    var reset = function() {

    };


    init();

};
