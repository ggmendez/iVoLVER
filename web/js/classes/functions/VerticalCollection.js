var VerticalCollection = fabric.util.createClass(fabric.Rect, {
    isCollection: true,
    isVerticalCollection: true,
    setXmlIDs: function (from) {

        var theCollection = this;
        theCollection.xmlID = from++;
        theCollection.visualValues.forEach(function (visualValue) {
            visualValue.xmlID = from++;
        });

        return from;
    },
    toXML: function () {

        var theCollection = this;
        var collectionNode = createXMLElement("verticalCollection");

        addAttributeWithValue(collectionNode, "xmlID", theCollection.xmlID);

        var centerPoint = theCollection.typeIcon ? theCollection.typeIcon.getCenterPoint() : theCollection.getCenterPoint();
        appendElementWithValue(collectionNode, "left", centerPoint.x);
        appendElementWithValue(collectionNode, "top", centerPoint.y);

        var topCenter = theCollection.getPointByOrigin('center', 'top');
        appendElementWithValue(collectionNode, "actualTop", topCenter.y);

        var actualCenter = theCollection.getCenterPoint();
        appendElementWithValue(collectionNode, "centerX", actualCenter.x);
        appendElementWithValue(collectionNode, "centerY", actualCenter.y);

        appendElementWithValue(collectionNode, "isExpanded", !theCollection.isCompressed);

        var valuesNode = createXMLElement("values");
        addAttributeWithValue(valuesNode, "type", "array");
        theCollection.visualValues.forEach(function (visualValue) {
            var valueNode = visualValue.value.toXML();
            addAttributeWithValue(valueNode, "relativeY", visualValue.relativeY);
            addAttributeWithValue(valueNode, "xmlID", visualValue.xmlID);
            valuesNode.append(valueNode);
        });
        collectionNode.append(valuesNode);

        return collectionNode;
    },
    executePendingConnections: function () {

        var theCollection = this;

        // Checking all the pending connections that might have not been executed before due to the loading order
        executePendingConnections(theCollection.xmlID);

        // Connecting the visual values that are part of this collection
        theCollection.visualValues.forEach(function (visualValue) {
            executePendingConnections(visualValue.xmlID);
        });

    },
    initialize: function (options) {

        options || (options = {});
        options.originX = 'center';
        options.originY = 'center';
        options.perPixelTargetFind = true;
        options.lockScalingX = true;
        options.lockScalingY = true;
        options.lockRotation = true;
        options.opacity = 1;
        options.permanentOpacity = 1;
        options.movingOpacity = 1;
        options.hasRotatingPoint = false;
        options.hasBorders = false;
        options.hasControls = false;
        options.rx = 20;
        options.ry = options.rx;

        this.callSuper('initialize', options);

        this.inConnectors = new Array();
        this.outConnectors = new Array();
        this.values = new Array();
        this.visualValues = new Array();

        this.width = 60;
        this.isCompressed = true;
        this.compressedHeight = 70;
        this.height = this.compressedHeight;
        this.strokeWidth = options.strokeWidth || 3;
        this.valueScale = 0.75;
        this.iconName = null;
        this.typeIcon = null;

        this.associateEvents();
    },
    removeTypeIcon: function () {
        var theCollection = this;
        if (theCollection.typeIcon && theCollection.typeIcon.canvas) {
            theCollection.typeIcon.remove();
            theCollection.typeIcon = null;
        }
    },
    clear: function () {
        var theCollection = this;
        if (theCollection.visualValues) {
            theCollection.visualValues.forEach(function (value) {
                if (value.canvas) {
                    if (LOG)
                        console.log(value);
                    value.remove();
                    value = null;
                }
            });
        }
        theCollection.values = new Array();
        theCollection.visualValues = new Array();
    },
    applySelectedStyle: function (selectConnectors) {
        this.selected = true;
        if (selectConnectors) {
            this.inConnectors.forEach(function (inConnector) {
                inConnector.opacity = 1;
                if (!inConnector.source.isOperator) {
                    inConnector.applySelectedStyle(true, false);
                } else {
                    inConnector.source.applySelectedStyle(false);
                    inConnector.applySelectedStyle(false, false);
                }
            });
            this.outConnectors.forEach(function (outConnector) {
                outConnector.opacity = 1;
                if (!outConnector.source.isOperator) {
                    outConnector.applySelectedStyle(false, true);
                } else {
                    outConnector.destination.applySelectedStyle(false);
                    outConnector.applySelectedStyle(false, false);
                }
            });
        }
    },
    applyUnselectedStyle: function (unselectConnectors) {
        this.selected = false;
        if (unselectConnectors) {
            this.inConnectors.forEach(function (inConnector) {
                inConnector.opacity = canvas.connectorsHidden ? 0 : 1;
                inConnector.applyUnselectedStyle(true, false);
            });
            this.outConnectors.forEach(function (outConnector) {
                outConnector.opacity = canvas.connectorsHidden ? 0 : 1;
                outConnector.applyUnselectedStyle(false, true);
            });
        }
    },
    addTypeIcon: function (iconName, blinkingFactor, doNotBlinkCollection) {


        var theCollection = this;
        var stringPath = icons[iconName].path;
        var icon = new fabric.Path(stringPath, {
            originX: 'center',
            originY: 'center',
            strokeWidth: 1.5,
            stroke: icons[iconName].stroke,
            fill: icons[iconName].fill,
            selectable: false,
            evented: false,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            opacity: 1,
            permanentOpacity: 1,
            movingOpacity: 1
        });
        theCollection.iconName = iconName;
        theCollection.dataTypeProposition = getVisualValuePropositionByIconName(iconName);

        if (!blinkingFactor) {
            blinkingFactor = 0.3;
        }

        theCollection.stroke = icons[iconName].stroke;
        theCollection.typeIcon = icon;
        canvas.add(icon);
        theCollection.positionTypeIcon();
        blink(icon, false, 0.30); // the canvas will be refreshed at some point below this, so no need to refresh it here

        var theMapper = theCollection.mapper;
        var theGetter = theCollection.getter;
        var theAttributeSelector = theCollection.attributeSelector;

        if (theMapper) {

            console.log("%c" + "This vertical collection is part of a MAPPER", "background: #56c796; color: black;");

            theMapper.updateInputOutputVisualValuePropositions();
            theMapper.updateInputPointMovementPermit();
            theMapper.updateInputOutputVisibilityStatus();
            blink(theCollection, theMapper.isCompressed, blinkingFactor);

            if (!theMapper.isCompressed) {

                var totalInValues = theMapper.inCollection.getTotalValues();
                var totalOutValues = theMapper.outCollection.getTotalValues();
                var theCollectionTotalValues = theCollection.getTotalValues();

                if (LOG)
                    console.log("%c totalInValues: " + totalInValues, "background: " + theMapper.fill);
                if (LOG)
                    console.log("%c totalOutValues: " + totalOutValues, "background: " + theMapper.fill);
                if (LOG)
                    console.log("%c theCollectionTotalValues: " + theCollectionTotalValues, "background: " + theMapper.fill);

                var intendedNumberOfElements = Math.max(totalInValues, totalOutValues);
                if (LOG)
                    console.log("%c intendedNumberOfElements: " + intendedNumberOfElements, "background: " + theMapper.fill);

                theCollection.expand(true, theMapper.valueScale, intendedNumberOfElements);

            }

            theMapper.computeOutput();

            if (!theMapper.outputPoint.value && !theCollection.isEmpty()) {
                if (theCollection.isMapperOutCollection) {
                    var dataTypeProposition = theCollection.getVisualValueAt(0).value.getTypeProposition();
                    theMapper.outputPoint.setValue(createDefaultValueByTypeProposition(dataTypeProposition));
                } else {
                    var dataTypeProposition = theCollection.getVisualValueAt(0).value.getTypeProposition();
                    theCollection.dataTypeProposition = dataTypeProposition;

                    console.log("%c" + "dataTypeProposition: " + dataTypeProposition, "background: #255573; color: white;");

                }
            }

        } else if (theGetter) {

            console.log("%c" + "This vertical collection is part of a MAPPER", "background: #56c796; color: black;");

            theGetter.updateOutputVisualValuePropositions();
            theGetter.updateOutputVisibilityStatus();
            blink(theCollection, theGetter.isCompressed, blinkingFactor);

            if (!theGetter.outputPoint.value && !theCollection.isEmpty()) {
                var dataTypeProposition = theCollection.getVisualValueAt(0).value.getTypeProposition();
                theCollection.dataTypeProposition = dataTypeProposition;
                console.log("%c" + "dataTypeProposition: " + dataTypeProposition, "background: #255573; color: white;");
            }

            var outputValue = theGetter.computeOutput();
            theGetter.outputPoint.setValue(outputValue, false);

        } else if (theAttributeSelector) {

            console.log("%c" + "This vertical collection is part of an ATTRIBUTE SELECTOR", "background: #56c796; color: black;");

            theAttributeSelector.updateOutputVisualValuePropositions();
            theAttributeSelector.updateOutputVisibilityStatus();
            blink(theCollection, theAttributeSelector.isCompressed, blinkingFactor);

            if (!theAttributeSelector.outputPoint.value && !theCollection.isEmpty()) {
                var dataTypeProposition = theCollection.getVisualValueAt(0).value.getTypeProposition();
                theCollection.dataTypeProposition = dataTypeProposition;
                console.log("%c" + "dataTypeProposition: " + dataTypeProposition, "background: #255573; color: white;");
            }

            var outputValue = theAttributeSelector.computeOutput();
            theAttributeSelector.outputPoint.setValue(outputValue, false);

        } else {

            if (!doNotBlinkCollection) {
                blink(theCollection, theCollection.isCompressed, 0.30);
            }


            if (!theCollection.isCompressed) {

                theCollection.expand(true);

            }
        }

    },
    isEmpty: function () {
        return (!this.values || !this.values.length);
    },
    getMinValue: function () {



        console.log("%c" + "++++++++ getMinValue FUNCTION", "background: black; color: green;");

        var theCollection = this;
        var array = theCollection.visualValues;
//        
//        var f = function (currentValue) {
//            return currentValue.value.number;
//        };
//        
//        var mappedArray = array.map(f);
//        
//        var minNumber = Math.min.apply(Math, mappedArray);
//        var indexOfMin = ;

//        console.log("MMMMMMMIIIIIIIINNNNNNNN " + minNumber);

        var indexOfMinValue = array.reduce(function (indexOfMin, currentValue, index, theArray) {

            /*console.log("currentValue:");
             console.log(currentValue);
             
             console.log("index:");
             console.log(index);
             
             console.log("indexOfMin:");
             console.log(indexOfMin);
             
             console.log("theArray: ");
             console.log(theArray);*/

            return currentValue.value.number < theArray[indexOfMin].value.number ? index : indexOfMin;
        }, 0);


        console.log("************************ indexOfMaxValue: ");
        console.log(indexOfMinValue);

        return theCollection.getValueAt(indexOfMinValue);






    },
    getMaxValue: function () {

        console.log("%c" + "++++++++ getMaxValue FUNCTION", "background: black; color: red;");

        var theCollection = this;
        var array = theCollection.visualValues;
//
//        var f = function (visualValue) {
//            return visualValue.value.number;
//        };
//        var maxNumber = Math.max.apply(Math, array.map(f));
//        console.log("MMMMMMMAAAAAAAAXXXXXXX " + maxNumber);





        var indexOfMaxValue = array.reduce(function (indexOfMax, currentValue, index, theArray) {
            return currentValue.value.number > theArray[indexOfMax].value.number ? index : indexOfMax;
        }, 0);
        return theCollection.getValueAt(indexOfMaxValue);
    },
    getIndexOfMin: function () {
        return 0;
    },
    getIndexOfMax: function () {
        return 0;
    },
    getSize: function () {
        if (this.isEmpty()) {
            return 0;
        }
        return this.values.length;
    },
    getValues: function () {
        return this.values;
    },
    getVisualValues: function () {
        return this.visualValues;
    },
    getValueAt: function (index) {
        var value = null;
        var visualValue = this.getVisualValueAt(index);
        if (visualValue) {
            value = visualValue.value;
        }
        return value;
    },
    getVisualValueAt: function (index) {
        var visualValue = null;
        if (index >= 0 && index < this.visualValues.length) {
            visualValue = this.visualValues[index];
        }
        return visualValue;
    },
    positionConnectors: function () {
        var theCollection = this;
        updateConnectorsPositions(theCollection);
    },
    positionTypeIcon: function () {

//        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ positionTypeIcon");

        var theCollection = this;
        theCollection.setCoords();
        if (theCollection.typeIcon && theCollection.typeIcon.canvas) {
            var topCenter = theCollection.getPointByOrigin('center', 'top');
            theCollection.typeIcon.setPositionByOrigin(new fabric.Point(topCenter.x, topCenter.y + 40), 'center', 'center');

//            if (theCollection.iconName === "string" || theCollection.iconName === "dateAndTime") {
//                theCollection.typeIcon.setPositionByOrigin(new fabric.Point(topCenter.x, topCenter.y + 40), 'center', 'center');
//            } else {
//                theCollection.typeIcon.setPositionByOrigin(new fabric.Point(topCenter.x, topCenter.y + 40), 'center', 'center');
//            }

//            console.log(theCollection.typeIcon.getPointByOrigin('center', 'center'));

            theCollection.typeIcon.setCoords();
        }
    },
    positionElements: function (valuesFinalScale, intendedNumberOfElements) {

        var theCollection = this;
        var topCenter = theCollection.getPointByOrigin('center', 'top');

        theCollection.positionTypeIcon();
        theCollection.positionConnectors();

        if (theCollection.isEmpty()) {
            return;
        }

        if (theCollection.isCompressed) {
            theCollection.visualValues.forEach(function (visualValue) {
                visualValue.left = theCollection.left;
                visualValue.top = theCollection.top;
                visualValue.setCoords();
                updateConnectorsPositions(visualValue);
            });
        } else {

            if (!intendedNumberOfElements) {
                intendedNumberOfElements = theCollection.getTotalValues();
            }


            /*if (LOG)
             console.log("%c Positioning : " + intendedNumberOfElements, "background: pink; color: black;");*/

            var valueUnscaledHeight = theCollection.visualValues[0].height;

            var startingY = topCenter.y + theCollection.compressedHeight + theCollection.strokeWidth / 2 + 2 + 2;
            var firstY = (startingY + 0 * (valueUnscaledHeight + 10) * valuesFinalScale) + (valueUnscaledHeight / 2) * valuesFinalScale;
            var lastY = (startingY + (intendedNumberOfElements - 1) * (valueUnscaledHeight + 10) * valuesFinalScale) + (valueUnscaledHeight / 2) * valuesFinalScale;
//         var space = (lastY - firstY) / (theCollection.getTotalValues() - 1);
            var space = (lastY - firstY) / (intendedNumberOfElements - 1);
            if (isNaN(space)) {
                space = 0;
            }

            /*if (LOG)
             console.log("%c space : " + space, "background: pink; color: black;");*/

            var j = 0;
            var x = theCollection.left;
            theCollection.visualValues.forEach(function (visualValue) {

                if (!visualValue.canvas) {
                    canvas.add(visualValue);
                }

//                visualValue.bringToFront();
                bringToFront(visualValue);

                var y = firstY + j * space;
//                if (visualValue.relativeY != null) {
                if ((visualValue.relativeY !== null) && (typeof visualValue.relativeY !== 'undefined') && !isNaN(visualValue.relativeY)) {
                    y = theCollection.getPointByOrigin('center', 'top').y + visualValue.relativeY + ((visualValue.height / 2) * valuesFinalScale);
                }

                /*else {
                 //                    visualValue.relativeY = visualValue.getPointByOrigin('center', 'top').y - theCollection.getPointByOrigin('center', 'top').y;
                 visualValue.relativeY = visualValue.getPointByOrigin('center', 'top').y - theCollection.getPointByOrigin('center', 'top').y;
                 
                 if (LOG) console.log("%c visualValue.relativeY : " + visualValue.relativeY, "background: pink; color: blck;");
                 
                 }*/

                visualValue.setPositionByOrigin(new fabric.Point(x, y), 'center', 'center');

                visualValue.scaleX = valuesFinalScale;
                visualValue.scaleY = valuesFinalScale;
                visualValue.setCoords();
                updateConnectorsPositions(visualValue);

//                if (visualValue.relativeY == null) {
                if ((visualValue.relativeY === null) || (typeof visualValue.relativeY === 'undefined') || isNaN(visualValue.relativeY)) {
                    visualValue.relativeY = visualValue.getPointByOrigin('center', 'top').y - theCollection.getPointByOrigin('center', 'top').y;
                    /*if (LOG)
                     console.log("%c visualValue.relativeY : " + visualValue.relativeY, "background: pink; color: black;");*/
                }

                j++;
            });
        }
    },
    getCompressedMassPoint: function () {
        var theCollection = this;
        var topCenter = theCollection.getPointByOrigin('center', 'top');
        var massCenter = new fabric.Point(topCenter.x, topCenter.y + 35);
//        drawRectAt(topCenter, 'red');
        return massCenter;
    },
    compress: function (refreshCanvas, valuesFinalScale) {

        var theCollection = this;
        if (theCollection.isCompressed) {
            return;
        }

        if (theCollection.typeIcon) {
//            theCollection.typeIcon.bringToFront();
            bringToFront(theCollection.typeIcon);
        }

        if (!valuesFinalScale) {
            valuesFinalScale = 0;
        }

        var duration = 700;
        var easing = fabric.util.ease['easeOutCubic'];

        var topCenter = theCollection.getPointByOrigin('center', 'top');
        var newHeight = theCollection.compressedHeight;
        var newTop = topCenter.y + theCollection.compressedHeight / 2;
        theCollection.animate('top', newTop, {
            easing: easing,
            duration: duration,
        });
        theCollection.animate('height', newHeight, {
            duration: duration,
            easing: easing,
        });

        // Expanding the values of the collection
        if (theCollection.visualValues) {
            theCollection.visualValues.forEach(function (visualValue) {

//                visualValue.bringToFront();
                bringToFront(visualValue);
                bringConnectorsToFront(visualValue);

                visualValue.animate('top', newTop, {
                    easing: easing,
                    duration: duration,
                });
                visualValue.animate('scaleX', valuesFinalScale, {
                    easing: easing,
                    duration: duration,
                });
                visualValue.animate('scaleY', valuesFinalScale, {
                    easing: easing,
                    duration: duration,
                });
                visualValue.animate('opacity', 0, {
                    easing: easing,
                    duration: duration,
                    onChange: function () {
                        updateConnectorsPositions(visualValue);
                    },
//                    onComplete: function () {
//                        visualValue.remove(); // after all the animations are over, the value is removed from the canvas
//                    },
                });
            });
        }

        fabric.util.animate({
            duration: duration,
            easing: easing,
            onChange: function () {
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {
                theCollection.isCompressed = true;
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            }
        });
    },
    growHeight: function (targetHeight, refreshCanvas) {

        var theCollection = this;
        var duration = 700;
        var easing = fabric.util.ease['easeOutCubic'];

        var newTop = theCollection.top + targetHeight / 2 - theCollection.height / 2;
        theCollection.animate('top', newTop, {
            easing: easing,
            duration: duration,
        });
        theCollection.animate('height', targetHeight, {
            duration: duration,
            easing: easing,
            onChange: function () {
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
        });

    },
    expand: function (refreshCanvas, valuesFinalScale, intendedNumberOfElements, valueUnscaledHeight) {



        var theCollection = this;

        if ((!theCollection.isCompressed && theCollection.isEmpty()) || (theCollection.isEmpty() && !intendedNumberOfElements)) {
            return;
        }

        if (LOG)
            console.log("Starting collection expansion...");

        if (theCollection.typeIcon) {
//            theCollection.typeIcon.bringToFront();
            bringToFront(theCollection.typeIcon);
        }

        if (!valuesFinalScale) {
            valuesFinalScale = theCollection.valueScale;
        }

        if (!intendedNumberOfElements) {
//         intendedNumberOfElements = theCollection.visualValues.length;
            intendedNumberOfElements = theCollection.getTotalValues();
        }



        if (!valueUnscaledHeight) {
            valueUnscaledHeight = theCollection.visualValues[0].height;
        }

        var duration = 700;
        var easing = fabric.util.ease['easeOutCubic'];

        var bottomLeft = theCollection.getPointByOrigin('left', 'bottom');

        var newHeight = theCollection.compressedHeight + intendedNumberOfElements * ((valueUnscaledHeight + 10) * valuesFinalScale);

        if (LOG)
            console.log("%c theCollection.height: " + theCollection.height, "background: blue; color: white;");
        if (LOG)
            console.log("%c newHeight: " + newHeight, "background: blue; color: white;");

        var theClone = fabric.util.object.clone(theCollection);

        if (theCollection.isCompressed || newHeight > theCollection.height) {

            if (newHeight > theCollection.height) {
                var topCenter = theCollection.getPointByOrigin('center', 'top');
                bottomLeft.y = topCenter.y + theCollection.compressedHeight + theCollection.strokeWidth / 2 + 2;

                var theMapper = theCollection.mapper;
                if (theMapper) {
                    var newMapperHeight = theMapper.compressedHeight + intendedNumberOfElements * ((valueUnscaledHeight + 10) * theMapper.valueScale);

                    // Growing the mapper
                    theCollection.mapper.growHeight(newMapperHeight, false);

                    // Growing the other collection of the mapper so that its height matches with this one
                    if (theCollection.isMapperInCollection) {
                        theMapper.outCollection.growHeight(newHeight, false);
                    } else if (theCollection === theMapper.outCollection) {
                        theMapper.inCollection.growHeight(newHeight, false);
                    }
                }
            }

            theCollection.growHeight(newHeight, false);

        } else {
            var topCenter = theCollection.getPointByOrigin('center', 'top');
            bottomLeft.y = topCenter.y + theCollection.compressedHeight + theCollection.strokeWidth / 2 + 2;

            // change done 24/03/2015 NOT sure if the condition about the mapper should be removed, as I havent tested this code under the scenario where the collection is included in a mapper
            var theMapper = theCollection.mapper;
            if (!theMapper) {
                theCollection.growHeight(newHeight, false);
            }

        }

        var startingY = bottomLeft.y + 2;

        // Expanding the values of the collection
        if (theCollection.visualValues) {

            var j = 0;

            var firstY = (startingY + 0 * (valueUnscaledHeight + 10) * valuesFinalScale) + (valueUnscaledHeight / 2) * valuesFinalScale;
            var lastY = (startingY + (intendedNumberOfElements - 1) * (valueUnscaledHeight + 10) * valuesFinalScale) + (valueUnscaledHeight / 2) * valuesFinalScale;
            var space = (lastY - firstY) / (intendedNumberOfElements - 1);
            if (isNaN(space)) {
                space = 0;
            }


            if (LOG)
                console.log("firstY:");
            if (LOG)
                console.log(firstY);

            if (LOG)
                console.log("intendedNumberOfElements:");
            if (LOG)
                console.log(intendedNumberOfElements);

            if (LOG)
                console.log("space:");
            if (LOG)
                console.log(space);

            theCollection.visualValues.forEach(function (visualValue) {

                visualValue.left = theCollection.left;
                visualValue.top = theCollection.top;
                visualValue.scaleX = 0;
                visualValue.scaleY = 0;
                visualValue.opacity = 0;

                canvas.add(visualValue);
//                visualValue.bringToFront();
                bringToFront(visualValue);
                bringConnectorsToFront(visualValue);

                var y = firstY + j * space;
                if ((visualValue.relativeY !== null) && (typeof visualValue.relativeY !== 'undefined') && (!isNaN(visualValue.relativeY))) {
                    var newTop = theCollection.top + newHeight / 2 - theCollection.height / 2;
                    theClone.height = newHeight;
                    theClone.top = newTop;
                    y = theClone.getPointByOrigin('center', 'top').y + visualValue.relativeY + ((visualValue.height / 2) * valuesFinalScale);
                }

                visualValue.animate('top', y, {
                    easing: easing,
                    duration: duration,
                });

                visualValue.animate('scaleX', valuesFinalScale, {
                    easing: easing,
                    duration: duration,
                });
                visualValue.animate('scaleY', valuesFinalScale, {
                    easing: easing,
                    duration: duration,
                });
                visualValue.animate('opacity', 1, {
                    easing: easing,
                    duration: duration,
                    onChange: function () {
                        updateConnectorsPositions(visualValue);
                    }
                });

                j++;

            });

        }


        fabric.util.animate({
            duration: duration,
            easing: easing,
            onChange: function () {
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            },
            onComplete: function () {
                theCollection.isCompressed = false;
                theCollection.positionElements(valuesFinalScale, intendedNumberOfElements);
                if (refreshCanvas) {
                    canvas.renderAll();
                }
            }
        });
    },
    getTotalValues: function () {
        var totalValues = 0;
        if (this.values) {
            totalValues = this.values.length;
        }
        return totalValues;
    },
    // Associate the interaction events that a visual value should have when being within a collection
    associateInCollectionEvents: function (visualValue) {

        var theCollection = this;
        var theMapper = theCollection.mapper;
        var theGetter = theCollection.getter;
        var theAttributeSelector = theCollection.attributeSelector;

        // desabling all the default events associated to a VisualValue object, as we need other behaviours when they are included in a collection that belongs to a mapper
        visualValue.off('moving');
        visualValue.off('mouseup');
        visualValue.off('mousedown');
        visualValue.off('pressed');

        visualValue.on({
            'pressed': function (options) {

//                visualValue.bringToFront();
                bringToFront(visualValue);
                visualValue.lockMovementX = true;
                visualValue.lockMovementY = true;
                blink(visualValue, true, 0.35);
                visualValue.connecting = true;

                var newConnector = new Connector({source: visualValue, x2: visualValue.left, y2: visualValue.top, arrowColor: visualValue.colorForStroke, filledArrow: true, strokeWidth: 1});
                visualValue.outConnectors.push(newConnector);
                canvas.add(newConnector);

            },
            'mouseup': function (options) {
                var theVisualValue = this;
                theVisualValue.lockMovementX = true;
                theVisualValue.lockMovementY = false;

                if (theVisualValue.connecting) {

                    var theEvent = options['e'];
                    var canvasCoords = getCanvasCoordinates(theEvent);

                    var coordX = canvasCoords.x;
                    var coordY = canvasCoords.y;

                    var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isOperator', 'isFunctionInput', 'isAggregator', 'isVisualValue', 'isMapperInput', 'isVerticalCollection', 'isMark', 'isNumericFunctionInput']);

                    var connector = getLastElementOfArray(theVisualValue.outConnectors);

                    if (targetObject) {

                        if (targetObject !== this) {

                            if (targetObject.isMark) {

                                var connector = getLastElementOfArray(this.outConnectors);

                                var theSource = connector.source;
                                var theDestination = connector.destination;

                                var visualProperty = targetObject.getDefaultModifiableVisualPropertyByType(theVisualValue.value);

                                if (visualProperty) {

                                    connector.setDestination(visualProperty, true);

                                    setTimeout(function () {

                                        if (theSource) {
//                                            theSource.bringToFront();
                                            bringToFront(theSource);
                                        }
                                        if (theDestination) {
//                                            theDestination.bringToFront();
                                            bringToFront(theDestination);
                                        }
                                    }, 50);

                                } else {

                                    var connector = this.outConnectors.pop();
                                    connector.contract();

                                }



                            } else if (targetObject.isVerticalCollection) {

                                addVisualVariableToCollection(theVisualValue, targetObject, connector);


                            } else if (targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isMapperInput || targetObject.isNumericFunctionInput) {

                                connector.setDestination(targetObject, true);

                                setTimeout(function () {
//                                    connector.source.bringToFront();
//                                    connector.destination.bringToFront();
                                    bringToFront(connector.source);
                                    bringToFront(connector.destination);
                                }, 50);

                            } else if (targetObject.isOperator) {

                                if (theVisualValue.isDurationData) {
                                    connector.value = theVisualValue.value.convert("isNumericData");
                                }

                                if (connector.value) {

                                    connector.setDestination(targetObject, true);

                                    setTimeout(function () {
//                                        connector.source.bringToFront();
//                                        connector.destination.bringToFront();
                                        bringToFront(connector.source);
                                        bringToFront(connector.destination);
                                    }, 50);

                                } else {
                                    connector.contract();
                                }



                            } else if (targetObject.isAggregator) {

                                targetObject.addConnector(connector, canvasCoords);

                            } else { // This makes no sense, so, the added connector is just removed
                                connector = theVisualValue.outConnectors.pop();
                                if (connector) {
                                    connector.contract();
                                }
                            }

                        } else {
                            connector = theVisualValue.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }
                        }

                    } else {

                        // This number is released on the canvas
                        connector = theVisualValue.outConnectors.pop();
                        if (connector) {
                            connector.contract();
                        }

                    }

                } else {

                    if (theMapper) {

                        // sorting the visual values of the collection according to their y coordinate so that, when iterating over then, they 
                        // appear ordered
                        theCollection.visualValues.sort(compareByTop);

                        var eventOptions = {collection: theCollection, manipulatedElement: theVisualValue};
                        theMapper.trigger('collectionElementManipulationStopped', eventOptions);



                    }

                    if (theGetter) {

                        theCollection.visualValues.sort(compareByTop);

                        var eventOptions = {collection: theCollection, manipulatedElement: theVisualValue};
                        theGetter.trigger('collectionElementManipulationStopped', eventOptions);

                        // sorting the visual values of the collection according to their y coordinate so that, when iterating over then, they 
                        // appear ordered


                    }

                    if (theAttributeSelector) {

                        theCollection.visualValues.sort(compareByTop);
                        var eventOptions = {collection: theCollection, manipulatedElement: theVisualValue};
                        theAttributeSelector.trigger('collectionElementManipulationStopped', eventOptions);

                    }


                }

                theVisualValue.connecting = false;

            },
            'moving': function (options) {

                var theVisualValue = this;
                var event = options.e;
                var canvasCoords = getCanvasCoordinates(event);

                updateConnectorsPositions(theVisualValue);

                if (theVisualValue.connecting) {

                    if (LOG)
                        console.log("Connecting");

                    // A connector is being taken out of this visual value
                    var lastAddedConnector = getLastElementOfArray(theVisualValue.outConnectors);
                    lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});

                } else {

                    var pointer = canvas.getPointer(event);
                    var dataTypeCenter = theVisualValue.getCenterPoint();

                    var pointerRelativeToCenter = {x: pointer.x - dataTypeCenter.x, y: pointer.y - dataTypeCenter.y};
                    if (LOG)
                        console.log("pointerRelativeToCenter:");
                    if (LOG)
                        console.log(pointerRelativeToCenter);

                    if (LOG)
                        console.log("dataType.width * dataType.scaleX:");
                    if (LOG)
                        console.log(theVisualValue.width * theVisualValue.scaleX);

                    if (LOG)
                        console.log("dataType.height * dataType.scaleY:");
                    if (LOG)
                        console.log(theVisualValue.height * theVisualValue.scaleY);

                    var theCollectionLeftTop = theCollection.getPointByOrigin('left', 'top');
                    var theCollectionRightBottom = theCollection.getPointByOrigin('right', 'bottom');

                    if (LOG)
                        console.log("theCollectionLeftTop:");
                    if (LOG)
                        console.log(theCollectionLeftTop);

                    if (LOG)
                        console.log("theCollectionRightBottom:");
                    if (LOG)
                        console.log(theCollectionRightBottom);

                    var startingY = theCollection.compressedHeight + theCollectionLeftTop.y + theCollection.strokeWidth + 1;
                    var endingY = theCollectionRightBottom.y - 5;

                    var topVisualValue = canvasCoords.y - ((theVisualValue.height * theVisualValue.scaleY / 2) + pointerRelativeToCenter.y);
                    var bottomVisualValue = canvasCoords.y + ((theVisualValue.height * theVisualValue.scaleY / 2) - pointerRelativeToCenter.y);

//                        drawRectAt(new fabric.Point(dataType.left, topVisualValue), 'red');
//                        drawRectAt(new fabric.Point(dataType.left, bottomVisualValue), 'green');

                    if (topVisualValue < startingY) {

                        theVisualValue.lockMovementY = true;
                        theVisualValue.setPositionByOrigin(new fabric.Point(theCollection.left, startingY), 'center', 'top');

                    } else if (bottomVisualValue > endingY) {

                        theVisualValue.lockMovementY = true;
                        theVisualValue.setPositionByOrigin(new fabric.Point(theCollection.left, endingY), 'center', 'bottom');

                    } else {

                        theVisualValue.lockMovementY = false;

                    }

                    theVisualValue.setCoords();
                    theVisualValue.relativeY = theVisualValue.getPointByOrigin('center', 'top').y - theCollection.getPointByOrigin('center', 'top').y;

                    if (theMapper) {

                        var eventOptions = {collection: theCollection, movedElement: theVisualValue};
                        theMapper.trigger('collectionElementMoved', eventOptions);

                        // sorting the visual values of the collection according to their y coordinate so that, when iterating over then, they 
                        // appear ordered
                        theCollection.visualValues.sort(compareByTop);

                    }



                }

            }
        });

        if (theMapper) {

            visualValue.on({
                'mousedown': function (options) {
                    var theVisualValue = this;
//                    theVisualValue.bringToFront();
                    bringToFront(theVisualValue);
                },
            });

        }


    },
    setValues: function (valuesArray, doNotBlinkCollection) {

        var theCollection = this;

        if (LOG)
            console.log("valuesArray:");
        if (LOG)
            console.log(valuesArray);

        var valuesType = getHomogeneousType(valuesArray);

        if (!valuesType) {
            return false;
        }

        // updating the data type proposition of this collection as, at this point, all of its elements are of one single type (otherwise, the return statement of above would habe been executed). 
        // This is why safe to set this collection data type proposition the one from its first value
        theCollection.dataTypeProposition = valuesArray[0].getTypeProposition();

        theCollection.removeTypeIcon();
        theCollection.clear();

        for (var j = 0; j < valuesArray.length; j++) {

            var value = valuesArray[j];

            var visualValue = CreateVisualValueFromValue(value);
            visualValue.nonSerializable = true;
            visualValue.lockMovementX = true;
            visualValue.lockMovementY = true;
            visualValue.lockScalingX = true;
            visualValue.lockScalingY = true;
            visualValue.lockRotation = true;
            visualValue.collection = theCollection;


            if (theCollection.mapper) {
                theCollection.associateInCollectionEvents(visualValue);
            }

            theCollection.values.push(value);
            theCollection.visualValues.push(visualValue);

        }

        theCollection.addTypeIcon(valuesType, null, doNotBlinkCollection);

        return true;




    },
    getVisualRangeContainingYCoordinate: function (yCoordinate) {

//        console.log("getVisualRangeContainingYCoordinate -> yCoordinate:" + yCoordinate);



        if (typeof yCoordinate === 'undefined') {
            return;
        }

        var theCollection = this;

        var top = Number(yCoordinate.toFixed(1));

        for (var j = 0; j < theCollection.visualValues.length - 1; j++) {

            var visualValue1 = theCollection.getVisualValueAt(j);
            var visualValue2 = theCollection.getVisualValueAt(j + 1);

            if (visualValue1 && visualValue2 && typeof visualValue1.top !== 'undefined' && typeof visualValue2.top !== 'undefined') {

//                console.log("visualValue1:");
//                console.log(visualValue1);
//                
//                console.log("visualValue2:");
//                console.log(visualValue2);

                var top1 = Number(visualValue1.top.toFixed(1));
                var top2 = Number(visualValue2.top.toFixed(1));

                if (top >= top1 && top <= top2) {
                    return {from: visualValue1, to: visualValue2};
                }
            }



        }

        return null;

    },
    associateEvents: function () {

        var theCollection = this;

        this.on({
            'doubleTap': function (options) {
                options.event.preventDefault();
                if (!theCollection.mapper) {
                    if (theCollection.isCompressed) {
                        theCollection.expand(true);
                    } else {
                        theCollection.compress(true);
                    }
                }
            },
            'pressed': function (options) {

                var theCollection = this;

                if (LOG)
                    console.log("Collection pressed...");

                if (!theCollection.mapper && !theCollection.isEmpty()) {

                    theCollection.lockMovementX = true;
                    theCollection.lockMovementY = true;

                    blink(theCollection.typeIcon, false, 0.45);
                    blink(theCollection, true, 0.45);

                    if (LOG)
                        console.log("theCollection.values:");
                    if (LOG)
                        console.log(theCollection.values);


                    var newConnector = new Connector({source: theCollection, value: theCollection.values, x2: theCollection.left, y2: theCollection.top, arrowColor: theCollection.stroke, filledArrow: true, strokeWidth: 1});

                    if (LOG)
                        console.log("newConnector.value:");
                    if (LOG)
                        console.log(newConnector.value);

                    theCollection.outConnectors.push(newConnector);
                    canvas.add(newConnector);

                }

            },
            'moving': function (options) {

                var theCollection = this;
                theCollection.setCoords();

                if (theCollection.lockMovementX && theCollection.lockMovementY && !theCollection.mapper && !theCollection.isEmpty()) {

                    var theEvent = options.e;
                    if (theEvent) {
                        var canvasCoords = getCanvasCoordinates(theEvent);
                        var lastAddedConnector = getLastElementOfArray(theCollection.outConnectors);
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                    }

                } else {
                    var valueScale = theCollection.mapper ? theCollection.mapper.valueScale : theCollection.valueScale;
                    theCollection.positionElements(valueScale);
                    theCollection.positionConnectors();
                }



            },
            'mouseup': function (options) {

                var theCollection = this;

                if (LOG)
                    console.log("Mouse UP over a collection... ");

                if (theCollection.lockMovementX && theCollection.lockMovementY) {

                    var theEvent = options.e;

                    if (theEvent) {

                        var canvasCoords = getCanvasCoordinates(theEvent);

                        var targetObject = findPotentialDestination(canvasCoords, ['isOperator', 'isFunctionInput', 'isAggregator', 'isMapperInput', 'isVerticalCollection', 'isFunctionValuesCollection', 'isLocatorValuesCollection', 'isNumericFunctionInput', 'isVisualProperty']);

                        var connector = getLastElementOfArray(theCollection.outConnectors);

                        if (targetObject) {

                            if (targetObject !== this) {

                                if (targetObject.isPlayer) {

                                    connector.setDestination(targetObject, true);

                                } else if (targetObject.isVerticalCollection) {

                                    connector.setDestination(targetObject, true);

                                } else if (targetObject.isOperator || targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isMapperInput || targetObject.isFunctionValuesCollection || targetObject.isLocatorValuesCollection || targetObject.isNumericFunctionInput) {

                                    connector.setDestination(targetObject, true);

                                    if (!targetObject.isFunctionValuesCollection && !targetObject.isLocatorValuesCollection && !targetObject.isNumericFunctionInput) {
                                        setTimeout(function () {
//                                            connector.source.bringToFront();
//                                            connector.destination.bringToFront();
                                            bringToFront(connector.destination);
                                        }, 50);
                                    }



                                } else if (targetObject.isAggregator) {

                                    targetObject.addConnector(connector, canvasCoords);

                                } else { // This makes no sense, so, the added connector is just removed
                                    connector = theCollection.outConnectors.pop();
                                    if (connector) {
                                        connector.contract();
                                    }
                                }

                            } else {
                                connector = theCollection.outConnectors.pop();
                                if (connector) {
                                    connector.contract();
                                }
                            }

                        } else {

                            // This number is released on the canvas
                            connector = theCollection.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }

                        }

                        if (theCollection.mapper) {

                            theCollection.lockMovementX = true;
                            theCollection.lockMovementY = true;


                        } else {

                            theCollection.lockMovementX = false;
                            theCollection.lockMovementY = false;

                        }


                    }



                } else {

                    if (theCollection.mapper) {

                        theCollection.lockMovementX = true;
                        theCollection.lockMovementY = true;


                    } else {

                        theCollection.lockMovementX = false;
                        theCollection.lockMovementY = false;

                    }



                }



            },
            'mousedown': function (option) {

                /*if (!theCollection.readable) {
                 return;
                 }
                 
                 if (LOG) console.log(this.attribute);
                 if (LOG) console.log(this.parentObject.get(this.attribute));
                 
                 var newConnector = new Connector({source: this, value: theCollection.values, x2: this.left, y2: this.top, arrowColor: this.parentObject.colorForStroke, filledArrow: true, strokeWidth: 1});
                 
                 if (LOG) console.log(newConnector.value);
                 
                 this.outConnectors.push(newConnector);
                 canvas.add(newConnector);*/

            },
            'inConnectionRemoved': function (options) {

                if (LOG)
                    console.log("%cIN CONNECTOR", "background:pink; color:black;");

                if (LOG)
                    console.log("Before: ");
                if (LOG)
                    console.log(this.inConnectors);

                var removedConnection = options.connector;
                fabric.util.removeFromArray(this.inConnectors, removedConnection);

                if (LOG)
                    console.log("After: ");
                if (LOG)
                    console.log(this.inConnectors);

            },
            'outConnectionRemoved': function (options) {

                if (LOG)
                    console.log("OUT CONNECTOR");

                if (LOG)
                    console.log("Before: ");
                if (LOG)
                    console.log(this.outConnectors);

                var removedConnection = options.connector;
                fabric.util.removeFromArray(this.outConnectors, removedConnection);

                if (LOG)
                    console.log("After: ");
                if (LOG)
                    console.log(this.outConnectors);
            },
            'newInConnection': function (options) {

                var newInConnection = options.newInConnection;
                var shouldAnimate = options.shouldAnimate;
                var incommingValue = newInConnection.value;

                if (LOG)
                    console.log("incommingValue:");
                if (LOG)
                    console.log(incommingValue);

                if ($.isArray(incommingValue)) {

                    if (!theCollection.setValues(incommingValue)) {
                        alertify.error("The collection must contain elements of the same type", "", 2000);
                        newInConnection.contract();
                        return;
                    }

                } else if (incommingValue.isVisualValue) {



                }

                if (theCollection.inConnectors.length > 0) {
                    var connector = theCollection.inConnectors.pop();
                    connector.contract();
                }

                theCollection.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(incommingValue, false, shouldAnimate);
                });

                theCollection.inConnectors.push(newInConnection);
                theCollection.set('value', incommingValue);


            },
//            'inValueUpdated': function (options) {
//
//                var inConnection = options.inConnection;
//                var shouldAnimate = options.shouldAnimate;
//                var updatedValue = inConnection.value;
//
//                if (LOG) console.log("updatedValue:");
//                if (LOG) console.log(updatedValue);
//
//                if ($.isArray(updatedValue)) {
//
//                    if (!theCollection.setValues(updatedValue)) {
//                        alertify.error("The collection must contain elements of the same type", "", 2000);
//                        inConnection.contract();
//                        return;
//                    }
//
//                } else {
//
//                    blink(theCollection, true, 0.30);
//                    inConnection.contract();
//                    return;
//
//                }
//
//                var theMapper = theCollection.mapper;
//                if (theMapper) {
//                    var newOptions = {
//                        collection: theCollection,
//                        shouldAnimate: shouldAnimate
//                    };
//                    theMapper.trigger('collectionChanged', newOptions);
//                }
//
//                theCollection.outConnectors.forEach(function (outConnector) {
//                    outConnector.setValue(updatedValue, false, shouldAnimate);
//                });
//
//                theCollection.inConnectors.push(inConnection);
//                theCollection.set('value', updatedValue);
//
//
//
//            },
            'valueChanged': function (options) {

                if (LOG)
                    console.log("%c A value within this collection has been changed!", "background: red; color: white;");

                var theCollection = this;
                var changedVisualValue = options.visualValue;
                var shouldAnimate = options.shouldAnimate;
                var theMapper = theCollection.mapper;

                // Updating the values
                theCollection.values = new Array();
                theCollection.visualValues.forEach(function (visualValue) {
                    theCollection.values.push(visualValue.value);
                });

                if (theMapper) {
                    var newOptions = {
                        collection: theCollection,
                        visualValue: changedVisualValue,
                        shouldAnimate: shouldAnimate
                    };
                    theMapper.trigger('collectionValueChanged', newOptions);
                }

                theCollection.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(theCollection.values, false, shouldAnimate);
                });

            },
        });
    },
    inValueUpdated: function (options) {

        var theCollection = this;

        var inConnection = options.inConnection;
        var shouldAnimate = options.shouldAnimate;
        var updatedValue = inConnection.value;

        if (LOG)
            console.log("updatedValue:");
        if (LOG)
            console.log(updatedValue);

        if ($.isArray(updatedValue)) {

            if (!theCollection.setValues(updatedValue)) {
                alertify.error("The collection must contain elements of the same type", "", 2000);
                inConnection.contract();
                return;
            }

        } else {

            blink(theCollection, true, 0.30);
            inConnection.contract();
            return;

        }

        var theMapper = theCollection.mapper;
        if (theMapper) {
            var newOptions = {
                collection: theCollection,
                shouldAnimate: shouldAnimate
            };
            theMapper.trigger('collectionChanged', newOptions);
        }

        theCollection.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(updatedValue, false, shouldAnimate);
        });

        theCollection.inConnectors.push(inConnection);
        theCollection.set('value', updatedValue);
    },
    // Checks if the given value is allowed to be added to the current collection based on the fact that collections should be honogeneous
    isValueAllowed: function (value) {

        var theCollection = this;

        if (!theCollection.iconName) {
            return true;
        } else {

            var valueIconName = getIconNameByVisualValueProposition(value.getTypeProposition());
            if (theCollection.iconName !== valueIconName) {
                return false;
            }

        }

        return true;

    },
    addVisualValue: function (visualValue) {

        popSound.play();

        var theCollection = this;
        var theMapper = theCollection.mapper;
        var theAttributeSelector = theCollection.attributeSelector;

        visualValue.lockMovementX = true;
        visualValue.lockMovementY = true;
        visualValue.lockScalingX = true;
        visualValue.lockScalingY = true;
        visualValue.lockRotation = true;
        visualValue.collection = theCollection;
        visualValue.nonSerializable = true;

        if (theCollection.iconName) {

            theCollection.values.push(visualValue.value);
            theCollection.visualValues.push(visualValue);

            if (theCollection.isCompressed) {

                blink(theCollection.typeIcon, false, 0.30);
                blink(theCollection, true, 0.30);

            } else {



                if (theMapper) {

                    if (LOG)
                        console.log("theCollection.getTotalValues():");
                    if (LOG)
                        console.log(theCollection.getTotalValues());

                    var totalInValues = theMapper.inCollection.getTotalValues();
                    var totalOutValues = theMapper.outCollection.getTotalValues();

                    var intendedNumberOfElements = Math.max(totalInValues, totalOutValues);

                    var otherCollection = theMapper.outCollection;
                    if (theCollection.isMapperOutCollection) {
                        otherCollection = theMapper.inCollection;
                    }

                    var myNumberOfElementsAfterAdding = theCollection.getTotalValues();
                    var theOtherCollectionNumberOfElements = otherCollection.getTotalValues();

                    if (myNumberOfElementsAfterAdding > theOtherCollectionNumberOfElements) {
                        theCollection.isCompressed = true;
                        theCollection.expand(true, null, intendedNumberOfElements);
                    } else {


                        console.log("%cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "background: blue; color: white;");

                        visualValue.relativeY = null;
                        theCollection.positionElements(theCollection.valueScale, intendedNumberOfElements);
                        blink(visualValue, true, 0.3, true);
                    }


                } else if (theAttributeSelector) {

                    var intendedNumberOfElements = theAttributeSelector.theCollection.getTotalValues();

                    if (!theCollection.isCompressed) {
                        theCollection.isCompressed = true;
                        theCollection.expand(true, null, intendedNumberOfElements);
                    } else {

                        if (LOG)
                            console.log("%cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "background: blue; color: white;");

                        visualValue.relativeY = null;
                        theCollection.positionElements(theCollection.valueScale, intendedNumberOfElements);
                        blink(visualValue, true, 0.3);
                    }

                } else {

                    theCollection.isCompressed = true;
                    theCollection.expand(true);

                }



            }

        } else {

            var valueIconName = getIconNameByVisualValueProposition(visualValue.value.getTypeProposition());

            theCollection.values.push(visualValue.value);
            theCollection.visualValues.push(visualValue);

            console.log("%c" + "The collection has no icon type, it should be added.", "background: #46c0c2; color: black;");
            console.log("%c" + "valueIconName: " + valueIconName, "background: #46c0c2; color: black;");

            theCollection.addTypeIcon(valueIconName, 0.05);

        }

        if (theAttributeSelector) {

            var options = {};
            theAttributeSelector.trigger('visualValueAdded', options); // TODO IMPORTANT: Should this also be done for getters and mappers?

        }




        theCollection.associateInCollectionEvents(visualValue);

        theCollection.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(theCollection.values, false, true);
        });

    },
    _render: function (ctx, noTransform) {

        var theCollection = this;

        var rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
                ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
                w = this.width,
                h = this.height,
                x = -w / 2,
                y = -h / 2,
                isInPathGroup = this.group && this.group.type === 'path-group',
                isRounded = rx !== 0 || ry !== 0,
                k = 1 - 0.5522847498 /* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */;

        ctx.beginPath();
        ctx.globalAlpha = isInPathGroup ? (ctx.globalAlpha * this.opacity) : this.opacity;

        if (this.transformMatrix && isInPathGroup) {
            ctx.translate(
                    this.width / 2 + this.x,
                    this.height / 2 + this.y);
        }
        if (!this.transformMatrix && isInPathGroup) {
            ctx.translate(
                    -this.group.width / 2 + this.width / 2 + this.x,
                    -this.group.height / 2 + this.height / 2 + this.y);
        }

        ctx.moveTo(x + rx, y);

        ctx.lineTo(x + w - rx, y);
        isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry);

        ctx.lineTo(x + w, y + h);

        ctx.lineTo(x, y + h);

        ctx.lineTo(x, y + ry);
        isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y);

        ctx.closePath();

        this._renderFill(ctx);

        ctx.save();
        if (this.selected) {
            ctx.strokeStyle = widget_selected_stroke_color;
            ctx.lineWidth = widget_selected_stroke_width;
            ctx.setLineDash(widget_selected_stroke_dash_array);
        }
        this._renderStroke(ctx);
        ctx.restore();

        var a = -this.height / 2 + theCollection.compressedHeight;
        ctx.save();
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, a);
        ctx.lineTo(this.width / 2, a);
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        if (theCollection.matchingY) {

            if (theCollection.matchingY > theCollection.compressedHeight) {

                ctx.save();
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 3]);
                ctx.beginPath();
                ctx.moveTo(-theCollection.width / 2, theCollection.matchingY - theCollection.height / 2);
                ctx.lineTo(theCollection.width / 2, theCollection.matchingY - theCollection.height / 2);
                ctx.stroke();
                ctx.closePath();
                ctx.restore();

            }

        }

    }

});


