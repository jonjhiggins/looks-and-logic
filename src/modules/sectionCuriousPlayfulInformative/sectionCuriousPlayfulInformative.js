/** @module sectionCuriousPlayfulInformative */

var $ = require('jquery'),
    ScrollMagic = require('scrollmagic'),
    _base = require('../_base/_base.js');

/**
 * @constructor sectionCuriousPlayfulInformative
 * @param {object} controller
 */

var sectionCuriousPlayfulInformative = module.exports = function(controller, $section, index) {
    'use strict';

    // Extend _base module JS
    var base = _base.apply(this);

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} window
     * @property {jQuery} $sectionContent
     * @property {jQuery} $sectionTitle
     */

    var cache = {
        $window: $(window),
        $sectionContent: $section.find('.section__content'),
        $sectionTitle: $section.find('.section__title')
    };

    /**
     * Bound events for add/removal. Inherits reset from _base
     * @namespace events
     * @property {function} refreshDimensions
     */

    this.events.refreshDimensions = null;

    /**
     * properties, states and settings
     * @namespace props
     * @property {number} titleHeight
     */

    this.props = {
        titleHeight: 0
    };

    /**
     * scrollMagic scene for pinning title
     * @property {number} scenePinTitle
     */

    this.scenePinTitle = null;

    /**
     * Initialise the component
     * @TODO Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        this.refreshDimensions();
        // Bind events
        this.events.refreshDimensions = this.refreshDimensions.bind(this);
        // Attach events
        this.attachDetachEvents(true);
        // ScrollMagic scene
        this.setupScene();
    };

    /**
     * @function attachDetachEvents
     * @param {boolean} attach attach the events?
     */

    this.attachDetachEvents = function(attach) {

        if (attach) {
            controller.emitter.on('sections:reset', this.events.reset);
            controller.emitter.on('window:resize', this.events.refreshDimensions);
        } else {
            controller.emitter.removeListener('sections:reset', this.events.reset);
            controller.emitter.removeListener('window:resize', this.events.refreshDimensions);
        }
    };

    /**
     * ScrollMagic scene
     * @function setupScene
     */

    this.setupScene = function() {

        if (this.scenePinTitle) {
            this.scenePinTitle.destroy(true);
        }

        // pin title to centre via absolute position and translateY
        // can't use scrollMagic pin as uses fixed position and we need to
        // use overflow to mask out the title until its reveal on scroll
        this.scenePinTitle = new ScrollMagic.Scene({
            triggerElement: $section.get(0),
            duration: $section.height(), // refreshed on resize in refreshDimensions
            triggerHook: 1
        }).on('progress', this.pinTitleProgress.bind(null, this.props.titleHeight));

        this.scenePinTitle.addTo(controller.props.scrollScenes);
    };



    /**
     * Called on each scroll during scenePinTitle
     * @method pinTitleProgress
     * @param {object} e event
     */

    this.pinTitleProgress = function(titleHeight, e) {
        // translateY the title so it stays fixed in centre of screen
        var translateAmount = -((controller.props.windowHeight / 2) - (e.progress * controller.props.windowHeight) + (titleHeight / 2));
        // @TODO look at reducing jiggle in Safari. Could try making title position: fixed when translateAmount > 0
        cache.$sectionContent.css('transform', 'translateY(' + translateAmount + 'px)');
    };

    /**
     * Get and store dimensions
     * @method refreshDimensions
     */

    this.refreshDimensions = function() {
        this.props.titleHeight = cache.$sectionTitle.height();

        if (this.scenePinTitle) {
            this.scenePinTitle.duration($section.height());
        }
    };

    this.init();
};
