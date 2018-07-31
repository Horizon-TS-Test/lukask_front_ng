export class SliderManager {
    private slidesNumber: any;
    private visibleSlidePosition: any;
    private autoPlayId: any;
    private autoPlayDelay: any;
    private isAutoplay: any;

    constructor(
        private slidesWrapper: any,
        private navPause: any,
        private navPlay: any
    ) {
        this.slidesNumber = this.slidesWrapper.children('li').length;
        this.visibleSlidePosition = 0;
        this.autoPlayId;
        this.autoPlayDelay = 5000;
        this.isAutoplay = true;

        this.setAutoplay();
    }

    public goPrevNext(next: boolean = true) {
        if (next) {
            if (this.visibleSlidePosition < this.slidesNumber - 1) {
                this.visibleSlidePosition++;
                this.nextSlide(this.slidesWrapper.find('.selected'), this.slidesWrapper, this.visibleSlidePosition);
            } else {
                this.visibleSlidePosition = 0;
                this.prevSlide(this.slidesWrapper.find('.selected'), this.slidesWrapper, this.visibleSlidePosition);
            }
        }
        else {
            if (this.visibleSlidePosition > 0) {
                this.visibleSlidePosition--;
                this.prevSlide(this.slidesWrapper.find('.selected'), this.slidesWrapper, this.visibleSlidePosition);
            } else {
                this.visibleSlidePosition = this.slidesNumber - 1;
                this.nextSlide(this.slidesWrapper.find('.selected'), this.slidesWrapper, this.visibleSlidePosition);
            }
        }
        this.setAutoplay();
    }

    public playPause(pause: boolean = false) {
        if (pause) {
            this.navPause.css({
                'display': 'none'
            });
            this.navPlay.css({
                'display': 'inherit'
            });
            this.isAutoplay = false;
            clearInterval(this.autoPlayId);
        }
        else {
            this.navPlay.css({
                'display': 'none'
            });
            this.navPause.css({
                'display': 'inherit'
            });
            this.isAutoplay = true;
            this.setAutoplay();
        }
    }

    private nextSlide(visibleSlide, container, n) {
        visibleSlide.removeClass('selected from-left from-right').addClass('is-moving').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
            visibleSlide.removeClass('is-moving');
        });

        container.children('li').eq(n).addClass('selected from-right').prevAll().addClass('move-to-hide');
    }

    private prevSlide(visibleSlide, container, n) {
        visibleSlide.removeClass('selected from-left from-right').addClass('is-moving').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
            visibleSlide.removeClass('is-moving');
        });

        container.children('li').eq(n).addClass('selected from-left').removeClass('move-to-hide').nextAll().removeClass('move-to-hide');
    }

    private setAutoplay() {
        if (this.slidesWrapper.hasClass('autoplay')) {
            if (this.isAutoplay) {
                clearInterval(this.autoPlayId);
                this.autoPlayId = window.setInterval(() => {
                    this.autoplaySlider();
                }, this.autoPlayDelay);
            }
        }
    }

    private autoplaySlider() {
        if (this.visibleSlidePosition < this.slidesNumber - 1) {
            this.nextSlide(this.slidesWrapper.find('.selected'), this.slidesWrapper, this.visibleSlidePosition + 1);
            this.visibleSlidePosition += 1;
        } else {
            this.prevSlide(this.slidesWrapper.find('.selected'), this.slidesWrapper, 0);
            this.visibleSlidePosition = 0;
        }
    }
}