// The Output mixing defines all the common properties and behaviours that outputs share
var Mark = function () {

    this.set('iVoLVERClass', 'mark');

    this.set('isMark', true);

    this.set('isAlignable', true);

    this.set('isClonable', 'true');

    this.set('hoverCursor', 'move');

    this.set('originX', 'center');
    this.set('originY', 'center');
    this.set('transparentCorners', false);

    this.set('perPixelTargetFind', true);
    this.set('isCompressed', true);

    this.set('showLabel', true);

    this.set('indent', 20);
    this.set('propertiesRadius', 25);

    this.set('propertiesSeparation', 65);
    this.set('propertiesGap', 35);
    this.set('labelGap', 15);

    this.set('coreProperties', new Array());
    this.coreProperties.push({attribute: "shape", readable: true, writable: true, types: ['string', 'object'], updatesTo: [], dataTypeProposition: 'isShapeData'});
    this.coreProperties.push({attribute: "fill", readable: true, writable: true, types: ['string'], updatesTo: [], dataTypeProposition: 'isColorData'});
    this.coreProperties.push({attribute: "label", readable: true, writable: true, types: ['string', 'number'], updatesTo: [], dataTypeProposition: 'isStringData'});

    this.set('hasBorders', false);
    this.set('hasControls', false);
    this.set('hasRotatingPoint', false);

    this.set('lockScalingX', true);
    this.set('lockScalingY', true);
    this.set('lockRotation', true);

    this.setXmlIDs = function (from) {

        var theMark = this;

        theMark.xmlID = from++;
        theMark.visualProperties.forEach(function (visualProperty) {
            visualProperty.xmlID = from++;
        });
        theMark.xVisualProperty.xmlID = from++;
        theMark.yVisualProperty.xmlID = from++;

        return from;
    };

    this.setCoreVisualPropertiesValues = function (values) {

        var shapeValue = null;
        var fillValue = null;
        var labelValue = null;

        if (values) {
            shapeValue = values.shape || ((this.shape.svgPathGroupMark || this.shape.path) ? createShapeValue(this.shape.shape, this.shape.svgPathGroupMark || this.shape.path) : createShapeValue(this.shape));
            fillValue = values.fill || createColorValue(new fabric.Color(this.fill));
            labelValue = values.label || createStringValue(this.label);
        } else {
            shapeValue = this.shape.svgPathGroupMark || this.shape.path ? createShapeValue(this.shape.shape, this.shape.svgPathGroupMark || this.shape.path) : createShapeValue(this.shape);
            fillValue = createColorValue(new fabric.Color(this.fill));
            labelValue = createStringValue(this.label);
        }

        if (LOG) {
            console.log("shapeValue:");
            console.log(shapeValue);
        }

        this.getVisualPropertyByAttributeName('shape').value = shapeValue;
        this.getVisualPropertyByAttributeName('fill').value = fillValue;
        this.getVisualPropertyByAttributeName('label').value = labelValue;
    };

    this.executePendingConnections = function () {

        var theMark = this;

        // Checking all the pending connections that might have not been executed before due to the loading order
        console.log("%c" + "For the MARK", "background: rgb(81,195,183); color: white;");
        executePendingConnections(theMark.xmlID);

        // The same is made for the visual properties of the mark, as they can also be connected
        theMark.visualProperties.forEach(function (visualProperty) {
            console.log("%c" + "For one VISUAL PROPERTY", "background: rgb(81,195,183); color: white;");
            executePendingConnections(visualProperty.xmlID);
        });

        console.log("%c" + "For the two POSITION VISUAL PROPERTIES", "background: rgb(81,195,183); color: white;");

        // And for the position visual properties of the mark
        executePendingConnections(theMark.xVisualProperty.xmlID);
        executePendingConnections(theMark.yVisualProperty.xmlID);

    };

    this.applyXmlIDs = function (xmlIDs) {

        if (xmlIDs) {

            var theMark = this;

            addToConnectableElements(theMark);

            if (xmlIDs) {

                for (var attribute in xmlIDs) {

                    var xmlID = xmlIDs[attribute];
                    var visualProperty = theMark.getVisualPropertyByAttributeName(attribute);
                    if (visualProperty !== null) {
                        visualProperty.xmlID = xmlID;
                        addToConnectableElements(visualProperty);
                    }
                }

                var xVisualProperty = theMark.xVisualProperty;
                var yVisualProperty = theMark.yVisualProperty;

                xVisualProperty.xmlID = xmlIDs['x'];
                yVisualProperty.xmlID = xmlIDs['y'];

                addToConnectableElements(xVisualProperty);
                addToConnectableElements(yVisualProperty);

            }

        }

    };

    this.toXML = function () {
        var theMark = this;
        var markNode = createXMLElement(this.iVoLVERClass);
        addAttributeWithValue(markNode, "xmlID", theMark.xmlID);
        addAttributeWithValue(markNode, "shape", theMark.getVisualPropertyByAttributeName('shape').value.shape);
        appendElementWithValue(markNode, "left", theMark.left);
        appendElementWithValue(markNode, "top", theMark.top);
        appendElementWithValue(markNode, "stroke", new fabric.Color(theMark.visualProperties[0].stroke).toRgba());
        appendElementWithValue(markNode, "visualPropertyFill", new fabric.Color(theMark.visualProperties[0].fill).toRgba());
        appendElementWithValue(markNode, "isExpanded", !theMark.isCompressed);

        if (theMark.parentObject && theMark.parentObject.isLocator) {
            appendElementWithValue(markNode, "locatorXmlID", theMark.parentObject.xmlID);
        }

        theMark.visualProperties.forEach(function (visualProperty) {
            var propertyNode = visualProperty.toXML();
            markNode.append(propertyNode);
        });
        markNode.append(theMark.xVisualProperty.toXML());
        markNode.append(theMark.yVisualProperty.toXML());
        return markNode;
    };


    this.createVariables = function () {
        this.set('inConnectors', new Array());
        this.set('widgets', new Array());
        this.set('visualProperties', new Array());
        this.set('specificProperties', new Array());
    }

    this.createIText = function () {
        var theMark = this;
        var label = theMark.label || '';
        var iText = new fabric.IText(label, {
            originX: 'center',
            originY: 'center',
            fontSize: 20,
            textAlign: 'center',
            fontFamily: 'calibri',
            hasControls: false,
            hasBorders: false,
            hasRotatingPoint: false,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockMovementX: true,
            lockMovementY: true,
            selectable: false,
            evented: false,
            editable: false
        });
        theMark.set('label', label);
        theMark.set('iText', iText);
        canvas.add(iText);

        if (theMark.positionLabel) {
            theMark.positionLabel();
        }

        setTimeout(function () {
            bringToFront(iText);
        }, 100);

    };

    this.addToGroup = function (theGroup) {
        var theMark = this;
        if (theMark.group !== theGroup) {
            theGroup.addWithUpdate(theMark);
        }
        if (theMark.iText && theMark.iText.text && (theMark.iText.group !== theGroup)) {
            theGroup.addWithUpdate(theMark.iText);
        }
        if (!theMark.isCompressed) {
            if (theMark.backgroundRect && (theMark.backgroundRect.group !== theGroup)) {
                theGroup.addWithUpdate(theMark.backgroundRect);
            }
            theMark.visualProperties.forEach(function (visualProperty) {
                if (visualProperty.group !== theGroup) {
                    theGroup.addWithUpdate(visualProperty);
                }
            });
        }
    };

    this.createRectBackground = function () {
        var theMark = this;
        var backgroundRect = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            top: theMark.top,
            left: theMark.left,
            width: 0,
            height: 0,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasControls: false,
            hasRotationPoint: false,
            hasBorders: false,
            selectable: true,
            evented: true,
            rx: 15,
            ry: 15
        });
        backgroundRect.on({
            'doubleTap': function (options) {
                theMark.trigger('doubleTap', options);
            },
//            'moving': function (options) {
//                if (!theMark.isCompressed) {
//
//                    var localPointer = backgroundRect.getLocalPointer(options.e);
//                    if (LOG) console.log(localPointer);
//
//                    theMark.left = backgroundRect.left;
//                    theMark.top = backgroundRect.top + theMark.indent + theMark.height / 2 - localPointer.y / 2;
//                    theMark.positionElements();
//                }
//            }
        });
        this.set('backgroundRect', backgroundRect);
        canvas.add(backgroundRect);
    };

    // The left and top are used for the SVGPathGroupMark, as, when loaded, its position is always set to the point 0,0
    this.createVisualProperties = function () {
        for (var i = 0; i < this.coreProperties.length; i++) {
            var visualProperty = CreateVisualProperty(this.coreProperties[i], this, this.left, this.top);
            this.visualProperties.push(visualProperty);
            visualProperty.setCoords();
            visualProperty.evented = false;
        }
        for (var i = 0; i < this.specificProperties.length; i++) {
            var visualProperty = CreateVisualProperty(this.specificProperties[i], this, this.left, this.top);
            this.visualProperties.push(visualProperty);
            visualProperty.setCoords();
            visualProperty.evented = false;
        }
    };

    this.createPositionProperties = function (values) {

        var xValue = null;
        var yValue = null;

        if (values) {
            xValue = values.x;
            yValue = values.y;
        }

        var xProperty = {attribute: "x", readable: true, writable: true, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: xValue};
        this.xVisualProperty = CreateVisualProperty(xProperty, this, this.left, this.top);
        this.xVisualProperty.mark = this;
        this.xVisualProperty.setCoords();
        this.xVisualProperty.evented = false;

        var yProperty = {attribute: "y", readable: true, writable: true, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: yValue};
        this.yVisualProperty = CreateVisualProperty(yProperty, this, this.left, this.top);
        this.yVisualProperty.mark = this;
        this.yVisualProperty.setCoords();
        this.yVisualProperty.evented = false;

    };

    // The finalScaleX and finalScaleY parameters are sent to avoid that the mark, after the animation, dissapear in the case where it is born with a scale of 0
    this.animateBirth = function (markAsSelected, finalScaleX, finalScaleY, doNotRefreshCanvas) {

        if (doNotRefreshCanvas) {
            if (LOG) {
                console.log("%cThe canvas will not be refreshed in this BIRTH animation...", "background: green; color: black;");
            }
        }

        var theMark = this;
        var scaleX = finalScaleX || this.scaleX;
        var scaleY = finalScaleY || this.scaleY;
        this.set('scaleX', 0);
        this.set('scaleY', 0);

        if (markAsSelected) {
            this.applySelectedStyle(false);
        }

        var easing = fabric.util.ease['easeOutElastic'];
        var duration = 1200;

        theMark.animate('scaleX', scaleX, {
            duration: duration,
            easing: easing
        });

        var scaleYAnimationOptions = {};
        scaleYAnimationOptions['duration'] = duration;
        scaleYAnimationOptions['easing'] = easing;

        if (!doNotRefreshCanvas) {
            scaleYAnimationOptions['onChange'] = refresherFunction;
            scaleYAnimationOptions['onComplete'] = refresherFunction;
        }

        if (LOG) {
            console.log("scaleYAnimationOptions:");
            console.log(scaleYAnimationOptions);
        }

        theMark.animate('scaleY', scaleY, scaleYAnimationOptions);


    };

    this.applySelectedStyle = function (selectConnectors) {

        if (LOG) {
            console.log("MARK selected");
        }

        var theMark = this;
        theMark.isSelected = true;

        theMark.stroke = widget_selected_stroke_color;
        theMark.strokeWidth = widget_selected_stroke_width;
        theMark.strokeDashArray = widget_selected_stroke_dash_array;

        if (selectConnectors) {

            theMark.inConnectors.forEach(function (inConnector) {
                inConnector.applySelectedStyle(true, false);
            });

            theMark.visualProperties.forEach(function (visualProperty) {
                if (visualProperty.inConnectors.length || visualProperty.outConnectors.length) {
                    visualProperty.applySelectedStyle(true);
                }
            });
        }

    };

    this.applyUnselectedStyle = function (unSelectConnectors) {

        if (LOG) {
            console.log("MARK UNselected");
        }

        var theMark = this;
        theMark.isSelected = false;

        theMark.stroke = this.colorForStroke;
        theMark.strokeWidth = this.originalStrokeWidth;
        theMark.strokeDashArray = [];

        if (unSelectConnectors) {

            theMark.inConnectors.forEach(function (inConnector) {
                inConnector.applyUnselectedStyle(true, false);
            });

            theMark.visualProperties.forEach(function (visualProperty) {
                if (visualProperty.inConnectors.length || visualProperty.outConnectors.length) {
                    visualProperty.applyUnselectedStyle(true);
                }
            });
        }
    };

    this.blink = function (increment) {

        if (LOG) {
            console.log("BLINKING MARK");
            console.log("this.lockMovementX: " + this.lockMovementX);
            console.log("this.lockMovementY: " + this.lockMovementY);
        }

        var theMark = this;
        increment = increment || 0.3;
        var duration = 100;
        var easing = fabric.util.ease['easeInCubic'];
        theMark.animate('scaleX', '+=' + increment, {
            duration: duration,
            easing: easing,
            onComplete: function () {
                theMark.animate('scaleX', '-=' + increment, {
                    duration: 1100,
                    easing: fabric.util.ease['easeOutElastic']
                });
            }
        });
        theMark.animate('scaleY', '+=' + increment, {
            duration: duration,
            onChange: canvas.renderAll.bind(canvas),
            easing: easing,
            onComplete: function () {
                theMark.animate('scaleY', '-=' + increment, {
                    duration: 1100,
                    onChange: canvas.renderAll.bind(canvas),
                    easing: fabric.util.ease['easeOutElastic']
                });
            }
        });
    };


    this.changeProperty = function (property, value) {

        if (LOG) {
            console.log("%cchangeProperty " + property + " with NO animation", "background:blue; color:yellow;");
        }
        var theMark = this;

        if (property === 'angle') {
            value = -value;
        }

        if (theMark.isPathMark && (property === 'width' || property === 'height')) {

            var previousLeft = theMark.left;
            var previousTop = theMark.top;
            if (property === 'width') {
                theMark.generateScaledCoordinates('x', value);
            } else {
                theMark.generateScaledCoordinates('y', value);
            }
            updatePathCoords(theMark);

            if (property === 'width') {
                theMark.scaleX = 1;
            } else if (property === 'height') {
                theMark.scaleY = 1;
            }


            theMark.left = previousLeft;
            theMark.top = previousTop;
            theMark.setCoords();

            theMark.set("the_" + property, value);

        } else if (theMark.isSVGPathMark || theMark.isSVGPathGroupMark && (property === 'width' || property === 'height')) {
            theMark.set("the_" + property, value);
            if (property === 'width') {
                property = "scaleX";
                value = value / theMark.width;
            } else if (property === 'height') {
                property = "scaleY";
                value = value / theMark.height;
            }
        }

        theMark.set(property, value);


        theMark.positionElements();

        // the unstransformed angle should also change if this mark has a locator or parent object associated to it
        computeUntransformedProperties(theMark);



    };
    this.animateProperty = function (property, value, duration, easing, doNotRefreshCanvas) {

        var theMark = this;

        if (property === 'angle') {
            value = -value;
        }

        if (LOG)
            console.log("Previous property: " + property);
        if (LOG)
            console.log("Previous value: " + value);

        if (theMark.isPathMark && (property === 'width' || property === 'height')) {

            var startValue = theMark[property];
            var endValue = value;

            // Refreshing the canvas only once
            fabric.util.animate({
                duration: duration,
                easing: easing,
                startValue: startValue,
                endValue: endValue,
                onChange: function (currentValue) {

                    var previousLeft = theMark.left;
                    var previousTop = theMark.top;
                    if (property === 'width') {
                        theMark.generateScaledCoordinates('x', currentValue);
                    } else {
                        theMark.generateScaledCoordinates('y', currentValue);
                    }
                    updatePathCoords(theMark);
                    theMark.scaleX = 1;
                    theMark.scaleY = 1;
                    theMark.left = previousLeft;
                    theMark.top = previousTop;
                    theMark.setCoords();

                },
                onComplete: function () {

                    var previousLeft = theMark.left;
                    var previousTop = theMark.top;
                    if (property === 'width') {
                        theMark.generateScaledCoordinates('x', endValue);
                    } else {
                        theMark.generateScaledCoordinates('y', endValue);
                    }
                    updatePathCoords(theMark);
                    theMark.scaleX = 1;
                    theMark.scaleY = 1;
                    theMark.left = previousLeft;
                    theMark.top = previousTop;
                    theMark.setCoords();

                }
            });

            theMark.set("the_" + property, value);

        } else {

            if (theMark.isSVGPathMark || theMark.isSVGPathGroupMark && (property === 'width' || property === 'height')) {

                theMark.set("the_" + property, value);

                if (property === 'width') {
                    property = "scaleX";
                    value = value / theMark.width;
                } else if (property === 'height') {
                    property = "scaleY";
                    value = value / theMark.height;
                }


            }

            theMark.animate(property, value, {
                duration: duration,
                easing: easing,
                onChange: function () {
                    theMark.positionElements();
                    // the unstransformed angle should also change if this mark has a locator or parent object associated to it
                    computeUntransformedProperties(theMark);
                    if (!doNotRefreshCanvas) {
                        canvas.renderAll();
                    }
                },
                onComplete: function () {
                    theMark.positionElements();
                    // the unstransformed angle should also change if this mark has a locator or parent object associated to it
                    computeUntransformedProperties(theMark);
                    if (!doNotRefreshCanvas) {
                        canvas.renderAll();
                    }
                }
            });


        }



    };

    this.remove = function (shouldDelete) {

        var theMark = this;


        if (shouldDelete) {


            var iText = theMark.iText;
            var visualProperties = theMark.visualProperties;
            var backgroundRect = theMark.backgroundRect;

            var waitingTime = 0;

            theMark.xVisualProperty.disconnect(false, true);
            theMark.yVisualProperty.disconnect(false, true);

            // Only the last visual property should be able to check whether or not to refresh the canvas
            var totalVisualProperties = visualProperties.length;
            for (var i = 0; i < totalVisualProperties; i++) {
                var visualProperty = visualProperties[i];
                visualProperty.disconnect((i === totalVisualProperties - 1) && theMark.isCompressed, true);
            }

            if (!theMark.isCompressed) {
                waitingTime = 550;
                theMark.compress(true);
            }

            setTimeout(function () {

                var secondWaiting = 350;
                hideWithAnimation(theMark, true);

                setTimeout(function () {

                    if (iText && iText.canvas) {
                        iText.remove();
                    }

                    if (backgroundRect && backgroundRect.canvas) {
                        backgroundRect.remove();
                    }

                    if (theMark && theMark.canvas) {
                        theMark.callSuper('remove');
                    }

                }, secondWaiting);


            }, waitingTime);

        } else {
            if (theMark.iText) {
                theMark.iText.remove();
            }
            theMark.callSuper('remove');
        }




    };


    this.getDefaultModifiableVisualPropertyByType = function (value) {

        if (LOG)
            console.log("getDefaultModifiableVisualPropertyByType: FUNCTION");

        if (LOG)
            console.log("value");
        if (LOG)
            console.log(value);

        var theMark = this;
        if (value.isColorData) {
            return theMark.getVisualPropertyByAttributeName('fill');
        } else if (value.isDateAndTimeData || value.isDurationData) {
            return null;
        } else if (value.isNumericData) {
            if (theMark.isRectangularMark || theMark.isSVGPathMark || theMark.isSVGPathGroupMark) {
                return theMark.getVisualPropertyByAttributeName('height');
            } else if (theMark.isCircularMark) {
                return theMark.getVisualPropertyByAttributeName('radius');
            } else if (theMark.isSquaredMark) {
                return theMark.getVisualPropertyByAttributeName('side');
            } else if (theMark.isEllipticalMark) {
                return theMark.getVisualPropertyByAttributeName('ry');
            } else if (theMark.isFatFontMark) {
                return theMark.getVisualPropertyByAttributeName('number');
            }
        } else if (value.isShapeData) {
            return theMark.getVisualPropertyByAttributeName('shape');
        } else if (value.isStringData) {
            return theMark.getVisualPropertyByAttributeName('label');
        } else {
            return null;
        }
    };

    this.setLabelProperty = function (stringValue) {
        var theMark = this;
        if (!stringValue.isStringData) {
            return;
        }
        var theString = stringValue.string;
        theMark.label = '' + theString;

        theMark.iText.text = theMark.label;

        theMark.positionElements();

        setTimeout(function () {
            theMark.positionElements();
        }, 450);

    };

    this.setColorProperty = function (colorValue) {

        var theMark = this;
        if (!colorValue.isColorData) {
            return;
        }
        var fillColor = "#" + colorValue.color.toHex();

        console.log("fillColor");
        console.log(fillColor);

        var fabricColor = new fabric.Color(fillColor);
        var source = fabricColor.getSource();
        var r = source[0];
        var g = source[1];
        var b = source[2];

        var newFill = rgb(r, g, b);
        var newStroke = darkenrgb(r, g, b);

        theMark.changeColors(newFill, newStroke);

    };

    this.animateColorProperty = function (colorValue) {

        console.log(colorValue);

        var theMark = this;
        if (!colorValue.isColorData) {
            return;
        }

        var source = colorValue.color.getSource();
        var r = source[0];
        var g = source[1];
        var b = source[2];

        var duration = 500;
        var currentFill = null;
        var currentStroke = null;

        var newStroke = darkenrgb(r, g, b);
        var oldStroke = theMark.colorForStroke;
        fabric.util.animateColor(oldStroke, newStroke, duration, {
            onChange: function (val) {
                currentStroke = val;
            }
        });

        var newFill = rgb(r, g, b);
        var oldFill = theMark.getFill();
        fabric.util.animateColor(oldFill, newFill, duration, {
            onChange: function (val) {
                currentFill = val;
                theMark.changeColors(currentFill, currentStroke);

                if (theMark.isSelected) {
                    theMark.stroke = widget_selected_stroke_color;
                }

                canvas.renderAll();
            }
        });

//        var rgbColor = hexToRGB(fillColor);
//        var strokeColor = darkenrgb(rgbColor.r, rgbColor.g, rgbColor.b);
//        theMark.changeColors(fillColor, strokeColor);
    };

    this.changeColors = function (fill, stroke) {

        this.fill = fill;
        this.stroke = stroke;
        this.colorForStroke = stroke;

        this.backgroundRect.stroke = stroke;
        this.visualProperties.forEach(function (visualProperty) {
            visualProperty.colorForStroke = stroke;
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

    this.animateVisualProperty = function (i, prop, endValue, duration, easing, refreshCanvas, removeAfterCompletion, activateEventsAfterAnimation, statusForVisualPropertiesEventsAfterAnimation) {
        var theMark = this;
        var visualProperty = theMark.visualProperties[i];
        fabric.util.animate({
            startValue: visualProperty[prop],
            endValue: endValue,
            duration: duration,
            easing: easing,
            onChange: function (value) {
                visualProperty[prop] = value;
                if (prop === 'left') {
                    visualProperty.inConnectors.forEach(function (inConnector) {
                        inConnector.set({'x2': visualProperty.left, 'y2': visualProperty.top});
                    });
                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.set({'x1': visualProperty.left, 'y1': visualProperty.top});
                    });
                }
                // only render once
                if (refreshCanvas) {
                    canvas.renderAll();
                }
                visualProperty.setCoords();
            },
            onComplete: function () {
                visualProperty.setCoords();
                theMark.positionConnectors();
                if (removeAfterCompletion) {
                    visualProperty.remove();
                }

                if (activateEventsAfterAnimation) {
                    theMark.evented = true;
                    gestureSetEnabled(manager, 'pan1Finger', true);
                }

                theMark.setEnabledVisualPropertiesEvents(statusForVisualPropertiesEventsAfterAnimation);

            }
        });
    };

    this.setEnabledVisualPropertiesEvents = function (status) {
        this.visualProperties.forEach(function (visualProperty) {
            visualProperty.evented = status;
        });
    };


    this.expand = function (refreshCanvas) {

        if (!this.isCompressed || this.group) { // No expansion is allowed if a mark is contained by a group
            return;
        }

        if (LOG) {
            console.log("%cExpanding", "background:red; color:white");
            console.log("refreshCanvas: " + refreshCanvas + " - " + this.type);
        }

        var theMark = this;
        theMark.setCoords();

        // Disabling any event for this mark. This will be enabled once the animations of this method are done.
        theMark.evented = false;
        gestureSetEnabled(manager, 'pan1Finger', false);

        var theBackground = this.backgroundRect;
//        var duration = 500;
        var duration = 400;
        var easing = fabric.util.ease['easeOutCubic'];

        var boundingRect = theMark.getBoundingRect();
        var markCenter = theMark.getCenterPoint();

        if (theMark.isCircularMark && (theMark.scaleX == theMark.scaleY)) {
            var markRealRadius = theMark.radius * theMark.scaleX;
            if (boundingRect.width / canvas.getZoom() < theMark.propertiesRadius) {
                markRealRadius = theMark.propertiesRadius + 5;
            }
            var wh = 2 * markRealRadius;
            boundingRect = {top: markCenter.y - markRealRadius, left: markCenter.x - markRealRadius, width: wh, height: wh};

        } else if (theMark.isEllipticMark && (theMark.rx == theMark.ry) && (theMark.scaleX == theMark.scaleY)) {

            var markRealRadius = theMark.rx * theMark.scaleX;
            if (markRealRadius < theMark.propertiesRadius) {
                markRealRadius = theMark.propertiesRadius + 5;
            }
            var wh = 2 * markRealRadius * canvas.getZoom();
            boundingRect = {top: markCenter.y - markRealRadius, left: markCenter.x - markRealRadius, width: wh, height: (2 * this.ry * this.scaleY) * canvas.getZoom()};
        }

        // The dimensions of the bounding rectangle are absolute, thus, the zoom level has to be taken into account
        if (boundingRect.width / canvas.getZoom() < theMark.propertiesRadius) {
            boundingRect.width = 2 * theMark.propertiesRadius;
        }

        // TODO: Eventually, this compensantion should not be necessary
        if (theMark.isFatFontMark || theMark.isSVGPathGroupMark || theMark.isSVGPathMark || theMark.isPathMark || theMark.isRectangularMark || theMark.isEllipticMark || theMark.isSquaredMark) {
            compensateBoundingRect(boundingRect);
        }

        var newHeight = theMark.visualProperties.length * (2 * theMark.propertiesRadius + 15) + boundingRect.height + 2 * theMark.indent;
        if (this.iText && this.iText.text != '') {
            newHeight += (2 * theMark.labelGap);
        }

        var newWidth = boundingRect.width + 2 * theMark.indent;
        var newTop = theMark.top + (newHeight / 2 - boundingRect.height / 2 - theMark.indent);

        theBackground.width = newWidth;
        theBackground.height = 0;
        theBackground.left = theMark.left;
        theBackground.top = theMark.top;
        theBackground.stroke = theMark.visualPropertyStroke || theMark.colorForStroke;

        theBackground.strokeWidth = 1;

        bringToFront(theBackground);
        bringToFront(theMark);

        var theParentObject = theMark.parentObject;
        if (theParentObject && theParentObject.isLocator && !theParentObject.isCompressed && theParentObject.selectedMark === theMark) {

            if (!theMark.xVisualPropertyOcluded) {
                bringToFront(theMark.xVisualProperty);
            }

            bringToFront(theMark.yVisualProperty);
        }
        if (theMark.iText) {
            bringToFront(theMark.iText);
        }

        var boundingRectCenterBottom = new fabric.Point(theMark.left, markCenter.y + boundingRect.height / 2);
//        var boundingRectCenterBottom = new fabric.Point(theMark.left, boundingRect.top + boundingRect.height);
//        drawRectAt(boundingRectCenterBottom, "green");
        boundingRectCenterBottom.y += theMark.propertiesGap;
        if (this.iText && this.iText.text != '') {
            boundingRectCenterBottom.y += (2 * theMark.labelGap);
        }

        theBackground.opacity = 1;



        // ************************************** IMPORTANT **************************************
        // this variable informs if, after being expanded, the rectangular background of the mark will
        // oclude its x position visual property. Decisions are taken below based on the value of this variable        
        var oclussionWillOccur = false;
        var theParentObject = theMark.parentObject;
        if (theParentObject && theParentObject.isLocator && !theParentObject.isCompressed) {
            var maxYRect = newTop + newHeight / 2;
            var xVisPropMaxY = theMark.xVisualProperty.getPointByOrigin('center', 'top').y;
//            drawRectAt(new fabric.Point(500, newTop), 'green');
//            drawRectAt(new fabric.Point(500, maxYRect), 'red');
//            drawRectAt(new fabric.Point(500, xVisPropMaxY), 'blue');
            if (maxYRect >= xVisPropMaxY) {
                oclussionWillOccur = true;
            }
        }



        // In the animation of the background, the canvas is not redrawn, as this is done while the visual properties are being moved
        theBackground.animate('top', newTop, {
            easing: easing,
            duration: duration,
        });
        theBackground.animate('height', newHeight, {
            duration: duration,
            easing: easing,
            onChange: function () {
                if (oclussionWillOccur) {
                    // if oclussion indeed occurs, we hide the x position visual property of the mark
                    var opacity = 1 - theBackground.getHeight() / newHeight;
                    theMark.xVisualProperty.opacity = opacity;
                }
                theBackground.setGradient('fill', {
                    type: 'linear',
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: theBackground.getHeight(),
                    colorStops: {
                        0: 'rgb(255,255,255, 1)',
                        0.5: 'rgba(242,242,242,0.75)',
                        1: 'rgb(255,255,255, 1)'
                    }
                });
            },
            onComplete: function () {
                theMark.isCompressed = false;
                if (oclussionWillOccur) {
                    if (theMark.xVisualProperty && isOnCanvas(theMark.xVisualProperty)) {
                        // if oclussion indeed occurs, the x position visual property of the mark should be completely removed from the canvas
                        theMark.xVisualProperty.opacity = 0;
                        theMark.xVisualProperty.remove();
                        theMark.xVisualPropertyOcluded = true;
                    }

                }
            }
        });

        var positions = new Array();
        var i = 0;
        theMark.visualProperties.forEach(function (visualProperty) {

            var x = theMark.left;
            var y = boundingRectCenterBottom.y + i * theMark.propertiesSeparation;

//            drawRectAt(new fabric.Point(x,y), generateRandomColor());

            canvas.add(visualProperty);
            bringToFront(visualProperty);

            visualProperty.outConnectors.forEach(function (connector) {
                bringToFront(connector);
            });

            visualProperty.inConnectors.forEach(function (connector) {
                bringToFront(connector);
            });

            visualProperty.left = theMark.left;
            visualProperty.top = theMark.top;
            visualProperty.scaleX = 0;
            visualProperty.scaleY = 0;
            visualProperty.opacity = 0;

            positions.push({x: x, y: y});

            i++;
        });

        easing = fabric.util.ease['easeOutQuad'];

        for (var i = 0; i < theMark.visualProperties.length; i++) {

            var isTheLastElement = i == theMark.visualProperties.length - 1;

            theMark.animateVisualProperty(i, 'opacity', 1, duration, easing, false, false, false, false);
            theMark.animateVisualProperty(i, 'scaleX', 1, duration, easing, false, false, false, false);
            theMark.animateVisualProperty(i, 'scaleY', 1, duration, easing, false, false, false, false);
            theMark.animateVisualProperty(i, 'left', positions[i].x, duration, easing, false, false, false, false);
            theMark.animateVisualProperty(i, 'top', positions[i].y, duration, easing, refreshCanvas && isTheLastElement, false, isTheLastElement, isTheLastElement);

        }

    };



    this.compress = function (refreshCanvas) {

        if (this.isCompressed || this.group) // No compression is allowed if the mark is included in a group
            return;

        if (LOG) {
            console.log("%cCompressing", "background:green; color:white");
            console.log("refreshCanvas: " + refreshCanvas + " - " + this.type);
        }

        var theMark = this;
        var theParentObject = theMark.parentObject;

        // Disabling any event for this mark. This will be enabled once the animations of this method are done.
        theMark.evented = false;
        gestureSetEnabled(manager, 'pan1Finger', false); // Disabling the panning functionality while the mark is compressing 
        theMark.setEnabledVisualPropertiesEvents(false); // The events for the Visual Properties of this mark are also disabled when the compression begin

        var theBackground = this.backgroundRect;
//        var duration = 500;
        var duration = 400;
        var easing = fabric.util.ease['easeOutQuad'];

        theBackground.animate('top', theMark.top, {
            easing: easing,
            duration: duration,
        });

        theBackground.animate('opacity', 0, {
            duration: duration,
        });


        if (theParentObject && theParentObject.isLocator && !theParentObject.isCompressed && theParentObject.selectedMark === theMark) {
            if (theMark.xVisualPropertyOcluded) {
                canvas.add(theMark.xVisualProperty);
            }
        }

        var oldHeight = theBackground.getHeight();

        theBackground.animate('height', 0, {
            duration: duration,
            easing: easing,
            onChange: function () {
                if (theMark.xVisualPropertyOcluded) {
                    var opacity = 1 - theBackground.getHeight() / oldHeight;
                    theMark.xVisualProperty.opacity = opacity;
                }
            },
            onComplete: function () {
                theBackground.width = 0;
                theMark.isCompressed = true;
                theBackground.setCoords();
                if (theMark.xVisualPropertyOcluded) {
                    theMark.xVisualProperty.opacity = 1;
                    theMark.xVisualPropertyOcluded = false;

                    if (theParentObject && theParentObject.isLocator && !theParentObject.isCompressed && theParentObject.selectedMark === theMark) {
                        bringToFront(theMark.xVisualProperty);
                    }

                }
            }
        });

        easing = fabric.util.ease['easeOutCubic'];

        for (var i = 0; i < theMark.visualProperties.length; i++) {

            var isTheLastElement = i == theMark.visualProperties.length - 1;

            theMark.animateVisualProperty(i, 'opacity', 0, duration, easing, false, true, false, false);
            theMark.animateVisualProperty(i, 'scaleX', 0, duration, easing, false, true, false, false);
            theMark.animateVisualProperty(i, 'scaleY', 0, duration, easing, false, true, false, false);
            theMark.animateVisualProperty(i, 'left', theMark.left, duration, easing, false, true, false, false);
            theMark.animateVisualProperty(i, 'top', theMark.top, duration, easing, refreshCanvas && isTheLastElement, true, isTheLastElement, false);
        }

        bringToFront(theMark);

        if (theParentObject && theParentObject.isLocator && !theParentObject.isCompressed && theParentObject.selectedMark === theMark) {
            bringToFront(theMark.yVisualProperty);
        }

    };

    this.positionMarkConnectors = function () {
        var theMark = this;
        theMark.inConnectors.forEach(function (inConnector) {
            inConnector.set({'x2': theMark.left, 'y2': theMark.top});
        });
    };

    this.positionConnectors = function () {



        var theMark = this;

        theMark.inConnectors.forEach(function (inConnector) {
            inConnector.set({'x2': theMark.left, 'y2': theMark.top});
        });

        theMark.visualProperties.forEach(function (visualProperty) {
            visualProperty.inConnectors.forEach(function (inConnector) {
                inConnector.set({'x2': visualProperty.left, 'y2': visualProperty.top});
            });
            visualProperty.outConnectors.forEach(function (outConnector) {
                outConnector.set({'x1': visualProperty.left, 'y1': visualProperty.top});
            });
        });

    };

    this.toggleState = function (refreshCanvas) {
        if (this.isCompressed) {
            this.expand(refreshCanvas);
        } else {
            this.compress(refreshCanvas);
        }
    };

    this.hideLabel = function () {
        this.iText.opacity = 0;
        this.iText.permanentOpacity = 0;
        this.iText.evented = false;
        this.labelVisible = false;
    };

    this.showLabel = function () {
        this.iText.opacity = 1;
        this.iText.permanentOpacity = 1;
        this.iText.evented = true;
        this.labelVisible = true;
    };

    this.animatePositionProperty = function (property, endValue, duration, easing, refreshCanvas) {

        var theMark = this;
        theMark.setCoords();

        var originX = null, originY = null, coordinate = null, otherCoordinate = null;

        if (property === 'top' || property === 'bottom') {
            originX = 'center';
            originY = property;
            coordinate = 'y';
        } else if (property === 'left' || property === 'right') {
            originX = property;
            originY = 'center';
            coordinate = 'x';
        }

        if (!originX || !originY || !coordinate) {
            return;
        }

        otherCoordinate = coordinate === 'x' ? 'y' : 'x';

        duration = duration || 500;
        easing = easing || fabric.util.ease['easeOutBack'];

        var centerPoint = theMark.getPointByOrigin(originX, originY);
        var startValue = centerPoint[coordinate];
        var constantValue = centerPoint[otherCoordinate];

        if (startValue === endValue) {
//            blink(theMark, refreshCanvas, 0.075);
            return;
        }

        fabric.util.animate({
            duration: duration,
            easing: easing,
            startValue: startValue,
            endValue: endValue,
            onChange: function (currentValue) {

                var newPoint = null;
                if (coordinate === 'x') {
                    newPoint = new fabric.Point(currentValue, constantValue);
                } else {
                    newPoint = new fabric.Point(constantValue, currentValue);
                }

                theMark.setPositionByOrigin(newPoint, originX, originY);
                theMark.positionElements();
                theMark.setCoords();

                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {

                var newPoint = null;
                if (coordinate === 'x') {
                    newPoint = new fabric.Point(endValue, constantValue);
                } else {
                    newPoint = new fabric.Point(constantValue, endValue);
                }

                theMark.setPositionByOrigin(newPoint, originX, originY);
                theMark.positionElements();


                theMark.setCoords();
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            }
        });



    };

    this.updateOcclusionState = function () {

        var theMark = this;

        var markObject = null;
        if (theMark.isCompressed) {
            markObject = theMark;
        } else {
            markObject = theMark.backgroundRect;
        }

        var markLeftTop = markObject.getPointByOrigin('left', 'top');
        var markRightBottom = markObject.getPointByOrigin('right', 'bottom');

        var xVisualPropertyLeftTop = theMark.xVisualProperty.getPointByOrigin('left', 'top');
        var xVisualPropertyRightBottom = theMark.xVisualProperty.getPointByOrigin('right', 'bottom');

        var yVisualPropertyLeftTop = theMark.yVisualProperty.getPointByOrigin('left', 'top');
        var yVisualPropertyRightBottom = theMark.yVisualProperty.getPointByOrigin('right', 'bottom');


//        drawRectAt(markLeftTop, 'blue');
//        drawRectAt(markRightBottom, 'black');
//
//        drawRectAt(xVisualPropertyLeftTop, 'red');
//        drawRectAt(xVisualPropertyRightBottom, 'gray');


        var markLeft = markLeftTop.x;
        var markTop = markLeftTop.y;
        var markRight = markRightBottom.x;
        var markBotton = markRightBottom.y;

        var yPropertyLeft = yVisualPropertyLeftTop.x;
        var yPropertyRight = yVisualPropertyRightBottom.x;

        var xPropertyTop = xVisualPropertyLeftTop.y;
        var xPropertyBottom = xVisualPropertyRightBottom.y;

        theMark.xVisualPropertyOcluded = (xPropertyTop > markTop && xPropertyTop < markBotton) || (xPropertyBottom > markTop && xPropertyBottom < markBotton);
        theMark.yVisualPropertyOcluded = (yPropertyLeft > markLeft && yPropertyLeft < markRight) || (yPropertyRight > markLeft && yPropertyRight < markRight);

        if (LOG) {
            console.log("theMark.xVisualPropertyOcluded: " + theMark.xVisualPropertyOcluded);
            console.log("theMark.yVisualPropertyOcluded: " + theMark.yVisualPropertyOcluded);
        }

    };

    this.positionElements = function () {

        var theMark = this;

        if (LOG) {
            console.log("positionElements FUNCTION");
        }

        theMark.setCoords();

        theMark.positionMarkConnectors();

        var markCenter = null;

        if (theMark.group) {
            markCenter = getCenterPointWithinGroup(theMark);
        } else {
            markCenter = theMark.getCenterPoint();
        }






        var boundingRect = theMark.getBoundingRect();

//        drawRectAt(objectCenter, "blue");
//        drawRectAt(new fabric.Point(boundingRect.left, boundingRect.top), "green");
//        drawRectAt(new fabric.Point(boundingRect.left + boundingRect.width, boundingRect.top + boundingRect.height), "green");

        if (theMark.isCircularMark && (theMark.scaleX == theMark.scaleY)) {
            var markRealRadius = theMark.radius * theMark.scaleX;

            if (markRealRadius / canvas.getZoom() < theMark.propertiesRadius) {
                markRealRadius = theMark.propertiesRadius;
            }
            var wh = 2 * markRealRadius;
            boundingRect = {top: markCenter.y - markRealRadius, left: markCenter.x - markRealRadius, width: wh, height: wh};

        } else if (theMark.isEllipticMark && (theMark.rx == theMark.ry) && (theMark.scaleX == theMark.scaleY)) {

            var markRealRadius = theMark.rx * theMark.scaleX;
            if (markRealRadius < theMark.propertiesRadius) {
                markRealRadius = theMark.propertiesRadius + 5;
            }
            var wh = 2 * markRealRadius * canvas.getZoom();
            boundingRect = {top: markCenter.y - markRealRadius, left: markCenter.x - markRealRadius, width: wh, height: (2 * this.ry * this.scaleY) * canvas.getZoom()};
        }

        // The dimensions of the bounding rectangle are absolute, thus, the zoom level has to be taken into account
        if (boundingRect.width / canvas.getZoom() < theMark.propertiesRadius) {
            boundingRect.width = 2 * theMark.propertiesRadius;
        }

        // TODO: Eventually, this compensantion should not be necessary
        if (theMark.isFatFontMark || theMark.isSVGPathGroupMark || theMark.isSVGPathMark || theMark.isPathMark || theMark.isRectangularMark || theMark.isEllipticMark || theMark.isSquaredMark) {
            compensateBoundingRect(boundingRect);
        }

        var newHeight = theMark.visualProperties.length * (2 * theMark.propertiesRadius + 15) + boundingRect.height + 2 * theMark.indent;
        if (this.iText && this.iText.text != '') {
            newHeight += (2 * theMark.labelGap);
        }

        var newWidth = boundingRect.width + 2 * theMark.indent;

        theMark.backgroundRect.left = theMark.left;

        theMark.backgroundRect.width = newWidth;
        theMark.backgroundRect.height = newHeight;

        if (theMark.isCompressed) {
            theMark.backgroundRect.top = theMark.top;
            theMark.backgroundRect.width = 0;
            theMark.backgroundRect.height = 0;
        } else {
            var newTop = theMark.top + (newHeight / 2 - boundingRect.height / 2 - theMark.indent);
            theMark.backgroundRect.top = newTop;
        }

        theMark.backgroundRect.setCoords();

        var boundingRectCenterBottom = new fabric.Point(markCenter.x, markCenter.y + boundingRect.height / 2);
//        var boundingRectCenterBottom = new fabric.Point(theMark.left, objectCenter.y + boundingRect.height / 2);
//        drawRectAt(boundingRectCenterBottom, "red");

        boundingRectCenterBottom.y += theMark.propertiesGap;

        if (this.iText && this.iText.text != '') {
            boundingRectCenterBottom.y += (2 * theMark.labelGap);
        }

        var i = 0;
        this.visualProperties.forEach(function (visualProperty) {

            var x = markCenter.x;
            var y = markCenter.y;

            // A different y position for each visual property is only needed when the Mark is expanded
            if (!theMark.isCompressed) {
                y = boundingRectCenterBottom.y + i * theMark.propertiesSeparation;
            }

            if (theMark.group) {
                x = x - theMark.group.left - theMark.group.width / 2;
                y = y - theMark.group.top - theMark.group.height / 2;
            }

            // remember that left and top are properties that are relative TO THE GROUP (if any, otherwise, they are relative to the canvas)
            visualProperty.left = x;
            visualProperty.top = y;

            visualProperty.setCoords();

            visualProperty.inConnectors.forEach(function (inConnector) {
                if (theMark.isCompressed) {
                    inConnector.set({'x2': markCenter.x, 'y2': markCenter.y});
                } else {
                    var visualPropertyCenter = null;
                    if (visualProperty.group) {
                        visualPropertyCenter = getCenterPointWithinGroup(visualProperty);
                    } else {
                        visualPropertyCenter = visualProperty.getCenterPoint();
                    }
                    inConnector.set({'x2': visualPropertyCenter.x, 'y2': visualPropertyCenter.y});
                }
            });

            visualProperty.outConnectors.forEach(function (outConnector) {
                if (theMark.isCompressed) {
                    outConnector.set({'x1': markCenter.x, 'y1': markCenter.y});
                } else {
                    var visualPropertyCenter = null;
                    if (visualProperty.group) {
                        visualPropertyCenter = getCenterPointWithinGroup(visualProperty);
                    } else {
                        visualPropertyCenter = visualProperty.getCenterPoint();
                    }
                    outConnector.set({'x1': visualPropertyCenter.x, 'y1': visualPropertyCenter.y});
                }
            });



            i++;

        });



    };

    this.getVisualPropertyByAttributeName = function (attributeName) {
        var theMark = this;
        for (var i = 0; i < theMark.visualProperties.length; i++) {
            if (theMark.visualProperties[i].attribute === attributeName) {
                return theMark.visualProperties[i];
            }
        }
        return null;
    };




    this.clone = function (options) {

        var theMark = this;

        var theCopy = fabric.util.object.clone(theMark);

        // The paths (for SVGGroups ) should also be clonned. Otherwise, the modification of the color in the clone (or the original mark) would also change the color of the original mark (or the clone)
        if (theMark.paths) {
            theCopy.paths = new Array();
            theMark.paths.forEach(function (path) {
                var clonedPath = fabric.util.object.clone(path);
                theCopy.paths.push(clonedPath);

            });
        }

//        if (LOG) console.log("%ctheMark.paths", "background:pink; color:blue;");
//        if (LOG) console.log(theMark.paths);

//        if (theMark.paths === theCopy.paths) {
//            alert("The paths are the same");
//        }

//        if (LOG) console.log("%ctheCopy", "background:pink; color:blue;");
//        if (LOG) console.log(theCopy);
//        
//        if (LOG) console.log("%ctheMark", "background:pink; color:blue;");
//        if (LOG) console.log(theMark);

        theCopy.isCompressed = true;

        if (options) {
            for (var key in options) {
                if (key === "targetWidth") {

                    var theWidth = options.targetWidth / this.width;
                    theCopy.set('finalScaleX', theWidth);
                    theCopy.set("the_width", options.targetWidth);

                } else if (key === "targetHeight") {

                    var theHeight = options.targetHeight / this.height;
                    theCopy.set('finalScaleY', theHeight);
                    theCopy.set("the_height", options.targetHeight);

                } else {
                    theCopy.set(key, options[key]);
                }
            }

        }

        theCopy.createIText();
        theCopy.createRectBackground();

        theCopy.widgets = new Array();
        theCopy.visualProperties = new Array();

        theCopy.parentObject = null;

        theCopy.createVisualProperties();

        theCopy.createPositionProperties();

        // Before associating the events of the copy, we have to delete all the others that might have been added from the clone. Otherwise, the events of the cloned object would affect all the
        // related to the original one when these were affected by the events
        theCopy.off(); // IMPORTANT so that, for isntance, the moving of the clone does not affect the elements that had to be affected by the original object

        theCopy.associateEvents();

        if (options && options.fill && options.colorForStroke) {
            theCopy.changeColors(options.fill, options.colorForStroke);
        }

        theCopy.inConnectors = new Array();
        theCopy.set('inConnectors', new Array());

        // The values hold by the visual properties of the original mark should be copied to the copy
        theMark.visualProperties.forEach(function (visualProperty) {
            var attribute = visualProperty.attribute;
            var value = visualProperty.value;
            if (value.clone) {
                var clonedValue = value.clone();
                theCopy.getVisualPropertyByAttributeName(attribute).value = clonedValue;
            }
        });

        if (options) {
            if (options.targetWidth) {
                theCopy.getVisualPropertyByAttributeName("width").value = createNumericValue(options.targetWidth, null, null, 'pixels');
            }
            if (options.targetHeight) {
                theCopy.getVisualPropertyByAttributeName("height").value = createNumericValue(options.targetHeight, null, null, 'pixels');
            }
        }

        if (theMark.isPathMark) {
            theCopy.getVisualPropertyByAttributeName("xCollection").value = theMark.getVisualPropertyByAttributeName("xCollection").value;
            theCopy.getVisualPropertyByAttributeName("yCollection").value = theMark.getVisualPropertyByAttributeName("yCollection").value;
        }


        if (LOG)
            console.log(" **************************** theCopy: **************************** ");
        if (LOG)
            console.log(theCopy);

        return theCopy;

    };

    this.configurePositionVisualProperties = function () {

        var theMark = this;
        var theLocator = theMark.parentObject;

        theMark.setCoords();

        var xVisualProperty = theMark.xVisualProperty;
        xVisualProperty.parentObject = theLocator;
        xVisualProperty.untransformedX = theMark.untransformedX - theLocator.width / 2 + theMark.width / 2;
        xVisualProperty.untransformedY = 0;
        xVisualProperty.untransformedScaleX = 1;
        xVisualProperty.untransformedScaleY = 1;
        xVisualProperty.untransformedAngle = 0;
        xVisualProperty.scaleX = 1;
        xVisualProperty.scaleY = 1;
        xVisualProperty.opacity = 1;

        var yVisualProperty = theMark.yVisualProperty;
        yVisualProperty.parentObject = theLocator;
        yVisualProperty.untransformedX = 0;
        yVisualProperty.untransformedY = theMark.untransformedY - theLocator.width / 2 + theMark.height / 2;
        yVisualProperty.untransformedScaleX = 1;
        yVisualProperty.untransformedScaleY = 1;
        yVisualProperty.untransformedAngle = 0;
        yVisualProperty.scaleX = 1;
        yVisualProperty.scaleY = 1;
        yVisualProperty.opacity = 1;

    };

    this.activateCopyingMode = function () {
        // enter copying mode
        blink(this, true);
        this.copyingMode = true;
        this.lockMovementX = true;
        this.lockMovementY = true;

    };

    this.deactivateCopyingMode = function () {
        this.copyingMode = false;
        this.lockMovementX = false;
        this.lockMovementY = false;
        if (this.currentCopy) {
            this.currentCopy.evented = true;
            this.currentCopy = null;
        }
    };

    this.bringElementsToFront = function () {
        var theMark = this;
        if (!theMark.isCompressed) {
            bringToFront(theMark.backgroundRect);
            theMark.visualProperties.forEach(function (visualProperty) {
                if (visualProperty.canvas) {
                    bringToFront(visualProperty);
                    visualProperty.inConnectors.forEach(function (inConnection) {
                        bringToFront(inConnection);
                    });
                    visualProperty.outConnectors.forEach(function (outConnection) {
                        bringToFront(outConnection);
                    });

                }
            });
        }

        if (theMark.iText) {
            bringToFront(theMark.iText);
        }
        bringToFront(theMark);

        if (theMark.parentObject && theMark.parentObject.isLocator && !theMark.parentObject.isCompressed && theMark.parentObject.selectedMark === theMark) {

            if (!theMark.xVisualPropertyOcluded) {
                bringToFront(theMark.xVisualProperty);
            }

            bringToFront(theMark.yVisualProperty);
        }
    };


    this.showCoordinatesTooltip = function () {

        var theMark = this;

        var x = theMark.xVisualProperty.value.number.toFixed(2);
        var y = theMark.yVisualProperty.value.number.toFixed(2);

        var string = "(" + x + ", " + y + ")";
        if (theMark.label) {
            string = theMark.label + ": " + string;
        }

        var tooltipDiv = $('<div/>', {class: 'icon-large'});

        document.body.appendChild(tooltipDiv[0]);

        var label = $('<label/>', {text: string, style: "font-size: 18px; margin-top: 5px; margin-bottom: 5px;"});

        var contentDiv = $('<div/>');

        contentDiv.append(label);

        tooltipDiv.tooltipster({
            content: contentDiv,
            animation: 'grow',
            trigger: 'hover',
            position: 'top',
            multiple: false,
            autoClose: false,
            speed: 100
        });

        theMark.configurator = tooltipDiv;

        // positioning and showing the configurator
        var centerPoint = theMark.getPointByOrigin('center', 'top');
        var screenCoords = getScreenCoordinates(centerPoint);
        tooltipDiv.css('position', 'absolute');
        tooltipDiv.css('top', screenCoords.y + 'px');
        tooltipDiv.css('left', screenCoords.x + 'px');
        tooltipDiv.tooltipster('reposition');
        tooltipDiv.tooltipster('show');
    };

    this.closeCoordinateTooltip = function () {
        var theMark = this;
        if (theMark.configurator && theMark.configurator.tooltipster) {
            theMark.configurator.tooltipster('hide');
        }
    };

    this.associateEvents = function () {
        var theMark = this;
        theMark.on({
            'mouseover': function (options) {
                if (theMark.parentObject && theMark.parentObject.isLocator) {
                    theMark.showCoordinatesTooltip();
                }
            },
            'mouseout': function (options) {
                this.deactivateCopyingMode(); // TODO: Should this be here? 
//                if (theMark.parentObject && theMark.parentObject.isLocator) {
                this.closeCoordinateTooltip();
//                }


            },
            // This event is triggered when the mark is associated by a locator element
            'newInConnection': function (options) {
                var newInConnection = options.newInConnection;
                var shouldAnimate = options.shouldAnimate;
                this.inConnectors.push(newInConnection);
            },
            'inConnectionRemoved': function (options) {

                if (LOG)
                    console.log("%cIN CONNECTOR", "background:pink; color:black;");

                if (LOG)
                    console.log("Before: ");
                if (LOG)
                    console.log(theMark.inConnectors);

                var removedConnection = options.connector;
                fabric.util.removeFromArray(theMark.inConnectors, removedConnection);

                theMark.parentObject = null;

                theMark.lockMovementX = false;
                theMark.lockMovementY = false;


                if (LOG)
                    console.log("After: ");
                if (LOG)
                    console.log(theMark.inConnectors);

            },
            'pressed': function (options) {
                if (LOG)
                    console.log("This mark has been pressed");
                theMark.positionElements();



                if (theMark.parentObject && theMark.parentObject.isLocator) {

                    theMark.blink(0.2);

                    theMark.lockMovementX = false;
                    theMark.lockMovementY = false;
                }

//                this.activateCopyingMode();


            },
            'moving': function (options) {

                var theMark = this;

                if (this.copyingMode) {

                    console.log("%c" + "MARK MOVING in COPYING mode. Someone is trying to duplicate this mark.", "background: #2d287a; color: white;");

                    if (options.e.touches.length === 2) {



                        var touch1 = options.e.touches['0'];

                        if (touch1) {

                            console.log("touch1:");
                            console.log(touch1);

                            var p1 = getCanvasCoordinatesFromTouch(touch1);

//                        drawRectAt(p1, "red");

                        }

                        var touch2 = options.e.touches['1'];

                        if (touch2) {

                            console.log("touch2:");
                            console.log(touch2);


                            var p2 = getCanvasCoordinatesFromTouch(touch2);


//                        drawRectAt(p2, "green");

                            if (!this.currentCopy) {
                                this.currentCopy = this.clone();
                                this.currentCopy.applyUnselectedStyle(false);
                                this.currentCopy.opacity = 0.6;
                                this.currentCopy.evented = false;
                                canvas.add(this.currentCopy);
                                console.log("%c" + "Clone added to canvas!", "background: #6dce8d; color: black;");
                            }

                            if (this.currentCopy) {
                                this.currentCopy.setPositionByOrigin(p2, 'center', 'center');
                                this.currentCopy.positionElements();
                            }





                        }


                    } else {



                    }






                } else {

                    theMark.positionElements();

                    theMark.updateOcclusionState();

                    if (theMark.parentObject && theMark.parentObject.isLocator) {

                        var xVisualProperty = theMark.xVisualProperty;
                        if (xVisualProperty) {
                            if (theMark.xVisualPropertyOcluded) {
                                if (isOnCanvas(xVisualProperty)) {
                                    if (LOG) {
                                        console.log("removing x visual property");
                                    }
                                    xVisualProperty.opacity = 0;
                                    xVisualProperty.remove();
                                }
                            } else {
                                if (!isOnCanvas(xVisualProperty) && !theMark.parentObject.isCompressed) {
                                    if (LOG) {
                                        console.log("adding x visual property");
                                    }
                                    xVisualProperty.opacity = 1;
                                    canvas.add(xVisualProperty);
                                    bringToFront(xVisualProperty);
                                }
                            }
                        }


                        var yVisualProperty = theMark.yVisualProperty;
                        if (yVisualProperty) {
                            if (theMark.yVisualPropertyOcluded) {
                                if (isOnCanvas(yVisualProperty)) {
                                    if (LOG) {
                                        console.log("removing y visual property");
                                    }
                                    yVisualProperty.opacity = 0;
                                    yVisualProperty.remove();
                                }
                            } else {
                                if (!isOnCanvas(yVisualProperty) && !theMark.parentObject.isCompressed) {
                                    if (LOG) {
                                        console.log("adding y visual property");
                                    }
                                    yVisualProperty.opacity = 1;
                                    canvas.add(yVisualProperty);
                                    bringToFront(yVisualProperty);
                                }
                            }
                        }



                        if (!this.lockMovementX && !this.lockMovementY) {
                            if (LOG) {
                                console.log("This mark has a parent object");
                            }
                            computeUntransformedProperties(this);
                            this.parentObject.trigger('markMoving', this);
                        }


                    }

                }

            },
            'rotating': function (options) {
//                if (LOG)
                console.log("rotating event");
                theMark.positionElements();

                var visualProperty = theMark.getVisualPropertyByAttributeName('angle');
                if (visualProperty) {
                    visualProperty.inConnectors.forEach(function (inConnector) {
                        inConnector.contract();
                    });
                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(theMark.angle % 360, false, false);
                    });
                }

                if (theMark.parentObject && theMark.parentObject.isLocator) {
                    computeUntransformedProperties(theMark);
                    theMark.parentObject.trigger('markMoving', theMark);
                }

            },
            'scaling': function (options) {
//                if (LOG)
                console.log("scaling event");
                theMark.positionElements();

                if (theMark.parentObject && theMark.parentObject.isLocator) {
                    computeUntransformedProperties(theMark);
                    theMark.parentObject.trigger('markMoving', theMark);
                }

            },
            'mouseup': function (options) {

//                console.log("theMark.lockMovementX: " + theMark.lockMovementX);
//                console.log("theMark.lockMovementY: " + theMark.lockMovementY);

                if (theMark.parentObject && theMark.parentObject.isLocator) {
                    theMark.lockMovementX = true;
                    theMark.lockMovementY = true;
                }

                if (this.copyingMode) {

                    if (LOG) {
                        console.log("%c" + "MOUSE UP over a mark!", "background: #914b30; color: white;");
                    }


                    if (this.currentCopy) {
                        this.currentCopy.opacity = 1;
                        this.currentCopy.evented = true;
                        this.currentCopy.positionElements();
                        this.currentCopy.deactivateCopyingMode();
                        canvas.renderAll();
                    }

                }

            },
            'mousedown': function (options) {

                theMark.closeCoordinateTooltip();

                if (LOG) {
                    console.log("%c" + "MOUSE DOWN over a mark!", "background: #572a82; color: white;");
//                    console.log("%c" + "this.copyingMode: " + this.copyingMode, "background: #572a82; color: white;");
                }



                if (theMark.parentObject && theMark.parentObject.isLocator) {
                    theMark.lockMovementX = true;
                    theMark.lockMovementY = true;
                }

                theMark.bringElementsToFront();

            },
            'selected': function (options) {
                if (theMark.parentObject && theMark.parentObject.isLocator) {
                    theMark.parentObject.trigger('markSelected', theMark);
                }
            },
            'doubleTap': function (options) {

                if (LOG) {
                    console.log("options.event:");
                    console.log(options.event);
                }

                options.event.preventDefault();

                if (LOG) {
                    console.log("%cDouble tap on this mark!", "color:blue;");
                    console.log("%cthis.visualPropertyFill:" + this.visualPropertyFill, "background:" + this.visualPropertyFill + ", color:white;");
                    console.log(this);
                }

                if (this.isCompressed) {
                    this.expand(true);
                } else {
                    this.compress(true);
                }
            }
        });
    };




    this.renderLocationLines = function (ctx) {

        var theMark = this;
        var theParentObject = theMark.parentObject;

        if (theParentObject && theParentObject.isLocator && !theParentObject.isCompressed && theParentObject.selectedMark === theMark) {

            ctx.save();

            var relativeX = theParentObject.getPointByOrigin('center', 'center').x - theMark.getPointByOrigin('center', 'center').x;
            var relativeY = theParentObject.getPointByOrigin('center', 'center').y - theMark.getPointByOrigin('center', 'center').y;

            if (!this.isSVGPathGroupMark) {
                ctx.rotate(-fabric.util.degreesToRadians(theMark.getAngle()));
            }

            ctx.setLineDash([8, 8]);
            ctx.beginPath();

            var markCenter = theMark.getCenterPoint();




            var rectPoint = null;
            var originX = null;
            var originY = null;

            if (relativeY < 0) {
                originY = 'top';
            } else {
                originY = 'bottom';
            }

            if (relativeX < 0) {
                originX = 'left';
            } else {
                originX = 'right';
            }

            var rectPoint = theMark.backgroundRect.getPointByOrigin(originX, originY);

            var rectHorizontalCoordinate = rectPoint.x;
            var rectVerticalCoordinate = rectPoint.y;

            var verticalOffset = rectVerticalCoordinate - markCenter.y;
            var horizontalOffset = rectHorizontalCoordinate - markCenter.x;

            // VERTICAL line (the one intersecting the X axis)
            if (!theMark.xVisualPropertyOcluded) {
                if (theMark.isSVGPathGroupMark) {
                    ctx.moveTo(markCenter.x, markCenter.y);
                    ctx.lineTo(markCenter.x, markCenter.y + relativeY);
                } else {
                    ctx.moveTo(0, verticalOffset);
                    ctx.lineTo(0, relativeY);
                }
            }

            // HORIZONTAL line (the one intersecting the Y axis)
            if (!theMark.yVisualPropertyOcluded) {
                if (this.isSVGPathGroupMark) {
                    ctx.moveTo(markCenter.x, markCenter.y);
                    ctx.lineTo(markCenter.x + relativeX, markCenter.y);
                } else {
//                ctx.moveTo(0, 0);
                    ctx.moveTo(horizontalOffset, 0);
                    ctx.lineTo(relativeX, 0);
                }
            }

            ctx.stroke();


            ctx.fillStyle = 'black';
            ctx.font = "16px sans-serif";

            if (!theMark.yVisualPropertyOcluded) {
                if (relativeX < 0) {
                    ctx.textAlign = "right";
                    if (this.isSVGPathGroupMark) {
                        ctx.fillText(relativeY.toFixed(2), markCenter.x + relativeX - 30, markCenter.y + 6);
                    } else {
                        ctx.fillText(relativeY.toFixed(2), relativeX - 30, 6);
                    }
                } else {
                    ctx.textAlign = "left";
                    if (this.isSVGPathGroupMark) {
                        ctx.fillText(relativeY.toFixed(2), markCenter.x + relativeX + 30, markCenter.y + 6);
                    } else {
                        ctx.fillText(relativeY.toFixed(2), relativeX + 30, 6);
                    }
                }
            }

            // text of the X property
            if (!theMark.xVisualPropertyOcluded) {
                ctx.textAlign = "center";
                if (relativeY < 0) {
                    if (this.isSVGPathGroupMark) {
                        ctx.fillText(-relativeX.toFixed(2), markCenter.x, markCenter.y + relativeY - 30);
                    } else {
                        ctx.fillText(-relativeX.toFixed(2), 0, relativeY - 30);
                    }
                } else {
                    if (this.isSVGPathGroupMark) {
                        ctx.fillText(-relativeX.toFixed(2), markCenter.x, markCenter.y + relativeY + 40);
                    } else {
                        ctx.fillText(-relativeX.toFixed(2), 0, relativeY + 40);
                    }
                }
            }



            ctx.closePath();



            ctx.restore();
        }

    };

    return this;
};

