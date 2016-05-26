var MapperOutput = fabric.util.createClass(fabric.Path, {
    initialize: function (path, options) {
        options || (options = {});
        this.callSuper('initialize', path, options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('lockMovementX', options.lockMovementX || true);
        this.set('lockMovementY', options.lockMovementY || true);
        this.set('lockScalingX', options.lockScalingX || true);
        this.set('lockScalingY', options.lockScalingY || true);
        this.set('hasRotatingPoint', options.hasRotatingPoint || false);
        this.set('hasBorders', options.hasBorders || false);
        this.set('hasControls', options.hasControls || false);
        this.set('fill', options.fill || rgb(255, 255, 255));
        this.set('stroke', options.stroke || rgb(45, 45, 45));
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('isMapperOutput', true);
        this.set('isCompressed', true);
        this.associateEvents();
        this.originX = 'center';
        this.originY = 'center';
        this.set({left: options.left, top: options.top});
        this.setCoords();
    },
    updateConnectorsPositions: function () {
        updateConnectorsPositions(this);
    },
    setValue: function (value, shouldAnimate) {
        var theMapperOutput = this;
        theMapperOutput.value = value;
        theMapperOutput.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(value, false, shouldAnimate);
        });
    },
    associateEvents: function () {

        this.on({
            'moving': function (options) {
                var theMapperOutput = this;
                var theEvent = options.e;
                if (theEvent) {
                    var canvasCoords = getCanvasCoordinates(theEvent);
                    var lastAddedConnector = getLastElementOfArray(theMapperOutput.outConnectors);
                    if (lastAddedConnector) {
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                    }
                }
            },
            'mousedown': function (options) {
                var theMapperOutput = this;
                var newConnector = new Connector({source: theMapperOutput, x2: theMapperOutput.left, y2: theMapperOutput.top, arrowColor: theMapperOutput.stroke, filledArrow: true, strokeWidth: 1});
                theMapperOutput.outConnectors.push(newConnector);
                canvas.add(newConnector);
            },
            'mouseup': function (options) {

                var theMapperOutput = this;
                var connector = getLastElementOfArray(theMapperOutput.outConnectors);

                if (!theMapperOutput.value) {
                    connector.contract();
                    alertify.error("No value associated to this output point yet", "", 2000);
                    fabric.util.removeFromArray(theMapperOutput.outConnectors, connector);
                    return;
                }

                var theEvent = options.e;
                var canvasCoords = getCanvasCoordinates(theEvent);

                var coordX = canvasCoords.x;
                var coordY = canvasCoords.y;

                var potentialTypes = ['isVisualProperty', 'isOperator', 'isFunctionInput', 'isAggregator', 'isPlayer', 'isVisualValue', 'isVerticalCollection', 'isMapperInput', 'isMapperOutput'];
                if ($.isArray(theMapperOutput.value)) {
                    potentialTypes.push('isFunctionValuesCollection');
                }

                var targetObject = findPotentialDestination(canvasCoords, potentialTypes);



                if (targetObject) {

                    if (targetObject !== theMapperOutput) {


                        if (targetObject.isPlayer) {

                            connector.setDestination(targetObject, true);

                        } else if (targetObject.isOperator || targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isVerticalCollection || targetObject.isMapperInput || targetObject.isMapperOutput || targetObject.isFunctionValuesCollection) {

                            connector.setDestination(targetObject, true);

                            if (!targetObject.isVerticalCollection) {

                                setTimeout(function () {
//                                    connector.source.bringToFront();
//                                    connector.destination.bringToFront();
                                    bringToFront(connector.source);
                                    bringToFront(connector.destination);
                                }, 50);

                            }

                        } else if (targetObject.isAggregator) {

                            targetObject.addConnector(connector, canvasCoords);

                        } else { // This makes no sense, so, the added connector is just removed
                            connector = theMapperOutput.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }
                        }

                    } else {

                        connector = theMapperOutput.outConnectors.pop();
                        if (connector) {
                            connector.contract();
                        }

                    }

                } else {
                    
                    var lastAddedConnector = getLastElementOfArray(theMapperOutput.outConnectors);
                    newConnectionReleasedOnCanvas(lastAddedConnector, coordX, coordY);

//                    if ($.isArray(theMapperOutput.value)) {
//
//                        // TODO: Implement a collection here with the correspongin values
//
//                        var createdCollection = addVerticalCollection(coordX, coordY, theMapperOutput.value);
//
//
//                        console.log("BEFORE: createdCollection.inConnectors:");
//                        console.log(createdCollection.inConnectors);
//
//                        connector.setDestination(createdCollection, true);
//                        
//                        console.log("AFTER: createdCollection.inConnectors:");
//                        console.log(createdCollection.inConnectors);
//
//
//
//                    } else {
//
//                        // The mouse up event is done over a blank section of the canvas
//                        var lastAddedConnector = getLastElementOfArray(theMapperOutput.outConnectors);
//
//                        var visualValue = CreateVisualValueFromValue(theMapperOutput.value);
//                        visualValue.top = coordY;
//                        visualValue.left = coordX;
//
//                        lastAddedConnector.setDestination(visualValue, true);
//
//                        canvas.add(visualValue);
//                        visualValue.animateBirth(false, null, null, false);
//
//                        setTimeout(function () {
//
//                            var theSource = connector.source;
//                            var theDestination = connector.destination;
//
//                            if (theSource) {
//                                theSource.bringToFront();
//                            }
//                            if (theDestination) {
//                                theDestination.bringToFront();
//                            }
//                        }, 50);
//
//
//                    }


                }


//                    var connector = this.outConnectors.pop();
//                        connector.remove();




            },
            'outConnectionRemoved': standarOutConnectionRemovedHandler,
        });



    },
    _render: function (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.rect(-this.width / 2, -this.height / 2, this.width - 3.5, this.height);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
        this.callSuper('_render', ctx);
    },
});