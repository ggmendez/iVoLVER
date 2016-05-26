var CollectionGetter = fabric.util.createClass(fabric.Rect, {
    isCollectionGetter: true,
    initialize: function (options) {
        options || (options = {});

        this.compressedHeight = 100;
        this.valueScale = 0.75;

        this.callSuper('initialize', options);

        this.set('lockScalingX', true);
        this.set('lockScalingY', true);
        this.set('lockRotation', true);

        this.set('hasRotatingPoint', false);
        this.set('hasBorders', false);
        this.set('hasControls', false);
        this.set('transparentCorners', false);
        this.set('perPixelTargetFind', true);
        this.set('width', options.width || 230);
        this.set('height', options.height || 100);
        this.set('fill', options.fill || rgb(204, 204, 204));
        this.set('stroke', options.stroke || rgb(45, 45, 45));
        this.set('strokeWidth', 3);

        this.set('inputPosition', -1);

        this.set('isCompressed', true);
        this.set('rx', 5);
        this.set('ry', this.rx);

        this.set('originX', 'center');
        this.set('originY', 'center');

        this.set('topElements', new Array());

        this.addAtSymbol();
        this.addOutPoint();
        this.addCollection();
        this.addNumber();


        this.associateEvents();

        this.positionElements(false);




    },
    bringTopElementsToFront: function () {
        var theCollectionGetter = this;
        theCollectionGetter.bringToFront(true);
        theCollectionGetter.setCoords();
        theCollectionGetter.topElements.forEach(function (element) {
            element.bringToFront(true);
            bringConnectorsToFront(element);
            element.setCoords();
        });

        // This following two lines are executed so that, after bringing everything to the front, the collections' in and out connectors are also brought to the front
        theCollectionGetter.theCollection.positionConnectors();

    },
    applySelectedStyle: function () {
        this.selected = true;
    },
    applyUnselectedStyle: function () {
        this.selected = false;
    },
    updateOutputVisualValuePropositions: function () {

        var theCollectionGetter = this;

        if (!theCollectionGetter.theCollection.isEmpty()) {
            theCollectionGetter.outputPoint.dataTypeProposition = theCollectionGetter.theCollection.dataTypeProposition;
            theCollectionGetter.outputPoint[theCollectionGetter.outputPoint.dataTypeProposition] = true;
        }
    },
    updateOutputVisibilityStatus: function () {

        var theCollectionGetter = this;

        if (!theCollectionGetter.theCollection.isEmpty() && theCollectionGetter.theCollection.iconName) {
            theCollectionGetter.outputPoint.fill = icons[theCollectionGetter.theCollection.iconName].fill;
            theCollectionGetter.outputPoint.stroke = icons[theCollectionGetter.theCollection.iconName].stroke;
            if (!theCollectionGetter.outputPoint.opacity) {
                theCollectionGetter.outputPoint.opacity = 1;
                theCollectionGetter.outputPoint.permanentOpacity = 1;
                theCollectionGetter.outputPoint.movingOpacity = 1;
                blink(theCollectionGetter.outputPoint, false, 0.3);
                theCollectionGetter.outputPoint.selectable = true;
                theCollectionGetter.outputPoint.evented = true;
            }
        } else {
            theCollectionGetter.outputPoint.opacity = 0;
            theCollectionGetter.outputPoint.permanentOpacity = 0;
            theCollectionGetter.outputPoint.movingOpacity = 0;
            theCollectionGetter.outputPoint.selectable = false;
            theCollectionGetter.outputPoint.evented = false;
        }

    },
    addAtSymbol: function () {
        var atSymbolPath = 'm 8.6875,-56 c 4.427059,2.8e-5 8.096327,1.307319 11,3.9375 2.903612,2.63023 4.343715,6.049498 4.34375,10.28125 -3.5e-5,3.098969 -0.751336,5.639331 -2.28125,7.625 -1.529979,1.985682 -3.424508,3.000004 -5.625,3 -2.851587,4e-6 -4.268252,-1.557287 -4.28125,-4.65625 l -0.09375,0 c -0.950543,3.098963 -2.8385615,4.656254 -5.625,4.65625 -1.7838694,4e-6 -3.1940242,-0.653642 -4.28125,-1.96875 -1.08725122,-1.315097 -1.65626109,-3.085929 -1.65625,-5.3125 -1.109e-5,-2.942695 0.7773319,-5.397119 2.28125,-7.34375 1.5038914,-1.946594 3.4583165,-2.937479 5.90625,-2.9375 0.9374798,2.1e-5 1.795552,0.26825 2.53125,0.75 0.735655,0.481791 1.197894,1.083353 1.40625,1.8125 l 0.0625,0 c 0.02602,-0.364564 0.11456,-1.117168 0.21875,-2.25 l 2.4375,0 c -0.612004,7.174493 -0.937525,10.807302 -0.9375,10.9375 -2.5e-5,2.69532 0.794245,4.062506 2.34375,4.0625 1.406221,6e-6 2.568981,-0.757806 3.5,-2.28125 0.930958,-1.523428 1.406218,-3.515613 1.40625,-5.9375 -3.2e-5,-3.580712 -1.140656,-6.484354 -3.40625,-8.75 -2.265652,-2.2656 -5.395857,-3.406224 -9.40625,-3.40625 -3.867203,2.6e-5 -7.0677207,1.354191 -9.59375,4.0625 -2.526049,2.708353 -3.781256,6.093766 -3.78125,10.15625 -6e-6,3.997404 1.191399,7.233078 3.59375,9.6875 2.4023317,2.454427 5.6432139,3.656249 9.71875,3.65625 3.216123,-1e-6 5.971329,-0.526043 8.25,-1.59375 l 0,2.4375 c -2.25263,0.963538 -5.065127,1.437496 -8.4375,1.4375 -4.7395978,-4e-6 -8.57162519,-1.423179 -11.46875,-4.28125 -2.8971402,-2.858069 -4.3437534,-6.596347 -4.34375,-11.21875 -3.4e-6,-4.765608 1.5221305,-8.736959 4.5625,-11.875 C 0.07160362,-54.450494 3.9609227,-55.999972 8.6875,-56 z m -0.34375,9.5625 c -1.614601,1.9e-5 -2.9101726,0.77606 -3.90625,2.3125 -0.9961081,1.536473 -1.5000138,3.440117 -1.5,5.71875 -1.38e-5,1.536468 0.3294129,2.739591 1,3.625 0.6705574,0.885423 1.5676919,1.343756 2.6875,1.34375 1.6145642,6e-6 2.8997192,-0.82942 3.84375,-2.4375 0.943988,-1.608063 1.406227,-3.718738 1.40625,-6.375 -2.3e-5,-2.786441 -1.174501,-4.187481 -3.53125,-4.1875 z';
        var atSymbol = new fabric.Path(atSymbolPath, {
            originX: 'center',
            originY: 'center',
            strokeWidth: 1.5,
            stroke: 'black',
            fill: 'black',
            selectable: false,
            evented: false,
            opacity: 1,
            permanentOpacity: 1,
            movingOpacity: 1,
        });
        canvas.add(atSymbol);
        this.atSymbol = atSymbol;
        this.topElements.push(atSymbol);
    },
    addCollection: function () {

        var theCollectionGetter = this;

        var theCollection = new VerticalCollection({
            isCollectionGetterInCollection: true,
            originX: 'center',
            originY: 'center',
            stroke: theCollectionGetter.outputPoint.stroke,
            fill: theCollectionGetter.outputPoint.fill,
            perPixelTargetFind: true,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            opacity: 1,
            permanentOpacity: 1,
            movingOpacity: 1,
            hasRotatingPoint: false,
            hasBorders: false,
            hasControls: false,
            getter: theCollectionGetter,
        });

        theCollectionGetter.theCollection = theCollection;
        theCollectionGetter.topElements.push(theCollection);
        canvas.add(theCollection);

    },
    addNumber: function () {
        var theCollectionGetter = this;
        var options = {unscaledValue: 1, showAsInteger: true, observer: theCollectionGetter};
        var theNumber = new NumericData(options);

        theNumber.lockMovementX = true;
        theNumber.lockMovementY = true;
        theNumber.lockScalingX = true;
        theNumber.lockScalingY = true;
        theNumber.lockRotation = true;

        theNumber.scaleX = 0.98;
        theNumber.scaleY = theNumber.scaleX;

        theCollectionGetter.theNumber = theNumber;
        theCollectionGetter.topElements.push(theNumber);
        canvas.add(theNumber);


        theNumber.off('moving');
        theNumber.off('mouseup');
        theNumber.off('mousedown');
        theNumber.off('pressed');

        theNumber.on({
            'mousedown': function (options) {

                theNumber.connecting = true;

                var newConnector = new Connector({source: theNumber, x2: theNumber.left, y2: theNumber.top, arrowColor: 'blue', filledArrow: true, strokeWidth: 1});
                theNumber.outConnectors.push(newConnector);
                canvas.add(newConnector);

            },
            'mouseup': function (options) {
                var theNumber = this;

                if (theNumber.connecting) {

                    var theEvent = options['e'];
                    var canvasCoords = getCanvasCoordinates(theEvent);

                    var coordX = canvasCoords.x;
                    var coordY = canvasCoords.y;

                    var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isOperator', 'isFunctionInput', 'isAggregator', 'isVisualValue', 'isMapperInput', 'isVerticalCollection', 'isMark', 'isNumericFunctionInput']);

                    var connector = getLastElementOfArray(theNumber.outConnectors);

                    if (targetObject) {

                        if (targetObject !== this) {

                            if (targetObject.isMark) {

                                var connector = getLastElementOfArray(this.outConnectors);

                                var theSource = connector.source;
                                var theDestination = connector.destination;

                                var visualProperty = targetObject.getDefaultModifiableVisualPropertyByType(theNumber.value);

                                if (visualProperty) {

                                    connector.setDestination(visualProperty, true);

                                    setTimeout(function () {

                                        if (theSource) {
                                            theSource.bringToFront();
                                        }
                                        if (theDestination) {
                                            theDestination.bringToFront();
                                        }
                                    }, 50);

                                } else {

                                    var connector = this.outConnectors.pop();
                                    connector.contract();

                                }



                            } else if (targetObject.isVerticalCollection) {

                                addVisualVariableToCollection(theNumber, targetObject, connector);


                            } else if (targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isMapperInput || targetObject.isNumericFunctionInput) {

                                connector.setDestination(targetObject, true);

                                setTimeout(function () {
                                    connector.source.bringToFront();
                                    connector.destination.bringToFront();
                                }, 50);

                            } else if (targetObject.isOperator) {

                                if (theNumber.isDurationData) {
                                    connector.value = theNumber.value.convert("isNumericData");
                                }

                                if (connector.value) {

                                    connector.setDestination(targetObject, true);

                                    setTimeout(function () {
                                        connector.source.bringToFront();
                                        connector.destination.bringToFront();
                                    }, 50);

                                } else {
                                    connector.contract();
                                }



                            } else if (targetObject.isAggregator) {

                                targetObject.addConnector(connector, canvasCoords);

                            } else { // This makes no sense, so, the added connector is just removed
                                connector = theNumber.outConnectors.pop();
                                if (connector) {
                                    connector.contract();
                                }
                            }

                        } else {
                            connector = theNumber.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }
                        }

                    } else {

                        // This number is released on the canvas
                        var lastAddedConnector = getLastElementOfArray(theNumber.outConnectors);
                        newConnectionReleasedOnCanvas(lastAddedConnector, coordX, coordY);


                    }

                }

                theNumber.connecting = false;

            },
            'moving': function (options) {

                var theNumber = this;
                var event = options.e;
                var canvasCoords = getCanvasCoordinates(event);

                if (theNumber.connecting) {

//                    if (LOG)
                    console.log("Connecting");

                    // A connector is being taken out of this visual value
                    var lastAddedConnector = getLastElementOfArray(theNumber.outConnectors);
                    lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});

                }

            },
        });



    },
    addOutPoint: function () {

        var outputPointPath = paths['output'].r;
        var outputPoint = new MapperOutput(outputPointPath, {
            evented: false,
            selectable: false,
            angle: 0,
            opacity: 0, // The output point is not visible at the bigining. It will appear when the outCollection has values
            mapper: this,
        });
        canvas.add(outputPoint);
        this.set('outputPoint', outputPoint);
        this.topElements.push(outputPoint);

    },
    positionElements: function (positionCollectionsElements) {

        var theCollectionGetter = this;
        var centerPoint = theCollectionGetter.getCenterPoint();
        var topLeft = theCollectionGetter.getPointByOrigin('left', 'top');
        var gap = 15; // vertical space between the top border of the mapper and the top border of its collections       

        if (theCollectionGetter.atSymbol) {
            theCollectionGetter.atSymbol.left = centerPoint.x - 5;
            theCollectionGetter.atSymbol.top = topLeft.y + theCollectionGetter.compressedHeight / 2 + 5;
            theCollectionGetter.atSymbol.setCoords();
        }

        if (theCollectionGetter.theCollection) {
            theCollectionGetter.theCollection.setPositionByOrigin(new fabric.Point(centerPoint.x - 65, topLeft.y + gap), 'center', 'top');
            theCollectionGetter.theCollection.setCoords();
        }

        if (theCollectionGetter.theNumber) {
            theCollectionGetter.theNumber.setPositionByOrigin(new fabric.Point(centerPoint.x + 50, topLeft.y + gap), 'center', 'top');
            theCollectionGetter.theNumber.setCoords();
        }

        var inPointX = centerPoint.x + 115;
        var inPointY = topLeft.y + theCollectionGetter.compressedHeight / 2;
        if (theCollectionGetter.outputPoint) {
            theCollectionGetter.outputPoint.left = inPointX;
            if (theCollectionGetter.outputPoint.isCompressed || !theCollectionGetter.outputPoint.relativeY) {
                theCollectionGetter.outputPoint.top = inPointY + 5;
            } else {
                theCollectionGetter.outputPoint.top = theCollectionGetter.outputPoint.relativeY + theCollectionGetter.getPointByOrigin('center', 'top').y;
            }
            theCollectionGetter.outputPoint.setCoords();
        }

        if (positionCollectionsElements) {
            theCollectionGetter.theCollection.positionElements(theCollectionGetter.valueScale);
        }


        updateConnectorsPositions(theCollectionGetter.theNumber);

    },
    getCollection: function () {
        return this.theCollection;
    },
    getOutputPoint: function () {
        return this.outputPoint;
    },
    associateEvents: function () {
        var theCollectionGetter = this;
        theCollectionGetter.on({
            'moving': function (options) {

                theCollectionGetter.positionElements(true);
                theCollectionGetter.outputPoint.updateConnectorsPositions();

            },
            'collectionElementMoved': function (options) {

                var theCollection = options.collection;
                var movedElement = options.movedElement;
                var shouldAnimate = false;

                var theOtherCollection = null;
                if (theCollection.isCollectionGetterInCollection) {
                    theOtherCollection = theCollection.mapper.outCollection;
                } else {
                    theOtherCollection = theCollection.mapper.theCollection;
                }

                theCollection.matchingY = movedElement.relativeY + (movedElement.scaleY * movedElement.height / 2);

                if (theOtherCollection) {

                    theOtherCollection.matchingY = movedElement.relativeY + (movedElement.scaleY * movedElement.height / 2);

                }

                var outputValue = theCollectionGetter.computeOutput();
                theCollectionGetter.outputPoint.setValue(outputValue, false);

            },
            'collectionElementManipulationStopped': function (options) {

                var theCollectionGetter = this;

                var shouldAnimate = false;

                var movedElement = options.movedElement;

                var outputValue = theCollectionGetter.computeOutput();

                console.log("outputValue: ");
                console.log(outputValue);

                theCollectionGetter.outputPoint.setValue(outputValue, true);

                canvas.renderAll();

            },
            'collectionValueChanged': function (options) {

                var shouldAnimate = false;

                var theCollectionGetter = this;

                var theCollection = theCollectionGetter.theCollection;

                var changedVisualValue = options.visualValue;

                var outputValue = theCollectionGetter.computeOutput();
                theCollectionGetter.outputPoint.setValue(outputValue, false);

            },
            'collectionChanged': function (options) {

                var shouldAnimate = false;

                var theCollectionGetter = this;

                var theCollection = theCollectionGetter.theCollection;
                theCollection.visualValues.sort(compareByTop);
                var outputValue = theCollectionGetter.computeOutput();
                theCollectionGetter.outputPoint.setValue(outputValue, false);


            },
            'valueChanged': function (options) {

                var shouldAnimate = false;

                var theCollectionGetter = this;

                var theCollection = theCollectionGetter.theCollection;

                var changedVisualValue = options.visualValue;

                var numericValue = changedVisualValue.value;

                var maxIndex = theCollection.getSize();

                console.log("+++++ numericValue: ");
                console.log(numericValue);

                var index = Number(numericValue.number.toFixed(0)); // removing decimals, if any

                if (index < 1) {

                    alertify.error("The given value is not valid as a collection index!", "", 2000);

                    setTimeout(function () {

                        changedVisualValue.setValue(createNumericValue(1));

                    }, 500);

                } else if (index > maxIndex) {

                    alertify.error("The given value exceeds the number of elements in the collection!", "", 2000);

                    setTimeout(function () {

                        changedVisualValue.setValue(createNumericValue(maxIndex));

                    }, 500);

                } else {

                    var outputValue = theCollectionGetter.computeOutput();
                    theCollectionGetter.outputPoint.setValue(outputValue, false);

                    changedVisualValue.outConnectors.forEach(function (outConnector) {
                        
                        
                        console.log("index: " + index);
                        
                        outConnector.setValue(createNumericValue(Number(index.toFixed(0))), false, false);
                    });

                }







            },
        });
    },
    evaluateSingleNumber: function (value) {

        var theCollectionGetter = this;

        /*console.log("********************************************************************************************************************");
         console.log("********************************************************************************************************************");
         console.log("%cEvaluating A NUMBER this single value:", "background: " + theCollectionGetter.fill);
         console.log(value);*/

        var theCollection = theCollectionGetter.getCollection();
        var valuesArray = theCollection.getValues();


        var closestResults = getClosestElement(value, valuesArray);

        var closestValue = closestResults.closestValue;


        var closestElementPosition = closestResults.position;

        var minimumValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition);

        /*console.log("%c closestValue: " + closestValue.number, "background: " + theCollectionGetter.fill);
         console.log("%c closestElementPosition: " + closestElementPosition, "background: " + theCollectionGetter.fill);
         console.log("%c minimumValue: ", "background: " + theCollectionGetter.fill);
         console.log(minimumValue);*/


        var beforeValue = null;
        var afterValue = null;
        var secondLowestValue = null;
        var secondLowestPosition = null;

        var firstVisualValue = null;
        var secondVisualValue = null;

        // checking for bounday cases
        if (closestElementPosition === 0) { // is the closest value the FIRST element of the collection? The, there is nothing before

            console.log("%c ++++ CASE 1", "background: yellow; color: black;");

            secondLowestValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition + 1);
            secondLowestPosition = closestElementPosition + 1;
            firstVisualValue = theCollectionGetter.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionGetter.getCollection().getVisualValueAt(secondLowestPosition);

        } else if (closestElementPosition === theCollection.getTotalValues() - 1) { // is the closest value the LAST element of the collection? Then, there is nothing after

            console.log("%c ++++ CASE 2", "background: yellow; color: black;");

            secondLowestValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition - 1);
            secondLowestPosition = closestElementPosition - 1;
            firstVisualValue = theCollectionGetter.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionGetter.getCollection().getVisualValueAt(secondLowestPosition);

        } else {

            console.log("%c ++++ CASE 3", "background: yellow; color: black;");

            // The closest element is somewhere in the middle of the collection
            beforeValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition - 1); // the before element
            afterValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition + 1); // the after element

            secondLowestValue = null;
            secondLowestPosition = null;
            if (beforeValue.number < afterValue.number) {
                secondLowestValue = beforeValue;
                secondLowestPosition = closestElementPosition - 1;

            } else {
                secondLowestValue = afterValue;
                secondLowestPosition = closestElementPosition + 1;

            }

            firstVisualValue = theCollectionGetter.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionGetter.getCollection().getVisualValueAt(secondLowestPosition);

        }

        console.log("%c beforeValue: ", "beforeValue: " + theCollectionGetter.fill);
        console.log(beforeValue);

        console.log("%c afterValue: ", "afterValue: " + theCollectionGetter.fill);
        console.log(afterValue);

        console.log("%c secondLowestPosition: " + secondLowestPosition, "background: " + theCollectionGetter.fill);

        console.log("%c secondLowestValue: ", "background: " + theCollectionGetter.fill);
        console.log(secondLowestValue);


        var newYCoordinate = changeRange(value.number, firstVisualValue.value.number, secondVisualValue.value.number, firstVisualValue.getCenterPoint().y, secondVisualValue.getCenterPoint().y);

        console.log("newYCoordinate:" + newYCoordinate);


