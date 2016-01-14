/** Provides screen-rotation effect on scroll
  *
  * @module rotator
  */

var $ = require('jquery'),
    _base = require('../_base/_base.js'),
    _ = require('underscore'),
    TweenMax = require('gsap/src/uncompressed/TweenMax.js');

/**
 * @constructor rotator
 * @param {object} controller
 * @param {jQuery} $section
 * @param {jQuery} $rotator
 * @param {boolean} startVertical should we start with rotator vertical
 */

var rotator = module.exports = function(controller, $section, $rotator, startVertical) {
  'use strict';

  // Extend _base module JS
  var base = _base.apply(this);

  /**
   * jQuery elements
   * @namespace cache
   * @property {jQuery} $window
   * @property {jQuery} $rotator
   */

  var cache = {
      $window: $(window)
  };

  /**
   * Module properties, states and settings
   * @namespace props
   * @property {object} surfaceStyles start/end styles for surface to animate between on scroll
   * @property {number} sectionHeight
   * @property {number} sectionTopRotateStart waypoint position (px) at which to start rotation
   * @property {number} sectionHalfway waypoint position (px) halfway through section
   */

  var props = {
      surfaceStyles: {
          start: {
              translate: 0,
              rotate: 0
          },
          end: {
              translate: -50,
              rotate: -90
          }
      },
      sectionHeight: null,
      sectionTopRotateStart: null, //
      sectionHalfway: null
  };

  /**
   * Bound events for add/removal. Inherits reset from _base
   * @namespace events
   * @property {function} refreshDimensions
   * @property {function} pageScroll
   */

  this.events.refreshDimensions = null;
  this.events.pageScroll = null;

  /**
   * Initialise the component
   * Everything here should be undone using the "reset" function
   * @method init
   */

  this.init = function() {

      this.refreshDimensions();

      // Bind events
      this.events.refreshDimensions = this.refreshDimensions.bind(this);


      if (startVertical) {
          var unit = controller.props.orientationLandscape ? 'vw' : 'vh';
          $rotator.css('transform', 'translateX(' + props.surfaceStyles.end.translate + unit + ')  rotate(' + props.surfaceStyles.end.rotate + 'deg)');
      } else {
          this.events.pageScroll = _.throttle(this.rotateSurface.bind(this));
      }

      // Attach events
      // this.attachDetachEvents(true); this is called from the section module
  };

  /**
   * @function attachDetachEvents
   * @param {boolean} attach attach the events?
   */

  this.attachDetachEvents = function(attach) {
      if (attach) {
          cache.$window.on('scroll', this.events.pageScroll);
          controller.emitter.on('window:resize', this.events.refreshDimensions);
      } else {
          cache.$window.off('scroll', this.events.pageScroll);
          controller.emitter.removeListener('window:resize', this.events.refreshDimensions);
      }
  };

  /**
   * Get and store dimensions
   * @method refreshDimensions
   */

  this.refreshDimensions = function() {
      props.sectionHeight = $section.height();
      props.sectionTopRotateStart = $section.offset().top  - (controller.props.windowHeight / 3); // starts 1/3 of window above sectionTop
      props.sectionHalfway = props.sectionTopRotateStart + (props.sectionHeight / 2);
  };

  /**
   * On scroll: rotate surface from 0 to 90/-90 degrees depending on mouse position
   * @method pageScroll
   */

  this.rotateSurface = function() {

      var progress = Math.min(Math.max((cache.$window.scrollTop() - props.sectionTopRotateStart), 0) / (props.sectionHalfway - props.sectionTopRotateStart), 1),
          rotate = props.surfaceStyles.end.rotate * progress,
          translate = props.surfaceStyles.end.translate * progress,
          unit = controller.props.orientationLandscape ? 'vw' : 'vh'; // At portrait, the rotator needs to be based on viewport height
                                                                      // as the width won't cover the screen.
      $rotator.css('transform', 'translateX(' + translate + unit + ')  rotate(' + rotate + 'deg)');
  };

  /**
   * Destroy all
   * @method destroy
   */

  this.destroy = function() {
      this.attachDetachEvents(false);
      props = null;
  };

  this.init();
};
