// The Output mixing defines all the common properties and behaviours that outputs share
var Extractor = function () {

    this.iVoLVERClass = 'extractor';

    this.isExtractor = true;
    this.hoverCursor = 'move';

    this.originX = 'center';
    this.originY = 'center';
    this.transparentCorners = false;

    this.perPixelTargetFind = true;
    this.isCompressed = true;

    this.showLabel = true;
    this.indent = 20;
    this.propertiesRadius = 25;
    this.propertiesSeparation = 60;
    this.propertiesGap = 35;
    this.labelGap = 15;

    this.coreProperties = new Array();

    this.applyXmlIDs = function (xmlIDs) {

        var theExtractor = this;

        if (xmlIDs) {
            for (var attribute in xmlIDs) {

                var xmlID = xmlIDs[attribute];

                console.log("attribute: " + attribute + " xmlID: " + xmlID);

                var visualProperty = theExtractor.getVisualPropertyByAttributeName(attribute);
                if (visualProperty !== null) {
                    visualProperty.xmlID = xmlID;
                    addToConnectableElements(visualProperty);

                } else {
                    console.log("No visual property found with attribute " + attribute);
                }
            }
        }
    };

    this.setXmlIDs = function (from) {

        var theExtractor = this;

        theExtractor.xmlID = from++;
        theExtractor.visualProperties.forEach(function (visualProperty) {
            visualProperty.xmlID = from++;
        });

        return from;
    };

    this.executePendingConnections = function () {

        var theExtractor = this;

        // The same is made for the visual properties of the mark, as they can also be connected
        theExtractor.visualProperties.forEach(function (visualProperty) {
            console.log("%c" + "For one VISUAL PROPERTY", "background: rgb(81,195,183); color: white;");
            executePendingConnections(visualProperty.xmlID);
        });

    };



    this.createRectBackground = function () {
        var theExtractor = this;
        var backgroundRect = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            top: theExtractor.top,
            left: theExtractor.left,
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
//            rx: 10,
//            ry: 10
        });
        backgroundRect.on({
            'doubleTap': function (options) {
                theExtractor.trigger('doubleTap', options);
            },
//            'moving': function (options) {
//                if (!theExtractor.isCompressed) {
//
//                    var localPointer = backgroundRect.getLocalPointer(options.e);
//                    if (LOG) console.log(localPointer);
//
//                    theExtractor.left = backgroundRect.left;
//                    theExtractor.top = backgroundRect.top + theExtractor.indent + theExtractor.height / 2 - localPointer.y / 2;
//                    theExtractor.positionElements();
//                }
//            }
        });
        this.set('backgroundRect', backgroundRect);
        canvas.add(backgroundRect);
    };
    this.createVisualProperties = function () {
        for (var i = 0; i < this.coreProperties.length; i++) {
            var visualProperty = CreateVisualProperty(this.coreProperties[i], this, this.left, this.top);
            this.visualProperties.push(visualProperty);
            visualProperty.setCoords();
        }
        for (var i = 0; i < this.specificProperties.length; i++) {
            var visualProperty = CreateVisualProperty(this.specificProperties[i], this, this.left, this.top);
            this.visualProperties.push(visualProperty);
            visualProperty.setCoords();
        }
    };
    this.animateBirth = function (markAsSelected) {

        var theExtractor = this;
        var scaleX = this.scaleX;
        var scaleY = this.scaleY;
        this.set('scaleX', 0);
        this.set('scaleY', 0);

        if (markAsSelected) {
            this.applySelectedStyle(false);
        }

        var easing = fabric.util.ease['easeOutElastic'];
        var duration = 1200;

        theExtractor.animate('scaleX', scaleX, {
            duration: duration,
            easing: easing
        });

        theExtractor.animate('scaleY', scaleY, {
            duration: duration,
            easing: easing,
            onChange: function () {
                if (theExtractor.placeLabel) {
                    theExtractor.placeLabel();
                }
                canvas.renderAll();
            },
            onComplete: canvas.renderAll.bind(canvas)
        });

    };

    this.applySelectedStyle = function (selectConnectors) {
        if (LOG)
            console.log("At the vixor");
        this.stroke = widget_selected_stroke_color;
        this.strokeWidth = this.strokeWidthWhenSelected || widget_selected_stroke_width;
        this.strokeDashArray = widget_selected_stroke_dash_array;

        if (selectConnectors) {
            this.visualProperties.forEach(function (visualProperty) {
                if (visualProperty.inConnectors.length || visualProperty.outConnectors.length) {
                    visualProperty.applySelectedStyle(true);
                }
            });
        }

    };

    this.applyUnselectedStyle = function (unSelectConnectors) {
        this.stroke = this.colorForStroke;
        this.strokeWidth = this.originalStrokeWidth;
        this.strokeDashArray = [];
        
        if (unSelectConnectors) {
            this.visualProperties.forEach(function (visualProperty) {
                if (visualProperty.inConnectors.length || visualProperty.outConnectors.length) {
                    visualProperty.applyUnselectedStyle(true);
                }
            });
        }
    };



    this.blink = function () {
        var theExtractor = this;
        var increment = 0.3;
        var duration = 100;
        var easing = fabric.util.ease['easeInCubic'];
        theExtractor.animate('scaleX', '+=' + increment, {
            duration: duration,
            easing: easing,
            onComplete: function () {
                theExtractor.animate('scaleX', '-=' + increment, {
                    duration: 1100,
                    easing: fabric.util.ease['easeOutElastic']
                });
            }
        });
        theExtractor.animate('scaleY', '+=' + increment, {
            duration: duration,
            onChange: canvas.renderAll.bind(canvas),
            easing: easing,
            onComplete: function () {
                theExtractor.animate('scaleY', '-=' + increment, {
                    duration: 1100,
                    onChange: canvas.renderAll.bind(canvas),
                    easing: fabric.util.ease['easeOutElastic']
                });
            }
        });
    };
    this.animateProperty = function (property, value, duration, easing) {
        var theExtractor = this;
        theExtractor.animate(property, value, {
            duration: duration,
            easing: easing,
            onChange: function () {
                if (theExtractor.isEllipticExtractor) {
                    theExtractor.width = theExtractor.rx * 2;
                    theExtractor.height = theExtractor.ry * 2;
                }
                if (theExtractor.isFatFontExtractor) { // For some reason, there is the need to refresh the canvas for some of the properties of the IText (e.g. the fontSize attribute)
                    canvas.renderAll();
                }
                theExtractor.positionElements();
            },
            onComplete: function () {
                theExtractor.positionElements();
                canvas.renderAll();
            }
        });
    };

    this.changeColors = function (fill, stroke) {
        this.fill = fill;
        this.stroke = stroke;
        this.colorForStroke = stroke;
        this.backgroundRect.stroke = stroke;
        this.visualProperties.forEach(function (visualProperty) {
            if (!visualProperty.selected) {
                visualProperty.stroke = stroke;
            }
            visualProperty.fill = fill;
            visualProperty.outConnectors.forEach(function (outConnector) {
                outConnector.changeColor(stroke);
            });
        });
    };

    this.animateVisualProperty = function (i, prop, endValue, duration, easing, refreshCanvas, removeAfterCompletion, activateEventsAfterAnimation, statusForVisualPropertiesEventsAfterAnimation) {
        var theExtractor = this;
        var visualProperty = theExtractor.visualProperties[i];
        fabric.util.animate({
            startValue: visualProperty[prop],
            endValue: endValue,
            duration: duration,
            easing: easing,
            onChange: function (value) {
                visualProperty[prop] = value;


                updateConnectorsPositions(visualProperty);

                // only render once
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {
                visualProperty.setCoords();

                updateConnectorsPositions(visualProperty);

                if (removeAfterCompletion) {
//                    visualProperty.remove();
                    canvas.remove(visualProperty);
                    canvas.renderAll();
                }
                if (activateEventsAfterAnimation) {
                    theExtractor.evented = true;
                }

                theExtractor.setEnabledVisualPropertiesEvents(statusForVisualPropertiesEventsAfterAnimation);
            }
        });
    };

    this.setEnabledVisualPropertiesEvents = function (status) {
        this.visualProperties.forEach(function (visualProperty) {
            visualProperty.evented = status;
        });
    };

    this.applyBackgroundGradient = function (boundingRect) {

//      if (LOG) console.log("boundingRect:");
//      if (LOG) console.log(boundingRect);

        var theExtractor = this;
        var theBackground = theExtractor.backgroundRect;
        var boundingRectCenterBottom = new fabric.Point(theExtractor.left, boundingRect.top + boundingRect.height);

//        drawRectAt(boundingRectCenterBottom, "red");

        boundingRectCenterBottom.y += theExtractor.propertiesGap;
        var topCenter = theBackground.getPointByOrigin('center', 'top');
//        drawRectAt(topCenter, "green");

//        var vixorHeight = (boundingRectCenterBottom.y + theExtractor.propertiesSeparation) - topCenter.y;
        var vixorHeight = boundingRect.height;
        var stop = (vixorHeight + theExtractor.propertiesSeparation) / theBackground.getHeight();
        if (!isFinite(stop) || stop < 0 || stop > 1) {
//            stop = 0.01;
            stop = 1;
        }

        var topOpacity = 0.75;
        if (theExtractor.isTextualExtractor) {
            topOpacity = 0;
        }

        var JSONString = '{"0": "rgba(255,255,255, ' + topOpacity + ')", "' + stop.toFixed(2) + '": "rgba(242,242,242,0.975)"}';
        var colorStops = jQuery.parseJSON(JSONString);

//      if (LOG) console.log("colorStops BEFORE:");
//      if (LOG) console.log(colorStops);

        colorStops["1"] = "rgba(255,255,255, 1)";

//      if (LOG) console.log("colorStops AFTER:");
//      if (LOG) console.log(colorStops);

        theBackground.setGradient('fill', {
            type: 'linear',
            x1: 0,
            y1: 0,
            x2: 0,
            y2: theBackground.getHeight(),
            colorStops: colorStops
        });

    };

    this.bringElementsToFront = function () {

        var theExtractor = this;

        if (!theExtractor.isCompressed) {

            bringToFront(theExtractor.backgroundRect);

            theExtractor.visualProperties.forEach(function (visualProperty) {
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

        bringToFront(theExtractor);

    };

    this.expand = function (refreshCanvas) {

        if (!this.isCompressed)
            return;

//        if (LOG) console.log("%cExpanding", "background:red; color:white");
//        if (LOG) console.log("refreshCanvas: " + refreshCanvas + " - " + this.type);

        var theExtractor = this;

        // Disabling any event for this vixor. This will be enabled once the animations of this method are done.
        theExtractor.evented = false;

        theExtractor.fill = theExtractor.trueColor;

        theExtractor.setCoords();

        var theBackground = this.backgroundRect;
        var duration = 500;
        var easing = fabric.util.ease['easeOutCubic'];

        var boundingRect = theExtractor.getBoundingRect();
        var objectCenter = theExtractor.getCenterPoint();


        // TODO: At the moment, the boundingRect of a FatFont should be compensated for the zoom,
        // so we check for this until this bug is solved
        if (theExtractor.isSamplerExtractor || theExtractor.isRectangularExtractor || theExtractor.isSVGPathExtractor || theExtractor.isTextualExtractor) {
            compensateBoundingRect(boundingRect);
        }



        var newHeight = theExtractor.visualProperties.length * (2 * theExtractor.propertiesRadius + 15) + boundingRect.height + 2 * theExtractor.indent - 20;

        if (LOG)
            console.log("newHeight:");
        if (LOG)
            console.log(newHeight);

        var newWidth = boundingRect.width + 2 * theExtractor.indent;

        var newTop = objectCenter.y + (newHeight / 2 - boundingRect.height / 2 - theExtractor.indent);

        if (LOG)
            console.log("newWidth:");
        if (LOG)
            console.log(newWidth);

        theBackground.width = newWidth;
        theBackground.height = 0;
        theBackground.left = objectCenter.x;
        theBackground.top = objectCenter.y;
        theBackground.stroke = theExtractor.visualPropertyStroke || theExtractor.colorForStroke;

        theBackground.strokeWidth = 1;



//        theBackground.bringToFront();
//        theExtractor.bringToFront();

        bringToFront(theBackground);
        bringToFront(theExtractor);


        var boundingRectCenterBottom = new fabric.Point(theExtractor.left, boundingRect.top + boundingRect.height);
//        drawRectAt(boundingRectCenterBottom, "green");
        boundingRectCenterBottom.y += theExtractor.propertiesGap;

        theBackground.opacity = 1;

        // In the animation of the background, the canvas is not redrawn, as this is done while the visual properties are being moved
        theBackground.animate('top', newTop, {
            easing: easing,
            duration: duration,
        });

        theBackground.animate('height', newHeight, {
            duration: duration,
            easing: easing,
            onChange: function () {

                theExtractor.applyBackgroundGradient(boundingRect);

            },
            onComplete: function () {

                theExtractor.isCompressed = false;
//                drawRectAt(new fabric.Point(theBackground.left, theBackground.top), "black");
            }
        });

        var positions = new Array();
        var i = 0;
        theExtractor.visualProperties.forEach(function (visualProperty) {

            var x = objectCenter.x;
//         var x = theExtractor.left;
            var y = boundingRectCenterBottom.y + i * theExtractor.propertiesSeparation;

//            drawRectAt(new fabric.Point(x,y), generateRandomColor());

            canvas.add(visualProperty);
            visualProperty.bringForward(true);

            visualProperty.outConnectors.forEach(function (connector) {
//                connector.bringToFront();
                bringToFront(connector);
            });

            visualProperty.inConnectors.forEach(function (connector) {
//                connector.bringToFront();
                bringToFront(connector);
            });

//         visualProperty.left = theExtractor.left;
//         visualProperty.top = theExtractor.top;
            visualProperty.left = objectCenter.x;
            visualProperty.top = objectCenter.y;
            visualProperty.scaleX = 0;
            visualProperty.scaleY = 0;
            visualProperty.opacity = 0;

            positions.push({x: x, y: y});

            i++;
        });

//        var easing = fabric.util.ease['easeInCubic'];
        var easing = fabric.util.ease['easeOutQuad'];

        for (var i = 0; i < theExtractor.visualProperties.length; i++) {

            var isTheLastElement = i == theExtractor.visualProperties.length - 1;

            theExtractor.animateVisualProperty(i, 'opacity', 1, duration, easing, false, false, false);
            theExtractor.animateVisualProperty(i, 'scaleX', 1, duration, easing, false, false, false);
            theExtractor.animateVisualProperty(i, 'scaleY', 1, duration, easing, false, false, false);
            theExtractor.animateVisualProperty(i, 'left', positions[i].x, duration, easing, false, false, false);
            theExtractor.animateVisualProperty(i, 'top', positions[i].y, duration, easing, false, false, false);
//            theExtractor.animateVisualProperty(i, 'top', positions[i].y, duration, easing, refreshCanvas && isTheLastElement, false, isTheLastElement, isTheLastElement);
            theExtractor.animateVisualProperty(i, 'top', positions[i].y, duration, easing, false, false, isTheLastElement, isTheLastElement);

        }




        // Refreshing the canvas only once
        fabric.util.animate({
            duration: duration,
            easing: easing,
            onChange: function () {

                theBackground.setCoords();

                /*if (LOG) console.log("theBackground.width");
                 if (LOG) console.log(theBackground.width);*/

                theBackground.width = newWidth;
                theExtractor.bringElementsToFront();

                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {

                theExtractor.bringElementsToFront();

                if (refreshCanvas) {
                    canvas.renderAll();
                }
            }
        });



    };

    this.getCompressedMassPoint = function () {
        var theExtractor = this;
        return theExtractor.getCenterPoint();
    };



    this.compress = function (refreshCanvas) {

        if (this.isCompressed)
            return;

//        if (LOG) console.log("%cCompressing", "background:green; color:white");
//        if (LOG) console.log("refreshCanvas: " + refreshCanvas + " - " + this.type);

        var theExtractor = this;

        // Disabling any event for this mark. This will be enabled once the animations of this method are done.
        theExtractor.evented = false;

//      var objectCenter = theExtractor.getCenterPoint();



        var objectCenter = theExtractor.getCompressedMassPoint();

        var theBackground = this.backgroundRect;
        var duration = 500;
        var easing = fabric.util.ease['easeOutQuad'];

        theBackground.animate('top', objectCenter.y, {
//        theBackground.animate('top', theExtractor.top, {
            easing: easing,
            duration: duration,
        });
        theBackground.animate('opacity', 0, {
            duration: duration,
        });

        theBackground.animate('height', 0, {
            duration: duration,
            easing: easing,
            onComplete: function () {
                theBackground.width = 0;
                theExtractor.isCompressed = true;
                theBackground.setCoords();
                canvas.renderAll();
            }
        });

        var waitingTime = duration - 50;
        if (theExtractor.isTextualExtractor) {
            waitingTime = 0;
        }
        setTimeout(function () {
            theExtractor.fill = theExtractor.fillColor;
        }, waitingTime);

        for (var i = 0; i < theExtractor.visualProperties.length; i++) {
            var isTheLastElement = i == theExtractor.visualProperties.length - 1;
            theExtractor.animateVisualProperty(i, 'opacity', 0, duration, easing, false, true, false);
            theExtractor.animateVisualProperty(i, 'scaleX', 0, duration, easing, false, true, false);
            theExtractor.animateVisualProperty(i, 'scaleY', 0, duration, easing, false, true, false);
            theExtractor.animateVisualProperty(i, 'left', objectCenter.x, duration, easing, false, true, false);
            theExtractor.animateVisualProperty(i, 'top', objectCenter.y, duration, easing, refreshCanvas && isTheLastElement, true, isTheLastElement, false);
        }

    };

    this.positionConnectors = function () {
        this.visualProperties.forEach(function (visualProperty) {
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

    this.positionElements = function () {

//      if (LOG) console.log("positionElements FUNCTION");

        var theExtractor = this;
        theExtractor.setCoords();

        var objectCenter = theExtractor.getCenterPoint();

        if (theExtractor.isCompressed) {
            objectCenter = theExtractor.getCompressedMassPoint();
        }



        var boundingRect = theExtractor.getBoundingRect();

//        drawRectAt(objectCenter, "blue");
//        drawRectAt(new fabric.Point(boundingRect.left, boundingRect.top), "green");
//        drawRectAt(new fabric.Point(boundingRect.left + boundingRect.width, boundingRect.top + boundingRect.height), "green");

        if (theExtractor.isCircularExtractor && (theExtractor.scaleX == theExtractor.scaleY)) {
            var vixorRealRadius = theExtractor.radius * theExtractor.scaleX;

            if (vixorRealRadius < theExtractor.propertiesRadius) {
                vixorRealRadius = theExtractor.propertiesRadius;
            }
            var wh = 2 * vixorRealRadius;
            boundingRect = {top: objectCenter.y - vixorRealRadius, left: objectCenter.x - vixorRealRadius, width: wh, height: wh};

        } else if (theExtractor.isEllipticExtractor && (theExtractor.rx == theExtractor.ry) && (theExtractor.scaleX == theExtractor.scaleY)) {

            var vixorRealRadius = theExtractor.rx * theExtractor.scaleX;
            if (vixorRealRadius < theExtractor.propertiesRadius) {
                vixorRealRadius = theExtractor.propertiesRadius + 5;
            }
            var wh = 2 * vixorRealRadius;
            boundingRect = {top: objectCenter.y - vixorRealRadius, left: objectCenter.x - vixorRealRadius, width: wh, height: wh};
        }

        if (boundingRect.width < theExtractor.propertiesRadius) {
            boundingRect.width = 2 * theExtractor.propertiesRadius;
        }

        // TODO: Eventually, this compensantion should not be necessary
        if (theExtractor.isSamplerExtractor || theExtractor.isFatFontExtractor || theExtractor.isSVGPathGroupExtractor || theExtractor.isRectangularExtractor || theExtractor.isEllipticExtractor || theExtractor.isSVGPathExtractor || theExtractor.isTextualExtractor) {
            compensateBoundingRect(boundingRect);
        }

//      var newHeight = theExtractor.visualProperties.length * (2 * theExtractor.propertiesRadius + 15) + boundingRect.height;

        var newHeight = theExtractor.visualProperties.length * (2 * theExtractor.propertiesRadius + 15) + boundingRect.height + 2 * theExtractor.indent - 20;

        var newWidth = boundingRect.width + 2 * theExtractor.indent;

//      theExtractor.backgroundRect.left = theExtractor.left;
        theExtractor.backgroundRect.left = objectCenter.x;

        theExtractor.backgroundRect.width = newWidth;
        theExtractor.backgroundRect.height = newHeight;

        if (theExtractor.isCompressed) {
//         theExtractor.backgroundRect.top = theExtractor.top;
            theExtractor.backgroundRect.top = objectCenter.y;
            theExtractor.backgroundRect.width = 0;
            theExtractor.backgroundRect.height = 0;
        } else {
            var newTop = objectCenter.y + (newHeight / 2 - boundingRect.height / 2 - theExtractor.indent);
//         var newTop = theExtractor.top + (newHeight / 2 - boundingRect.height / 2 - theExtractor.indent);
            theExtractor.backgroundRect.top = newTop;
        }

        theExtractor.backgroundRect.setCoords();

        var boundingRectCenterBottom = new fabric.Point(theExtractor.left, objectCenter.y + boundingRect.height / 2);
//        drawRectAt(boundingRectCenterBottom, "red");

        boundingRectCenterBottom.y += theExtractor.propertiesGap;



        theExtractor.applyBackgroundGradient(boundingRect);



        var i = 0;
        this.visualProperties.forEach(function (visualProperty) {

            var x = objectCenter.x;
            var y = objectCenter.y;
//         var x = theExtractor.left;
//         var y = theExtractor.top;

            // A different y position for each visual property is only needed when the Extractor is expanded
            if (!theExtractor.isCompressed) {
                y = boundingRectCenterBottom.y + i * theExtractor.propertiesSeparation;
            }

            visualProperty.left = x;
            visualProperty.top = y;
            visualProperty.setCoords();

            visualProperty.inConnectors.forEach(function (inConnector) {
                if (theExtractor.isCompressed) {
//               inConnector.set({'x2': theExtractor.left, 'y2': theExtractor.top});
                    inConnector.set({'x2': objectCenter.x, 'y2': objectCenter.y});
                } else {
                    inConnector.set({'x2': visualProperty.left, 'y2': visualProperty.top});
                }
            });

            visualProperty.outConnectors.forEach(function (outConnector) {
                if (theExtractor.isCompressed) {
                    outConnector.set({'x1': objectCenter.x, 'y1': objectCenter.y});
                } else {
                    outConnector.set({'x1': visualProperty.left, 'y1': visualProperty.top});
                }
            });



            i++;

        });

//      theExtractor.setCoords();

    };

    this.getVisualPropertyByAttributeName = function (attributeName) {
        var theExtractor = this;
        for (var i = 0; i < theExtractor.visualProperties.length; i++) {
            if (theExtractor.visualProperties[i].attribute == attributeName) {
                return theExtractor.visualProperties[i];
            }
        }
        return null;
    };

    this.associateEvents = function () {
        var theExtractor = this;
        this.on({
            'moving': function (options) {
                theExtractor.positionElements();
            },
            'rotating': function (options) {
                theExtractor.positionElements();

                var visualProperty = theExtractor.getVisualPropertyByAttributeName('angle');
                if (visualProperty) {
                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(theExtractor.angle % 360, false, false);
                    });
                }

            },
            'scaling': function (options) {
                theExtractor.positionElements();
            },
            'doubleTap': function (options) {
//            if (LOG) console.log("%cDouble tap on this vixor!", "color:blue;");
                if (this.isCompressed) {
                    this.expand(true);
                } else {
                    this.compress(true);
                }
            }
        });
    };








    return this;
};

/* Function to add outputs to Canvas*/
function addExtractorToCanvas(vixorType, options) {

    if (vixorType === TEXT_RECOGNIZER) {

        return addTextualExtractorToCanvas(options);

    } else if (vixorType === COLOR_REGION_EXTRACTOR) {

        return addSVGPathExtractorToCanvas(options.thePath, options);

    } else if (vixorType === SAMPLER_VIXOR) {

        return addSamplerExtractorToCanvas(options.thePath, options);
    }
}


function createExtractorOptionsFromXMLNode(extractorXmlNode) {

    var extractorType = extractorXmlNode.attr('type');



    if (extractorType === RECTANGULAR_VIXOR) {

//        createExtractorFromXMLNode(extractorXmlNode);

    } else if (extractorType === TEXT_RECOGNIZER) {

        return createTextRecogniserOptionsFromXMLNode(extractorXmlNode);

    } else if (extractorType === COLOR_REGION_EXTRACTOR) {

        return createColorRegionOptionsExtractorFromXMLNode(extractorXmlNode);

    } else if (extractorType === SAMPLER_VIXOR) {

        return createColorSamplerOptionsFromXMLNode(extractorXmlNode);

    }

}

function createExtractorFromXMLNode(extractorXmlNode) {

    var extractorType = extractorXmlNode.attr('type');

    if (extractorType === RECTANGULAR_VIXOR) {

//        createExtractorFromXMLNode(extractorXmlNode);

    } else if (extractorType === TEXT_RECOGNIZER) {

//        createExtractorFromXMLNode(extractorXmlNode);

    } else if (extractorType === COLOR_REGION_EXTRACTOR) {

        return createColorRegionExtractorFromXMLNode(extractorXmlNode);

    } else if (extractorType === SAMPLER_VIXOR) {

        return createColorSamplerFromXMLNode(extractorXmlNode);

    }

}