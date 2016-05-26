var ContinuousFunction = fabric.util.createClass(fabric.Path, {
    type: 'continuousFunction',
    isContinuousFunction: true,
    initialize: function (path, options) {
        options || (options = {});
        this.callSuper('initialize', path, options);
        this.set('hasRotatingPoint', false);
        this.set('hasBorders', false);
        this.set('hasControls', false);
        this.set('transparentCorners', false);
        this.set('originX', 'center');
        this.set('originY', 'center');
        this.set('fill', '');
        this.set('top', options.top);
        this.set('left', options.left);
        this.set('strokeWidth', options.strokeWidth || 3);
        this.set('stroke', options.stroke || rgb(0, 153, 255));
        this.set('perPixelTarget', true);
        this.set('type', 'functionWidget');
        this.set('widgets', new Array());
        this.set('evented', false);
        this.set('isContinuousFunction', true);
//        this.set('padding', 40);


        var points = this.path;

//      if (LOG) console.log("%cthis.width", "background: aqua; color: black;");
//      if (LOG) console.log(this.width);
//      if (LOG) console.log("%cthis.getWidth()", "background: aqua; color: black;");
//      if (LOG) console.log(this.getWidth());
//      if (LOG) console.log("%cthis.getCenterPoint()", "background: blue; color: white;");
//      if (LOG) console.log(this.getCenterPoint());
//      if (LOG) console.log("%cpoints", "background: aqua");
//      if (LOG) console.log(points);

        var topLeft = this.getPointByOrigin('left', 'top');
        var bottomRigth = this.getPointByOrigin('right', 'bottom');

//        if (LOG) console.log("%ctopLeft", "background: pink");
//        if (LOG) console.log(topLeft);        

//        drawRectAt(bottomRigth, "purple");

        var curvePoints = new Array();
        curvePoints.push({x: 0, y: 0});
        var xValues = new Array();
        var yValues = new Array();
        xValues.push(0);
        yValues.push(0);
        var x, y, i;
        var n = points.length;

        var begin = points[1][4] ? 1 : 0;
        var end = points[1][4] ? n - 1 : n;

        for (i = begin; i < end; i++) {
            if (points[i][4]) {

//            x = points[i][3];
//            y = bottomRigth.y - topLeft.y - points[i][4];


                // The following change was necessary for the modifications in the Path class performed for the 1.4.12 version
                x = points[i][3] - topLeft.x - this.strokeWidth / 2;
                y = topLeft.y - points[i][4] + this.height + this.strokeWidth / 2;

            } else {



                x = points[i][1];
                y = bottomRigth.y - points[i][2];
//                if (LOG) console.log("%cx: " + x + " y: " + y, "background: lightpink");

//            drawRectAt(new fabric.Point(x, y), "green");

            }
            curvePoints.push({x: x, y: y});
            xValues.push(x);
            yValues.push(y);


//            drawRectAt(new fabric.Point(x, y), "red");

        }

        if (end == n - 1) {

            x = points[n - 1][1];
            y = bottomRigth.y - topLeft.y - points[n - 1][2];
            curvePoints.push({x: x, y: y});
            xValues.push(x);
            yValues.push(y);

        }











        var totalPoints = curvePoints.length;


        // The points in the curve should always been indicated from left to rigth
        // The first point is always zero, so we check the second one
        if (curvePoints[1].x > curvePoints[totalPoints - 1].x) {
            curvePoints = curvePoints.reverse();
//            if (LOG) console.log("%cREVERSING POINTS IN THE CURVE!!!", "background: red");
        }











        this.xValueOffset = 60;
        this.yValueOffset = 50;
        this.axisOffset = 30;
        var fontSize = 30;

        var minXValue = options.minX ? options.minX : 0;
        var minX = new TextInput('' + minXValue, {
            left: topLeft.x,
            top: bottomRigth.y + this.xValueOffset * this.scaleY,
            lockMovementX: true,
            lockMovementY: true,
            fontSize: fontSize,
            parentObject: this,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            untransformedScaleX: 1,
            untransformedScaleY: 1,
            untransformedAngle: 0,
            hasRotatingPoint: false,
            hasBorders: false,
            hasControls: false
        });
        // Additional properties needed for spatial location        
//        minX.untransformedX = 0 - minX.getWidth() / 2 - 1.5;
        minX.untransformedX = 0 - minX.width / 2 - 1.5 * this.scaleX;

//        if (LOG) console.log("%cminX.untransformedX", "background: green; color: white;");
//        if (LOG) console.log(minX.untransformedX);


        minX.untransformedY = bottomRigth.y + (this.xValueOffset * this.scaleY) - topLeft.y - minX.getHeight() / 2 - (1.5 * this.scaleY);
//        if (LOG) console.log("%cminX.untransformedY", "background: green; color: white;");
//        if (LOG) console.log(minX.untransformedY);


        minX.on('changed', function (option) {
            computeUntransformedProperties(minX);
        });


        var maxXValue = options.maxX ? options.maxX : Math.max.apply(Math, xValues).toFixed(0) - 3;
        this.absoluteMaxX = Math.max.apply(Math, xValues).toFixed(0) - 3;

        var maxX = new TextInput('' + maxXValue, {
            left: bottomRigth.x,
            top: bottomRigth.y + this.xValueOffset,
            lockMovementX: true,
            lockMovementY: true,
            fontSize: fontSize,
            parentObject: this,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            untransformedScaleX: 1,
            untransformedScaleY: 1,
            untransformedAngle: 0,
            originX: 'center',
            originY: 'center',
            hasRotatingPoint: false,
            hasBorders: false,
            hasControls: false
        });
        // Additional properties needed for spatial location        
        maxX.untransformedX = bottomRigth.x - topLeft.x - maxX.getWidth() / 2 - 1.5;
        maxX.untransformedY = bottomRigth.y + this.xValueOffset - topLeft.y - maxX.height / 2 - 1.5;
        maxX.on('changed', function (option) {
            computeUntransformedProperties(maxX);
        });




        var minYValue = options.minY ? options.minY : 0;
        var minY = new TextInput('' + minYValue, {
            left: topLeft.x - this.yValueOffset,
            top: bottomRigth.y,
            lockMovementX: true,
            lockMovementY: true,
            originX: 'right',
            fontSize: fontSize,
            parentObject: this,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            untransformedScaleX: 1,
            untransformedScaleY: 1,
            untransformedAngle: 0,
            hasRotatingPoint: false,
            hasBorders: false,
            hasControls: false
        });
        // Additional properties needed for spatial location        
        minY.untransformedX = -this.yValueOffset - minY.getWidth() / 2 - 1.5;
        minY.untransformedY = bottomRigth.y - topLeft.y - minY.getHeight() / 2 - 1.5;
        minY.on('changed', function (option) {
            minY.untransformedX = -this.parentObject.yValueOffset - minY.getWidth() / 2 - 1.5;
            minY.untransformedY = bottomRigth.y - topLeft.y - minY.getHeight() / 2 - 1.5;
            this.parentObject.updateOutputValue(true);
        });


        this.absoluteMaxY = Math.max.apply(Math, yValues).toFixed(0) - 3;

        var maxYValue = options.maxY ? options.maxY : Math.max.apply(Math, yValues).toFixed(0) - 3;
        var maxY = new TextInput('' + maxYValue, {
            left: topLeft.x - this.yValueOffset,
            top: topLeft.y,
            lockMovementX: true,
            lockMovementY: true,
            originX: 'right',
            fontSize: fontSize,
            parentObject: this,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            untransformedScaleX: 1,
            untransformedScaleY: 1,
            untransformedAngle: 0,
            hasRotatingPoint: false,
            hasBorders: false,
            hasControls: false
        });
        // Additional properties needed for spatial location        
        maxY.untransformedX = -this.yValueOffset - maxY.getWidth() / 2 - 1.5;
        maxY.untransformedY = -maxY.getHeight() / 2 - 1.5;
        maxY.on('changed', function (option) {
            maxY.untransformedX = -this.parentObject.yValueOffset - maxY.getWidth() / 2 - 1.5;
            maxY.untransformedY = -maxY.getHeight() / 2 - 1.5;
            this.parentObject.updateOutputValue(true);
        });


        var ySliderRadius = 20;
        var ySliderLeft = topLeft.x - this.axisOffset + 1.5;
        var ySliderTop = maxY.top + (minY.top - maxY.top) / 2;

        var ySlider = new fabric.Circle({
            radius: ySliderRadius,
            left: ySliderLeft,
            top: ySliderTop,
            fill: rgb(78, 145, 118),
            stroke: darkenrgb(85, 159, 129),
            originX: 'center',
            originY: 'center',
            opacity: 1,
            strokeWidth: '3',
            perPixelTargetFind: true,
            lockMovementY: true,
            lockMovementX: true,
            hasControls: false,
            hasBorders: false,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            // Properties for spatial location
            parentObject: this,
            untransformedScaleX: 1,
            untransformedScaleY: 1,
            untransformedAngle: 0,
            outConnectors: new Array(),
            isContinuousFunctionOutput: true,
            isClickable: true
        });
        ySlider.untransformedX = -this.axisOffset - ySliderRadius;
        ySlider.untransformedY = ySliderTop - topLeft.y - ySliderRadius - 1.5;
        ySlider.originalUntransformedX = ySlider.untransformedX;
        ySlider._render = function (ctx) {
            ctx.save();
            // We don't want transparency effects on the slider, so that the different drawing parts that compose it do not are revealed (as they do not look good).
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.font = "25px Arial";
            ctx.fillStyle = "#e9f5ed";
            ctx.fillText("Y", -8.4, 10);
            ctx.closePath();
            ctx.restore();
        };

        ySlider.applySelectedStyle = function () {
            ySlider.parentObject.selected = true;
        };

        ySlider.applyUnselectedStyle = function () {
            ySlider.parentObject.selected = false;
        };



        ySlider.on('outConnectionRemoved', function (options) {

            var removedConnection = options.connector;
            fabric.util.removeFromArray(ySlider.outConnectors, removedConnection);

        });


        ySlider.on('mousedown', function (options) {

            canvasDeselectAllObjects();

//            if (LOG) console.log("Mouse DOWN over the ySlider of a function");

            var theEvent = options;
            theEvent = options.e;

            if (theEvent) {

                var canvasCoords = getCanvasCoordinates(theEvent);
                var coordX = canvasCoords.x;
                var coordY = canvasCoords.y;



                if (LOG) console.log("typeof ySlider.value:");
                if (LOG) console.log(typeof ySlider.value);

                var outputValue = createNumericValue(ySlider.value);

                var newConnector = new Connector({source: ySlider, x2: coordX, y2: coordY, arrowColor: ySlider.stroke, filledArrow: true, value: outputValue});
                newConnector.widget = ySlider;
                ySlider.outConnectors.push(newConnector);

                canvas.add(newConnector);
                canvas.renderAll();
//                if (LOG) console.log("Created connector: ");
//                if (LOG) console.log(newConnector);
            }
        });

        ySlider.on('mouseup', function (option) {

//            if (LOG) console.log("Mouse UP over the ySlider of a function");

            if (ySlider.moving) {

                var theEvent = option['e'];

                if (theEvent) {

//                    if (LOG) console.log(theEvent);

                    var canvasCoords = getCanvasCoordinates(theEvent);
                    var coordX = canvasCoords.x;
                    var coordY = canvasCoords.y;

//                    if (LOG) console.log("%c" + canvasCoords, "background: gray");

                    var targetObject = getObjectContaining(canvasCoords);

//                    if (LOG) console.log("targetObject: ");
//                    if (LOG) console.log(targetObject);



                    if (LOG) console.log("%ctargetObject:", "background:red; color: white;");
                    if (LOG) console.log(targetObject);


                    if (targetObject) {

                        if (targetObject !== ySlider) {

                            if (targetObject.isImage) {

                                // removing the last connector added when the widget was down clicked 
                                var connector = ySlider.outConnectors.pop();
                                connector.contract();

                            } else {

                                if (targetObject.isOutput) {

                                    if (LOG) console.log("%c HERE !!!!", "background: red; color: white;");
                                    // if the mouse up event happens over an existing output                                
                                    var connector = getLastElementOfArray(ySlider.outConnectors);
                                    connector.setDestination(targetObject, true);

                                } else if (targetObject.isOperator || targetObject.isVisualProperty) {
                                    var operator = targetObject;
                                    canvas.bringToFront(operator);
                                    var connector = getLastElementOfArray(ySlider.outConnectors);
                                    connector.setDestination(operator, true);
                                }

                            }

                        } else {

                            var connector = ySlider.outConnectors.pop();
                            connector.remove();

                        }

                    } else {

                        var connector = ySlider.outConnectors.pop();
                        connector.contract();
                        fabric.util.removeFromArray(ySlider.outConnectors, connector);

                        // The mouse up event is done over a blank section of the canvas
//                        var lastAddedConnector = getLastElementOfArray(ySlider.outConnectors);
//                        var options = {
//                            left: coordX,
//                            top: coordY,
//                            fill: ySlider.fill,
//                            stroke: ySlider.stroke,
//                            area: lastAddedConnector.value,
//                            label: '' + ySlider.value
//                        };
//                        addOutputToCanvas(lastAddedConnector, CIRCULAR_OUTPUT, options);

                    }
                }

            } else {
                // removing the last connector added when the widget was down clicked 
                var connector = ySlider.outConnectors.pop();
                canvas.remove(connector);
            }

            ySlider.moving = false;





        });


        ySlider.on('moving', function (option) {

//         if (LOG) console.log("ySlider being moved");
            ySlider.moving = true;
            var theEvent = option;
            theEvent = option.e;

            if (theEvent) {
                var canvasCoords = getCanvasCoordinates(theEvent);
                var coordX = canvasCoords.x;
                var coordY = canvasCoords.y;

                var lastAddedConnector = getLastElementOfArray(ySlider.outConnectors);
                lastAddedConnector.set({x2: coordX, y2: coordY});
                canvas.renderAll();
            }
        });

        ySlider.on('pressed', function (option) {
            if (LOG) console.log("ySlider pressed");
        });











        var xSliderLeft = topLeft.x + 2;
        var xSliderTop = bottomRigth.y + this.axisOffset - 1.5;
        var xSlider = new fabric.Circle({
            figureType: 'functionSlider',
            originX: 'center',
            originY: 'center',
            radius: 20,
            left: xSliderLeft,
            top: xSliderTop,
            fill: rgb(226, 75, 44),
            stroke: darkenrgb(226, 75, 44),
            strokeWidth: '3',
            perPixelTargetFind: true,
            lockMovementY: true,
            hasControls: false,
            hasBorders: false,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            // Properties for spatial location
            parentObject: this,
            untransformedScaleX: 1,
            untransformedScaleY: 1,
            untransformedAngle: 0,
            isClickable: true,
            outConnectors: new Array(),
            inConnectors: new Array(),
            isContinuousFunctionInput: true,
        });

        xSlider.untransformedX = -xSlider.radius + 0.5;




//      if (LOG) console.log("%cxSlider.untransformedX", "background: aqua; color: red;");
//      if (LOG) console.log(xSlider.untransformedX);

        xSlider.untransformedY = xSliderTop - topLeft.y - xSlider.height / 2 - 1.5;

//        if (LOG) console.log("%cxSlider.untransformedX", "background: aqua; color: red;");
//        if (LOG) console.log(xSlider.untransformedX);
//        
//        if (LOG) console.log("%cxSlider.untransformedY", "background: aqua; color: red;");
//        if (LOG) console.log(xSlider.untransformedY);


        var originalUntransformedY = xSlider.untransformedY;

        xSlider._render = function (ctx) {

            ctx.save();

            // We don't want transparency effects on the slider, so that the different drawing parts that compose it do not are revealed (as they do not look good).
            ctx.globalAlpha = 1;
            ctx.lineWidth = 8;
            ctx.fillStyle = this.stroke;

            // Horizontal rectangle connecting the arrows
            ctx.beginPath();
            ctx.rect(-25, -5, 50, 10);
            ctx.fill();

            // Drawing the arrows
            var distance = this.radius + 21;
            var arrow = [[-4, 0], [-17, -10], [-17, 10]];
            drawFilledPolygon(translateShape(rotateShape(arrow, 0), distance, 0), ctx);
            drawFilledPolygon(translateShape(rotateShape(arrow, Math.PI), -distance, 0), ctx);

            ctx.fillStyle = this.fill;
            ctx.lineWidth = this.strokeWidth;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.font = "25px Arial";
            ctx.fillStyle = "#f5ebe9";
            ctx.fillText("X", -8.4, 9.2);
            ctx.closePath();

            ctx.restore();

        };


        xSlider.blink = function () {
            var increment = 0.45;
            var duration = 100;
            var easing = fabric.util.ease['easeInCubic'];

            this.animate('scaleX', '+=' + increment, {
                duration: duration,
                onChange: canvas.renderAll.bind(canvas),
                easing: easing,
                operator: this,
                onComplete: function () {
                    if (LOG) console.log(this);
                    if (LOG) console.log(self);
                    this.operator.animate('scaleX', '-=' + increment, {
                        duration: 1100,
                        onChange: canvas.renderAll.bind(canvas),
                        easing: fabric.util.ease['easeOutElastic']
                    });
                }
            });
            this.animate('scaleY', '+=' + increment, {
                duration: duration,
                onChange: canvas.renderAll.bind(canvas),
                easing: easing,
                operator: this,
                onComplete: function () {
                    this.operator.animate('scaleY', '-=' + increment, {
                        duration: 1100,
                        onChange: canvas.renderAll.bind(canvas),
                        easing: fabric.util.ease['easeOutElastic']
                    });
                }
            });
        };

        xSlider.on('inValueUpdated', function (options) {

            if (LOG) console.log("inValueUpdated");

            var inConnection = options.inConnection;
            var markAsSelected = options.markAsSelected;
            var shouldAnimate = options.shouldAnimate;

            xSlider.parentObject.setX(inConnection.value, shouldAnimate);

            xSlider.outConnectors.forEach(function (outConnector) {
                outConnector.setValue(inConnection.value, false, shouldAnimate);
            });

        });



        xSlider.on('newInConnection', function (options) {

            // Removing existing in-connections for this slider
            if (xSlider.inConnectors.length > 0) {
                var connector = xSlider.inConnectors.pop();
                connector.contract();
            }

            var newInConnection = options.newInConnection;
            var shouldAnimate = options.shouldAnimate;

            if (LOG) console.log("newInConnection:");
            if (LOG) console.log(newInConnection);

            if (LOG) console.log("%c newInConnection " + shouldAnimate, "background:pink; color: black;");

            xSlider.inConnectors.push(newInConnection);

            xSlider.blink();

            if (LOG) console.log("%cNew IN connection detected in this operator", "background:green");
            if (LOG) console.log("%cThe input value is " + newInConnection.value, "background:yellow");
            if (LOG) console.log("newInConnection:");
            if (LOG) console.log(newInConnection);

            xSlider.parentObject.setX(newInConnection.value, shouldAnimate);

        });


        xSlider.on('mouseup', function (option) {

//            if (LOG) console.log("Mouse UP over the ySlider of a function");

            if (xSlider.moving) {

                var theEvent = option.e;

                if (theEvent) {

//                    if (LOG) console.log(theEvent);

                    var canvasCoords = getCanvasCoordinates(theEvent);
                    var coordX = canvasCoords.x;
                    var coordY = canvasCoords.y;

//                    if (LOG) console.log("%c" + canvasCoords, "background: gray");

                    var targetObject = getObjectContaining(canvasCoords);

//                    if (LOG) console.log("targetObject: ");
//                    if (LOG) console.log(targetObject);



                    if (LOG) console.log("%ctargetObject:", "background:red; color: white;");
                    if (LOG) console.log(targetObject);


                    if (targetObject) {

                        if (targetObject !== xSlider) {

                            if (targetObject.isImage) {

                                // removing the last connector added when the widget was down clicked 
                                var connector = xSlider.outConnectors.pop();
                                connector.contract();

                            } else {

                                if (targetObject.isOutput) {

                                    if (LOG) console.log("%c HERE !!!!", "background: red; color: white;");
                                    // if the mouse up event happens over an existing output                                
                                    var connector = getLastElementOfArray(xSlider.outConnectors);
                                    connector.setDestination(targetObject, true);

                                } else if (targetObject.isOperator || targetObject.isVisualProperty || targetObject.isContinuousFunctionInput) {
                                    canvas.bringToFront(targetObject);
                                    var connector = getLastElementOfArray(xSlider.outConnectors);
                                    connector.setDestination(targetObject, true);
                                }

                            }

                        } else {

                            var connector = xSlider.outConnectors.pop();
                            connector.remove();

                        }

                    } else {

                        var connector = xSlider.outConnectors.pop();
                        if (connector) {

                            connector.contract();
                            fabric.util.removeFromArray(xSlider.outConnectors, connector);

                            // The mouse up event is done over a blank section of the canvas
//                        var lastAddedConnector = getLastElementOfArray(ySlider.outConnectors);
//                        var options = {
//                            left: coordX,
//                            top: coordY,
//                            fill: ySlider.fill,
//                            stroke: ySlider.stroke,
//                            area: lastAddedConnector.value,
//                            label: '' + ySlider.value
//                        };
//                        addOutputToCanvas(lastAddedConnector, CIRCULAR_OUTPUT, options);

                        }


                    }
                }

            }

            xSlider.lockMovementX = false;
            xSlider.moving = false;


        });

//      xSlider.on('mouseup', function (option) {
////            if (LOG) console.log("%cMouse up on a slider: ", "background: red");
//         xSlider.lockMovementX = false;
//      });

        xSlider.on('pressed', function (option) {

            xSlider.lockMovementX = true;
            xSlider.lockMovementY = true;

            xSlider.blink();


            canvasDeselectAllObjects();

            if (LOG) console.log("typeof xSlider.value:");
            if (LOG) console.log(typeof xSlider.value);

            var newConnector = new Connector({source: xSlider, x2: xSlider.left, y2: xSlider.top, arrowColor: xSlider.stroke, filledArrow: true, value: xSlider.value});
            newConnector.widget = xSlider;
            xSlider.outConnectors.push(newConnector);

            canvas.add(newConnector);

        });



        xSlider.on('moving', function (option) {

            var theEvent = option.e;

            if (theEvent) {


                if (xSlider.lockMovementX && xSlider.lockMovementY) {


                    if (LOG) console.log("xSlider being moved");
                    xSlider.moving = true;
                    var theEvent = option.e;

                    if (theEvent) {
                        var canvasCoords = getCanvasCoordinates(theEvent);
                        var coordX = canvasCoords.x;
                        var coordY = canvasCoords.y;

                        var lastAddedConnector = getLastElementOfArray(xSlider.outConnectors);

                        if (lastAddedConnector) {
                            lastAddedConnector.set({x2: coordX, y2: coordY});
                        }


                    }



                } else {

                    // If someone is manipulating the xSlider, its in-connectors should be removed
                    xSlider.inConnectors.forEach(function (connector) {
                        connector.contract();
                    });

//            canvas.renderAll();

//                if (LOG) console.log("Moving slider");
//                if (LOG) console.log(theEvent);

                    var topLeft = xSlider.parentObject.getPointByOrigin('left', 'top');
                    var bottomRigth = xSlider.parentObject.getPointByOrigin('right', 'bottom');

//                var bottomLeft = xSlider.parentObject.getPointByOrigin('left', 'bottom');
//                drawRectAt(topLeft, "red");

                    var p = new fabric.Point(topLeft.x + 2 * xSlider.parentObject.scaleX, topLeft.y + ((xSlider.parentObject.height + xSlider.parentObject.axisOffset) * xSlider.parentObject.scaleY));
//                drawRectAt(p, "blue");

                    var rotatedP = fabric.util.rotatePoint(p, topLeft, fabric.util.degreesToRadians(xSlider.parentObject.angle));


//                drawRectAt(rotatedP, "green");

//                if (LOG) console.log("%clocalPointer: ", "background: aqua");
//                if (LOG) console.log(localPointer);
//                if (LOG) console.log("%cdiff: ", "background: yellow");
//                if (LOG) console.log(diff);

                    var canvasCoords = getCanvasCoordinates(theEvent);

                    var localPointer = xSlider.getLocalPointer(theEvent);





//                drawRectAt(localPointer, "red");
//                var rotated = fabric.util.rotatePoint(new fabric.Point(canvasCoords.x, canvasCoords.y), bottomLeft, fabric.util.radiansToDegrees(360 + xSlider.parentObject.angle));                
//                drawRectAt(rotated, "blue");



//                if (LOG) console.log("%ccanvasCoords: ", "background: aqua");
//                if (LOG) console.log(canvasCoords);
//
//                if (LOG) console.log("%ccenteredX: ", "background: lightblue");
//                if (LOG) console.log(centeredX);
//
//                if (LOG) console.log("%cleft: ", "background: lightpurple");
//                if (LOG) console.log(topLeft.x);

                    var circleCenter = xSlider.getCenterPoint();

//                if (LOG) console.log("%ccircleCenter: ", "background: lightpink");
//                if (LOG) console.log(circleCenter);

//                if (centeredX <= topLeft.x - 1 || centeredX >= bottomRigth.x - 1) {
//                if (centeredX <= topLeft.x - 1 || centeredX >= bottomRigth.x - 1) {
//                if (canvasCoords.x + diff <= topLeft.x || canvasCoords.x >= bottomRigth.x) {
//                if (circleCenter.x <= topLeft.x || circleCenter.x >= bottomRigth.x) {
//                    xSlider.lockMovementX = true;
//                }



//            if (LOG) console.log("this.parentObject.xCoordinate:");
//            if (LOG) console.log(this.parentObject.xCoordinate);



//                if (circleCenter.x <= topLeft.x) {
                    if (circleCenter.x <= rotatedP.x) {
                        xSlider.lockMovementX = true;

                        xSlider.left = rotatedP.x;




//                    xSlider.left = topLeft.x + 2;
                    } else {
                        xSlider.lockMovementX = false;
                    }

                    if (circleCenter.x >= bottomRigth.x) {
                        xSlider.lockMovementX = true;
                        xSlider.left = bottomRigth.x - 3;
                    } else {
                        xSlider.lockMovementX = false;
                    }





//                if (LOG) console.log("%coption: ", "background: aqua");
//                if (LOG) console.log(option);

                    computeUntransformedProperties(xSlider);
                    xSlider.untransformedY = originalUntransformedY;
                    repositionWidget(xSlider.parentObject, xSlider);


                    if (LOG) console.log("xSlider.value:");
                    if (LOG) console.log(xSlider.value);

                    xSlider.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(xSlider.value, false, false);
                    });


                    this.parentObject.updateOutputValue(false);





                }


            }


        });




        if (options.animateOnCreation) {
            setTimeout(function () {
                xSlider.parentObject.animateXSlider(originalUntransformedY, topLeft.x + xSlider.parentObject.width / 2 + 2);
            }, 150);
        } else {
            computeUntransformedProperties(xSlider);
            xSlider.untransformedY = originalUntransformedY;
            xSlider.parentObject.set('evented', true);
            canvas.setActiveObject(xSlider.parentObject);
            canvas.renderAll.bind(canvas);
            canvas.renderAll(canvas);
        }










        this.set('curvePoints', curvePoints);


//        if (LOG) console.log("%ccurvePoints", "background: aqua");
//        if (LOG) console.log(curvePoints);




        this.set('minX', minX);
        this.set('maxX', maxX);
        this.set('minY', minY);
        this.set('maxY', maxY);
        this.set('xSlider', xSlider);
        this.set('ySlider', ySlider);











//        if (fabric.isTouchSupported) {
//            this.set('hasBorders', false);
//            this.set('hasControls', false);
//        } else {
//            this.setControlsVisibility({
//                mt: false, // middle top disabled
//                mb: false, // midle bottom disabled
//                ml: false, // middle left disabled
//                mr: false, // middle right disabled
//            });
//        }



        canvas.add(minX);
        canvas.add(maxX);
        canvas.add(minY);
        canvas.add(maxY);
        canvas.add(ySlider);
        canvas.add(xSlider);


        setTimeout(function () {
            xSlider.bringToFront();
            ySlider.bringToFront();
            minX.bringToFront();
            maxX.bringToFront();
            minY.bringToFront();
            maxY.bringToFront();
        }, 100);

        this.widgets.push(minX);
        this.widgets.push(maxX);
        this.widgets.push(minY);
        this.widgets.push(maxY);
        this.widgets.push(xSlider);
        this.widgets.push(ySlider);

        this.on('moving', function (option) {
            objectMoving(option, this);
            this.ySlider.trigger('moving');
            this.xSlider.trigger('moving');
        });
        this.on('rotating', function (option) {
            objectMoving(option, this);
            this.ySlider.trigger('moving');
            this.xSlider.trigger('moving');
        });
        this.on('scaling', function (option) {
            objectMoving(option, this);
            this.ySlider.trigger('moving');
            this.xSlider.trigger('moving');
        });



    },
    setX: function (xValue, shouldAnimate) {

        if (LOG) console.log("Fcuntion setX");

        var theContinuousFunction = this;
        var xSlider = theContinuousFunction.xSlider;

        /*if (LOG) console.log("Moving to value: " + xValue);*/

        var absoluteValue = theContinuousFunction.computeAbsoluteValue(xValue, theContinuousFunction.absoluteMaxX, theContinuousFunction.minX.text, theContinuousFunction.maxX.text);
        var newUntransformedX = absoluteValue - xSlider.radius + 2;

        if (shouldAnimate) {

            var easing = fabric.util.ease.easeOutBack;
            var duration = 700;

            fabric.util.animate({
                startValue: xSlider.untransformedX,
                endValue: newUntransformedX,
                duration: duration,
                easing: easing,
                onChange: function (value) {

                    if (LOG) console.log(value);

                    xSlider.untransformedX = value;
                    repositionWidget(theContinuousFunction, xSlider);
                    theContinuousFunction.updateOutputValue(false);

                    /*xSlider.inConnectors.forEach(function (inConnector) {
                     inConnector.set({'x2': xSlider.left, 'y2': xSlider.top});
                     });*/

                    xSlider.trigger('moving');

                }
            });

        } else {

            xSlider.untransformedX = newUntransformedX;
            repositionWidget(theContinuousFunction, xSlider);
            theContinuousFunction.updateOutputValue(false);
            xSlider.trigger('moving');

        }

    },
    animateXSlider: function (originalUntransformedY, xValue) {

        var theContinuousFunction = this;

        var easing = fabric.util.ease.easeOutBack;
        var xSlider = this.xSlider;
        var ySlider = this.ySlider;
        xSlider.animate('left', xValue, {
            onChange: function () {
                canvas.renderAll.bind(canvas);
                canvas.renderAll(canvas);
                computeUntransformedProperties(xSlider);
                xSlider.untransformedY = originalUntransformedY;
                xSlider.trigger('moving');
            },
            duration: xValue * 2,
            onComplete: function () {
                computeUntransformedProperties(xSlider);
                xSlider.untransformedY = originalUntransformedY;
                xSlider.parentObject.set('evented', true);
                canvas.setActiveObject(xSlider.parentObject);
                canvas.renderAll.bind(canvas);
                canvas.renderAll(canvas);
                ySlider.moving = false;




                /*var absoluteOf50 = theContinuousFunction.computeAbsoluteValue(50, theContinuousFunction.absoluteMaxX, theContinuousFunction.minX.text, theContinuousFunction.maxX.text);
                 var newUntransformedX = absoluteOf50 - theContinuousFunction.xSlider.radius + 2;
                 alert("absolute of 50: " + absoluteOf50 + "\n xSlider.untransformedX: " + xSlider.untransformedX + "\n newUntransformedX: " + newUntransformedX);*/



            },
            easing: easing
        });
    },
    _render: function (ctx) {

        ctx.save();

        var d = this.maxY.width > this.minY.width ? this.maxY.width : this.minY.width;
        var globalX = -this.width / 2 - this.yValueOffset - d - 30;
        var globalY = -this.height / 2 - this.maxY.height + 5;
        var globalWidth = this.width + this.yValueOffset + d + 30 + this.maxX.width / 2 + 30;
        var globalHeight = this.height + this.maxX.height / 2 + this.xValueOffset + 55;

//      ctx.fillStyle = "#FFFFFF";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(globalX, globalY, globalWidth, globalHeight);

        var topLeft = this.getPointByOrigin('left', 'top');


        // Path encircling rectangle
        ctx.beginPath();
//        ctx.strokeStyle = "#CDCDCD";
        ctx.strokeStyle = "#e8e5e2";
        ctx.lineWidth = 1;
        ctx.rect(-this.width / 2 - 5, -this.height / 2 - 5, this.width + 10, this.height + 10);
        ctx.stroke();
        ctx.closePath();

        // the path itself is going to be drawn now
        ctx.beginPath();
        ctx.strokeStyle = this.stroke;
        ctx.lineWidth = this.strokeWidth;
        this.callSuper('_render', ctx);
        ctx.stroke(); // finishing the path drawing process


        // Horizontal axis
        var x1 = -this.width / 2;
//        if (LOG) console.log("%cx1: " + x1, "background: purple; color:white;");


        var y1 = this.height / 2 + this.axisOffset;
        var x2 = this.width / 2;

        ctx.beginPath();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
//        ctx.stroke();

        // Vertical axis

        x1 = -this.width / 2 - this.axisOffset;
        y1 = this.height / 2 - 3;
        var y2 = -this.height / 2 - 3;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.stroke();
        ctx.closePath();

        var diff = topLeft.x - this.xSlider.left + this.width / 2;

        x1 = 0 - diff;
        y1 = this.height / 2 + this.axisOffset;

        var absoluteXValue = this.xSlider.untransformedX + this.xSlider.radius;

//      if (LOG) console.log("%cabsoluteXValue", "background: aqua");
//      if (LOG) console.log(absoluteXValue);



//        if (LOG) console.log("%cthis.getCenterPoint(): ", "background: red; color:white;");
//        if (LOG) console.log(this.getCenterPoint());
//        
//        if (LOG) console.log("%cthis.xSlider.getCenterPoint(): ", "background: purple; color:white;");
//        if (LOG) console.log(this.xSlider.getCenterPoint());
//        



        for (var i = 1; i < this.curvePoints.length; i++) {

            var startX = this.curvePoints[i - 1].x;
            var endX = this.curvePoints[i].x;

            if (absoluteXValue >= startX && absoluteXValue <= endX) {

//                if (LOG) console.log("%cxVlue found in range:", "background: green; color:white;");


                var startY = this.curvePoints[i - 1].y;
                var endY = this.curvePoints[i].y;

                var line1 = {x1: startX, y1: startY, x2: endX, y2: endY};
                var line2 = {x1: absoluteXValue, y1: 0, x2: absoluteXValue, y2: this.height + this.axisOffset};

//                if (LOG) console.log("%cChecking intersection between the lines:", "background: yellow");
//                if (LOG) console.log(line1);
//                if (LOG) console.log(line2);

                var intersection = getIntersection(line1, line2);

//            if (LOG) console.log("%cThe intersection witht the curve is:", "background: yellow; color: blue;");
//            if (LOG) console.log(intersection);

                if (intersection) {

                    y2 = y1 - intersection.y - this.axisOffset + 1.5;

//                    ctx.strokeStyle = "#000000";
                    ctx.strokeStyle = "#c8c2bb";
                    ctx.lineWidth = 1;
                    ctx.setLineDash([11, 5]);

                    // Horizontal dashed line
                    x1 = -this.width / 2 - this.axisOffset;
                    x2 = x1 + intersection.x + this.axisOffset;
                    ctx.beginPath();
                    ctx.moveTo(x1, y2);
                    ctx.lineTo(x2, y2);

                    // The position of the ySlider should be adjusted properly according to the current xSlider's position
                    this.ySlider.untransformedX = this.ySlider.originalUntransformedX;
                    this.ySlider.untransformedY = y2 + this.height / 2 - this.ySlider.radius;
                    repositionWidget(this, this.ySlider);
//                    this.ySlider.trigger('moving');

                    // Vertical dashed line
                    ctx.moveTo(x2, y2 + intersection.y + this.axisOffset);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                    ctx.closePath();

                    // little circle over the function path
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = 2;
                    ctx.setLineDash([]);
                    ctx.fillStyle = rgb(246, 157, 52);
                    ctx.strokeStyle = darkenrgb(246, 157, 52);
                    ctx.beginPath();
                    ctx.arc(x2, y2 + 1.5, 7, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.font = "20px Arial";
                    ctx.fillStyle = rgb(42, 63, 136);

                    var xCoordinate = parseFloat(intersection.x - 1);
                    var yCoordinate = parseFloat(intersection.y - 1.5);

                    this.xCoordinate = xCoordinate;
                    this.yCoordinate = yCoordinate;

                    var decimalPositions = 2;
                    if (!this.allowDecimals) {
                        decimalPositions = 0;
                    }

                    var relativeX = parseFloat(this.computeRelativeValue(xCoordinate, this.absoluteMaxX, this.minX.text, this.maxX.text).toFixed(decimalPositions));
//                    if (LOG) console.log("%crelativeX", "background: aqua");
//                    if (LOG) console.log(relativeX);

                    var relativeY = parseFloat(this.computeRelativeValue(yCoordinate, this.absoluteMaxY, this.minY.text, this.maxY.text).toFixed(decimalPositions));
//                    if (LOG) console.log("%crelativeY", "background: aqua");
//                    if (LOG) console.log(relativeY);





                    if (this.ySlider.value != relativeY) {
                        this.ySlider.value = relativeY;
                        this.ySlider.trigger('moving');
                        this.updateOutputValue(false);
                    }

                    if (this.xSlider.value != relativeX) {
                        this.xSlider.value = relativeX;
                    }

                    if (!isNaN(relativeX) && !isNaN(relativeY)) {
                        ctx.fillText("(" + relativeX + " , " + relativeY + ")", x2 + 10, y2 + 6);
                    }
//                    ctx.fillText("(" + xCoordinate + "," + yCoordinate + ")", x2 + 10, y2 + 6);

                    var activeObject = canvas.getActiveObject();

                    if (this.selected || activeObject == this || activeObject == this.xSlider || activeObject == this.minX || activeObject == this.minY || activeObject == this.maxX || activeObject == this.maxY || activeObject == this.ySlider) {
                        ctx.strokeStyle = '#ffce0a';
                        ctx.globalAlpha = 1;
                        ctx.lineWidth = 3;
                        ctx.setLineDash([7, 7]);
                    } else {
                        ctx.strokeStyle = '#28282d';
                        ctx.globalAlpha = 1;
                        ctx.lineWidth = 1;
                        ctx.setLineDash([]);
                    }

                    ctx.beginPath();
                    ctx.rect(globalX, globalY, globalWidth, globalHeight);

                    ctx.closePath();
                    ctx.stroke();
                    ctx.beginPath();

                }

                break;

            }
        }

        ctx.restore();

    },
    updateOutputValue: function (shouldAnimate) {
        //        if (LOG) console.log("updateOutputValue");
        var theContinuousFunction = this;
        var outputValue = createNumericValue(theContinuousFunction.ySlider.value);
        theContinuousFunction.ySlider.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(outputValue, false, shouldAnimate);
        });
    },
    computeAbsoluteValue: function (relativeValue, absoluteMax, minInterval, maxInterval) {

        var min = parseInt(minInterval);
        var max = parseInt(maxInterval);

        return (parseInt(absoluteMax) * (relativeValue - min)) / (max - min);

    },
    computeRelativeValue: function (absoluteValue, absoluteMax, minInterval, maxInterval) {

//        if (LOG) console.log("absoluteValue");
//        if (LOG) console.log(absoluteValue);
//        if (LOG) console.log("absoluteMax");
//        if (LOG) console.log(absoluteMax);
//        if (LOG) console.log("minInterval");
//        if (LOG) console.log(minInterval);
//        if (LOG) console.log("maxInterval");
//        if (LOG) console.log(maxInterval);

        var min = parseInt(minInterval);
        var max = parseInt(maxInterval);

        return min + ((max - min) * (parseInt(absoluteValue) / parseInt(absoluteMax)));
    },
    remove: function () {
        this.minX.remove();
        this.maxX.remove();
        this.minY.remove();
        this.maxY.remove();
        this.xSlider.remove();
        this.ySlider.remove();
        this.callSuper('remove');
    },
    applySelectedStyle: function () {
        this.selected = true;
    },
    applyUnselectedStyle: function () {
        this.selected = false;
    }
});





