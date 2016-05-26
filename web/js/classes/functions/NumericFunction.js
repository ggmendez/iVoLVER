var NumericFunction = fabric.util.createClass(fabric.Rect, {
    isNumericFunction: true,
    setXmlIDs: function (from) {
        var theFunction = this;
        theFunction.xmlID = from++;
        theFunction.minX.xmlID = from++;
        theFunction.maxX.xmlID = from++;
        theFunction.minY.xmlID = from++;
        theFunction.maxY.xmlID = from++;
        theFunction.inputPoint.xmlID = from++;
        theFunction.outputPoint.xmlID = from++;
        theFunction.xValues.xmlID = from++;
        theFunction.yValues.xmlID = from++;

        return from;
    },
    toXML: function () {

        var theFunction = this;
        var functionNode = createXMLElement("numericFunction");

        appendElementWithValue(functionNode, "left", theFunction.left);
        appendElementWithValue(functionNode, "top", theFunction.top);
        appendElementWithValue(functionNode, "width", theFunction.width);
        appendElementWithValue(functionNode, "height", theFunction.height);

        var minXNode = theFunction.minX.value.toXML();
        var maxXNode = theFunction.maxX.value.toXML();
        var minYNode = theFunction.minY.value.toXML();
        var maxYNode = theFunction.maxY.value.toXML();

        addAttributeWithValue(minXNode, "xmlID", theFunction.minX.xmlID);
        addAttributeWithValue(maxXNode, "xmlID", theFunction.maxX.xmlID);
        addAttributeWithValue(minYNode, "xmlID", theFunction.minY.xmlID);
        addAttributeWithValue(maxYNode, "xmlID", theFunction.maxY.xmlID);

        addAttributeWithValue(minXNode, "which", "minX");
        addAttributeWithValue(maxXNode, "which", "maxX");
        addAttributeWithValue(minYNode, "which", "minY");
        addAttributeWithValue(maxYNode, "which", "maxY");

        functionNode.append(minXNode);
        functionNode.append(maxXNode);
        functionNode.append(minYNode);
        functionNode.append(maxYNode);

        var inputPoint = theFunction.inputPoint;
        var inputValue = inputPoint.value;
        if (typeof inputValue !== 'undefined') {
            var inputNode = inputValue.toXML();
            addAttributeWithValue(inputNode, "xmlID", inputPoint.xmlID);
            addAttributeWithValue(inputNode, "which", "input");
            functionNode.append(inputNode);
        }

        var outputPoint = theFunction.outputPoint;
        var outputValue = outputPoint.value;
        if (typeof outputValue !== 'undefined') {
            var outputNode = outputValue.toXML();
            addAttributeWithValue(outputNode, "xmlID", outputPoint.xmlID);
            addAttributeWithValue(outputNode, "which", "output");
            functionNode.append(outputNode);
        }

        var coordinatesX = theFunction.coordinatesX;
        if (typeof coordinatesX !== 'undefined') {
            var xCoordinatesNode = createXMLElement("array");
            addAttributeWithValue(xCoordinatesNode, "xmlID", theFunction.xValues.xmlID);
            addAttributeWithValue(xCoordinatesNode, "which", "coordinatesX");
            coordinatesX.forEach(function (coordinate) {
                var valueNode = coordinate.toXML();
                xCoordinatesNode.append(valueNode);
            });
            functionNode.append(xCoordinatesNode);
        }

        var coordinatesY = theFunction.coordinatesY;
        if (typeof coordinatesY !== 'undefined') {
            var yCoordinatesNode = createXMLElement("array");
            addAttributeWithValue(yCoordinatesNode, "xmlID", theFunction.yValues.xmlID);
            addAttributeWithValue(yCoordinatesNode, "which", "coordinatesY");
            theFunction.coordinatesY.forEach(function (coordinate) {
                var valueNode = coordinate.toXML();
                yCoordinatesNode.append(valueNode);
            });
            functionNode.append(yCoordinatesNode);
        }

        return functionNode;
    },
    initialize: function (options) {
        options || (options = {});

        this.defaultHeight = 480;
        this.defaultWidth = 480;
//        this.defaultHeight = 600;
//        this.defaultWidth = 600;
        this.smallIndent = 40;
        this.largeIndent = 30;
        this.tickMarkLength = 10;
        this.valueScale = 0.75;
        this.showIntersection = true;

        this.callSuper('initialize', options);

        this.set('lockScalingX', true);
        this.set('lockScalingY', true);
        this.set('lockRotation', true);

        this.set('hasRotatingPoint', false);
        this.set('hasBorders', false);
        this.set('hasControls', false);
        this.set('transparentCorners', false);
        this.set('perPixelTargetFind', true);

        var d = 4;
        var realWith = options.width || this.defaultWidth;
        if (options.pathWidth) {
            realWith = 2 * this.smallIndent + this.largeIndent + options.pathWidth + 2 * this.smallIndent - d - this.strokeWidth;
        }

        var realHeight = options.height || this.defaultHeight;
        if (options.pathHeight) {
            realHeight = this.height = 2 * this.smallIndent + this.largeIndent + options.pathHeight + 2 * this.smallIndent - d - this.strokeWidth;
        }

        this.set('width', realWith);
        this.set('height', realHeight);

        this.set('fill', options.fill || "rgba(255, 255, 255, 0.5)");
        this.set('stroke', options.stroke || rgb(51, 51, 51));
        this.set('strokeWidth', 3);

        this.set('isCompressed', true);
        this.set('rx', 5);
        this.set('ry', this.rx);

        this.set('originX', 'center');
        this.set('originY', 'center');

        this.set('topElements', new Array());

        this.addNumericLimits(options.values, options.xmlIDs);

        this.addInOutPoints(options.values, options.xmlIDs);

        this.addValuesCollections(options.xmlIDs);

        this.addIntersectionPoint();

        this.associateEvents();

        this.positionElements(false);

        var values = options.values;
        if (values !== null && typeof values !== 'undefined') {
            var input = values.input;
            if (input !== null && typeof input !== 'undefined') {
                var theFunction = this;
                var inputValue = options.values.input;

                console.log("*********inputValue:");
                console.log(inputValue);

                theFunction.evaluate(inputValue, false);
            }
        }


        if (options.xmlIDs) {
            addToConnectableElements(this);
            addToConnectableElements(this.minX);
            addToConnectableElements(this.maxX);
            addToConnectableElements(this.minY);
            addToConnectableElements(this.maxY);
            addToConnectableElements(this.inputPoint);
            addToConnectableElements(this.outputPoint);
            addToConnectableElements(this.xValues);
            addToConnectableElements(this.yValues);
            this.executePendingConnections();
        }

    },
    executePendingConnections: function () {
        var theFunction = this;
        executePendingConnections(theFunction.xmlID);
        executePendingConnections(theFunction.minX.xmlID);
        executePendingConnections(theFunction.maxX.xmlID);
        executePendingConnections(theFunction.minY.xmlID);
        executePendingConnections(theFunction.maxY.xmlID);
        executePendingConnections(theFunction.inputPoint.xmlID);
        executePendingConnections(theFunction.outputPoint.xmlID);
        executePendingConnections(theFunction.xValues.xmlID);
        executePendingConnections(theFunction.yValues.xmlID);
    },
    bringTopElementsToFront: function () {
        var theFunction = this;
        theFunction.bringToFront(true);
        theFunction.setCoords();
        theFunction.topElements.forEach(function (element) {
            if (element.canvas) {
                element.bringToFront(true);
                bringConnectorsToFront(element);
                element.setCoords();
            }
        });
    },
    applySelectedStyle: function () {
        this.selected = true;
    },
    applyUnselectedStyle: function () {
        this.selected = false;
    },
    updateInputPointMovementPermit: function () {
        var theFunction = this;
        theFunction.inputPoint.lockMovementY = theFunction.inCollection.isEmpty();
    },
    updateInputOutputVisualValuePropositions: function () {

        var theFunction = this;

        if (!theFunction.inCollection.isEmpty()) {
            theFunction.inputPoint.dataTypeProposition = theFunction.inCollection.dataTypeProposition;
            theFunction.inputPoint[theFunction.inputPoint.dataTypeProposition] = true;
        }

        if (!theFunction.outCollection.isEmpty()) {
            theFunction.outputPoint.dataTypeProposition = theFunction.outCollection.dataTypeProposition;
            theFunction.outputPoint[theFunction.outputPoint.dataTypeProposition] = true;
        }

    },
    updateInputOutputVisibilityStatus: function () {

        var theFunction = this;

//        if (theFunction.xCoordinates && theFunction.yCoordinates) {
        if (theFunction.coordinatesX && theFunction.coordinatesY) {

            if (!theFunction.inputPoint.opacity) {
                theFunction.inputPoint.opacity = 1;
                theFunction.inputPoint.permanentOpacity = 1;
                theFunction.inputPoint.movingOpacity = 1;
                blink(theFunction.inputPoint, false, 0.3);
                theFunction.inputPoint.selectable = true;
                theFunction.inputPoint.evented = true;
                theFunction.inputPoint.lockMovementX = false;
            }

            if (!theFunction.outputPoint.opacity) {
                theFunction.outputPoint.opacity = 1;
                theFunction.outputPoint.permanentOpacity = 1;
                theFunction.outputPoint.movingOpacity = 1;
                blink(theFunction.outputPoint, false, 0.3);
                theFunction.outputPoint.selectable = true;
                theFunction.outputPoint.evented = true;
            }

        } else {
            theFunction.inputPoint.opacity = 0;
            theFunction.inputPoint.permanentOpacity = 0;
            theFunction.inputPoint.movingOpacity = 0;
            theFunction.inputPoint.selectable = false;
            theFunction.inputPoint.evented = false;

            theFunction.outputPoint.opacity = 0;
            theFunction.outputPoint.permanentOpacity = 0;
            theFunction.outputPoint.movingOpacity = 0;
            theFunction.outputPoint.selectable = false;
            theFunction.outputPoint.evented = false;
        }

    },
    addNumericLimit: function (limitName, numericValue, xmlID) {

        console.log("%c Adding numeric limit with value: ", "background: green; color: black;");
        console.log(numericValue);

        var theFunction = this;

        var numericVisualValue = CreateVisualValueFromValue(numericValue);
        numericVisualValue.xmlID = xmlID;
        numericVisualValue.scaleX = theFunction.valueScale;
        numericVisualValue.scaleY = theFunction.valueScale;
        numericVisualValue.isLimitValue = true;
        numericVisualValue.limitOf = theFunction;
        numericVisualValue.nonSerializable = true;

        canvas.add(numericVisualValue);
        theFunction.set(limitName, numericVisualValue);
        theFunction.topElements.push(numericVisualValue);

//        numericVisualValue.off('mouseup');
        numericVisualValue.off('mousedown');
        numericVisualValue.off('moving');

        var originX = 'right';
        var originY = 'bottom';

        // Assignation of events
        if (limitName === 'minX' || limitName === 'maxX') {
            numericVisualValue.lockMovementY = true;
            if (limitName === 'maxX') {
                originX = 'left';
            }
        } else {
            numericVisualValue.lockMovementX = true;
            if (limitName === 'minY') {
                originY = 'top';
            }
        }

        numericVisualValue.on({
            'moving': function (options) {

                var d = 4;
                if (theFunction.functionPath) {
                    d = theFunction.functionPath.strokeWidth;
                }

                numericVisualValue.setCoords();

                if (limitName === 'minX' || limitName === 'maxX') {

                    if (!numericVisualValue.lockMovementX) {

                        var point = theFunction.getPointByOrigin(originX, originY);
                        var minX = theFunction.minX;
                        var maxX = theFunction.maxX;

                        theFunction.width = 2 * theFunction.smallIndent + theFunction.largeIndent + (Math.abs(maxX.left - minX.left)) + 2 * theFunction.smallIndent - d - theFunction.strokeWidth;

                        theFunction.setPositionByOrigin(new fabric.Point(point.x, point.y), originX, originY);

                        if (theFunction.coordinatesX) {
//                        if (theFunction.xCoordinates) {
                            theFunction.generateScaledCoordinates('x');
                        }

                        theFunction.positionElements();
                        theFunction.setCoords();

                    } else {

                        var theEvent = options.e;
                        if (theEvent) {
                            var canvasCoords = getCanvasCoordinates(theEvent);
                            var lastAddedConnector = getLastElementOfArray(numericVisualValue.outConnectors);
                            lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                        }

                    }


                } else {

                    if (!numericVisualValue.lockMovementY) {

                        var point = theFunction.getPointByOrigin(originX, originY);
                        var minY = theFunction.minY;
                        var maxY = theFunction.maxY;

                        theFunction.height = 2 * theFunction.smallIndent + theFunction.largeIndent + (Math.abs(maxY.getCenterPoint().y - minY.getCenterPoint().y)) + 2 * theFunction.smallIndent - d - theFunction.strokeWidth;

                        theFunction.setPositionByOrigin(new fabric.Point(point.x, point.y), originX, originY);

//                        if (theFunction.yCoordinates) {
                        if (theFunction.coordinatesX) {
                            theFunction.generateScaledCoordinates('y');
                        }

                        theFunction.positionElements();
                        theFunction.setCoords();

                    } else {

                        var theEvent = options.e;
                        if (theEvent) {
                            var canvasCoords = getCanvasCoordinates(theEvent);
                            var lastAddedConnector = getLastElementOfArray(numericVisualValue.outConnectors);
                            lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                        }

                    }


                }


                theFunction.computeOutput(null, false, true);

            },
        });

    },
    addNumericLimits: function (values, xmlIDs) {

        console.log("addNumericLimits FUNCTION:");
        console.log(values);

        var theFunction = this;
        var minXValue = null;
        var maxXValue = null;
        var minYValue = null;
        var maxYValue = null;

        if (values !== null && typeof values !== 'undefined') {
            minXValue = values.minX || new NumericData({unscaledValue: 0});
            maxXValue = values.maxX || new NumericData({unscaledValue: 100});
            minYValue = values.minY || new NumericData({unscaledValue: 0});
            maxYValue = values.maxY || new NumericData({unscaledValue: 100});
        } else {
            minXValue = new NumericData({unscaledValue: 0});
            maxXValue = new NumericData({unscaledValue: 100});
            minYValue = new NumericData({unscaledValue: 0});
            maxYValue = new NumericData({unscaledValue: 100});
        }

        theFunction.addNumericLimit('minX', minXValue, xmlIDs ? xmlIDs['minX'] : null);
        theFunction.addNumericLimit('maxX', maxXValue, xmlIDs ? xmlIDs['maxX'] : null);
        theFunction.addNumericLimit('minY', minYValue, xmlIDs ? xmlIDs['minY'] : null);
        theFunction.addNumericLimit('maxY', maxYValue, xmlIDs ? xmlIDs['maxY'] : null);
    },
    createFunctionPath: function () {
        var theFunction = this;

//        if (theFunction.xCoordinates && theFunction.yCoordinates) {
        if (theFunction.coordinatesX && theFunction.coordinatesY) {


//            theFunction.scaledX = theFunction.scaleCoordiates(theFunction.xCoordinates, 'x');
//            theFunction.scaledY = theFunction.scaleCoordiates(theFunction.yCoordinates, 'y');
            var polyline = new Array();

//            var totalXValues = theFunction.xCoordinates.length;
//            var totalYValues = theFunction.yCoordinates.length;
            var totalXValues = theFunction.coordinatesX.length;
            var totalYValues = theFunction.coordinatesY.length;

            var totalIterations = Math.min(totalXValues, totalYValues);
            for (var i = 0; i < totalIterations; i++) {
                var xValue = theFunction.scaledX[i];
                var yValue = theFunction.scaledY[i];
                polyline.push({x: xValue, y: yValue});
            }
            theFunction.polyline = polyline;
            return polylineToSVGPathString(polyline);
        }
        return null;
    },
    addIntersectionPoint: function () {
        var theFunction = this;
        var intersectionPoint = new fabric.Circle({
            lockMovementX: true,
            lockMovementY: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            evented: false,
            selectable: false,
            originX: 'center',
            originY: 'center',
            radius: 10,
            strokeWidth: 3,
            fill: rgb(246, 190, 52),
            stroke: rgb(205, 148, 9),
        });
        theFunction.intersectionPoint = intersectionPoint;
        theFunction.topElements.push(intersectionPoint);
    },
    addFunctionPath: function (shouldAnimate) {

        var theFunction = this;

        var SVGPathString = theFunction.createFunctionPath();

        if (!SVGPathString) {
            return;
        }

        if (LOG) {
            console.log("SVGPathString:");
            console.log(SVGPathString);
        }

        var functionPath = new fabric.Path(SVGPathString, {
            originX: 'center',
            originY: 'center',
            evented: false,
            selectable: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            fill: '',
            strokeWidth: 4,
            stroke: rgb(0, 153, 255),
            strokeLineJoin: 'round',
            strokeLineCap: 'round',
            opacity: 0,
        });

        if (LOG)
            console.log("functionPath:");
        if (LOG)
            console.log(functionPath);

        var duration = 500;
        var easing = fabric.util.ease['easeOutCubic'];

        var oldFunctionPath = theFunction.functionPath;

        // Removing any existing function path before adding the new one
        if (oldFunctionPath) {

            if (shouldAnimate) {
                oldFunctionPath.animate('opacity', 0, {
                    easing: easing,
                    duration: duration,
                    onComplete: function () {

                    },
                });
            } else {
                oldFunctionPath.remove();
            }

        }

        theFunction.functionPath = functionPath;
        theFunction.topElements.push(theFunction.functionPath);
        canvas.add(functionPath);

        if (shouldAnimate) {

            functionPath.animate('opacity', 1, {
                easing: easing,
                duration: duration,
                onChange: function () {
                    canvas.renderAll();
                },
            });

        } else {

            functionPath.opacity = 1;

        }

        theFunction.positionElements();

        theFunction.computeOutput(null, true, true);



    },
    addValuesCollections: function (xmlIDs) {

        var theFunction = this;

        var collectionXPath = paths['collections'].x;
        var xValues = new FunctionValuesCollection(collectionXPath, {
            scaleX: 0.8,
            scaleY: 0.8,
            numericFunction: theFunction,
            isXValues: true,
            xmlID: xmlIDs ? xmlIDs['coordinatesX'] : null
        });
        theFunction.xValues = xValues;
        theFunction.topElements.push(xValues);
        canvas.add(xValues);

        var collectionYPath = paths['collections'].y;
        var yValues = new FunctionValuesCollection(collectionYPath, {
            scaleX: 0.8,
            scaleY: 0.8,
            numericFunction: theFunction,
            isYValues: true,
            xmlID: xmlIDs ? xmlIDs['coordinatesY'] : null
        });
        theFunction.yValues = yValues;
        theFunction.topElements.push(yValues);
        canvas.add(yValues);

    },
    addInOutPoints: function (values, xmlIDs) {

        var inputValue = null;
        var outputValue = null;

        if (values !== null && typeof values !== 'undefined') {
            inputValue = values.input || new NumericData({unscaledValue: 0}); // What values should be here?????
            outputValue = values.output || new NumericData({unscaledValue: 100});
        } else {
            inputValue = new NumericData({unscaledValue: 0});
            outputValue = new NumericData({unscaledValue: 100});
        }

        var theFunction = this;

        var inputPointPath = paths['input'].rw;
        var inputPoint = new NumericFunctionInput(inputPointPath, {
            evented: false,
            selectable: false,
            angle: 270,
            opacity: 0, // The input point is not visible at the bigining. It will appear when the incollection has values.
            function: theFunction,
            value: inputValue,
            xmlID: xmlIDs ? xmlIDs['input'] : null
        });
        canvas.add(inputPoint);
        theFunction.inputPoint = inputPoint;
        theFunction.topElements.push(inputPoint);

        var outputPointPath = paths['output'].r;
        var outputPoint = new NumericFunctionOutput(outputPointPath, {
            evented: false,
            selectable: false,
            angle: 180,
            opacity: 0, // The output point is not visible at the bigining. It will appear when the outCollection has values
            function: theFunction,
            value: outputValue,
            xmlID: xmlIDs ? xmlIDs['output'] : null
        });
        canvas.add(outputPoint);
        theFunction.set('outputPoint', outputPoint);
        theFunction.topElements.push(outputPoint);

    },
    positionElements: function () {

        var theFunction = this;

        theFunction.setCoords();

        var topLeft = theFunction.getPointByOrigin('left', 'top');
        var bottomRight = theFunction.getPointByOrigin('right', 'bottom');
        var d = 4;
        if (theFunction.functionPath) {
            d = theFunction.functionPath.strokeWidth;
        }

        var minX = theFunction.minX;
        if (minX) {
            minX.left = topLeft.x + 2 * theFunction.smallIndent + theFunction.largeIndent - d / 2;
            minX.top = bottomRight.y - theFunction.smallIndent;
            minX.setCoords();
            updateConnectorsPositions(minX);
        }

        var maxX = theFunction.maxX;
        if (maxX) {
            maxX.left = bottomRight.x - 2 * theFunction.smallIndent + d / 2;
            maxX.top = bottomRight.y - theFunction.smallIndent;
            maxX.setCoords();
            updateConnectorsPositions(maxX);
        }

        var minY = theFunction.minY;
        if (minY) {
            minY.left = topLeft.x + theFunction.smallIndent;
            minY.top = bottomRight.y - 2 * theFunction.smallIndent - theFunction.largeIndent + d / 2;
            minY.setCoords();
            updateConnectorsPositions(minY);
        }

        var maxY = theFunction.maxY;
        if (maxY) {
            maxY.left = topLeft.x + theFunction.smallIndent;
            maxY.top = topLeft.y + 2 * theFunction.smallIndent - d / 2;
            maxY.setCoords();
            updateConnectorsPositions(maxY);
        }

        var inputPoint = theFunction.inputPoint;
        if (inputPoint) {
            var x = Math.min(minX.left, maxX.left) + Math.abs(maxX.left - minX.left) / 2;
            var y = bottomRight.y - 2 * theFunction.smallIndent;
            if (inputPoint.rangeProportion != null) {

                if (LOG)
                    console.log("inputPoint.rangeProportion:");
                if (LOG)
                    console.log(inputPoint.rangeProportion);

                x = minX.getCenterPoint().x + (Math.abs(maxX.getCenterPoint().x - minX.getCenterPoint().x) * inputPoint.rangeProportion);
                if (LOG)
                    console.log("x:");
                if (LOG)
                    console.log(x);
            }
            inputPoint.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
            inputPoint.setCoords();

            inputPoint.relativeX = inputPoint.getPointByOrigin('center', 'center').x - theFunction.getPointByOrigin('center', 'center').x;

            updateConnectorsPositions(inputPoint);
        }

        var outputPoint = theFunction.outputPoint;
        if (outputPoint) {
            var x = topLeft.x + 2 * theFunction.smallIndent;
            var y = Math.min(minY.top, maxY.top) + Math.abs(maxY.top - minY.top) / 2;
            if (outputPoint.rangeProportion != null) {
                y = maxY.getCenterPoint().y + (Math.abs(maxY.getCenterPoint().y - minY.getCenterPoint().y) * outputPoint.rangeProportion);

            }

            outputPoint.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
            outputPoint.setCoords();
            updateConnectorsPositions(outputPoint);
        }

        var xValues = theFunction.xValues;
        if (xValues) {
            xValues.left = bottomRight.x - theFunction.smallIndent + 2 + d / 2;
            xValues.top = bottomRight.y - 2 * theFunction.smallIndent;
            xValues.setCoords();
            updateConnectorsPositions(xValues);
        }

        var yValues = theFunction.yValues;
        if (yValues) {
            yValues.left = topLeft.x + 2 * theFunction.smallIndent;
            yValues.top = topLeft.y + theFunction.smallIndent - 2 - d / 2;
            yValues.setCoords();
            updateConnectorsPositions(yValues);
        }

        var functionPath = theFunction.functionPath;
        if (functionPath) {

            var canvasWidth = Math.abs(maxX.left - minX.left);
            var canvasHeight = Math.abs(maxY.top - minY.top);

            var x = Math.min(minX.left, maxX.left) + canvasWidth / 2;
            var y = Math.min(minY.top, maxY.top) + canvasHeight / 2;

            functionPath.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
            functionPath.setCoords();
        }

        if (theFunction.showIntersection) {
            theFunction.positionIntersectionPoint();
        }


        theFunction.setCoords();
    },
    expand: function () {
        var theFunction = this;
        if (!theFunction.isCompressed) {
            return;
        }
        if (LOG) {
            console.log("Still to be implemented");
        }
        theFunction.isCompressed = false;
    },
    compress: function () {
        var theFunction = this;
        if (theFunction.isCompressed) {
            return;
        }
        theFunction.isCompressed = false;
        if (LOG) {
            console.log("Still to be implemented");
        }
    },
    associateEvents: function () {
        var theFunction = this;
        theFunction.on({
            'moving': function (options) {
                theFunction.setCoords();
                theFunction.positionElements(true);
            },
            'doubleTap': function (options) {
                options.event.preventDefault();
                if (theFunction.isCompressed) {
                    theFunction.expand(true);
                } else {
                    theFunction.compress(true);
                }
            },
            'limitChanged': function (options) {
                var visualValue = options.visualValue;
                var shouldAnimate = options.shouldAnimate;
                theFunction.computeOutput(null, true, true);
            },
            'collectionElementMoved': function (options) {

                if (LOG)
                    console.log("collectionElementMoved 2565");

                var theCollection = options.collection;
                var movedElement = options.movedElement;

                var theOtherCollection = null;
                if (theCollection.isNumericFunctionInCollection) {
                    theOtherCollection = theCollection.mapper.outCollection;
                } else {
                    theOtherCollection = theCollection.mapper.inCollection;
                }

                theCollection.matchingY = movedElement.relativeY + (movedElement.scaleY * movedElement.height / 2);

                if (theOtherCollection) {

                    theOtherCollection.matchingY = movedElement.relativeY + (movedElement.scaleY * movedElement.height / 2);

                }

                theFunction.computeOutput(null, false, true);


            },
            'collectionElementManipulationStopped': function (options) {

                var theCollection = options.collection;
                var movedElement = options.movedElement;

                var theOtherCollection = null;
                if (theCollection.isNumericFunctionInCollection) {
                    theOtherCollection = theCollection.mapper.outCollection;
                } else {
                    theOtherCollection = theCollection.mapper.inCollection;
                }

                theFunction.computeOutput(null, false, true);

            },
            'collectionValueChanged': function (options) {

                var theFunction = this;

                var theCollection = options.collection;
                var changedVisualValue = options.visualValue;

                theFunction.computeOutput(null, false, true);


            },
        });
    },
    updateLimits: function () {
        var theFunction = this;
//        if (theFunction.xCoordinates) {
        if (theFunction.coordinatesX) {
            var f = function (numericValue) {
                return numericValue.number;
            };
//            var minXNumber = Math.min.apply(Math, theFunction.xCoordinates.map(f));
//            var maXNumber = Math.max.apply(Math, theFunction.xCoordinates.map(f));
            var minXNumber = Math.min.apply(Math, theFunction.coordinatesX.map(f));
            var maXNumber = Math.max.apply(Math, theFunction.coordinatesX.map(f));
            var minXValue = createNumericValue(minXNumber);
            var maxXValue = createNumericValue(maXNumber);
            theFunction.minX.setValue(minXValue);
            theFunction.maxX.setValue(maxXValue);
        }
//        if (theFunction.yCoordinates) {
        if (theFunction.coordinatesY) {
//            var minYNumber = Math.min.apply(Math, theFunction.yCoordinates.map(function (yValue) {
            var minYNumber = Math.min.apply(Math, theFunction.coordinatesY.map(function (yValue) {
                return yValue.number;
            }));
//            var maYNumber = Math.max.apply(Math, theFunction.yCoordinates.map(function (yValue) {
            var maYNumber = Math.max.apply(Math, theFunction.coordinatesY.map(function (yValue) {
                return yValue.number;
            }));
            var minYValue = createNumericValue(minYNumber);
            var maxYValue = createNumericValue(maYNumber);
            theFunction.minY.setValue(minYValue);
            theFunction.maxY.setValue(maxYValue);
        }
    },
    updateFunctionPath: function () {
        var theFunction = this;
        var functionPath = theFunction.functionPath;
        var polyline = new Array();
        var i = 0;
        var points = functionPath.path;
        points.forEach(function (point) {
            var x = theFunction.scaledX[i];
            var y = theFunction.scaledY[i];
            point[1] = x;
            point[2] = y;
            polyline.push({x: x, y: y});
            i++;
        });
        theFunction.polyline = polyline;
        updatePathCoords(functionPath);
    },
    generateScaledCoordinates: function (coordinate) {
        var theFunction = this;
        if (coordinate === 'x') {
//            theFunction.scaledX = theFunction.scaleCoordiates(theFunction.xCoordinates, 'x');
            theFunction.scaledX = theFunction.scaleCoordiates(theFunction.coordinatesX, 'x');
            if (LOG)
                console.log("Scaling X coordinates:");
            if (LOG)
                console.log(theFunction.scaledX);
        } else {
//            theFunction.scaledY = theFunction.scaleCoordiates(theFunction.yCoordinates, 'y');
            theFunction.scaledY = theFunction.scaleCoordiates(theFunction.coordinatesY, 'y');
            if (LOG)
                console.log("Scaling Y coordinates:");
            if (LOG)
                console.log(theFunction.scaledY);
        }
        // Every time the scaling occurs, the path should be updated
        theFunction.updateFunctionPath();
    },
    scaleCoordiates: function (coordinates, coordinate) {

        if (LOG)
            console.log("Before scaling " + coordinate + " coordinates: ");
        if (LOG)
            console.log(coordinates);

        var theFunction = this;

        var numbers = new Array();
        coordinates.forEach(function (value) {
            numbers.push(value.number);
        });

        var oldMin = getArrayMin(numbers);
        var oldMax = getArrayMax(numbers);
        var newMin = theFunction.minX.getCenterPoint().x;
        var newMax = theFunction.maxX.getCenterPoint().x;
        if (coordinate === 'y') {
            newMin = theFunction.minY.getCenterPoint().y;
            newMax = theFunction.maxY.getCenterPoint().y;
        }
        var scaledCoordinates = changeRangeToArray(numbers, oldMin, oldMax, newMin, newMax);

        /*if (LOG) console.log("scaledCoordinates:");
         if (LOG) console.log(scaledCoordinates);*/

        return scaledCoordinates;
    },
    setBothCoordinates: function (xCoordinates, yCoordinates, shouldAnimate) {

        var theFunction = this;
        if ($.isArray(xCoordinates) && $.isArray(yCoordinates)) {

        } else {
            return false;
        }

//        theFunction.xCoordinates = xCoordinates;
//        theFunction.yCoordinates = yCoordinates;
        theFunction.coordinatesX = xCoordinates;
        theFunction.coordinatesY = yCoordinates;

        theFunction.updateLimits();
        theFunction.updateInputOutputVisibilityStatus();
//        theFunction.scaledX = theFunction.scaleCoordiates(theFunction.xCoordinates, 'x');
//        theFunction.scaledY = theFunction.scaleCoordiates(theFunction.yCoordinates, 'y');
        theFunction.scaledX = theFunction.scaleCoordiates(theFunction.coordinatesX, 'x');
        theFunction.scaledY = theFunction.scaleCoordiates(theFunction.coordinatesY, 'y');
        theFunction.addFunctionPath(shouldAnimate);

        return true;

    },
    // the parameter 'coordinate' should either be x or y
    setCoordinates: function (coordinates, coordinate, shouldAnimate) {

//        var comparator = getCoordinateComparator(coordinate);
//        coordinates.sort(comparator);

        var theFunction = this;
        if ($.isArray(coordinates)) {



//            theFunction[coordinate + 'Coordinates'] = coordinates;



            theFunction['coordinates' + coordinate.toUpperCase()] = coordinates;



            if (coordinate === 'y' && (!theFunction.coordinatesX || !theFunction.xValues.inConnectors.length)) {
//            if (coordinate === 'y' && (!theFunction.xCoordinates || !theFunction.xValues.inConnectors.length)) {

                var xCoordinates = new Array();

                var totalYs = coordinates.length;
                for (var i = 0; i < totalYs; i++) {
                    xCoordinates.push(createNumericValue(i));
                }

                theFunction.setCoordinates(xCoordinates, 'x');

            }

        } else {
            return false;
        }

        theFunction.updateLimits();

        theFunction.updateInputOutputVisibilityStatus();

        if (theFunction.coordinatesX && theFunction.coordinatesY) {
//        if (theFunction.xCoordinates && theFunction.yCoordinates) {

//            theFunction.scaledX = theFunction.scaleCoordiates(theFunction.xCoordinates, 'x');
//            theFunction.scaledY = theFunction.scaleCoordiates(theFunction.yCoordinates, 'y');

            theFunction.scaledX = theFunction.scaleCoordiates(theFunction.coordinatesX, 'x');
            theFunction.scaledY = theFunction.scaleCoordiates(theFunction.coordinatesY, 'y');

            theFunction.addFunctionPath(shouldAnimate);
        }

        return true;
    },
    evaluateSingleValue: function (value) {

        var theFunction = this;

        if (LOG)
            console.log("********************************************************************************************************************");
        if (LOG)
            console.log("********************************************************************************************************************");
        if (LOG)
            console.log("%cEvaluating this single value for this function:", "background: " + theFunction.fill);
        if (LOG)
            console.log(value);

        var oldMin = theFunction.minX.value.number;
        var oldMax = theFunction.maxX.value.number;
        var newMin = theFunction.minX.getCenterPoint().x;
        var newMax = theFunction.maxX.getCenterPoint().x;

        var newX = changeRange(value.number, oldMin, oldMax, newMin, newMax);

        return newX;

    },
    evaluate: function (value, shouldAnimate) {

        var theFunction = this;

        console.log("%cevaluate function NUMERICFUNCTION class. shouldAnimate: " + shouldAnimate, "background: #FF6347; color black;");


        if ($.isArray(value)) {

            // Each of the elements of the received array has to be evaluated. The output of this process should be an array of values

            var outputNumbers = new Array();
            var minY = getArrayMin(theFunction.scaledY);
            var maxY = getArrayMax(theFunction.scaledY);

            value.forEach(function (currentValue) {

                var currentEvaluationResult = theFunction.evaluateSingleValue(currentValue);

                if (LOG)
                    console.log("currentEvaluationResult:");
                if (LOG)
                    console.log(currentEvaluationResult);

                var absoluteTop = theFunction.computeOutput(currentEvaluationResult);
                var outputNumber = changeRange(theFunction.intersection.y, minY, maxY, theFunction.maxY.value.number, theFunction.minY.value.number);

                outputNumbers.push(outputNumber);
            });


            var outputValues = createNumericValues(outputNumbers);
            theFunction.outputPoint.setValue(outputValues, shouldAnimate);

            if (LOG)
                console.log("////////////////////////// outputNumber: //////////////////////////");
            if (LOG)
                console.log(outputNumbers);

            if (LOG)
                console.log("////////////////////////// outputNumber: //////////////////////////");
            if (LOG)
                console.log(outputValues);


            var outputPoint = theFunction.outputPoint;
            var inputPoint = theFunction.inputPoint;

            var duration = 500;
            var easing = fabric.util.ease['easeOutCubic'];

            // Moving the output point to the mid position between the min and max Y elements
            var startValue1 = outputPoint.top;
            var endValue1 = Math.min(theFunction.minY.top, theFunction.maxY.top) + Math.abs(theFunction.maxY.top - theFunction.minY.top) / 2;
            onCompleteFunction = function () {
                outputPoint.top = endValue1;
                outputPoint.rangeProportion = null;
            }
            animateProperty(outputPoint, 'top', startValue1, endValue1, easing, duration, false, onCompleteFunction);

            // Moving the output point to the mid position between the min and max Y elements
            var startValue2 = inputPoint.left;
            var endValue2 = Math.min(theFunction.minX.left, theFunction.maxX.left) + Math.abs(theFunction.maxX.left - theFunction.minX.left) / 2;
            onCompleteFunction = function () {
                inputPoint.left = endValue2;
                inputPoint.rangeProportion = null;
            };
            animateProperty(inputPoint, 'left', startValue2, endValue2, easing, duration, true, onCompleteFunction);





        } else {

            // A single value is received. The value resulting from this evaluation process will be another single value
            var evaluationResult = theFunction.evaluateSingleValue(value);



            var theInputPoint = theFunction.inputPoint;

            if (shouldAnimate) {
                var duration = 500;
                var easing = fabric.util.ease['easeOutCubic'];
                theInputPoint.animate('left', evaluationResult, {
                    easing: easing,
                    duration: duration,
                    onChange: function () {
                        theInputPoint.relativeX = theInputPoint.getPointByOrigin('center', 'center').x - theFunction.getPointByOrigin('center', 'center').x;
                        theInputPoint.rangeProportion = Math.abs(theInputPoint.getCenterPoint().x - theFunction.minX.getCenterPoint().x) / Math.abs(theFunction.maxX.getCenterPoint().x - theFunction.minX.getCenterPoint().x);
                        theFunction.computeOutput(null, false, true); // true here because the function will position the output point AND will communicate the output value though the outgoing connectios that it has
                        updateConnectorsPositions(theInputPoint);
                    },
                });
            } else {
                theInputPoint.left = evaluationResult;
                theInputPoint.relativeX = theInputPoint.getPointByOrigin('center', 'center').x - theFunction.getPointByOrigin('center', 'center').x;
                theInputPoint.rangeProportion = Math.abs(theInputPoint.getCenterPoint().x - theFunction.minX.getCenterPoint().x) / Math.abs(theFunction.maxX.getCenterPoint().x - theFunction.minX.getCenterPoint().x);
                theFunction.computeOutput(null, shouldAnimate, true); // true here because the function will position the output point AND will communicate the output value though the outgoing connectios that it has
                updateConnectorsPositions(theInputPoint);
            }








        }

    },
    positionIntersectionPoint: function () {

        var theFunction = this;
        var minX = getArrayMin(theFunction.scaledX);
        var maxX = getArrayMax(theFunction.scaledX);
        var minY = getArrayMin(theFunction.scaledY);
        var maxY = getArrayMax(theFunction.scaledY);

        var intersection = theFunction.intersection;
        if (intersection) {
            var intersectionPoint = theFunction.intersectionPoint;
            if (!intersectionPoint.canvas) {
                canvas.add(intersectionPoint);
            }
//            intersectionPoint.bringToFront();
            bringToFront(intersectionPoint);
            theFunction.intersectionPoint.top = changeRange(intersection.y, minY, maxY, theFunction.maxY.top, theFunction.minY.top);
            theFunction.intersectionPoint.left = changeRange(intersection.x, minX, maxX, theFunction.minX.left, theFunction.maxX.left);
        }

    },
    positionOutputPoint: function (functionY, shouldAnimate) {

        console.log("%c positionOutputPoint function NUMERICFUNCTION class. shouldAnimate: " + shouldAnimate, "background: #FFB6C1; color: black;");

        var theFunction = this;
        var theOutputPoint = theFunction.outputPoint;

        var minY = getArrayMin(theFunction.scaledY);
        var maxY = getArrayMax(theFunction.scaledY);

        var top = changeRange(functionY, minY, maxY, theFunction.maxY.top, theFunction.minY.top);

        theOutputPoint.top = top;
        theOutputPoint.setCoords();
        updateConnectorsPositions(theOutputPoint);

        var outputNumber = changeRange(theFunction.intersection.y, minY, maxY, theFunction.maxY.value.number, theFunction.minY.value.number);

        var outputNumericValue = createNumericValue(outputNumber);

        theOutputPoint.setValue(outputNumericValue, shouldAnimate);

        theOutputPoint.rangeProportion = Math.abs(theOutputPoint.getCenterPoint().y - theFunction.maxY.getCenterPoint().y) / Math.abs(theFunction.maxY.getCenterPoint().y - theFunction.minY.getCenterPoint().y);

    },
    computeOutput: function (inputXCoordinate, shouldAnimate, positionOutputPoint) {

        console.log("%c computeOutput NUMERICFUNCTION class. shouldAnimate: " + shouldAnimate, "background: #FAFAD2; color: black;");

        if (LOG)
            console.log("inputXCoordinate:");
        if (LOG)
            console.log(inputXCoordinate);

        var theFunction = this;
        var updateInputValue = false;


        theFunction.showIntersection = positionOutputPoint;

        if (!theFunction.functionPath) {
            if (LOG)
                console.log("No function found...");
            return;
        }

        if (LOG)
            console.log("theFunction.inputPoint.relativeX:");
        if (LOG)
            console.log(theFunction.inputPoint.relativeX);

        var functionPathLeftTop = theFunction.functionPath.getPointByOrigin('left', 'top');
        if (inputXCoordinate === null) {

            updateInputValue = true;

            inputXCoordinate = theFunction.inputPoint.getCenterPoint().x - functionPathLeftTop.x - theFunction.functionPath.strokeWidth / 2;

        } else {
            inputXCoordinate = inputXCoordinate - functionPathLeftTop.x - theFunction.functionPath.strokeWidth / 2;
        }

        if (isNaN(inputXCoordinate)) {
            return;
        }

        /*if (LOG) console.log("theFunction.scaledX:");
         if (LOG) console.log(theFunction.scaledX);
         
         if (LOG) console.log("inputXCoordinate:");
         if (LOG) console.log(inputXCoordinate);*/

        var minX = getArrayMin(theFunction.scaledX);
        var minY = getArrayMin(theFunction.scaledY);
        var maxY = getArrayMax(theFunction.scaledY);

        if (theFunction.polyline) {

            var scaledX = inputXCoordinate + minX;

            /*drawRectAt(new fabric.Point(scaledX, maxY), "green");*/

            /*if (LOG) console.log("scaledX:");
             if (LOG) console.log(scaledX);*/

            var line = {x1: scaledX, x2: scaledX, y1: minY, y2: maxY};

            /*drawRectAt(new fabric.Point(scaledX, minY), "red");
             drawRectAt(new fabric.Point(scaledX, maxY), "blue");*/

            theFunction.intersection = getPathLineIntersection(theFunction.polyline, line);

            if (LOG)
                console.log("theFunction.intersection:");
            if (LOG)
                console.log(theFunction.intersection);

            if (theFunction.intersection) {

                var functionY = theFunction.intersection.y;

                if (positionOutputPoint) {
                    theFunction.positionOutputPoint(functionY, shouldAnimate);
                    theFunction.positionIntersectionPoint();
                } else {
                    var intersectionPoint = theFunction.intersectionPoint;
                    if (intersectionPoint.canvas) {
                        intersectionPoint.remove();
                    }
                }





                if (updateInputValue) {

                    var intersection = theFunction.intersection;
                    var minX = getArrayMin(theFunction.scaledX);
                    var maxX = getArrayMax(theFunction.scaledX);

                    var unscaledValue = changeRange(intersection.x, minX, maxX, theFunction.minX.value.number, theFunction.maxX.value.number);
                    
                    
                    console.log("unscaledValue:");
                    console.log(unscaledValue);
                    
                    
                    var inPrefix = '';
                    var outPrefix = theFunction.inputPoint.value.outPrefix || '';
                    var units = theFunction.inputPoint.value.units || '';
//                    var value = createNumericValue(unscaledValue, inPrefix, outPrefix, units);

                    var value = createNumericValue(unscaledValue);
                    
                    var inputPoint = theFunction.inputPoint;
                    inputPoint.value = value;
                    var i;
                    for (i = 0; i < inputPoint.outConnectors.length; i++) {
                        inputPoint.outConnectors[i].setValue(value, false, shouldAnimate);
                    }

                }




                return functionY;

            } else {

                return null;
            }

        } else {

            var intersectionPoint = theFunction.intersectionPoint;
            if (intersectionPoint.canvas) {
                intersectionPoint.remove();
            }

        }





    },
    _render: function (ctx) {

        var theFunction = this;

        var arrowIndent = 8;
        var arrowHeight = 6;
        var d = 4;
        if (theFunction.functionPath) {
            d = theFunction.functionPath.strokeWidth;
        }

        ctx.save();
        theFunction.callSuper('_render', ctx);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Horizontal line
        var x1 = -theFunction.width / 2 + 2 * theFunction.smallIndent + theFunction.largeIndent - d;
        var y1 = theFunction.height / 2 - 2 * theFunction.smallIndent + d;
        var x2 = theFunction.width / 2 - 2 * theFunction.smallIndent + d;
        ctx.moveTo(x1 - 1, y1);
        ctx.lineTo(x2 + arrowIndent, y1);

        // x left tick mark
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y1 + theFunction.tickMarkLength);

        // x right tick mark
        ctx.moveTo(x2, y1);
        ctx.lineTo(x2, y1 + theFunction.tickMarkLength);

        // Vertical line
        var x3 = -theFunction.width / 2 + 2 * theFunction.smallIndent - d;
        var y2 = -theFunction.height / 2 + 2 * theFunction.smallIndent - d;
        var y3 = theFunction.height / 2 - 2 * theFunction.smallIndent - theFunction.largeIndent + d;
        ctx.moveTo(x3, y2 - arrowIndent);
        ctx.lineTo(x3, y3 + 1);

        // y top tick mark
        ctx.moveTo(x3, y2);
        ctx.lineTo(x3 - theFunction.tickMarkLength, y2);

        // y bottom tick mark
        ctx.moveTo(x3, y3);
        ctx.lineTo(x3 - theFunction.tickMarkLength, y3);

        ctx.stroke();
        ctx.closePath();
        ctx.restore();


        // x axis arrow
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        var xArrow = x2 + arrowIndent;
        ctx.moveTo(xArrow, y1);
        ctx.lineTo(xArrow, y1 - arrowHeight / 2);
        ctx.lineTo(xArrow + arrowHeight, y1);
        ctx.lineTo(xArrow, y1 + arrowHeight / 2);
        ctx.lineTo(xArrow, y1);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        // y axis arrow
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.fillStyle = "black";
        var yArrow = y2 - arrowIndent;
        ctx.moveTo(x3, yArrow);
        ctx.lineTo(x3 - arrowHeight / 2, yArrow);
        ctx.lineTo(x3, yArrow - arrowHeight);
        ctx.lineTo(x3 + arrowHeight / 2, yArrow);
        ctx.lineTo(x3, yArrow);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();


        // square where the function is drawn
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "rgba(240, 240, 240, 0.5)";
        ctx.strokeStyle = rgb(25, 25, 25);
        ctx.lineWidth = 1;
        ctx.rect(x1, y2, Math.abs(x2 - x1), Math.abs(y3 - y2));
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        // Thickmarks
        /*var minimunThickMarkSeparation = 20;
         ctx.save();
         ctx.beginPath();
         ctx.strokeStyle = rgb(2, 128, 204);
         ctx.lineWidth = 2;
         
         
         // x-axis
         if (theFunction.scaledX && theFunction.scaledX.length >= 3) {
         var horizontalThickMarkSeparation = Math.abs(theFunction.maxX.left - theFunction.minX.left) / theFunction.scaledX.length - 1;
         if (horizontalThickMarkSeparation >= minimunThickMarkSeparation) {
         var minScaledX = getArrayMin(theFunction.scaledX);
         for (var i = 1; i < theFunction.scaledX.length - 1; i++) {
         var xValue = theFunction.scaledX[i];
         var localX = x1 + (xValue - minScaledX);
         ctx.moveTo(localX, y1 + 1);
         ctx.lineTo(localX, y1 + 8);
         }
         }
         }
         // y-axis
         if (theFunction.scaledY && theFunction.scaledY.length >= 3) {
         var maxY = getArrayMax(theFunction.scaledY);
         var minY = getArrayMin(theFunction.scaledY);
         var verticalThickMarkSeparation = Math.abs(theFunction.maxY.top - theFunction.minY.top) / theFunction.scaledY.length - 1;
         if (verticalThickMarkSeparation >= minimunThickMarkSeparation) {
         for (var i = 0; i < theFunction.scaledY.length; i++) {
         var yValue = theFunction.scaledY[i];
         if (yValue !== maxY && yValue !== minY) {
         var localY = y2 + (yValue - minY);
         ctx.moveTo(x3 - 1, localY);
         ctx.lineTo(x3 - 8, localY);
         }
         }
         }
         }
         ctx.stroke();
         ctx.closePath();
         ctx.restore();*/

        // vertical line indicating the horizontal position of the input
        var inputPoint = theFunction.inputPoint;
        if (inputPoint && inputPoint.relativeX) {

            var x = inputPoint.relativeX;

            var intersection = theFunction.intersection;

            if (theFunction.showIntersection && intersection) {

                var minScaledX = getArrayMin(theFunction.scaledX);
                var minScaledY = getArrayMin(theFunction.scaledY);

                var intersectionX = x1 + (intersection.x - minScaledX);
                var intersectionY = y2 + (intersection.y - minScaledY);

                // Vertical line from the input point to the point where this line intersects the function
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = rgb(216, 152, 7);
                ctx.lineWidth = 1.5;
                ctx.setLineDash([8, 8]);
                ctx.moveTo(x, y3);
                ctx.lineTo(x, intersectionY);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();

                // Horizontal line from the point where this line intersects the function to the output point
                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = rgb(216, 152, 7);
                ctx.lineWidth = 1.5;
                ctx.setLineDash([8, 8]);
                ctx.moveTo(x, intersectionY);
                ctx.lineTo(x1, intersectionY);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();

                var minX = getArrayMin(theFunction.scaledX);
                var maxX = getArrayMax(theFunction.scaledX);
                var minY = getArrayMin(theFunction.scaledY);
                var maxY = getArrayMax(theFunction.scaledY);

                var displayableX = changeRange(intersection.x, minX, maxX, theFunction.minX.value.number, theFunction.maxX.value.number).toFixed(2);
                var displayableY = changeRange(intersection.y, minY, maxY, theFunction.maxY.value.number, theFunction.minY.value.number).toFixed(2);

                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.font = "16px sans-serif";
                ctx.fillStyle = rgb(0, 0, 0);
                ctx.fillText("(" + displayableX + " , " + displayableY + ")", intersectionX + 15, intersectionY);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
                
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.textAlign="center"; 
                ctx.font = "16px sans-serif";
                ctx.fillStyle = rgb(0, 0, 0);
                ctx.fillText(displayableX, intersectionX, y3 + 70);                
                ctx.textAlign="end"; 
                ctx.fillText(displayableY, x1 - 55, intersectionY + 7);
                ctx.fill();
                ctx.stroke();
                ctx.closePath();
                ctx.restore();



            }



        }

    }


});

