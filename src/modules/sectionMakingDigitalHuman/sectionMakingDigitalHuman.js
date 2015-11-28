/** @module sectionMakingDigitalHuman */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic');

/**
 * @constructor sectionMakingDigitalHuman
 * @param {object} controller
 */

var sectionMakingDigitalHuman = module.exports = function(controller, $section, index) {
    'use strict';

    // Add pin
    var sectionObject = controller.props.sections[index],
        scene = sectionObject.props.scene;

    // Set triggerHook to top of component (so it pins there)
    scene.triggerHook(0);
    scene.setPin($section.get(0), {
        pushFollowers: false
    });

    // Custom scene to bring the next section up 33.3% and pinning it in place
    var $nextSection = $section.next('.section').length ? $section.next('.section') : $section.parent().next('.section'),
        pinNextSection = new ScrollMagic.Scene({
            triggerElement: $section.get(0),
            duration: $section.height(),
            triggerHook: 0.33
        }).setPin($nextSection.get(0), {
            pushFollowers: false
        });

    pinNextSection.addTo(controller.props.scrollScenes);
};
