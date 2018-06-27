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
     function VisibleProgress(el, absolute, absoluteMax, absoluteOffset){
        this.el = el;
        console.log(this.el);
        if(typeof window.jQuery !=='undefined' && this.el instanceof jQuery){
            this.el = el[0];
        }
        if(el instanceof window.Element){
            this.loaded = false;
            this.rawProgress = 0;
            this.progress = 0;
            this.topProgress = 0;
            this.animframe = -1;
            this.scrollframe = -1;
            this.duration = 300;
            this.animationName = window.getComputedStyle(this.el)['animation-name'];


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

            this.bindEvents();
            // Already fired load event when instance is created
            if(document.readyState === "complete"){
                VisibleProgress.triggerScroll(window);
            }
        }else{
            console.log('First param needs to be an instance of Element or jQuery');
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
        var event = new Event('scroll');
        el.dispatchEvent(event);
    }

    VisibleProgress.prototype.boundEvents = function(){
        this.scrollframe = window.requestAnimationFrame(this.calculateVisibleProgress.bind(this));
    }

    VisibleProgress.prototype.bindEvents = function(){
        window.addEventListener('mousewheel', this.boundEvents.bind(this));
        window.addEventListener('scroll', this.boundEvents.bind(this));
        window.addEventListener('resize', this.boundEvents.bind(this));
    }

    VisibleProgress.prototype.calculateVisibleProgress = function(ev){
        var startPos = this.el.getBoundingClientRect().top;
        startPos = startPos === 0 ? 0.000001 : startPos; // Avoid division by zero
        var endPos = window.innerHeight;
        this.topProgress = 1 - (startPos / endPos);

        if(this.absolute){
            this.rawProgress = (window.pageYOffset - this.absoluteOffset) / this.absoluteMax;
            this.progress = Math.min(Math.max( this.rawProgress , 0), 0.9999);
        }else{
            startPos = window.innerHeight - this.el.getBoundingClientRect().top;
            endPos = window.innerHeight + this.el.getBoundingClientRect().height;
            this.rawProgress = startPos / endPos;
            this.progress = Math.min(Math.max( this.rawProgress , 0), 0.9999);
        }

        if(this.progress <= 0 || this.progress >= 0.9999){
            if(this.animframe!=0){
                this.animframe = window.requestAnimationFrame(this.drawProgress.bind(this));
                window.cancelAnimationFrame(this.animframe);
                this.animframe = 0;
            }
        }else{
            this.animframe = window.requestAnimationFrame(this.drawProgress.bind(this));
        }

        if(VisibleProgress.loaded){
            window.requestAnimationFrame(function(){
                VisibleProgress.ev(this.el, 'progress.vp', {instance:this})
            }.bind(this));
        }
    }
    VisibleProgress.prototype.drawProgress = function(){
        // console.log((this.progress * this.duration * -1).toFixed(2) + 's');
        // this.el.css({
        //     'animation-delay': (this.progress * this.duration * -1).toFixed(2) + 's',
        //     'animation-duration': this.duration + 's'
        // });
        if(VisibleProgress.loaded){
            window.requestAnimationFrame(function(){
                VisibleProgress.ev(this.el, 'visibleProgress.vp', {instance:this})
            }.bind(this));
        }
    }

    /**
     * VisibleProgress static functions
     */
    VisibleProgress.previousScrollTop = window.pageYOffset;
    VisibleProgress.verifyMomentumScrollFrame = 0;

    // // iOS Safari pauses rendering for a whole second after scrolling, but this code is still unreliable
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
    window.addEventListener('load', function(){
        VisibleProgress.loaded = true;
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
