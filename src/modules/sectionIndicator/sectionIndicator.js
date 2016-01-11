/** @module sectionIndicator */

var $ = require('jquery');

/**
 * @constructor sectionIndicator
 */

var sectionIndicator = module.exports = function() {
    'use strict';

    /**
     * jQuery elements
     * @namespace cache
     * @property {jQuery} window
     */

    var cache = {
        $window: $(window),
        $list: $('#sectionIndicator > .sectionIndicator__list'),
        $sections: $('.section')
    };

    /**
     * Initialise the component
     * Everything here should be undone using the "reset" function
     * @method init
     */

    this.init = function() {
        // Build list up from sections in page
        cache.$sections.each(this.buildItem);
    };

    /**
     * Build each item in the sectionIndicator from sections in page
     * @method buildItem
     * @property {number} index
     * @property {element} item
     */

    this.buildItem = function(index, item) {
        // Build item
        var $section = $(item),
            $sectionIndicatorItem = $('<li class="sectionIndicator__item"></li>'),
            $sectionIndicatorLink = $('<a href="#' + $section.attr('id') + '" class="sectionIndicator__link"><span class="sectionIndicator__link-ring"></span><span class="sectionIndicator__link-dot"></span></a>');

        // Add item to DOM
        cache.$list.append($sectionIndicatorItem.append($sectionIndicatorLink));
        // @TODO click event
        //$componentIndicatorLink.on('click', this._componentIndicatorOnClickLink.bind(this, $componentIndicatorLink));
    };

    this.init();
};
