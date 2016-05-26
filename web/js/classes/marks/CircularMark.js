var CircularMark = fabric.util.createClass(fabric.Circle, {
    type: 'circularMark',
    isCircularMark: true,
    initialize: function (options) {
        options || (options = {});

        options.fill = options.fill || ((options.values && options.values.fill) ? options.values.fill.color.toRgb() : '');
        options.label = options.label || ((options.values && options.values.label) ? options.values.label.string : '');

        options.radius = options.radius || ((options.values && options.values.radius) ? options.values.radius.number : null);
        if (options.radius !== null && typeof options.radius !== 'undefined') {
            options.area = Math.PI * Math.abs(options.radius) * Math.abs(options.radius);
        } else {
            options.area = options.area || ((options.values && options.values.area) ? options.values.area.number : null);
            var radius = Math.sqrt(options.area / Math.PI);
            options.radius = Math.abs(radius);
        }

//        console.log("0000000000000000000000000000000000000000000000000000 CIRCULAR MARK options:");
//        console.log(options);

        this.callSuper('initialize', options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', options.strokeWidth || 2);

        this.createVariables();

        if (!options.withoutLabel) {
            this.createIText();
        }

        this.set('shape', CIRCULAR_MARK);

        this.set('stroke', options.colorForStroke || options.stroke);
        this.set('colorForStroke', options.colorForStroke || this.stroke);

        this.createRectBackground();

        var radiusValue = null;
        var areaValue = null;

        if (options.values) {
            radiusValue = options.values.radius || createNumericValue(this.radius, null, null, 'pixels');
            areaValue = options.values.area || createNumericValue(this.area, null, null, 'pixels');
        } else {
            radiusValue = createNumericValue(this.radius, null, null, 'pixels');
            areaValue = createNumericValue(this.area, null, null, 'pixels');
        }

        this.specificProperties.push({attribute: "radius", readable: true, writable: true, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData', value: radiusValue});
        this.specificProperties.push({attribute: "area", readable: true, writable: true, types: ['number'], updatesTo: ['radius'], dataTypeProposition: 'isNumericData', value: areaValue});

        this.createVisualProperties();
        this.createPositionProperties(options.values);

        this.setCoreVisualPropertiesValues(options.values);

        this.applyXmlIDs(options.xmlIDs);

    },
    computeUpdatedValueOf: function (updater, value, updatedProperty) {
        if (updater === 'radius') {
            if (updatedProperty === 'area') {
                return Math.PI * value * value;
            }
        } else if (updater === 'area') {
            if (updatedProperty === 'radius') {
                return Math.sqrt(value / Math.PI);
            }
        }
    },
    setProperty: function (property, propertyValue, theVisualProperty, shouldAnimate) {
        var theMark = this;
        if (property == 'shape') {
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
        } else if (property == 'label') {

            this.setLabelProperty(propertyValue);

        } else if (property == 'fill') {

            this.setColorProperty(propertyValue);

        } else if (property == 'radius' || property == 'area') {

            var numericValue = propertyValue.number;

            var changedVisualProperty = theMark.getVisualPropertyByAttributeName(property);
            var propertiesToUpdate = changedVisualProperty.updatesTo;

            if (property == 'area') {

                if (LOG)
                    console.log("%cModifying " + changedVisualProperty.attribute + ". Value: " + numericValue, "background:green; color:white;");

                theMark.area = numericValue; // This value has to be updated as fabric does not know its link with the radius attribute

                // Updating all the attributes that are affected by the modifications in the area property

                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theMark.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theMark.computeUpdatedValueOf(property, numericValue, attributeName);

                    if (LOG)
                        console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");

                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(updatedValue, false, false);
                    });
                });

                property = 'radius';
                numericValue = Math.sqrt(numericValue / Math.PI);

            } else if (property == 'radius') {

                if (LOG)
                    console.log("Modifying RADIUS. Value: " + numericValue);


                theMark.area = Math.PI * numericValue * numericValue;

                // Updating all the attributes that are affected by the modifications in the area property
                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theMark.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theMark.computeUpdatedValueOf(property, numericValue, attributeName);

                    if (LOG)
                        console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");

                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(updatedValue, false, false);
                    });
                });

            }

            var easing = fabric.util.ease['easeOutBack'];

            if (shouldAnimate) {
                theMark.animateProperty(property, numericValue, 500, easing);
            } else {
                theMark.changeProperty(property, numericValue);
            }

        }

        theMark.setCoords();

        var theParentObject = theMark.parentObject;
        if (theParentObject && theParentObject.isLocator) {
            computeUntransformedProperties(theMark);
            repositionWidget(theParentObject, theMark);
        }



        if (!shouldAnimate) {
            canvas.renderAll();
        }



    },
    positionLabel: function () {
        
        if (this.group) {
            return;
        }

        var groupLeft = 0;
        var groupTop = 0;
        var groupScaleX = 1;
        var groupScaleY = 1;

        this.setCoords();

        if (this.group) {
            groupLeft = this.group.left;
            groupTop = this.group.top;
            groupScaleX = this.group.getScaleX();
            groupScaleY = this.group.getScaleY();
        }

        var objectCenter = this.getCenterPoint();
        var boundingRect = this.getBoundingRect();
        if (this.scaleX == this.scaleY) {

            var markRealRadius = this.radius * this.scaleX;
            if (markRealRadius < this.propertiesRadius) {
                markRealRadius = this.propertiesRadius;
            }
            var wh = 2 * markRealRadius;
            boundingRect = {top: objectCenter.y - markRealRadius, left: objectCenter.x - markRealRadius, width: wh, height: 2 * this.radius * this.scaleY};
//            boundingRect = {top: objectCenter.y - markRealRadius, left: objectCenter.x - markRealRadius, width: wh, height: boundingRect.height};
        }

        var boundingRectCenterBottom = new fabric.Point(this.left, objectCenter.y + boundingRect.height / 2);
        boundingRectCenterBottom.y += this.labelGap;
        this.iText.text = this.label;
        this.iText.left = groupLeft + this.left * groupScaleX;
        this.iText.top = groupTop + boundingRectCenterBottom.y;

        this.iText.setCoords();

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
            angle: theMark.angle,
        };

        if (newShapeType === CIRCULAR_MARK) {

            options.area = theMark.area;

        } else if (newShapeType === RECTANGULAR_MARK) {

            options.width = rectangular_mark_default_width;
            options.height = theMark.area / options.width;

        } else if (newShapeType === ELLIPTIC_MARK || newShapeType === SQUARED_MARK) {

            options.area = theMark.area;

        } else if (newShapeType === FATFONT_MARK) {

            options.fontFamily = 'Miguta';
            options.number = Math.round(theMark.area / 100);
            options.fontSize = Math.round(theMark.radius * 2);
            options.stroke = '';

        } else if (newShapeType === PATH_MARK || newShapeType === FILLEDPATH_MARK || newShapeType === SVGPATHGROUP_MARK) {

            options.targetWidth = theMark.radius * 2;
            options.targetHeight = theMark.radius * 2;

        }

        return options;

    }

});
Mark.call(CircularMark.prototype);


function addCircularMarkToCanvas(options) {

    var circularMark = new CircularMark(options);
    canvas.add(circularMark);

    var waitingTime = 0;
    if (options.animateAtBirth) {
        waitingTime = 1250;
        if (circularMark.radius > 0) {
            circularMark.animateBirth(options.markAsSelected, null, null, options.doNotRefreshCanvas);
        }
    }

    if (!options.notAssociateEvents) {
        circularMark.associateEvents(circularMark);
    } else {
        circularMark.evented = false;
        circularMark.selectable = false;
    }

    if (options.shouldExpand) {
        circularMark.expand(true);
    }

    if (options.xmlID) {
        circularMark.executePendingConnections();
        if (!options.shouldExpand) {
            canvas.renderAll();
        }
    }

    setTimeout(function () {
        if (options.locatorXmlID) {
            var locator = connectableElements[options.locatorXmlID];
            locator.reportMarkAvailable(circularMark);
        }
    }, waitingTime);

    return circularMark;
}


