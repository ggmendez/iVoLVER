//var lastSelectedWidget = null;

function widgetApplySelectedStyle(widget) {
    if (widget != null) {
        widget.stroke = widget_selected_stroke_color;
        widget.strokeWidth = widget_selected_stroke_width;
        widget.strokeDashArray = widget_selected_stroke_dash_array;
    }
}

function widgetApplyUnselectedStyle(widget) {
    if (widget != null) {
        widget.stroke = widget_stroke_color;
        widget.strokeWidth = widget_stroke_width;
        widget.strokeDashArray = widget_stroke_dash_array;
    }
}

function widgetAdded(option, targetWidget) {
    if (LOG) console.log("widgetAdded");
}
function widgetRemoved(option, targetWidget) {
    if (LOG) console.log("widgetRemoved");
}
function widgetSelected(option, targetWidget) {
    if (LOG) console.log("widgetSelected");
    widgetApplySelectedStyle(targetWidget);

//    if (lastSelectedOutput) {
//        outputApplyUnselectedStyle(lastSelectedOutput);
//    }

//    if (targetWidget != lastSelectedWidget) {
//
//        widgetApplySelectedStyle(targetWidget);
//
////        targetWidget.connectors.forEach(function(connector) {
////            if (LOG) console.log(connector.configurator);
////            connector.configurator.show();
////        });
//
//        if (lastSelectedWidget != null) {
//
//            widgetApplyUnselectedStyle(lastSelectedWidget);
//
////            lastSelectedWidget.connectors.forEach(function(connector) {
////                connector.configurator.hide();
////            });
//        }
//
//        lastSelectedWidget = targetWidget;
//    }


    canvas.renderAll();
}

function widgetModified(option, targetWidget) {
    if (LOG) console.log("widgetModified");
}
function widgetRotating(option, targetWidget) {
    if (LOG) console.log("widgetRotating");
}
function widgetScaling(option, targetWidget) {
    if (LOG) console.log("widgetScaling");
}
function widgetMoving(option, targetWidget, parentGroup) {

    if (LOG) console.log("widgetMoving");
    targetWidget.moving = true;

    var theEvent = option;

    theEvent = option['e'];

    if (theEvent) {

        var canvasCoords = getCanvasCoordinates(theEvent);
        var coordX = canvasCoords.x;
        var coordY = canvasCoords.y;

        var lastAddedConnector = getLastElementOfArray(targetWidget.connectors);
        lastAddedConnector.set({x2: coordX, y2: coordY});
        canvas.renderAll();

    } else {



    }



}

function widgetMousedown(option, targetWidget) {

    if (LOG) console.log("widgetMousedown");

    var theEvent = option;
    theEvent = option['e'];

    if (theEvent) {

        var canvasCoords = getCanvasCoordinates(theEvent);
        var coordX = canvasCoords.x;
        var coordY = canvasCoords.y;

        var newConnector = new Connector({source: targetWidget, x2: coordX, y2: coordY, arrowColor: targetWidget.trueColor, filledArrow: true, value: targetWidget.value});
        newConnector.widget = targetWidget;
        targetWidget.connectors.push(newConnector);

        canvas.add(newConnector);
        canvas.renderAll();

        if (LOG) console.log("Created connector: ");
        if (LOG) console.log(newConnector);

    }

}