function sinX(minX, maxX, xScale, yScale, left, top) {

    var generatedPoints = new Array();

    for (var i = minX; i <= maxX; i = i + 0.1) {
        var x = i * xScale;
        var y = Math.sin(i) * yScale;
        generatedPoints.push({x: x, y: y});
    }

    var xValues = new Array();
    generatedPoints.forEach(function (point) {
        xValues.push(point.x);
    });
    var minGeneratedX = Math.min.apply(Math, xValues);
    var maxGeneratedX = Math.max.apply(Math, xValues);


    var yValues = new Array();
    generatedPoints.forEach(function (point) {
        yValues.push(point.y);
    });
    var maxGeneratedY = Math.max.apply(Math, yValues);
    var minGeneratedY = Math.min.apply(Math, yValues);


    var curveWidth = (maxGeneratedX - minGeneratedX + 3);
    var curveHeight = (maxGeneratedY - minGeneratedY + 3);

    var bottomLeftPoint = new fabric.Point(left - curveWidth / 2, top + curveHeight / 2);


//    if (LOG) console.log("%ctopLeftPoint:", "background: green; foreground: white");
//    if (LOG) console.log(topLeftPoint);
//    drawRectAt(topLeftPoint, "green");
//    drawRectAt(bottomLeftPoint, "purple");
//    if (LOG) console.log("generatedPoints:");
//    
//    if (LOG) console.log("minGeneratedY:");
//    if (LOG) console.log(minGeneratedY);

    generatedPoints.forEach(function (point) {
        point.x = point.x - minGeneratedX;
        point.y = bottomLeftPoint.y - (point.y - minGeneratedY);
//        if (LOG) console.log(point);
    });

    var stringPath = "M " + generatedPoints[0].x + " " + (generatedPoints[0].y);
    for (var i = 1; i < generatedPoints.length; i++) {
        stringPath += " L " + generatedPoints[i].x + " " + generatedPoints[i].y;
    }

//    if (LOG) console.log("%cstringPath", "background: aqua");
//    if (LOG) console.log(stringPath);

    var aContinuousFunction = new ContinuousFunction(stringPath, {
        left: left,
        top: top,
        minX: 0,
        minY: -1,
        maxX: 100,
        maxY: 1,
        allowDecimals: true,
        animateOnCreation: true // remove eventually
//        scaleX: 0.2,
//        scaleY: 0.2
    });

    canvas.add(aContinuousFunction);

    canvas.bringToFront(aContinuousFunction.xSlider);
    canvas.bringToFront(aContinuousFunction.ySlider);
    canvas.renderAll();



}

