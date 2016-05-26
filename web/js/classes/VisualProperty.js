// The Output mixing defines all the common properties and behaviours that outputs share
var VisualProperty = function () {

    this.set('iVoLVERClass', 'visualProperty');

    this.set('nonSerializable', true);
    this.set('nonRemovable', true);

    this.set('visualProperty', true);
    this.set('isVisualProperty', true);
    this.set('originX', 'center');
    this.set('originY', 'center');
    this.set('transparentCorners', false);
    this.set('perPixelTargetFind', false);
    this.set('lockMovementX', true);
    this.set('lockMovementY', true);
    this.set('lockRotation', true);
    this.set('lockScalingX', true);
    this.set('lockScalingY', true);


    this.set('hasBorders', false);
    this.set('hasControls', false);
    this.set('hasRotatingPoint', false);

    this.addToGroup = function (theGroup) {
        var theVisualProperty = this;
        var parentObject = theVisualProperty.parentObject;
        if (parentObject.addToGroup) {
            parentObject.addToGroup(theGroup); // this will add the visual property to the given group
        }
    };

    this.disconnect = function (refreshCanvas, removeAfterDisconnection) {
        var theVisualProperty = this;
        theVisualProperty.inConnectors.forEach(function (inConnection) {
            inConnection.contract(false, false, true);
        });
        theVisualProperty.outConnectors.forEach(function (outConnection) {
            outConnection.contract(true, false, true);
        });
        var waitingTime = 50;
        if (refreshCanvas) {
            var duration = 600;
            waitingTime += duration;
            fabric.util.animate({
                duration: duration,
                onChange: canvas.renderAll.bind(canvas),
                onComplete: function () {
                    canvas.renderAll();
                }
            });
        }
        if (removeAfterDisconnection) {
            setTimeout(function () {
                if (theVisualProperty && theVisualProperty.canvas) {
//                    theVisualProperty.remove();
                    canvas.remove(theVisualProperty);
                }

            }, waitingTime);
        }

    };

    this.toXML = function () {

        var theVisualProperty = this;

        var propertyNode = createXMLElement("property");
        addAttributeWithValue(propertyNode, "xmlID", theVisualProperty.xmlID);
        addAttributeWithValue(propertyNode, "attribute", theVisualProperty.attribute);

        var value = this.value;
        if (value) {
            if ($.isArray(this.value)) {

                console.log("**************************************************************", "background: red; color: white;");
                console.log("***************************** Alert!!!!! Saving an ARRAY value", "background: red; color: white;");
                console.log("**************************************************************", "background: red; color: white;");

//                var arrayNode = createXMLElement("array"); // TODO: It would be better if the created node is still a value one, but with type array
                var arrayNode = createXMLElement("value"); // TODO: It would be better if the created node is still a value one, but with type array
                addAttributeWithValue(arrayNode, "type", "array");

                theVisualProperty.value.forEach(function (value) {
                    var valueNode = value.toXML();
                    arrayNode.append(valueNode);
                });
                propertyNode.append(arrayNode);
            } else {
                var valueNode = theVisualProperty.value.toXML();
                propertyNode.append(valueNode);
            }
        }
        return propertyNode;
    };

    this.setValue = function (value, renderCanvas, shouldAnimate) {

        if (LOG) {
            console.log("renderCanvas in setValue function of Visual Property:");
            console.log(renderCanvas);
        }



        var theVisualProperty = this;



        // trying to preserve the units of numeric values (TODO: durations)
        /*if (value.isNumericData) {
         value = createNumericValue(value.number, value.inPrefix, theVisualProperty.value.outPrefix, theVisualProperty.value.units);
         }*/

        theVisualProperty.value = value;

        var parentObject = theVisualProperty.parentObject;
        if (parentObject && (parentObject.isMark || parentObject.isExtractor || parentObject.isNumericCollectionGenerator)) {

            parentObject.setProperty(theVisualProperty.attribute, value, theVisualProperty, shouldAnimate);

            if (renderCanvas) {
                canvas.renderAll();
            }



            // TODO: At the moment, the setProperty methods of both Marks and Extractors is responsible to inform the outgoing connections about the new value
            // this should be modified eventually (with the code written bellow), as the setProperty methods should only set the property and NOT
            // deal with the other elements of the interface. As in the VisualValue class, this should be done only if the setProperty vas successful (i.e. it returned true)
            // This function should also inform the outgoing connectors about the changed value
            theVisualProperty.outConnectors.forEach(function (outConnector) {
                if (LOG)
                    console.log("The value that will be communicated to the connectors' destinations NNN:");
                if (LOG)
                    console.log(theVisualProperty.value);
                outConnector.setValue(theVisualProperty.value.clone(), false, shouldAnimate);
            });


        } else if (parentObject && parentObject.isLocator) {

            //the mark should be repositioned
            parentObject.positionChild(theVisualProperty.attribute, value, theVisualProperty.mark, shouldAnimate);

            theVisualProperty.outConnectors.forEach(function (outConnector) {
                if (LOG) {
                    console.log("The value that will be communicated to the connectors' destinations NNN:");
                    console.log(theVisualProperty.value);
                }
                outConnector.setValue(theVisualProperty.value.clone(), false, shouldAnimate);
            });
        }



    };

    this.createValue = function () {

        var theVisualProperty = this;

        if (theVisualProperty.attribute === "fill") {
            return new Value({isColorData: true, color: new fabric.Color(theVisualProperty.fill)});

        } else {

            var theValue = this.parentObject.get("the_" + this.attribute) || this.parentObject.get(this.attribute);

            if (theVisualProperty.attribute === "colorValues") {

                var fabricColors = new Array();
                var samplerExtractor = theVisualProperty.parentObject;
                samplerExtractor.colorValues.forEach(function (color) {
                    if (LOG)
                        console.log("color:");
                    if (LOG)
                        console.log(color);
                    fabricColors.push(createColorValue(new fabric.Color(color)));
                });

                if (LOG)
                    console.log("fabricColors:");
                if (LOG)
                    console.log(fabricColors);

                return fabricColors;

            } else if (theVisualProperty.attribute === "label") {

                return createStringValue(theValue);

            } else if (theVisualProperty.attribute === "shape") {

                return createShapeValue(theValue, theValue.path);

            } else {

                var units = 'pixels';
                if (this.attribute === 'angle') {
                    units = 'degrees';
                }

                return createNumericValue(Number(theValue), '', '', units);

            }

        }







    };

    this.createVisualVisualValue = function () {

        var theVisualProperty = this;
        var options = null;

        if (LOG)
            console.log("..................................... theVisualProperty.value");
        if (LOG)
            console.log(theVisualProperty.value);

        if (theVisualProperty.isColorData) {
            options = {
                theType: "color",
                theColor: theVisualProperty.fill
            };

        } else if (theVisualProperty.isStringData) {

            options = {
                theType: "string",
                string: theVisualProperty.value,
            };

        } else if (theVisualProperty.isNumericData) {

            var units = 'pixels';
            if (this.attribute === 'angle') {
                units = 'degrees';
            }

            if (LOG)
                console.log("theVisualProperty.value:");
            if (LOG)
                console.log(theVisualProperty.value);

            options = {
                theType: "number",
                unscaledValue: theVisualProperty.value.unscaledValue,
            };

        } else if (theVisualProperty.isShapeData) {

            options = {
                theType: "shape",
                unscaledValue: theVisualProperty.value,
                outputScaledValue: false,
                convertToSelectedUnits: true
            };

        }

        var dataType = new CreateVisualValue(options);
        return dataType;

    };

    this.applySelectedStyle = function (selectConnectors) {
        this.selected = true;
        this.parentObject.applySelectedStyle();
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
        if (this.parentObject && this.parentObject.isMark) {
            this.parentObject.applyUnselectedStyle(false);
        }
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
    this.blink = function () {
        var theOutput = this;
        var duration = 400;
        var easing = fabric.util.ease['easeOutQuint'];
        var finalScale = 1.3;
        theOutput.animate('scaleX', finalScale, {
            duration: duration,
            easing: easing,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: function () {
                theOutput.animate('scaleX', 1, {
                    duration: 1100,
                    onChange: canvas.renderAll.bind(canvas),
                    easing: fabric.util.ease['easeOutElastic']
                });
            }
        });
        theOutput.animate('scaleY', finalScale, {
            duration: duration,
            onChange: canvas.renderAll.bind(canvas),
            easing: easing,
            onComplete: function () {
                theOutput.animate('scaleY', 1, {
                    duration: 1100,
                    onChange: canvas.renderAll.bind(canvas),
                    easing: fabric.util.ease['easeOutElastic']
                });
            }
        });
    };


    this.associateEvents = function () {
        var theVisualProperty = this;
        this.on({
            'doubleTap': function (options) {

                if (theVisualProperty.parentObject && theVisualProperty.parentObject.isSVGPathExtractor) {
                    return;
                }

                //TODO: IMPORTANT: Instead of checking the name of the property here, it should be cheked the type of their values

                if (theVisualProperty.attribute === "fill") {

                    showColorChooser(theVisualProperty);

                } else if (theVisualProperty.attribute === "label") {

//                    showLabelModifier(theVisualProperty);

                    showStringValue(theVisualProperty, true);

                } else if (theVisualProperty.attribute === "shape") {

                    showShapeSelector(theVisualProperty);

                } else if (!$.isArray(theVisualProperty.value)) {

                    showNumericValue(theVisualProperty, true);

                }




            },
            'moving': function (options) {

                if (!theVisualProperty.readable) {
                    return;
                }

                var theEvent = options.e;

                if (theEvent) {
                    var canvasCoords = getCanvasCoordinates(theEvent);
                    var lastAddedConnector = getLastElementOfArray(this.outConnectors);
                    lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                }

            },
            'modified': function (option) {
                if (LOG)
                    console.log("Operator being modified");
            },
            'selected': function (option) {
                if (LOG)
                    console.log("Operator selected");
            },
            'mouseup': function (option) {

                if (LOG)
                    console.log("Mouse UP over a Visual Property");

                var theEvent = option.e;
                var canvasCoords = getCanvasCoordinates(theEvent);

                var coordX = canvasCoords.x;
                var coordY = canvasCoords.y;

                var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isRangeLimit', 'isOperator', 'isFunctionInput', 'isAggregator', 'isMark', 'isPlayer', 'isVisualValue', 'isVerticalCollection', 'isMapperInput', 'isMapperOutput', 'isFunctionValuesCollection']);

                if (LOG)
                    console.log(targetObject);
                if (LOG)
                    console.log(this);

                if (targetObject) {

                    if (targetObject !== this) {

                        if (targetObject.isRangeLimit || targetObject.isOperator || targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isFunctionValuesCollection || targetObject.isMapperInput || targetObject.isMapperOutput) {

                            var connector = getLastElementOfArray(this.outConnectors);

                            connector.setDestination(targetObject, true);

                            if (!targetObject.isVerticalCollection) {

                                setTimeout(function () {
//                                    connector.source.bringToFront();
//                                    connector.destination.bringToFront();
                                    bringToFront(connector.source);
                                    bringToFront(connector.destination);
                                }, 50);

                            }



                        } else if (targetObject.isVerticalCollection) {

                            var theValue = theVisualProperty.value;
                            var connector = getLastElementOfArray(this.outConnectors);

                            // First, we have to check if this is a collection
                            if ($.isArray(theValue)) {

                                connector.setDestination(targetObject, true);

                            } else {

                                addVisualVariableToCollection(theVisualProperty, targetObject, connector, false, canvasCoords);

                            }




                        } else if (targetObject.isMark) {

                            blink(targetObject, true);

                            if (targetObject !== this.parentObject) {

                                var connector = getLastElementOfArray(this.outConnectors);

                                var theSource = connector.source;
                                var theDestination = connector.destination;

                                var attribute = theSource.attribute;
                                if (attribute === "text") {
                                    attribute = "label";
                                }

                                if (targetObject.isEllipticMark) {

                                    if (attribute === "width") {
                                        attribute = "rx";
//                                        connector.value = connector.value / 2;
                                    } else if (attribute === "height") {
                                        attribute = "ry";
//                                        connector.value = connector.value / 2;
                                    }

                                }

                                var visualProperty = targetObject.getVisualPropertyByAttributeName(attribute);

                                if (visualProperty) {

                                    connector.setDestination(visualProperty, true);

                                    setTimeout(function () {

                                        if (theSource) {
//                                            theSource.bringToFront();
                                            bringToFront(theSource);
                                        }
                                        if (theDestination) {
//                                            theDestination.bringToFront();
                                            bringToFront(theDestination);
                                        }
                                    }, 50);

                                } else {

                                    var connector = this.outConnectors.pop();
                                    if (connector) {
                                        connector.contract();
                                    }


                                }



                            } else {

                                var connector = this.outConnectors.pop();
                                if (connector) {
                                    connector.remove();
                                }

                            }

                        } else { // This makes no sense, so, the added connector is just removed
                            var connector = this.outConnectors.pop();
                            if (connector) {
                                connector.remove();
                            }

                        }

                    } else {
                        var connector = this.outConnectors.pop();
                        if (connector) {
                            connector.remove();
                        }
                    }

                } else {

                    ////////////////////////////////////////////
                    // Click on a blank section of the canvas //
                    ////////////////////////////////////////////

                    // The mouse up event is done over a blank section of the canvas
                    var lastAddedConnector = getLastElementOfArray(theVisualProperty.outConnectors);
                    newConnectionReleasedOnCanvas(lastAddedConnector, coordX, coordY);

                }

            },
            'mousedown': function (option) {

                if (!theVisualProperty.readable) {
                    return;
                }
//                if (LOG) console.log("Mouse DOWN over an operator ");
//                this.blink();


                if (LOG)
                    console.log(this.attribute);
                if (LOG)
                    console.log(this.parentObject.get(this.attribute));

//                this.set('value', this.parentObject.get("the_" + this.attribute) || this.parentObject.get(this.attribute));

//                var composedValue = {}
//                composedValue[this.dataTypeProposition] = true;
//
//                if (this.attribute == 'fill') {
//                    composedValue.value = new fabric.Color(this.parentObject.get(this.attribute));
//                } else {
//                    composedValue.value = this.parentObject.get("the_" + this.attribute) || this.parentObject.get(this.attribute);
//                }
//
//                this.set('value', composedValue);

//                if (!theVisualProperty.value || theVisualProperty.attribute === "colorValues") {
                if (theVisualProperty.attribute === "colorValues") {

//                    alert("The visual property is going to create its own value");
                    console.log("%c" + "The visual property is going to create its own value!!!", "background: rgb(33,128,213); color: black;");

                    var value = theVisualProperty.createValue();
                    theVisualProperty.set('value', value);

                    if (LOG)
                        console.log("4515451545154515451545***************************************************************************************************************");
                    if (LOG)
                        console.log("value:");
                    if (LOG)
                        console.log(value);

                }

                var newConnector = new Connector({source: this, value: theVisualProperty.value, x2: this.left, y2: this.top, arrowColor: this.parentObject.colorForStroke, filledArrow: true, strokeWidth: 1});

                if (LOG)
                    console.log(newConnector.value);

                this.outConnectors.push(newConnector);
                canvas.add(newConnector);

            },
            'inConnectionRemoved': standarInConnectionRemovedHandler,
            'outConnectionRemoved': standarOutConnectionRemovedHandler,
            'newInConnection': function (options) {

                var newInConnection = options.newInConnection;
                var shouldAnimate = options.shouldAnimate;

                if (!theVisualProperty.writable) {
                    alertify.error("Property not writable", "", 2000);
                    fabric.util.removeFromArray(newInConnection.source.outConnectors, newInConnection);
                    newInConnection.remove();
                    return;
                }

                var targetAttribute = newInConnection.destination.attribute;
                var incommingValue = newInConnection.value;

                if (LOG)
                    console.log("theVisualProperty.dataTypeProposition:");
                if (LOG)
                    console.log(theVisualProperty.dataTypeProposition);

                if (LOG)
                    console.log("incommingValue:");
                if (LOG)
                    console.log(incommingValue);

                if (LOG)
                    console.log("incommingVisualValue[theVisualProperty.dataTypeProposition]:");
                if (LOG)
                    console.log(incommingValue[theVisualProperty.dataTypeProposition]);


                if ($.isArray(incommingValue)) {
                    if (theVisualProperty.canHandleArrays) {

                    } else {
                        alertify.error("This visual property can not handle collections of values", "", 2000);
                        newInConnection.contract();
                        return;
                    }

                } else {

                    if (!incommingValue[theVisualProperty.dataTypeProposition]) {

                        if (LOG)
                            console.log("theVisualProperty.dataTypeProposition:");
                        if (LOG)
                            console.log(theVisualProperty.dataTypeProposition);

                        if (LOG)
                            console.log("incommingValue[theVisualProperty.dataTypeProposition]:");
                        if (LOG)
                            console.log(incommingValue[theVisualProperty.dataTypeProposition]);

                        var convertedValue = incommingValue.convert(theVisualProperty.dataTypeProposition);
                        if (convertedValue) {
                            incommingValue = convertedValue;
                        } else {
                            alertify.error("Types not compatible", "", 2000);
                            newInConnection.contract();
                            return;
                        }
                    }

                }








                if (theVisualProperty.inConnectors.length > 0) {
                    var connector = theVisualProperty.inConnectors.pop();
                    connector.contract();
                }


//            if (LOG) console.log(originAttribute);
//            if (LOG) console.log(newInConnection.source);
//            if (LOG) console.log(newInConnection.source.get(originAttribute));

                var newValue = null;


                if ((theVisualProperty.attribute == "x" || theVisualProperty.attribute == "y") && theVisualProperty.mark && theVisualProperty.mark.parentObject && theVisualProperty.mark.parentObject.isLocator) {

                    if (LOG) {
                        console.log("theVisualProperty.mark:");
                        console.log(theVisualProperty.mark);
                    }

                    newValue = theVisualProperty.mark.parentObject.positionChild(targetAttribute, incommingValue, theVisualProperty.mark, shouldAnimate);

                } else {

                    if (LOG)
                        console.log("theVisualProperty");
                    if (LOG)
                        console.log(theVisualProperty);

                    newValue = theVisualProperty.parentObject.setProperty(targetAttribute, incommingValue, newInConnection.source, shouldAnimate);

                }

                if (newValue) {
                    incommingValue = createNumericValue(newValue);
                }

                theVisualProperty.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(incommingValue, false, shouldAnimate);
                });

                this.inConnectors.push(newInConnection);

                this.blink();

                newInConnection.destination.set('value', incommingValue);
            },
        });
    };


    this.inValueUpdated = function (options) {

        var theVisualProperty = this;

        if (LOG)
            console.log("887878787878787878787878787");

        var inConnection = options.inConnection;
        var markAsSelected = options.markAsSelected;
        var shouldAnimate = options.shouldAnimate;

        var originAttribute = inConnection.source.attribute;
        var targetAttribute = inConnection.destination.attribute;

        var updatedValue = inConnection.value;

        if (!updatedValue[theVisualProperty.dataTypeProposition]) {
            var convertedValue = updatedValue.convert(theVisualProperty.dataTypeProposition);
            if (convertedValue) {
                updatedValue = convertedValue;
            } else {
                alertify.error("Types not compatible", "", 2000);
                inConnection.contract();
                return;
            }
        }

        var newValue = null;


        if ((theVisualProperty.attribute == "x" || theVisualProperty.attribute == "y") && theVisualProperty.mark && theVisualProperty.mark.parentObject && theVisualProperty.mark.parentObject.isLocator) {

            if (LOG)
                console.log("theVisualProperty.mark:");
            if (LOG)
                console.log(theVisualProperty.mark);

            newValue = theVisualProperty.mark.parentObject.positionChild(targetAttribute, updatedValue, theVisualProperty.mark, shouldAnimate);

        } else {

            if (LOG)
                console.log("theVisualProperty");
            if (LOG)
                console.log(theVisualProperty);

            newValue = theVisualProperty.parentObject.setProperty(targetAttribute, updatedValue, inConnection.source, shouldAnimate);

        }

        if (newValue) {
            updatedValue = createNumericValue(newValue);
        }

        theVisualProperty.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(updatedValue, false, shouldAnimate);
        });

        // DO NOT ADD, as this is a connection that already exists
