var Operator = fabric.util.createClass(fabric.Circle, {
    type: 'operator',
    xmlNodeName: 'operator',
    serializableProperties: ['type', 'top', 'left'],
    deserializer: addOperator,
    
    setXmlIDs: function (from) {
        var theVisualValue = this;
        theVisualValue.xmlID = from++;
        return from;
    },
    
    executePendingConnections: function () {
        var theOperator = this;
        executePendingConnections(theOperator.xmlID);
    },
    
    initialize: function (options) {
        options || (options = {});

        var fill = DEFAULT_OPERATOR_FILL;
        var stroke = DEFAULT_OPERATOR_STROKE;
        var colorForStroke = DEFAULT_OPERATOR_STROKE;

        var value = options.value;
        
        console.log(" $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ******************************* value");
        console.log(value);
        
        if (typeof value !== 'undefined') {
            var iconName = getIconNameByVisualValueProposition(value.getTypeProposition());
            fill = icons[iconName].fill;
            stroke = icons[iconName].stroke;
            colorForStroke = stroke;
        }

        options.fill = fill;
        options.stroke = stroke;
        options.colorForStroke = colorForStroke;

        this.callSuper('initialize', options);
        this.set('operator', options.operator || '');
        this.set('isOperator', true);
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('strokeWidth', 3);
        this.set('radius', 30);
        this.set('lockRotation', true);
        this.set('lockScalingX', true);
        this.set('lockScalingY', true);
        this.set('hasBorders', false);
        this.set('hasControls', false);
        this.set('hasRotatingPoint', false);

        this.set('originX', 'center');
        this.set('originY', 'center');

        this.set('value', value || createStringValue('')); // the out prefix has to be null at the beginning because the computeOutputValue method checks for null to decide which units it will output
        this.set('label', typeof value !== 'undefined' ? value.getDisplayableString() : (options.label || ''));

        this.associateEvents();
    },
    toXML: function () {
        var operatorNode = createXMLElement("operator");
        addAttributeWithValue(operatorNode, "xmlID", this.xmlID);
        addAttributeWithValue(operatorNode, "type", this.type);
        appendElementWithValue(operatorNode, "left", this.left);
        appendElementWithValue(operatorNode, "top", this.top);
        operatorNode.append(this.value.toXML());
        return operatorNode;
    },
    getAllInComingValues: function () {
        var theOperator = this;
        var values = new Array();
        theOperator.inConnectors.forEach(function (inConnector) {
            values.push(inConnector.value);
        });
        return values;
    },
    applySelectedStyle: function (selectConnectorsToo) {

        this.selected = true;
        this.stroke = widget_selected_stroke_color;
        this.strokeDashArray = widget_selected_stroke_dash_array;
        
        if (selectConnectorsToo) {

            this.inConnectors.forEach(function (inConnector) {
                if (!inConnector.source.isOperator) {
                    inConnector.applySelectedStyle(true, false);
                } else {
                    inConnector.source.applySelectedStyle(false);
                    inConnector.applySelectedStyle(false, false);
                }
            });

            this.outConnectors.forEach(function (outConnector) {

                if (LOG)
                    console.log("outConnector:");
                if (LOG)
                    console.log(outConnector);

                if (!outConnector.destination.isOperator) {

                    if (LOG)
                        console.log("ssssss");
                    outConnector.applySelectedStyle(false, true);



                } else {
                    if (LOG)
                        console.log("dddddd");
                    outConnector.applySelectedStyle(false, false);
                    outConnector.destination.applySelectedStyle(false);

                }
            });
        }


    },
    applyUnselectedStyle: function () {
        this.selected = false;
        this.stroke = this.colorForStroke;
        this.strokeDashArray = [];
        this.inConnectors.forEach(function (inConnector) {

            if (!inConnector.source.isOperator) {
                inConnector.applyUnselectedStyle(true, false);
            } else {
                inConnector.applyUnselectedStyle(false, false);
            }
        });
        this.outConnectors.forEach(function (outConnector) {
            if (outConnector.destination && !outConnector.destination.isOperator) {
                outConnector.applyUnselectedStyle(false, true);
            } else {
                outConnector.applyUnselectedStyle(false, false);
            }
        });
    },
    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            operator: this.get('operator'),
            isOperator: this.get('isOperator'),
            inputs: this.get('inputs')
        });
    },
    blink: function () {
        var increment = 0.45;
        var duration = 100;
        var easing = fabric.util.ease['easeInCubic'];

        this.animate('scaleX', '+=' + increment, {
            duration: duration,
            onChange: canvas.renderAll.bind(canvas),
            easing: easing,
            operator: this,
            onComplete: function () {
                if (LOG)
                    console.log(this);
                if (LOG)
                    console.log(self);
                this.operator.animate('scaleX', '-=' + increment, {
                    duration: 1100,
                    onChange: canvas.renderAll.bind(canvas),
                    easing: fabric.util.ease['easeOutElastic']
                });
            }
        });
        this.animate('scaleY', '+=' + increment, {
            duration: duration,
            onChange: canvas.renderAll.bind(canvas),
            easing: easing,
            operator: this,
            onComplete: function () {
                this.operator.animate('scaleY', '-=' + increment, {
                    duration: 1100,
                    onChange: canvas.renderAll.bind(canvas),
                    easing: fabric.util.ease['easeOutElastic']
                });
            }
        });
    },
    setValue: function (value, refreshCanvas, shouldAnimate) {

        console.log("%c setValue OPERATOR class " + shouldAnimate, "background: #00008B; color: white;");

        var theOperator = this;

        theOperator.value = value;

        var markDestinationAsSelected = false;

        // Every time a value is set here, we also have to update the values of the outgoing connections
        theOperator.outConnectors.forEach(function (outConnector) {
            if (LOG)
                console.log("Updating the value of a connection going out an OPERATOR");
            outConnector.setValue(value, markDestinationAsSelected, shouldAnimate);
        });

        // changing the value of the operator to reflect the type of this value

        var iconName = getIconNameByVisualValueProposition(value.getTypeProposition());

        theOperator.fill = icons[iconName].fill;
        if (!theOperator.selected) {
            theOperator.stroke = icons[iconName].stroke;   
        }        
        theOperator.colorForStroke = icons[iconName].stroke;

        if (refreshCanvas) {
            canvas.renderAll();
        }
    },
    associateEvents: function () {

        var theOperator = this;

        this.on({
            'moving': function (option) {

                this.moving = true;

                if (this.lockMovementX && this.lockMovementY) {
                    if (LOG)
                        console.log("Output being created from operator");

                    var theEvent = option['e'];

                    if (theEvent) {
                        var canvasCoords = getCanvasCoordinates(theEvent);
                        var lastAddedConnector = getLastElementOfArray(this.outConnectors);
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                    }


                } else {

                    updateConnectorsPositions(this);

                    if (LOG)
                        console.log("Operator being moved");
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
                    console.log("Mouse UP over an operator ");

                if (this.moving || this.scaling) {

                    var theEvent = option['e'];
                    var canvasCoords = getCanvasCoordinates(theEvent);
                    var coordX = canvasCoords.x;
                    var coordY = canvasCoords.y;

                    if (theOperator.value) {



//                    var targetObject = getObjectContaining(canvasCoords);
                        var targetObject = findPotentialDestination(canvasCoords, [theOperator.value.getTypeProposition(), 'isVisualProperty', 'isOperator', 'isFunctionInput', 'isAggregator', 'isMark', 'isPlayer', 'isVisualValue', 'isVerticalCollection', 'isMapperInput', 'isMapperOutput']);

                        if (targetObject && targetObject !== this) {

                            if ((targetObject.isOperator || targetObject.isVisualProperty || targetObject[theOperator.value.getTypeProposition()]) && targetObject != this) {

                                var connector = getLastElementOfArray(theOperator.outConnectors);
                                connector.setDestination(targetObject, true);

                            } else if (targetObject.isImage) { // This makes no sense, so, the added connector is just removed
                                var connector = this.outConnectors.pop();
                                connector.remove();
                            } else if (targetObject.isAggregator) {

                                var connector = getLastElementOfArray(this.outConnectors);
                                targetObject.addConnector(connector, canvasCoords);

                            }

                        } else {

                            if (this.lockMovementX && this.lockMovementY) {

                                // The mouse up event is done over a blank section of the canvas
                                var lastAddedConnector = getLastElementOfArray(this.outConnectors);



                                var visualValue = createDefaultVisualValueByTypeProposition(lastAddedConnector.value.getTypeProposition());
                                visualValue.top = coordY;
                                visualValue.left = coordX;

                                lastAddedConnector.setDestination(visualValue, true);

                                canvas.add(visualValue);
                                visualValue.animateBirth(false, null, null, false);

                                setTimeout(function () {
//                                    theOperator.bringToFront();
//                                    visualValue.bringToFront();
                                    bringToFront(theOperator);
                                    bringToFront(visualValue);
                                }, 50);

                            }
                        }

                        // In case this operator belongs to a selection
                        if (this.parentObject) {
                            computeUntransformedProperties(this);
                        }


                    }



                } else {

                    if (this.lockMovementX && this.lockMovementY) {
                        var connector = this.outConnectors.pop();
                        connector.remove();
                    }

                }

                this.lockMovementX = false;
                this.lockMovementY = false;
                this.moving = false;
                this.scaling = false;
            },
            'mousedown': function (option) {
                if (LOG)
                    console.log("Mouse DOWN over an operator ");
            },
            'pressed': function (theEvent) {

                var shouldAnimate = false;

                this.blink();

//                if (LOG) console.log("Operator PRESSED !!!!");
//                if (LOG) console.log(theEvent);
                this.lockMovementX = true;
                this.lockMovementY = true;

                // Updating the value that should be output by this operator
                this.computeOutputValue(shouldAnimate);

                var newConnector = new Connector({strokeWidth: 3, source: this, x2: this.left, y2: this.top, arrowColor: this.colorForStroke, filledArrow: true});
                this.outConnectors.push(newConnector);
                canvas.add(newConnector);

            },
            'scaling': function (options) {
                this.scaling = true;
                if (LOG)
                    console.log("Operator being scaled");
            },
            'inConnectionRemoved': function (options) {
                var removedConnection = options.connector;
                if (LOG)
                    console.log("%cAn IN connection has been removed from this operator", "background: DarkSeaGreen");
                fabric.util.removeFromArray(this.inConnectors, removedConnection);

                var shouldAnimate = true;
                this.computeOutputValue(shouldAnimate);
            },
            'outConnectionRemoved': function (options) {
                var removedConnection = options.connector;
                if (LOG)
                    console.log("%cAn OUT connection has been removed from this operator", "background: DarkSeaGreen");
                fabric.util.removeFromArray(this.outConnectors, removedConnection);
            },
            'newInConnection': function (options) {


                // TODO: This method should check the type of operator, as some of them do not allow more than 2 inputs


                var newInConnection = options.newInConnection;
                var shouldAnimate = options.shouldAnimate;

                if (newInConnection.value.isShapeData) {
                    alertify.error("No operations are defined for shape values.", "", 2000);
                    newInConnection.contract();
                    return;
                }



                if ((theOperator.isSubtractionOperator || theOperator.isDivisionOperator) && theOperator.inConnectors.length === 2) {
                    alertify.error("Only two incoming connections are allowed for this operator.", "", 2000);
                    newInConnection.contract();
                    return;
                }


                if (LOG)
                    console.log("newInConnection:");
                if (LOG)
                    console.log(newInConnection);

                if (LOG)
                    console.log("%c newInConnection " + shouldAnimate, "background:pink; color: black;");


                theOperator.inConnectors.push(newInConnection);

                theOperator.blink();

                if (LOG)
                    console.log("%cNew IN connection detected in this operator", "background:green");
                if (LOG)
                    console.log("%cThe input value is " + newInConnection.value, "background:yellow");
                if (LOG)
                    console.log("newInConnection:");
                if (LOG)
                    console.log(newInConnection);

                var outputValue = theOperator.computeOutputValue(shouldAnimate);

                if (!outputValue) {
                    alertify.error("Invalid input.", "", 2000);
                    newInConnection.contract();
                    return;
                }


            },
//            'inValueUpdated': function (options) {
//
//                var inConnection = options.inConnection;
//                var markAsSelected = options.markAsSelected;
//                var shouldAnimate = options.shouldAnimate;
//
////            this.computeOutputValue(shouldAnimate);
//                this.computeOutputValue(shouldAnimate);
//            },
            'doubleTap': function (options) {

                if (theOperator.attribute === "fill") {

                    showColorChooser(theOperator);

                } else if (theOperator.attribute === "label") {

                    showLabelModifier(theOperator);

                } else if (theOperator.value.isDurationData) {

                    showDurationValue(theOperator);

                } else if (theOperator.attribute === "shape") {

                    showShapeSelector(theOperator);

                } else {

                    showNumericValue(theOperator, false);

                }




            },
        });
    },
    inValueUpdated: function (options) {

        var theOperator = this;

        var inConnection = options.inConnection;
        var markAsSelected = options.markAsSelected;
        var shouldAnimate = options.shouldAnimate;

//            this.computeOutputValue(shouldAnimate);
        theOperator.computeOutputValue(shouldAnimate);
    },
});


