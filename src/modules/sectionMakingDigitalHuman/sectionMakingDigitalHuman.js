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

    scene.setPin($section.get(0), {
        pushFollowers: false
    });
};
