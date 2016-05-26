var EllipticMark = fabric.util.createClass(fabric.Ellipse, {
    type: 'ellipticMark',
    isEllipticMark: true,
    serializableProperties: ['left', 'top', 'fill', 'colorForStroke', 'rx', 'ry', 'label', 'isCompressed', 'angle'],
    deserializer: addEllipticMarkToCanvas,
    initialize: function (options) {
        options || (options = {});

        options.fill = options.fill || ((options.values && options.values.fill) ? options.values.fill.color.toRgb() : '');
        options.label = options.label || ((options.values && options.values.label) ? options.values.label.string : '');
        options.angle = -(options.angle || ((options.values && options.values.angle) ? options.values.angle.number : 0));

        options.rx = options.rx || ((options.values && options.values.rx) ? options.values.rx.number : null);
        options.ry = options.ry || ((options.values && options.values.ry) ? options.values.ry.number : null);

        if (options.rx !== null && options.ry !== null && typeof options.rx !== 'undefined' && typeof options.ry !== 'undefined') {
            var area = Math.PI * Math.abs(options.rx) * Math.abs(options.ry);
            this.set('area', area);
        } else {
            options.area = options.area || ((options.values && options.values.area) ? options.values.area.number : null);
            var side = Math.sqrt(options.area / Math.PI);
            options.rx = side;
            options.ry = side;
        }

        this.callSuper('initialize', options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', options.strokeWidth || 2);

        this.createVariables();

        this.createIText();

        this.set('shape', ELLIPTIC_MARK);

        this.set('stroke', options.colorForStroke || options.stroke);
        this.set('colorForStroke', options.colorForStroke || this.stroke);

        this.createRectBackground();

        var rxValue = null;
        var ryValue = null;
        var areaValue = null;
        var angleValue = null;

        if (options.values) {
            rxValue = options.values.rx || createNumericValue(this.rx, null, null, 'pixels');
            ryValue = options.values.ry || createNumericValue(this.ry, null, null, 'pixels');
            areaValue = options.values.area || createNumericValue(this.area, null, null, 'pixels');
            angleValue = options.values.angle || createNumericValue(-this.angle, null, null, 'degrees');
        } else {
            rxValue = createNumericValue(this.rx, null, null, 'pixels');
            ryValue = createNumericValue(this.ry, null, null, 'pixels');
            areaValue = createNumericValue(this.area, null, null, 'pixels');
            angleValue = createNumericValue(-this.angle, null, null, 'degrees');
        }

        this.specificProperties.push({attribute: "rx", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData', value: rxValue});
        this.specificProperties.push({attribute: "ry", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData', value: ryValue});
        this.specificProperties.push({attribute: "area", readable: true, writable: true, types: ['number'], updatesTo: ['rx', 'ry'], dataTypeProposition: 'isNumericData', value: areaValue});
        this.specificProperties.push({attribute: "angle", readable: true, writable: true, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: angleValue});

        this.createVisualProperties();
        this.createPositionProperties(options.values);

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
    setProperty: function (property, propertyValue, theVisualProperty, shouldAnimate) {
        var theMark = this;
        if (property === 'shape') {
            if (propertyValue === theMark.shape) {
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


        } else if (property === 'rx' || property === 'ry' || property === 'area') {

            var numericValue = propertyValue.number;


            var changedVisualProperty = theMark.getVisualPropertyByAttributeName(property);
            var propertiesToUpdate = changedVisualProperty.updatesTo;

            if (property === 'area') {



                if (LOG)
                    console.log("%cModifying " + changedVisualProperty.attribute + ". Value: " + numericValue, "background:green; color:white;");



                theMark.area = numericValue; // This value has to be updated as fabric does not know its link with the rx attribute

                // Updating all the attributes that are affected by the modifications in the area property

                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theMark.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theMark.computeUpdatedValueOf(property, numericValue, attributeName);

                    if (LOG)
                        console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");


                    var easing = fabric.util.ease['easeOutBack'];

                    if (shouldAnimate) {
                        theMark.animateProperty(attributeName, updatedValue, 500, easing);
                    } else {
                        theMark.changeProperty(attributeName, updatedValue);
                    }

                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(new Value({isNumericData: true, number: updatedValue, units: '', factor: 1}), false, shouldAnimate);
                    });
                });

                property = 'rx';
                numericValue = Math.sqrt(numericValue / Math.PI);

            } else if (property === 'rx' || property === 'ry') {

                if (LOG)
                    console.log("Modifying " + property + ". Value: " + numericValue);

                var easing = fabric.util.ease['easeOutBack'];

                if (shouldAnimate) {
                    theMark.animateProperty(property, numericValue, 500, easing);
                } else {
                    theMark.changeProperty(property, numericValue);
                }


                theMark.area = Math.PI * numericValue * numericValue;

                // Updating all the attributes that are affected by the modifications in the area property
                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theMark.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theMark.computeUpdatedValueOf(property, numericValue, attributeName);

                    if (LOG)
                        console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");

                    var easing = fabric.util.ease['easeOutBack'];

                    if (shouldAnimate) {
                        theMark.animateProperty(attributeName, updatedValue, 500, easing);
                    } else {
                        theMark.changeProperty(attributeName, updatedValue);
                    }

                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(new Value({isNumericData: true, number: updatedValue, units: '', factor: 1}), false, shouldAnimate);
                    });

                });


            }



        } else {

            var numericValue = propertyValue.number;

            if (property === 'angle') {
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

            if (this.rx == this.ry && this.scaleX == this.scaleY) {

//                if (LOG) console.log("%cHERE HERE HERE HERE", "background: red; color: yellow;");

                var markRealRadius = this.ry * this.scaleY;
                if (markRealRadius < this.propertiesRadius) {
//            if (markRealRadius < this.propertiesRadius) {
                    markRealRadius = this.propertiesRadius + 5;
                }
                var wh = 2 * markRealRadius;
//         boundingRect = {top: objectCenter.y - markRealRadius, left: objectCenter.x - markRealRadius, width: wh, height: wh};
                boundingRect = {top: objectCenter.y - markRealRadius, left: objectCenter.x - markRealRadius, width: wh, height: (2 * this.ry * this.scaleY) * canvas.getZoom()};
            }

            // TODO: Eventually, this compensantion should not be necessary
            compensateBoundingRect(boundingRect);

            var boundingRectCenterBottom = new fabric.Point(theMark.left, objectCenter.y + boundingRect.height / 2);

//            drawRectAt(boundingRectCenterBottom, generateRandomColor(), true);


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
            markAsSelected: true,
            animateAtBirth: false
        };

        if (newShapeType == CIRCULAR_MARK || newShapeType == ELLIPTIC_MARK || newShapeType === SQUARED_MARK) {

            options.area = theMark.area;

//            if (theMark.area) {
//                options.area = theMark.area;
//            } else {
//                // "the_" used for SVG paths and files, where the width and height properties do not take into account the scaling
//                options.width = theMark.the_width || theMark.width;
//                options.height = theMark.the_width || theMark.width;
//            }

        } else if (newShapeType == RECTANGULAR_MARK) {

            options.width = theMark.rx * 2;
            options.height = theMark.ry * 2;

        } else if (newShapeType == FATFONT_MARK) {

            options.fontFamily = 'Miguta';
            options.number = Math.round(theMark.area / 100);
            options.fontSize = Math.round(theMark.rx + theMark.ry);
            options.stroke = '';
            options.markAsSelected = false;

        } else if (newShapeType === PATH_MARK || newShapeType == FILLEDPATH_MARK || newShapeType == SVGPATHGROUP_MARK) {

            options.targetWidth = theMark.rx * 2;
            options.targetHeight = theMark.ry * 2;

        }

        return options;

    }
});
Mark.call(EllipticMark.prototype);

function addEllipticMarkToCanvas(options) {
    var ellipticMark = new EllipticMark(options);
    canvas.add(ellipticMark);
    var waitingTime = 0;
    if (options.animateAtBirth) {
        waitingTime = 1250;
        if (ellipticMark.width > 0 && ellipticMark.height > 0) {
            ellipticMark.animateBirth(options.markAsSelected, null, null, options.doNotRefreshCanvas);
        }
    }
    ellipticMark.associateEvents(ellipticMark);

    if (options.shouldExpand) {
        ellipticMark.expand(true);
    }

    if (options.xmlID) {
        ellipticMark.executePendingConnections();
        if (!options.shouldExpand) {
            canvas.renderAll();
        }
    }

    setTimeout(function () {
        if (options.locatorXmlID) {
            var locator = connectableElements[options.locatorXmlID];
            locator.reportMarkAvailable(ellipticMark);
        }

    }, waitingTime);

    return ellipticMark;
}