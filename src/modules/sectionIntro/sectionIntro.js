/** @module Section */
/*globals Power2:true, console*/

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    snap = require('snapsvg');

/**
 * @constructor SectionIntro
 * @param {object} controller
 * @param {jQuery} $element section element
 * @param {number} index which number section is this
 * @param {boolean} isLastSectionIntro is this last section
 */

var SectionIntro = module.exports = function(controller, $element, index, isLastSectionIntro) {
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
     * has ball 1 dropped?
     * @var {boolean} ballDropped
     */

    var ball1Dropped = false;

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @function init
     */

    var init = function() {
        if (isLastSectionIntro) {
            attachDetachEvents(true);
        }
        // Load the SVG
        loadSVG();
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    var attachDetachEvents = function(attach) {
        if (attach) {
            // On leave: drop ball
            controller.emitter.on('section:sectionLeave', sectionLeave);
            // Refresh dimensions on resize
            controller.emitter.on('window:resize', measureAndShowBalls);
        } else {
            controller.emitter.removeListener('section:sectionLeave', sectionLeave);
            controller.emitter.removeListener('window:resize', measureAndShowBalls);
        }
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

            if (isLastSectionIntro) {
                measureAndShowBalls();
            }

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
        var ball1ClientRect = svgObject.select('#ball1').node.getBoundingClientRect(),
            ball2ClientRect = svgObject.select('#ball2').node.getBoundingClientRect(),
            ball1JQueryOffset = $element.find('#ball1').offset(),
            ball2JQueryOffset = $element.find('#ball2').offset(),
            ball1Position = {
                top: ball1JQueryOffset.top, // For some reason, this jQuery value is accurate
                                            // in iOS following address bar resize
                                            // when ClientRect is not
                left: ball1JQueryOffset.left,
                width: ball1ClientRect.width,
                height: ball1ClientRect.height
            },
            ball2Position = {
                top: ball2JQueryOffset.top,
                left: ball2JQueryOffset.left,
                width: ball2ClientRect.width,
                height: ball2ClientRect.height
            };

        // Hide background image
        cache.$logo.addClass('section__logo--with-svg');

        //@TODO promise
        if (!ball1Dropped){
            controller.emitter.emit('balls:showBall1', ball1Position);
        }
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
            controller.emitter.emit('balls:ball1Drop', $element);
            controller.emitter.removeListener('section:sectionLeave', sectionLeave);
            ball1Dropped = true;
        }
    };

    /**
     * Reset everything
     * @function reset
     * @param {boolean} reinitialise reinit the component after resetting
     */

    var reset = function(reinitialise) {

        // Detach events
        attachDetachEvents(false);

        if (reinitialise) {
            init();
        }
    };


    init();

};