//                this.inConnectors.push(inConnection);

        inConnection.destination.set('value', updatedValue);

    };

    this._render = function (ctx) {

        // Since the path can have 'holes', we paint the background in white to avoid that what is behind the VisualProperty representation becomes visible
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'white';

        if (this.readable && this.writable) {
            ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
        } else if (this.readable && !this.writable) {
            ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        ctx.fill();
        ctx.closePath();
        ctx.restore();

        ctx.save();
        this.callSuper('_render', ctx);
        ctx.restore();

        if (this.selected) {

            if (this.isCollection) { // When this is a collective visual property

                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = this.fill;
                ctx.lineWidth = widget_selected_stroke_width - 1;

                ctx.arc(0, 0, this.width / 2 - widget_selected_stroke_width / 2 + 1.5, -Math.PI, 0);
                ctx.lineTo(this.width / 2 - widget_selected_stroke_width / 2 + 1.5, this.width / 2 - widget_selected_stroke_width / 2 + 1.5);
                ctx.lineTo(-(this.width / 2 - widget_selected_stroke_width / 2 + 1.5), this.width / 2 - widget_selected_stroke_width / 2 + 1.5);
                ctx.lineTo(-(this.width / 2 - widget_selected_stroke_width / 2 + 1.5), 0);

                ctx.stroke();
                ctx.closePath();
                ctx.restore();

                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = widget_selected_stroke_width / 2;

                ctx.arc(0, 0, this.width / 2 + widget_selected_stroke_width / 4 + 1, -Math.PI, 0);
                ctx.lineTo(this.width / 2 + widget_selected_stroke_width / 4, this.width / 2 + widget_selected_stroke_width / 4 + 1);
                ctx.lineTo(-(this.width / 2 + widget_selected_stroke_width / 4), this.width / 2 + widget_selected_stroke_width / 4 + 1);
                ctx.lineTo(-(this.width / 2 + widget_selected_stroke_width / 4), 0);

                ctx.stroke();
                ctx.closePath();
                ctx.restore();

                ctx.save();
                ctx.beginPath();
                ctx.setLineDash([7, 7]);
                ctx.strokeStyle = widget_selected_stroke_color;
                ctx.lineWidth = widget_selected_stroke_width;

                ctx.arc(0, 0, this.width / 2 + 1, -Math.PI, 0);
                ctx.lineTo(this.width / 2 + 1, this.width / 2 + 1);
                ctx.lineTo(-(this.width / 2 + 1), this.width / 2 + 1);
                ctx.lineTo(-(this.width / 2 + 1), 0);

                ctx.stroke();
                ctx.closePath();
                ctx.restore();

            } else {

                if (this.readable && this.writable) {

                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = this.fill;
                    ctx.lineWidth = widget_selected_stroke_width - 1;
                    ctx.arc(0, 0, this.width / 2 - widget_selected_stroke_width / 2 + 1, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();

                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = widget_selected_stroke_width / 2;
                    ctx.arc(0, 0, this.width / 2 + widget_selected_stroke_width / 4, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();

                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash([7, 7]);
                    ctx.strokeStyle = widget_selected_stroke_color;
                    ctx.lineWidth = widget_selected_stroke_width;
                    ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();

                } else {
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = this.fill;
                    ctx.lineWidth = widget_selected_stroke_width - 0.9;
                    ctx.rect(-this.width / 2, -this.height / 2, 2 * (this.width / 2 + widget_selected_stroke_width / 4) - widget_selected_stroke_width / 2, 2 * (this.height / 2 + widget_selected_stroke_width / 4) - widget_selected_stroke_width / 2);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();

                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = widget_selected_stroke_width / 2;
                    ctx.rect(-this.width / 2 - widget_selected_stroke_width / 4, -this.height / 2 - widget_selected_stroke_width / 4, 2 * (this.width / 2 + widget_selected_stroke_width / 4), 2 * (this.height / 2 + widget_selected_stroke_width / 4));
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();

                    ctx.save();
                    ctx.beginPath();
                    ctx.setLineDash([7, 7]);
                    ctx.strokeStyle = widget_selected_stroke_color;
                    ctx.lineWidth = widget_selected_stroke_width;
                    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.restore();
                }
            }
        }

    };


    return this;
};


var ReadableVisualProperty = fabric.util.createClass(fabric.Path, {
    type: 'readableVisualProperty',
    initialize: function (options) {
        options || (options = {});
        var path = 'M 0 0 L ' + 25 + ' ' + (-1.8 * 25) + ' L  ' + (2 * 25) + ' ' + 0 + ' z';
        if (paths[options.attribute] && paths[options.attribute].r) {
            path = paths[options.attribute].r;
        }
        this.callSuper('initialize', path, options);
        this.set('attribute', options.attribute);
        this.set('types', options.types);
        this.set('updatesTo', options.updatesTo);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', this.strokeWidth);
        this.set('parentObject', options.parentObject);

        this[options.dataTypeProposition] = true;

        this.set('stroke', options.parentObject.visualPropertyStroke || options.parentObject.colorForStroke);
        this.set('fill', options.parentObject.visualPropertyFill || options.parentObject.fill);
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('readable', true);
        this.set('writable', false);
        this.associateEvents();
        this.originX = 'center';
        this.originY = 'center';
        this.set({left: options.left, top: options.top});
        this.setCoords();

    },
});
VisualProperty.call(ReadableVisualProperty.prototype);


var WritableVisualProperty = fabric.util.createClass(fabric.Path, {
    type: 'readableVisualProperty',
    initialize: function (options) {
        options || (options = {});
//        this.callSuper('initialize', 'M 0 0 L ' + 25 + ' ' + (-1.8*25) + ' L  ' + (2*25) + ' ' + 0 + ' z', options);
        var path = 'M 0 0 L ' + 25 + ' ' + (-1.8 * 25) + ' L  ' + (2 * 25) + ' ' + 0 + ' z';
        if (paths[options.attribute] && paths[options.attribute].w) {
            path = paths[options.attribute].w;
        }
        this.callSuper('initialize', path, options);
        this.set('attribute', options.attribute);
        this.set('types', options.types);
        this.set('updatesTo', options.updatesTo);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', this.strokeWidth);
        this.set('parentObject', options.parentObject);

        this[options.dataTypeProposition] = true;

        this.set('stroke', options.parentObject.visualPropertyStroke || options.parentObject.colorForStroke);
        this.set('fill', options.parentObject.visualPropertyFill || options.parentObject.fill);
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('readable', false);
        this.set('writable', true);
        this.associateEvents();
        this.originX = 'center';
        this.originY = 'center';
        this.set({left: options.left, top: options.top});
    },
});
VisualProperty.call(WritableVisualProperty.prototype);


var ReadableAndWritableVisualProperty = fabric.util.createClass(fabric.Path, {
    type: 'readableAndWritableVisualProperty',
    initialize: function (options) {
        options || (options = {});
        var path = path = 'M 0 0 L ' + 25 + ' ' + (-1.8 * 25) + ' L  ' + (2 * 25) + ' ' + 0 + ' z';
        if (paths[options.attribute] && paths[options.attribute].rw) {
            path = paths[options.attribute].rw;
        }
        this.callSuper('initialize', path, options);
        this.set('attribute', options.attribute);
        this.set('types', options.types);
        this.set('updatesTo', options.updatesTo);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', this.strokeWidth);
        this.set('parentObject', options.parentObject);

        this[options.dataTypeProposition] = true;

//        this.set('fill', options.fill || options.parentObject.fill || options.parentObject.visualPropertyFill);
        this.set('fill', options.parentObject.visualPropertyFill || options.parentObject.fill || options.fill);

        this.set('stroke', options.visualPropertyStroke || options.parentObject.visualPropertyStroke || options.parentObject.colorForStroke);
        this.set('colorForStroke', options.visualPropertyStroke || options.parentObject.visualPropertyStroke || options.parentObject.colorForStroke);

        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('readable', true);
        this.set('writable', true);
        this.associateEvents();

        this.set('originX', 'center');
        this.set('originY', 'center');


        this.set({left: options.left, top: options.top});
        this.setCoords();

    },
});
VisualProperty.call(ReadableAndWritableVisualProperty.prototype);






function CreateVisualProperty(options, parentObject, x, y) {
    if (options.readable && options.writable) {
        return new ReadableAndWritableVisualProperty({value: options.value, attribute: options.attribute, updatesTo: options.updatesTo, types: options.types, parentObject: parentObject, left: x, top: y, dataTypeProposition: options.dataTypeProposition});
    } else if (options.readable) {
        return new ReadableVisualProperty({value: options.value, attribute: options.attribute, updatesTo: options.updatesTo, types: options.types, parentObject: parentObject, left: x, top: y, dataTypeProposition: options.dataTypeProposition});
    } else {
        return new WritableVisualProperty({value: options.value, attribute: options.attribute, updatesTo: options.updatesTo, types: options.types, parentObject: parentObject, left: x, top: y, dataTypeProposition: options.dataTypeProposition});
    }
}





function showShapeSelector(theVisualProperty) {

    var theMark = theVisualProperty.parentObject;

    var svgFileReadFunction = function (event, file) {

        var SVGString = event.target.result;

        fabric.loadSVGFromString(SVGString, function (objects, options) {

            var canvasCenter = canvas.getCenter();

            var defaultOptions = {
                label: file.name,
                markAsSelected: true,
                thePaths: objects,
                left: canvasCenter.left,
                top: canvasCenter.top,
                animateAtBirth: false,
                unlabeled: true,
            };

            options = $.extend(true, {}, defaultOptions, options);

            var svgPathGroupMark = new SVGPathGroupMark(objects, options);

            theVisualProperty.inConnectors.forEach(function (inConnector) {
                inConnector.contract();
            });

//            var shapeValue = {isShapeData: true, value: SVGPATHGROUP_MARK, svgPathGroupMark: svgPathGroupMark};
            var shapeValue = new Value({isShapeData: true, shape: SVGPATHGROUP_MARK, svgPathGroupMark: svgPathGroupMark});

            theMark.setProperty('shape', shapeValue, null, null);

            theVisualProperty.outConnectors.forEach(function (outConnector) {
                outConnector.setValue(shapeValue, false, false);
            });


        });

    };

    var mainDiv = $('<div/>', {class: 'icon-large'});

    if (LOG)
        console.log("%cconfigurator:", "background:red; color:white;");
    if (LOG)
        console.log(mainDiv);

    var padding = (theVisualProperty.width / 4) * canvas.getZoom();

    mainDiv.css('padding-right', padding + 'px');
    mainDiv.css('padding-left', padding + 'px');
//    mainDiv.css('transform', 'scale(' + canvas.getZoom() + ', ' + canvas.getZoom() + '  )');

    document.body.appendChild(mainDiv[0]);

    var outputShapes = {
        'Circle': CIRCULAR_MARK,
        'Square': SQUARED_MARK,
        'Rectangle': RECTANGULAR_MARK,
        'Ellipse': ELLIPTIC_MARK,
        'FatFont': FATFONT_MARK,
        'Path': PATH_MARK,
        'FilledPath': FILLEDPATH_MARK,
        'SVGPathGroup': SVGPATHGROUP_MARK
    };

    var outputShapeSelector = $('<select />', {id: 'outputShapeSelector', style: 'font-size: 18px;'});
//    outputShapeSelector.css('transform', 'scale(' + canvas.getZoom() + ', ' + canvas.getZoom() + '  )');

    for (var val in outputShapes) {
        var currentOption = $('<option />', {value: val, text: outputShapes[val], selected: (val == (theMark.get('shape').shape || theMark.get('shape')))});
        currentOption.appendTo(outputShapeSelector);
    }

    var configurationPanel = $('<div/>', {id: 'theConfigurationPanel'});
//    configurationPanel.css('transform', 'scale(' + canvas.getZoom() + ', ' + canvas.getZoom() + '  )');

    var selectedFileName = null;
    var selectedFile = null;

    var inputField = null;
    var newShapeType = null;


    outputShapeSelector.on('change', function (e) {

        newShapeType = this.value;
        $('#outputShapeSelector').val(newShapeType);

        if (newShapeType === SVGPATHGROUP_MARK) {

            configurationPanel.append('<br /><br />');

            inputField = $('<input />', {type: 'file', id: 'theSVGFileInputID'});

            inputField.change(function (evt) {

                if (LOG)
                    console.log("input:");
                if (LOG)
                    console.log(inputField);

                var filename = $(this).val();
                selectedFileName = filename;

                selectedFile = this.files[0];
                if (LOG)
                    console.log("selectedFile:");
                if (LOG)
                    console.log(selectedFile);
            });

            configurationPanel.append(inputField);
            mainDiv.tooltipster('content', configurationPanel);

            $('#outputShapeSelector').val(newShapeType);

            configurationPanel.show();

        } else {

            if (inputField) {

                inputField.remove();

                configurationPanel.find('br').remove();

                mainDiv.tooltipster('content', configurationPanel);

                inputField = null;

                $('#outputShapeSelector').val(newShapeType);
            }

        }
    });

    configurationPanel.append($('<label/>', {text: "Shape: ", style: "margin-right: 5px; font-size: 18px;"}));
    configurationPanel.append(outputShapeSelector);
    configurationPanel.append($('<span>&nbsp;&nbsp;&nbsp;</span>'));


    var okButton = $('<button/>', {text: "OK", class: "square", style: "width: 75px; margin-right: 3px; border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    okButton.click(function () {

        mainDiv.tooltipster('hide', function () {

            var currentShapeType = theMark.get('shape').shape || theMark.get('shape');

            if (newShapeType) {

                if (newShapeType === SVGPATHGROUP_MARK) {

                    var reader = new FileReader();
                    reader.onload = (function (file) {
                        return function (evt) {
                            svgFileReadFunction(evt, file)
                        };
                    })(selectedFile);
                    if (selectedFile) {
                        reader.readAsText(selectedFile);
                    }


                } else {

                    if (currentShapeType != newShapeType) {

//                        var shapeValue = {isShapeData: true, value: newShapeType};
                        var shapeValue = new Value({isShapeData: true, shape: newShapeType, svgPathGroupMark: null});

                        theVisualProperty.inConnectors.forEach(function (inConnector) {
                            inConnector.contract();
                        });

                        theMark.setProperty('shape', shapeValue, null, null);

                        theVisualProperty.outConnectors.forEach(function (outConnector) {
                            outConnector.setValue(shapeValue, false, false);
                        });

                    }
                }

            } else {

                // This point is reached when an SGV path group is loaded and it will be changed by another one. As there is no "change" in the select element, 
                // the newShapeType variable will be null. However, a file might have been selected by the user, so this should be checked

                if (currentShapeType === SVGPATHGROUP_MARK && selectedFile) {

                    var reader = new FileReader();
                    reader.onload = (function (file) {
                        return function (evt) {
                            svgFileReadFunction(evt, file)
                        };
                    })(selectedFile);
                    if (selectedFile) {
                        reader.readAsText(selectedFile);
                    }

                }

            }

        });
    });
    configurationPanel.append(okButton);

    if (theMark.isSVGPathGroupMark) {

        configurationPanel.append('<br /><br />');

        inputField = $('<input />', {type: 'file', id: 'theSVGFileInputID'});

        inputField.change(function (evt) {

            if (LOG)
                console.log("input:");
            if (LOG)
                console.log(inputField);

            var filename = $(this).val();
            selectedFileName = filename;

            selectedFile = this.files[0];
            if (LOG)
                console.log("selectedFile:");
            if (LOG)
                console.log(selectedFile);
        });

        configurationPanel.append(inputField);

    }



    mainDiv.tooltipster({
        content: configurationPanel,
        animation: 'grow',
        trigger: 'click',
        interactive: true,
        position: 'right',
        multiple: true
    });

    theVisualProperty.configurator = mainDiv;

    // positioning and showing the configurator        
    var centerPoint = theVisualProperty.getPointByOrigin('center', 'center');
    var screenCoords = getScreenCoordinates(centerPoint);
    mainDiv.css('position', 'absolute');
    mainDiv.css('top', screenCoords.y + 'px');
    mainDiv.css('left', screenCoords.x + 'px');
    mainDiv.tooltipster('reposition');
    mainDiv.tooltipster('show');

}

function showColorChooser(holderElement) {

    var selectedColor = null;

    var mainDiv = $('<div/>', {class: 'icon-large'});

    if (LOG)
        console.log("%cconfigurator:", "background:red; color:white;");
    if (LOG)
        console.log(mainDiv);

    var padding = (holderElement.width / 4) * canvas.getZoom();

    mainDiv.css('padding-right', padding + 'px');
    mainDiv.css('padding-left', padding + 'px');

    document.body.appendChild(mainDiv[0]);

    var labelColorValue = $('<label/>', {text: 'Color: ', style: "float: left; margin-right: 5px; font-size: 18px; margin-top: 13px;"});

    var fabricColor = holderElement.value.color;
    
    var hexColor = '#' + fabricColor.toHex();
    var colorRectangle = $('<div />', {id: 'colorRectangle', style: 'float: left; margin-top: 4px; margin-right: 10px; width: 40px; height: 30px; background: ' + hexColor + '; border-color: #000; border-style: solid; border-width: 1px;'});

    var rgbColor = hexToRGB(hexColor);
    var rValue = rgbColor.r;
    var gValue = rgbColor.g;
    var bValue = rgbColor.b;

    var rTextField = $('<input />', {id: 'rTextField', maxlength: 3, type: 'number', style: 'margin-top: 2px; font-size: 18px; width: 55px; margin-right: 10px;', value: rValue});
    var gTextField = $('<input />', {id: 'gTextField', maxlength: 3, type: 'number', style: 'margin-top: 2px; font-size: 18px; width: 55px; margin-right: 10px;', value: gValue});
    var bTextField = $('<input />', {id: 'bTextField', maxlength: 3, type: 'number', style: 'margin-top: 2px; font-size: 18px; width: 55px; margin-right: 5px;', value: bValue});

    var colorCanvasWidth = 360;
    var colorCanvasHeight = 200;

    var colorChooserCanvas = $('<canvas />', {id: 'colorChooserCanvas', style: 'margin-top: -5px; width: ' + colorCanvasWidth + 'px; height: ' + colorCanvasHeight + 'px; background-color: #fff; border-color: #000; border-style: solid; border-width: 1px;'});

    var okButton = $('<button/>', {text: "OK", class: "square", style: "width: 25%; margin-left: 22%; float: left; border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    var cancelButton = $('<button/>', {text: "Cancel", class: "square", style: "width: 25%; float: right; margin-right: 22%; border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    var configurationPanel = $('<div/>', {id: 'theConfigurationPanel'});

    configurationPanel.append(labelColorValue);

    configurationPanel.append(colorRectangle);

    configurationPanel.append($('<label/>', {text: 'R:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
    configurationPanel.append(rTextField);

    configurationPanel.append($('<label/>', {text: 'G:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
    configurationPanel.append(gTextField);

    configurationPanel.append($('<label/>', {text: 'B:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
    configurationPanel.append(bTextField);

    configurationPanel.append($('<br /><br />'));

    configurationPanel.append(colorChooserCanvas);

    configurationPanel.append($('<br />'));

    configurationPanel.append($('<hr />'))

    configurationPanel.append($('<br />'));

    configurationPanel.append(okButton);

    configurationPanel.append(cancelButton);

    okButton.click(function () {
        if (isRGBColor(selectedColor)) {

            var colorValue = new Value({isColorData: true, color: new fabric.Color(selectedColor)});

            if (holderElement.inConnectors.length > 0) {
                var connector = holderElement.inConnectors.pop();
                connector.contract();
            }

            if (holderElement.parentObject && holderElement.parentObject.isMark) {
                holderElement.parentObject.setProperty(holderElement.attribute, colorValue, holderElement, true);
            }


            holderElement.value = colorValue;

            holderElement.outConnectors.forEach(function (outConnector) {
                outConnector.setValue(colorValue, false, true);
            });

            setTimeout(function () {
                canvas.renderAll();
            }, 10);

        }
        mainDiv.tooltipster('hide');
    });

    cancelButton.click(function () {
        mainDiv.tooltipster('hide');
    });

    function textBoxChanged() {
        var red = $('#rTextField').val();
        var green = $('#gTextField').val();
        var blue = $('#bTextField').val();
        selectedColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
        $('#colorRectangle').css("background-color", selectedColor);
    }

    rTextField.change(textBoxChanged);
    gTextField.change(textBoxChanged);
    bTextField.change(textBoxChanged);


    var mouseDown = false;
    var padding = 0;

    var image = new Image();
    image.onload = function () {
        var theCanvas = document.getElementById('colorChooserCanvas');
        var ctx = theCanvas.getContext('2d');
        ctx.drawImage(image, 0, 0, 300, 150);

        function getMousePos(theCanvas, event) {
            var x, y;
            var rect = theCanvas.getBoundingClientRect();
            if (event.targetTouches) {
                // Here if this is a touch event
                var touch = event.targetTouches[0];
                x = touch.clientX - rect.left;
                y = touch.clientY - rect.top;
            } else {
                // Here is this is a mouse event
                x = event.clientX - rect.left;
                y = event.clientY - rect.top;
            }
            return {x: x, y: y};
        }

        function mouseDownFunction(event) {
            event.preventDefault();
            mouseDown = true;
        }

        function mouseUpFunction(event) {
            event.preventDefault();
            mouseDown = false;
        }

        function mouseMovingFunction(event) {

            event.preventDefault();

            var mousePos = getMousePos(theCanvas, event);
            var x = mousePos.x;
            var y = mousePos.y;

            if (mouseDown && mousePos !== null && mousePos.x > 0 && mousePos.x < colorCanvasWidth && mousePos.y > 0 && mousePos.y < colorCanvasHeight) {

                var imageData = ctx.getImageData(0, 0, 300, 150);

                /*if (LOG) console.log(imageData);*/

                var data = imageData.data;

                var normalizedX = Math.round(300 * (x / colorCanvasWidth));
                var normalizedY = Math.round(150 * (y / colorCanvasHeight));

                var red = data[((300 * normalizedY) + normalizedX) * 4];
                var green = data[((300 * normalizedY) + normalizedX) * 4 + 1];
                var blue = data[((300 * normalizedY) + normalizedX) * 4 + 2];
                selectedColor = 'rgb(' + red + ',' + green + ',' + blue + ')';

                $('#rTextField').val(red);
                $('#gTextField').val(green);
                $('#bTextField').val(blue);

                $('#colorRectangle').css("background-color", selectedColor);

            }
        }

        theCanvas.addEventListener('mousedown', mouseDownFunction, false);
        theCanvas.addEventListener('touchstart', mouseDownFunction, false);

        theCanvas.addEventListener('mouseup', mouseUpFunction, false);
        theCanvas.addEventListener('touchend', mouseUpFunction, false);

        theCanvas.addEventListener('mousemove', mouseMovingFunction, false);
        theCanvas.addEventListener('touchmove', mouseMovingFunction, false);
    }
    var imageSrc = './colorwheel.png';
    image.src = imageSrc;

    mainDiv.tooltipster({
        content: configurationPanel,
        animation: 'grow',
        trigger: 'click',
        interactive: true,
        position: 'right',
        multiple: true
    });

    holderElement.configurator = mainDiv;

    // positioning and showing the configurator        
    var centerPoint = holderElement.getPointByOrigin('center', 'center');
    var screenCoords = getScreenCoordinates(centerPoint);
    mainDiv.css('position', 'absolute');
    mainDiv.css('top', screenCoords.y + 'px');
    mainDiv.css('left', screenCoords.x + 'px');
    mainDiv.tooltipster('reposition');
    mainDiv.tooltipster('show');

}