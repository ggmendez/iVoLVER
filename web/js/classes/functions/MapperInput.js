var MapperInput = fabric.util.createClass(fabric.Path, {
    initialize: function (path, options) {
        options || (options = {});
        this.callSuper('initialize', path, options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('lockMovementX', options.lockMovementX || true);
        this.set('lockMovementY', options.lockMovementY || true);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('hasBorders', options.hasBorders || false);
        this.set('hasControls', options.hasControls || false);
        this.set('fill', options.fill || rgb(255, 255, 255));
        this.set('stroke', options.stroke || rgb(45, 45, 45));
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('isMapperInput', true);
        this.set('isCompressed', true);
        this.set('dataTypeProposition', null);
        this.originX = 'center';
        this.originY = 'center';
        this.set({left: options.left, top: options.top});
        this.setCoords();
        this.associateEvents();
    },
    updateConnectorsPositions: function () {
        updateConnectorsPositions(this);
    },
    setValue: function (value, shouldAnimate) {
        var theMapperInput = this;
        theMapperInput.value = value;
        theMapperInput.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(value, false, shouldAnimate);
        });
    },
    inValueUpdated: function (options) {

        var theMapperInput = this;

        var inConnection = options.inConnection;
        var markAsSelected = options.markAsSelected;
        var shouldAnimate = options.shouldAnimate;

        var updatedValue = inConnection.value;
        var theMapper = theMapperInput.mapper;

        console.log("Updating value of the input of a mapper. shouldAnimate: " + shouldAnimate);

        if (LOG)
            console.log("updatedValue:");
        if (LOG)
            console.log(updatedValue);

        theMapper.evaluate(updatedValue, shouldAnimate);

        theMapperInput.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(updatedValue, false, shouldAnimate);
        });

        theMapperInput.set('value', updatedValue);

    },
    associateEvents: function () {

        var theMapperInput = this;

        theMapperInput.on({
            'pressed': function (options) {


                theMapperInput.connecting = true;

                theMapperInput.lockMovementY = true;
                blink(theMapperInput, true, 0.45);

                var newConnector = new Connector({value: theMapperInput.value, source: theMapperInput, x2: theMapperInput.left, y2: theMapperInput.top, arrowColor: theMapperInput.colorForStroke, filledArrow: true, strokeWidth: 1});

                theMapperInput.outConnectors.push(newConnector);
                canvas.add(newConnector);

            },
            'mouseup': function (options) {
                var theMapperInput = this;


                if (theMapperInput.connecting) {

                    // Do the things that should be done when 

                    var theEvent = options.e;
                    var canvasCoords = getCanvasCoordinates(theEvent);

                    var coordX = canvasCoords.x;
                    var coordY = canvasCoords.y;

                    var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isOperator', 'isNumericFunctionInput', 'isAggregator', 'isMark', 'isPlayer', 'isVisualValue', 'isVerticalCollection', 'isMapperInput', 'isMapperOutput', 'isFunctionValuesCollection']);
                    var connector = getLastElementOfArray(theMapperInput.outConnectors);

                    if (!targetObject) {

                        newConnectionReleasedOnCanvas(connector, coordX, coordY);

                    } else {

                        if (targetObject !== theMapperInput) {


                            if (targetObject.isOperator || targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isVerticalCollection || targetObject.isMapperInput || targetObject.isNumericFunctionOutput || targetObject.isNumericFunctionInput || targetObject.isFunctionValuesCollection) {

                                connector.setDestination(targetObject, true);

                                if (!targetObject.isVerticalCollection) {

                                    setTimeout(function () {
//                                        connector.source.bringToFront();
//                                        connector.destination.bringToFront();
                                        bringToFront(connector.source);
                                        bringToFront(connector.destination);
                                    }, 50);

                                }

                            } else if (targetObject.isAggregator) {

                                targetObject.addConnector(connector, canvasCoords);

                            } else { // This makes no sense, so, the added connector is just removed
                                connector = theMapperInput.outConnectors.pop();
                                if (connector) {
                                    connector.contract();
                                }
                            }

                        } else {

                            connector = theMapperInput.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }

                        }

                    }

                    theMapperInput.connecting = false;

                }


                theMapperInput.lockMovementY = false;










                /*var theMapper = theMapperInput.mapper;
                 var inCollection = theMapper.getInCollection();
                 var outCollection = theMapper.getOutCollection();*/
                /*inCollection.matchingY = null;
                 outCollection.matchingY = null;*/
            },
            'mousedown': function (options) {
                var theMapperInput = this;
//                theMapperInput.bringToFront();
                bringToFront(theMapperInput);
            },
            'moving': function (options) {
                var theMapperInput = this;
                var event = options.e;
                var canvasCoords = getCanvasCoordinates(event);
                var pointer = canvas.getPointer(event);
                var mapperInputCenter = theMapperInput.getCenterPoint();
                var pointerRelativeToCenter = {x: pointer.x - mapperInputCenter.x, y: pointer.y - mapperInputCenter.y};

                var theMapper = theMapperInput.mapper;
                if (theMapper) {

                    if (theMapper.isCompressed) {
                        return;
                    }

                    if (theMapperInput.connecting) {

                        var lastAddedConnector = getLastElementOfArray(theMapperInput.outConnectors);
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});

                    } else {


                        var theMapperOutput = theMapper.outputPoint;

                        theMapperInput.inConnectors.forEach(function (inConnector) {
                            inConnector.contract();
                        });

                        var inCollection = theMapper.getInCollection();
                        var outCollection = theMapper.getOutCollection();
                        var theCollectionLeftTop = inCollection.getPointByOrigin('left', 'top');
                        var theCollectionRightBottom = inCollection.getPointByOrigin('right', 'bottom');

                        var diff = 0;
                        var theFirstElement = inCollection.getVisualValueAt(0);
                        if (theFirstElement) {
                            diff = (theMapperInput.getHeight() - theFirstElement.getHeight()) / 2 + (theMapperInput.strokeWidth + theFirstElement.strokeWidth) / 2;
                        }

                        var startingY = inCollection.compressedHeight + theCollectionLeftTop.y + inCollection.strokeWidth + 1 - diff;
                        var endingY = theCollectionRightBottom.y;

                        var top = canvasCoords.y - ((theMapperInput.height * theMapperInput.scaleY / 2) + pointerRelativeToCenter.y);
                        var bottom = canvasCoords.y + ((theMapperInput.height * theMapperInput.scaleY / 2) - pointerRelativeToCenter.y);

                        if (top < startingY) {

                            theMapperInput.lockMovementY = true;
                            theMapperInput.setPositionByOrigin(new fabric.Point(theMapperInput.left, startingY), 'center', 'top');

                        } else if (bottom > endingY) {

                            theMapperInput.lockMovementY = true;
                            theMapperInput.setPositionByOrigin(new fabric.Point(theMapperInput.left, endingY), 'center', 'bottom');

                        } else {

                            theMapperInput.lockMovementY = false;

                        }

                        theMapperInput.relativeY = theMapperInput.top - theMapper.getPointByOrigin('center', 'top').y;

                        theMapperOutput.top = theMapperInput.top;
                        theMapperOutput.relativeY = theMapperOutput.top - theMapper.getPointByOrigin('center', 'top').y;

                        theMapperOutput.updateConnectorsPositions();

                        inCollection.matchingY = theMapperInput.top - inCollection.getPointByOrigin('center', 'top').y;
                        outCollection.matchingY = theMapperOutput.top - outCollection.getPointByOrigin('center', 'top').y;

                        theMapperInput.setCoords();

                        var outputValue = theMapper.computeOutput();
                        if (outputValue) {
                            theMapper.outputPoint.setValue(outputValue, false);
                        }
                        
                        var inputValue = theMapper.computeInput();
                        if (inputValue) {
                            theMapper.inputPoint.setValue(inputValue, false);
                        }


                    }





                }


            },