function addEmptyVerticalCollection(x, y) {

    var aCollection = new VerticalCollection({
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        stroke: 'black',
        fill: rgb(226, 227, 227),
        perPixelTargetFind: true,
        lockScalingX: true,
        lockScalingY: true,
        opacity: 1,
        permanentOpacity: 1,
        movingOpacity: 1,
        hasRotatingPoint: false,
        hasBorders: false,
        hasControls: false,
    });

    canvas.add(aCollection);
    blink(aCollection, true, 0.3);

}

function addVerticalCollection(options) {

    if (LOG) {
        console.log("%cAdding NEW VERTICAL COLLECTION", "background: rgb(244,131,32); color: white;");
    }

    options.fill = rgb(226, 227, 227);
    options.stroke = 'black';

    var theCollection = new VerticalCollection(options);
    addToConnectableElements(theCollection);

    canvas.add(theCollection);

    var values = options.values;

    if (values && values.length > 0) {

        theCollection.setValues(values, options.doNotBlinkCollection);

        if (options.relativeYs || options.xmlIDs) {
            var i = 0;
            theCollection.visualValues.forEach(function (visualValue) {
                var xmlID = options.xmlIDs ? options.xmlIDs[i] : null;
                var relativeY = options.relativeYs ? (isNaN(options.relativeYs[i]) ? null : options.relativeYs[i]) : null;

                visualValue.xmlID = xmlID;
                addToConnectableElements(visualValue);

                visualValue.relativeY = relativeY;
                visualValue.left = theCollection.getCenterPoint().x;
                visualValue.top = theCollection.getCenterPoint().y;
                i++;
            });

            theCollection.executePendingConnections();

        }
    }

    if (options.shouldExpand) {
        theCollection.expand(true);

        setTimeout(function () {

            var actualCenter = new fabric.Point(options.centerX, options.centerY);
            theCollection.setPositionByOrigin(actualCenter, 'center', 'center');
            var valueScale = theCollection.mapper ? theCollection.mapper.valueScale : theCollection.valueScale;
            theCollection.positionElements(valueScale);

        }, 720);

    } else if (options.actualTop !== null && typeof options.actualTop !== 'undefined') {

        theCollection.setPositionByOrigin(new fabric.Point(options.left, options.actualTop), 'center', 'top');
        theCollection.positionTypeIcon();

        canvas.renderAll();
    }

    return theCollection;

}

