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
            targetChildren: false,
            preventDefault: false,
            stopPropagation: false,
            className: 'active',
            delay:false,
            removeOthers:false,
            beforeToggle:function(){},
            animationend:function(){},
            transitionend:function(){},
            afterToggle:function(){}
        };


    function TargetToggle( element, options ) {
        this.plainElement = element;
        this.element = $(element);

        var dataOptions = {
            event: this.element.data('event'),
            target: this.element.data('target'),
            targetChildren: this.element.data('target-children'),
            preventDefault: this.element.data('prevent-default'),
            stopPropagation: this.element.data('stop-propagation'),
            className: this.element.data('class-name'),
            delay: this.element.data('delay'),
            removeOthers: this.element.data('remove-others'),
            beforeToggle: this.element.data('before-toggle'),
            animationend: this.element.data('animationend'),
            transitionend: this.element.data('transitionend'),
            afterToggle: this.element.data('after-toggle')
        };

        this.options = $.extend( {}, defaults, options, dataOptions);


        if(this.options.target == 'self') {
            this.target = this.element;
        } else if(this.options.targetChildren) {
            this.target = this.element.find(this.options.target);
        } else {
            this.target = $(this.options.target);
        }
        
        // All who have the same target so we can toggle them all so every element has the same state
        this.extendedElements = $('[data-target="' + this.options.target + '"]');
        this.delayObj = 0;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    TargetToggle.prototype = {
        init: function() {
            this.element.on(this.options.event, this.toggle.bind(this));
            this.target.on('animationend', function(e){
                // Prevent bubbling problems
                if(e.target == this.target[0]){
                    this.options.animationend(e, this);
                }
            }.bind(this));
            this.target.on('transitionend', function(e){
                // Prevent bubbling problems
                if(e.target == this.target[0]){
                    this.options.transitionend(e, this);
                }
            }.bind(this));
            this.element.addClass('target-toggle-enabled');
        },

        toggle: function(e){
            this.options.beforeToggle(e, this);

            if(this.options.removeOthers){
                $('.' + this.options.className).not(this.target).removeClass(this.options.className);
                $('.has-'+this.options.className).not(e.currentTarget).removeClass('has-'+this.options.className);
            }

            if(typeof this.options.delay=="number" && this.target.hasClass(this.options.className)){
                this.delayObj = window.setTimeout(function(){
                    this.target.toggleClass(this.options.className);
                    this.extendedElements.toggleClass('has-'+this.options.className);

                    if(this.options.preventDefault){
                        e.preventDefault();
                    }

                    if(this.options.stopPropagation){
                        e.stopPropagation();
                    }
                }.bind(this), this.options.delay);
            }else{
                this.target.toggleClass(this.options.className);
                this.extendedElements.toggleClass('has-'+this.options.className);

                if(this.options.preventDefault){
                    e.preventDefault();
                }

                if(this.options.stopPropagation){
                    e.stopPropagation();
                }
            }

            this.options.afterToggle(e, this);
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