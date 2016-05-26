function objectAdded(option, targetObject) {
    if (LOG)
        console.log("objectAdded");
}
function objectRemoved(option, targetObject) {
    if (LOG)
        console.log("objectRemoved");
}
function objectSelected(option, targetObject) {

    if (LOG)
        console.log("objectSelected");




//    if (lastSelectedWidget != null) {
//        widgetApplyUnselectedStyle(lastSelectedWidget);
//        lastSelectedWidget = null;
//    }
//    if (lastSelectedOutput != null) {
//        outputApplyUnselectedStyle(lastSelectedOutput);
//        lastSelectedOutput = null;
//    }


}

function objectModified(option, targetObject) {
    if (LOG)
        console.log("objectModified");
    if (targetObject.type == "importedImage") {
        repositionAllWidgets(targetObject);
    }
}
function objectRotating(option, targetObject) {



    if (LOG)
        console.log("objectRotating");
    if (targetObject.type == "importedImage") {
        repositionAllWidgets(targetObject);
    }
}

function objectScaling(option, targetObject) {
//    if (LOG)
    console.log("objectScaling!!!");
    if (targetObject.type == "importedImage") {
        repositionAllWidgets(targetObject);
    }
}

function objectMoving(option, targetObject, parentGroup) {

//   if (LOG) console.log("objectMoving");

    targetObject.setCoords();

//    if (LOG) console.log("objectMoving !!!");
    targetObject.moving = true;

//    if (targetObject.type == "importedImage" || targetObject.type == "functionWidget") {
    if (targetObject.widgets) {

//        if (LOG) console.log("Going to reposition the widgets");

        repositionAllWidgets(targetObject);
    }

    if (targetObject.selectable && targetObject.evented) {

        if (targetObject.movingOpacity != 'undefined') {
            targetObject.opacity = targetObject.movingOpacity;
        } else {
            targetObject.opacity = 0.65;
        }

    }



    canvas.renderAll();
}

function objectMousedown(option, targetObject) {
    if (LOG)
        console.log("objectMousedown");
}




function objectMouseup(option, targetObject) {

    if (LOG)
        console.log("objectMouseup");

    if (targetObject.permanentOpacity != 'undefined') {
        targetObject.opacity = targetObject.permanentOpacity;
    } else {
        targetObject.opacity = 1;
    }

    // Moving all the widgets associated to this object
    targetObject.widgets.forEach(function (widget) {
        if (widget.permanentOpacity != 'undefined') {
            widget.opacity = widget.permanentOpacity;
        } else {
            widget.opacity = 1;
        }
    });

    canvas.renderAll();

}


