var SamplerExtractor = fabric.util.createClass(fabric.Group, {
    isSamplerExtractor: true,
    getExtractorType: function () {
        return SAMPLER_VIXOR;
    },
    toXML: function () {
        var theExtractor = this;
        var extractorNode = createXMLElement("extractor");

        addAttributeWithValue(extractorNode, "xmlID", theExtractor.xmlID);
        addAttributeWithValue(extractorNode, "type", theExtractor.getExtractorType());
        appendElementWithValue(extractorNode, "left", theExtractor.left);
        appendElementWithValue(extractorNode, "top", theExtractor.top);
        appendElementWithValue(extractorNode, "angle", theExtractor.angle);
        appendElementWithValue(extractorNode, "untransformedAngle", theExtractor.untransformedAngle);
        appendElementWithValue(extractorNode, "untransformedX", theExtractor.untransformedX);
        appendElementWithValue(extractorNode, "untransformedY", theExtractor.untransformedY);
        appendElementWithValue(extractorNode, "untransformedScaleX", theExtractor.untransformedScaleX);
        appendElementWithValue(extractorNode, "untransformedScaleY", theExtractor.untransformedScaleY);
        appendElementWithValue(extractorNode, "scaleX", theExtractor.getScaleX());
        appendElementWithValue(extractorNode, "scaleY", theExtractor.getScaleY());
        appendElementWithValue(extractorNode, "isExpanded", !theExtractor.isCompressed);
        appendElementWithValue(extractorNode, "isStraightLine", theExtractor.isStraightLine);

        var centerPoint = theExtractor.getCenterPoint();
        var centerPointNode = createXMLElement("originalDrawnPathCenterPoint");
        addAttributeWithValue(centerPointNode, "x", centerPoint.x);
        addAttributeWithValue(centerPointNode, "y", centerPoint.y);
        extractorNode.append(centerPointNode);

        var originalDrawnPath = theExtractor.originalDrawnPath;
        var originalDrawnPathWidth = null;
        var originalDrawnPathHeight = null;
        if (originalDrawnPath) {
            originalDrawnPathWidth = originalDrawnPath.getWidth();
            originalDrawnPathHeight = originalDrawnPath.getHeight();
        } else {
            originalDrawnPathWidth = theExtractor.originalDrawnPathWidth;
            originalDrawnPathHeight = theExtractor.originalDrawnPathHeight;
        }

        appendElementWithValue(extractorNode, "originalDrawnPathWidth", originalDrawnPathWidth);
        appendElementWithValue(extractorNode, "originalDrawnPathHeight", originalDrawnPathHeight);

        if (theExtractor.parentObject && theExtractor.parentObject.isImportedImage) {
            appendElementWithValue(extractorNode, "imageXmlID", theExtractor.parentObject.xmlID);
        }
        theExtractor.visualProperties.forEach(function (visualProperty) {
            var propertyNode = visualProperty.toXML();
            extractorNode.append(propertyNode);
        });
        appendElementWithValue(extractorNode, "offsetPolygonPath", theExtractor.offsetPolygonPath);
        appendElementWithValue(extractorNode, "userTracedPath", theExtractor.userTracedPath);

        var samplingPointsNode = createArrayNodeOfPoints("samplingPoints", theExtractor.samplingPoints, ['x', 'y']);
        var simplifiedPolylineNode = createArrayNodeOfPoints("simplifiedPolyline", theExtractor.simplifiedPolyline, ['x', 'y']);
        var translatedPointsNode = createArrayNodeOfPoints("translatedPoints", theExtractor.translatedPoints, ['x', 'y']);
        var samplingMarksPositionsNode = createArrayNodeOfPoints("samplingMarksPositions", theExtractor.samplingMarks, ['left', 'top']);

        var samplingMarksColorPropertiesNode = createArrayNodeOfPoints("samplingMarksColorProperties", theExtractor.samplingMarks, ['fill', 'stroke']);
        var samplingMarksUntransformedPropertiesNode = createArrayNodeOfPoints("samplingMarksUntransformedProperties", theExtractor.samplingMarks, ['untransformedX', 'untransformedY', 'untransformedAngle']);

        extractorNode.append(samplingPointsNode);
        extractorNode.append(simplifiedPolylineNode);
        extractorNode.append(translatedPointsNode);
        extractorNode.append(samplingMarksPositionsNode);
        extractorNode.append(samplingMarksColorPropertiesNode);
        extractorNode.append(samplingMarksUntransformedPropertiesNode);

        return extractorNode;
    },
    initialize: function (objects, options) {

//        console.log("%c" + "Creation options for Color Sampler:", "background: red; color: white;");
//        console.log(options);

        options || (options = {});
        this.callSuper('initialize', objects, options);



        var totalSamplingPointsValue = null;
        var samplingDistanceValue = null;
        var lengthValue = null;
        var trajectoryValue = null;


        if (options.values) {
            totalSamplingPointsValue = options.values.totalSamplingPoints || createNumericValue(this.totalSamplingPoints, null, null, 'points');
            samplingDistanceValue = options.values.samplingDistance || createNumericValue(this.samplingDistance, null, null, 'pixels');

            lengthValue = options.values.length || createNumericValue(this.length, null, null, 'pixels');
            trajectoryValue = options.values.trajectory || createNumericValue(this.trajectory, null, null, 'pixels');

        } else {
            totalSamplingPointsValue = createNumericValue(this.totalSamplingPoints, null, null, 'points');
            samplingDistanceValue = createNumericValue(this.samplingDistance, null, null, 'pixels');
            lengthValue = createNumericValue(this.length, null, null, 'pixels');
            trajectoryValue = createNumericValue(this.trajectory, null, null, 'pixels');
        }



        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', options.strokeWidth || 2);
        this.set('perPixelTargetFind', true);

        this.set('visualPropertyFill', options.visualPropertyFill || rgb(153, 153, 153));
        this.set('visualPropertyStroke', options.visualPropertyStroke || rgb(86, 86, 86));
        this.set('colorForStroke', options.visualPropertyStroke || rgb(86, 86, 86));

        this.createRectBackground();

        this.set('widgets', new Array());
        this.set('visualProperties', new Array());
        this.set('specificProperties', new Array());


        this.specificProperties.push({attribute: "totalSamplingPoints", readable: true, writable: true, types: ['number'], updatesTo: ['samplingDistance'], dataTypeProposition: 'isNumericData', value: totalSamplingPointsValue});
        this.specificProperties.push({attribute: "samplingDistance", readable: true, writable: true, types: ['number'], updatesTo: ['totalSamplingPoints'], dataTypeProposition: 'isNumericData', value: samplingDistanceValue});

        /*this.specificProperties.push({attribute: "samplingDistance", readable: true, writable: true, types: ['number'], updatesTo: ['totalSamplingPoints', 'samplingDistanceX']});
         this.specificProperties.push({attribute: "samplingDistanceX", readable: true, writable: true, types: ['number'], updatesTo: ['totalSamplingPoints', 'samplingDistance']});*/

        this.specificProperties.push({attribute: "colorValues", readable: true, writable: false, types: ['object'], updatesTo: []});

        /*this.specificProperties.push({attribute: "x", readable: true, writable: false, types: ['object'], updatesTo: []});
         this.specificProperties.push({attribute: "y", readable: true, writable: false, types: ['object'], updatesTo: []});*/

        this.specificProperties.push({attribute: "length", readable: true, writable: false, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: lengthValue});
        this.specificProperties.push({attribute: "trajectory", readable: true, writable: false, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: trajectoryValue});

        this.createVisualProperties();

        this.applyXmlIDs(options.xmlIDs);


        // Assigning the values to the created visual properties

//        var totalSamplingPointsVisualProperty = this.getVisualPropertyByAttributeName('totalSamplingPoints');
//        totalSamplingPointsVisualProperty.value = createNumericValue(options.totalSamplingPoints, null, null, 'points');

        this.applyUnselectedStyle = function () {
            
            console.log("SAMPLER UNselected");
            
            var offsetPath = this.item(0);
            offsetPath.stroke = offsetPath.colorForStroke;
            offsetPath.strokeWidth = offsetPath.originalStrokeWidth;
            offsetPath.strokeDashArray = [];
        };

        this.applySelectedStyle = function () {
            
            console.log("SAMPLER selected");

            var offsetPath = this.item(0);
            offsetPath.stroke = widget_selected_stroke_color;
            offsetPath.strokeWidth = widget_selected_stroke_width;
            offsetPath.strokeDashArray = widget_selected_stroke_dash_array;
        };

        // Overriding the behaviour of the expand method so that the marks of this vixor are not covered by the background rectangle        
        this.expand = function (refreshCanvas) {
            var theExtractor = this;
            // Calling the nomal expand method from the prototype definition
            SamplerExtractor.prototype.expand.call(this, refreshCanvas);
            theExtractor.bringSamplingMarksToFront();
        };

        this.getCompressedMassPoint = function () {

            var theExtractor = this;
            var objectCenter = theExtractor.getCenterPoint();

            var currentPolyline = new Array();
            theExtractor.samplingMarks.forEach(function (mark) {
                currentPolyline.push({x: mark.left, y: mark.top});
            });
            var topCenter = theExtractor.getPointByOrigin('center', 'top');
            var bottomCenter = theExtractor.getPointByOrigin('center', 'bottom');
            var traversalLine = {x1: topCenter.x, y1: topCenter.y, x2: bottomCenter.x, y2: bottomCenter.y};

            /*canvas.add(new fabric.Line([topCenter.x, topCenter.y, bottomCenter.x, bottomCenter.y], {
             stroke: 'red',
             selectable: false
             }));*/

            var intersectingPoint = getPathLineIntersection(currentPolyline, traversalLine);
            if (intersectingPoint) {
                return intersectingPoint;
            } else {
                return objectCenter;
            }


        };

        this.associateInteractionEvents = function () {
            var theExtractor = this;
            theExtractor.on({
                'mousedown': function (options) {
                    theExtractor.onMouseDown(options);
                },
                'mouseup': function (options) {
                    theExtractor.onMouseUp(options);
                },
                'moving': function (options) {
                    theExtractor.onMoving(options);
                },
                'scaling': function (options) {
                    theExtractor.onScaling(options);
                },
                'rotating': function (options) {
                    theExtractor.onRotating(options);
                },
            });
        };

        this.bringElementsToFront = function () {

            var theSampler = this;
            if (!theSampler.isCompressed) {

                bringToFront(theSampler.backgroundRect);

                theSampler.visualProperties.forEach(function (visualProperty) {
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
            bringToFront(theSampler);

            theSampler.bringSamplingMarksToFront();

            canvas.renderAll();

        };


//        var userPathCopy = fabric.util.object.clone(this.item(1));

//        console.log("this.originX: " + this.originX);
//        console.log("this.originY: " + this.originY);
//        console.log("this.top: " + this.top);
//        console.log("this.left: " + this.left);

//        drawRectAt(this.getCenterPoint(), 'purple');

//        var offsetPath = this.item(0);
//        console.log("offsetPath.top: " + offsetPath.top);
//        console.log("offsetPath.getTop(): " + offsetPath.getTop());
//
//        console.log("offsetPath.left: " + offsetPath.left);
//        console.log("offsetPath.getLeft(): " + offsetPath.getLeft());
//
//        var userPath = this.item(1);
//        
////        setTimeout(function () {
////            userPath.strokeWidth = 3;
////            userPath.left -= userPath.strokeWidth/2;
////            userPath.top -= userPath.strokeWidth/2;
////        },
////        3000);
//        
//        
//        console.log("userPath.top: " + userPath.top);
//        console.log("userPath.left: " + userPath.left);




//        userPath.top = 0;
//        userPath.left = 0;
//        userPath.setCoords();

    },
    onManipulating: function (options) {
        var theExtractor = this;

        theExtractor.hasControls = false;

        theExtractor.setCoords();

        var hasParent = theExtractor.parentObject;
        objectMoving(options, this);

        if (hasParent) {
            computeUntransformedProperties(theExtractor);
        }
    },
    onMoving: function (options) {
//        if (LOG) console.log("MOVING sampler vixor");
        this.onManipulating(options);
    },
    onScaling: function (options) {
//        if (LOG) console.log("SCALING sampler vixor");
        this.onManipulating(options);
    },
    onRotating: function (options) {
//        if (LOG) console.log("ROTATING sampler vixor");
        this.onManipulating(options);
    },
    bringSamplingMarksToFront: function () {
        var theExtractor = this;
        theExtractor.samplingMarks.forEach(function (samplingMark) {
//            samplingMark.bringToFront();
            bringToFront(samplingMark);
        });
    },
    onMouseDown: function (options) {
        this.bringElementsToFront();
    },
    onMouseUp: function (options) {

        var theExtractor = this;

        /*var newParentObject;
         
         var fullyContainerElement = findContainerElement(this, ['isImportedImage']);
         if (fullyContainerElement) {
         newParentObject = fullyContainerElement;
         if (LOG)
         console.log("%cReleased over this element:", "background: green; color:white;");
         console.log(fullyContainerElement);
         } else {
         var intersectorElement = findIntersectorElement(this, ['isImportedImage']);
         if (intersectorElement) {
         newParentObject = intersectorElement;
         if (LOG)
         console.log("%cNot fully contained by an imported image:", "background: yellow; color:black;");
         } else {
         if (LOG)
         console.log("%cReleased over the canvas", "background: red; color:white;");
         
         intersectorElement = null;
         
         // This vixor should be removed from the list of widgets of its previous parent
         
         }
         }*/



        var newParentObject = null;
        var samplingPoints = theExtractor.samplingMarks;
        var totalSamplingPoints = samplingPoints.length;
        for (var i = 0; i < totalSamplingPoints; i++) {
            var samplingMark = samplingPoints[i];
            var center = samplingMark.getCenterPoint();
            var fabricPoint = new fabric.Point(center.x, center.y);
            newParentObject = getImportedImageContaining(fabricPoint);
            if (newParentObject) {
                break;
            }
        }






        var parentChanged = newParentObject !== theExtractor.parentObject;

        if (parentChanged) {

            theExtractor.nonSerializable = true;

            // This is, indeed, a new parent, and it exists
            if (LOG)
                console.log("%cThe parent of the COLOR SAMPLER has changed", "background: pink; color:blue;");


//                console.log("BEFORE removal");
//                console.log(theExtractor.parentObject.widgets);

            // The old parent has to forget this vixor as part of its widgets
            if (theExtractor.parentObject) {
                fabric.util.removeFromArray(theExtractor.parentObject.widgets, theExtractor);
            }

//            console.log("AFTER removal");
//                console.log(theExtractor.parentObject.widgets);

            theExtractor.parentObject = newParentObject;

            if (newParentObject) {

                console.log("%cThe new parent of the COLOR SAMPLER is:", "background: pink; color:blue;");
                console.log(newParentObject);

                newParentObject.widgets.push(theExtractor);
                computeUntransformedProperties(theExtractor);
                theExtractor.untransformedScaleX = 1 / newParentObject.scaleX;
                theExtractor.untransformedScaleY = 1 / newParentObject.scaleY;

            } else {

                console.log("%cThe COLOR SAMPLER is now on the canvas! It has no parent :( ", "background: pink; color:blue;");

//                 The vixor has been dropped on the canvas, so it becomes parentless
                theExtractor.parentObject = null;

                var hexColor = rgb(145, 145, 145);
                var darkColor = darkenrgb(145, 145, 145);

                theExtractor.samplingMarks.forEach(function (mark) {
                    mark.fill = hexColor;
                    mark.stroke = darkColor;
                    mark.colorForStroke = darkColor;
                });

                theExtractor.nonSerializable = false;

                canvas.renderAll();

            }

        } else {

            theExtractor.nonSerializable = true;

            // The parent has not changed
            if (LOG)
                console.log("%cSAME parent", "background: blue; color:white;");
            if (newParentObject) {
                computeUntransformedProperties(theExtractor);
            } else {
                // The vixor has been dropped on the canvas, and it was there before this
                // Nothing to do here                
            }
        }

        theExtractor.sampleColors();

    },
    areTheSameColors: function (colors1, colors2) {

//        console.log("areTheSameColors FUNCTION");

        if (!colors1 || !colors2 || colors1.length !== colors2.length) {
            return false;
        }

        for (var i = 0; i < colors1.length; i++) {
            if (colors1[i] != colors2[i]) {

                if (LOG)
                    console.log("colors1[i]:");
                if (LOG)
                    console.log(colors1[i]);

                if (LOG)
                    console.log("colors2[i]:");
                if (LOG)
                    console.log(colors2[i]);

                return false;
            }
        }

        return true;
    },
    setColorValues: function (colorValues) {

        var theExtractor = this;

        if (theExtractor.areTheSameColors(colorValues, theExtractor.colorValues)) {
            console.log("%c areTheSameColors returned true", "background: white; color: red;");
            return;
        }

        if (LOG)
            console.log("%csetting color values of sample vixor (areTheSameColors returned false) ", "background: white; color: blue;");


        theExtractor.set('colorValues', colorValues);

        var colorValuesVisualProperty = theExtractor.getVisualPropertyByAttributeName('colorValues');

        var fabricColors = new Array();

        colorValues.forEach(function (color) {
            fabricColors.push(createColorValue(new fabric.Color(color)));
        });



        if (LOG)
            console.log("fabricColors:");
        if (LOG)
            console.log(fabricColors);

        colorValuesVisualProperty.value = fabricColors; // setting the value of the colorValues visual properties


        // updating the value of all the out going connectors
        colorValuesVisualProperty.outConnectors.forEach(function (outConnector) {
            if (LOG)
                console.log("setting value of out going connector");
            outConnector.setValue(fabricColors, false, true);
        });

    },
    sampleColors: function () {

        var theExtractor = this;
        var colorValues = new Array();

        if (LOG)
            console.log("%cAttempting to sample colors in the image associated to this SAMPLER vixor", "background:#184f52; color:white;");

        if (theExtractor.parentObject) {

            var imageObject = theExtractor.parentObject;

            var imageForTextRecognition = imageObject.id;


            var request = new XMLHttpRequest(); // create a new request object to send to server    
            request.open("POST", "SampleColorsFromImageObject", true); // set the method and destination
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            request.onreadystatechange = function () {

                if (request.readyState === 4) { // has the data arrived?
                    if (request.status === 200) { // is everything OK?

                        var textResponse = request.responseText; // getting the result



                        if (textResponse.trim().length > 0) {
                            var response = JSON.parse(textResponse);

                            if (response) {

                                if (LOG)
                                    console.log("response:");
                                if (LOG)
                                    console.log(response);

                                var m = 0;


                                response.forEach(function (array) {

                                    /*if (LOG) console.log("array");
                                     if (LOG) console.log(array);*/

//                                    var b = parseFloat(array[0][1]).toFixed(0);
//                                    var g = parseFloat(array[0][1]).toFixed(0);
//                                    var r = parseFloat(array[0][0]).toFixed(0);

                                    var r = Number(array[0]);
                                    var g = Number(array[1]);
                                    var b = Number(array[2]);

                                    var percentage = 7;
                                    var sampledColor = null;
                                    var fillColor = null;
                                    var strokeColor = null;



                                    if (r === -1 && g === -1 && b === -1) {

                                        r = 198;
                                        g = 198;
                                        b = 198;
//                                        sampledColor = rgb(r, g, b);
                                        sampledColor = 'rgb(112,112,112)';
                                        fillColor = sampledColor;
                                        strokeColor = sampledColor;

                                    } else {

                                        sampledColor = rgb(r, g, b);
                                        fillColor = lightenrgb(r, g, b, percentage);
                                        strokeColor = sampledColor;
                                    }

                                    theExtractor.samplingMarks[m].sampledColor = sampledColor;
                                    theExtractor.samplingMarks[m].fill = fillColor;
                                    theExtractor.samplingMarks[m].stroke = strokeColor;
                                    theExtractor.samplingMarks[m].colorForStroke = strokeColor;

                                    // theExtractor.samplingMarks[m].opacity = 0.2; // TODO: IMPORTANT: JUST FOR DEBUGGING


                                    colorValues.push(sampledColor);

                                    m++;

                                });

                            } else {

                                theExtractor.samplingMarks.forEach(function (samplingMark) {
                                    samplingMark.sampledColor = samplingMark.fill;
                                    colorValues.push(samplingMark.fill);
                                });



                            }

                            theExtractor.setColorValues(colorValues);
                            canvas.renderAll();


                        }
                    }
                }
            };

//            if (LOG) console.log("theExtractor.samplingPoints:");
//            if (LOG) console.log(theExtractor.samplingPoints);

            var actualSamplingPoints = new Array();

            if (LOG)
                console.log("theExtractor.parentObject.left:");
            if (LOG)
                console.log(theExtractor.parentObject.left);

//            var parentTopLeft = theExtractor.parentObject.getPointByOrigin('left', 'top');
//            drawRectAt(parentTopLeft, 'red');

            var imageCopy = fabric.util.object.clone(theExtractor.parentObject);
            imageCopy.strokeWidth = 0;
            imageCopy.setCoords();

            theExtractor.samplingMarks.forEach(function (samplingMark) {

                samplingMark.setCoords();

                var theCopy = fabric.util.object.clone(samplingMark);

                theCopy.originX = 'left';
                theCopy.originY = 'top';
                theCopy.strokeWidth = 0;
                theCopy.setCoords();



//                console.log("samplingMark:");
//                console.log(samplingMark);
//                
//                console.log("theCopy:");
//                console.log(theCopy);



                theCopy.parentObject = theExtractor.parentObject;
                computeUntransformedProperties(theCopy, imageCopy); // This computes the position of the mark relative to the image, which is the parent object of the vixor

//                console.log("theCopy.untransformedX: " + theCopy.untransformedX);
//                console.log("theCopy.untransformedY: " + theCopy.untransformedY);

                actualSamplingPoints.push({x: theCopy.untransformedX, y: theCopy.untransformedY});



            });

//            if (LOG)
//                console.log(actualSamplingPoints);

            request.send("samplingPoints=" + JSON.stringify(actualSamplingPoints) + "&imageForTextRecognition=" + imageForTextRecognition);  // sending the data to the server

        } else {

            theExtractor.samplingMarks.forEach(function (samplingMark) {
                samplingMark.sampledColor = samplingMark.fill;
                colorValues.push(samplingMark.fill);
            });
            canvas.renderAll();

        }

    },
    computeUpdatedValueOf: function (updater, value, updatedProperty) {
        var theExtractor = this;
        if (updater == 'samplingDistance') {
            if (updatedProperty == 'totalSamplingPoints') {
                return theExtractor.length / value;
            }
        } else if (updater == 'totalSamplingPoints') {
            if (updatedProperty == 'samplingDistance') {
                return theExtractor.length / value;
            }
        }
    },
    setProperty: function (property, propertyValue, sourceVisualProperty, shouldAnimate) {

        if (LOG)
            console.log("Llamando a set property");

        var theExtractor = this;

        var value = propertyValue.number;

        if (LOG)
            console.log("%c" + "value:", "background: red; color: white;");
        if (LOG)
            console.log(value);

        if (property === 'samplingDistance' || property === 'totalSamplingPoints') {

            var firstMark = theExtractor.samplingMarks[0];
            var firstMarkPosition = firstMark.getCenterPoint();
            var finalScaleX = firstMark.scaleX;
            var finalScaleY = firstMark.scaleY;

            theExtractor.removeSamplingMarks();

            if (property === 'samplingDistance') {

                theExtractor.samplingDistance = value;

            } else if (property === 'totalSamplingPoints') {


                var totalSamplingPoints = Number(value.toFixed(0));

                theExtractor.totalSamplingPoints = totalSamplingPoints; // of this is not cast to Number, the result is a concatenation (if value is 10, the concatenation would return 101)

                console.log("%c" + "theExtractor.totalSamplingPoints: ", "background: green; color: black;");
                console.log(theExtractor.totalSamplingPoints);

//                theExtractor.samplingDistance = Number((theExtractor.length / (theExtractor.totalSamplingPoints - 1)).toFixed(2));
                theExtractor.samplingDistance = theExtractor.length / (theExtractor.totalSamplingPoints - 1);

                console.log("%c" + "theExtractor.samplingDistance: ", "background: green; color: black;");
                console.log(theExtractor.samplingDistance);

                theExtractor.getVisualPropertyByAttributeName('samplingDistance').value = createNumericValue(theExtractor.samplingDistance);

            }

            var absolutePolyline = new Array();
            theExtractor.translatedPoints.forEach(function (point) {
                var scaledPoint = new fabric.Point(firstMarkPosition.x + theExtractor.scaleX * point.x, firstMarkPosition.y + theExtractor.scaleY * point.y);
                var rotatedPoint = fabric.util.rotatePoint(scaledPoint, firstMarkPosition, fabric.util.degreesToRadians(theExtractor.angle));
                absolutePolyline.push(rotatedPoint);
            });

            if (LOG)
                console.log("absolutePolyline:");
            if (LOG)
                console.log(absolutePolyline);

            var tolerance = 1;
            var highQuality = true;
            var simplifiedPolyline = simplify(absolutePolyline, tolerance, highQuality);
            theExtractor.samplingPoints = samplePolyline(simplifiedPolyline, theExtractor.samplingDistance);

            theExtractor.totalSamplingPoints = theExtractor.samplingPoints.length;

            theExtractor.addSamplingPoints(finalScaleX, finalScaleY);

            var changedVisualProperty = theExtractor.getVisualPropertyByAttributeName(property);
            var propertiesToUpdate = changedVisualProperty.updatesTo;
            propertiesToUpdate.forEach(function (attributeName) {
                var affectedVisualProperty = theExtractor.getVisualPropertyByAttributeName(attributeName);
                affectedVisualProperty.inConnectors.forEach(function (inConnector) {
                    inConnector.contract();
                });
                affectedVisualProperty.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(theExtractor.get(attributeName), false, shouldAnimate);
                });
            });

            theExtractor.sampleColors(false);

        } else if (property === 'samplingDistanceX') {

            var firstMark = theExtractor.samplingMarks[0];
//            var firstMarkPosition = new fabric.Point(firstMark.left, firstMark.top);
            var firstMarkPosition = firstMark.getCenterPoint();
            var finalScaleX = firstMark.scaleX;
            var finalScaleY = firstMark.scaleY;

            theExtractor.removeSamplingMarks();

            if (property === 'samplingDistanceX') {
                // TODO: IMPORTANT: What to do with the sampling distance and the scaling factors? At the moment, the scaling is taken into account to define the sampling points
                var scalingFactor = theExtractor.parentObject ? theExtractor.parentObject.scaleX : 1;
                theExtractor.samplingDistanceX = value * scalingFactor;
            } else if (property === 'totalSamplingPoints') {
                theExtractor.totalSamplingPoints = value.toFixed(0) + 1;
                theExtractor.samplingDistance = theExtractor.length / theExtractor.totalSamplingPoints;
            }

            var absolutePolyline = new Array();
            theExtractor.translatedPoints.forEach(function (point) {
                var scaledPoint = new fabric.Point(firstMarkPosition.x + theExtractor.scaleX * point.x, firstMarkPosition.y + theExtractor.scaleY * point.y);
                var rotatedPoint = fabric.util.rotatePoint(scaledPoint, firstMarkPosition, fabric.util.degreesToRadians(theExtractor.angle));
                absolutePolyline.push(rotatedPoint);
            });

            if (LOG)
                console.log("absolutePolyline:");
            if (LOG)
                console.log(absolutePolyline);

            var leftDistance = 0;

            if (theExtractor.parentObject) {

                var topLeft = theExtractor.parentObject.getPointByOrigin('left', 'top');
                /*drawRectAt(topLeft, 'yellow');*/

                var firstAbsoluteMarkPosition = new fabric.Point(absolutePolyline[0].x, absolutePolyline[0].y);
                /*drawRectAt(firstAbsoluteMarkPosition, 'green');
                 if (LOG) console.log("firstAbsoluteMarkPosition:");
                 if (LOG) console.log(firstAbsoluteMarkPosition);*/

                var rotatedFirstPosition = fabric.util.rotatePoint(firstAbsoluteMarkPosition, topLeft, -fabric.util.degreesToRadians(theExtractor.parentObject.angle));

                /*drawRectAt(rotatedFirstPosition, 'red');
                 if (LOG) console.log("rotatedFirstPosition:");
                 if (LOG) console.log(rotatedFirstPosition);*/

                // distance between the left edge of the image and its first sampling mark
                leftDistance = rotatedFirstPosition.x - topLeft.x;
                /*if (LOG) console.log("leftDistance");
                 if (LOG) console.log(leftDistance);*/

            }

            var objectOfInterest = theExtractor.parentObject ? theExtractor.parentObject : theExtractor;

            var topLine = {p1: objectOfInterest.getPointByOrigin('left', 'top'), p2: objectOfInterest.getPointByOrigin('right', 'top')};
            var bottomLine = {p1: objectOfInterest.getPointByOrigin('left', 'bottom'), p2: objectOfInterest.getPointByOrigin('right', 'bottom')};

            var traversalLength = computeLength(topLine);
            var totalPotentialSamplingPoints = (traversalLength - leftDistance) / theExtractor.samplingDistanceX;
            var totalAbsolutePoints = absolutePolyline.length;

            var begin = 0;

            theExtractor.samplingPoints = new Array();
            // The first point of the path should always be included in the sampling points position
            theExtractor.samplingPoints.push({x: firstMarkPosition.x, y: firstMarkPosition.y});




            for (var i = 1; i < totalPotentialSamplingPoints; i++) {

                var currentDistance = leftDistance + i * theExtractor.samplingDistanceX;

                var p1 = getPointAlongLine(topLine, currentDistance);
                var p2 = getPointAlongLine(bottomLine, currentDistance);
                var samplingLine = {x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y};

                /*canvas.add(new fabric.Line([samplingLine.x1, samplingLine.y1, samplingLine.x2, samplingLine.y2], {
                 stroke: 'red',
                 selectable: false
                 }));
                 if (LOG) console.log("samplingLine:");
                 if (LOG) console.log(samplingLine);*/

                for (var j = begin; j < totalAbsolutePoints - 1; j++) {

                    var p3 = absolutePolyline[j];
                    var p4 = absolutePolyline[j + 1];
                    var currentLine = {x1: p3.x, y1: p3.y, x2: p4.x, y2: p4.y};

                    /*if (LOG) console.log("currentLine:");
                     if (LOG) console.log(currentLine);*/

                    var intersection = getIntersection(currentLine, samplingLine);

                    if (intersection) {
                        theExtractor.samplingPoints.push({x: intersection.x, y: intersection.y});
                        begin = j;
                        break;
                    }

                }

                if (j >= totalAbsolutePoints) {
                    break;
                }

            }


//            if (LOG) console.log("%cThe compute sampling points when sampling over the X axis are:", "background: red; color: yellow;");
//            if (LOG) console.log(theExtractor.samplingPoints);


            /*var tolerance = 1;
             var highQuality = true;
             var simplifiedPolyline = simplify(absolutePolyline, tolerance, highQuality);
             theExtractor.samplingPoints = samplePolyline(simplifiedPolyline, theExtractor.samplingDistance);*/

            theExtractor.totalSamplingPoints = theExtractor.samplingPoints.length;

            theExtractor.addSamplingPoints(finalScaleX, finalScaleY);

            var changedVisualProperty = theExtractor.getVisualPropertyByAttributeName(property);
            var propertiesToUpdate = changedVisualProperty.updatesTo;
            propertiesToUpdate.forEach(function (attributeName) {
                var affectedVisualProperty = theExtractor.getVisualPropertyByAttributeName(attributeName);
                affectedVisualProperty.inConnectors.forEach(function (inConnector) {
                    inConnector.contract();
                });
                affectedVisualProperty.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(theExtractor.get(attributeName), false, shouldAnimate);
                });
            });

            theExtractor.sampleColors(false);

        }

        canvas.renderAll();
        theExtractor.setCoords();

    },
    updateValuesOfPositionProperties: function () {

        var theExtractor = this;

        var untransformedXValues = new Array();
        var untransformedYValues = new Array();

        var firstMarkCopy = theExtractor.samplingMarks[0];
        if (theExtractor.parentObject) {
            // We need to compute the untransformed properties of the sampling marks RESPECT TO THE IMAGE; i.e. the parent object of the vixor to which they belong        
            firstMarkCopy = fabric.util.object.clone(theExtractor.samplingMarks[0]);
            firstMarkCopy.parentObject = theExtractor.parentObject;
            computeUntransformedProperties(firstMarkCopy);
        }

        theExtractor.samplingMarks.forEach(function (mark) {

            var theCopy = mark;
            if (theExtractor.parentObject) {
                theCopy = fabric.util.object.clone(mark);
                theCopy.parentObject = theExtractor.parentObject;
                computeUntransformedProperties(theCopy); // This computes the position of the mark relative to the image, which is the parent object of the vixor
            }

            untransformedXValues.push(theCopy.untransformedX - firstMarkCopy.untransformedX);
            untransformedYValues.push(firstMarkCopy.untransformedY - theCopy.untransformedY);
        });

        theExtractor.set('x', untransformedXValues);
        theExtractor.set('y', untransformedYValues);

        /*if (LOG) console.log("X values");
         if (LOG) console.log(untransformedXValues);
         if (LOG) console.log("Y values");
         if (LOG) console.log(untransformedYValues);*/

    },
    removeSamplingMarks: function () {
        var theExtractor = this;
        theExtractor.samplingMarks.forEach(function (mark) {
            mark.remove();
        });
    },
    addSamplingPoints: function (finalScaleX, finalScaleY) {

        var theExtractor = this;

        var vixorCopy = fabric.util.object.clone(theExtractor);
        vixorCopy.scaleX = 1;
        vixorCopy.scaleY = 1;
        vixorCopy.strokeWidth = 0;
        vixorCopy.setCoords();



        var samplingMarks = new Array();

        finalScaleX = finalScaleX ? finalScaleX : 1;
        finalScaleY = finalScaleY ? finalScaleY : 1;

        var i = 0;
        var totalPoints = theExtractor.samplingPoints.length;
        for (var i = 0; i < totalPoints; i++) {

//            console.log("theExtractor.getWidth(): " + theExtractor.getWidth());
//            console.log("vixorCopy.getWidth(): " + vixorCopy.getWidth());

            var point = theExtractor.samplingPoints[i];

//            console.log(" ****** point");
//            console.log(point);

            var hexColor = rgb(145, 145, 145);
            var darkColor = darkenrgb(145, 145, 145);

            var circleOptions = {
                originX: 'center',
                originY: 'center',
                left: point.x,
                top: point.y,
                fill: hexColor,
                stroke: darkColor,
                strokeWidth: 2,
                radius: 8 * finalScaleX,
                markAsSelected: false,
                doNotRefreshCanvas: i !== 0, // Only the first mark added will refresh the canvas when being born
                parentObject: theExtractor,
                untransformedX: 0,
                untransformedY: 0,
                untransformedScaleX: 1 / finalScaleX,
                untransformedScaleY: 1 / finalScaleY,
                untransformedAngle: 0,
                evented: false,
                selectable: false,
            };

//            var circularMark = addMarkToCanvas(CIRCULAR_MARK, markOptions);
            var circle = new fabric.Circle(circleOptions);
//            circularMark.setPositionByOrigin(new fabric.Point(point.x + 1, point.y + 1), 'center', 'center');
            circle.setPositionByOrigin(new fabric.Point(point.x, point.y), 'center', 'center');

            circle._render = function (ctx) {

                ctx.save();
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.strokeStyle = this.sampledColor;
                ctx.beginPath();
                ctx.rect(-0.5, -0.5, 1, 1);
                ctx.stroke();
                ctx.restore();

            };


            canvas.add(circle);

//            if (LOG) console.log(circularMark);

            theExtractor.widgets.push(circle);
            samplingMarks.push(circle);

            computeUntransformedProperties(circle);




            var circleCopy = fabric.util.object.clone(circle);
            circleCopy.scaleX = 1;
            circleCopy.scaleY = 1;
            circleCopy.strokeWidth = 0;
            circleCopy.setCoords();

            computeUntransformedProperties(circleCopy, vixorCopy);


//            console.log("circle.untransformedX: " + circle.untransformedX);
//            console.log("circleCopy.untransformedX: " + circleCopy.untransformedX);
//            
//            console.log("circle.untransformedY: " + circle.untransformedY);
//            console.log("circleCopy.untransformedY: " + circleCopy.untransformedY);

            circle.untransformedX = circleCopy.untransformedX;
            circle.untransformedY = circleCopy.untransformedY;


//            var parentTopLeft = theExtractor.parentObject.getPointByOrigin('left', 'top');
//            drawRectAt(parentTopLeft, 'red');
//            var topLeft = circularMark.getPointByOrigin('center', 'center');
//            drawRectAt(topLeft, 'blue');
//            var diffX = topLeft.x - parentTopLeft.x;
//            if (LOG) console.log("diffX:");
//            if (LOG) console.log(diffX);
//            if (LOG) console.log("circularMark.untransformedX:");
//            if (LOG) console.log(circularMark.untransformedX);

//            circularMark.untransformedX -= circularMark.radius;
//            circularMark.untransformedY -= circularMark.radius;



        }

        theExtractor.set('samplingMarks', samplingMarks);

        theExtractor.updateValuesOfPositionProperties();

//        if (LOG) console.log("theExtractor.samplingPoints:");
//        if (LOG) console.log(theExtractor.samplingPoints);



    },
});


