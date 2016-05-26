var NumericCollectionGenerator = fabric.util.createClass(fabric.Rect, {
    isCollection: true,
    isNumericCollectionGenerator: true,
    executePendingConnections: function () {
        var theGenerator = this;
        console.log("%c" + "Executing pending connections of loaded NumericCollectionGenerator. xmlID = " + theGenerator.xmlID, "background: rgb(243,128,146); color: black;");
        executePendingConnections(theGenerator.xmlID);
        theGenerator.visualProperties.forEach(function (visualProperty) {
            executePendingConnections(visualProperty.xmlID);
//            console.log("%c" + "\t visualProperty.xmlID = " + visualProperty.xmlID, "background: rgb(243,128,146); color: black;");
        });
    },
    setXmlIDs: function (from) {
        var theGenerator = this;
        theGenerator.xmlID = from++;
        theGenerator.visualProperties.forEach(function (visualProperty) {
            visualProperty.xmlID = from++;
        });
        return from;
    },
    applyXmlIDs: function (xmlIDs) {
        
        if (xmlIDs) {
            
            var theGenerator = this;
            addToConnectableElements(theGenerator);
            
            
            console.log("5858585858585858585858 connectableElements:");
            console.log(connectableElements);
            
            for (var attribute in xmlIDs) {
                var xmlID = xmlIDs[attribute];
                var visualProperty = theGenerator.getVisualPropertyByAttributeName(attribute);
                if (visualProperty !== null) {
                    visualProperty.xmlID = xmlID;                                        
                    addToConnectableElements(visualProperty);
                }
            }
        }
    },
    toXML: function () {
        var theGenerator = this;
        var generatorNode = createXMLElement("numericCollectionGenerator");
        addAttributeWithValue(generatorNode, "xmlID", theGenerator.xmlID);
        
        var centerPoint = theGenerator.typeIcon ? theGenerator.typeIcon.getCenterPoint() : theGenerator.getCenterPoint();
        appendElementWithValue(generatorNode, "left", centerPoint.x);
        appendElementWithValue(generatorNode, "top", centerPoint.y);
        
        var topCenter = theGenerator.getPointByOrigin('center', 'top');
        appendElementWithValue(generatorNode, "actualTop", topCenter.y);
        
        var actualCenter = theGenerator.getCenterPoint();
        appendElementWithValue(generatorNode, "centerX", actualCenter.x);
        appendElementWithValue(generatorNode, "centerY", actualCenter.y);
        
        appendElementWithValue(generatorNode, "isExpanded", !theGenerator.isCompressed);
        
        theGenerator.visualProperties.forEach(function (visualProperty) {
            var propertyNode = visualProperty.toXML();
            generatorNode.append(propertyNode);
        });
        return generatorNode;
    },
    initialize: function (options) {
        options || (options = {});
        this.callSuper('initialize', options);
        this.outConnectors = new Array();
        this.rx = 20;
        this.lockRotation = true;
        this.ry = this.rx;
        this.width = 60;
        this.isCompressed = true;
        this.compressedHeight = 70;
        this.height = this.compressedHeight;
        this.strokeWidth = options.strokeWidth || 3;
        this.valueScale = 0.75;
        this.typeIcon = null;
        this.values = new Array();

        this.visualPropertyFill = icons['number'].fill;
        this.visualPropertyStroke = icons['number'].stroke;

        this.visualProperties = new Array();
        this.createVisualProperties(options.values);
        this.applyXmlIDs(options.xmlIDs);

        this.generateValues();

        this.associateEvents();

        var theGenerator = this;

        setTimeout(function () {
            theGenerator.addTypeIcon("autoNumber", null, options.doNotBlinkCollection);
        }, 50);

    },
    getVisualPropertyByAttributeName: function (attributeName) {
        var theGenerator = this;
        for (var i = 0; i < theGenerator.visualProperties.length; i++) {
            if (theGenerator.visualProperties[i].attribute === attributeName) {
                return theGenerator.visualProperties[i];
            }
        }
        return null;
    },
    generateValues: function () {

        var theGenerator = this;
        var from = theGenerator.getVisualPropertyByAttributeName('from').value.number;
        var to = theGenerator.getVisualPropertyByAttributeName('to').value.number;
        var step = theGenerator.getVisualPropertyByAttributeName('step').value.number;
        theGenerator.values = new Array();

        for (var i = from; i <= to; i = i + step) {
            theGenerator.values.push(createNumericValue(i));
        }

        var shouldAnimate = false;

        theGenerator.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(theGenerator.values, false, shouldAnimate);
        });

    },
    // The left and top are used for the SVGPathGroupMark, as, when loaded, its position is always set to the point 0,0
    createVisualProperties: function (values) {

        var theGenerator = this;

        var fromValue = null;
        var toValue = null;
        var stepValue = null;

        if (values) {
            fromValue = values.from || createNumericValue(theGenerator.from);
            toValue = values.to || createNumericValue(theGenerator.to);
            stepValue = values.step || createNumericValue(theGenerator.step);
        } else {
            fromValue = createNumericValue(theGenerator.from);
            toValue = createNumericValue(theGenerator.to);
            stepValue = createNumericValue(theGenerator.step);
        }

        console.log("fromValue: ");
        console.log(fromValue);

        console.log("toValue: ");
        console.log(toValue);

        console.log("stepValue: ");
        console.log(stepValue);

        theGenerator.specificProperties = new Array();
        theGenerator.specificProperties.push({attribute: "from", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData', value: fromValue});
        theGenerator.specificProperties.push({attribute: "to", readable: true, writable: true, types: ['number'], updatesTo: ['radius'], dataTypeProposition: 'isNumericData', value: toValue});
        theGenerator.specificProperties.push({attribute: "step", readable: true, writable: true, types: ['number'], updatesTo: ['radius'], dataTypeProposition: 'isNumericData', value: stepValue});

        for (var i = 0; i < theGenerator.specificProperties.length; i++) {
            var visualProperty = CreateVisualProperty(theGenerator.specificProperties[i], theGenerator, theGenerator.left, theGenerator.top);
            theGenerator.visualProperties.push(visualProperty);
            visualProperty.setCoords();
            visualProperty.fill = theGenerator.visualPropertyFill;
            visualProperty.value = theGenerator.specificProperties[i].value;
        }
    },
    removeTypeIcon: function () {
        var theCollection = this;
        if (theCollection.typeIcon && theCollection.typeIcon.canvas) {
            theCollection.typeIcon.remove();
            theCollection.typeIcon = null;
        }
    },
    clear: function () {
        var theCollection = this;
        if (theCollection.visualProperties) {
            theCollection.visualProperties.forEach(function (value) {
                if (value.canvas) {
                    if (LOG)
                        console.log(value);
                    value.remove();
                    value = null;
                }
            });
        }
        theCollection.values = new Array();
        theCollection.visualProperties = new Array();
    },
    applySelectedStyle: function () {
        this.selected = true;
    },
    applyUnselectedStyle: function () {
        this.selected = false;
    },
    addTypeIcon: function (iconName, blinkingFactor, doNotBlinkCollection) {


        var theCollection = this;
        var stringPath = icons[iconName].path;
        var icon = new fabric.Path(stringPath, {
            originX: 'center',
            originY: 'center',
            strokeWidth: 1.5,
            stroke: icons[iconName].stroke,
            fill: icons[iconName].fill,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            opacity: 1,
            permanentOpacity: 1,
            movingOpacity: 1
        });
        theCollection.iconName = iconName;

        if (!blinkingFactor) {
            blinkingFactor = 0.3;
        }

        theCollection.stroke = icons[iconName].stroke;
        theCollection.typeIcon = icon;
        canvas.add(icon);
        theCollection.positionTypeIcon();
        blink(icon, false, 0.30); // the canvas will be refreshed at some point below this, so no need to refresh it here

        if (!doNotBlinkCollection) {
            blink(theCollection, theCollection.isCompressed, 0.30);
        }        

        if (!theCollection.isCompressed) {

            theCollection.expand(true);

        }

//        theCollection.typeIcon.bringToFront();
        bringToFront(theCollection.typeIcon);

    },
    isEmpty: function () {
        return (!this.values || !this.values.length);
    },
    getSize: function () {
        if (this.isEmpty()) {
            return 0;
        }
        return this.values.length;
    },
    getValues: function () {
        return this.values;
    },
    getVisualValues: function () {
        return this.visualProperties;
    },
    getValueAt: function (index) {
        var value = null;
        var visualValue = this.getVisualValueAt(index);
        if (visualValue) {
            value = visualValue.value;
        }
        return value;
    },
    getVisualValueAt: function (index) {
        var visualValue = null;
        if (index >= 0 && index < this.visualProperties.length) {
            visualValue = this.visualProperties[index];
        }
        return visualValue;
    },
    positionConnectors: function () {
        var theGenerator = this;
        updateConnectorsPositions(theGenerator);
    },
    positionTypeIcon: function () {
        var theCollection = this;
        if (theCollection.typeIcon && theCollection.typeIcon.canvas) {
            var topCenter = theCollection.getPointByOrigin('center', 'top');
            if (theCollection.iconName === "string" || theCollection.iconName === "dateAndTime") {
                theCollection.typeIcon.setPositionByOrigin(new fabric.Point(topCenter.x, topCenter.y + 40), 'center', 'center');
            } else {
                theCollection.typeIcon.setPositionByOrigin(new fabric.Point(topCenter.x, topCenter.y + 40), 'center', 'center');
            }
            theCollection.typeIcon.setCoords();
        }
    },
    positionElements: function (valuesFinalScale, intendedNumberOfElements) {

        var theCollection = this;
        theCollection.setCoords();
        var topCenter = theCollection.getPointByOrigin('center', 'top');

        theCollection.positionTypeIcon();
        theCollection.positionConnectors();

        if (theCollection.isCompressed) {
            theCollection.visualProperties.forEach(function (visualValue) {
                visualValue.left = theCollection.left;
                visualValue.top = theCollection.top;
                visualValue.setCoords();
                updateConnectorsPositions(visualValue);
            });
        } else {

            if (!intendedNumberOfElements) {
                intendedNumberOfElements = theCollection.visualProperties.length;
            }

            var valueUnscaledHeight = theCollection.visualProperties[0].height;

            var startingY = topCenter.y + theCollection.compressedHeight + theCollection.strokeWidth / 2 + 2 + 2;
            var firstY = (startingY + 0 * (valueUnscaledHeight + 10) * valuesFinalScale) + (valueUnscaledHeight / 2) * valuesFinalScale;
            var lastY = (startingY + (intendedNumberOfElements - 1) * (valueUnscaledHeight + 10) * valuesFinalScale) + (valueUnscaledHeight / 2) * valuesFinalScale;
            var space = (lastY - firstY) / (intendedNumberOfElements - 1);
            if (isNaN(space)) {
                space = 0;
            }

            var j = 0;
            var x = theCollection.left;

            /*if (LOG) {
                console.log("theCollection.visualProperties:");
                console.log(theCollection.visualProperties);
            }*/
            

            theCollection.visualProperties.forEach(function (visualValue) {

                if (!visualValue.canvas) {
                    canvas.add(visualValue);
                }

//                visualValue.bringToFront();
                bringToFront(visualValue);

                var y = firstY + j * space;
                if (visualValue.relativeY) {
                    y = theCollection.getPointByOrigin('center', 'top').y + visualValue.relativeY + ((visualValue.height / 2) * valuesFinalScale);
                } else {
                    visualValue.relativeY = visualValue.getPointByOrigin('center', 'top').y - theCollection.getPointByOrigin('center', 'top').y;
                }
                visualValue.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
                visualValue.scaleX = valuesFinalScale;
                visualValue.scaleY = valuesFinalScale;
                visualValue.setCoords();
                updateConnectorsPositions(visualValue);
                j++;
            });
        }
    },
    getCompressedMassPoint: function () {
        var theCollection = this;
        var topCenter = theCollection.getPointByOrigin('center', 'top');
        var massCenter = new fabric.Point(topCenter.x, topCenter.y + 35);
//        drawRectAt(topCenter, 'red');
        return massCenter;
    },
    compress: function (refreshCanvas, valuesFinalScale) {

        var theCollection = this;
        if (theCollection.isCompressed) {
            return;
        }

        if (theCollection.typeIcon) {
//            theCollection.typeIcon.bringToFront();
            bringToFront(theCollection.typeIcon);
        }

        if (!valuesFinalScale) {
            valuesFinalScale = 0;
        }

        var duration = 700;
        var easing = fabric.util.ease['easeOutCubic'];

        var topCenter = theCollection.getPointByOrigin('center', 'top');
        var newHeight = theCollection.compressedHeight;
        var newTop = topCenter.y + theCollection.compressedHeight / 2;
        theCollection.animate('top', newTop, {
            easing: easing,
            duration: duration,
        });
        theCollection.animate('height', newHeight, {
            duration: duration,
            easing: easing,
        });

        // Expanding the values of the collection
        if (theCollection.visualProperties) {
            theCollection.visualProperties.forEach(function (visualValue) {

//                visualValue.bringToFront();
                bringToFront(visualValue);
                bringConnectorsToFront(visualValue);

                visualValue.animate('top', newTop, {
                    easing: easing,
                    duration: duration,
                });
                visualValue.animate('scaleX', valuesFinalScale, {
                    easing: easing,
                    duration: duration,
                });
                visualValue.animate('scaleY', valuesFinalScale, {
                    easing: easing,
                    duration: duration,
                });
                visualValue.animate('opacity', 0, {
                    easing: easing,
                    duration: duration,
                    onChange: function () {
                        updateConnectorsPositions(visualValue);
                    },
                    onComplete: function () {
                        visualValue.remove(); // after all the animations are over, the value is removed from the canvas
                    },
                });
            });
        }

        fabric.util.animate({
            duration: duration,
            easing: easing,
            onChange: function () {
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {
                theCollection.isCompressed = true;
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            }
        });
    },
    growHeight: function (targetHeight, refreshCanvas) {

        var theCollection = this;
        var duration = 700;
        var easing = fabric.util.ease['easeOutCubic'];

        var newTop = theCollection.top + targetHeight / 2 - theCollection.height / 2;
        theCollection.animate('top', newTop, {
            easing: easing,
            duration: duration,
        });
        theCollection.animate('height', targetHeight, {
            duration: duration,
            easing: easing,
            onChange: function () {
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
        });

    },
    expand: function (refreshCanvas, valuesFinalScale, intendedNumberOfElements, valueUnscaledHeight) {

        var theCollection = this;

        if (!theCollection.isCompressed) {
            return;
        }

        if (LOG)
            console.log("Starting collection expansion...");

        if (theCollection.typeIcon) {
//            theCollection.typeIcon.bringToFront();
            bringToFront(theCollection.typeIcon);
        }

        if (!valuesFinalScale) {
            valuesFinalScale = theCollection.valueScale;
        }

        if (!intendedNumberOfElements) {
            intendedNumberOfElements = theCollection.visualProperties.length;
        }

        if (!valueUnscaledHeight) {
            valueUnscaledHeight = theCollection.visualProperties[0].height;
        }

        var duration = 700;
        var easing = fabric.util.ease['easeOutCubic'];

        var bottomLeft = theCollection.getPointByOrigin('left', 'bottom');

        var newHeight = theCollection.compressedHeight + intendedNumberOfElements * ((valueUnscaledHeight + 10) * valuesFinalScale);


        if (LOG)
            console.log("%c theCollection.height: " + theCollection.height, "background: blue; color: white;");
        if (LOG)
            console.log("%c newHeight: " + newHeight, "background: blue; color: white;");

        var theClone = fabric.util.object.clone(theCollection);

        if (theCollection.isCompressed || newHeight > theCollection.height) {

            if (newHeight > theCollection.height) {
                var topCenter = theCollection.getPointByOrigin('center', 'top');
                bottomLeft.y = topCenter.y + theCollection.compressedHeight + theCollection.strokeWidth / 2 + 2;

                var theMapper = theCollection.mapper;
                if (theMapper) {
                    var newMapperHeight = theMapper.compressedHeight + intendedNumberOfElements * ((valueUnscaledHeight + 10) * theMapper.valueScale);

                    // Growing the mapper
                    theCollection.mapper.growHeight(newMapperHeight, false);

                    // Growing the other collection of the mapper so that its height matches with this one
                    if (theCollection.isMapperInCollection) {
                        theMapper.outCollection.growHeight(newHeight, false);
                    } else if (theCollection === theMapper.outCollection) {
                        theMapper.inCollection.growHeight(newHeight, false);
                    }
                }
            }

            theCollection.growHeight(newHeight, false);

        } else {
            var topCenter = theCollection.getPointByOrigin('center', 'top');
            bottomLeft.y = topCenter.y + theCollection.compressedHeight + theCollection.strokeWidth / 2 + 2;
        }

        var startingY = bottomLeft.y + 2;

        // Expanding the values of the collection
        if (theCollection.visualProperties) {

            var j = 0;

            var firstY = (startingY + 0 * (valueUnscaledHeight + 10) * valuesFinalScale) + (valueUnscaledHeight / 2) * valuesFinalScale;
            var lastY = (startingY + (intendedNumberOfElements - 1) * (valueUnscaledHeight + 10) * valuesFinalScale) + (valueUnscaledHeight / 2) * valuesFinalScale;
            var space = (lastY - firstY) / (intendedNumberOfElements - 1);
            if (isNaN(space)) {
                space = 0;
            }


            if (LOG)
                console.log("firstY:");
            if (LOG)
                console.log(firstY);

            if (LOG)
                console.log("intendedNumberOfElements:");
            if (LOG)
                console.log(intendedNumberOfElements);

            if (LOG)
                console.log("space:");
            if (LOG)
                console.log(space);

            theCollection.visualProperties.forEach(function (visualProperty) {

                visualProperty.left = theCollection.left;
                visualProperty.top = theCollection.top;
                visualProperty.scaleX = 0;
                visualProperty.scaleY = 0;
                visualProperty.opacity = 0;

                canvas.add(visualProperty);
//                visualProperty.bringToFront();
                bringToFront(visualProperty);
                
                bringConnectorsToFront(visualProperty);

                var y = firstY + j * space;
                if (visualProperty.relativeY) {
                    var newTop = theCollection.top + newHeight / 2 - theCollection.height / 2;
                    theClone.height = newHeight;
                    theClone.top = newTop;
                    y = theClone.getPointByOrigin('center', 'top').y + visualProperty.relativeY + ((visualProperty.height / 2) * valuesFinalScale);
                }

                visualProperty.animate('top', y, {
                    easing: easing,
                    duration: duration,
                });

                visualProperty.animate('scaleX', valuesFinalScale, {
                    easing: easing,
                    duration: duration,
                });
                visualProperty.animate('scaleY', valuesFinalScale, {
                    easing: easing,
                    duration: duration,
                });
                visualProperty.animate('opacity', 1, {
                    easing: easing,
                    duration: duration,
                    onChange: function () {
                        updateConnectorsPositions(visualProperty);
                    }
                });

                j++;

            });

        }


        fabric.util.animate({
            duration: duration,
            easing: easing,
            onChange: function () {
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {
                theCollection.isCompressed = false;
                theCollection.positionElements(valuesFinalScale, intendedNumberOfElements);
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            }
        });
    },
    getTotalValues: function () {
        var totalValues = 0;
        if (this.visualProperties) {
            totalValues = this.visualProperties.length;
        }
        return totalValues;
    },
    getVisualRangeContainingYCoordinate: function (yCoordinate) {

        var theCollection = this;

        for (var j = 0; j < theCollection.visualProperties.length - 1; j++) {
            var visualValue1 = theCollection.getVisualValueAt(j);
            var visualValue2 = theCollection.getVisualValueAt(j + 1);
            if (yCoordinate >= visualValue1.top && yCoordinate <= visualValue2.top) {
                return {from: visualValue1, to: visualValue2};
            }
        }

        return null;

    },
    setProperty: function (property, propertyValue, theVisualProperty, shouldAnimate) {

        var theGenerator = this;

        if (property === 'from' || property === 'to' || property === 'step') {
            theGenerator[property] = propertyValue;
            theGenerator.generateValues();
        }

    },
    associateEvents: function () {

        var theCollection = this;

        this.on({
            'doubleTap': function (options) {
                options.event.preventDefault();
                if (!theCollection.mapper) {
                    if (theCollection.isCompressed) {
                        theCollection.expand(true);
                    } else {
                        theCollection.compress(true);
                    }
                }
            },
            'pressed': function (options) {

                var theCollection = this;

                if (LOG)
                    console.log("Collection pressed...");

                if (!theCollection.mapper && !theCollection.isEmpty()) {

                    theCollection.lockMovementX = true;
                    theCollection.lockMovementY = true;

                    blink(theCollection.typeIcon, false, 0.45);
                    blink(theCollection, true, 0.45);

                    if (LOG)
                        console.log("theCollection.values:");
                    if (LOG)
                        console.log(theCollection.values);


                    var newConnector = new Connector({source: theCollection, value: theCollection.values, x2: theCollection.left, y2: theCollection.top, arrowColor: theCollection.stroke, filledArrow: true, strokeWidth: 1});

                    if (LOG)
                        console.log("newConnector.value:");
                    if (LOG)
                        console.log(newConnector.value);

                    theCollection.outConnectors.push(newConnector);
                    canvas.add(newConnector);

                }

            },
            'moving': function (options) {

                var theCollectionGenerator = this;
                theCollectionGenerator.setCoords();

                if (theCollectionGenerator.lockMovementX && theCollectionGenerator.lockMovementY && !theCollectionGenerator.mapper && !theCollectionGenerator.isEmpty()) {

                    var theEvent = options.e;
                    if (theEvent) {
                        var canvasCoords = getCanvasCoordinates(theEvent);
                        var lastAddedConnector = getLastElementOfArray(theCollectionGenerator.outConnectors);
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                    }

                } else {
                    var valueScale = theCollectionGenerator.valueScale;
                    theCollectionGenerator.positionElements(valueScale);
                    theCollectionGenerator.positionConnectors();
                }



            },
            'mouseup': function (options) {

                var theGenerator = this;

                if (LOG)
                    console.log("Mouse UP over a collection... ");

                if (theGenerator.lockMovementX && theGenerator.lockMovementY) {

                    var theEvent = options.e;

                    if (theEvent) {

                        var canvasCoords = getCanvasCoordinates(theEvent);
                        var coordX = canvasCoords.x;
                        var coordY = canvasCoords.y;

                        var targetObject = findPotentialDestination(canvasCoords, ['isOperator', 'isFunctionInput', 'isAggregator', 'isMapperInput', 'isNumericCollectionGenerator', 'isFunctionValuesCollection', 'isLocatorValuesCollection', 'isNumericFunctionInput', 'isVisualProperty', 'isVerticalCollection']);

                        var connector = getLastElementOfArray(theGenerator.outConnectors);

                        if (targetObject) {

                            if (targetObject !== this) {

                                if (targetObject.isPlayer) {

                                    connector.setDestination(targetObject, true);

                                } else if (targetObject.isVerticalCollection) {

                                    connector.setDestination(targetObject, true);

                                } else if (targetObject.isNumericCollectionGenerator) {

                                    connector.setDestination(targetObject, true);

                                } else if (targetObject.isOperator || targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isMapperInput || targetObject.isFunctionValuesCollection || targetObject.isLocatorValuesCollection || targetObject.isNumericFunctionInput) {

                                    connector.setDestination(targetObject, true);

                                    if (!targetObject.isFunctionValuesCollection && !targetObject.isLocatorValuesCollection && !targetObject.isNumericFunctionInput) {
                                        setTimeout(function () {
//                                            connector.source.bringToFront();
//                                            connector.destination.bringToFront();
                                            bringToFront(connector.destination);
                                        }, 50);
                                    }


                                } else if (targetObject.isAggregator) {

                                    targetObject.addConnector(connector, canvasCoords);

                                } else { // This makes no sense, so, the added connector is just removed
                                    connector = theGenerator.outConnectors.pop();
                                    if (connector) {
                                        connector.contract();
                                    }
                                }

                            } else {
                                connector = theGenerator.outConnectors.pop();
                                if (connector) {
                                    connector.contract();
                                }
                            }

                        } else {

                            // The mouse up event is done over a blank section of the canvas
                            var lastAddedConnector = getLastElementOfArray(theGenerator.outConnectors);
                            newConnectionReleasedOnCanvas(lastAddedConnector, coordX, coordY);



                        }

                        if (theGenerator.collection && theGenerator.collection.mapper) {

                            theGenerator.lockMovementX = true;
                            theGenerator.lockMovementY = false;


                        } else {

                            theGenerator.lockMovementX = false;
                            theGenerator.lockMovementY = false;

                        }


                    }



                } else {

                    if (theGenerator.collection && theGenerator.collection.mapper) {

                        theGenerator.lockMovementX = true;
                        theGenerator.lockMovementY = false;


                    } else {

                        theGenerator.lockMovementX = false;
                        theGenerator.lockMovementY = false;

                    }



                }



            },
            'inConnectionRemoved': function (options) {

                if (LOG)
                    console.log("%cIN CONNECTOR", "background:pink; color:black;");

                if (LOG)
                    console.log("Before: ");
                if (LOG)
                    console.log(this.inConnectors);

                var removedConnection = options.connector;
                fabric.util.removeFromArray(this.inConnectors, removedConnection);

                if (LOG)
                    console.log("After: ");
                if (LOG)
                    console.log(this.inConnectors);

            },
            'outConnectionRemoved': function (options) {

                if (LOG)
                    console.log("OUT CONNECTOR");

                if (LOG)
                    console.log("Before: ");
                if (LOG)
                    console.log(this.outConnectors);

                var removedConnection = options.connector;
                fabric.util.removeFromArray(this.outConnectors, removedConnection);

                if (LOG)
                    console.log("After: ");
                if (LOG)
                    console.log(this.outConnectors);
            },
        });
    },
    // Checks if the given value is allowed to be added to the current collection based on the fact that collections should be honogeneous
    isValueAllowed: function (value) {

        var theCollection = this;

        if (!theCollection.iconName) {
            return true;
        } else {

            var valueIconName = getIconNameByVisualValueProposition(value.getTypeProposition());
            if (theCollection.iconName !== valueIconName) {
                return false;
            }

        }

        return true;

    },
    addVisualValue: function (visualValue) {

        var theCollection = this;

        visualValue.lockMovementX = true;
        visualValue.lockMovementY = true;
        visualValue.lockScalingX = true;
        visualValue.lockScalingY = true;
        visualValue.lockRotation = true;
        visualValue.collection = theCollection;

        if (theCollection.iconName) {

            theCollection.values.push(visualValue.value);
            theCollection.visualProperties.push(visualValue);

            if (theCollection.isCompressed) {
                blink(theCollection.typeIcon, false, 0.30);
                blink(theCollection, true, 0.30);
            } else {

                var theMapper = theCollection.mapper;

                if (theMapper) {

                    if (LOG)
                        console.log("theCollection.getTotalValues():");
                    if (LOG)
                        console.log(theCollection.getTotalValues());

                    var totalInValues = theMapper.inCollection.getTotalValues();
                    var totalOutValues = theMapper.outCollection.getTotalValues();

                    var intendedNumberOfElements = Math.max(totalInValues, totalOutValues);

//               theCollection.isCompressed = true;
//               theCollection.expand(true, null, intendedNumberOfElements);

                    visualValue.relativeY = null;
                    theCollection.positionElements(theCollection.valueScale, intendedNumberOfElements);

                    blink(visualValue, true, 0.3);



                } else {

                    theCollection.isCompressed = true;
                    theCollection.expand(true);

                }



            }

        } else {

            var valueIconName = getIconNameByVisualValueProposition(visualValue.value.getTypeProposition());


            theCollection.values.push(visualValue.value);
            theCollection.visualProperties.push(visualValue);

            // The collection has no icon type, it should be added
            theCollection.addTypeIcon(valueIconName, 0.05);

        }

        theCollection.associateInCollectionEvents(visualValue);

        theCollection.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(theCollection.values, false, true);
        });

    },
    _render: function (ctx, noTransform) {

        var theCollection = this;

        var rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
                ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
                w = this.width,
                h = this.height,
                x = -w / 2,
                y = -h / 2,
                isInPathGroup = this.group && this.group.type === 'path-group',
                isRounded = rx !== 0 || ry !== 0,
                k = 1 - 0.5522847498 /* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */;

        ctx.beginPath();
        ctx.globalAlpha = isInPathGroup ? (ctx.globalAlpha * this.opacity) : this.opacity;

        if (this.transformMatrix && isInPathGroup) {
            ctx.translate(
                    this.width / 2 + this.x,
                    this.height / 2 + this.y);
        }
        if (!this.transformMatrix && isInPathGroup) {
            ctx.translate(
                    -this.group.width / 2 + this.width / 2 + this.x,
                    -this.group.height / 2 + this.height / 2 + this.y);
        }

        ctx.moveTo(x + rx, y);

        ctx.lineTo(x + w - rx, y);
        isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry);

        ctx.lineTo(x + w, y + h);

        ctx.lineTo(x, y + h);

        ctx.lineTo(x, y + ry);
        isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y);

        ctx.closePath();

        this._renderFill(ctx);

        ctx.save();
        if (this.selected) {
            ctx.strokeStyle = widget_selected_stroke_color;
            ctx.lineWidth = widget_selected_stroke_width;
            ctx.setLineDash(widget_selected_stroke_dash_array);
        }
        this._renderStroke(ctx);
        ctx.restore();

        var a = -this.height / 2 + theCollection.compressedHeight;
        ctx.save();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, a);
        ctx.lineTo(this.width / 2, a);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        if (theCollection.matchingY) {

            if (theCollection.matchingY > theCollection.compressedHeight) {

                ctx.save();
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 3]);
                ctx.beginPath();
                ctx.moveTo(-theCollection.width / 2, theCollection.matchingY - theCollection.height / 2);
                ctx.lineTo(theCollection.width / 2, theCollection.matchingY - theCollection.height / 2);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();

            }

        }

    }

});