//        drawRectAt(new fabric.Point(firstVisualValue.getCenterPoint().x, newYCoordinate), 'blue');


        /*var x = 0;
         var newYCoordinate = firstVisualValue.getCenterPoint().y;
         
         if (d !== 0) {
         
         x = (Math.pow(d, 2) - Math.pow(r, 2), +Math.pow(R, 2)) / (2 * d); // only when this distance exists, x is computed ( http://mathworld.wolfram.com/Circle-CircleIntersection.html )
         
         if (x > d) {
         x = d / 2;
         }
         
         var oldMinY = 0;
         var oldMaxY = d;
         var newMinY = firstVisualValue.getCenterPoint().y;
         var newMaxY = secondVisualValue.getCenterPoint().y;
         newYCoordinate = changeRange(x, oldMinY, oldMaxY, newMinY, newMaxY);
         }*/



        /*drawRectAt(firstVisualValue.getCenterPoint(), 'green');
         drawRectAt(secondVisualValue.getCenterPoint(), 'red');*/



        return newYCoordinate;

    },
    evaluateSingleValue: function (value) {
        if (value.isNumericData) {
            return this.evaluateSingleNumber(value);
        } else if (value.isColorData) {
            return this.evaluateSingleColor(value);
        }
    },
    evaluateSingleColor: function (value) {

        var theCollectionGetter = this;

        /*console.log("********************************************************************************************************************");
         console.log("********************************************************************************************************************");
         console.log("%cEvaluating this single value:", "background: " + theCollectionGetter.fill);
         console.log(value);*/

        var theCollection = theCollectionGetter.getCollection();
        var valuesArray = theCollection.getValues();
        var distances = value.getDistancesTo(valuesArray);

//            console.log("%c valuesArray: ", "background: " + theCollectionGetter.fill);
//            var k = 0;
//            valuesArray.forEach(function (colorValue) {
//                console.log(k + ": " + colorValue.color.toRgb() + " distance: " + distances[k]);
//                k++;
//            });

        /*console.log("%c distances: " + distances, "background: " + theCollectionGetter.fill);
         console.log(distances);*/

        var minimunDistance = Math.min.apply(Math, distances);
        var closestElementPosition = distances.indexOf(minimunDistance);
        var minimumValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition);

        /*console.log("%c minimunDistance: " + minimunDistance, "background: " + theCollectionGetter.fill);
         console.log("%c closestElementPosition: " + closestElementPosition, "background: " + theCollectionGetter.fill);
         console.log("%c minimumValue: ", "background: " + theCollectionGetter.fill);
         console.log(minimumValue);*/


        var beforeValue = null;
        var beforeDistance = null;
        var afterValue = null;
        var afterDistance = null;
        var secondLowestDistance = null;
        var secondLowestValue = null;
        var secondLowestPosition = null;

        var firstVisualValue = null;
        var secondVisualValue = null;

        // checking for bounday cases
        if (closestElementPosition === 0) { // is the closest value the FIRST element of the collection? The, there is nothing before

//            console.log("%c ++++ CASE 1", "background: yellow; color: black;");

            afterValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition + 1);
            afterDistance = value.getDistanceTo(afterValue);

            secondLowestDistance = afterDistance;
            secondLowestValue = afterValue;
            secondLowestPosition = closestElementPosition + 1;

            firstVisualValue = theCollectionGetter.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionGetter.getCollection().getVisualValueAt(secondLowestPosition);

        } else if (closestElementPosition === theCollection.getTotalValues() - 1) { // is the closest value the LAST element of the collection? Then, there is nothing after

//            console.log("%c ++++ CASE 2", "background: yellow; color: black;");

            beforeValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition - 1);
            beforeDistance = value.getDistanceTo(beforeValue);

            secondLowestDistance = beforeDistance;
            secondLowestValue = beforeValue;
            secondLowestPosition = closestElementPosition - 1;

            firstVisualValue = theCollectionGetter.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionGetter.getCollection().getVisualValueAt(secondLowestPosition);

        } else {

//            console.log("%c ++++ CASE 3", "background: yellow; color: black;");

            // The closest element is somewhere in the middle of the collection
            beforeValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition - 1); // the before element
            afterValue = theCollectionGetter.getCollection().getValueAt(closestElementPosition + 1); // the after element

            beforeDistance = value.getDistanceTo(beforeValue);
            afterDistance = value.getDistanceTo(afterValue);

            secondLowestDistance = null;
            secondLowestValue = null;
            secondLowestPosition = null;
            if (beforeDistance < afterDistance) {
                secondLowestDistance = beforeDistance;
                secondLowestValue = beforeValue;
                secondLowestPosition = closestElementPosition - 1;

            } else {
                secondLowestDistance = afterDistance;
                secondLowestValue = afterValue;
                secondLowestPosition = closestElementPosition + 1;

            }

            firstVisualValue = theCollectionGetter.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionGetter.getCollection().getVisualValueAt(secondLowestPosition);

        }

        /*console.log("%c beforeValue: ", "beforeValue: " + theCollectionGetter.fill);
         console.log(beforeValue);
         
         console.log("%c afterValue: ", "afterValue: " + theCollectionGetter.fill);
         console.log(afterValue);
         
         console.log("%c beforeDistance: " + beforeDistance, "background: " + theCollectionGetter.fill);
         console.log("%c afterDistance: " + afterDistance, "background: " + theCollectionGetter.fill);
         
         console.log("%c secondLowestPosition: " + secondLowestPosition, "background: " + theCollectionGetter.fill);
         console.log("%c secondLowestDistance: " + secondLowestDistance, "background: " + theCollectionGetter.fill);
         
         console.log("%c secondLowestValue: ", "background: " + theCollectionGetter.fill);
         console.log(secondLowestValue);*/





        var R = secondLowestDistance;
        var r = minimunDistance;
        var d = minimumValue.getDistanceTo(secondLowestValue); // this is the perceptual color distance between the closest element to the given element and the second closest element that is adyacent to first closest color


