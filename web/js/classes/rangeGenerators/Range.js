var Range = fabric.util.createClass(fabric.Rect, {
    isRange: true,
    setXmlIDs: function (from) {
        var theGenerator = this;
        theGenerator.xmlID = from++;
        theGenerator.lowerLimit.xmlID = from++;
        theGenerator.upperLimit.xmlID = from++;
        theGenerator.outputPoint.xmlID = from++;
        return from;
    },
    toXML: function () {

        var theRange = this;
        var generatorNode = createXMLElement("numberGenerator");

        appendElementWithValue(generatorNode, "left", theRange.left);
        appendElementWithValue(generatorNode, "top", theRange.top);
        appendElementWithValue(generatorNode, "width", theRange.width);
        appendElementWithValue(generatorNode, "height", theRange.height);

        var outputPoint = theRange.outputPoint;
        appendElementWithValue(generatorNode, "xCoordinate", outputPoint.left);

        var lowerLimitNode = theRange.lowerLimit.value.toXML();
        var upperLimitNode = theRange.upperLimit.value.toXML();

        addAttributeWithValue(lowerLimitNode, "xmlID", theRange.lowerLimit.xmlID);
        addAttributeWithValue(upperLimitNode, "xmlID", theRange.upperLimit.xmlID);

        addAttributeWithValue(lowerLimitNode, "which", "lowerLimit");
        addAttributeWithValue(upperLimitNode, "which", "upperLimit");

        generatorNode.append(lowerLimitNode);
        generatorNode.append(upperLimitNode);

        var outputValue = outputPoint.value;
        if (typeof outputValue !== 'undefined') {
            var outputNode = outputValue.toXML();
            addAttributeWithValue(outputNode, "xmlID", outputPoint.xmlID);
            addAttributeWithValue(outputNode, "which", "output");
            generatorNode.append(outputNode);
        }

        return generatorNode;
    },
    updateOutputColor: function (iconName) {
        this.outputPoint.stroke = icons[iconName].stroke;
        this.outputPoint.fill = icons[iconName].fill;
    },
    initialize: function (options) {

        options || (options = {});

        this.defaultHeight = 115;
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

        this.addLimits(options.values, options.xmlIDs);
        this.addOutputPoint(options.values, options.xmlIDs);
        this.addPlayerButtons();
        this.associateEvents();
        this.positionElements();

        var xCoordinate = null;
        if (options.xCoordinate) {
            xCoordinate = options.xCoordinate;
            this.outputPoint.left = xCoordinate;
        }

        this.computeOutput(xCoordinate, false);

        if (options.xmlIDs) {
            addToConnectableElements(this);
            addToConnectableElements(this.lowerLimit);
            addToConnectableElements(this.upperLimit);
            addToConnectableElements(this.outputPoint);

            this.executePendingConnections();
        }
        

    },
    executePendingConnections: function () {
        var theGenerator = this;
        executePendingConnections(theGenerator.xmlID);
        executePendingConnections(theGenerator.lowerLimit.xmlID);
        executePendingConnections(theGenerator.upperLimit.xmlID);
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
        if (nextCoordinate > theGenerator.upperLimit.getCenterPoint().x) {
            nextCoordinate = theGenerator.lowerLimit.getCenterPoint().x;
        }
        theOutputPoint.left = nextCoordinate;
        theOutputPoint.setCoords();
        theOutputPoint.relativeX = theOutputPoint.getPointByOrigin('center', 'center').x - theGenerator.getPointByOrigin('center', 'center').x;
        theOutputPoint.rangeProportion = Math.abs(theOutputPoint.getCenterPoint().x - theGenerator.lowerLimit.getCenterPoint().x) / Math.abs(theGenerator.upperLimit.getCenterPoint().x - theGenerator.lowerLimit.getCenterPoint().x);
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
    updateOtherLimit: function (limitName) {

        var theRange = this;
        var currentLimit = theRange[limitName];
        var currentValue = currentLimit.value;
        var currentTypeProposition = currentValue.getTypeProposition();
        var currentType = getIconNameByVisualValueProposition(currentTypeProposition);

        var otherLimitName = limitName === "lowerLimit" ? "upperLimit" : "lowerLimit";
        var otherLimit = theRange[otherLimitName];
        var otherValue = otherLimit.value;
        
        if (!otherValue) {
            otherLimit.value = createDefaultValueByTypeProposition(currentTypeProposition);
        }
        
        
        var otherType = otherValue ? getIconNameByVisualValueProposition(otherValue.getTypeProposition()) : null;

//        console.log("otherType: " + otherType);

        if (!otherValue || otherType !== currentType) {
            otherLimit.removeTypeIcon();
            otherLimit.addTypeIcon(currentType, 0.45);
            otherLimit.inConnectors.forEach(function (inConnector) {
                inConnector.contract();
            });
            otherLimit.outConnectors.forEach(function (outConnector) {
                outConnector.contract();
            });
        }
        
        
        

        if (theRange.lowerLimit.value && theRange.upperLimit.value) {

            if (theRange.lowerLimit.value.getTypeProposition() === theRange.upperLimit.value.getTypeProposition()) {

                theRange.outputPoint.animate('opacity', 1, {
                    duration: 400
                });

                theRange.computeOutput();



            }

        }




    },
    addLimit: function (limitName, numericValue, xmlID) {

        var theRange = this;
        var limit = new RangeLimit();

        limit.xmlID = xmlID;
        limit.scaleX = theRange.valueScale;
        limit.scaleY = theRange.valueScale;
        limit.range = theRange;
        limit.isLimitValue = true;
        limit.limitOf = theRange;
        limit.nonSerializable = true;
        limit.set('limitName', limitName);

        canvas.add(limit);
        theRange.set(limitName, limit);
        theRange.topElements.push(limit);

        limit.off('mouseup');
        limit.off('mousedown');
        limit.off('moving');

        var originX = 'right';
        var originY = 'bottom';

        // Assignation of events

        limit.lockMovementY = true;
        if (limitName === 'upperLimit') {
            originX = 'left';
        }


        limit.on({
            'moving': function (options) {

                var d = 4;

                limit.setCoords();
                if (!limit.lockMovementX) {

                    var point = theRange.getPointByOrigin(originX, originY);
                    var lowerLimit = theRange.lowerLimit;
                    var upperLimit = theRange.upperLimit;

                    theRange.width = theRange.smallIndent + theRange.largeIndent + (Math.abs(upperLimit.left - lowerLimit.left)) + theRange.smallIndent - d - theRange.strokeWidth;

                    theRange.setPositionByOrigin(new fabric.Point(point.x, point.y), originX, originY);

                    if (theRange.xCoordinates) {
                        theRange.generateScaledCoordinates('x');
                    }

                    theRange.positionElements();
                    theRange.setCoords();

                } else {

                    var theEvent = options.e;
                    if (theEvent) {
                        var canvasCoords = getCanvasCoordinates(theEvent);
                        var lastAddedConnector = getLastElementOfArray(limit.outConnectors);
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                    }
                }
            },
        });
    },
    computeOuputNumber: function () {

    },
    computeOutput: function (xCoordinate, shouldAnimate) {

//        console.log("%c computeOutput function NUMBERGENERATOR class. shouldAnimate: " + shouldAnimate, "background: #7FFFD4; color: #000000;");

        var theRange = this;
        var theOutputPoint = theRange.outputPoint;

        if (!xCoordinate) {
            xCoordinate = theOutputPoint.left;
        }

        var lowerValue = theRange.lowerLimit.value;
        var upperValue = theRange.upperLimit.value;

        if (lowerValue === null || typeof lowerValue === 'undefined' || upperValue === null || typeof upperValue === 'undefined') {
            return;
        }

        var refreshCanvas = false;
        var oldMin = theRange.lowerLimit.getCenterPoint().x;
        var oldMax = theRange.upperLimit.getCenterPoint().x;
        var outputValue = null;

        if (lowerValue.isNumericData) {

            var newMin = lowerValue.number;
            var newMax = upperValue.number;
            var output = changeRange(xCoordinate, oldMin, oldMax, newMin, newMax);
            outputValue = createNumericValue(output);

        } else if (lowerValue.isColorData) {

            var samplingDistance = 25;
            var steps = Math.round((oldMax - oldMin) / samplingDistance);
            var interpolatedValues = lowerValue.interpolateTo(upperValue, steps);
            if (interpolatedValues) {
                var outputPos = Math.round((xCoordinate - oldMin) / samplingDistance);
                if (outputPos < 0) {
                    outputPos = 0;
                } else if (outputPos >= interpolatedValues.length) {
                    outputPos = interpolatedValues.length - 1;
                }
                outputValue = interpolatedValues[outputPos];
            }

        } else if (lowerValue.isDurationData) {
            
            var newMin = lowerValue.duration.valueOf();
            var newMax = upperValue.duration.valueOf();
            var output = changeRange(xCoordinate, oldMin, oldMax, newMin, newMax);
            outputValue = createDurationValue(moment.duration(output));
            
        } else if (lowerValue.isDateAndTimeData) {

            var newMin = lowerValue.moment.valueOf();
            var newMax = upperValue.moment.valueOf();
            var output = changeRange(xCoordinate, oldMin, oldMax, newMin, newMax);
            outputValue = createDateAndTimeValue(moment(output));

        }

        theRange.outputPoint.setValue(outputValue, refreshCanvas, shouldAnimate);
    },
    addLimits: function (values, xmlIDs) {

        var theGenerator = this;
        var lowerLimitValue = null;
        var upperLimitValue = null;

        if (values !== null && typeof values !== 'undefined') {
            lowerLimitValue = values.lowerLimit || createNumericValue(0);
            upperLimitValue = values.upperLimit || createNumericValue(100);
        } else {
            lowerLimitValue = createNumericValue(0);
            upperLimitValue = createNumericValue(100);
        }

        theGenerator.addLimit('lowerLimit', lowerLimitValue, xmlIDs ? xmlIDs['lowerLimit'] : null);
        theGenerator.addLimit('upperLimit', upperLimitValue, xmlIDs ? xmlIDs['upperLimit'] : null);
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
        var outputPoint = new RangeOutput(outputPointPath, {
            evented: true,
            selectable: true,
            angle: 270,
            opacity: 0, // The output point is not visible at the bigining. It will appear when the outCollection has values
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

        var lowerLimit = theGenerator.lowerLimit;
        if (lowerLimit) {
            lowerLimit.left = topLeft.x + theGenerator.smallIndent + theGenerator.largeIndent - d / 2;
            lowerLimit.top = bottomRight.y - theGenerator.smallIndent - 5;
            lowerLimit.setCoords();
            updateConnectorsPositions(lowerLimit);
            if (lowerLimit.typeIcon) {
                bringToFront(lowerLimit.typeIcon);
                lowerLimit.typeIcon.setPositionByOrigin(lowerLimit.getCenterPoint(), 'center', 'center');
            }
        }

        var upperLimit = theGenerator.upperLimit;
        if (upperLimit) {
            upperLimit.left = bottomRight.x - theGenerator.smallIndent + d / 2;
            upperLimit.top = bottomRight.y - theGenerator.smallIndent - 5;
            upperLimit.setCoords();
            updateConnectorsPositions(upperLimit);
            if (upperLimit.typeIcon) {
                bringToFront(upperLimit.typeIcon);
                upperLimit.typeIcon.setPositionByOrigin(upperLimit.getCenterPoint(), 'center', 'center');
            }
        }

        var outputPoint = theGenerator.outputPoint;
        if (outputPoint) {
            var x = Math.min(lowerLimit.left, upperLimit.left) + Math.abs(upperLimit.left - lowerLimit.left) / 2;
            var y = bottomRight.y - 2 * theGenerator.smallIndent - 5;
            if (outputPoint.rangeProportion != null) {
                x = lowerLimit.getCenterPoint().x + (Math.abs(upperLimit.getCenterPoint().x - lowerLimit.getCenterPoint().x) * outputPoint.rangeProportion);
            }
            outputPoint.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
            outputPoint.setCoords();
            updateConnectorsPositions(outputPoint);
        }


        var playButton = theGenerator.playButton;
        if (playButton) {
            var x = Math.min(lowerLimit.left, upperLimit.left) + Math.abs(upperLimit.left - lowerLimit.left) / 2;
            var y = bottomRight.y - (playButton.height * playButton.scaleY) / 2 - 7;
            playButton.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');
            playButton.setCoords();
            updateConnectorsPositions(playButton);
        }

        var pauseButton = theGenerator.pauseButton;
        if (pauseButton) {
            var x = Math.min(lowerLimit.left, upperLimit.left) + Math.abs(upperLimit.left - lowerLimit.left) / 2;
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

        // left tick mark
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y1 + theGenerator.tickMarkLength);


        ctx.save();

        ctx.fillStyle = "black";
        ctx.font = '12px Helvetica';
        ctx.textAlign = "center";

        if (!this.lowerLimit.value) {
            ctx.fillText("[", x1, y1 + 74);
        }


        // right tick mark
        ctx.moveTo(x2 - 1, y1);
        ctx.lineTo(x2 - 1, y1 + theGenerator.tickMarkLength);


        if (!this.upperLimit.value) {
            ctx.fillText("]", x2 - 1, y1 + 74);
        }

        ctx.restore();

        ctx.stroke();

        // background of the play button
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,255)';
        ctx.moveTo(0, 0);
        ctx.arc(0, 36, 19, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();






        ctx.closePath();
        ctx.restore();

    }


});

function addRange(options) {

    options.lockScalingX = true;
    options.lockScalingY = true;
    options.lockRotation = true;
    options.hasRotatingPoint = false;
    options.hasBorders = false;
    options.hasControls = false;
    options.transparentCorners = false;
    options.perPixelTargetFind = true;

    var theGenerator = new Range(options);
    canvas.add(theGenerator);

    var shouldAnimate = false;

    theGenerator.bringTopElementsToFront();

    blink(theGenerator.outputPoint, false, 0.3);
    blink(theGenerator.lowerLimit, false, 0.3);
    blink(theGenerator.upperLimit, false, 0.3);
    blink(theGenerator.playButton, false, 0.3);
    blink(theGenerator, true, 0.2);
}


function createRangeFromXMLNode(functionXmlNode) {

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

    console.log("+++++++++++++++++++++++++++++++++++++++++++++++ options to create the saved RANGE GENERATOR");
    console.log(options);

    return addRange(options);

}