function widgetMouseup(option, targetWidget) {

    if (LOG) console.log("widgetMouseup");

    if (targetWidget.permanentOpacity) {
        targetWidget.opacity = targetWidget.permanentOpacity;
    } else {
        targetWidget.opacity = 1;
    }

    if (targetWidget.moving) {

        var theEvent = option['e'];

        if (theEvent) {

            if (LOG) console.log(theEvent);

            var canvasCoords = getCanvasCoordinates(theEvent);
            var coordX = canvasCoords.x;
            var coordY = canvasCoords.y;

            if (LOG) console.log("%c" + canvasCoords, "background: gray");

            var targetObject = getObjectContaining(canvasCoords);

            if (LOG) console.log("targetObject: ");
            if (LOG) console.log(targetObject);


            if (targetObject) {

                if (targetObject.isImage) {

                    // removing the last connector added when the widget was down clicked 
                    var connector = targetWidget.connectors.pop();
                    canvas.remove(connector);

                } else {

                    if (targetObject.isOutput) {
                        // if the mouse up event happens over an existing output
                        var existingOutput = targetObject;
                        var connector = getLastElementOfArray(targetWidget.connectors);
                        connector.setDestination(targetObject, false);

                        addConnectorToOutput(existingOutput, connector);

                    } else if (targetObject.isOperator) {
                        var operator = targetObject;
                        canvas.bringToFront(operator);
                        var connector = getLastElementOfArray(targetWidget.connectors);
                        connector.setDestination(operator, true);
                    } else if (targetObject.isAggregator) {

                        if (LOG) console.log("lsdfuygso78fgyoas78fyvso78dfysaoufy");


                        var connector = getLastElementOfArray(targetWidget.connectors);
                        targetObject.addConnector(connector, canvasCoords);


                    }

                }

            } else {

                // addOutputAt(coordX, coordY, targetWidget, lastAddedConnector, CIRCULAR_OUTPUT);

                // The mouse up event is done over a blank section of the canvas
                var lastAddedConnector = getLastElementOfArray(targetWidget.connectors);

                var mostFrecuentString = "Label";
                if (targetWidget.recognizedStrings && targetWidget.recognizedStrings.length > 0) {
                    mostFrecuentString = getMode(targetWidget.recognizedStrings);
                }

                var options = {
                    left: coordX,
                    top: coordY,
                    fill: lastAddedConnector.arrowColor,
                    stroke: targetWidget.trueColorDarker,
                    area: lastAddedConnector.value,
//                    label: mostFrecuentString
                    label: '' + targetWidget.value
                };

                addOutputToCanvas(lastAddedConnector, CIRCULAR_OUTPUT, options);


//                var options1 = {
//                    left: coordX,
//                    top: coordY,
//                    fill: lastAddedConnector.arrowColor,
//                    stroke: targetWidget.trueColorDarker,
//                    area: lastAddedConnector.value,
//                    label: 'Circular mark',
//                    markAsSelected: true
//                };
//                var circularMark = addMarkToCanvas(CIRCULAR_MARK, options1);
//                circularMark.inConnectors.push(lastAddedConnector);
//                lastAddedConnector.setDestination(circularMark, true);



            }

        }

    } else {
        // removing the last connector added when the widget was down clicked 
        var connector = targetWidget.connectors.pop();
        canvas.remove(connector);

    }



    targetWidget.moving = false;
    canvas.renderAll();
}

function animateWidget(widget, top, left, scaleX, scaleY, duration) {



//    var easing = fabric.util.ease.easeOutExpo;

//    duration *= 2.5;    
//    var easing = fabric.util.ease.easeOutElastic;

    var easing = fabric.util.ease.easeOutBack;
//    var easing = fabric.util.ease.easeOutBounce;



    widget.animate('top', top, {
        onChange: canvas.renderAll.bind(canvas),
        duration: duration,
        easing: easing
    });
    widget.animate('left', left, {
        onChange: canvas.renderAll.bind(canvas),
        duration: duration,
        easing: easing
    });
    widget.animate('scaleX', scaleX, {
        onChange: canvas.renderAll.bind(canvas),
        duration: duration,
        easing: easing
    });
    widget.animate('scaleY', scaleY, {
        onChange: canvas.renderAll.bind(canvas),
        duration: duration,
        easing: easing,
        onComplete: function () {
            widgetAssociateMouseEvents(widget);
            canvas.bringToFront(widget);
            canvas.setActiveObject(widget);
        }
    });
}


function removeWidget(widget) {

    fabric.util.removeFromArray(widget.parentObject.widgets, widget);

    // este Widget debería ser removido de la lista de widgets del parentObject
    widget.connectors.forEach(function (connector) {
        removeOutput(connector.output);
    });
    canvas.remove(widget);
}



