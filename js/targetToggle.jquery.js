/*!
 * Target Toggle
 * Original author: @davidwebca
 * Licensed under the MIT license
 * Allows an element to trigger a class change on self, single external element or multiple external elements.
 */
;(function ( $, window, document, undefined ) {
    
    var pluginName = "targetToggle",
        defaults = {
            event: "mouseenter mouseleave",
            target: "self",
            preventDefault: false,
            stopPropagation: false,
            className: 'active',
            delay:false,
            animationend:function(){},
            transitionend:function(){}
        };


    function TargetToggle( element, options ) {
        this.plainElement = element;
        this.element = $(element);

        var dataOptions = {
            event: this.element.data('event'),
            target: this.element.data('target'),
            preventDefault: this.element.data('prevent-default'),
            stopPropagation: this.element.data('stop-propagation'),
            className: this.element.data('class-name'),
            delay: this.element.data('delay'),
            animationend: this.element.data('animationend'),
            transitionend: this.element.data('transitionend')
        };

        this.options = $.extend( {}, defaults, options, dataOptions);
        this.target = $(this.options.target);
        this.delayObj = 0;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    TargetToggle.prototype = {
        init: function() {
            this.element.on(this.options.event, this.toggle.bind(this));
            this.target.on('animationend', this.options.animationend);
            this.target.on('transitionend', this.options.transitionend);
        },

        toggle: function(e){
            if(typeof this.options.delay=="number" && this.target.hasClass(this.options.className)){
                this.delayObj = window.setTimeout(function(){
                    this.target.toggleClass(this.options.className);
                    this.element.toggleClass('has-'+this.options.className);

                    if(this.options.preventDefault){
                        e.preventDefault();
                    }

                    if(this.options.stopPropagation){
                        e.stopPropagation();
                    }
                }, this.options.delay);
            }else{
                this.target.toggleClass(this.options.className);
                this.element.toggleClass('has-'+this.options.className);

                if(this.options.preventDefault){
                    e.preventDefault();
                }

                if(this.options.stopPropagation){
                    e.stopPropagation();
                }
            }
        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!this["plugin_" + pluginName]) {
                this["plugin_" + pluginName] = new TargetToggle(this, options );
            }
        });
    };
})( jQuery, window, document );