function logX(minX, maxX, xScale, yScale, left, top) {

    var generatedPoints = new Array();

    for (var i = minX; i <= maxX; i = i + 0.1) {
        var x = i * xScale;
        var y = Math.log(i) * yScale;
        generatedPoints.push({x: x, y: y});
    }

    var xValues = new Array();
    generatedPoints.forEach(function (point) {
        xValues.push(point.x);
    });
    var minGeneratedX = Math.min.apply(Math, xValues);
    var maxGeneratedX = Math.max.apply(Math, xValues);


    var yValues = new Array();
    generatedPoints.forEach(function (point) {
        yValues.push(point.y);
    });
    var maxGeneratedY = Math.max.apply(Math, yValues);
    var minGeneratedY = Math.min.apply(Math, yValues);


    var curveWidth = (maxGeneratedX - minGeneratedX + 3);
    var curveHeight = (maxGeneratedY - minGeneratedY + 3);

    var bottomLeftPoint = new fabric.Point(left - curveWidth / 2, top + curveHeight / 2);


//    if (LOG) console.log("%ctopLeftPoint:", "background: green; foreground: white");
//    if (LOG) console.log(topLeftPoint);
//    drawRectAt(topLeftPoint, "green");
//    drawRectAt(bottomLeftPoint, "purple");
//    if (LOG) console.log("generatedPoints:");
//    
//    if (LOG) console.log("minGeneratedY:");
//    if (LOG) console.log(minGeneratedY);

    generatedPoints.forEach(function (point) {
        point.x = point.x - minGeneratedX;
        point.y = bottomLeftPoint.y - (point.y - minGeneratedY);
//        if (LOG) console.log(point);
    });

    var stringPath = "M " + generatedPoints[0].x + " " + (generatedPoints[0].y);
    for (var i = 1; i < generatedPoints.length; i++) {
        stringPath += " L " + generatedPoints[i].x + " " + generatedPoints[i].y;
    }

//    if (LOG) console.log("%cstringPath", "background: aqua");
//    if (LOG) console.log(stringPath);

    var aContinuousFunction = new ContinuousFunction(stringPath, {
        left: left,
        top: top,
        minX: 0,
        minY: -100,
        maxX: 100,
        maxY: 1,
        allowDecimals: true,
        animateOnCreation: true // remove eventually
//        scaleX: 0.2,
//        scaleY: 0.2
    });

    canvas.add(aContinuousFunction);

    canvas.bringToFront(aContinuousFunction.xSlider);
    canvas.bringToFront(aContinuousFunction.ySlider);
    canvas.renderAll();



}

