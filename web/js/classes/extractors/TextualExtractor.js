var TextualExtractor = fabric.util.createClass(fabric.Rect, {
//    type: 'textExtractorExtractor',
    isTextualExtractor: true,
    getExtractorType: function () {
        return TEXT_RECOGNIZER;
    },
    toXML: function () {

        var theTextRecogniser = this;
        var textRecogniserNode = createXMLElement("extractor");

        addAttributeWithValue(textRecogniserNode, "xmlID", theTextRecogniser.xmlID);
        addAttributeWithValue(textRecogniserNode, "type", theTextRecogniser.getExtractorType());
        appendElementWithValue(textRecogniserNode, "left", theTextRecogniser.left);
        appendElementWithValue(textRecogniserNode, "top", theTextRecogniser.top);
        appendElementWithValue(textRecogniserNode, "fill", theTextRecogniser.fill);
        appendElementWithValue(textRecogniserNode, "stroke", theTextRecogniser.stroke);
        appendElementWithValue(textRecogniserNode, "width", theTextRecogniser.width);
        appendElementWithValue(textRecogniserNode, "height", theTextRecogniser.height);
        appendElementWithValue(textRecogniserNode, "angle", theTextRecogniser.angle);
        appendElementWithValue(textRecogniserNode, "scaleX", theTextRecogniser.getScaleX());
        appendElementWithValue(textRecogniserNode, "scaleY", theTextRecogniser.getScaleY());
        appendElementWithValue(textRecogniserNode, "figureType", theTextRecogniser.figureType);
        appendElementWithValue(textRecogniserNode, "untransformedAngle", theTextRecogniser.untransformedAngle);
        appendElementWithValue(textRecogniserNode, "untransformedX", theTextRecogniser.untransformedX);
        appendElementWithValue(textRecogniserNode, "untransformedY", theTextRecogniser.untransformedY);
        appendElementWithValue(textRecogniserNode, "untransformedScaleX", theTextRecogniser.untransformedScaleX);
        appendElementWithValue(textRecogniserNode, "untransformedScaleY", theTextRecogniser.untransformedScaleY);
        appendElementWithValue(textRecogniserNode, "isExpanded", !theTextRecogniser.isCompressed);
        if (theTextRecogniser.parentObject && theTextRecogniser.parentObject.isImportedImage) {
            appendElementWithValue(textRecogniserNode, "imageXmlID", theTextRecogniser.parentObject.xmlID);
        }
        theTextRecogniser.visualProperties.forEach(function (visualProperty) {
            var propertyNode = visualProperty.toXML();
            textRecogniserNode.append(propertyNode);
        });

        return textRecogniserNode;
    },
    initialize: function (options) {

        options.isWidget = true;
        options.selectable = true;
        options.cornerColor = '#ffbd00';
        options.transparentCorners = false;
        options.isTextRecognizer = true;
        options.trueColor = 'rgba(255, 255, 255, 0)';
        options.fillColor = 'rgba(' + 255 + ',  ' + 255 + ', ' + 255 + ', ' + widget_fill_opacity + ')';
        
        // for CHI
    //        options.lockMovementX = true;
    //        options.lockMovementY = true;

        options || (options = {});

        this.callSuper('initialize', options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', options.strokeWidth || 2);
        this.set('perPixelTargetFind', false);

        this.set('visualPropertyFill', options.visualPropertyFill || rgb(153, 153, 153));
        this.set('visualPropertyStroke', options.visualPropertyStroke || rgb(86, 86, 86));
        this.set('colorForStroke', options.visualPropertyStroke || rgb(86, 86, 86));

        this.setControlsVisibility({
            bl: false, // middle top disable
            br: false, // midle bottom
            tl: false, // middle left
            tr: false, // I think you get it
        });

        this.createRectBackground();

        this.set('widgets', new Array());
        this.set('visualProperties', new Array());

        this.set('specificProperties', new Array());

        var textValue = null;
        var numberValue = null;
        var dateAndTimeValue = null;

        if (options.values) {
            textValue = options.values.label || createStringValue(options.text || '');
            numberValue = options.values.number || createNumericValue(this.number || 0, null, null, '');
            dateAndTimeValue = options.values.area || createDefaultValueByTypeProposition('isDateAndTimeData');
        } else {
            textValue = createStringValue(options.text || '');
            numberValue = createNumericValue(this.number || 0, null, null, '');
            dateAndTimeValue = createDefaultValueByTypeProposition('isDateAndTimeData');
        }

        this.specificProperties.push({attribute: "text", readable: true, writable: false, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isStringData', value: textValue});
        this.specificProperties.push({attribute: "number", readable: true, writable: false, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isNumericData', value: numberValue});
        this.specificProperties.push({attribute: "dateAndTime", readable: true, writable: false, types: ['number'], updatesTo: ['area'], dataTypeProposition: 'isDateAndTimeData', value: dateAndTimeValue});



//        this.specificProperties.push({attribute: "time", readable: true, writable: false, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData'});
//        this.specificProperties.push({attribute: "date", readable: true, writable: false, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData'});

        this.createVisualProperties();
        
        this.applyXmlIDs(options.xmlIDs);

        this.applyUnselectedStyle = function () {
            this.stroke = this.colorForStroke;
            this.strokeWidth = this.originalStrokeWidth;
            this.strokeDashArray = widget_selected_stroke_dash_array;
        };

        this.widgetApplySelectedStyle = function () {
            this.stroke = widget_selected_stroke_color;
//            this.strokeWidth = widget_selected_stroke_width;
            this.strokeDashArray = widget_selected_stroke_dash_array;
        }

        this.associateInteractionEvents = function () {
            var theExtractor = this;
            theExtractor.on({
                'mouseup': function (options) {
                    theExtractor.onMouseUp(options);
                },
                'mousedown': function (options) {
                    theExtractor.onMouseDown(options);
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


    },
    initializeVisualPropertiesValues: function () {

        var theExtractor = this;

        var textVisualProperty = theExtractor.getVisualPropertyByAttributeName('text');
        textVisualProperty.value = createStringValue('');

        var numberVisualProperty = theExtractor.getVisualPropertyByAttributeName('number');
        numberVisualProperty.value = createNumericValue(0);

        var dateAndTimeVisualProperty = theExtractor.getVisualPropertyByAttributeName('dateAndTime');

        var xxxx = createDateAndTimeValue(moment());
        if (LOG)
            console.log("xxxx:");
        if (LOG)
            console.log(xxxx);

        dateAndTimeVisualProperty.value = createDateAndTimeValue(moment());
    },
    onManipulating: function (options) {
        var theExtractor = this;

        theExtractor.hasControls = false;

        theExtractor.setCoords();

        var hasParent = theExtractor.parentObject;
        var scaleX = hasParent ? theExtractor.parentObject.getScaleX() : 1;
        var scaleY = hasParent ? theExtractor.parentObject.getScaleY() : 1;

        // to garantee that the scale is always 1 (so that, the stroke with is not affected)
        var newWidth = theExtractor.width * (theExtractor.getScaleX() / scaleX);
        var newHeight = theExtractor.height * (theExtractor.getScaleY() / scaleY);

        theExtractor.width = newWidth;
        theExtractor.height = newHeight;
        theExtractor.scaleX = scaleX;
        theExtractor.scaleY = scaleY;

//        
//        theExtractor.untransformedScaleX = theExtractor.getScaleX() / scaleX;
//        theExtractor.untransformedScaleY = theExtractor.getScaleY() / scaleY;
//        
////        
////        
//        theExtractor.set('originalStrokeWidth', 2 / ((theExtractor.scaleX + theExtractor.scaleY) / 2));
//        theExtractor.set('strokeWidth', 2 / ((theExtractor.scaleX + theExtractor.scaleY) / 2));
//        
//        if (LOG) console.log("theExtractor.strokeWidth:");
//        if (LOG) console.log(theExtractor.strokeWidth);

        if (hasParent) {
            computeUntransformedProperties(theExtractor);
        }
    },
    onMoving: function (options) {
        if (LOG)
            console.log("MOVING text recognizer");
        this.onManipulating(options);
    },
    onScaling: function (options) {
        if (LOG)
            console.log("SCALING text recognizer");
        this.onManipulating(options);
    },
    onRotating: function (options) {
        if (LOG)
            console.log("ROTATING text recognizer");
        this.onManipulating(options);
    },
    bringElementsToFront: function () {

        console.log("%c" + "bringElementsToFront function at TEXT RECOGNISER class", "background: #def659; color: black;");

        var theTextRecogniser = this;
        if (!theTextRecogniser.isCompressed) {
//            theTextRecogniser.backgroundRect.bringToFront();
            bringToFront(theTextRecogniser.backgroundRect);
            theTextRecogniser.visualProperties.forEach(function (visualProperty) {
                if (visualProperty.canvas) {
//                    visualProperty.bringToFront();
                    bringToFront(visualProperty);

                    visualProperty.inConnectors.forEach(function (inConnection) {
//                        inConnection.bringToFront();
                        bringToFront(inConnection);
                    });
                    visualProperty.outConnectors.forEach(function (outConnection) {
//                        outConnection.bringToFront();
                        bringToFront(outConnection);
                    });
                }
            });
        }
//        theTextRecogniser.bringToFront();
        bringToFront(theTextRecogniser);
    },
    onMouseDown: function (options) {
        this.bringElementsToFront();
    },
    /*onMouseUp: function (options) {
     
     if (LOG)
     console.log("Mouse UP over a text recogniser vixor...");
     
     var theExtractor = this;
     
     var newParentObject = null;
     
     var fullyContainerElement = findContainerElement(this, ['isImportedImage']);
     if (fullyContainerElement) {
     newParentObject = fullyContainerElement;
     if (LOG)
     console.log("%cReleased over this element:", "background: green; color:white;");
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
     }
     
     var parentChanged = newParentObject !== theExtractor.parentObject;
     
     if (parentChanged) {
     
     //            theExtractor.nonSerializable = true;
     
     // This is, indeed, a new parent, and it exists
     if (LOG)
     console.log("%cThe vixor has a NEW parent", "background: pink; color:blue;");
     
     // The old parent has to forget this vixor as part of its widgets
     if (theExtractor.parentObject) {
     fabric.util.removeFromArray(theExtractor.parentObject.widgets, theExtractor);
     }
     
     theExtractor.parentObject = newParentObject;
     
     if (newParentObject) {
     newParentObject.widgets.push(theExtractor);
     computeUntransformedProperties(theExtractor);
     theExtractor.untransformedScaleX = 1 / newParentObject.scaleX;
     theExtractor.untransformedScaleY = 1 / newParentObject.scaleY;
     } else {
     
     //                theExtractor.nonSerializable = false;
     
     }
     
     } else {
     
     theExtractor.nonSerializable = true;
     
     // The parent has not changed
     if (LOG)
     console.log("%cSAME parent", "background: blue; color:white;");
     if (newParentObject) {
     // The vixor has been moved within the limits of its parent object
     // Nothing to do here, apart from computing the nntransformed properties of the object within its parent
     computeUntransformedProperties(theExtractor);
     theExtractor.untransformedScaleX = 1;
     theExtractor.untransformedScaleY = 1;
     } else {
     // The vixor has been dropped on the canvas, and it was there before this
     // Nothing to do here                
     }
     }
     
     theExtractor.performTextRecognition();
     
     if (!theExtractor.hasControls) {
     theExtractor.hasControls = true;
     canvas.renderAll();
     }
     
     
     
     },*/

    onMouseUp: function (options) {

        var theExtractor = this;

        var newParentObject;

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
        }

        var parentChanged = newParentObject !== theExtractor.parentObject;

        if (parentChanged) {

            theExtractor.nonSerializable = true;

            // This is, indeed, a new parent, and it exists
            if (LOG)
                console.log("%cThe parent of the TEXT RECOGNISER has changed", "background: pink; color:blue;");


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

                console.log("%cThe new parent of the TEXT RECOGNISER is:", "background: pink; color:blue;");
                console.log(newParentObject);

                /*console.log("*******************************");
                 console.log("theExtractor.originX: " + theExtractor.originX);
                 console.log("theExtractor.originY: " + theExtractor.originY);*/

                if (theExtractor.originX !== 'center' && theExtractor.originY !== 'center') {
                    
                    
                    
                    
                    var leftTop = theExtractor.getPointByOrigin('left', 'top');
//                    var oldLeft = theExtractor.left;
//                    var oldTop = theExtractor.top;
                    var oldLeft = leftTop.x;
                    var oldTop = leftTop.y;
                   
                    theExtractor.originX = 'center';
                    theExtractor.originY = 'center';
                    theExtractor.setPositionByOrigin(new fabric.Point(oldLeft, oldTop), 'left', 'top');
                }



                newParentObject.widgets.push(theExtractor);
                computeUntransformedProperties(theExtractor);
                theExtractor.untransformedScaleX = 1 / newParentObject.scaleX;
                theExtractor.untransformedScaleY = 1 / newParentObject.scaleY;

            } else {

                console.log("%cThe TEXT RECOGNISER is now on the canvas! It has no parent :( ", "background: pink; color:blue;");

//                 The vixor has been dropped on the canvas, so it becomes parentless
                theExtractor.parentObject = null;


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

        theExtractor.performTextRecognition();

        if (!theExtractor.hasControls) {
            theExtractor.hasControls = true;
            canvas.renderAll();
        }

    },
    performTextRecognition: function () {

        var theExtractor = this;

        if (LOG)
            console.log("%cPerforming Text Recognition", "background:#184f52; color:white;");

        if (theExtractor.parentObject) {

            var roi = theExtractor.roi;
            var x = roi.x;
            var y = roi.y;
            var width = roi.width;
            var height = roi.height;
            var angle = roi.angle;

            var imageObject = theExtractor.parentObject;

            var imageForTextRecognition = imageObject.id;

            var request = new XMLHttpRequest(); // create a new request object to send to server    
            request.open("POST", "ExtractTextFromImageObject", true); // set the method and destination
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            request.onreadystatechange = function () {

                if (request.readyState == 4) { // has the data arrived?
                    if (request.status == 200) { // is everything OK?

                        var textResponse = request.responseText; // getting the result

                        if (textResponse.trim().length > 0) {
                            var response = JSON.parse(textResponse);

                            if (response) {

                                if (LOG)
                                    console.log(response);
                                theExtractor.recognizedStrings = response;
                                
                                console.log("theExtractor.recognizedStrings:");
                                console.log(theExtractor.recognizedStrings);


                                if (response && response.length > 0) {
                                    
                                    var mode = getMode(response);
                                    
                                    

                                    theExtractor.text = replaceAll(mode, '.', '');
                                    
                                    console.log("theExtractor.text:");
                                    console.log("%c" + theExtractor.text, "font-size: 40px;");



                                    var stringValue = createStringValue(theExtractor.text);
                                    var textVisualProperty = theExtractor.getVisualPropertyByAttributeName("text");
                                    textVisualProperty.setValue(stringValue);

                                    var cleanedText = theExtractor.text.replace(',', '');
                                    cleanedText = cleanedText.replace(' ', '');

//                                    var number = Number(cleanedText);
                                    var number = parseFloat(cleanedText);
//                                    var number = parseInt(cleanedText);
                                    var numberVisualProperty = theExtractor.getVisualPropertyByAttributeName("number");
                                    if (isNaN(number)) {
                                        number = 0;
                                        numberVisualProperty.evented = false;
                                        numberVisualProperty.outConnectors.forEach(function (outConnector) {
                                            outConnector.contract();
                                        });
                                    } else {
                                        numberVisualProperty.evented = true;
                                    }
                                    theExtractor.number = number;

                                    numberVisualProperty.setValue(createNumericValue(number));







                                    var totalStrings = theExtractor.recognizedStrings.length;

                                    var dateAndTime = null;
                                    var dateAndTimeVisualProperty = theExtractor.getVisualPropertyByAttributeName("dateAndTime");

                                    // trying to find time from ANY of the recognized strings
                                    for (var i = 0; i < totalStrings; i++) {

                                        var string = theExtractor.recognizedStrings[i];

                                        if (LOG)
                                            console.log("Trying to find DATE or TIME in: " + string);

                                        dateAndTime = moment(string, getDateAndTimeFormats(), true);
                                        if (dateAndTime.isValid()) {
                                            if (LOG)
                                                console.log(string + " was a valid time! ;)");
                                            break; // once a valid time has been found, the search should stop
                                        }
                                    }

                                    if (dateAndTime && dateAndTime.isValid()) {
                                        dateAndTime.isTime = true;
                                        dateAndTimeVisualProperty.evented = true;
                                        printDateAndTime(dateAndTime, '#483D8B', 'white');
                                    } else {
                                     dateAndTimeVisualProperty.evented = false;
//                                     dateAndTimeVisualProperty.outConnectors.forEach(function (outConnector) {
//                                     outConnector.contract();
//                                     });
                                     }

                                    /*theExtractor.time = dateAndTime;
                                     dateAndTimeVisualProperty.value = dateAndTime;*/

                                    var dateAndTimeValue = createDateAndTimeValue(dateAndTime);
                                    dateAndTimeVisualProperty.setValue(dateAndTimeValue);




                                    theExtractor.visualProperties.forEach(function (visualProperty) {
                                        var value = visualProperty.value;
                                        visualProperty.outConnectors.forEach(function (outConnector) {
                                            outConnector.setValue(value, false, false);
                                        });
                                    });

                                    canvas.renderAll();

                                }

                            }
                        }
                    }
                }
            };

            request.send("x=" + x + "&y=" + y + "&width=" + width + "&height=" + height + "&angle=" + angle + "&imageForTextRecognition=" + imageForTextRecognition);  // sending the data to the server

        } else {



            /*theExtractor.visualProperties.forEach(function (visualProperty) {
             var value = visualProperty.value;
             visualProperty.outConnectors.forEach(function (outConnector) {
             outConnector.setValue(value, false, false);
             });
             });*/

            canvas.renderAll();


        }
    },
    computeUpdatedValueOf: function (updater, value, updatedProperty) {
        if (updater == 'width' || updater == 'height') {
            if (updatedProperty == 'area') {
                return value * value;
            }
        } else if (updater == 'area') {
            if (updatedProperty == 'width') {
                return Math.sqrt(value);
            } else if (updatedProperty == 'height') {
                return Math.sqrt(value);
            }
        }
    },
    setProperty: function (property, value, theVisualProperty) {

//        if (LOG) console.log("property:");
//        if (LOG) console.log(property);
//
//        if (LOG) console.log("value:");
//        if (LOG) console.log(value);

        var theExtractor = this;

        if (property == 'label') {
            theExtractor.label = '' + value;
        } else if (property == 'fill') {

            var fillColor = value;
            var strokeColor = theVisualProperty.parentObject.colorForStroke;

            if (isHexColor(value)) {
                var rgbColor = hexToRGB(value);
                var r = rgbColor.r;
                var g = rgbColor.g;
                var b = rgbColor.b;
                strokeColor = darkenrgb(r, g, b);
            }

            theExtractor.changeColors(fillColor, strokeColor);

        } else if (property == 'width' || property == 'height' || property == 'area') {


            var changedVisualProperty = theExtractor.getVisualPropertyByAttributeName(property);
            var propertiesToUpdate = changedVisualProperty.updatesTo;

            if (property == 'area') {



                if (LOG)
                    console.log("%cModifying " + changedVisualProperty.attribute + ". Value: " + value, "background:green; color:white;");



                theExtractor.area = value; // This value has to be updated as fabric does not know its link with the radius attribute

                // Updating all the attributes that are affected by the modifications in the area property

                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theExtractor.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theExtractor.computeUpdatedValueOf(property, value, attributeName);

                    if (LOG)
                        console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");


                    var easing = fabric.util.ease['easeOutBack'];
                    if ((attributeName == 'width' || attributeName == 'height') && updatedValue < 15) {
                        easing = fabric.util.ease['easeOutCirc'];
                    }
                    theExtractor.animateProperty(attributeName, updatedValue, 500, easing);


                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(updatedValue, false, false);
                    });
                });

                property = 'width';
                value = Math.sqrt(value);

            } else if (property == 'width' || property == 'height') {

                if (LOG)
                    console.log("Modifying " + property + ". Value: " + value);

                var easing = fabric.util.ease['easeOutBack'];
                if (value < 15) {
                    easing = fabric.util.ease['easeOutCirc'];
                }
                theExtractor.animateProperty(property, value, 500, easing);


                theExtractor.area = value * value;

                // Updating all the attributes that are affected by the modifications in the area property
                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theExtractor.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theExtractor.computeUpdatedValueOf(property, value, attributeName);

                    if (LOG)
                        console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");

                    var easing = fabric.util.ease['easeOutBack'];
                    if ((attributeName == 'width' || attributeName == 'height') && updatedValue < 15) {
                        easing = fabric.util.ease['easeOutCirc'];
                    }
                    theExtractor.animateProperty(attributeName, updatedValue, 500, easing);

                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(updatedValue, false, false);
                    });
                });


            }



//            var easing = fabric.util.ease['easeOutBack'];
//            if (property == 'radius' && value < 15) {
//                easing = fabric.util.ease['easeOutCirc'];
//            }
//
//            theExtractor.animateProperty(property, value, 500, easing);


        } else {

            if (property == 'angle') {
                if (LOG)
                    console.log("Original value: " + value);
                value = value % 360;
                if (LOG)
                    console.log("Modified value: " + value);
            }

            var easing = fabric.util.ease['easeOutBack'];
            theExtractor.animateProperty(property, value, 500, easing);

        }

        canvas.renderAll();
        theExtractor.setCoords();

    },
//    _render: function (ctx) {
//        ctx.save();
//
//
////      this.rotatingPointOffset = this.valueForRotatingPointOffset * canvas.getZoom()/2;
////      this.cornerSize = this.valueForcornerSize * canvas.getZoom()/2;
//
//        this.rotatingPointOffset = this.valueForRotatingPointOffset;
//        this.cornerSize = this.valueForcornerSize;
//
//        this.callSuper('_render', ctx);
//
//        ctx.restore();
//    }
});
Extractor.call(TextualExtractor.prototype);

//function addTextualExtractorToCanvas(options) {
//    var textExtractorExtractor = new TextualExtractor(options);
//    canvas.add(textExtractorExtractor);
//    if (options.animateAtBirth) {
//        if (textExtractorExtractor.width > 0 && textExtractorExtractor.height > 0) {
//            textExtractorExtractor.animateBirth(options.markAsSelected);
//        }
//    }
//    
//    
//
//    textExtractorExtractor.associateEvents();
//}




function addTextualExtractorToCanvas(options) {

    var textRecogniser = new TextualExtractor(options);
    
    canvas.add(textRecogniser);

    textRecogniser.associateEvents();
    textRecogniser.associateInteractionEvents();

    var waitingTime = 0;
    if (options.animateAtBirth) {
        waitingTime = 1250;
        if (textRecogniser.width > 0 && textRecogniser.height > 0) {
            textRecogniser.animateBirth(options.markAsSelected, null, null, options.doNotRefreshCanvas);
        }
    }

    if (options.shouldExpand) {
        textRecogniser.expand(true);
    }

    setTimeout(function () {
        if (options.xmlID) {
            textRecogniser.executePendingConnections();
        }
    }, waitingTime);

    return textRecogniser;
}










function createTextRecogniserFromXMLNode(colorSamplerXmlNode) {

    var options = createTextRecogniserOptionsFromXMLNode(colorSamplerXmlNode);
    var textRecogniser = addTextualExtractorToCanvas(options);
    
    canvas.setActiveObject(textRecogniser);
    
    textRecogniser.hasControls = true;
    return textRecogniser;
}

function createTextRecogniserOptionsFromXMLNode(colorSamplerXmlNode) {

    console.log("%c" + "createTextRecogniserOptionsFromXMLNode function", "background: rgb(241,202,100); color: black;");

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

    options.animateAtBirth = !options.isExpanded;
    options.shouldExpand = options.isExpanded;
    
    options.hasControls = true;
    options.hasRotatingPoint = true;
    options.hasBorders = true;
    options.padding = -2;
    options.cornerSize = 20;
    options.rotatingPointOffset = 50;
    options.stroke = widget_selected_stroke_color;
    options.borderColor = options.stroke;

    console.log("%c Options to create a new TEXT RECOGNISER from an XML Node: ", "background: rgb(241,202,100); color: black;");
    console.log(options);

    return options;


}