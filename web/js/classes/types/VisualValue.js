var VisualValue = function () {

    this.set('iVoLVERClass', 'visualValue');
    this.set('isVisualValue', true);

    this.set('xmlNodeName', 'visualValue');

    this.set('originX', 'center');
    this.set('originY', 'center');
    this.set('transparentCorners', false);
    this.set('perPixelTargetFind', false);
    this.set('lockRotation', true);
    this.set('lockScalingX', true);
    this.set('lockScalingY', true);
    this.set('hasBorders', false);
    this.set('hasControls', false);
    this.set('hasRotatingPoint', false);
    this.set('scaleX', 1.2);
    this.set('scaleY', 1.2);

    this.remove = function () {
        var theVisualValue = this;
        theVisualValue.inConnectors.forEach(function (inConnection) {
            inConnection.contract(false, false, true, fabric.util.ease['easeOutCubic']);
        });
        theVisualValue.outConnectors.forEach(function (outConnection) {
            outConnection.contract(true, false, true, fabric.util.ease['easeOutCubic']);
        });

        hideWithAnimation(theVisualValue, true);

    };

    this.setXmlIDs = function (from) {
        var theVisualValue = this;
        theVisualValue.xmlID = from++;
        return from;
    };

    this.executePendingConnections = function () {
        var theVisualValue = this;
        executePendingConnections(theVisualValue.xmlID);
    };

    this.toXML = function () {
        var visualValueNode = createXMLElement("visualValue");
        addAttributeWithValue(visualValueNode, "xmlID", this.xmlID);
        appendElementWithValue(visualValueNode, "left", this.left);
        appendElementWithValue(visualValueNode, "top", this.top);
        visualValueNode.append(this.value.toXML());
        return visualValueNode;
    };

    this.applySelectedStyle = function (selectConnectors) {
        this.selected = true;
        if (selectConnectors) {
            this.inConnectors.forEach(function (inConnector) {
                inConnector.opacity = 1;
                if (!inConnector.source.isOperator) {
                    inConnector.applySelectedStyle(true, false);
                } else {
                    inConnector.source.applySelectedStyle(false);
                    inConnector.applySelectedStyle(false, false);
                }
            });
            this.outConnectors.forEach(function (outConnector) {
                outConnector.opacity = 1;
                if (!outConnector.source.isOperator) {
                    outConnector.applySelectedStyle(false, true);
                } else {
                    outConnector.destination.applySelectedStyle(false);
                    outConnector.applySelectedStyle(false, false);
                }
            });
        }
    };
    this.applyUnselectedStyle = function (unselectConnectors) {
        this.selected = false;
        if (unselectConnectors) {
            this.inConnectors.forEach(function (inConnector) {
                inConnector.opacity = canvas.connectorsHidden ? 0 : 1;
                inConnector.applyUnselectedStyle(false, false);
            });
            this.outConnectors.forEach(function (outConnector) {
                outConnector.opacity = canvas.connectorsHidden ? 0 : 1;
                outConnector.applyUnselectedStyle(false, false);
            });
        }

    };
    this.addInConnector = function (connector) {
        this.inConnectors.push(connector);
        connector.setDestination(this, true);
    };
    this.addOutConnector = function (connector) {
        this.outConnectors.push(connector);
    };

    this.animateBirth = function (markAsSelected, finalScaleX, finalScaleY, doNotRefreshCanvas) {

        var theMark = this;
        var scaleX = finalScaleX || this.scaleX;
        var scaleY = finalScaleY || this.scaleY;
        this.set('scaleX', 0);
        this.set('scaleY', 0);

        if (markAsSelected) {
            this.applySelectedStyle(false);
        }

        var easing = fabric.util.ease['easeOutElastic'];
        var duration = 1200;

        theMark.animate('scaleX', scaleX, {
            duration: duration,
            easing: easing
        });

        theMark.animate('scaleY', scaleY, {
            duration: duration,
            easing: easing,
            onChange: doNotRefreshCanvas ? null : canvas.renderAll.bind(canvas),
            onComplete: doNotRefreshCanvas ? null : canvas.renderAll.bind(canvas),
        });

    };

    this._render = function (ctx) {
        this.renderMethod(ctx);
    };

    this.renderMethod = function (ctx) {

        // Since the path can have 'holes', we paint the background in white to avoid that what is behind the VisualValue representation becomes visible
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();


        ctx.save();
        this.callSuper('_render', ctx);
        ctx.restore();

        if (this.selected) {

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = this.fill;
            ctx.lineWidth = widget_selected_stroke_width;
            ctx.arc(0, 0, this.width / 2 - widget_selected_stroke_width / 2 + 1, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = widget_selected_stroke_width / 2;
            ctx.arc(0, 0, this.width / 2 + widget_selected_stroke_width / 3, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash(widget_selected_stroke_dash_array);
            ctx.strokeStyle = widget_selected_stroke_color;
            ctx.lineWidth = widget_selected_stroke_width;
            ctx.arc(0, 0, this.width / 2 + 1, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();



        }


//        if (this.selected || this.isFunctionLimit) {
        if (true) {

            if (!this.collection) {
                var string = '';
                if (this.value) {
                    string = this.value.getDisplayableString(this.optionsToDisplay);
                }
                ctx.save();
                ctx.beginPath();
                ctx.font = '16px Helvetica';
                ctx.fillStyle = 'black';
                ctx.textAlign = "center";
                ctx.moveTo(0, 0);
                ctx.fillText(string, 0, this.height / 2 + 20);
                ctx.closePath();
                ctx.restore();
            }

        }

    };


    this.associateEvents = function () {

        this.on({
            'doubleTap': function (options) {
                var theVisualValue = this;
                theVisualValue.expand();
            },
//            'scaling': function (options) {
//                console.log("Scaling datatype");
//            },
            'moving': function (options) {
                var theVisualValue = this;
                if (theVisualValue.lockMovementX && theVisualValue.lockMovementY) {
                    theVisualValue.connecting = true;
                    var theEvent = options.e;
                    if (theEvent) {
                        var canvasCoords = getCanvasCoordinates(theEvent);
                        var lastAddedConnector = getLastElementOfArray(theVisualValue.outConnectors);
                        if (lastAddedConnector) {
                            lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                        }
                    }
                } else {
                    updateConnectorsPositions(theVisualValue);
                }
            },
            'modified': function (option) {

                var theVisualValue = this;

                if (LOG)
                    console.log("Visual Variable being modified");
            },
            'selected': function (option) {

                var theVisualValue = this;

                if (LOG)
                    console.log("Visual Variable selected");
            },
            'mouseup': function (options) {

                var theVisualValue = this;
                theVisualValue.connecting = false;

                if (LOG)
                    console.log("Mouse UP over a Visual Variable");

                var theEvent = options.e;

                if (theEvent) {

                    var canvasCoords = getCanvasCoordinates(theEvent);

                    if (theVisualValue.lockMovementX && theVisualValue.lockMovementY) {


                        var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isOperator', 'isFunctionInput', 'isAggregator', 'isVisualValue', 'isMapperInput', 'isVerticalCollection', 'isMark', 'isNumericFunctionInput', 'isRangeLimit']);

                        var connector = getLastElementOfArray(theVisualValue.outConnectors);

                        if (targetObject) {

                            if (targetObject !== this) {

                                if (targetObject.isMark) {

                                    var connector = getLastElementOfArray(this.outConnectors);

                                    var theSource = connector.source;
                                    var theDestination = connector.destination;

                                    var visualProperty = targetObject.getDefaultModifiableVisualPropertyByType(theVisualValue.value);

                                    if (visualProperty) {

                                        connector.setDestination(visualProperty, true);

                                        setTimeout(function () {

                                            if (theSource) {
//                                                theSource.bringToFront();
                                                bringToFront(theSource);
                                            }
                                            if (theDestination) {
//                                                theDestination.bringToFront();
                                                bringToFront(theDestination);
                                            }
                                        }, 50);

                                    } else {

                                        var connector = this.outConnectors.pop();
                                        connector.contract();

                                    }



                                } else if (targetObject.isVerticalCollection) {

                                    addVisualVariableToCollection(theVisualValue, targetObject, connector);

                                } else if (targetObject.isRangeLimit || targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isMapperInput || targetObject.isNumericFunctionInput) {

                                    connector.setDestination(targetObject, true);

                                    setTimeout(function () {
                                        bringToFront(connector.source);
                                        bringToFront(connector.destination);
                                    }, 50);

                                } else if (targetObject.isOperator) {

                                    // This is NOT needed anymore
//                                    if (theVisualValue.isDurationData) {
//                                        connector.value = theVisualValue.value.convert("isNumericData");
//                                    }

                                    if (connector.value) {

                                        connector.setDestination(targetObject, true);

                                        setTimeout(function () {
//                                            connector.source.bringToFront();
//                                            connector.destination.bringToFront();
                                            bringToFront(connector.source);
                                            bringToFront(connector.destination);
                                        }, 50);

                                    } else {
                                        connector.contract();
                                    }




                                } else {

                                    alert("Here");

                                    // This makes no sense, so, the added connector is just removed
                                    connector = theVisualValue.outConnectors.pop();
                                    if (connector) {
                                        connector.contract();
                                    }
                                }

                            } else {
                                connector = theVisualValue.outConnectors.pop();
                                if (connector) {
//                                    connector.contract();

                                    var options = {
                                        connector: connector
                                    };

                                    if (connector.destination) {
                                        connector.destination.trigger('inConnectionRemoved', options);
                                    }
                                    if (connector.source) {
                                        connector.source.trigger('outConnectionRemoved', options);
                                    }

                                    connector.remove();
                                }
                            }

                        } else {

                            // This number is released on the canvas
                            connector = theVisualValue.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }

                        }

                        if (theVisualValue.collection) {


                            if (theVisualValue.collection.mapper) {
                                theVisualValue.lockMovementX = true;
                                theVisualValue.lockMovementY = false;
                            } else {
                                theVisualValue.lockMovementX = true;
                                theVisualValue.lockMovementY = true;
                            }




                        } else {

                            theVisualValue.lockMovementX = false;
                            theVisualValue.lockMovementY = false;

                        }






                    } else {


                        var canvasCoords = getCanvasCoordinates(theEvent);

                        var targetObject = findPotentialDestination(canvasCoords, ['isRangeLimit', 'isVerticalCollection', 'isVisualProperty']);

                        if (targetObject) {

                            if (targetObject.isRangeLimit) {

                                var incommingValue = theVisualValue.value;

                                hideWithAnimation(theVisualValue, false);
                                blink(targetObject, true, 0.65);
                                targetObject.setValue(incommingValue, false, false);
                                targetObject.updateTypeIcon(incommingValue, null, true, false);

                            } else if (targetObject.isVerticalCollection) {

                                var theCollection = targetObject;

                                addVisualVariableToCollection(theVisualValue, theCollection, null, true, null);

//                                addVisualVariableToCollection(theVisualVariable, theCollection);

                                if (theCollection.isCompressed) {

                                    theVisualValue.opacity = 0;

                                } else {

                                    var theMapper = theCollection.mapper;

                                    if (theMapper) {

                                        var otherCollection = theMapper.getOtherCollection(theCollection);

                                        if (LOG)
                                            console.log("%ctheCollection.getTotalValues(): " + theCollection.getTotalValues(), "background: red; color: white;");
                                        if (LOG)
                                            console.log("%cotherCollection.getTotalValues(): " + otherCollection.getTotalValues(), "background: red; color: white;");



                                        var collectionGrew = theCollection.getTotalValues() >= otherCollection.getTotalValues();

                                        if (LOG)
                                            console.log("%ccollectionGrew: " + collectionGrew, "background: red; color: white;");



                                    } else {
                                        hideWithAnimation(theVisualValue);
                                    }
                                }



                            } else if (targetObject.isVisualProperty) {

                                // TODO: IMPORTANT: The following code is NOT checking the types of the incomming value and the one that the visual property should receive
                                // This should be checked in the future

                                if (theVisualValue.outConnectors.length === 0) {

                                    var theVisualProperty = targetObject;

                                    var value = theVisualValue.value;

                                    theVisualValue.inConnectors.forEach(function (inConnector) {
                                        inConnector.contract();
                                    });

                                    hideWithAnimation(theVisualValue, false);
                                    blink(theVisualProperty, true, 0.65);

                                    setTimeout(function () {

                                        var convertedValue = value;

                                        if (!value[theVisualProperty.dataTypeProposition]) {

                                            convertedValue = value.convert(theVisualProperty.dataTypeProposition);

                                        }

                                        if (convertedValue) {
                                            popSound.play();


                                            if ((theVisualProperty.attribute === "x" || theVisualProperty.attribute === "y") && theVisualProperty.mark && theVisualProperty.mark.parentObject && theVisualProperty.mark.parentObject.isLocator) {


                                                theVisualProperty.mark.parentObject.positionChild(theVisualProperty.attribute, convertedValue, theVisualProperty.mark, true);

                                            } else {

                                                theVisualProperty.setValue(convertedValue, true, true);

//                                                theVisualProperty.parentObject.setProperty(theVisualProperty.attribute, convertedValue, newInConnection.source, shouldAnimate);

                                            }


                                            theVisualProperty.outConnectors.forEach(function (outConnector) {
                                                outConnector.setValue(convertedValue, false, true);
                                            });






                                        } else {
                                            alertify.error("Types not compatible", "", 2000);
                                            return;
                                        }




                                    }, 350);

                                }




                            }









                        }

                    }


                }





            },
            'pressed': function (option) {

                var theVisualValue = this;

                // if the visual value belongs to a collection that is not contained by a mapper, then, the pressed event does NOT have to be processed
                if (theVisualValue.collection && !theVisualValue.collection.mapper && theVisualValue.lockMovementX && theVisualValue.lockMovementY) {
                    return;
                } else {

                    theVisualValue.lockMovementX = true;
                    theVisualValue.lockMovementY = true;
                    blink(theVisualValue, true, 0.45);

                    var newConnector = new Connector({value: theVisualValue.value, source: theVisualValue, x2: theVisualValue.left, y2: theVisualValue.top, arrowColor: theVisualValue.colorForStroke, filledArrow: true, strokeWidth: 1});

                    theVisualValue.outConnectors.push(newConnector);
                    canvas.add(newConnector);

                }



            },
            'mousedown': function (option) {
                var theVisualValue = this;

                // if the visual value belongs to a collection that is not contained by a mapper, then, a new connection should be created when the mouse is down
                if (theVisualValue.collection && !theVisualValue.collection.mapper && theVisualValue.lockMovementX && theVisualValue.lockMovementY) {
                    var newConnector = new Connector({value: theVisualValue.value, source: theVisualValue, x2: theVisualValue.left, y2: theVisualValue.top, arrowColor: theVisualValue.colorForStroke, filledArrow: true, strokeWidth: 1});
                    theVisualValue.outConnectors.push(newConnector);
                    canvas.add(newConnector);
                } else {
                    bringToFront(theVisualValue);
                }

            },
            'inConnectionRemoved': standarInConnectionRemovedHandler,
            'outConnectionRemoved': standarOutConnectionRemovedHandler,
            'newInConnection': function (options) {

                if (this.isRangeLimit) {
                    this.newInConnection(options);

                } else {

                    if (LOG) {
                        console.log("%cnewInConnection function DATATYPE class. options:", "background: #DAA520; color: black;");
                        console.log(options);
                    }

                    var theVisualValue = this;

                    var newInConnection = options.newInConnection;
                    var shouldAnimate = options.shouldAnimate;
                    var doNotBlink = options.doNotBlink;

                    var targetAttribute = newInConnection.destination.attribute;
                    var incommingValue = newInConnection.value;

                    if (!incommingValue[theVisualValue.dataTypeProposition]) {

                        var convertedValue = incommingValue.convert(theVisualValue.dataTypeProposition);
                        if (convertedValue) {
                            incommingValue = convertedValue;
                        } else {
                            alertify.error("Values types not compatible", "", 2000);
                            newInConnection.contract();
                            return;
                        }
                    }



                    if (this.setValue(incommingValue, doNotBlink)) {

                        if (LOG)
                            console.log("5555555555555555555555555555555555555");

                        if (theVisualValue.inConnectors.length > 0) {
                            var connector = theVisualValue.inConnectors.pop();
                            connector.contract();
                        }

                        theVisualValue.inConnectors.push(newInConnection);

                        if (!doNotBlink) {
                            blink(theVisualValue, true, 0.45);
                        }

//                    theVisualValue.outConnectors.forEach(function (outConnector) {
//                        outConnector.setValue(incommingValue, false, shouldAnimate);
//                    });

                        // Every time a value is set here, we also have to update the values of the outgoing connections
                        theVisualValue.outConnectors.forEach(function (outConnector) {

                            if (LOG)
                                console.log("The value that will be communicated to the connectors' destinations:");
                            if (LOG)
                                console.log(theVisualValue.value);

                            outConnector.setValue(theVisualValue.value.clone(), false, shouldAnimate);
                        });

                        if (LOG)
                            console.log("-----------------------------------------------------------------------");

                        if (theVisualValue.collection) {
                            var options = {
                                visualValue: theVisualValue
                            };
                            theVisualValue.collection.trigger('valueChanged', options);
                        }




                    } else {

                        alertify.error("Error when trying to set the new value!", "", 2000);
                        newInConnection.contract();
                        return;

                    }



                }





            },
//            'inValueUpdated': function (options) {
//
//                var theVisualValue = this;
//
//                var inConnection = options.inConnection;
//                var markAsSelected = options.markAsSelected;
//                var shouldAnimate = options.shouldAnimate;
//
//                var originAttribute = inConnection.source.type;
//                var targetAttribute = inConnection.destination.type;
//
//                var updatedValue = inConnection.value;
//
//                if ($.isArray(updatedValue)) {
//
//                    blink(theVisualValue, true, 0.45);
//
//                    inConnection.contract();
//                    return;
//
//                }
//
//                if (LOG)
//                    console.log("%c inValueUpdated DATATYPE shouldAnimate: " + shouldAnimate, "background: black; color: pink;");
//
//                var refreshCanvas = !shouldAnimate;
//
//                theVisualValue.setValue(inConnection.value, refreshCanvas, shouldAnimate);
//
//
//
//            }

        });
    };



    this.inValueUpdated = function (options) {



        var theVisualValue = this;

        var inConnection = options.inConnection;
        var markAsSelected = options.markAsSelected;
        var shouldAnimate = options.shouldAnimate;

//        console.log("%c inValueUpdated function DATATYPE class shouldAnimate: " + shouldAnimate, "background: #8B0000; color: white");

        var updatedValue = inConnection.value;

        if ($.isArray(updatedValue)) {

            blink(theVisualValue, true, 0.45);

            inConnection.contract();
            return;

        }

        if (LOG)
            console.log("%c inValueUpdated DATATYPE shouldAnimate: " + shouldAnimate, "background: black; color: pink;");

        var refreshCanvas = false;

        theVisualValue.setValue(inConnection.value, refreshCanvas, shouldAnimate);

    }


    return this;
};



function CreateVisualValue(options) {

    if (options.theType === "number") {
        return new NumericData(options);
    } else if (options.theType === "string") {
        return new StringData(options);
    } else if (options.theType === "dateAndTime") {
        return new DateAndTimeData(options);
    } else if (options.theType === "duration") {
        return new DurationData(options);
    } else if (options.theType === "color") {
        return new ColorData(options);
    } else if (options.theType === "shape") {
        return new ShapeData(options);
    }


}


function CreateVisualValueFromValue(value) {

    if (value.isNumericData) {

        /*console.log("--------------- ************************* value:");
         console.log(value);*/

        var options = {unscaledValue: value.unscaledValue, inPrefix: value.inPrefix, outPrefix: value.outPrefix, units: value.units};
        return new NumericData(options);

    } else if (value.isStringData) {

        var options = {string: value.string};
        return new StringData(options);

    } else if (value.isDateAndTimeData) {

        var options = {theMoment: value.moment};
        return new DateAndTimeData(options);

    } else if (value.isDurationData) {

        var options = {theDuration: value.duration, outputUnits: value.outputUnits};
        return new DurationData(options);

    } else if (value.isColorData) {

        var options = {theColor: value.color};
        return new ColorData(options);

    } else if (value.isShapeData) {

        var options = {theShape: value.shape};

        var shape = value.shape;
        var attribute = null;
        if (shape === PATH_MARK || shape === FILLEDPATH_MARK) {
            attribute = 'path';
        } else {
            attribute = 'svgPathGroupMark';
        }
        options[attribute] = value[attribute];

        return new ShapeData(options);

    } else {

        return null;

    }
}

function createDefaultVisualValueByTypeProposition(dataTypeProposition, x, y) {

    var options = {left: x, top: y};

    if (dataTypeProposition === "isColorData") {

        options.theType = "color";

    } else if (dataTypeProposition === "isStringData") {

        options.theType = "string";
        options.string = 'Some text';

    } else if (dataTypeProposition === "isNumericData") {

        options.theType = "number";
//        options.unscaledValue = 100;
        options.unscaledValue = 360;

    } else if (dataTypeProposition === "isDurationData") {

        options.theType = "duration";

    } else if (dataTypeProposition === "isDateAndTimeData") {

        options.theType = "dateAndTime";

    } else if (dataTypeProposition === "isShapeData") {

        options.theType = "shape";

    }

    return CreateVisualValue(options);


}



function addVisualVariableToCollection(visualValue, collection, connector, useTheGivenVisualValue, canvasCoords) {



    var value = visualValue.value;

    if (collection.isValueAllowed(value)) {

        var newVisualValue = visualValue;

        if (!useTheGivenVisualValue) {
            newVisualValue = CreateVisualValueFromValue(value);
        }

        if (collection.isCompressed) {
            var collectionCenter = collection.getPointByOrigin('center', 'center');
            newVisualValue.top = collectionCenter.y;
            newVisualValue.left = collectionCenter.x;
        } else if (canvasCoords) {
            newVisualValue.top = canvasCoords.y;
            newVisualValue.left = canvasCoords.x;
        }

        console.log("newVisualValue:");
        console.log(newVisualValue);

        if (connector) {
            connector.setDestination(newVisualValue, true, true);
        }

        collection.addVisualValue(newVisualValue);


    } else {

        alertify.error("The collection does not allow this type of values", "", 2000);
        if (connector) {
            connector.contract();
        }

    }

}

function addVisualValueToCanvas(options) {

    print("addVisualValueToCanvas FUNCTION", "#a73746", "white");

    print("options:", "#a73746", "white");
    console.log(options);

    if (options.svgPathGroupMark) {

        console.log("options.svgPathGroupMark:");
        console.log(options.svgPathGroupMark);

        var SVGString = options.svgPathGroupMark;







        fabric.loadSVGFromString(SVGString, function (objects, options2) {

            /*var obj = fabric.util.groupSVGElements(objects, options2);
             
             options.svgPathGroupMark = obj;
             
             console.log(options.svgPathGroupMark);
             
             options = $.extend(true, {}, options, options2);
             
             var visualValue = CreateVisualValue(options);
             canvas.add(visualValue);
             
             console.log("visualValue:");
             console.log(visualValue);
             
             visualValue.animateBirth(false, null, null, false);*/

            options.thePaths = objects;
            options.shape = CIRCULAR_MARK;


            options = $.extend(true, {}, options, options2);

            var svgPathGroupMark = new SVGPathGroupMark(objects, options);

            var shapeValue = createShapeValue(SVGPATHGROUP_MARK, svgPathGroupMark);

            var visualValue = new ShapeData(options);

            visualValue.setValue(shapeValue, true);

            visualValue.value.SVGString = SVGString;

            canvas.add(visualValue);

            console.log("visualValue:");
            console.log(visualValue);

            visualValue.animateBirth(false, null, null, false);


        });


    } else {

        var visualValue = CreateVisualValue(options);
        canvas.add(visualValue);

        console.log("visualValue:");
        console.log(visualValue);

        visualValue.animateBirth(false, null, null, false);

    }


}

function createVisualVariableFromXMLNode(visualValueXmlNode) {

    var options = {
        xmlID: visualValueXmlNode.attr('xmlID'),
    };

    var children = visualValueXmlNode.children();
    children.each(function () {
        var child = $(this);
        var tagName = this.tagName;

        if (tagName === "value") {

            options.value = createValueFromXMLNode(child);

        } else {

            var value = child.text();
            var type = child.attr('type');

            if (type === "number") {
                value = Number(value);
            } else if (type === "boolean") {
                value = value === "true";
            }

            options[tagName] = value;

        }

    });

    console.log("options to create a new DATATYPE from an XML node");
    console.log(options);

    var visualValue = CreateVisualValueFromValue(options.value);
    visualValue.xmlID = options.xmlID;
    visualValue.top = options.top;
    visualValue.left = options.left;
    addToConnectableElements(visualValue);

    canvas.add(visualValue);
    visualValue.animateBirth(false, null, null, true);

    visualValue.executePendingConnections();

    return visualValue;
}