function addNumericFunction(options) {

    console.log("###################################### options to create a new NUMERIC FUNCTION");
    console.log(options);

    var theFunction = new NumericFunction(options);
    canvas.add(theFunction);

    var shouldAnimate = false;

    if (options.coordinatesX && options.coordinatesY) {

        if (typeof options.coordinatesX[0] === "number") {

            var functionCoordinates = createFunctionCoordinatesFromValues(options.coordinatesX, options.coordinatesY);
            theFunction.setBothCoordinates(functionCoordinates.XCoordinates, functionCoordinates.YCoordinates, shouldAnimate);

        } else {
            theFunction.setBothCoordinates(options.coordinatesX, options.coordinatesY, shouldAnimate);
        }
    }

    if (options.values) {
        theFunction.minX.setValue(options.values.minX, true, false);
        theFunction.maxX.setValue(options.values.maxX, true, false);
        theFunction.minY.setValue(options.values.minY, true, false);
        theFunction.maxY.setValue(options.values.maxY, true, false);
    }



    theFunction.bringTopElementsToFront();

    if (!options.doNotAnimateAtBirth) {
        if (theFunction.functionPath) {
            blink(theFunction.functionPath, false, 0.3);
        }
        blink(theFunction.xValues, false, 0.3);
        blink(theFunction.yValues, false, 0.3);
        blink(theFunction.inputPoint, false, 0.3);
        blink(theFunction.outputPoint, false, 0.3);
        blink(theFunction.minX, false, 0.3);
        blink(theFunction.maxX, false, 0.3);
        blink(theFunction.minY, false, 0.3);
        blink(theFunction.maxY, false, 0.3);
        blink(theFunction, true, 0.1);
    }

    if (theFunction.intersectionPoint && theFunction.intersectionPoint.canvas) {
//        theFunction.intersectionPoint.bringToFront();
        bringToFront(theFunction.intersectionPoint);
        blink(theFunction.intersectionPoint, false, 0.3);
    }

}



