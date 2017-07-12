/*!
 * Visible Progress
 * Original author: @davidwebca
 * Licensed under the MIT license
 * Allows an element to emit events on scroll as they are visible
 * on screen and provides a simple number between 0 and 1
 * to allow scroll-progressed animations.
 */
;(function($, window){
    window.visibleProgress = function(el, absolute, absoluteMax, absoluteOffset){
        if(el.length){
            this.el = el;
            this.loaded = false;
            this.rawProgress = 0;
            this.progress = 0;
            this.animframe = -1;
            this.duration = 300;
            this.animationName = window.getComputedStyle(this.el[0])['animation-name'];


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
        }
    }

    window.visibleProgress.prototype.bindEvents = function(){
        $(window).on('mousewheel.vp scroll.vp resize.vp', this.calculateVisibleProgress.bind(this));
    }
    window.visibleProgress.prototype.calculateVisibleProgress = function(ev){
        if(this.absolute){
            this.rawProgress = ($(window).scrollTop() - this.absoluteOffset) / this.absoluteMax;
            this.progress = Math.min(Math.max( this.rawProgress , 0), 0.9999);
        }else{
            var startPos = $(window).outerHeight() - this.el[0].getBoundingClientRect().top;
            var endPos = $(window).outerHeight() + this.el[0].getBoundingClientRect().height;
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

        if(visibleProgress.loaded){
            window.requestAnimationFrame(function(){
                this.el.trigger('progress.vp', [this]);
            }.bind(this));
        }
    }
    window.visibleProgress.prototype.drawProgress = function(){
        // console.log((this.progress * this.duration * -1).toFixed(2) + 's');
        // this.el.css({
        //     'animation-delay': (this.progress * this.duration * -1).toFixed(2) + 's',
        //     'animation-duration': this.duration + 's'
        // });
        if(visibleProgress.loaded){
            window.requestAnimationFrame(function(){
                this.el.trigger('visibleProgress.vp', [this]);
            }.bind(this));
        }
    }

    /**
     * VisibleProgress static functions
     */
    window.visibleProgress.previousScrollTop = $(window).scrollTop();
    window.visibleProgress.verifyMomentumScrollFrame = 0;

    // // iOS Safari pauses rendering for a whole second after scrolling, but this code is still unreliable
    window.visibleProgress.verifyMomentumScroll = function(){
        window.visibleProgress.previousScrollTop = $(window).scrollTop();
        window.visibleProgress.verifyMomentumScrollFrame = window.requestAnimationFrame(window.visibleProgress.verifyMomentumScroll);
        if($(window).scrollTop() == window.visibleProgress.previousScrollTop){
            window.setTimeout(function(){
                $(window).trigger('scroll.vp');
            }, 1020);
            window.cancelAnimationFrame(window.visibleProgress.verifyMomentumScrollFrame);
            window.visibleProgress.verifyMomentumScrollFrame = 0;
        }
    }

    $(window).on('touchend', window.visibleProgress.verifyMomentumScroll);
    $(window).on('touchstart touchmove touchend', function(ev){
        $(window).trigger('scroll.vp');
    });
    $(window).on('load', function(){
        window.visibleProgress.loaded = true;
        $(window).trigger('scroll.vp');
    });
})(jQuery, window);