//        var newDistance = d * (r / (R + r));


        var newDistance = getProportionalDistance(firstVisualValue.value.color, secondVisualValue.value.color, value.color);

//        console.log("newDistance:" + newDistance);

        // changeRange(oldValue, oldMin, oldMax, newMin, newMax)

//        var yy = null;
//        if (firstVisualValue.getCenterPoint().y < secondVisualValue.getCenterPoint().y) {
//            yy = changeRange(newDistance, d, 0, firstVisualValue.getCenterPoint().y, secondVisualValue.getCenterPoint().y);
//        } else {
//            yy = changeRange(newDistance, 0, d, firstVisualValue.getCenterPoint().y, secondVisualValue.getCenterPoint().y);
//        }


        var newYCoordinate = changeRange(newDistance, 0, d, firstVisualValue.getCenterPoint().y, secondVisualValue.getCenterPoint().y);

//        console.log("newYCoordinate:" + newYCoordinate);


//        drawRectAt(new fabric.Point(firstVisualValue.getCenterPoint().x, newYCoordinate), 'blue');


        /*var x = 0;
         var newYCoordinate = firstVisualValue.getCenterPoint().y;
         
         if (d !== 0) {
         
         x = (Math.pow(d, 2) - Math.pow(r, 2), +Math.pow(R, 2)) / (2 * d); // only when this distance exists, x is computed ( http://mathworld.wolfram.com/Circle-CircleIntersection.html )
         
         if (x > d) {
         x = d / 2;
         }
         
         var oldMinY = 0;
         var oldMaxY = d;
         var newMinY = firstVisualValue.getCenterPoint().y;
         var newMaxY = secondVisualValue.getCenterPoint().y;
         newYCoordinate = changeRange(x, oldMinY, oldMaxY, newMinY, newMaxY);
         }*/



        /*drawRectAt(firstVisualValue.getCenterPoint(), 'green');
         drawRectAt(secondVisualValue.getCenterPoint(), 'red');*/



        return newYCoordinate;

    },
    evaluate: function (value, shouldAnimate) {




        var theCollectionGetter = this;

        /*console.log("%cThe mapper is trying to evaluate the following value:", "background: " + theCollectionGetter.fill);
         console.log("%cThe evaluation will happen with this value for shouldAnimate:" + shouldAnimate, "background: " + theCollectionGetter.fill);
         console.log(value);*/

        if ($.isArray(value)) {

            // Each of the elements of the received array has to be evaluated. The output of this process should be an array of values

            var outputValues = new Array();

            value.forEach(function (currentValue) {

                var currentEvaluationResult = theCollectionGetter.evaluateSingleValue(currentValue);

                /*console.log("evaluationResult:");
                 console.log(evaluationResult);*/

                var output = theCollectionGetter.computeOutput(currentEvaluationResult);
                outputValues.push(output);
            });

            theCollectionGetter.outputPoint.setValue(outputValues, shouldAnimate);

            /*console.log("RESULTS OF THE EVALUATION PROCESS:", "background: red; color: white;");
             console.log(outputValues);*/

        } else {

            // A single value is received. The value resulting from this evaluation process will be another single value
            var evaluationResult = theCollectionGetter.evaluateSingleValue(value);

            var outputValue = theCollectionGetter.computeOutput(evaluationResult);

            theCollectionGetter.outputPoint.setValue(outputValue, shouldAnimate);

        }

    },
    computeOutput: function () {

        var theCollectionGetter = this;
        var theCollection = theCollectionGetter.theCollection;
        var theNumber = theCollectionGetter.theNumber;

        if (theCollection && !theCollection.isEmpty()) {

            var index = theNumber.value.number - 1;
            index = Number(index.toFixed(0));

            console.log("************** position: ");
            console.log(index);

            var outputValue = theCollection.getValueAt(index);

            console.log("---- outputValue:");
            console.log(outputValue);

            return outputValue;

        }

    }
});

function addCollectionGetter(x, y) {
    var aCollectionGetter = new CollectionGetter({
        left: x,
        top: y
    });
    canvas.add(aCollectionGetter);
    setTimeout(aCollectionGetter.bringTopElementsToFront(), 50);

    blink(aCollectionGetter.atSymbol, false, 0.3);
    blink(aCollectionGetter.theCollection, false, 0.3);
    blink(aCollectionGetter.theNumber, false, 0.3);
    blink(aCollectionGetter, true, 0.2);

}