SamplerExtractor.async = true;

Extractor.call(SamplerExtractor.prototype);



function addSamplerExtractorToCanvas(objects, options) {

//    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%% FUNCTION addSamplerExtractorToCanvas with options: ");
//    console.log(options);

    var samplerExtractor = new SamplerExtractor(objects, options);
    canvas.add(samplerExtractor);
    samplerExtractor.associateEvents();
    samplerExtractor.associateInteractionEvents();
    samplerExtractor.addSamplingPoints();

    var colorValues = new Array();
    samplerExtractor.samplingMarks.forEach(function (samplingMark) {
        colorValues.push(samplingMark.fill);
    });
    samplerExtractor.setColorValues(colorValues);

    return samplerExtractor;
}

function createColorSamplerFromXMLNode(colorSamplerXmlNode) {

    var options = createColorSamplerOptionsFromXMLNode(colorSamplerXmlNode);

    var samplerExtractor = buildAndAddSamplerColor(options);

    samplerExtractor.executePendingConnections();

    return samplerExtractor;
}


function createColorSamplerOptionsFromXMLNode(colorSamplerXmlNode) {

    console.log("createColorSamplerOptionsFromXMLNode function", "background: black; color: white;");

    var options = {
        extractorType: colorSamplerXmlNode.attr('type'),
        xmlID: colorSamplerXmlNode.attr('xmlID'),
        imageXmlID: Number(colorSamplerXmlNode.attr('imageXmlID')),
        xmlIDs: {},
        values: {}
    };

    var children = colorSamplerXmlNode.children();
    children.each(function () {
        var child = $(this);
        var tagName = this.tagName;
        var tagType = child.attr('type');

        if (tagName === "originalDrawnPathCenterPoint") {

            var x = Number(child.attr('x'));
            var y = Number(child.attr('y'));
            options.originalDrawnPathCenterPoint = new fabric.Point(x, y);

        } else if (tagName === "property") {

            var valueXmlNode = $(child.find('value')[0]);
            var propertyValue = createValueFromXMLNode(valueXmlNode);

            var xmlID = child.attr('xmlID');
            var attribute = child.attr('attribute');

            options.values[attribute] = propertyValue;
            options.xmlIDs[attribute] = xmlID;

        } else if (tagType === "array") {

            var array = new Array();
            var pointElements = child.children('element');
            pointElements.each(function () {

                var elementNode = $(this);
                var attributes = null;
                var isNumber = null;

                if (tagName === "samplingPoints" || tagName === "simplifiedPolyline" || tagName === "translatedPoints") {
                    attributes = ['x', 'y'];
                    isNumber = [true, true];
                } else if (tagName === "samplingMarksPositions") {
                    attributes = ['left', 'top'];
                    isNumber = [true, true];
                } else if (tagName === "samplingMarksColorProperties") {
                    attributes = ['fill', 'stroke'];
                    isNumber = [false, false];
                } else if (tagName === "samplingMarksUntransformedProperties") {
                    attributes = ['untransformedX', 'untransformedY', 'untransformedAngle'];
                    isNumber = [true, true, true];
                }

                var loadedObject = {};
                attributes.forEach(function (attribute, index) {
                    var value = elementNode.attr(attribute);
                    if (isNumber[index]) {
                        value = Number(value);
                    }
                    loadedObject[attribute] = value;
                });

                array.push(loadedObject);

            });
            options[tagName] = array;

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

    options.animateAtBirth = !options.isExpanded;
    options.shouldExpand = options.isExpanded;

    console.log("%c Options to create a new COLOR SAMPLER from an XML Node: ", "background: rgb(143,98,153); color: white;");
    console.log(options);

    return options;


}


function buildAndAddSamplerColor(options) {

//    console.log("%c Going to build and add a sample color with the following options:", "background: rgb(97,121,77); color: white;");
//    console.log(options);

    var offsetPath = new fabric.Path(options.offsetPolygonPath, {fill: 'rgba(112,112,112,0.5)', stroke: 'black', colorForStroke: 'black', strokeWidth: 2, originalStrokeWidth: 2});
//    var offsetPath = new fabric.Path(options.offsetPolygonPath, {fill: rgb(198, 198, 198), stroke: '#000000', colorForStroke: '#000000', opacity: 0.75, strokeWidth: 1, originalStrokeWidth: 1});
    var userPath = new fabric.Path(options.userTracedPath, {fill: 'transparent', stroke: 'black', strokeWidth: 1.5});


//    console.log("options.firstPoint:");
//    console.log(options.firstPoint);
//
//    console.log("userPath.getPointByOrigin('left', 'bottom'):");
//    console.log(userPath.getPointByOrigin('left', 'bottom'));


//    console.log("userPath.getWidth(): " + userPath.getWidth());
//    console.log("userPath.getHeight(): " + userPath.getHeight());

    var originalDrawnPath = options.originalDrawnPath;
    var centerPoint = null;
    var originalWidth = null;
    var originalHeight = null;

    if (originalDrawnPath) {
        centerPoint = originalDrawnPath.getCenterPoint();
        originalWidth = originalDrawnPath.getWidth();
        originalHeight = originalDrawnPath.getHeight();
    } else {
        centerPoint = options.originalDrawnPathCenterPoint;
        originalWidth = options.originalDrawnPathWidth;
        originalHeight = options.originalDrawnPathHeight;
    }

    if (options.isStraightLine) {
        offsetPath.originX = 'center';
        offsetPath.originY = 'center';
        userPath.originX = 'center';
        userPath.originY = 'center';

        offsetPath.setPositionByOrigin(centerPoint, 'center', 'center');
        userPath.setPositionByOrigin(centerPoint, 'center', 'center');
//        offsetPath.setPositionByOrigin(options.userTracedPathCenter, 'center', 'center');
//        userPath.setPositionByOrigin(options.userTracedPathCenter, 'center', 'center');
    } else {

        offsetPath.setPositionByOrigin(centerPoint, 'center', 'center');
        userPath.setPositionByOrigin(centerPoint, 'center', 'center');
//        offsetPath.setPositionByOrigin(originalDrawnPath.getCenterPoint(), 'center', 'center');
//        userPath.setPositionByOrigin(originalDrawnPath.getCenterPoint(), 'center', 'center');

        var diffWidth = Math.abs(originalWidth - userPath.getWidth());
        var diffheight = Math.abs(originalHeight - userPath.getHeight());

        if (LOG) {
            console.log("diffWidth: " + diffWidth);
            console.log("diffheight: " + diffheight);
        }

        userPath.left -= diffWidth / 2;
        userPath.top -= diffheight / 2;

    }



    offsetPath.setCoords();
    userPath.setCoords();

//    var offsetPath = new fabric.Path(options.offsetPolygonPath, {fill: rgb(198, 198, 198), stroke: '#000000', colorForStroke: '#000000', opacity: 0.75, strokeWidth: 1, originalStrokeWidth: 1, originX: 'center', originY: 'center'});
//    var userPath = new fabric.Path(options.userTracedPath, {fill: '', stroke: 'black', strokeWidth: 3, originX: 'center', originY: 'center'});
//    offsetPath.setPositionByOrigin(options.userTracedPathCenter, 'center', 'center');
//    userPath.setPositionByOrigin(options.userTracedPathCenter, 'center', 'center');




    var objects = [offsetPath, userPath];

    var parentObject = options.parentObject || null;

    var samplerOptions = {
        originX: 'center',
        originY: 'center',
        hasBorders: false,
        hasControls: false,
        hasRotatingPoint: false,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        perPixelTargetFind: true,
        samplingFrequency: options.samplingFrequency || 5,
        angle: options.angle || 0,
        scaleX: options.scaleX || 1,
        scaleY: options.scaleY || 1,
        samplingPoints: options.samplingPoints,
        length: options.values ? options.values.length.number : (parentObject ? options.totalLength / parentObject.scaleX : options.totalLength),
        trajectory: options.values ? options.values.trajectory.number : (parentObject ? options.trajectory / parentObject.scaleX : options.trajectory),
        simplifiedPolyline: options.simplifiedPolyline,
        translatedPoints: options.translatedPoints,
        samplingDistance: options.values ? options.values.samplingDistance.number : options.samplingDistance,
        totalSamplingPoints: options.samplingPoints.length,
        visualPropertyFill: rgb(153, 153, 153),
        parentObject: parentObject,
        untransformedX: options.untransformedX || 0,
        untransformedY: options.untransformedY || 0,
        untransformedScaleX: options.untransformedScaleX || 1,
        untransformedScaleY: options.untransformedScaleY || 1,
        untransformedAngle: options.untransformedAngle || (parentObject ? 360 - parentObject.getAngle() : 0),
        offsetPolygonPath: options.offsetPolygonPath,
        userTracedPath: options.userTracedPath,
        nonSerializable: parentObject !== null,
        xmlIDs: options.xmlIDs,
        values: options.values,
        originalDrawnPath: options.originalDrawnPath,
        centerPoint: options.originalDrawnPathCenterPoint,
        originalDrawnPathWidth: options.originalDrawnPathWidth,
        originalDrawnPathHeight: options.originalDrawnPathHeight,
        isStraightLine: options.isStraightLine
    };


//    if (options.left) {
//        samplerOptions.left = options.left;
//    }
//    if (options.top) {
//        samplerOptions.top = options.top;
//    }

    var samplerExtractor = addSamplerExtractorToCanvas(objects, samplerOptions);

    samplerExtractor.samplingMarks.forEach(function (sampligMark) {
        blink(sampligMark, false);
    });
    blink(samplerExtractor, true, 0.1);

    var colorValues = options.values ? options.values.colorValues : null;

    if (parentObject && !colorValues) {
        computeUntransformedProperties(samplerExtractor);

        samplerExtractor.untransformedScaleX = 1 / parentObject.getScaleX();
        samplerExtractor.untransformedScaleY = 1 / parentObject.getScaleY();

        samplerExtractor.sampleColors(true);

    } else if (colorValues) {

        var sampledColors = new Array();
        var colorProperties = options.samplingMarksColorProperties;

        colorValues.forEach(function (colorValue, index) {

            var samplingMark = samplerExtractor.samplingMarks[index];
            var sampledColor = colorValue.color.toRgba();
            samplingMark.sampledColor = sampledColor;
            samplingMark.fill = colorProperties[index].fill;
            samplingMark.stroke = colorProperties[index].stroke;
            sampledColors.push(sampledColor);

        });

        samplerExtractor.setColorValues(sampledColors);

    }

    var positions = options.samplingMarksPositions;
    var untransformedProperties = options.samplingMarksUntransformedProperties;

    if (positions && untransformedProperties) {

        var theSamplingMarks = samplerExtractor.samplingMarks;
        theSamplingMarks.forEach(function (samplingMark, index) {

            samplingMark.left = positions[index].left;
            samplingMark.top = positions[index].top;
            samplingMark.untransformedX = untransformedProperties[index].untransformedX;
            samplingMark.untransformedY = untransformedProperties[index].untransformedY;
            samplingMark.untransformedAngle = untransformedProperties[index].untransformedAngle;

        });
    }

    if (options.xmlIDs) {
        samplerExtractor.executePendingConnections();
    }

    if (options.shouldExpand) {
        samplerExtractor.expand(true);
    }

    return samplerExtractor;

}

function findPotentialParent(samplingPoints) {
    var parentObject = null;
    var totalSamplingPoints = samplingPoints.length;
    for (var i = 0; i < totalSamplingPoints; i++) {
        var point = samplingPoints[i];
        var fabricPoint = new fabric.Point(point.x, point.y);
        parentObject = getImportedImageContaining(fabricPoint);
        if (parentObject) {
            break;
        }
    }
    return parentObject;
}

function createSampleExtractorFromPath(drawnPath, fromStraightLine) {

    drawnPath.strokeWidth = 0;
    drawnPath.stroke = 'red';
    drawnPath.fill = 'transparent';
    drawnPath.strokeLineCap = 'butt';
    drawnPath.perPixelTargetFind = true;

//    console.log("drawnPath.getWidth(): " + drawnPath.getWidth());
//    console.log("drawnPath.getHeight(): " + drawnPath.getHeight());

    var simplifiedPolyline = null;

    if (fromStraightLine) {

        var x1 = drawnPath.x1;
        var y1 = drawnPath.y1;
        var x2 = drawnPath.x2;
        var y2 = drawnPath.y2;

        simplifiedPolyline = new Array();
        var startPoint = {x: x1, y: y1};
        var endPoint = {x: x2, y: y2};

        if (x1 === x2 && y1 === y2) {
            simplifiedPolyline.push(startPoint);
        } else {
            simplifiedPolyline.push(startPoint);
            simplifiedPolyline.push(endPoint);
        }

    } else {

        var points = drawnPath.path;

        // converting the user-traced path to a polyline representation
        var polyline = pathToPolyline(points, true);
        if (LOG) {
            console.log("%cpolyline:", "color: #000000; background: #7FFF00;");
            console.log(polyline);
        }

        // simplifying the user-trced polyline
        var tolerance = 1;
        var highQuality = true;
        simplifiedPolyline = simplify(polyline, tolerance, highQuality);


        if (LOG) {
            console.log("%csimplifiedPolyline:", "color: #000000; background: #ADD8E6;");
            console.log(simplifiedPolyline);
        }

        // We need to guarantee that the polyline and the simplifiedPolyline have the same first point (still to test this)



        // It may happen that the first and last point are LOST after the simplification of the original path
        // We check for that before going any further
//        var firstOriginalPoint = polyline[0];
//        var firstSimplifiedPoint = simplifiedPolyline[0];
//
//        var lastOriginalPoint = polyline[polyline.length - 1];
//        var lastSimplifiedPoint = simplifiedPolyline[simplifiedPolyline.length - 1];



//        console.log("%c" + "firstOriginalPoint:", "color: #000000; background: #ADD8E6;");
//        console.log(firstOriginalPoint);
//
//        console.log("%c" + "firstSimplifiedPoint:", "color: #000000; background: #ADD8E6;");
//        console.log(firstSimplifiedPoint);
//
//        console.log("\n");
//
//        console.log("%c" + "lastOriginalPoint:", "color: #000000; background: #ADD8E6;");
//        console.log(lastOriginalPoint);
//
//        console.log("%c" + "lastSimplifiedPoint:", "color: #000000; background: #ADD8E6;");
//        console.log(lastSimplifiedPoint);



    }



//    console.log("simplifiedPolyline:");


    // The variable translatedPoints contains the information of the approximation polyline relative to its first point (which, relative to itself, is located at the poit (0,0) )
    // this points are used to resample the approximation polyline traced by the user and they are needed because, after manipulation (translation, rotation and scaling), the original points traced by the user
    // are not part of the path anymore
    var translatedPoints = new Array();
    simplifiedPolyline.forEach(function (point) {
        var translatedPoint = {x: point.x - simplifiedPolyline[0].x, y: point.y - simplifiedPolyline[0].y};
        translatedPoints.push(translatedPoint);
    });

    // computing the sampling positions over the simplified path
    var samplingDistance = 25;
//    var samplingDistance = 16;
    var samplingPoints = samplePolyline(simplifiedPolyline, samplingDistance);
    var totalLength = computePolylineLength(simplifiedPolyline);
    var trajectory = computePolylineTrajectory(simplifiedPolyline);

    if (LOG) {
        console.log("samplingPoints:");
        console.log(samplingPoints);
    }

//    samplingPoints.forEach(function (point) {
//        drawRectAt(point, 'blue');
//    });

    // generating the offset polygon of the SIMPLIFIED polyline
    var offsetDistance = 28;
    var offsetPolygonPoints = generateOffsetPolygon(simplifiedPolyline, offsetDistance);
    if (LOG) {
        console.log("%coffsetPolygon:", "color: #000000; background: #E6E6FA;");
        console.log("%c" + offsetPolygonPoints, "color: #000000; background: #E6E6FA;");
        console.log(offsetPolygonPoints.length + " points in the offset polygon.");
    }

//    var i = 0;
//    offsetPolygonPoints.forEach(function (point) {
//        drawRectAt(point, lightenrgb(0, 0, 0, i));
//        i += 3;
//    });

    // Removing the NaN values from the generated offset polygon 
    offsetPolygonPoints = removeNaNs(offsetPolygonPoints);

    if (LOG) {
        console.log("****************** AFTER REMOVING NaNs ********************");
        console.log(offsetPolygonPoints.length + " points BEFORE removing NaNs.");
        console.log("%coffsetPolygon:", "color: #000000; background: #bdf1bb;");
        console.log("%c" + offsetPolygonPoints, "color: #000000; background: #bdf1bb;");
        console.log(offsetPolygonPoints.length + " points AFTER removing NaNs.");
    }


    var offsetJSTSPolygon = buildJSTSPolygon(offsetPolygonPoints);
    if (LOG) {
        console.log("%coffsetJSTSPolygon:", "color: #000000; background: #FAFAD2;");
        console.log("%c" + offsetJSTSPolygon, "color: #000000; background: #FAFAD2;");
    }

    // removing self intersections that can be found in the offset polygon
    var cleanedPolygon = removeSelfIntersections(offsetJSTSPolygon);
    if (LOG) {
        console.log("%ccleanedPolygon", "background: #FF0000; color: #FFFFFF");
        console.log("%c" + cleanedPolygon, "background: #FF0000; color: #FFFFFF");
    }

    var finalPolygon = null;
    if (cleanedPolygon.isEmpty()) {
        finalPolygon = offsetJSTSPolygon;
    } else {
        finalPolygon = cleanedPolygon;
    }

//    if ((!cleanedCoordinates || !cleanedCoordinates.length) && drawnPath.remove) {
//        drawnPath.remove();
//        canvas.renderAll();
//        return;
//    }


    var svgPathString = JSTSPolygonToSVGPath(finalPolygon);
    if (LOG) {
        console.log("svgPathString:");
        console.log(svgPathString);
    }

    if (LOG) {
        console.log("drawnPath:");
        console.log(drawnPath);
    }

    var userDefinedPath = polylineToSVGPathString(simplifiedPolyline);

//    console.log("userDefinedPath:");
//    console.log(userDefinedPath);

//    console.log("%c" + "firstPoint:", "background: rgb(33,128,213); color: black;");
//    console.log("x: " + firstPoint.x + " y: " + firstPoint.y);

    var parentObject = findPotentialParent(samplingPoints);

    var options = {
        offsetPolygonPath: svgPathString,
        userTracedPath: userDefinedPath,
        samplingPoints: samplingPoints,
        totalLength: totalLength,
        simplifiedPolyline: simplifiedPolyline,
        translatedPoints: translatedPoints,
        samplingDistance: samplingDistance,
        trajectory: trajectory,
        parentObject: parentObject,
        isStraightLine: fromStraightLine,
        originalDrawnPath: drawnPath,
    };
    var samplerExtractor = buildAndAddSamplerColor(options);

    if (parentObject) {
        parentObject.widgets.push(samplerExtractor);
    }

    if (fromStraightLine) {
        applyInactiveMenuButtonStyle($("#samplerLineButton"));
        deactivateLineColorSampling(false);
    } else {
        applyInactiveMenuButtonStyle($("#samplerButton"));
        deactivateFreeColorSampling(false);
    }

    restorePan1FingerBehaviour();

    if (drawnPath.remove) {
        drawnPath.remove();
    }

}