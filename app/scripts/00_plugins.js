// Avoid `console` errors in browsers that lack a console

(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/*
 * jQuery plugins
 *
 */

/*
 * NOTE 
 * Resize and scroll events tend to fire A LOT
 *
 * I use this plugin when I want to execute code
 * on window resize without compromising performnce
 * 
 */

/*
 * throttledresize: special jQuery event that happens at a reduced rate compared to "resize"
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work? 
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */

(function($) {

var $event = $.event,
    $special,
    dummy = {_:0},
    frame = 0,
    wasResized, animRunning;

$special = $event.special.throttledresize = {
    setup: function() {
        $( this ).on( "resize", $special.handler );
    },
    teardown: function() {
        $( this ).off( "resize", $special.handler );
    },
    handler: function( event, execAsap ) {
        // Save the context
        var context = this,
            args = arguments;

        wasResized = true;

        if ( !animRunning ) {
            setInterval(function(){
                frame++;

                if ( frame > $special.threshold && wasResized || execAsap ) {
                    // set correct event type
                    event.type = "throttledresize";
                    $event.dispatch.apply( context, args );
                    wasResized = false;
                    frame = 0;
                }
                if ( frame > 9 ) {
                    $(dummy).stop();
                    animRunning = false;
                    frame = 0;
                }
            }, 30);
            animRunning = true;
        }
    },
    threshold: 0
};

})(jQuery);
