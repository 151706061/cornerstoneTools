(function($, cornerstone, cornerstoneTools) {

    'use strict';

    function touchMoveHandle(touchEventData, handle, doneMovingCallback, preventHandleOutsideImage) {
        console.log('touchMoveHandle');

        var element = touchEventData.element;
        
        var imageCoords = cornerstone.pageToPixel(element,
            touchEventData.currentPoints.page.x,
            touchEventData.currentPoints.page.y + 25);

        var distanceFromTouch = {
            x: handle.x - imageCoords.x,
            y: handle.y - imageCoords.y
        };

        function touchDragCallback(e, eventData) {
            handle.active = true;
            handle.x = eventData.currentPoints.image.x + distanceFromTouch.x;
            handle.y = eventData.currentPoints.image.y + distanceFromTouch.y;
            cornerstone.updateImage(element);

            if (preventHandleOutsideImage) {
                handle.x = Math.max(handle.x, 0);
                handle.x = Math.min(handle.x, eventData.image.width);

                handle.y = Math.max(handle.y, 0);
                handle.y = Math.min(handle.y, eventData.image.height);
            }
        }

        function touchStartCallback() {
            cornerstone.updateImage(element);
        }

        $(element).on('CornerstoneToolsTouchStart', touchStartCallback);
        $(element).on('CornerstoneToolsTouchDrag', touchDragCallback);

        function touchEndCallback(e, eventData) {
            $(element).off('CornerstoneToolsTouchStart', touchStartCallback);
            $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);

            $(element).off('CornerstoneToolsTouchPinch', touchEndCallback);
            $(element).off('CornerstoneToolsTouchEnd', touchEndCallback);

            handle.active = false;

            if (e.type !== 'CornerstoneToolsTouchPinch') {
                if (preventHandleOutsideImage) {
                    handle.x = Math.max(handle.x, 0);
                    handle.x = Math.min(handle.x, eventData.image.width);

                    handle.y = Math.max(handle.y, 0);
                    handle.y = Math.min(handle.y, eventData.image.height);
                }
            }

            cornerstone.updateImage(element);

            if (typeof doneMovingCallback === 'function') {
                doneMovingCallback();
            }
        }

        // Note: Don't use DragEnd here. If we use dragEnd, then the moveEndCallback
        // fires before touchend. If another handle movement is also required, this
        // remaining touchend event will cause that handle mover to end prematurely.
        // This occured with the angle tool, prompting this note.
        $(element).on('CornerstoneToolsTouchPinch', touchEndCallback);
        $(element).on('CornerstoneToolsTouchEnd', touchEndCallback);
    }

    // module/private exports
    cornerstoneTools.touchMoveHandle = touchMoveHandle;

})($, cornerstone, cornerstoneTools);