//function objectMouseup(option, targetObject) {
//
//    if (LOG) console.log("objectMouseup");
//
//    if (targetObject.permanentOpacity) {
//        targetObject.opacity = targetObject.permanentOpacity;
//    } else {
//        targetObject.opacity = 1;
//    }
//
//    // Moving all the widgets associated to this object
//    targetObject.widgets.forEach(function(widget) {
//
//        if (widget.permanentOpacity) {
//            widget.opacity = widget.permanentOpacity;
//        } else {
//            widget.opacity = 1;
//        }
//
//    });
//
////    var arrayLength = targetObject.widgets.length;
////    for (var i = 0; i < arrayLength; i++) {
////        if (targetObject.widgets[i].permanentOpacity) {
////            targetObject.widgets[i].opacity = targetObject.widgets[i].permanentOpacity;
////        } else {
////            targetObject.widgets[i].opacity = 1;
////        }
////    }
//
//    if (!targetObject.moving) {
//
//        if (LOG) console.log("FUNCTION objectMouseup:");
//
//        if (LOG) console.log("option:");
//        if (LOG) console.log(option);
//
//        var theEvent = option['e'];
////        var theEvent = option;
//
//
//
//
//        if (targetObject.type == "importedImage") {
//
//
//
//            if (theEvent) {
//
//
//
//                // coordX and coordY are the points of the clic relative to the canvas
////            var coordY = theEvent.offsetY;
////            var coordX = theEvent.offsetX;
////
//////            if (LOG) console.log("coordX BEFORE: " + coordX);
//////            if (LOG) console.log("coordY BEFORE: " + coordY);
////
////            if (fabric.isTouchSupported && theEvent.changedTouches && theEvent.changedTouches.length > 0) {
////                // Here I use the changedTouches list since the up event produces a change in it
////                coordX = theEvent.changedTouches[0].pageX - $('#theCanvas').offset().left;
////                coordY = theEvent.changedTouches[0].pageY - $('#theCanvas').offset().top;
////            }
////
//////            if (LOG) console.log("coordX AFTER: " + coordX);
//////            if (LOG) console.log("coordY AFTER: " + coordY);
////
////            var localPoint = targetObject.toLocalPoint(new fabric.Point(coordX, coordY), 'left', 'top');
//
////
//////            if (LOG) console.log(localPoint);
////
////
////            // relativeX and relativeY are points local to the top left corner of the target object
////            var relativeX = localPoint.x;
////            var relativeY = localPoint.y;
//
//                var localPointer = targetObject.getLocalPointer(theEvent);
////                if (LOG) console.log("localPointer");
////                if (LOG) console.log(localPointer);
//
//
//                var relativeX = localPointer.x;
//                var relativeY = localPointer.y;
//
//                if (LOG) console.log("X coordinate relative to the object clicked: " + relativeX);
//                if (LOG) console.log("Y coordinate relative to the object clicked: " + relativeY);
//
////                if (LOG) console.log("targetObject.angle: " + targetObject.angle);
////                if (LOG) console.log("targetObject.getAngle(): " + targetObject.getAngle());
////                if (LOG) console.log("targetObject.get('angle'): " + targetObject.get('angle'));
//
//                var angleInDegrees = 360 - targetObject.getAngle();
//                if (LOG) console.log("angle: " + angleInDegrees);
//
//                var scaleX = targetObject.getScaleX();
//                var scaleY = targetObject.getScaleY();
//
//                if (LOG) console.log("scaleX: " + scaleX);
//                if (LOG) console.log("scaleY: " + scaleY);
//
//                var rotationCenter = new fabric.Point(targetObject.getLeft() - targetObject.getWidth() / 2, targetObject.getTop() - targetObject.getHeight() / 2);
//
//                var thePoint = new fabric.Point(rotationCenter.x + relativeX, rotationCenter.y + relativeY);
//                if (LOG) console.log("thePoint: ");
//                if (LOG) console.log(thePoint);
//
//                var angleInRadians = fabric.util.degreesToRadians(angleInDegrees);
//
//
//                var rotatedPoint = fabric.util.rotatePoint(thePoint, rotationCenter, angleInRadians);
//
//                rotatedPoint.x = rotatedPoint.x - rotationCenter.x;
//                rotatedPoint.y = rotatedPoint.y - rotationCenter.y;
//
//                rotatedPoint.x = rotatedPoint.x / scaleX;
//                rotatedPoint.y = rotatedPoint.y / scaleY;
//
//                if (LOG) console.log("Rotated point: ");
//                if (LOG) console.log(rotatedPoint);
//
//
//
//                var d = new Date();
//                var df = d.getMonth() + '-' + d.getDate() + '-' + d.getYear() + '_' + (d.getHours() + 1) + '_' + d.getMinutes() + '_' + d.getSeconds() + '_' + d.getMilliseconds();
//                var widgetID = targetObject.id + '-' + df;
//
//                var request = new XMLHttpRequest(); // create a new request object to send to server
//
//                request.open("POST", "FillArea", true); // set the method and destination
//
//                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
//                request.onreadystatechange = function() {
//
//                    if (request.readyState == 4) { // has the data arrived?
//                        if (request.status == 200) { // is everything OK?
//
//                            var textResponse = request.responseText; // getting the result
//
//                            if (textResponse.trim().length > 0) {
//                                var response = JSON.parse(textResponse);
//
//                                if (response) {
//
//
//
//                                    var pathString = response['path'];
//                                    if (pathString) {
//
//                                        var color = response['meanColor'];
//                                        var b = parseFloat(color['val'][0]).toFixed(0);
//                                        var g = parseFloat(color['val'][1]).toFixed(0);
//                                        var r = parseFloat(color['val'][2]).toFixed(0);
//
////                                    if (LOG) console.log(color);
////                                    if (LOG) console.log(r);
////                                    if (LOG) console.log(g);
////                                    if (LOG) console.log(b);
//
//                                        var massCenter = response['massCenter'];
//
////                                        if (LOG) console.log("response:");
////                                        if (LOG) console.log(response);
//
//
//                                        var x = massCenter['x'];
//                                        var y = massCenter['y'];
//
//
//
//                                        var widget = new fabric.Path(pathString);
//
//                                        widget.isColorSelector = true;
//
//                                        widget.untransformedX = x;
//                                        widget.untransformedY = y;
//                                        widget.parentObject = targetObject;
//
//
//                                        widget.type = "widget";
//                                        widget.id = widgetID;
//
//                                        widget.perPixelTargetFind = true;
//
//
//
//
//                                        var coordX = theEvent.offsetX;
//                                        var coordY = theEvent.offsetY;
//                                        if (fabric.isTouchSupported && theEvent.changedTouches && theEvent.changedTouches.length > 0) {
//                                            coordX = theEvent.changedTouches[0].pageX - $('#theCanvas').offset().left;
//                                            coordY = theEvent.changedTouches[0].pageY - $('#theCanvas').offset().top;
//                                        }
//
////                                        drawRectAt(new fabric.Point(coordX, coordY), "black");
//
//
//                                        var clickPoint = new fabric.Point(coordX, coordY);
//                                        var initialX = clickPoint.x;
//                                        var initialY = clickPoint.y;
//
//                                        widget.filledArea = parseFloat(response['filledArea']).toFixed(0);
//                                        widget.contourArea = parseFloat(response['contourArea']).toFixed(0);
//
//                                        widget.set({left: initialX, top: initialY, originX: 'center', originY: 'center', scaleX: 0, scaleY: 0});
//
////                                    if (LOG) console.log("initialX: " + initialX);
////                                    if (LOG) console.log("initialY: " + initialY);
//
////                                        var finalX = (x * scaleX) + ((targetObject.getLeft() - targetObject.getWidth() / 2) + widget.width * scaleX / 2);
////                                        var finalY = (y * scaleY) + ((targetObject.getTop() - targetObject.getHeight() / 2) + widget.height * scaleY / 2);
////
////                                        if (LOG) console.log("finalX: " + finalX);
////                                        if (LOG) console.log("finalY: " + finalY);
//
//
//
//
////                                        rotationCenter = new fabric.Point(targetObject.getLeft() - targetObject.getWidth() / 2, targetObject.getTop() - targetObject.getHeight() / 2);
////                                        var newRotationCenter = fabric.util.rotatePoint(new fabric.Point(rotationCenter.x, rotationCenter.y), targetObject.getCenterPoint(), -angleInRadians);
//
////                                        drawRectAt(rotationCenter, "blue");
////                                        canvas.add(new fabric.Rect({
////                                            left: rotationCenter.x,
////                                            top: rotationCenter.y,
////                                            fill: '',
////                                            stroke: 'blue',
////                                            perPixelTargetFind: true,
////                                            width: targetObject.getWidth(),
////                                            height: targetObject.getHeight()
////                                        }));
////                                        
////                                        drawRectAt(newRotationCenter, "green");
////                                        canvas.add(new fabric.Rect({
////                                            left: newRotationCenter.x,
////                                            top: newRotationCenter.y,
////                                            fill: '',
////                                            stroke: 'green',
////                                            perPixelTargetFind: true,
////                                            width: targetObject.getWidth(),
////                                            height: targetObject.getHeight()
////                                        }));
//
//
//
////                                        var diffX = rotationCenter.x - newRotationCenter.x;
////                                        var diffY = rotationCenter.y - newRotationCenter.y;
////
////
////                                        if (LOG) console.log("diffX: " + diffX);
////                                        if (LOG) console.log("diffY: " + diffY);
////
////                                        var widgetCenter = new fabric.Point(finalX, finalY);
//////                                        drawRectAt(widgetCenter, "yellow");
////                                        widgetCenter = fabric.util.rotatePoint(widgetCenter, rotationCenter, -angleInRadians);
////                                        widgetCenter.x = widgetCenter.x - diffX;
////                                        widgetCenter.y = widgetCenter.y - diffY;
////
////
////                                        finalX = widgetCenter.x;
////                                        finalY = widgetCenter.y;
//
////                                        drawRectAt(widgetCenter, "red");
//
//
////                                    drawRectAt(new fabric.Point(finalX, finalY), 'red');
////                                    if (LOG) console.log("finalX: " + finalX);
////                                    if (LOG) console.log("finalY: " + finalY);
//
//
//
//
//                                        var widgetPosition = computeWidgetPosition(widget);
//                                        var finalX = widgetPosition.x;
//                                        var finalY = widgetPosition.y;
//                                        widget.setAngle(targetObject.getAngle());
//                                        widget.untransformedAngle = 0;
//
//
//
//
//
////                                        widget.stroke = 'black';
////                                        widget.strokeWidth = 2;
////                                        widget.strokeDashArray = [5, 5];
//
//                                        widget.trueColor = 'rgb(' + r + ',  ' + g + ', ' + b + ')';
//                                        widget.fill = 'rgba(' + r + ',  ' + g + ', ' + b + ', ' + widget_fill_opacity + ')';
//
//
//                                        widget.lockRotation = true;
//                                        widget.lockScalingX = true;
//                                        widget.lockScalingY = true;
//                                        widget.lockMovementX = true;
//                                        widget.lockMovementY = true;
//
//                                        widget.hasControls = false;
//                                        widget.hasBorders = false;
//                                        widget.hasRotatingPoint = false;
//                                        widget.selectable = true;
//
//                                        widget.opacity = 1;
//                                        widget.permanentOpacity = widget.opacity;
//                                        widget.movingOpacity = 0.3;
//
//                                        widget.connectors = new Array();
//
//                                        widget.isWidget = true;
//
//                                        widget.untransformedScaleX = 1;
//                                        widget.untransformedScaleY = 1;
//
//
//
//
////                                    widget.borderColor = '#CC3333';
////                                    widget.cornerColor = '#FFCC00';
////                                    widget.transparentCorners = false;
//
//                                        targetObject.widgets.push(widget);
//
//                                        canvas.add(widget);
//                                        canvas.bringToFront(widget);
//                                        canvas.setActiveObject(widget);
//
//                                        scaleX = targetObject.getScaleX();
//                                        scaleY = targetObject.getScaleY();
//
//                                        animateWidget(widget, finalY, finalX, scaleX, scaleY, 500);
//
//                                        performTextRecognition(widget, color);
//
//
//
//                                    }
//                                }
//                            }
//                        }
//                    }
//                };
//
//                request.send("x=" + rotatedPoint.x + "&y=" + rotatedPoint.y + "&imageId=" + targetObject.id + "&widgetID=" + widgetID); // sending the data to the server
//            }
//        }
//
//    } else {
////        canvas.discardActiveObject();
//    }
//
//    targetObject.moving = false;
//    canvas.renderAll();
//}