function addOperator(options) {

//    console.log("----------------------options");
//    console.log(options);

    var type = options.type;
    var operatorConstructor = null;

    if (type === 'addition') {

        operatorConstructor = AdditionOperator;

    } else if (type === 'subtraction') {

        operatorConstructor = SubtractionOperator;

    } else if (type === 'multiplication') {

        operatorConstructor = MultiplicationOperator;

    } else if (type === 'division') {

        operatorConstructor = DivisionOperator;

    }

    if (options.animateAtBirth) {
        options.scaleX = 0.05;
        options.scaleY = 0.05;
    } else {
        options.scaleX = 1;
        options.scaleY = 1;
    }

    var operator = new operatorConstructor(options);

    if (options.animateAtBirth) {
        var easing = fabric.util.ease.easeOutElastic;
        var duration = 1000;
        operator.animate('scaleX', 1, {
            duration: duration,
            easing: easing
        });
        operator.animate('scaleY', 1, {
            onChange: canvas.renderAll.bind(canvas),
            duration: duration,
            easing: easing
        });
    }

    canvas.add(operator);

    if (options.markAsSelected) {
        canvas.setActiveObject(operator);
    }
    
    return operator;

}



function createOperatorFromXMLNode(operatorXmlNode) {

    var options = {
        type: operatorXmlNode.attr('type'),
        xmlID: operatorXmlNode.attr('xmlID'),
        animateAtBirth: true
    };

    var children = operatorXmlNode.children();
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

//    console.log("options to create a new OPERATOR from an XML node");
//    console.log(options);
   

    var operator = addOperator(options);
    
    addToConnectableElements(operator);
    
    operator.executePendingConnections();
    
    return operator;

}