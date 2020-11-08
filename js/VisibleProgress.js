/*!
 * Visible Progress
 * Original author: @davidwebca
 * Licensed under the MIT license
 * Allows an element to emit events on scroll as they are visible
 * on screen and provides a simple number between 0 and 1
 * to allow scroll-progressed animations.
 */

/**
 * Custom Events polyfill
 */
;(function() {
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
;(function(window){
     function VisibleProgress(el, absolute, absoluteMax, absoluteOffset, lerpValue){
        this.el = el;

        if(typeof window.jQuery !=='undefined' && this.el instanceof jQuery){
            this.el = el[0];
        }
        if(this.el instanceof window.Node){
            this.loaded = false;
            this.rawProgress = 0;
            this.progress = 0;
            this.topProgress = 0;
            this.scrollframe = -1;
            this.lerpFrame = -1;
            this.lerpProgress = -1;


            this.absolute = false;
            if(typeof absolute != "undefined"){
                this.absolute = absolute;
            }

            this.absoluteMax = 0;
            if(typeof absoluteMax != "undefined"){
                this.absoluteMax = absoluteMax;
            }

            this.absoluteOffset = 0;
            if(typeof absoluteOffset != "undefined"){
                this.absoluteOffset = absoluteOffset;
            }

            this.lerpValue = 1;
            if(typeof lerpValue != "undefined") {
                this.lerpValue = lerpValue;
            }

            this.bindEvents();
            // Already fired load event when instance is created
            if(document.readyState === "complete"){
                VisibleProgress.triggerScroll(window);
            }
        }else{
            console.log('First param needs to be an instance of Element, Node or jQuery');
        }
    }

    VisibleProgress.ev = function(el, name, d) {
        var data = {
            bubbles: false,
            cancelable: false,
            detail: d
        };

        var event = new CustomEvent(name, data);
        el.dispatchEvent(event);
    }

    VisibleProgress.triggerScroll = function(el){
        if (typeof(Event) === 'function') {
            var event = new Event('scroll');
        } else {
            var event = document.createEvent('Event');
            event.initEvent('scroll', true, true);
        }
        el.dispatchEvent(event);
    }

    VisibleProgress.prototype.boundEvents = function(){
        if(this.scrollframe == -1){
            this.elTop = this.el.getBoundingClientRect().top;
            this.elHeight = this.el.getBoundingClientRect().height;
            this.yOffset = window.pageYOffset;
            this.wHeight = window.innerHeight;
            
            this.scrollframe = window.requestAnimationFrame(this.calculateVisibleProgress.bind(this));
        }
    }

    VisibleProgress.prototype.bindEvents = function(){
        // window.addEventListener('mousewheel', this.boundEvents.bind(this));
        window.addEventListener('scroll', this.boundEvents.bind(this));
        window.addEventListener('resize', this.boundEvents.bind(this));
        window.addEventListener('load', this.boundEvents.bind(this));
    }

    VisibleProgress.prototype.calculateVisibleProgress = function(ev){
        var startPos = this.elTop;
        startPos = startPos === 0 ? 0.000001 : startPos; // Avoid division by zero
        var endPos = this.wHeight;

        this.topProgress = 1 - (startPos / endPos);

        if(this.absolute){
            this.rawProgress = (this.yOffset - this.absoluteOffset) / this.absoluteMax;
            this.progress = Math.min(Math.max( this.rawProgress , 0), 0.9999);
        }else{
            startPos = this.wHeight - this.elTop;
            endPos = this.wHeight + this.elHeight;
            this.rawProgress = startPos / endPos;
            this.progress = Math.min(Math.max( this.rawProgress , 0), 0.9999);
        }

        if(VisibleProgress.loaded){
            VisibleProgress.ev(this.el, 'progress.vp', {instance:this})
        }

        /**
         * Do not trigger lerp if isn't loaded,
         * lerpValue is to its default,
         * the progress is not "inside" the animation
         */
        if(VisibleProgress.loaded && this.lerpValue !==1 && this.progress >= 0.000001 && this.progress <= 0.9999) {
            this.lerp();
        }

        this.scrollframe = -1;
    }

    VisibleProgress.prototype.lerp = function() {
        if(this.lerpProgress == -1) {
            this.lerpProgress = this.progress;
        }

        var diff = this.progress - this.lerpProgress;

        this.lerpProgress += (this.progress - this.lerpProgress) * this.lerpValue; 
        VisibleProgress.ev(this.el, 'lerp.vp', {instance:this})

        if (Math.abs(diff) > 0.000005) {
            this.lerpFrame = window.requestAnimationFrame(this.lerp.bind(this));
        } else if (this.lerpFrame) {
            window.cancelAnimationFrame(this.lerpFrame);
            this.lerpFrame = -1;
        }
    }

    /**
     * Avoid painting scroll progress if page isn't loaded
     * Images and fonts will be changing sizes of things when loaded
     */
    window.addEventListener('load', function(){
        VisibleProgress.loaded = true;
    });

    /**
     * iOS Safari pauses rendering for a whole second after scrolling, but this code is still unreliable
     */
    VisibleProgress.previousScrollTop = window.pageYOffset;
    VisibleProgress.verifyMomentumScrollFrame = 0;
    VisibleProgress.verifyMomentumScroll = function(){
        VisibleProgress.previousScrollTop = window.pageYOffset;
        VisibleProgress.verifyMomentumScrollFrame = window.requestAnimationFrame(VisibleProgress.verifyMomentumScroll);
        if(window.pageYOffset == VisibleProgress.previousScrollTop){
            window.setTimeout(function(){
                VisibleProgress.triggerScroll(window);
            }.bind(this), 1020);
            window.cancelAnimationFrame(VisibleProgress.verifyMomentumScrollFrame);
            VisibleProgress.verifyMomentumScrollFrame = 0;
        }
    }
    window.addEventListener('touchend', VisibleProgress.verifyMomentumScroll);
    window.addEventListener('touchstart touchmove touchend', function(ev){
        VisibleProgress.triggerScroll(window);
    });

    if ( typeof define === "function" && define.amd ) {
        define(function() { return VisibleProgress; });
    } else if ( typeof module !== "undefined" && module.exports ) {
        module.exports = VisibleProgress;
    } else {
        window.VisibleProgress = VisibleProgress;
    }
    // EXPOSE
})(window);