function performTextRecognition(widget, meanColor) {

    if (LOG)
        console.log("performTextRecognition");

    var b = parseFloat(meanColor['val'][0]).toFixed(0);
    var g = parseFloat(meanColor['val'][1]).toFixed(0);
    var r = parseFloat(meanColor['val'][2]).toFixed(0);
    var imageForTextRecognition = widget.id;

    var request = new XMLHttpRequest(); // create a new request object to send to server
    request.open("POST", "ExtractText", true); // set the method and destination
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.onreadystatechange = function () {


        if (request.readyState == 4) { // has the data arrived?
            if (request.status == 200) { // is everything OK?

                var textResponse = request.responseText; // getting the result

                if (textResponse.trim().length > 0) {
                    var response = JSON.parse(textResponse);

                    if (response) {

                        if (LOG)
                            console.log(response);
                        widget.recognizedStrings = response;

                    }
                }
            }
        }


    };
    request.send("r=" + r + "&g=" + g + "&b=" + b + "&imageForTextRecognition=" + imageForTextRecognition); // sending the data to the server

}








function disableObjectEvents() {
    canvas.getObjects().forEach(function (object) {
        if (object.isImage || object.isWidget || object.isMark) {
            object.evented = false;
        }
    });
}

function enableObjectEvents() {
    if (LOG)
        console.log("%cActivating objects events...", "background:red; color:white;");
    canvas.getObjects().forEach(function (object) {
        if (object.isImage || object.isWidget || object.isMark) {
            object.evented = true;
        }
    });
}