/* Function to add outputs to Canvas*/
function addMarkToCanvas(markType, options) {

    bubbleSound.play();

//    if (LOG) {
//        console.log("%cThe birth of this mark will be animated...", "background: red; color: white;");
//    }
    if (markType === CIRCULAR_MARK) {
        return addCircularMarkToCanvas(options);
    } else if (markType === SQUARED_MARK) {
        return addSquaredMarkToCanvas(options);
    } else if (markType === RECTANGULAR_MARK) {
        return addRectangularMarkToCanvas(options);
    } else if (markType === ELLIPTIC_MARK) {
        return addEllipticMarkToCanvas(options);
    } else if (markType === FATFONT_MARK) {
        return addFatFontMarkToCanvas(options);
    } else if (markType === PATH_MARK) {
        return addPathMarkToCanvas(options.thePath, options);
    } else if (markType === FILLEDPATH_MARK) {
        return addSVGPathMarkToCanvas(options.thePath, options);
    } else if (markType === SVGPATHGROUP_MARK) {
        return addSVGPathGroupMarkToCanvas(options.thePaths, options);
    }
}

function copyVisualPropertiesConnectors(fromMark, toMark) {

    fromMark.visualProperties.forEach(function (sourceVisualProperty) {

        var targetVisualProperty = toMark.getVisualPropertyByAttributeName(sourceVisualProperty.attribute);
        if (targetVisualProperty) {

            if (LOG)
                console.log("FOUND: " + sourceVisualProperty.attribute);

            // If here, botht the fromMark and the toMark have a common visual property
            // At this point, the inConnectors and outConnectors from the sourceVisualProperty should be copied to the targetVisualProperty

            sourceVisualProperty.inConnectors.forEach(function (inConnector) {
                if (LOG)
                    console.log("\tIN connector: " + inConnector);
//            inConnector.setDestination(targetVisualProperty, false);
                inConnector.destination = targetVisualProperty; // It's more efficient to do this, than to call the setDestination method from the Connector class (as it will set some events for the visual property)
                targetVisualProperty.inConnectors.push(inConnector);
            });

            sourceVisualProperty.outConnectors.forEach(function (outConnector) {
                if (LOG)
                    console.log("\tOUT connector: " + outConnector);
//            outConnector.setSource(targetVisualProperty);
                outConnector.source = targetVisualProperty; // It's more efficient to do this, than to call the setSource method (as it will set some events for the visual property)
                targetVisualProperty.outConnectors.push(outConnector);
            });


        } else {



            sourceVisualProperty.inConnectors.forEach(function (inConnector) {
                inConnector.contract();
            });

            sourceVisualProperty.outConnectors.forEach(function (outConnector) {
                outConnector.contract();
            });
        }

    });

}

