var SquaredMark = fabric.util.createClass(fabric.Rect, {
    type: 'rectangularMark',
    isSquaredMark: true,
    serializableProperties: ['left', 'top', 'fill', 'colorForStroke', 'side', 'label', 'isCompressed'],
    deserializer: addSquaredMarkToCanvas,
    initialize: function (options) {
        options || (options = {});

        options.fill = options.fill || ((options.values && options.values.fill) ? options.values.fill.color.toRgb() : '');
        options.label = options.label || ((options.values && options.values.label) ? options.values.label.string : '');
        options.angle = -(options.angle || ((options.values && options.values.angle) ? options.values.angle.number : -0));

        options.side = options.side || ((options.values && options.values.side) ? options.values.side.number : null);


        if (options.side !== null && typeof options.side !== 'undefined') {
            options.width = Math.abs(options.side);
            options.height = options.width;
            options.area = options.width * options.width;
        } else {
            options.area = options.area || ((options.values && options.values.area) ? options.values.area.number : null);
            var side = Math.sqrt(Math.abs(options.area));
            options.side = side;
            options.width = side;
            options.height = side;
        }

        this.callSuper('initialize', options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', options.strokeWidth || 2);

        this.createVariables();
        this.createIText();

        this.set('shape', SQUARED_MARK);

        this.set('stroke', options.colorForStroke || options.stroke);
        this.set('colorForStroke', options.colorForStroke || this.stroke);

        this.createRectBackground();

        var sideValue = null;
        var areaValue = null;
        var angleValue = null;

        if (options.values) {
            sideValue = options.values.side || createNumericValue(this.side, null, null, 'pixels');
            areaValue = options.values.area || createNumericValue(this.area, null, null, 'pixels');
            angleValue = options.values.angle || createNumericValue(-this.angle, null, null, 'degrees');
        } else {
            sideValue = createNumericValue(this.side, null, null, 'pixels');
            areaValue = createNumericValue(this.area, null, null, 'pixels');
            angleValue = createNumericValue(-this.angle, null, null, 'degrees');
        }

        this.specificProperties.push({attribute: "side", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData', value: sideValue});
        this.specificProperties.push({attribute: "area", readable: true, writable: true, types: ['number'], updatesTo: ['side'], dataTypeProposition: 'isNumericData', value: areaValue});
        this.specificProperties.push({attribute: "angle", readable: true, writable: true, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: angleValue});

        this.createVisualProperties();
        this.createPositionProperties(options.values);
        this.setCoreVisualPropertiesValues(options.values);

        this.applyXmlIDs(options.xmlIDs);

    },
    computeUpdatedValueOf: function (updater, value, updatedProperty) {
        if (updater === 'side') {
            if (updatedProperty === 'area') {
                return value * value;
            }
        } else if (updater === 'area') {
            if (updatedProperty === 'side') {
                return Math.sqrt(value);
            }
        }
    },
    setProperty: function (property, propertyValue, theVisualProperty, shouldAnimate) {



//        if (LOG) console.log("property:");
//        if (LOG) console.log(property);
//
//        if (LOG) console.log("value:");
//        if (LOG) console.log(value);

        var theMark = this;

        if (property == 'shape') {

            var waitingTime = 250;
            if (theMark.isCompressed) {
                waitingTime = 0;
            }

            setTimeout(function () {
                changeMarkShape(theMark, propertyValue);
            }, waitingTime);


        } else if (property == 'label') {

            this.setLabelProperty(propertyValue);

        } else if (property == 'fill') {

            this.setColorProperty(propertyValue);

        } else if (property == 'side' || property == 'area') {


            var changedVisualProperty = theMark.getVisualPropertyByAttributeName(property);
            var propertiesToUpdate = changedVisualProperty.updatesTo;

            if (property == 'area') {


                var numericWidth = propertyValue.number;

                if (LOG)
                    console.log("%cModifying " + changedVisualProperty.attribute + ". Value: " + propertyValue, "background:green; color:white;");

                theMark.area = numericWidth; // This value has to be updated as fabric does not know its link with the side attribute

                // Updating all the attributes that are affected by the modifications in the area property

                propertiesToUpdate.forEach(function (attributeName) {

                    if (attributeName === 'side') {




                        // When the side is to be affected, it has to affect both the width and the height of the mark

                        var visualProperty = theMark.getVisualPropertyByAttributeName(attributeName);



                        visualProperty.inConnectors.forEach(function (inConnector) {
                            inConnector.contract();
                        });

                        var updatedValue = theMark.computeUpdatedValueOf(property, numericWidth, attributeName);

                        theMark.side = updatedValue;
                        visualProperty.value = createNumericValue(updatedValue);

                        if (LOG)
                            console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");

                        var easing = fabric.util.ease['easeOutBack'];
                        if (updatedValue < 15) {
                            easing = fabric.util.ease['easeOutCirc'];
                        }

                        if (shouldAnimate) {
                            theMark.animateProperty("width", updatedValue, 500, easing);
                            theMark.animateProperty("height", updatedValue, 500, easing);
                        } else {
                            theMark.changeProperty("width", updatedValue);
                            theMark.changeProperty("height", updatedValue);
                        }

                        visualProperty.outConnectors.forEach(function (outConnector) {
                            if (LOG)
                                console.log("+++ + + + + + + + + + + + outConnector");
                            if (LOG)
                                console.log(outConnector);
                            outConnector.setValue(visualProperty.value, false, shouldAnimate);
                        });


                    } else {

                        var visualProperty = theMark.getVisualPropertyByAttributeName(attributeName);
                        var updatedValue = theMark.computeUpdatedValueOf(property, numericWidth, attributeName);

                        if (LOG)
                            console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");

                        var easing = fabric.util.ease['easeOutBack'];
                        if (attributeName === 'side' && updatedValue < 15) {
                            easing = fabric.util.ease['easeOutCirc'];
                        }

                        if (shouldAnimate) {
                            theMark.animateProperty(attributeName, updatedValue, 500, easing);
                        } else {
                            theMark.changeProperty(attributeName, updatedValue);
                        }

                        visualProperty.outConnectors.forEach(function (outConnector) {
                            outConnector.setValue(updatedValue, false, shouldAnimate);
                        });

                    }





                });

                property = 'width';
                numericWidth = Math.sqrt(numericWidth);

            } else if (property == 'side') {

                var numericSide = propertyValue.number;

                if (LOG)
                    console.log("propertyValue:");
                if (LOG)
                    console.log(propertyValue);

                if (LOG)
                    console.log("numericSide:");
                if (LOG)
                    console.log(numericSide);

                if (LOG)
                    console.log("%cModifying " + property + ". Value: " + numericSide, "background: black; color: white;");

                var easing = fabric.util.ease['easeOutBack'];
                if (numericSide < 15) {
                    easing = fabric.util.ease['easeOutCirc'];
                }

                if (shouldAnimate) {
                    if (LOG)
                        console.log("property WITH animation");
                    theMark.animateProperty("width", numericSide, 500, easing, true); // because of the last parameter of this call set to true, this call will not refresh the canvas as the animation is performed
                    theMark.animateProperty("height", numericSide, 500, easing);
                } else {
                    if (LOG)
                        console.log("property  with NO animation");
                    theMark.changeProperty("width", numericSide);
                    theMark.changeProperty("height", numericSide);
                }

                theMark.area = numericSide * numericSide;

                // Updating all the attributes that are affected by the modifications in the area property
                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theMark.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theMark.computeUpdatedValueOf(property, numericSide, attributeName);

                    if (LOG)
                        console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");

                    var easing = fabric.util.ease['easeOutBack'];
                    if (attributeName == 'side' && updatedValue < 15) {
                        easing = fabric.util.ease['easeOutCirc'];
                    }

                    if (shouldAnimate) {
                        if (LOG)
                            console.log("WITH animation");
                        theMark.animateProperty(attributeName, updatedValue, 500, easing);
                    } else {
                        if (LOG)
                            console.log("with NO animation");
                        theMark.changeProperty(attributeName, updatedValue);
                    }

                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(updatedValue, false, shouldAnimate);
                    });
                });

                // updating the value of the outgoing connectors
                changedVisualProperty.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(theVisualProperty.value.clone(), false, shouldAnimate);
                });

            }

        } else {

            var numericValue = propertyValue.number;

            if (property == 'angle') {
                if (LOG)
                    console.log("Original value: " + numericValue);
                numericValue = numericValue % 360;
                if (LOG)
                    console.log("Modified value: " + numericValue);
            }

            var easing = fabric.util.ease['easeOutBack'];

            if (shouldAnimate) {
                theMark.animateProperty(property, numericValue, 500, easing);
            } else {
                theMark.changeProperty(property, numericValue);
            }


        }

        theMark.setCoords();
        canvas.renderAll();

    },
    positionLabel: function () {
        
        this.setCoords();

        var objectCenter = this.getCenterPoint();
        var boundingRect = this.getBoundingRect();

        // TODO: Eventually, this compensantion should not be necessary
        compensateBoundingRect(boundingRect);

        var boundingRectCenterBottom = new fabric.Point(this.left, objectCenter.y + (boundingRect.height / 2));
        boundingRectCenterBottom.y += this.labelGap;
        this.iText.text = this.label;
        this.iText.left = this.left;
        this.iText.top = boundingRectCenterBottom.y;

        this.iText.setCoords();
    },
    _render: function (ctx) {
        
        
        
        this.renderLocationLines(ctx);
        this.callSuper('_render', ctx);
        if (this.iText && !this.group) {
            this.positionLabel();
        }
        

        
    },
    generateOptionsForShape: function (newShapeType) {

        var theMark = this;

        var options = {
            left: theMark.left,
            top: theMark.top,
            fill: theMark.fill,
            stroke: theMark.colorForStroke || theMark.stroke,
            colorForStroke: theMark.colorForStroke || theMark.stroke,
            label: theMark.label,
            angle: -theMark.angle,
        };

        if (newShapeType === ELLIPTIC_MARK) {

            options.rx = theMark.width / 2;
            options.ry = theMark.height / 2;

        } else if (newShapeType === RECTANGULAR_MARK) {

            options.width = rectangular_mark_default_width;
            options.height = theMark.area / options.width;

        } else if (newShapeType === CIRCULAR_MARK || newShapeType === ELLIPTIC_MARK) {

            options.area = theMark.area;

        } else if (newShapeType === FATFONT_MARK) {

            options.fontFamily = 'Miguta';
            options.number = Math.round(theMark.area / 100);
            options.fontSize = Math.round((theMark.width + theMark.height) / 2);
            options.stroke = '';

        } else if (newShapeType === PATH_MARK || newShapeType === FILLEDPATH_MARK || newShapeType === SVGPATHGROUP_MARK) {

            options.targetWidth = theMark.width;
            options.targetHeight = theMark.height;

        }

        return options;

    }
});
Mark.call(SquaredMark.prototype);

function addSquaredMarkToCanvas(options) {

    var squaredMark = new SquaredMark(options);
    canvas.add(squaredMark);

    var waitingTime = 0;
    if (options.animateAtBirth) {
        waitingTime = 1250;
        if (squaredMark.side > 0) {
            squaredMark.animateBirth(options.markAsSelected, null, null, options.doNotRefreshCanvas);
        }
    }
    squaredMark.associateEvents(squaredMark);

    if (options.shouldExpand) {
        squaredMark.expand(true);
    }

    if (options.xmlID) {
        squaredMark.executePendingConnections();
        if (!options.shouldExpand) {
            canvas.renderAll();
        }
    }

    setTimeout(function () {
        if (options.locatorXmlID) {
            var locator = connectableElements[options.locatorXmlID];
            locator.reportMarkAvailable(squaredMark);
        }
    }, waitingTime);

    return squaredMark;
}