//            'inValueUpdated': function (options) {
//
//                var inConnection = options.inConnection;
//                var markAsSelected = options.markAsSelected;
//                var shouldAnimate = options.shouldAnimate;
//
//                var updatedValue = inConnection.value;
//                var theMapper = theMapperInput.mapper;
//
//                if (LOG) console.log("updatedValue:");
//                if (LOG) console.log(updatedValue);
//
//                theMapper.evaluate(updatedValue);
//
//                theMapperInput.outConnectors.forEach(function (outConnector) {
//                    outConnector.setValue(updatedValue, false, shouldAnimate);
//                });
//
//                theMapperInput.set('value', updatedValue);
//
//            },
            'newInConnection': function (options) {

                var newInConnection = options.newInConnection;
                var shouldAnimate = options.shouldAnimate;
                var incomingValue = newInConnection.value;

                if (LOG)
                    console.log("incommingValue:");
                if (LOG)
                    console.log(incomingValue);

                if (LOG)
                    console.log("theMapperInput.dataTypeProposition:");
                if (LOG)
                    console.log(theMapperInput.dataTypeProposition);


                // When the incoming value is an array, we have to check that it is not empty
                if ($.isArray(incomingValue)) {

                    if (!incomingValue.length) {

                        alertify.error("The given array is empty.", "", 2000);
                        newInConnection.contract();
                        return;

                    } else {

                        var homogeneousType = getHomogeneousType(incomingValue);

                        console.log("%c" + "homogeneousType: " + homogeneousType, "background: #a13566; color: white;");
                        console.log("%c" + "theMapperInput.dataTypeProposition: " + theMapperInput.dataTypeProposition, "background: #56c796; color: black;");

                        if (!homogeneousType) {

                            alertify.error("The array should contain elements of a single type.", "", 2000);
                            newInConnection.contract();
                            return;

                        } else {

                            var iconType = getIconNameByVisualValueProposition(theMapperInput.dataTypeProposition);

                            /*alert("iconType: " + iconType + " - homogeneousType: " + homogeneousType);*/


                            if (homogeneousType !== iconType) {

                                alertify.error("The given array does not contain elements of the required type.", "", 2000);
                                newInConnection.contract();
                                return;

                            }

                        }

                    }

                } else {

                    if (!theMapperInput.dataTypeProposition) {

                        alertify.error("Empty domain collection!", "", 2000);
                        newInConnection.contract();
                        return;

                    } else if (!incomingValue[theMapperInput.dataTypeProposition]) {

                        alertify.error("The type of the input value does not match the type of the associated collection", "", 2000);
                        newInConnection.contract();
                        return;

                    }

                }


                var theMapper = theMapperInput.mapper;
                if (!theMapper) {

                    alertify.error("This input point exists without a mapper!!! Seriously???", "", 2000);
                    newInConnection.contract();
                    return;

                }

                if (LOG)
                    console.log("Going to evaluate this value:");
                if (LOG)
                    console.log(incomingValue);

                theMapper.evaluate(incomingValue, true);

                if (theMapperInput.inConnectors.length > 0) {
                    var connector = theMapperInput.inConnectors.pop();
                    connector.contract();
                }

                theMapperInput.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(incomingValue, false, shouldAnimate);
                });

                theMapperInput.inConnectors.push(newInConnection);
                blink(theMapperInput, true, 0.3);

                theMapperInput.set('value', incomingValue);


            },
            'inConnectionRemoved': standarInConnectionRemovedHandler,
            'outConnectionRemoved': standarOutConnectionRemovedHandler,
        });

    },
    _render: function (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        this.callSuper('_render', ctx);
    },
});