function changeMarkShape(theMark, shapeValue) {

    if (LOG)
        console.log("%c" + "What the 'changeMarkShape' function gets as second parameter:", "background: rgb(33,128,213); color: black;");
    if (LOG)
        console.log(shapeValue);

    if (!shapeValue.isShapeData) {
        return;
    }

    var path = null;
    var svgPathGroupMark = null;
    var newShape = null;

    if (shapeValue.shape === PATH_MARK || shapeValue.shape === FILLEDPATH_MARK) {
        path = shapeValue.path;
    } else if (shapeValue.shape === SVGPATHGROUP_MARK) {
        svgPathGroupMark = shapeValue.svgPathGroupMark;
    }

//    if (LOG) {
    console.log("shapeValue:");
    console.log(shapeValue);
//    }

    newShape = shapeValue.shape;

//    if (LOG) {
    console.log("newShape");
    console.log(newShape);
//    }


//    if (LOG) console.log("The received path:");
//    if (LOG) console.log(path);

    var originalMarkExpanded = !theMark.isCompressed;

    // The mark that has to change of shape is compressed so that their attributes are not visible 
    theMark.compress(true);

    setTimeout(function () {

        var duration = 500;
        var easing = fabric.util.ease['easeOutQuad'];

        theMark.animate('scaleX', 0, {
            easing: easing,
            duration: duration,
        });
        theMark.animate('scaleY', 0, {
            easing: easing,
            duration: duration,
            onChange: function () {
                theMark.positionElements();
                canvas.renderAll();
            },
            onComplete: function () {

                var options = theMark.generateOptionsForShape(newShape);

                // All the replacing marks should be born with no size
                options.scaleX = 0;
                options.scaleY = 0;
                options.animateAtBirth = false;
                options.markAsSelected = true;

                if (path) {
                    options.thePath = path;
                }

//                if (LOG) {
                console.log("****** Options to create the new mark: ******");
                console.log(options);
//                }

                theMark.remove(false);

                // Creating a svg path group in the same way the other marks are created is complicated, because the SVGPATHGROUP_MARK has synchronization issues (because of the amount of information it stores)
                // Because of this, when the destination should be a SVGPATHGROUP_MARK, the approach used is cloning, instead of creating the mark from scratch
                // It is assumed that the shape that will be cloned is sent to this function in the object that is received as a parameter                
                var newMark = null;

                if (LOG)
                    console.log("svgPathGroupMark:");
                if (LOG)
                    console.log(svgPathGroupMark);

                if (svgPathGroupMark) {

                    // Cloning the mark that will provides the shape
                    newMark = svgPathGroupMark.clone(options);
                    canvas.add(newMark);

                } else {
                    newMark = addMarkToCanvas(newShape, options);
                }

                if (LOG) {
                    console.log("++++++ The created mark ++++++");
                    console.log(newMark);
                }

                copyVisualPropertiesConnectors(theMark, newMark);

                easing = fabric.util.ease['easeInQuad'];

                newMark.animate('scaleX', newMark.finalScaleX || 1, {
                    easing: easing,
                    duration: duration,
                });
                newMark.animate('scaleY', newMark.finalScaleY || 1, {
                    easing: easing,
                    duration: duration,
                    onChange: canvas.renderAll.bind(canvas),
                    onComplete: function () {
                        if (originalMarkExpanded) {
                            newMark.expand(true);
                        }
                    }
                });
                canvas.renderAll();
            }
        });

    }, 500);

}




