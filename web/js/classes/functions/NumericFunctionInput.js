var NumericFunctionInput = fabric.util.createClass(fabric.Path, {
    initialize: function (path, options) {
        options || (options = {});
        this.callSuper('initialize', path, options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('lockMovementX', options.lockMovementX || true);
        this.set('lockMovementY', options.lockMovementY || true);
        this.set('lockRotation', options.lockRotation || true);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('hasBorders', options.hasBorders || false);
        this.set('hasControls', options.hasControls || false);
        this.set('fill', options.fill || rgb(2, 128, 204));
        this.set('stroke', options.stroke || darkenrgb(2, 128, 204));
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('isNumericFunctionInput', true);
        this.set('isCompressed', true);
        this.set('dataTypeProposition', 'isNumericData');
        this.originX = 'center';
        this.originY = 'center';
        this.set({left: options.left, top: options.top});
        this.setCoords();
        this.associateEvents();
    },
    updateConnectorsPositions: function () {
        updateConnectorsPositions(this);
    },
    associateEvents: function () {

        var theInputPoint = this;

        theInputPoint.on({
            'pressed': function (options) {

                var theInputPoint = this;
                theInputPoint.connecting = true;

                theInputPoint.lockMovementX = true;
                blink(theInputPoint, true, 0.45);

                var newConnector = new Connector({value: theInputPoint.value, source: theInputPoint, x2: theInputPoint.left, y2: theInputPoint.top, arrowColor: theInputPoint.colorForStroke, filledArrow: true, strokeWidth: 1});

                theInputPoint.outConnectors.push(newConnector);
                canvas.add(newConnector);

            },
            'mouseup': function (options) {

                var theInputPoint = this;

                if (theInputPoint.connecting) {

                    // Do the things that should be done when 

                    var theEvent = options.e;
                    var canvasCoords = getCanvasCoordinates(theEvent);

                    var coordX = canvasCoords.x;
                    var coordY = canvasCoords.y;

                    var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isOperator', 'isNumericFunctionInput', 'isAggregator', 'isMark', 'isPlayer', 'isVisualValue', 'isVerticalCollection', 'isMapperInput', 'isMapperOutput', 'isFunctionValuesCollection']);
                    var connector = getLastElementOfArray(theInputPoint.outConnectors);

                    if (!targetObject) {

                        newConnectionReleasedOnCanvas(connector, coordX, coordY);
                    } else {

                        if (targetObject !== theInputPoint) {


                            if (targetObject.isPlayer) {

                                connector.setDestination(targetObject, true);

                            } else if (targetObject.isOperator || targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isVerticalCollection || targetObject.isMapperInput || targetObject.isNumericFunctionOutput || targetObject.isNumericFunctionInput || targetObject.isFunctionValuesCollection) {

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
                                connector = theInputPoint.outConnectors.pop();
                                if (connector) {
                                    connector.contract();
                                }
                            }

                        } else {

                            connector = theInputPoint.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }

                        }

                    }

                    theInputPoint.connecting = false;

                }

                theInputPoint.lockMovementX = false;


            },
            'mousedown': function (options) {
                var theInputPoint = this;
//                theInputPoint.bringToFront();
                bringToFront(theInputPoint);
            },
            'moving': function (options) {

                var theInputPoint = this;
                var theFunction = theInputPoint.function;

                var event = options.e;
                var canvasCoords = getCanvasCoordinates(event);
                var pointer = canvas.getPointer(event);
                var functionInputCenter = theInputPoint.getCenterPoint();
                var pointerRelativeToCenter = {x: pointer.x - functionInputCenter.x, y: pointer.y - functionInputCenter.y};

                if (theInputPoint.connecting) {

                    var lastAddedConnector = getLastElementOfArray(theInputPoint.outConnectors);
                    lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});

                } else {

                    if (theFunction) {

                        theInputPoint.inConnectors.forEach(function (inConnector) {
                            inConnector.contract();
                        });

                        /*drawRectAt(theFunction.minX.getCenterPoint(), 'yellow');
                         drawRectAt(theFunction.maxX.getCenterPoint(), 'pink');*/

                        var startingX = theFunction.minX.getCenterPoint().x - theInputPoint.width * theInputPoint.scaleX / 2;
                        var endingX = theFunction.maxX.getCenterPoint().x + theInputPoint.width * theInputPoint.scaleX / 2;

                        var left = canvasCoords.x - ((theInputPoint.width * theInputPoint.scaleX / 2) + pointerRelativeToCenter.x);
                        var right = canvasCoords.x + ((theInputPoint.width * theInputPoint.scaleX / 2) - pointerRelativeToCenter.x);

//                    drawRectAt(new fabric.Point(left, theInputPoint.top), 'red');
//                    drawRectAt(new fabric.Point(right, theInputPoint.top), 'green');

                        if (left < startingX) {

                            theInputPoint.lockMovementX = true;
                            theInputPoint.setPositionByOrigin(new fabric.Point(theFunction.minX.getCenterPoint().x, theInputPoint.top), 'center', 'center');

                        } else if (right > endingX) {

                            theInputPoint.lockMovementX = true;
                            theInputPoint.setPositionByOrigin(new fabric.Point(theFunction.maxX.getCenterPoint().x, theInputPoint.top), 'center', 'center');

                        } else {

                            theInputPoint.lockMovementX = false;

                        }


                        theInputPoint.relativeX = theInputPoint.getPointByOrigin('center', 'center').x - theFunction.getPointByOrigin('center', 'center').x;

                        theInputPoint.rangeProportion = Math.abs(theInputPoint.getCenterPoint().x - theFunction.minX.getCenterPoint().x) / Math.abs(theFunction.maxX.getCenterPoint().x - theFunction.minX.getCenterPoint().x);

                        /*if (LOG) console.log("theInputPoint.rangeProportion:");
                         if (LOG) console.log(theInputPoint.rangeProportion);*/


                        theInputPoint.setCoords();

                        theFunction.computeOutput(null, false, true);


                    }

                }
            },
            'newInConnection': function (options) {

                var newInConnection = options.newInConnection;
                var shouldAnimate = options.shouldAnimate;
                var incomingValue = newInConnection.value;

                if (LOG)
                    console.log("incommingValue:");
                if (LOG)
                    console.log(incomingValue);

                if (LOG)
                    console.log("theInputPoint.dataTypeProposition:");
                if (LOG)
                    console.log(theInputPoint.dataTypeProposition);


                if ($.isArray(incomingValue)) {

                    if (!incomingValue.length) {

                        alertify.error("The given array is empty.", "", 2000);
                        newInConnection.contract();
                        return;

                    } else {

                        var homogeneousType = getHomogeneousType(incomingValue);

                        if (!homogeneousType) {

                            alertify.error("The array should contain elements of a single type and they should be numbers.", "", 2000);
                            newInConnection.contract();
                            return;

                        } else {

                            var iconType = getIconNameByVisualValueProposition('isNumericData');

                            if (homogeneousType !== iconType) {

                                alertify.error("The given array does not contain numbers.", "", 2000);
                                newInConnection.contract();
                                return;

                            }

                        }

                    }


                } else {

                    if (!incomingValue[theInputPoint.dataTypeProposition]) {

                        alertify.error("The input is not a number", "", 2000);
                        newInConnection.contract();
                        return;

                    }

                }


                var theFunction = theInputPoint.function;
                if (!theFunction) {

                    alertify.error("This input point exists without a function!!! Seriously???", "", 2000);
                    newInConnection.contract();
                    return;

                }

                if (LOG)
                    console.log("Going to evaluate this value:");
                if (LOG)
                    console.log(incomingValue);

                theFunction.evaluate(incomingValue, true);

                if (theInputPoint.inConnectors.length > 0) {
                    var connector = theInputPoint.inConnectors.pop();
                    connector.contract();
                }

                theInputPoint.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(incomingValue, false, shouldAnimate);
                });

                theInputPoint.inConnectors.push(newInConnection);
                blink(theInputPoint, true, 0.3);

                theInputPoint.set('value', incomingValue);


            },
            'inConnectionRemoved': function (options) {

                var theInputPoint = this;

                if (LOG)
                    console.log("%cIN CONNECTOR", "background:pink; color:black;");

                if (LOG)
                    console.log("Before: ");
                if (LOG)
                    console.log(theInputPoint.inConnectors);

                var removedConnection = options.connector;
                fabric.util.removeFromArray(theInputPoint.inConnectors, removedConnection);

                if (LOG)
                    console.log("After: ");
                if (LOG)
                    console.log(theInputPoint.inConnectors);

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
    inValueUpdated: function (options) {

        var theInputPoint = this;

        var inConnection = options.inConnection;
        var markAsSelected = options.markAsSelected;
        var shouldAnimate = options.shouldAnimate;

        console.log("%cinValueUpdated NUMERICFUNCTIONINPUT class. shouldAnimate: " + shouldAnimate, "background: #AFEEEE; color: black;");


        var updatedValue = inConnection.value;
        var theFunction = theInputPoint.function;

        theFunction.evaluate(updatedValue, shouldAnimate);

        var i;
        for (i = 0; i < theInputPoint.outConnectors.length; i++) {
            theInputPoint.outConnectors[i].setValue(updatedValue, false, shouldAnimate);
        }

        theInputPoint.set('value', updatedValue);

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