function objectDoubleTap(theEvent, targetObject) {


    if (!canvas.isFloodFillMode) {
        return;
    }

    if (LOG)
        console.log("objectDoubleTap");

    if (LOG)
        console.log(theEvent);

    if (!theEvent.pointers)
        return;

    var viewportLeft = canvas.viewportTransform[4];
    var viewportTop = canvas.viewportTransform[5];

    if (LOG)
        console.log("viewportLeft:");
    if (LOG)
        console.log(viewportLeft);

    if (LOG)
        console.log("viewportTop:");
    if (LOG)
        console.log(viewportTop);

//    var x = (theEvent.pointers[0].pageX - viewportLeft - $('#theCanvas').offset().left ) / canvas.getZoom();
//    var y = (theEvent.pointers[0].pageY - viewportTop - $('#theCanvas').offset().top ) / canvas.getZoom();
//    drawRectAt(new fabric.Point(x, y), 'black');



//    drawRectAt(clientPoint, 'orange');


    var canvasOffset = canvas.calcOffset();
    if (LOG) {
        console.log("canvasOffset:");
        console.log(canvasOffset);
    }


    var topLeft = targetObject.getPointByOrigin('left', 'top');
//    drawRectAt(topLeft, 'red');

    if (LOG) {
        console.log("Image topLeft at after zoom of : " + canvas.getZoom());
        console.log(topLeft);
    }


    var x = (theEvent.pointers[0].pageX - viewportLeft - $('#theCanvas').offset().left) / canvas.getZoom();
    var y = (theEvent.pointers[0].pageY - viewportTop - $('#theCanvas').offset().top) / canvas.getZoom();
    // x and y are the corresponding canvas coordinates that should be taken into account
    var globalPointer = new fabric.Point(x, y);
//    drawRectAt(globalPointer, 'green');

    var localPointer = new fabric.Point(globalPointer.x - topLeft.x, globalPointer.y - topLeft.y);
    if (LOG) {
        console.log(localPointer);
    }



    var relativeX = localPointer.x;
    var relativeY = localPointer.y;

    if (LOG) {
        console.log("X coordinate relative to the object clicked: " + relativeX);
        console.log("Y coordinate relative to the object clicked: " + relativeY);
    }


//                if (LOG) console.log("targetObject.angle: " + targetObject.angle);
//                if (LOG) console.log("targetObject.getAngle(): " + targetObject.getAngle());
//                if (LOG) console.log("targetObject.get('angle'): " + targetObject.get('angle'));

    var angleInDegrees = 360 - targetObject.getAngle();
    if (LOG) {
        console.log("angle: " + angleInDegrees);
    }


    var scaleX = targetObject.getScaleX();
    var scaleY = targetObject.getScaleY();

    if (LOG) {
        console.log("scaleX: " + scaleX);
        console.log("scaleY: " + scaleY);
    }


    var rotationCenter = new fabric.Point(targetObject.getLeft() - targetObject.getWidth() / 2, targetObject.getTop() - targetObject.getHeight() / 2);

    var thePoint = new fabric.Point(rotationCenter.x + relativeX, rotationCenter.y + relativeY);
    if (LOG) {
        console.log("thePoint: ");
        console.log(thePoint);
    }


    var angleInRadians = fabric.util.degreesToRadians(angleInDegrees);


    var rotatedPoint = fabric.util.rotatePoint(thePoint, rotationCenter, angleInRadians);

    rotatedPoint.x = rotatedPoint.x - rotationCenter.x;
    rotatedPoint.y = rotatedPoint.y - rotationCenter.y;

    rotatedPoint.x = rotatedPoint.x / scaleX;
    rotatedPoint.y = rotatedPoint.y / scaleY;

    if (LOG) {
        console.log("Rotated point: ");
        console.log(rotatedPoint);
    }




    var d = new Date();
    var df = d.getMonth() + '_' + d.getDate() + '_' + d.getYear() + '_' + (d.getHours() + 1) + '_' + d.getMinutes() + '_' + d.getSeconds() + '_' + d.getMilliseconds();
    var widgetID = targetObject.id + '-' + df;

    var request = new XMLHttpRequest(); // create a new request object to send to server

    request.open("POST", "FillArea", true); // set the method and destination

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.onreadystatechange = function () {

        if (request.readyState == 4) { // has the data arrived?
            if (request.status == 200) { // is everything OK?

                var textResponse = request.responseText; // getting the result

                if (textResponse.trim().length > 0) {
                    var response = JSON.parse(textResponse);

                    if (response) {



                        var pathString = response['path'];
                        if (pathString) {

                            var color = response['meanColor'];
                            var b = parseFloat(color['val'][0]).toFixed(0);
                            var g = parseFloat(color['val'][1]).toFixed(0);
                            var r = parseFloat(color['val'][2]).toFixed(0);

//                                    if (LOG) console.log(color);
//                                    if (LOG) console.log(r);
//                                    if (LOG) console.log(g);
//                                    if (LOG) console.log(b);

                            var massCenter = response['massCenter'];

                            if (LOG) {
                                console.log("response:");
                                console.log(response);
                            }

                            var x = massCenter['x'];
                            var y = massCenter['y'];

                            if (LOG) {
                                console.log("%c" + "massCenter", "background: red; color: white;");
                                console.log(massCenter);
                            }

                            var thePath = pathString;



                            var widget = new fabric.Path(thePath);

                            widget.isColorSelector = true;

                            widget.untransformedX = x;
                            widget.untransformedY = y;
                            widget.parentObject = targetObject;


                            widget.type = "widget";
                            widget.id = widgetID;

                            widget.perPixelTargetFind = true;

                            var initialX = globalPointer.x;
                            var initialY = globalPointer.y;

                            var filledArea = Number(response['filledArea']);
                            var contourArea = Number(response['contourArea']);
                            var pathArea = computePathArea(thePath);

                            if (LOG) {
                                console.log("filledArea: " + filledArea);
                                console.log("contourArea: " + contourArea);
                                console.log("pathArea: " + pathArea);
                            }

                            widget.filledArea = parseInt(response['filledArea']);
                            widget.contourArea = parseInt(response['contourArea']);

                            var area = contourArea;

                            if (LOG) {
                                console.log("widget.filledArea: " + widget.filledArea);
                                console.log("widget.contourArea: " + widget.contourArea);
                            }

                            widget.value = widget.filledArea;

                            widget.applyUnselectedStyle = function (unSelectConnectorsToo) {
                                if (LOG) {
                                    console.log("widget.applyUnselectedStyle");
                                }

                                this.stroke = widget_stroke_color;
                                this.strokeWidth = widget_stroke_width;
                                this.strokeDashArray = widget_stroke_dash_array;
                                if (unSelectConnectorsToo) {
                                    this.connectors.forEach(function (connector) {
                                        connector.applyUnselectedStyle(false, false);
                                    });
                                }
                            };

                            widget.applySelectedStyle = function (selectConnectorsToo) {
                                if (LOG){
                                    console.log("widget.applySelectedStyle");
                                }
                                this.stroke = widget_selected_stroke_color;
                                this.strokeWidth = widget_selected_stroke_width;
                                this.strokeDashArray = widget_selected_stroke_dash_array;
                                if (selectConnectorsToo) {
                                    this.connectors.forEach(function (connector) {
                                        connector.applySelectedStyle(false, false);
                                    });
                                }
                            };

                            widget.on({
                                'inConnectionRemoved': function (options) {
                                    var removedConnection = options.connector;
                                    if (LOG) {
                                        console.log("%cAn IN connection has been removed from this vixor", "background: LightPink");
                                    }
                                },
                                'outConnectionRemoved': function (options) {
                                    var removedConnection = options.connector;
                                    if (LOG) {
                                        console.log("%cAn OUT connection has been removed from this vixor", "background: LightPink");
                                    }
                                    fabric.util.removeFromArray(this.connectors, removedConnection);
                                }
                            });


                            if (LOG) {
                                console.log("widget.value: " + widget.value);
                                console.log("typeof widget.filledArea: " + typeof widget.filledArea);
                            }

                            widget.set({left: initialX, top: initialY, originX: 'center', originY: 'center', scaleX: 0, scaleY: 0});

                            var widgetPosition = computeWidgetPosition(widget);
                            var finalX = widgetPosition.x;
                            var finalY = widgetPosition.y;
                            widget.setAngle(targetObject.getAngle());
                            widget.untransformedAngle = 0;

                            widget.trueColor = rgb(r, g, b);
                            widget.trueColorDarker = darkenrgb(r, g, b);

                            widget.fill = 'rgba(' + (r * 1.5).toFixed(0) + ',  ' + (g * 1.5).toFixed(0) + ', ' + (b * 1.5).toFixed(0) + ', ' + widget_fill_opacity + ')';


                            widget.lockRotation = true;
                            widget.lockScalingX = true;
                            widget.lockScalingY = true;
                            widget.lockMovementX = true;
                            widget.lockMovementY = true;

                            widget.hasControls = false;
                            widget.hasBorders = false;
                            widget.hasRotatingPoint = false;
                            widget.selectable = true;

                            widget.opacity = 1;
                            widget.permanentOpacity = widget.opacity;
                            widget.movingOpacity = 0.3;

                            widget.connectors = new Array();

                            widget.isWidget = true;

                            widget.untransformedScaleX = 1;
                            widget.untransformedScaleY = 1;

                            scaleX = targetObject.getScaleX();
                            scaleY = targetObject.getScaleY();

                            var fillColor = 'rgba(' + (r * 1.5).toFixed(0) + ',  ' + (g * 1.5).toFixed(0) + ', ' + (b * 1.5).toFixed(0) + ', ' + 0.75 + ')';
                            var vixorOptions = {
                                finalOptions: {left: finalX, top: finalY, scaleX: targetObject.getScaleX(), scaleY: targetObject.getScaleY()},
                                left: initialX,
                                top: initialY,
                                fillColor: fillColor,
                                fill: fillColor,
                                stroke: darkenrgb(r, g, b),
                                markAsSelected: true,
                                thePath: pathString,
                                opacity: 1,
                                permanentOpacity: widget.opacity,
                                movingOpacity: 0.3,
                                isWidget: true,
                                parentObject: targetObject,
                                angle: targetObject.getAngle(),
                                untransformedAngle: 0,
                                untransformedX: x,
                                untransformedY: y,
                                untransformedScaleX: 1,
                                untransformedScaleY: 1,
                                area: area,
                                trueColor: rgb(r, g, b),
                                trueColorDarker: darkenrgb(r, g, b),
                                animateAtBirth: true,
                                isFilled: true,
                            };

                            var theExtractor = addExtractorToCanvas(COLOR_REGION_EXTRACTOR, vixorOptions);
                            targetObject.widgets.push(theExtractor);


                        }
                    }
                }
            }
        }
    };

    request.send("x=" + rotatedPoint.x + "&y=" + rotatedPoint.y + "&imageId=" + targetObject.id + "&widgetID=" + widgetID); // sending the data to the server

}