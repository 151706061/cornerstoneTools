var cornerstoneTools = (function (cornerstoneTools) {

    "use strict";

    if (cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function throttle(callback, limit) {
        // Credit to http://sampsonblog.com/749/simple-throttle-function
        // Modified to pass event and custom event data to the callback
        //
        var wait = false;                            // Initially, we're not waiting
        return function(e, eventData) {              // We return a throttled function
            if (!wait) {                             // If we're not waiting
                callback.call(null, e, eventData);   // Execute users function
                wait = true;                         // Prevent future invocations
                setTimeout(function () {             // After a period of time
                    wait = false;                    // And allow future invocations
                }, limit);
            }
        };
    }

    // module exports
    cornerstoneTools.throttle = throttle;

    return cornerstoneTools;
}(cornerstoneTools));