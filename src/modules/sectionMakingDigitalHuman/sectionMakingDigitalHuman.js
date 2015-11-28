/** @module sectionMakingDigitalHuman */

var $ = require('jquery');

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
};