function addNumericCollectionGeneratorToCanvas(options) {

    options = options || {};

    options.originX = 'center';
    options.originY = 'center';
    options.stroke = 'black';
    options.fill = rgb(226, 227, 227);
    options.perPixelTargetFind = true;
    options.lockScalingX = true;
    options.lockScalingY = true;
    options.opacity = 1;
    options.permanentOpacity = 1;
    options.movingOpacity = 1;
    options.hasRotatingPoint = false;
    options.hasBorders = false;
    options.hasControls = false;

    var theCollectionGenerator = new NumericCollectionGenerator(options);

    canvas.add(theCollectionGenerator);

    if (options.xmlID) {
        theCollectionGenerator.executePendingConnections();
    }

//    if (options.shouldExpand) {
//        theCollectionGenerator.expand(true);
//    }
            
    
    if (options.shouldExpand) {
        theCollectionGenerator.expand(true);

        setTimeout(function () {

            var actualCenter = new fabric.Point(options.centerX, options.centerY);
            theCollectionGenerator.setPositionByOrigin(actualCenter, 'center', 'center');
                        
            var valueScale = theCollectionGenerator.valueScale;
            theCollectionGenerator.positionElements(valueScale);

        }, 720);

    } else if (options.actualTop !== null && typeof options.actualTop !== 'undefined') {

        theCollectionGenerator.setPositionByOrigin(new fabric.Point(options.left, options.actualTop), 'center', 'top');
        theCollectionGenerator.positionTypeIcon();

        canvas.renderAll();
    }
    
    

    return theCollectionGenerator;

}

function createNumericCollectionGeneratorFromXMLNode(generatorXmlNode) {

    var options = {
        markAsSelected: false,
        animateAtBirth: false,
        xmlID: generatorXmlNode.attr('xmlID'),
        xmlIDs: {},
        values: {}
    };

    var children = generatorXmlNode.children();
    children.each(function () {
        var child = $(this);
        var tagName = this.tagName;

        if (tagName === "property") {

            var valueXmlNode = $(child.find('value')[0]);
            var propertyValue = createValueFromXMLNode(valueXmlNode);

            var xmlID = child.attr('xmlID');
            var attribute = child.attr('attribute');

            options.values[attribute] = propertyValue;
            options.xmlIDs[attribute] = xmlID;

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
    
    options.shouldExpand = options.isExpanded;
    options.doNotBlinkCollection = options.isExpanded;

    console.log("%c" + "options to create a new NUMERIC COLLECTION GENERATOR from an XML node", "background: rgb(231,242,109); color: black;");
    console.log(options);

    return addNumericCollectionGeneratorToCanvas(options);
}