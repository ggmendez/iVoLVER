var RangeLimit = fabric.util.createClass(fabric.Circle, {
    initialize: function (options) {
        options || (options = {});

        options.radius = 32;
        options.fill = rgb(198, 198, 198);
        options.stroke = rgb(66, 66, 66);
        options.colorForStroke = rgb(66, 66, 66);

        this.callSuper('initialize', options);
        this.set('strokeWidth', options.strokeWidth || 3);
        this.set('originalStrokeWidth', this.strokeWidth);
        this.set('lockMovementX', options.lockMovementX || false);
        this.set('lockMovementY', options.lockMovementY || true);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('hasBorders', options.hasBorders || false);
        this.set('hasControls', options.hasControls || false);

        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('isRangeLimit', true);
        this.set('dataTypeProposition', null);
        this.originX = 'center';
        this.originY = 'center';
        this.set({left: options.left, top: options.top});
        this.setCoords();
        this.associateEvents();
    },
//    applySelectedStyle: function (selectConnectors) {
//
//        this.selected = true;
//        this.stroke = widget_selected_stroke_color;
//        this.strokeDashArray = widget_selected_stroke_dash_array;
//        this.strokeWidth = widget_selected_stroke_width;
//
//        if (selectConnectors) {
//            this.inConnectors.forEach(function (inConnector) {
//                inConnector.opacity = 1;
//                if (!inConnector.source.isOperator) {
//                    inConnector.applySelectedStyle(true, false);
//                } else {
//                    inConnector.source.applySelectedStyle(false);
//                    inConnector.applySelectedStyle(false, false);
//                }
//            });
//            this.outConnectors.forEach(function (outConnector) {
//                outConnector.opacity = 1;
//                if (!outConnector.source.isOperator) {
//                    outConnector.applySelectedStyle(false, true);
//                } else {
//                    outConnector.destination.applySelectedStyle(false);
//                    outConnector.applySelectedStyle(false, false);
//                }
//            });
//        }
//    },
//    applyUnselectedStyle: function (unselectConnectors) {
//        this.selected = false;
//        this.stroke = this.colorForStroke;
//        this.strokeDashArray = [];
//        this.strokeWidth = this.originalStrokeWidth;
//        if (unselectConnectors) {
//            this.inConnectors.forEach(function (inConnector) {
//                inConnector.opacity = canvas.connectorsHidden ? 0 : 1;
//                inConnector.applyUnselectedStyle(false, false);
//            });
//            this.outConnectors.forEach(function (outConnector) {
//                outConnector.opacity = canvas.connectorsHidden ? 0 : 1;
//                outConnector.applyUnselectedStyle(false, false);
//            });
//        }
//
//    },
    removeTypeIcon: function () {
        var theLimit = this;
        if (theLimit.typeIcon && theLimit.typeIcon.canvas) {
            theLimit.typeIcon.remove();
            theLimit.typeIcon = null;
        }
    },
    addTypeIcon: function (iconName, blinkingFactor, doNotBlinkLimit) {

        var theLimit = this;
        var center = theLimit.getCenterPoint();

        var stringPath = icons[iconName].path;
        var icon = new fabric.Path(stringPath, {
            originX: 'center',
            originY: 'center',
            strokeWidth: iconName === "dateAndTime" ? 2.5 : 3,
            stroke: icons[iconName].stroke,
            fill: 'white',
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            opacity: 1,
            permanentOpacity: 1,
            movingOpacity: 1,
            top: center.y,
            left: center.x,
            scaleX: 0.65,
            scaleY: 0.65,
        });
        theLimit.iconName = iconName;
        theLimit.dataTypeProposition = getVisualValuePropositionByIconName(iconName);

        if (!blinkingFactor) {
            blinkingFactor = 0.3;
        }

        theLimit.colorForStroke = icons[iconName].stroke;
        theLimit.stroke = icons[iconName].stroke;
        theLimit.fill = icons[iconName].fill;
        theLimit.typeIcon = icon;
        canvas.add(icon);

        bringToFront(theLimit.typeIcon);

        blink(icon, false, 0.30); // the canvas will be refreshed at some point below this, so no need to refresh it here

        if (!doNotBlinkLimit) {
            blink(theLimit, true, blinkingFactor);
        }

    },
    updateConnectorsPositions: function () {
        updateConnectorsPositions(this);
    },
    setValue: function (value, shouldAnimate, refreshCanvas) {

        if (LOG) {
            console.log("%c RangeLimit setValue function. shouldAnimate: " + shouldAnimate + ", refreshCanvas: " + refreshCanvas, "background: #4B0082; color: white;");
        }

        var theLimit = this;
        theLimit.value = value;

        if (refreshCanvas) {
            canvas.renderAll();
        }

        theLimit.range.updateOtherLimit(theLimit.limitName);

        var i;
        for (i = 0; i < theLimit.outConnectors.length; i++) {
            theLimit.outConnectors[i].setValue(theLimit.value, false, shouldAnimate);
        }

        return true;

    },
    expand: function () {
        var theLimit = this;
        var value = theLimit.value;
        if (value) {
            if (value.isNumericData) {
                showNumericValue(theLimit, true);
            } else if (value.isColorData) {
                showColorChooser(theLimit);
            } else if (value.isDateAndTimeData) {
                showDateAndTimeValue(theLimit, true);
            } else if (value.isDurationData) {
                showDurationValue(theLimit, true);
            }
        }
    },
    associateEvents: function () {

        var theLimit = this;

        theLimit.on({
            'doubleTap': function (options) {
                if (theLimit.value) {
                    theLimit.expand();
                }
            },
            'moving': function (options) {

                var theLimit = this;
                var event = options.e;
                var canvasCoords = getCanvasCoordinates(event);

                if (theLimit.connecting) {

                    if (event) {
                        var canvasCoords = getCanvasCoordinates(event);
                        var lastAddedConnector = getLastElementOfArray(theLimit.outConnectors);
                        if (lastAddedConnector) {
                            lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                        }
                    }

                } else {

                    var pointer = canvas.getPointer(event);
                    var functionInputCenter = theLimit.getCenterPoint();
                    var pointerRelativeToCenter = {x: pointer.x - functionInputCenter.x, y: pointer.y - functionInputCenter.y};

                    var theGenerator = theLimit.generator;
                    if (theGenerator) {

                        theLimit.inConnectors.forEach(function (inConnector) {
                            inConnector.contract();
                        });

                        var startingX = theGenerator.minX.getCenterPoint().x - theLimit.width * theLimit.scaleX / 2;
                        var endingX = theGenerator.maxX.getCenterPoint().x + theLimit.width * theLimit.scaleX / 2;

                        var left = canvasCoords.x - ((theLimit.width * theLimit.scaleX / 2) + pointerRelativeToCenter.x);
                        var right = canvasCoords.x + ((theLimit.width * theLimit.scaleX / 2) - pointerRelativeToCenter.x);

                        if (left < startingX) {

                            theLimit.lockMovementX = true;
                            theLimit.setPositionByOrigin(new fabric.Point(theGenerator.minX.getCenterPoint().x, theLimit.top), 'center', 'center');

                        } else if (right > endingX) {

                            theLimit.lockMovementX = true;
                            theLimit.setPositionByOrigin(new fabric.Point(theGenerator.maxX.getCenterPoint().x, theLimit.top), 'center', 'center');

                        } else {

                            theLimit.lockMovementX = false;

                        }

                        theLimit.relativeX = theLimit.getPointByOrigin('center', 'center').x - theGenerator.getPointByOrigin('center', 'center').x;

                        theLimit.rangeProportion = Math.abs(theLimit.getCenterPoint().x - theGenerator.minX.getCenterPoint().x) / Math.abs(theGenerator.maxX.getCenterPoint().x - theGenerator.minX.getCenterPoint().x);

                        theLimit.setCoords();

                        theGenerator.computeOutput(null, false);


                    }

                }

            },
//            'mouseup': function (options) {
//
//                var theOutputPoint = this;
//
//                if (theOutputPoint.connecting) {
//
//                    var event = options.e;
//                    var canvasCoords = getCanvasCoordinates(event);
//                    var coordX = canvasCoords.x;
//                    var coordY = canvasCoords.y;
//
//                    var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isOperator', 'isFunctionInput', 'isAggregator', 'isVisualValue', 'isMapperInput', 'isVerticalCollection', 'isMark', 'isNumericFunctionInput']);
//                    var lastAddedConnector = getLastElementOfArray(theOutputPoint.outConnectors);
//
//                    if (targetObject) {
//
//                        if (targetObject !== this) {
//
//                            if (targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isMapperInput || targetObject.isNumericFunctionInput || targetObject.isOperator) {
//
//                                lastAddedConnector.setDestination(targetObject, true);
//
//                            } else {
//
//                                if (lastAddedConnector) {
//                                    lastAddedConnector.contract();
//                                }
//
//                            }
//
//                        } else {
//                            var connector = theOutputPoint.outConnectors.pop();
//                            if (connector) {
//                                connector.contract();
//                            }
//                        }
//
//                    } else {
//
//                        var dataType = CreateVisualValueFromValue(lastAddedConnector.value);
//                        dataType.top = coordY;
//                        dataType.left = coordX;
//
//                        lastAddedConnector.setDestination(dataType, true);
//
//                        canvas.add(dataType);
//                        dataType.animateBirth(false, null, null, false);
//
//                        setTimeout(function () {
////                            theOutputPoint.bringToFront();
////                            dataType.bringToFront();
//                            bringToFront(theOutputPoint);
//                            bringToFront(dataType);
//                        }, 50);
//
//                    }
//
//                    theOutputPoint.connecting = false;
//
//                }
//
//                theOutputPoint.lockMovementX = false;
//                theOutputPoint.lockMovementY = true;
//
//            },
//            'pressed': function (options) {
//
//                var theOutputPoint = this;
//
//                theOutputPoint.connecting = true;
//
//                theOutputPoint.lockMovementX = true;
//                theOutputPoint.lockMovementY = true;
//                blink(theOutputPoint, true, 0.45);
//
//                var newConnector = new Connector({value: theOutputPoint.value, source: theOutputPoint, x2: theOutputPoint.left, y2: theOutputPoint.top, arrowColor: theOutputPoint.stroke, filledArrow: true, strokeWidth: 1});
//
//                theOutputPoint.outConnectors.push(newConnector);
//                canvas.add(newConnector);
//
//            },
            'outConnectionRemoved': standarOutConnectionRemovedHandler,
            'inConnectionRemoved': standarInConnectionRemovedHandler,
        });

    },
    updateTypeIcon: function (incommingValue, newInConnection, doNotBlink, shouldAnimate) {

        var theLimit = this;
        var currentValue = theLimit.value;
        var wasEmpty = theLimit.value && typeof theLimit.value !== 'undefined' && theLimit.value !== null;

        var changingType = true;
        if (currentValue) {
            changingType = currentValue.getTypeProposition() !== incommingValue.getTypeProposition();
        }

        if (theLimit.inConnectors.length > 0) {
            var connector = theLimit.inConnectors.pop();
            connector.contract();
        }

        if (newInConnection) {
            theLimit.inConnectors.push(newInConnection);
        }

        if (wasEmpty || changingType) {
            setTimeout(function () {
                theLimit.removeTypeIcon();
                var iconName = getIconNameByVisualValueProposition(incommingValue.getTypeProposition());
                theLimit.range.updateOutputColor(iconName);
                theLimit.addTypeIcon(iconName, 0.45, doNotBlink);
            }, 75);
        }

        // Every time a value is set here, we also have to update the values of the outgoing connections
        theLimit.outConnectors.forEach(function (outConnector) {

            if (LOG) {
                console.log("The value that will be communicated to the connectors' destinations:");
                console.log(theLimit.value);
            }


            outConnector.setValue(theLimit.value.clone(), false, shouldAnimate);
        });

    },
    newInConnection: function (options) {

        var theLimit = this;
        var limitName = theLimit.limitName;
        var theRange = theLimit.range;

        var newInConnection = options.newInConnection;
        var shouldAnimate = options.shouldAnimate;
        var doNotBlink = options.doNotBlink;
        var incommingValue = newInConnection.value;


        if (incommingValue.isStringData || incommingValue.isShapeData) {
            newInConnection.contract();
            alertify.error("Type not supported for ranges", "", 2000);
            setTimeout(function () {
                theLimit.range.positionElements();
            }, 75);
            return;
        } else {


            if (theLimit.setValue(incommingValue, doNotBlink)) {

                theLimit.updateTypeIcon(incommingValue, newInConnection, doNotBlink, shouldAnimate);

            } else {

                alertify.error("Error when trying to set the new value!", "", 2000);
                newInConnection.contract();
                return;

            }

        }

    },
//    _render: function (ctx) {
//        ctx.save();
//        ctx.beginPath();
//        ctx.fillStyle = 'white';
//        ctx.arc(0, 0, this.width / 2, 0, 2 * Math.PI);
//        ctx.fill();
//        ctx.closePath();
//        ctx.restore();
//        this.callSuper('_render', ctx);
//    },
});

VisualValue.call(RangeLimit.prototype);