/*function addNumericFunction(x, y, coordinatesX, coordinatesY, otherOptions) {
 
 var functionOptions = {
 left: x,
 top: y,
 coordinatesX: coordinatesX,
 coordinatesY: coordinatesY
 }
 
 for (var prop in otherOptions) {
 functionOptions[prop] = otherOptions[prop];
 }
 
 addNumericFunctionWithOptions(functionOptions);
 
 }*/


function createFunctionCoordinatesFromValues(XValues, YValues) {
    var XCoordinates = createNumericValues(XValues);
    var YCoordinates = createNumericValues(YValues);
    return {XCoordinates: XCoordinates, YCoordinates: YCoordinates};
}

function createNumericValues(array) {
    var numericValues = new Array();
    array.forEach(function (value) {
        numericValues.push(createNumericValue(value));
    });
    return numericValues;
}

function getLinealFunctionCoordinates() {

    var XValues = [0, 100];
    var YValues = [0, 100];

    return createFunctionCoordinatesFromValues(XValues, YValues);
}

function getQuadraticFunctionCoordinates() {

    var XValues = [-10, -9.5, -9, -8.5, -8, -7.5, -7, -6.5, -6, -5.5, -5, -4.5, -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
    var YValues = [100, 90.25, 81, 72.25, 64, 56.25, 49, 42.25, 36, 30.25, 25, 20.25, 16, 12.25, 9, 6.25, 4, 2.25, 1, 0.25, 0, 0.25, 1, 2.25, 4, 6.25, 9, 12.25, 16, 20.25, 25, 30.25, 36, 42.25, 49, 56.25, 64, 72.25, 81, 90.25, 100];

    return createFunctionCoordinatesFromValues(XValues, YValues);
}

function getCubicFunctionCoordinates() {

    var XValues = [-10, -9.5, -9, -8.5, -8, -7.5, -7, -6.5, -6, -5.5, -5, -4.5, -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];
    var YValues = [-1000, -857.375, -729, -614.125, -512, -421.875, -343, -274.625, -216, -166.375, -125, -91.125, -64, -42.875, -27, -15.625, -8, -3.375, -1, -0.125, 0, 0.125, 1, 3.375, 8, 15.625, 27, 42.875, 64, 91.125, 125, 166.375, 216, 274.625, 343, 421.875, 512, 614.125, 729, 857.375, 1000];

    return createFunctionCoordinatesFromValues(XValues, YValues);
}

function getCircleCoordinates() {

    var XValues = [0, 0.174, 0.342, 0.500, 0.643, 0.766, 0.866, 0.940, 0.985, 1, 0.985, 0.940, 0.866, 0.766, 0.643, 0.500, 0.342, 0.174, 0, -0.174, -0.342, -0.500, -0.643, -0.766, -0.866, -0.940, -0.985, -1, -0.985, -0.940, -0.866, -0.766, -0.643, -0.500, -0.342, -0.174, 0];
    var YValues = [1, 0.985, 0.940, 0.866, 0.766, 0.643, 0.500, 0.342, 0.174, 0, -0.174, -0.342, -0.500, -0.643, -0.766, -0.866, -0.940, -0.985, -1, -0.985, -0.940, -0.866, -0.766, -0.643, -0.500, -0.342, -0.174, 0, 0.174, 0.342, 0.500, 0.643, 0.766, 0.866, 0.940, 0.985, 1];
    return createFunctionCoordinatesFromValues(XValues, YValues);

}

function getSinFunctionCoordinates() {

    var XValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360];
//    var YValues = [0, 0.174, 0.342, 0.500, 0.643, 0.766, 0.866, 0.940, 0.985, 1, 0.985, 0.940, 0.866, 0.766, 0.643, 0.500, 0.342, 0.174, 0, -0.174, -0.342, -0.500, -0.643, -0.766, -0.866, -0.940, -0.985, -1, -0.985, -0.940, -0.866, -0.766, -0.643, -0.500, -0.342, -0.174, 0];
    var YValues = [0, 34.8, 68.4, 100, 128.6, 153.2, 173.2, 188, 197, 200, 197, 188, 173.2, 153.2, 128.6, 100, 68.4, 34.8, 0, -34.8, -68.4, -100, -128.6, -153.2, -173.2, -188, -197, -200, -197, -188, -173.2, -153.2, -128.6, -100, -68.4, -34.8, 0];
    return createFunctionCoordinatesFromValues(XValues, YValues);
}