function getOutputContaining(x, y) {
    var theObject = null;
    canvas.forEachObject(function (object) {
        var point = new fabric.Point(x, y);
        if (object.isOutput && object.containsPoint(point)) {
            theObject = object;
        }
    });
    return theObject;
}



function hideWidgetsOutputsConnectors() {
    canvas.forEachObject(function (object) {
        if (object.isConnector) {
            connectorHide(object);
        }
    });
    canvas.renderAll();
}

function showWidgetsOutputsConnectors() {
    canvas.forEachObject(function (object) {
        if (object.isConnector) {
            connectorShow(object);
        }
    });
    canvas.renderAll();
}

function toggleWidgetsOutputsConnectorsVisibility() {
    if (LOG) console.log("toggleWidgetsOutputsConnectorsVisibility");
    canvas.forEachObject(function (object) {
        if (object.isConnector) {
            object.toggleVisibility();
        }
    });
    canvas.renderAll();
}

function toggleMarksState() {
    var markWithMoreVisualProperties = null;
    var maxVisualProperties = -1;
    var allTheMarks = new Array();
    canvas.forEachObject(function (object) {
        if (object.isMark) {
            allTheMarks.push(object);
            if (object.visualProperties.length > maxVisualProperties) {
                markWithMoreVisualProperties = object;
                maxVisualProperties = object.visualProperties.length;
            }
        }
    });

    if (LOG) console.log(allTheMarks);

    fabric.util.removeFromArray(allTheMarks, markWithMoreVisualProperties);

    if (LOG) console.log(allTheMarks);

    allTheMarks.push(markWithMoreVisualProperties);

    if (LOG) console.log(allTheMarks);

    var i = 0;
    for (i = 0; i < allTheMarks.length; i++) {
        allTheMarks[i].toggleState(i == allTheMarks.length - 1);
    }
    canvas.renderAll();
}

function textRecognizerMoving(option, widget) {
    var event = option.e;
    if (event) {
        event.preventDefault();
    }
    computeUntransformedProperties(widget);
}

function textRecognizerScaling(option, widget) {
    var event = option.e;
    if (event) {
        event.preventDefault();
    }
    computeUntransformedProperties(widget);
}

function textRecognizerRotating(option, widget) {
    var event = option.e;
    if (event) {
        event.preventDefault();
    }
    computeUntransformedProperties(widget);
}





function extractTextFromImageObject(widget) {

    if (!widget)
        return;

    if (LOG) console.log("extractTextFromImageObject");

    var roi = widget.roi;
    var x = roi.x;
    var y = roi.y;
    var width = roi.width;
    var height = roi.height;
    var angle = roi.angle;

    var imageObject = widget.parentObject;

    var imageForTextRecognition = imageObject.id;

    var request = new XMLHttpRequest(); // create a new request object to send to server    
    request.open("POST", "ExtractTextFromImageObject", true); // set the method and destination
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.onreadystatechange = function () {


        if (request.readyState == 4) { // has the data arrived?
            if (request.status == 200) { // is everything OK?

                var textResponse = request.responseText; // getting the result

                if (textResponse.trim().length > 0) {
                    var response = JSON.parse(textResponse);

                    if (response) {

                        if (LOG) console.log(response);
                        widget.recognizedStrings = response;

                    }
                }
            }
        }
    };

    request.send("x=" + x + "&y=" + y + "&width=" + width + "&height=" + height + "&angle=" + angle + "&imageForTextRecognition=" + imageForTextRecognition); // sending the data to the server

}


function widgetAssociateMouseEvents(widget) {
    widget.on({
        'mouseup': function (option) {
            widgetMouseup(option, widget);
        },
        'mousedown': function (option) {
            widgetMousedown(option, widget);
        },
        'moving': function (option) {
            widgetMoving(option, widget);
        },
        'selected': function (option) {
            widgetSelected(option, widget);
        }
    });
}


function widgetDoubleTap(event, widget) {
    if (LOG) console.log("widgetDoubleTap");
}