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
     * logo svgObject created by snap.svg
     * @var {object} svgObject
     */

    var svgObject = null;

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @function init
     */

    var init = function() {
        // On leave: drop ball
        controller.emitter.on('section:sectionLeave', sectionLeave);
        // Refresh dimensions on resize
        controller.emitter.on('window:resize', measureAndShowBalls);
        // Load the SVG
        loadSVG();
    };

    /**
     * Reset all component behaviour, remove handlers
     * @function reset
     */

    var loadSVG = function() {
        svgObject = snap(cache.$logoSvg.get(0));
        snap.load('../img/logo.svg', function(loadedSVG) {
            // Add SVG
            svgObject.append(loadedSVG);

            measureAndShowBalls();
        });
    };

    /**
     * Reset all component behaviour, remove handlers
     * @function reset
     */

    var measureAndShowBalls = function() {
        // Only run after snap.svg has done it's stuff
        if (!svgObject) {
            return;
        }

        // Temporarily show balls in background image for measuring
        cache.$logo.removeClass('section__logo--with-svg');
        // Measure balls within SVGs
        var ball1Position = svgObject.select('#ball1').node.getBoundingClientRect(),
            ball2Position = svgObject.select('#ball2').node.getBoundingClientRect();
        // Hide background image
        cache.$logo.addClass('section__logo--with-svg');

        //@TODO promise
        controller.emitter.emit('balls:showBall1', ball1Position);
        controller.emitter.emit('balls:showBall2', ball2Position);
    };

    /**
     * On leaving component: drop ball and stop listening for resizes
     * @function sectionLeave
     * @param {jquery} $sectionLeave
     */

    var sectionLeave = function($sectionLeave) {
        // When leaving this section, trigger ball1Drop
        if ($sectionLeave.get(0) === $element.get(0)) {
            controller.emitter.emit('balls:ball1Drop');
            controller.emitter.removeListener('window:resize', measureAndShowBalls);
        }
    };

    /**
     * Reset all component behaviour, remove handlers
     * @function reset
     */

    var reset = function() {

    };


    init();

};