function getCosFunctionCoordinates() {

    var XValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360];
//    var YValues = [1, 0.985, 0.940, 0.866, 0.766, 0.643, 0.500, 0.342, 0.174, 0, -0.174, -0.342, -0.500, -0.643, -0.766, -0.866, -0.940, -0.985, -1, -0.985, -0.940, -0.866, -0.766, -0.643, -0.500, -0.342, -0.174, 0, 0.174, 0.342, 0.500, 0.643, 0.766, 0.866, 0.940, 0.985, 1];
    var YValues = [300, 295.5, 282, 259.8, 229.8, 192.9, 150, 102.6, 52.2, 0, -52.2, -102.6, -150, -192.9, -229.8, -259.8, -282, -295.5, -300, -295.5, -282, -259.8, -229.8, -192.9, -150, -102.6, -52.2, 0, 52.2, 102.6, 150, 192.9, 229.8, 259.8, 282, 295.5, 300];

    return createFunctionCoordinatesFromValues(XValues, YValues);
}

function getLogFunctionCoordinates() {

    var XValues = [0.01, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
    var YValues = [-2, -1, -0.699, -0.523, -0.398, -0.301, -0.222, -0.155, -0.097, -0.046, 0, 0.301, 0.477, 0.602, 0.699, 0.778, 0.845, 0.903, 0.954, 1, 1.041, 1.079, 1.114, 1.146, 1.176, 1.204, 1.230, 1.255, 1.279, 1.301, 1.398, 1.477, 1.544, 1.602, 1.653, 1.699, 1.740, 1.778, 1.813, 1.845, 1.875, 1.903, 1.929, 1.954, 1.978, 2];

    return createFunctionCoordinatesFromValues(XValues, YValues);
}

function getSqrtFunctionCoordinates() {

    var XValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
    var YValues = [0, 1, 1.414213562, 1.732050808, 2, 2.236067977, 2.449489743, 2.645751311, 2.828427125, 3, 3.16227766, 3.872983346, 4.472135955, 5, 5.477225575, 5.916079783, 6.32455532, 6.708203932, 7.071067812, 7.416198487, 7.745966692, 8.062257748, 8.366600265, 8.660254038, 8.94427191, 9.219544457, 9.486832981, 9.746794345, 10];

    return createFunctionCoordinatesFromValues(XValues, YValues);
}

function getFunctionCoordinates(functionString) {
    var f = math.eval(functionString);
    var minX = 0;
    var maxX = 25;
    var step = 0.1;
    var XValues = new Array();
    var YValues = new Array();
    for (var i = minX; i <= maxX; i += step) {
        XValues.push(i);
        YValues.push(f(i));
    }
    return createFunctionCoordinatesFromValues(XValues, YValues);
}

function createNumericFunctionFromXMLNode(functionXmlNode) {

    var options = {
        doNotAnimateAtBirth: true,
        xmlIDs: {},
        values: {}
    };

    var children = functionXmlNode.children();
    children.each(function () {
        var child = $(this);
        var tagName = this.tagName;

        if (tagName === "value") {

            var propertyValue = createValueFromXMLNode(child);
            var which = child.attr('which');
            var xmlID = child.attr('xmlID');
            options.xmlIDs[which] = xmlID;
            options.values[which] = propertyValue;

        } else if (tagName === "array") {

            var array = new Array();
            var which = child.attr('which');
            var xmlID = child.attr('xmlID');
            var elements = child.children('value');
            elements.each(function () {
                var valueNode = $(this);
                var value = createValueFromXMLNode(valueNode);
                array.push(value);
            });

            options[which] = array;
            options.xmlIDs[which] = xmlID;

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

    console.log("%c+++++++++++++++++++++++++++++++++++++++++++++++ options to create the saved FUNCTION", "background: red; color: white;");
    console.log(options);

    return addNumericFunction(options);


}