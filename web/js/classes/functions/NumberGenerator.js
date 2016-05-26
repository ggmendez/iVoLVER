var NumberGenerator = fabric.util.createClass(fabric.Rect, {
    isNumberGenerator: true,
    setXmlIDs: function (from) {
        var theGenerator = this;
        theGenerator.xmlID = from++;
        theGenerator.minX.xmlID = from++;
        theGenerator.maxX.xmlID = from++;
        theGenerator.outputPoint.xmlID = from++;
        return from;
    },
    toXML: function () {

        var theNumberGenerator = this;
        var generatorNode = createXMLElement("numberGenerator");

        appendElementWithValue(generatorNode, "left", theNumberGenerator.left);
        appendElementWithValue(generatorNode, "top", theNumberGenerator.top);
        appendElementWithValue(generatorNode, "width", theNumberGenerator.width);
        appendElementWithValue(generatorNode, "height", theNumberGenerator.height);

        var outputPoint = theNumberGenerator.outputPoint;
        appendElementWithValue(generatorNode, "xCoordinate", outputPoint.left);

        var minXNode = theNumberGenerator.minX.value.toXML();
        var maxXNode = theNumberGenerator.maxX.value.toXML();

        addAttributeWithValue(minXNode, "xmlID", theNumberGenerator.minX.xmlID);
        addAttributeWithValue(maxXNode, "xmlID", theNumberGenerator.maxX.xmlID);

        addAttributeWithValue(minXNode, "which", "minX");
        addAttributeWithValue(maxXNode, "which", "maxX");

        generatorNode.append(minXNode);
        generatorNode.append(maxXNode);

        var outputValue = outputPoint.value;
        if (typeof outputValue !== 'undefined') {
            var outputNode = outputValue.toXML();
            addAttributeWithValue(outputNode, "xmlID", outputPoint.xmlID);
            addAttributeWithValue(outputNode, "which", "output");
            generatorNode.append(outputNode);
        }

        return generatorNode;
    },
    initialize: function (options) {

        options || (options = {});

        this.defaultHeight = 120;
        this.defaultWidth = 500;
        this.smallIndent = 40;
        this.largeIndent = 0;
        this.tickMarkLength = 10;
        this.valueScale = 0.75;

        this.callSuper('initialize', options);

        var d = 4;
        var realWith = options.width || this.defaultWidth;
        if (options.squareWidth) {
            realWith = 2 * this.smallIndent + this.largeIndent + options.squareWidth + 2 * this.smallIndent - d - this.strokeWidth;
        }

        var realHeight = options.height || this.defaultHeight;
        if (options.squareHeight) {
            realHeight = this.height = 2 * this.smallIndent + this.largeIndent + options.squareHeight + 2 * this.smallIndent - d - this.strokeWidth;
        }

        this.set('width', realWith);
        this.set('height', realHeight);

        this.set('fill', options.fill || "rgba(240, 240, 240, 0.5)");
        this.set('stroke', options.stroke || rgb(51, 51, 51));
        this.set('strokeWidth', 3);

        this.set('isCompressed', true);
        this.set('rx', 5);
        this.set('ry', this.rx);

        this.set('originX', 'center');
        this.set('originY', 'center');

        this.set('topElements', new Array());

        this.addNumericLimits(options.values, options.xmlIDs);
        this.addOutputPoint(options.values, options.xmlIDs);
        this.addPlayerButtons();
        this.associateEvents();
        this.positionElements(false);

        var xCoordinate = null;
        if (options.xCoordinate) {
            xCoordinate = options.xCoordinate;
            this.outputPoint.left = xCoordinate;
        }

        this.computeOutput(xCoordinate, false);

        if (options.xmlIDs) {
            addToConnectableElements(this);
            addToConnectableElements(this.minX);
            addToConnectableElements(this.maxX);
            addToConnectableElements(this.outputPoint);

            this.executePendingConnections();
        }

    },
    executePendingConnections: function () {
        var theGenerator = this;
        executePendingConnections(theGenerator.xmlID);
        executePendingConnections(theGenerator.minX.xmlID);
        executePendingConnections(theGenerator.maxX.xmlID);
        executePendingConnections(theGenerator.outputPoint.xmlID);
    },
    addPlayerButtons: function () {

        var theGenerator = this;

        var playPath = 'M -1728.6563,2902.9506 C -1747.409,2902.9506 -1762.6119,2918.1536 -1762.6119,2936.9062 -1762.6119,2955.6589 -1747.409,2970.8618 -1728.6563,2970.8618 -1709.9037,2970.8618 -1694.7006,2955.6589 -1694.7006,2936.9062 -1694.7006,2918.1536 -1709.9037,2902.9506 -1728.6563,2902.9506 z M -1743.9677,2914.9201 -1704.0116,2936.9062 -1743.9677,2958.8924 z';

        var playButton = new fabric.Path(playPath, {
            fill: rgb(198, 198, 198),
            strokeWidth: 3,
            originX: 'center',
            originY: 'center',
            stroke: rgb(66, 66, 66),
            perPixelTargetFind: false,
            selectable: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            strokeLineJoin: 'round',
            permanentOpacity: 1,
            movingOpacity: 1,
            scaleX: 0.6,
            scaleY: 0.6,
        });
        canvas.add(playButton);
        theGenerator.set('playButton', playButton);
        theGenerator.topElements.push(playButton);

        playButton.on('mouseup', function (options) {
            theGenerator.play();
        });



        var pausePath = 'M -1842.739,2962.94 C -1861.4986,2962.94 -1876.6942,2978.1356 -1876.6942,2996.8952 -1876.6942,3015.6548 -1861.4986,3030.8505 -1842.739,3030.8505 -1823.9794,3030.8505 -1808.7837,3015.6548 -1808.7837,2996.8952 -1808.7837,2978.1356 -1823.9794,2962.94 -1842.739,2962.94 z M -1859.9901,2976.3251 -1847.1521,2976.3251 -1847.1521,3018.4572 -1859.9901,3018.4572 z M -1838.3624,2976.3251 -1825.5243,2976.3251 -1825.5243,3018.4572 -1838.3624,3018.4572 z';
        var pauseButton = new fabric.Path(pausePath, {
            fill: rgb(198, 198, 198),
            strokeWidth: 3,
            originX: 'center',
            originY: 'center',
            stroke: rgb(66, 66, 66),
            perPixelTargetFind: false,
            selectable: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            strokeLineJoin: 'round',
            permanentOpacity: 0,
            movingOpacity: 0,
            opacity: 0,
            evented: false,
            scaleX: 0.6,
            scaleY: 0.6,
        });
        canvas.add(pauseButton);
        theGenerator.set('pauseButton', pauseButton);
        theGenerator.topElements.push(pauseButton);

        pauseButton.on('mouseup', function (options) {
            theGenerator.pause();
        });
    },
    positionOutputAtNextPlayablePosition: function () {

        var theGenerator = this;

        var theOutputPoint = theGenerator.outputPoint;
        var nextCoordinate = theOutputPoint.left + 4;
        if (nextCoordinate > theGenerator.maxX.getCenterPoint().x) {
            nextCoordinate = theGenerator.minX.getCenterPoint().x;
        }
        theOutputPoint.left = nextCoordinate;
        theOutputPoint.setCoords();
        theOutputPoint.relativeX = theOutputPoint.getPointByOrigin('center', 'center').x - theGenerator.getPointByOrigin('center', 'center').x;
        theOutputPoint.rangeProportion = Math.abs(theOutputPoint.getCenterPoint().x - theGenerator.minX.getCenterPoint().x) / Math.abs(theGenerator.maxX.getCenterPoint().x - theGenerator.minX.getCenterPoint().x);
        updateConnectorsPositions(theOutputPoint);

    },
    play: function () {

        var theGenerator = this;
        theGenerator.playing = true;

        theGenerator.playButton.opacity = 0;
        theGenerator.playButton.permanentOpacity = 0;
        theGenerator.playButton.movingOpacity = 0;

        theGenerator.pauseButton.opacity = 1;
        theGenerator.pauseButton.permanentOpacity = 1;
        theGenerator.pauseButton.movingOpacity = 1;

        theGenerator.playButton.evented = false;
        theGenerator.pauseButton.evented = true;


        var interval = theGenerator.interval || 1000 / 30;
        theGenerator.timer = setInterval(function () {
            theGenerator.positionOutputAtNextPlayablePosition();
            theGenerator.computeOutput(null, false);
            canvas.renderAll();
        }, interval);
    },
    pause: function () {
        var theGenerator = this;

        theGenerator.playing = false;

        theGenerator.playButton.opacity = 1;
        theGenerator.playButton.permanentOpacity = 1;
        theGenerator.playButton.movingOpacity = 1;

        theGenerator.pauseButton.opacity = 0;
        theGenerator.pauseButton.permanentOpacity = 0;
        theGenerator.pauseButton.movingOpacity = 0;

        theGenerator.playButton.evented = true;
        theGenerator.pauseButton.evented = false;
        canvas.renderAll();
        if (theGenerator.timer) {
            clearInterval(theGenerator.timer);
        }
    },
    bringTopElementsToFront: function () {
        var theGenerator = this;
        theGenerator.bringToFront(true);
        theGenerator.setCoords();
        theGenerator.topElements.forEach(function (element) {
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
    addNumericLimit: function (limitName, numericValue, xmlID) {
        var theGenerator = this;
        var numericVisualValue = CreateVisualValueFromValue(numericValue);
        numericVisualValue.xmlID = xmlID;
        numericVisualValue.scaleX = theGenerator.valueScale;
        numericVisualValue.scaleY = theGenerator.valueScale;
        numericVisualValue.generator = theGenerator;
        numericVisualValue.isLimitValue = true;
        numericVisualValue.limitOf = theGenerator;
        numericVisualValue.nonSerializable = true;

        canvas.add(numericVisualValue);
        theGenerator.set(limitName, numericVisualValue);
        theGenerator.topElements.push(numericVisualValue);

        numericVisualValue.off('mouseup');
        numericVisualValue.off('mousedown');
        numericVisualValue.off('moving');

        var originX = 'right';
        var originY = 'bottom';

        // Assignation of events

        numericVisualValue.lockMovementY = true;
        if (limitName === 'maxX') {
            originX = 'left';
        }


        numericVisualValue.on({
            'moving': function (options) {

                var d = 4;

                numericVisualValue.setCoords();
                if (!numericVisualValue.lockMovementX) {

                    var point = theGenerator.getPointByOrigin(originX, originY);
                    var minX = theGenerator.minX;
                    var maxX = theGenerator.maxX;

                    theGenerator.width = theGenerator.smallIndent + theGenerator.largeIndent + (Math.abs(maxX.left - minX.left)) + theGenerator.smallIndent - d - theGenerator.strokeWidth;

                    theGenerator.setPositionByOrigin(new fabric.Point(point.x, point.y), originX, originY);

                    if (theGenerator.xCoordinates) {
                        theGenerator.generateScaledCoordinates('x');
                    }

                    theGenerator.positionElements();
                    theGenerator.setCoords();

                } else {

                    var theEvent = options.e;
                    if (theEvent) {
                        var canvasCoords = getCanvasCoordinates(theEvent);
                        var lastAddedConnector = getLastElementOfArray(numericVisualValue.outConnectors);
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                    }
                }
            },
        });
    },
    computeOutput: function (xCoordinate, shouldAnimate) {

        console.log("%c computeOutput function NUMBERGENERATOR class. shouldAnimate: " + shouldAnimate, "background: #7FFFD4; color: #000000;");

        var theNumberGenerator = this;
        var theOutputPoint = theNumberGenerator.outputPoint;

        if (!xCoordinate) {
            xCoordinate = theOutputPoint.left;
        }

        var oldMin = theNumberGenerator.minX.getCenterPoint().x;
        var oldMax = theNumberGenerator.maxX.getCenterPoint().x;
        var newMin = theNumberGenerator.minX.value.number;
        var newMax = theNumberGenerator.maxX.value.number;
        var output = changeRange(xCoordinate, oldMin, oldMax, newMin, newMax);

        var refreshCanvas = false;

        theNumberGenerator.outputPoint.setValue(createNumericValue(output), refreshCanvas, shouldAnimate);
    },
    addNumericLimits: function (values, xmlIDs) {

        var theGenerator = this;
        var minXValue = null;
        var maxXValue = null;

        if (values !== null && typeof values !== 'undefined') {
            minXValue = values.minX || createNumericValue(0);
            maxXValue = values.maxX || createNumericValue(100);
        } else {
            minXValue = createNumericValue(0);
            maxXValue = createNumericValue(100);
        }

        theGenerator.addNumericLimit('minX', minXValue, xmlIDs ? xmlIDs['minX'] : null);
        theGenerator.addNumericLimit('maxX', maxXValue, xmlIDs ? xmlIDs['maxX'] : null);
    },
    addOutputPoint: function (values, xmlIDs) {

        var theGenerator = this;
        var outputValue = null;

        if (values !== null && typeof values !== 'undefined') {
            outputValue = values.output || new NumericData({unscaledValue: 100});
        } else {
            outputValue = new NumericData({unscaledValue: 100});
        }

        var outputPointPath = paths['output'].r;
        var outputPoint = new NumberGeneratorOutput(outputPointPath, {
            evented: true,
            selectable: true,
            angle: 270,
            opacity: 1, // The output point is not visible at the bigining. It will appear when the outCollection has values
            generator: theGenerator,
            value: outputValue,
            xmlID: xmlIDs ? xmlIDs['output'] : null,
        });
        canvas.add(outputPoint);
        theGenerator.set('outputPoint', outputPoint);
        theGenerator.topElements.push(outputPoint);
    },
    positionElements: function () {

        var theGenerator = this;

        theGenerator.setCoords();

        var topLeft = theGenerator.getPointByOrigin('left', 'top');
        var bottomRight = theGenerator.getPointByOrigin('right', 'bottom');
        var d = 4;
        if (theGenerator.functionPath) {
            d = theGenerator.functionPath.strokeWidth;
        }

        var minX = theGenerator.minX;
        if (minX) {
            minX.left = topLeft.x + theGenerator.smallIndent + theGenerator.largeIndent - d / 2;
            minX.top = bottomRight.y - theGenerator.smallIndent - 5;
            minX.setCoords();
            updateConnectorsPositions(minX);
        }

        var maxX = theGenerator.maxX;
        if (maxX) {
            maxX.left = bottomRight.x - theGenerator.smallIndent + d / 2;
            maxX.top = bottomRight.y - theGenerator.smallIndent - 5;
            maxX.setCoords();
            updateConnectorsPositions(maxX);
        }

        var outputPoint = theGenerator.outputPoint;
        if (outputPoint) {
            var x = Math.min(minX.left, maxX.left) + Math.abs(maxX.left - minX.left) / 2;
            var y = bottomRight.y - 2 * theGenerator.smallIndent - 5;
            if (outputPoint.rangeProportion != null) {
                x = minX.getCenterPoint().x + (Math.abs(maxX.getCenterPoint().x - minX.getCenterPoint().x) * outputPoint.rangeProportion);
            }
            outputPoint.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
            outputPoint.setCoords();
            updateConnectorsPositions(outputPoint);
        }


        var playButton = theGenerator.playButton;
        if (playButton) {
            var x = Math.min(minX.left, maxX.left) + Math.abs(maxX.left - minX.left) / 2;
            var y = bottomRight.y - (playButton.height * playButton.scaleY) / 2 - 7;
            playButton.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
            playButton.setCoords();
            updateConnectorsPositions(playButton);
        }

        var pauseButton = theGenerator.pauseButton;
        if (pauseButton) {
            var x = Math.min(minX.left, maxX.left) + Math.abs(maxX.left - minX.left) / 2;
            var y = bottomRight.y - (pauseButton.height * pauseButton.scaleY) / 2 - 7;
            pauseButton.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
            pauseButton.setCoords();
            updateConnectorsPositions(pauseButton);
        }

        theGenerator.setCoords();
    },
    associateEvents: function () {
        var theGenerator = this;
        theGenerator.on({
            'moving': function (options) {
                theGenerator.setCoords();
                theGenerator.positionElements(true);
            },
            'limitChanged': function (options) {
                var visualValue = options.visualValue;
                var shouldAnimate = options.shouldAnimate;
                theGenerator.computeOutput(null, false);
            }
        });
    },
    _render: function (ctx) {

        var theGenerator = this;

        var d = 4;
        if (theGenerator.functionPath) {
            d = theGenerator.functionPath.strokeWidth;
        }

        ctx.save();
        theGenerator.callSuper('_render', ctx);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Horizontal line
        var x1 = -theGenerator.width / 2 + theGenerator.smallIndent + theGenerator.largeIndent - d;
        var y1 = theGenerator.height / 2 - 2 * theGenerator.smallIndent + d - 5;
        var x2 = theGenerator.width / 2 - theGenerator.smallIndent + d;
        ctx.moveTo(x1 - 1, y1);
        ctx.lineTo(x2, y1);

        // x left tick mark
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y1 + theGenerator.tickMarkLength);

        // x right tick mark
        ctx.moveTo(x2, y1);
        ctx.lineTo(x2, y1 + theGenerator.tickMarkLength);

        ctx.stroke();
        ctx.closePath();
        ctx.restore();

    }


});

function addNumberGenerator(options) {

    options.lockScalingX = true;
    options.lockScalingY = true;
    options.lockRotation = true;
    options.hasRotatingPoint = false;
    options.hasBorders = false;
    options.hasControls = false;
    options.transparentCorners = false;
    options.perPixelTargetFind = true;

    var theGenerator = new NumberGenerator(options);
    canvas.add(theGenerator);

    var shouldAnimate = false;

    theGenerator.bringTopElementsToFront();

    blink(theGenerator.outputPoint, false, 0.3);
    blink(theGenerator.minX, false, 0.3);
    blink(theGenerator.maxX, false, 0.3);
    blink(theGenerator.playButton, false, 0.3);
    blink(theGenerator, true, 0.3);
}


function createNumberGeneratorFromXMLNode(functionXmlNode) {

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

    console.log("+++++++++++++++++++++++++++++++++++++++++++++++ options to create the saved NUMBER GENERATOR");
    console.log(options);

    return addNumberGenerator(options);

}