function xSquared(left, top) {
    powerContinuousFunction(2, -25, 25, 8, 0.64, left, top);
}

function xLineal(left, top) {
//    powerContinuousFunction(1, 0, 5, 100, 100, left, top);
    powerContinuousFunction(1, -10, 10, 20, 20, left, top);
}

function xToPower3(left, top) {
    powerContinuousFunction(3, -13.5, 13.5, 12, 0.11, left, top);
//    powerContinuousFunction(3, -10, 14, 10, 0.11, left, top);
}

function powerContinuousFunction(power, minX, maxX, xScale, yScale, left, top) {

    var generatedPoints = new Array();

    for (var i = minX; i <= maxX; i++) {
        var x = i * xScale;
        var y = Math.pow(i, power) * yScale;
        generatedPoints.push({x: x, y: y});
    }

    var xValues = new Array();
    generatedPoints.forEach(function (point) {
        xValues.push(point.x);
    });
    var minGeneratedX = Math.min.apply(Math, xValues);
    var maxGeneratedX = Math.max.apply(Math, xValues);


    var yValues = new Array();
    generatedPoints.forEach(function (point) {
        yValues.push(point.y);
    });
    var maxGeneratedY = Math.max.apply(Math, yValues);
    var minGeneratedY = Math.min.apply(Math, yValues);


    var curveWidth = (maxGeneratedX - minGeneratedX + 3);
    var curveHeight = (maxGeneratedY - minGeneratedY + 3);

    var bottomLeftPoint = new fabric.Point(left - curveWidth / 2, top + curveHeight / 2);


//    if (LOG) console.log("%ctopLeftPoint:", "background: green; foreground: white");
//    if (LOG) console.log(topLeftPoint);
//    drawRectAt(topLeftPoint, "green");
//    drawRectAt(bottomLeftPoint, "purple");
//    if (LOG) console.log("generatedPoints:");
//    
//   if (LOG) console.log("minGeneratedY:");
//   if (LOG) console.log(minGeneratedY);

    generatedPoints.forEach(function (point) {
        point.x = point.x - minGeneratedX;
        point.y = bottomLeftPoint.y - (point.y - minGeneratedY);
//      if (LOG) console.log(point);
    });

    var stringPath = "M " + generatedPoints[0].x + " " + (generatedPoints[0].y);
    for (var i = 1; i < generatedPoints.length; i++) {
        stringPath += " L " + generatedPoints[i].x + " " + generatedPoints[i].y;
    }

//   if (LOG) console.log("%cstringPath", "background: aqua");
//   if (LOG) console.log(stringPath);

    var aContinuousFunction = new ContinuousFunction(stringPath, {
        left: left,
        top: top,
        minX: 0,
        minY: 0,
        maxX: 100,
        maxY: 100,
        animateOnCreation: true // remove eventually
    });

    canvas.add(aContinuousFunction);

    canvas.bringToFront(aContinuousFunction.xSlider);
    canvas.bringToFront(aContinuousFunction.ySlider);
    canvas.renderAll();

}