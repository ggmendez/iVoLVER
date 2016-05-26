var NumericFunctionOutput = fabric.util.createClass(fabric.Path, {
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
        this.set('fill', options.fill || rgb(2, 128, 204));
        this.set('stroke', options.stroke || darkenrgb(2, 128, 204));
        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('isNumericFunctionOutput', true);
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

        console.log("%c NumericFunctionOutput setValue function. shouldAnimate value: " + shouldAnimate, "background: " + this.fill + "; color: white;");

        var theNumericFunctionOutput = this;
        theNumericFunctionOutput.value = value;

        var i;
        for (i = 0; i < theNumericFunctionOutput.outConnectors.length; i++) {
            theNumericFunctionOutput.outConnectors[i].setValue(value, false, shouldAnimate);
        }

    },
    associateEvents: function () {

        this.on({
            'moving': function (options) {
                var theNumericFunctionOutput = this;
                var theEvent = options.e;
                if (theEvent) {
                    var canvasCoords = getCanvasCoordinates(theEvent);
                    var lastAddedConnector = getLastElementOfArray(theNumericFunctionOutput.outConnectors);
                    if (lastAddedConnector) {
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                    }
                }
            },
            'mousedown': function (options) {
                var theNumericFunctionOutput = this;
                var newConnector = new Connector({source: theNumericFunctionOutput, x2: theNumericFunctionOutput.left, y2: theNumericFunctionOutput.top, arrowColor: theNumericFunctionOutput.stroke, filledArrow: true, strokeWidth: 1});
                theNumericFunctionOutput.outConnectors.push(newConnector);
                canvas.add(newConnector);
            },
            'mouseup': function (options) {

                var theNumericFunctionOutput = this;
                var connector = getLastElementOfArray(theNumericFunctionOutput.outConnectors);

                if (!theNumericFunctionOutput.value) {
                    connector.contract();
                    alertify.error("No value associated to this output point yet", "", 2000);
                    fabric.util.removeFromArray(theNumericFunctionOutput.outConnectors, connector);
                    return;
                }

                var theEvent = options.e;
                var canvasCoords = getCanvasCoordinates(theEvent);

                var coordX = canvasCoords.x;
                var coordY = canvasCoords.y;


                var targetObject = findPotentialDestination(canvasCoords, ['isNumericFunctionOutput', 'isVisualProperty', 'isOperator', 'isAggregator', 'isPlayer', 'isMapperInput', 'isVisualValue', 'isNumericFunctionInput', 'isFunctionValuesCollection']);
                
                

                if (targetObject) {                                        

                    if (targetObject !== theNumericFunctionOutput) {
                        
                        if (targetObject.isOperator || targetObject.isVisualProperty || targetObject.isFunctionInput || targetObject.isVisualValue || targetObject.isVerticalCollection || targetObject.isMapperInput || targetObject.isNumericFunctionOutput || targetObject.isNumericFunctionInput || targetObject.isFunctionValuesCollection) {

                            connector.setDestination(targetObject, true);

                            if (!targetObject.isVerticalCollection) {

                                setTimeout(function () {
                                    bringToFront(connector.source);
                                    bringToFront(connector.destination);
                                }, 50);

                            }

                        } else if (targetObject.isAggregator) {

                            targetObject.addConnector(connector, canvasCoords);

                        } else { // This makes no sense, so, the added connector is just removed
                            connector = theNumericFunctionOutput.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }
                        }

                    } else {                                                

                        connector = theNumericFunctionOutput.outConnectors.pop();
                        if (connector) {
                            connector.remove();
                        }

                    }

                } else {

                    // The mouse up event is done over a blank section of the canvas
                    var lastAddedConnector = getLastElementOfArray(theNumericFunctionOutput.outConnectors);
                    newConnectionReleasedOnCanvas (lastAddedConnector, coordX, coordY);

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