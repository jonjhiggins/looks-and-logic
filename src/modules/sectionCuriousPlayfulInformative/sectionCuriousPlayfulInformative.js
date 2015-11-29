/** @module sectionCuriousPlayfulInformative */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic');

/**
 * @constructor sectionCuriousPlayfulInformative
 * @param {object} controller
 */

var sectionCuriousPlayfulInformative = module.exports = function(controller, $section, index) {
    'use strict';

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} window
     */

    var cache = {
        $window: $(window),
        $sectionContent: $section.find('.section__content'),
        $sectionTitle: $section.find('.section__title')
    };

    /**
     * properties, states and settings
     * @namespace prop
     * @property {number} windowHeight
     * @property {number} titleHeight
     */

    this.props = {
        windowHeight: 0, //@TODO store in controller?
        titleHeight: 0
    };

    /**
     * Initialise the component
     * @TODO Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        
        this.refreshDimensions(); // @TODO refresh on resize

        // pin title to centre via absolute position and translateY
        // can't use scrollMagic pin as uses fixed position and we need to
        // use overflow to mask out the title until its reveal on scroll
        var pinTitle = new ScrollMagic.Scene({
            triggerElement: $section.get(0),
            duration: $section.height(),
            triggerHook: 1
        }).on('progress', function(e) {

            var translateAmount = -((this.props.windowHeight / 2) - (e.progress * this.props.windowHeight) + (this.props.titleHeight / 2));

            cache.$sectionContent.css('transform', 'translateY(' + translateAmount + 'px)');
        }.bind(this));

        pinTitle.addTo(controller.props.scrollScenes);
    };

    /**
     * Get and store dimensions
     * @method refreshDimensions
     */

    this.refreshDimensions = function() {
        this.props.windowHeight = cache.$window.height();
        this.props.titleHeight = cache.$sectionTitle.height();
    };

    this.init();
};