//function addVerticalCollection(x, y, values) {
//
//    var aCollection = new VerticalCollection({
//        left: x,
//        top: y,
//        originX: 'center',
//        originY: 'center',
//        stroke: 'black',
//        fill: rgb(226, 227, 227),
//        perPixelTargetFind: true,
//        lockScalingX: true,
//        lockScalingY: true,
//        opacity: 1,
//        permanentOpacity: 1,
//        movingOpacity: 1,
//        hasRotatingPoint: false,
//        hasBorders: false,
//        hasControls: false,
//    });
//
//    canvas.add(aCollection);
//
//    if (values) {
//        aCollection.setValues(values);
//    }
//
//    return aCollection;
//
//}

function addVerticalCollectionWithVisualValues(x, y, visualValues) {

    if (visualValues) {
        var values = new Array();
        visualValues.forEach(function (visualValue) {
            values.push(visualValue.value);
        });

        var options = {
            top: y,
            left: x,
            values: values
        };

        return addVerticalCollection(options);
    }

}

function createVerticalCollectionOptionsFromXMLNode(collectionXmlNode) {

    var options = {
        markAsSelected: false,
        animateAtBirth: false,
        xmlID: collectionXmlNode.attr('xmlID')
    };

    var children = collectionXmlNode.children();
    children.each(function () {
        var child = $(this);
        var tagName = this.tagName;

        var value = child.text();
        var type = child.attr('type');

        console.log("%ctagName: " + tagName, "background: rgb(143,98,153); color: white;");

        if (type === "array") {

            var valuesArray = new Array();
            var relativeYs = new Array();
            var xmlIDs = new Array();

            var elements = child.children('value');
            elements.each(function () {
                var valueNode = $(this);

                var value = createValueFromXMLNode(valueNode);
                valuesArray.push(value);

                var relativeY = Number(valueNode.attr('relativeY'));
                relativeYs.push(relativeY);

                var xmlID = valueNode.attr('xmlID');
                xmlIDs.push(xmlID);
            });

            options['values'] = valuesArray;
            options['relativeYs'] = relativeYs;
            options['xmlIDs'] = xmlIDs;

        } else {

            if (type === "number") {
                value = Number(value);
            } else if (type === "boolean") {
                value = value === "true";
            }

            options[tagName] = value;

        }

    });

    options.shouldExpand = options.isExpanded;
    options.doNotBlinkCollection = options.isExpanded;

    console.log("%c" + "options to create the saved VERTICAL COLLECTION", "background: rgb(255,192,36); color: white;");
    console.log(options);

    return options;
}


function createVerticalCollectionFromXMLNode(collectionXmlNode) {

    var options = createVerticalCollectionOptionsFromXMLNode(collectionXmlNode);

    var theCollection = addVerticalCollection(options);

    console.log("%c" + "the added VERTICAL COLLECTION", "background: rgb(56,27,65); color: white;");
    console.log(theCollection);

    return theCollection;

}