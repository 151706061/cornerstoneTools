(function($, cornerstone, cornerstoneMath, cornerstoneTools) {

    'use strict';

    function touchTool(touchToolInterface) {
        ///////// BEGIN ACTIVE TOOL ///////

        function addNewMeasurement(touchEventData) {
            //console.log('touchTool addNewMeasurement');
            var element = touchEventData.element;

            var measurementData = touchToolInterface.createNewMeasurement(touchEventData);
            if (!measurementData) {
                return;
            }

            cornerstoneTools.addToolState(element, touchToolInterface.toolType, measurementData);

            $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
            
            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
            cornerstoneTools.touchMoveHandle(touchEventData, measurementData.handles.end, function() {
                measurementData.active = false;
                measurementData.invalidated = true;
                if (cornerstoneTools.anyHandlesOutsideImage(touchEventData, measurementData.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(element, touchToolInterface.toolType, measurementData);

                    if (touchToolInterface.newMeasurementOutOfBounds) {
                        touchToolInterface.newMeasurementOutOfBounds(touchEventData, measurementData);
                    }
                }

                $(element).on('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

                if (touchToolInterface.pressCallback) {
                    $(element).on('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
                }

                cornerstone.updateImage(element);
            });
        }

        function touchDownActivateCallback(e, eventData) {
            //console.log('touchTool touchDownActivateCallback');
            if (touchToolInterface.addNewMeasurement) {
                touchToolInterface.addNewMeasurement(eventData);
            } else {
                addNewMeasurement(eventData);
            }

            return false; // false = causes jquery to preventDefault() and stopPropagation() this event
        }

        function touchStartCallback(e, eventData) {
            //console.log('touchTool touchStartCallback');
            var element = eventData.element;
            var coords = eventData.startPoints.canvas;
            var data;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, touchToolInterface.toolType);
            var i;

            function doneMovingCallback() {
                //console.log('touchTool touchStartCallback doneMovingCallback');
                data.active = false;
                data.invalidated = true;
                if (cornerstoneTools.anyHandlesOutsideImage(eventData, data.handles)) {
                    // delete the measurement
                    cornerstoneTools.removeToolState(eventData.element, touchToolInterface.toolType, data);
                }

                cornerstone.updateImage(eventData.element);
                $(element).on('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
            }

            // now check to see if there is a handle we can move
            var distanceFromTouch = cornerstoneTools.touchSettings.getToolDistanceFromTouch();
            var distanceSq = Math.pow(Math.max(Math.abs(distanceFromTouch.x), Math.abs(distanceFromTouch.y)), 2);
            if (toolData) {
                for (i = 0; i < toolData.data.length; i++) {
                    data = toolData.data[i];

                    var handle = cornerstoneTools.getHandleNearImagePoint(eventData.element, data, coords, distanceSq);
                    if (handle) {
                        $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
                        data.active = true;

                        cornerstoneTools.touchMoveHandle(e, handle, doneMovingCallback);
                        e.stopImmediatePropagation();
                        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
                    }
                }
            }

            // Now check to see if we have a tool that we can move
            if (toolData && touchToolInterface.pointNearTool) {
                for (i = 0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if (touchToolInterface.pointNearTool(eventData.element, data, coords)) {
                        $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);
                        cornerstoneTools.touchMoveAllHandles(e, data, toolData, true, doneMovingCallback);
                        e.stopImmediatePropagation();
                        return false; // false = causes jquery to preventDefault() and stopPropagation() this event
                    }
                }
            }
        }
        ///////// END INACTIVE TOOL ///////

        // not visible, not interactive
        function disable(element) {
            $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            if (touchToolInterface.doubleTapCallback) {
                $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
            }
            
            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
        }

        // visible but not interactive
        function enable(element) {
            $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);

            if (touchToolInterface.doubleTapCallback) {
                $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
            }

            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
        }

        // visible, interactive and can create
        function activate(element) {
            //console.log('activate touchTool');

            $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).on('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).on('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            if (touchToolInterface.doubleTapCallback) {
                $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
                $(element).on('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
            }

            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
                $(element).on('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
        }

        // visible, interactive
        function deactivate(element) {
            //console.log('deactivate touchTool');
            
            $(element).off('CornerstoneImageRendered', touchToolInterface.onImageRendered);
            $(element).off('CornerstoneToolsTouchStart', touchToolInterface.touchStartCallback || touchStartCallback);
            $(element).off('CornerstoneToolsTouchStartActive', touchToolInterface.touchDownActivateCallback || touchDownActivateCallback);

            $(element).on('CornerstoneImageRendered', touchToolInterface.onImageRendered);

            if (touchToolInterface.doubleTapCallback) {
                $(element).off('CornerstoneToolsDoubleTap', touchToolInterface.doubleTapCallback);
            }

            if (touchToolInterface.pressCallback) {
                $(element).off('CornerstoneToolsTouchPress', touchToolInterface.pressCallback);
            }

            cornerstone.updateImage(element);
        }

        var toolInterface = {
            enable: enable,
            disable: disable,
            activate: activate,
            deactivate: deactivate,
            touchStartCallback: touchToolInterface.touchStartCallback || touchStartCallback,
            touchDownActivateCallback: touchToolInterface.touchDownActivateCallback || touchDownActivateCallback,
        };

        // Expose pointNearTool if available
        if (touchToolInterface.pointNearTool) {
            toolInterface.pointNearTool = touchToolInterface.pointNearTool;
        }

        if (touchToolInterface.doubleTapCallback) {
            toolInterface.doubleTapCallback = touchToolInterface.doubleTapCallback;
        }

        if (touchToolInterface.pressCallback) {
            toolInterface.pressCallback = touchToolInterface.pressCallback;
        }

        if (touchToolInterface.addNewMeasurement) {
            toolInterface.addNewMeasurement = touchToolInterface.addNewMeasurement;
        }

        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchTool = touchTool;

})($, cornerstone, cornerstoneMath, cornerstoneTools);
