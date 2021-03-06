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

class VisibleProgress{
    constructor(el, absolute, absoluteMax, absoluteOffset) {
        this.el = el;

        if(typeof window.jQuery !=='undefined' && this.el instanceof jQuery){
            this.el = el[0];
        }
        if(this.el instanceof window.Node){
            this.loaded = false;
            this.rawProgress = 0;
            this.progress = 0;
            this.topProgress = 0;
            // this.animframe = -1;
            this.scrollframe = -1;
            this.ticking = false;

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
            // if(document.readyState === "complete"){
            //     VisibleProgress.triggerScroll(window);
            // }
        }else{
            console.log('First param needs to be an instance of Element, Node or jQuery');
        }
    }

    // boundEvents(){
        // this.pageYOffset = window.pageYOffset;
        // console.log(this.el);
        // this.requestTick();
    // }

    // requestTick() {
        // if(!this.ticking) {
            
        // }
        // this.ticking = true;
    // }

    bindEvents(){
        this.scrollframe = window.requestAnimationFrame(this.calculateVisibleProgress.bind(this));
        // window.addEventListener('mousewheel', this.boundEvents.bind(this));
        // window.addEventListener('scroll', this.boundEvents.bind(this));
        // window.addEventListener('resize', this.boundEvents.bind(this));


        // window.addEventListener('touchend', VisibleProgress.verifyMomentumScroll);
        // window.addEventListener('touchstart touchmove touchend', (ev) => {
        //     this.boundEvents.bind(this);
        //     // VisibleProgress.triggerScroll(window);
        // });
        window.addEventListener('load', () => {
            this.loaded = true;
        //     this.boundEvents();
        //     // VisibleProgress.triggerScroll(window);
        });
    }

    calculateVisibleProgress(ev){
        this.ticking = false;
        // debugger;
        let startPos = this.el.getBoundingClientRect().top;
        startPos = startPos === 0 ? 0.000001 : startPos; // Avoid division by zero
        let endPos = window.innerHeight;
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
            // if(this.animframe!=0){
                this.drawProgress.bind(this);
                // window.cancelAnimationFrame(this.animframe);
                // this.animframe = 0;
                VisibleProgress.ev(this.el, 'cancelled.vp', {instance:this})
            // }
        }else{
            // this.animframe = window.requestAnimationFrame(this.drawProgress.bind(this));
            this.drawProgress.bind(this);
        }

        if(this.loaded){
            // window.requestAnimationFrame(() => {
                VisibleProgress.ev(this.el, 'progress.vp', {instance:this})
            // });
        }

        this.scrollframe = window.requestAnimationFrame(this.calculateVisibleProgress.bind(this));
    }

    drawProgress(){
        if(this.loaded){
            VisibleProgress.ev(this.el, 'visibleProgress.vp', {instance:this})
        }
    }
}
/**
 * Static properties and functions
 */
VisibleProgress.previousScrollTop = window.pageYOffset;
VisibleProgress.verifyMomentumScrollFrame = 0;
VisibleProgress.ev = function(el, name, d) {
    let data = {
        bubbles: false,
        cancelable: false,
        detail: d
    };

    let evt = new CustomEvent(name, data);
    el.dispatchEvent(evt);
}

VisibleProgress.triggerScroll = function(el){
    let evt;
    if (typeof(Event) === 'function') {
        evt = new Event('scroll');
    } else {
        evt = document.createEvent('Event');
        evt.initEvent('scroll', true, true);
    }
    el.dispatchEvent(evt);
}

// // iOS Safari pauses rendering for a whole second after scrolling, but this code is still unreliable
VisibleProgress.verifyMomentumScroll = function(){
    VisibleProgress.previousScrollTop = window.pageYOffset;
    VisibleProgress.verifyMomentumScrollFrame = window.requestAnimationFrame(VisibleProgress.verifyMomentumScroll);
    if(window.pageYOffset == VisibleProgress.previousScrollTop){
        window.setTimeout(() => {
            VisibleProgress.triggerScroll(window);
        }, 1020);
        window.cancelAnimationFrame(VisibleProgress.verifyMomentumScrollFrame);
        VisibleProgress.verifyMomentumScrollFrame = 0;
    }
}