var RangeOutput = fabric.util.createClass(fabric.Path, {
    initialize: function (path, options) {
        options || (options = {});
        
        options.fill = rgb(198, 198, 198);
        options.stroke = rgb(66, 66, 66);
        
        this.callSuper('initialize', path, options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('lockMovementX', options.lockMovementX || false);
        this.set('lockMovementY', options.lockMovementY || true);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('hasBorders', options.hasBorders || false);
        this.set('hasControls', options.hasControls || false);
        
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('isRangeOutput', true);
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
    setValue: function (numericValue, refreshCanvas, shouldAnimate) {
        
//        console.log("%c RangeOutput setValue function. shouldAnimate: " + shouldAnimate + ", refreshCanvas: " + refreshCanvas, "background: #4B0082; color: white;");

        var theOutputPoint = this;
        theOutputPoint.value = numericValue;

        if (refreshCanvas) {
            canvas.renderAll();
        }

        var i;
        for (i = 0; i < theOutputPoint.outConnectors.length; i++) {
            theOutputPoint.outConnectors[i].setValue(theOutputPoint.value, false, shouldAnimate);
        }

//      theOutputPoint.outConnectors.forEach(function (outConnector) {
//         outConnector.setValue(theOutputPoint.value, false, shouldAnimate);
//      });

    },
    associateEvents: function () {

        var theOutputPoint = this;

        theOutputPoint.on({
            'moving': function (options) {

                var theOutputPoint = this;
                var event = options.e;
                var canvasCoords = getCanvasCoordinates(event);

                if (theOutputPoint.connecting) {

                    if (event) {
                        var canvasCoords = getCanvasCoordinates(event);
                        var lastAddedConnector = getLastElementOfArray(theOutputPoint.outConnectors);
                        if (lastAddedConnector) {
                            lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                        }
                    }

                } else {

                    var pointer = canvas.getPointer(event);
                    var functionInputCenter = theOutputPoint.getCenterPoint();
                    var pointerRelativeToCenter = {x: pointer.x - functionInputCenter.x, y: pointer.y - functionInputCenter.y};

                    var theGenerator = theOutputPoint.generator;
                    if (theGenerator) {

                        theOutputPoint.inConnectors.forEach(function (inConnector) {
                            inConnector.contract();
                        });

                        var startingX = theGenerator.lowerLimit.getCenterPoint().x - theOutputPoint.width * theOutputPoint.scaleX / 2;
                        var endingX = theGenerator.upperLimit.getCenterPoint().x + theOutputPoint.width * theOutputPoint.scaleX / 2;

                        var left = canvasCoords.x - ((theOutputPoint.width * theOutputPoint.scaleX / 2) + pointerRelativeToCenter.x);
                        var right = canvasCoords.x + ((theOutputPoint.width * theOutputPoint.scaleX / 2) - pointerRelativeToCenter.x);

                        if (left < startingX) {

                            theOutputPoint.lockMovementX = true;
                            theOutputPoint.setPositionByOrigin(new fabric.Point(theGenerator.lowerLimit.getCenterPoint().x, theOutputPoint.top), 'center', 'center');

                        } else if (right > endingX) {

                            theOutputPoint.lockMovementX = true;
                            theOutputPoint.setPositionByOrigin(new fabric.Point(theGenerator.upperLimit.getCenterPoint().x, theOutputPoint.top), 'center', 'center');

                        } else {

                            theOutputPoint.lockMovementX = false;

                        }

                        theOutputPoint.relativeX = theOutputPoint.getPointByOrigin('center', 'center').x - theGenerator.getPointByOrigin('center', 'center').x;

                        theOutputPoint.rangeProportion = Math.abs(theOutputPoint.getCenterPoint().x - theGenerator.lowerLimit.getCenterPoint().x) / Math.abs(theGenerator.upperLimit.getCenterPoint().x - theGenerator.lowerLimit.getCenterPoint().x);

                        theOutputPoint.setCoords();

                        theGenerator.computeOutput(null, false);


                    }

                }

            },
            'mouseup': function (options) {

                var theOutputPoint = this;

                if (theOutputPoint.connecting) {

                    var event = options.e;
                    var canvasCoords = getCanvasCoordinates(event);
                    var coordX = canvasCoords.x;
                    var coordY = canvasCoords.y;

                    var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isOperator', 'isFunctionInput', 'isAggregator', 'isVisualValue', 'isMapperInput', 'isVerticalCollection', 'isMark', 'isNumericFunctionInput']);
                    var lastAddedConnector = getLastElementOfArray(theOutputPoint.outConnectors);

                    if (targetObject) {

                        if (targetObject !== this) {

                            if (targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isMapperInput || targetObject.isNumericFunctionInput || targetObject.isOperator) {

                                lastAddedConnector.setDestination(targetObject, true);

                            } else {

                                if (lastAddedConnector) {
                                    lastAddedConnector.contract();
                                }

                            }

                        } else {
                            var connector = theOutputPoint.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }
                        }

                    } else {

                        var dataType = CreateVisualValueFromValue(lastAddedConnector.value);
                        dataType.top = coordY;
                        dataType.left = coordX;

                        lastAddedConnector.setDestination(dataType, true);

                        canvas.add(dataType);
                        dataType.animateBirth(false, null, null, false);

                        setTimeout(function () {
//                            theOutputPoint.bringToFront();
//                            dataType.bringToFront();
                            bringToFront(theOutputPoint);
                            bringToFront(dataType);
                        }, 50);

                    }

                    theOutputPoint.connecting = false;

                }

                theOutputPoint.lockMovementX = false;
                theOutputPoint.lockMovementY = true;

            },
            'pressed': function (options) {

                var theOutputPoint = this;

                theOutputPoint.connecting = true;

                theOutputPoint.lockMovementX = true;
                theOutputPoint.lockMovementY = true;
                blink(theOutputPoint, true, 0.45);

                var newConnector = new Connector({value: theOutputPoint.value, source: theOutputPoint, x2: theOutputPoint.left, y2: theOutputPoint.top, arrowColor: theOutputPoint.stroke, filledArrow: true, strokeWidth: 1});

                theOutputPoint.outConnectors.push(newConnector);
                canvas.add(newConnector);

            },
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