PathMark = fabric.util.createClass(fabric.Path, {
//   type: 'PathMark',
    isPathMark: true,
    initialize: function (path, options) {



        options || (options = {});
        options.fill = options.fill || options.visualPropertyFill;
        options.label = options.label || ((options.values && options.values.label) ? options.values.label.string : '');
        options.angle = -(options.angle || ((options.values && options.values.angle) ? options.values.angle.number : -0));

        if (!options.values) {
            options.values = {};
        }
        options.values.fill = createColorValue(new fabric.Color(options.fill));
        options.values.shape = createShapeValue(PATH_MARK, path);
        
        


        this.callSuper('initialize', path, options);

        this.set('strokeWidth', options.strokeWidth || 4);
        this.set('originalStrokeWidth', options.strokeWidth || this.strokeWidth);
        this.set('perPixelTargetFind', false);

        this.set('visualPropertyFill', options.fill);
        this.set('visualPropertyStroke', options.stroke);
        this.set('fill', '');
        this.set('stroke', options.fill);

        this.set('strokeLineJoin', 'round');
        this.set('strokeLineCap', 'round');

        this.set('flipY', true);

        this.set('hasBorders', true);

        this.set('colorForStroke', options.colorForStroke || this.stroke);

        this.createVariables();

        this.createIText();

//        this.set('shape', {shape: PATH_MARK, path: this});

        this.createRectBackground();

        if (options.targetWidth) {
            var theWidth = options.targetWidth / this.width;
//            this.set('finalScaleX', theWidth);
            this.set("the_width", options.targetWidth);
        } else {
            this.set("the_width", this.width);
        }

        if (options.targetHeight) {
            var theHeight = options.targetHeight / this.height;
//            this.set('finalScaleY', theHeight);
            this.set("the_height", options.targetHeight);
        } else {
            this.set("the_height", this.height);
        }

        var widthValue = null;
        var heightValue = null;
        var angleValue = null;

        if (options.values) {
            widthValue = options.values.width || createNumericValue(this.the_width || this.width, null, null, 'pixels');
            heightValue = options.values.height || createNumericValue(this.the_height || this.height, null, null, 'pixels');
            angleValue = options.values.angle || createNumericValue(-this.angle, null, null, 'degrees');
        } else {
            widthValue = createNumericValue(this.the_width || this.width, null, null, 'pixels');
            heightValue = createNumericValue(this.the_height || this.height, null, null, 'pixels');
            angleValue = createNumericValue(-this.angle, null, null, 'degrees');
        }

        this.specificProperties.push({attribute: "xCollection", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData'});
        this.specificProperties.push({attribute: "yCollection", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData'});
        
        this.specificProperties.push({attribute: "width", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData', value: widthValue});
        this.specificProperties.push({attribute: "height", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData', value: heightValue});
        this.specificProperties.push({attribute: "angle", readable: true, writable: true, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: angleValue});

        this.createVisualProperties();

        this.getVisualPropertyByAttributeName('xCollection').canHandleArrays = true;
        this.getVisualPropertyByAttributeName('yCollection').canHandleArrays = true;


        this.createPositionProperties(options.values);

        this.setCoords();

        this.associateLabelEvents();

        this.changeColors = function (fill, stroke) {
            this.fill = '';
            this.stroke = fill;
            this.colorForStroke = stroke;

            this.backgroundRect.stroke = stroke;
            this.visualProperties.forEach(function (visualProperty) {
                visualProperty.stroke = stroke;
                visualProperty.fill = fill;
                visualProperty.outConnectors.forEach(function (outConnector) {
                    outConnector.changeColor(stroke);
                });

            });
            var visualProperty = this.xVisualProperty;
            if (visualProperty) {
                visualProperty.colorForStroke = stroke;
                if (!visualProperty.selected) {
                    visualProperty.stroke = stroke;
                }
                visualProperty.fill = fill;
                visualProperty.outConnectors.forEach(function (outConnector) {
                    outConnector.changeColor(stroke);
                });
            }

            visualProperty = this.yVisualProperty;
            if (visualProperty) {
                visualProperty.colorForStroke = stroke;
                if (!visualProperty.selected) {
                    visualProperty.stroke = stroke;
                }
                visualProperty.fill = fill;
                visualProperty.outConnectors.forEach(function (outConnector) {
                    outConnector.changeColor(stroke);
                });
            }
        };

        this.applySelectedStyle = function () {
        };

        this.applyUnselectedStyle = function () {
        };

        var XYValues = extractXYValues(this, true, options.doNotSimplify);

//        if (LOG) {
        console.log("XYValues:");
        console.log(XYValues);
//        }

        var coordinates = createFunctionCoordinatesFromValues(XYValues.xValues, XYValues.yValues);

        this.set("xCollection", coordinates.XCoordinates);
        var xCollectionVisualProperty = this.getVisualPropertyByAttributeName('xCollection');
        xCollectionVisualProperty.value = coordinates.XCoordinates;
        xCollectionVisualProperty.isCollection = true;

        this.set("yCollection", coordinates.YCoordinates);
        var yCollectionVisualProperty = this.getVisualPropertyByAttributeName('yCollection');
        yCollectionVisualProperty.value = coordinates.YCoordinates;
        yCollectionVisualProperty.isCollection = true;

//        this.scaledX = this.scaleCoordiates(this.xCollection, 'x', this.width);
//        this.scaledY = this.scaleCoordiates(this.yCollection, 'y', this.height);
        this.scaledX = this.scaleCoordiates(this.xCollection, 'x', options.targetWidth || this.width);
        this.scaledY = this.scaleCoordiates(this.yCollection, 'y', options.targetHeight || this.height);
        this.updatePoints();

        this.setCoreVisualPropertiesValues(options.values);

        this.applyXmlIDs(options.xmlIDs);

    },
    computeUpdatedValueOf: function (updater, value, updatedProperty) {
        if (updater === 'rx') {
            if (updatedProperty === 'area') {
                return value * this.ry * Math.PI;
            }
        } else if (updater === 'ry') {
            if (updatedProperty === 'area') {
                return value * this.rx * Math.PI;
            }
        } else if (updater === 'area') {
            if (updatedProperty === 'rx' || updatedProperty === 'ry') {
                return Math.sqrt(value / Math.PI);
            }
        }
    },
    scaleCoordiates: function (coordinates, coordinate, max) {
       
        var theMark = this;
        
        return scaleCoordiates(theMark, coordinates, coordinate, max);
        
        /*

        var numbers = new Array();
        coordinates.forEach(function (value) {
            numbers.push(value.number);
        });

        var oldMin = getArrayMin(numbers);
        var oldMax = getArrayMax(numbers);
        var newMin = 0;

        theMark.setCoords();

        if (LOG) {
            console.log("theMark.the_height:");
            console.log(theMark.the_height);
        }
        
        if (LOG) {
            console.log("theMark.getScaleY():");
            console.log(theMark.getScaleY());
        }

        var newMax = max;
        if (!newMax) {
            if (coordinate === 'x') {
                newMax = theMark.the_width;
            } else {
                newMax = theMark.the_height;
            }
        }

        if (LOG)
            console.log("oldMin, oldMax, newMin, newMax");
        if (LOG)
            console.log(oldMin, oldMax, newMin, newMax);

        var scaledCoordinates = changeRangeToArray(numbers, oldMin, oldMax, newMin, newMax);

        return scaledCoordinates;*/
    },
    setBothCoordinates: function (xCoordinates, yCoordinates, shouldAnimate) {

        var theMark = this;
        if ($.isArray(xCoordinates) && $.isArray(yCoordinates)) {

        } else {
            return false;
        }

        theMark.xCollection = xCoordinates;
        theMark.yCollection = yCoordinates;

        theMark.scaledX = theMark.scaleCoordiates(theMark.xCollection, 'x');
        theMark.scaledY = theMark.scaleCoordiates(theMark.yCollection, 'y');
        theMark.updatePoints(shouldAnimate);

        return true;

    },
    generateScaledCoordinates: function (coordinate, finalMax) {
        var theMark = this;
        if (coordinate === 'x') {
            theMark.scaledX = theMark.scaleCoordiates(theMark.xCollection, 'x', finalMax);
        } else {
            theMark.scaledY = theMark.scaleCoordiates(theMark.yCollection, 'y', finalMax);
        }

        theMark.updatePoints(false);
    },
    // the parameter 'coordinate' should either be x or y
    setCoordinates: function (coordinates, coordinate, shouldAnimate) {

        if (LOG)
            console.log("setCoordinates FUNCTION");

        var theMark = this;
        if ($.isArray(coordinates)) {

            theMark[coordinate + 'Collection'] = coordinates;

            if (coordinate === 'y' && (!theMark.xCollection || !theMark.getVisualPropertyByAttributeName('xCollection').inConnectors.length)) {

                var xCollection = new Array();

                var totalYs = coordinates.length;
                for (var i = 0; i < totalYs; i++) {
                    xCollection.push(createNumericValue(i));
                }

                theMark.setCoordinates(xCollection, 'x');

            }

        } else {
            return false;
        }

        if (theMark.xCollection && theMark.yCollection) {

            theMark.scaledX = theMark.scaleCoordiates(theMark.xCollection, 'x');
            theMark.scaledY = theMark.scaleCoordiates(theMark.yCollection, 'y');

            theMark.updatePoints(shouldAnimate);
        }

        return true;
    },
    updatePoints: function (shouldAnimate) {

        if (LOG)
            console.log("updatePoints FUNCTION");

        var theMark = this;

        var previousLeft = theMark.left;
        var previousTop = theMark.top;

        console.log("theMark.scaledX.length: " + theMark.scaledX.length);
        console.log("theMark.scaledY.length: " + theMark.scaledY.length);

        var maxPointsToPlot = Math.min(theMark.scaledX.length, theMark.scaledY.length);


        theMark.path = new Array();

        theMark.path.push(["M", theMark.scaledX[0], theMark.scaledY[0]]);

        for (var i = 1; i < maxPointsToPlot; i++) {

            theMark.path.push(["L", theMark.scaledX[i], theMark.scaledY[i]]);

//            if (LOG) {
            console.log("theMark.path[i]:");
            console.log(theMark.path[i]);
//            }
        }

//        if (LOG) {
        console.log("thePath.path:");
        console.log(theMark.path);
//        }





        updatePathCoords(theMark);

        theMark.left = previousLeft;
        theMark.top = previousTop;
        theMark.setCoords();

        theMark.positionElements();

        canvas.renderAll();

    },
    setProperty: function (property, propertyValue, theVisualProperty, shouldAnimate) {
        var theMark = this;
        if (property === 'shape') {
            if (propertyValue == theMark.shape) {
                return;
            }

            var waitingTime = 250;
            if (theMark.isCompressed) {
                waitingTime = 0;
            }

            setTimeout(function () {
                changeMarkShape(theMark, propertyValue);
            }, waitingTime);
        } else if (property === 'label') {

            this.setLabelProperty(propertyValue);

        } else if (property === 'fill') {

            this.setColorProperty(propertyValue);

        } else if (property === 'xCollection') {

            var xCoordinates = propertyValue;
            theMark.setCoordinates(xCoordinates, 'x', shouldAnimate);

            if (LOG)
                console.log("xCoordinates:");
            if (LOG)
                console.log(xCoordinates);

        } else if (property === 'yCollection') {

            var yCoordinates = propertyValue;
            theMark.setCoordinates(yCoordinates, 'y', shouldAnimate);

            if (LOG)
                console.log("yCoordinates:");
            if (LOG)
                console.log(yCoordinates);

        } else {

            var theNumber = propertyValue.number;

            if (property === 'angle') {
                if (LOG)
                    console.log("Original value: " + theNumber);
                theNumber = theNumber % 360;
                if (LOG)
                    console.log("Modified value: " + theNumber);
            }

            var easing = fabric.util.ease['easeOutBack'];

            if (shouldAnimate) {
                theMark.animateProperty(property, theNumber, 500, easing);
            } else {
                theMark.changeProperty(property, theNumber);
            }


        }

        theMark.setCoords();
        canvas.renderAll();

    },
    associateLabelEvents: function () {
        this.on({
            'moving': function (options) {
                this.positionLabel();
            },
            'rotating': function (options) {
                this.positionLabel();
            },
            'scaling': function (options) {
                this.positionLabel();
            },
        });
    },
    positionLabel: function () {

        if (this.group) {
            return;
        }

        var theMark = this;

        if (theMark.iText) {

            var groupLeft = 0;
            var groupTop = 0;
            var groupScaleX = 1;
            var groupScaleY = 1;

            theMark.setCoords();

            if (theMark.group) {
                groupLeft = theMark.group.left;
                groupTop = theMark.group.top;
                groupScaleX = theMark.group.getScaleX();
                groupScaleY = theMark.group.getScaleY();
            }

            var objectCenter = theMark.getCenterPoint();
            var boundingRect = theMark.getBoundingRect();

            // TODO: Eventually, this compensantion should not be necessary
            compensateBoundingRect(boundingRect);

            var boundingRectCenterBottom = new fabric.Point(theMark.left, objectCenter.y + (boundingRect.height / 2));

            boundingRectCenterBottom.y += theMark.labelGap;
            theMark.iText.text = theMark.label;
            theMark.iText.left = groupLeft + theMark.left * groupScaleX;
            theMark.iText.top = groupTop + boundingRectCenterBottom.y;
            theMark.iText.setCoords();
        }
    },
    _render: function (ctx) {
        this.renderLocationLines(ctx);
        this.callSuper('_render', ctx);
        if (this.iText) {
            this.positionLabel();
        }
    },
    drawBorders: function (ctx) {

        if (!this.hasBorders || this.group) {
            return this;
        }

        var padding = this.padding,
                padding2 = padding * 2,
                vpt = this.getViewportTransform();

        ctx.save();

        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;

        ctx.strokeStyle = widget_selected_stroke_color;
        ctx.lineWidth = widget_selected_stroke_width;
        ctx.setLineDash(widget_selected_stroke_dash_array);


        var scaleX = 1 / this._constrainScale(this.scaleX),
                scaleY = 1 / this._constrainScale(this.scaleY);



        var w = this.getWidth(),
                h = this.getHeight(),
                strokeWidth = this.strokeWidth,
                capped = this.strokeLineCap === 'round' || this.strokeLineCap === 'square',
                vLine = this.type === 'line' && this.width === 0,
                hLine = this.type === 'line' && this.height === 0,
                sLine = vLine || hLine,
                strokeW = (capped && hLine) || !sLine,
                strokeH = (capped && vLine) || !sLine;

        if (vLine) {
            w = strokeWidth / scaleX;
        }
        else if (hLine) {
            h = strokeWidth / scaleY;
        }
        if (strokeW) {
            w += strokeWidth / scaleX;
        }
        if (strokeH) {
            h += strokeWidth / scaleY;
        }
        var wh = fabric.util.transformPoint(new fabric.Point(w, h), vpt, true),
                width = wh.x,
                height = wh.y;
        if (this.group) {
            width = width * this.group.scaleX;
            height = height * this.group.scaleY;
        }

        ctx.strokeRect(
                ~~(-(width / 2) - padding) - 0.5, // offset needed to make lines look sharper
                ~~(-(height / 2) - padding) - 0.5,
                ~~(width + padding2) + 1, // double offset needed to make lines look sharper
                ~~(height + padding2) + 1
                );

        if (this.hasRotatingPoint && this.isControlVisible('mtr') && !this.get('lockRotation') && this.hasControls) {

            var rotateHeight = (-height - (padding * 2)) / 2;

            ctx.beginPath();
            ctx.moveTo(0, rotateHeight);
            ctx.lineTo(0, rotateHeight - this.rotatingPointOffset);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
        return this;

    },
    generateOptionsForShape: function (newShapeType) {

        var theMark = this;
        var shapeVisualProperty = theMark.getVisualPropertyByAttributeName("shape");
        var fill = shapeVisualProperty.fill;
        var stroke = shapeVisualProperty.stroke;

        var options = {
            left: theMark.left,
            top: theMark.top,
            fill: fill,
            stroke: stroke,
            colorForStroke: stroke,
            visualPropertyFill: fill,
            visualPropertyStroke: stroke,
            label: theMark.label,
            angle: -theMark.angle,
            markAsSelected: true,
            animateAtBirth: false
        };

        if (newShapeType === RECTANGULAR_MARK) {

            // "the_" used for SVG paths and files, where the width and height properties do not take into account the scaling
            options.width = theMark.the_width || theMark.width;
            options.height = theMark.the_height || theMark.height;

        } else if (newShapeType === SQUARED_MARK) {

            options.area = (theMark.the_width || theMark.width) * (theMark.the_height || theMark.height);

        } else if (newShapeType === ELLIPTIC_MARK) {

            options.rx = (theMark.the_width || theMark.width) / 2;
            options.ry = (theMark.the_height || theMark.height) / 2;

        } else if (newShapeType === CIRCULAR_MARK) {

            options.radius = ((theMark.the_width || theMark.width) + (theMark.the_height || theMark.height)) / 4;

        } else if (newShapeType === FATFONT_MARK) {

            options.fontFamily = 'Miguta';
            options.number = Math.round(((theMark.the_width || theMark.width) * (theMark.the_height || theMark.height)) / 100);
            options.fontSize = Math.round(((theMark.the_width || theMark.width) + (theMark.the_height || theMark.height)) / 2);
            options.stroke = '';
            options.markAsSelected = false;

        } else if (newShapeType === FILLEDPATH_MARK || newShapeType === SVGPATHGROUP_MARK) {

            options.targetWidth = theMark.the_width;
            options.targetHeight = theMark.the_height;

        }

        return options;

    }

});


//PathMark.fromObject = function(object, callback) {
//   fabric.util.enlivenObjects(object.paths, function(enlivenedObjects) {
//      delete object.paths;
//      callback(new PathMark(enlivenedObjects, object));
//   });
//};

// Set callback function when invoke during JSON parsing
PathMark.fromObject = function (object, callback) {
    callback(new PathMark(object));
};

PathMark.async = true;



Mark.call(PathMark.prototype);

function addPathMarkToCanvas(path, options) {

    console.log("options:");
    console.log(options);

    if (typeof path === 'undefined') {
        path = (options.values && options.values.shape) ? options.values.shape.path : '';
    }

    var svgPathMark = new PathMark(path, options);

//    if (LOG) {
    console.log("svgPathMark:");
    console.log(svgPathMark);
//    }

    canvas.add(svgPathMark);

    var waitingTime = 0;
    if (options.animateAtBirth) {
        waitingTime = 1250;
        svgPathMark.animateBirth(options.markAsSelected, null, null, options.doNotRefreshCanvas);
    }

    svgPathMark.associateEvents(svgPathMark);

    if (options.shouldExpand) {
        svgPathMark.expand(true);
    }

    setTimeout(function () {
        if (options.locatorXmlID) {
            var locator = connectableElements[options.locatorXmlID];
            locator.reportMarkAvailable(svgPathMark);
        }
        if (options.xmlID) {
            svgPathMark.executePendingConnections();
        }
    }, waitingTime);

    return svgPathMark;
}