function createMarkFromXMLNode(markXmlNode) {

    var options = {
        markType: markXmlNode.attr('shape'),
        xmlID: markXmlNode.attr('xmlID'),
        locatorXmlID: Number(markXmlNode.attr('locatorXmlID')),
        xmlIDs: {},
        values: {}
    };

    var children = markXmlNode.children();
    children.each(function () {
        var child = $(this);
        var tagName = this.tagName;

        if (tagName === "property") {

            var valueXmlNode = $(child.find('value')[0]);
            var propertyValue = createValueFromXMLNode(valueXmlNode);

            var xmlID = child.attr('xmlID');
            var attribute = child.attr('attribute');

            options.values[attribute] = propertyValue;
            options.xmlIDs[attribute] = xmlID;

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

    return createMark(options);
}

function createMark(options) {

    var markType = options.markType;
    var isExpanded = options.isExpanded;

    options.doNotRefreshCanvas = (options.markType !== SVGPATHGROUP_MARK); // SVGPATHGROUP_MARKs should always refresh the canvas, as they do not necessarily are loaded together with all other marks
    options.markAsSelected = false;
    options.animateAtBirth = !isExpanded;

//    if (LOG) {
//        console.log("options:");
//        console.log(options);
//    }

    options.shouldExpand = options.isExpanded;
    var theMark = addMarkToCanvas(markType, options);
}