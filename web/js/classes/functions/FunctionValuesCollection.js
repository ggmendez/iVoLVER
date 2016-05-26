var FunctionValuesCollection = fabric.util.createClass(fabric.Path, {
    initialize: function (path, options) {
        options || (options = {});
        this.callSuper('initialize', path, options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('lockMovementX', options.lockMovementX || true);
        this.set('lockMovementY', options.lockMovementY || true);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('lockRotation', options.lockScalingY || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('hasBorders', options.hasBorders || false);
        this.set('hasControls', options.hasControls || false);
        this.set('fill', options.fill || rgb(2, 128, 204));
        this.set('stroke', options.stroke || darkenrgb(2, 128, 204));
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('isFunctionValuesCollection', true);
        this.set('isCompressed', true);
        this.set('dataTypeProposition', 'isNumericData');
        this.originX = 'center';
        this.originY = 'center';
        this.set({left: options.left, top: options.top});
        this.setCoords();
        this.associateEvents();
    },
    updateConnectorsPositions: function () {
        updateConnectorsPositions(this);
    },
    associateEvents: function () {

        var theFunctionValuesCollection = this;

        theFunctionValuesCollection.on({
            'mouseup': function (options) {
                var theFunctionValuesCollection = this;
                var theNumericFunction = theFunctionValuesCollection.numericFunction;
            },
            'mousedown': function (options) {
                var theFunctionValuesCollection = this;
//                theFunctionValuesCollection.bringToFront();
                bringToFront(theFunctionValuesCollection);
            },
            'moving': function (options) {
                var theFunctionValuesCollection = this;
                var event = options.e;
                var canvasCoords = getCanvasCoordinates(event);
                var pointer = canvas.getPointer(event);
                var numericFunctionInputCenter = theFunctionValuesCollection.getCenterPoint();
                var pointerRelativeToCenter = {x: pointer.x - numericFunctionInputCenter.x, y: pointer.y - numericFunctionInputCenter.y};

                var theNumericFunction = theFunctionValuesCollection.numericFunction;
                if (theNumericFunction) {

                    if (theNumericFunction.isCompressed) {
                        return;
                    }

                    var theNumericFunctionOutput = theNumericFunction.outputPoint;

                    theFunctionValuesCollection.inConnectors.forEach(function (inConnector) {
                        inConnector.contract();
                    });

                    var inCollection = theNumericFunction.getInCollection();
                    var outCollection = theNumericFunction.getOutCollection();
                    var theCollectionLeftTop = inCollection.getPointByOrigin('left', 'top');
                    var theCollectionRightBottom = inCollection.getPointByOrigin('right', 'bottom');

                    var diff = 0;
                    var theFirstElement = inCollection.getVisualValueAt(0);
                    if (theFirstElement) {
                        diff = (theFunctionValuesCollection.getHeight() - theFirstElement.getHeight()) / 2 + (theFunctionValuesCollection.strokeWidth + theFirstElement.strokeWidth) / 2;
                    }

                    var startingY = inCollection.compressedHeight + theCollectionLeftTop.y + inCollection.strokeWidth + 1 - diff;
                    var endingY = theCollectionRightBottom.y;

                    var top = canvasCoords.y - ((theFunctionValuesCollection.height * theFunctionValuesCollection.scaleY / 2) + pointerRelativeToCenter.y);
                    var bottom = canvasCoords.y + ((theFunctionValuesCollection.height * theFunctionValuesCollection.scaleY / 2) - pointerRelativeToCenter.y);

                    if (top < startingY) {

                        theFunctionValuesCollection.lockMovementY = true;
                        theFunctionValuesCollection.setPositionByOrigin(new fabric.Point(theFunctionValuesCollection.left, startingY), 'center', 'top');

                    } else if (bottom > endingY) {

                        theFunctionValuesCollection.lockMovementY = true;
                        theFunctionValuesCollection.setPositionByOrigin(new fabric.Point(theFunctionValuesCollection.left, endingY), 'center', 'bottom');

                    } else {

                        theFunctionValuesCollection.lockMovementY = false;

                    }

                    theFunctionValuesCollection.relativeY = theFunctionValuesCollection.top - theNumericFunction.getPointByOrigin('center', 'top').y;

                    theNumericFunctionOutput.top = theFunctionValuesCollection.top;
                    theNumericFunctionOutput.relativeY = theNumericFunctionOutput.top - theNumericFunction.getPointByOrigin('center', 'top').y;

                    theNumericFunctionOutput.updateConnectorsPositions();

                    inCollection.matchingY = theFunctionValuesCollection.top - inCollection.getPointByOrigin('center', 'top').y;
                    outCollection.matchingY = theNumericFunctionOutput.top - outCollection.getPointByOrigin('center', 'top').y;

                    theFunctionValuesCollection.setCoords();
                    theNumericFunction.computeOutput();


                }


            },
//            'inValueUpdated': function (options) {
//                
//                
//
//                var inConnection = options.inConnection;
//                var markAsSelected = options.markAsSelected;
//                var shouldAnimate = options.shouldAnimate;
//                
//                
//                
//                if (LOG) console.log("The collection that is feeding me has been updated!!!");
//                if (LOG) console.log("shouldAnimate:");
//                if (LOG) console.log(shouldAnimate);
//
//                var updatedValue = inConnection.value;
//                var theNumericFunction = theFunctionValuesCollection.numericFunction;
//
//                if (LOG) console.log("updatedValue:");
//                if (LOG) console.log(updatedValue);
//                
//                var coordinate = 'x';
//                if (theFunctionValuesCollection.isYValues) {
//                    coordinate = 'y';
//                }
//
//                var success = theNumericFunction.setCoordinates (updatedValue, coordinate);
//                if (!success) {
//                    alertify.error("A weird error has happened. Please, contact God.", "", 2000);
//                    inConnection.contract();
//                    return;
//                }
//
//                theFunctionValuesCollection.outConnectors.forEach(function (outConnector) {
//                    outConnector.setValue(updatedValue, false, shouldAnimate);
//                });
//
//                theFunctionValuesCollection.inConnectors.push(inConnection);
//                
//                if (shouldAnimate) {
//                    blink(theFunctionValuesCollection, true, 0.3);
//                }
//
//                theFunctionValuesCollection.set('value', updatedValue);
//
//            },
            'newInConnection': function (options) {



                var newInConnection = options.newInConnection;
                var shouldAnimate = options.shouldAnimate;
                var incommingValue = newInConnection.value;

                if (LOG)
                    console.log("incommingValue:");
                if (LOG)
                    console.log(incommingValue);

                if (LOG)
                    console.log("theFunctionValuesCollection.dataTypeProposition:");
                if (LOG)
                    console.log(theFunctionValuesCollection.dataTypeProposition);

                var valuesType = getHomogeneousType(incommingValue);

                if (valuesType !== 'number') {

                    alertify.error("The given value is not a collection of numbers", "", 2000);
                    newInConnection.contract();
                    return;

                }

                var theNumericFunction = theFunctionValuesCollection.numericFunction;
                if (!theNumericFunction) {

                    alertify.error("This input point exists without a Numeric Function!!! Seriously???", "", 2000);
                    newInConnection.contract();
                    return;

                }

                if (LOG)
                    console.log("Going to evaluate this value:");
                if (LOG)
                    console.log(incommingValue);

                var coordinate = 'x';
                if (theFunctionValuesCollection.isYValues) {
                    coordinate = 'y';
                }

                var success = theNumericFunction.setCoordinates(incommingValue, coordinate);
                if (!success) {
                    alertify.error("A weird error has happened.", "", 2000);
                    newInConnection.contract();
                    return;
                }

                if (theFunctionValuesCollection.inConnectors.length > 0) {
                    var connector = theFunctionValuesCollection.inConnectors.pop();
                    connector.contract();
                }

                theFunctionValuesCollection.outConnectors.forEach(function (outConnector) {
                    outConnector.setValue(incommingValue, false, shouldAnimate);
                });

                theFunctionValuesCollection.inConnectors.push(newInConnection);
                blink(theFunctionValuesCollection, true, 0.3);

                theFunctionValuesCollection.set('value', incommingValue);




            },
            'inConnectionRemoved': standarInConnectionRemovedHandler,
            'outConnectionRemoved': standarOutConnectionRemovedHandler,
        });

    },
    inValueUpdated: function (options) {

        var theFunctionValuesCollection = this;



        var inConnection = options.inConnection;
        var markAsSelected = options.markAsSelected;
        var shouldAnimate = options.shouldAnimate;



        if (LOG)
            console.log("The collection that is feeding me has been updated!!!");
        if (LOG)
            console.log("shouldAnimate:");
        if (LOG)
            console.log(shouldAnimate);

        var updatedValue = inConnection.value;
        var theNumericFunction = theFunctionValuesCollection.numericFunction;

        if (LOG)
            console.log("updatedValue:");
        if (LOG)
            console.log(updatedValue);

        var coordinate = 'x';
        if (theFunctionValuesCollection.isYValues) {
            coordinate = 'y';
        }

        var success = theNumericFunction.setCoordinates(updatedValue, coordinate);
        if (!success) {
            alertify.error("A weird error has happened.", "", 2000);
            inConnection.contract();
            return;
        }

        theFunctionValuesCollection.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(updatedValue, false, shouldAnimate);
        });

        theFunctionValuesCollection.inConnectors.push(inConnection);

        if (shouldAnimate) {
            blink(theFunctionValuesCollection, true, 0.3);
        }

        theFunctionValuesCollection.set('value', updatedValue);

    },
});