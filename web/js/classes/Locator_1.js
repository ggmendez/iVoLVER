//var Locator = fabric.util.createClass(fabric.Circle, {
//    type: 'Locator',
//    iVoLVERClass: 'locator',
//    isLocator: true,
//    setXmlIDs: function (from) {
//        var theLocator = this;
//        theLocator.xmlID = from++;
//        theLocator.xAxisArrow.xmlID = from++;
//        theLocator.yAxisArrow.xmlID = from++;
//        return from;
//    },
//    toXML: function () {
//
//        var theLocator = this;
//        var locatorNode = createXMLElement("locator");
//
//        addAttributeWithValue(locatorNode, "xmlID", theLocator.xmlID);
//
//        appendElementWithValue(locatorNode, "left", theLocator.left);
//        appendElementWithValue(locatorNode, "top", theLocator.top);
//        appendElementWithValue(locatorNode, "isExpanded", !theLocator.isCompressed);
//
//        var marksNode = createXMLElement("marks");
//        addAttributeWithValue(marksNode, "type", "array");
//
//        theLocator.widgets.forEach(function (widget) {
//            if (widget.isMark) {
//                appendElementWithValue(marksNode, "markXmlID", widget.xmlID);
//            }
//        });
//        locatorNode.append(marksNode);
//
//        if (theLocator.selectedMark) {
//            addAttributeWithValue(locatorNode, "selectedMarkXmlID", theLocator.selectedMark.xmlID);
//        }
//
//        return locatorNode;
//
//    },
//    onNewInConnection: function (options, theVisualProperty) {
//
//        var theLocator = this;
//
//
//        var newInConnection = options.newInConnection;
//        var shouldAnimate = options.shouldAnimate;
//
//        var source = newInConnection.source;
////            source.typeIcon.bringToFront();
//        bringToFront(source.typeIcon);
//
//        var targetAttribute = newInConnection.destination.attribute;
//        var incommingValue = newInConnection.value;
//
//        if (theVisualProperty.inConnectors.length > 0) {
//            var connector = theVisualProperty.inConnectors.pop();
//            connector.contract();
//        }
//
//        if (LOG) {
//            console.log("FFF incommingValue:");
//            console.log(incommingValue);
//        }
//
//        var property = "y";
//        if (theVisualProperty.isXValues) {
//            property = "x";
//        }
//
//        theLocator.setProperty(property, incommingValue, null, shouldAnimate);
//
//        theVisualProperty.inConnectors.push(newInConnection);
//
//        theVisualProperty.blink();
//
//        theVisualProperty.set('value', incommingValue);
//
//    },
//    addCollectiveCoordinatesProperties: function () {
//
//        var theLocator = this;
//
//        var xProperty = {attribute: "xCollection", readable: true, writable: true, types: ['number', 'object'], updatesTo: []};
//        var xVisualProperty = CreateVisualProperty(xProperty, this, 0, 0);
//        xVisualProperty.setCoords();
//        xVisualProperty.parentObject = this;
//        xVisualProperty.untransformedX = 0;
//        xVisualProperty.untransformedY = 0;
//        xVisualProperty.untransformedScaleX = 1;
//        xVisualProperty.untransformedScaleY = 1;
//        xVisualProperty.untransformedAngle = 0;
//        xVisualProperty.scaleX = 1;
//        xVisualProperty.scaleY = 1;
//        xVisualProperty.opacity = 1;
//        xVisualProperty.isLocatorValuesCollection = true;
//        xVisualProperty.isXValues = true;
//        theLocator.set('xAxisArrow', xVisualProperty);
//
//        var yProperty = {attribute: "yCollection", readable: true, writable: true, types: ['number', 'object'], updatesTo: []};
//        var yVisualProperty = CreateVisualProperty(yProperty, this, 0, 0);
//        yVisualProperty.setCoords();
//        yVisualProperty.parentObject = this;
//        yVisualProperty.untransformedX = 0;
//        yVisualProperty.untransformedY = 0;
//        yVisualProperty.untransformedScaleX = 1;
//        yVisualProperty.untransformedScaleY = 1;
//        yVisualProperty.untransformedAngle = 0;
//        yVisualProperty.scaleX = 1;
//        yVisualProperty.scaleY = 1;
//        yVisualProperty.opacity = 1;
//        yVisualProperty.isLocatorValuesCollection = true;
//        yVisualProperty.isYValues = true;
//        theLocator.set('yAxisArrow', yVisualProperty);
//
//        xVisualProperty.off('newInConnection');
//        yVisualProperty.off('newInConnection');
//
//        xVisualProperty.on({
//            'newInConnection': function (options) {
//                theLocator.onNewInConnection(options, xVisualProperty);
//            },
//        });
//        yVisualProperty.on({
//            'newInConnection': function (options) {
//                theLocator.onNewInConnection(options, yVisualProperty);
//            },
//        });
//
//        theLocator.widgets.push(theLocator.xAxisArrow);
//        theLocator.widgets.push(theLocator.yAxisArrow);
//
//    },
//    initialize: function (options) {
//        options || (options = {});
//
//        this.callSuper('initialize', options);
//
//        this.set('isLocator', true);
//        this.set('isCompressed', true);
//        this.set('inConnectors', new Array());
//        this.set('outConnectors', new Array());
//        this.set('widgets', new Array());
//        this.set('reportedMarks', 0);
//
//        // EXPERIMENT: Students should NOT have access to these collections
//        // this.addCollectiveCoordinatesProperties();
//
//        this.associateEvents();
//        this.setCoords();
//
//        addToConnectableElements(this);
//
//        if (this.xAxisArrow) {
//            addToConnectableElements(this.xAxisArrow);
//        }
//
//        if (this.yAxisArrow) {
//            addToConnectableElements(this.yAxisArrow);
//        }
//
//
//    },
//    executePendingConnections: function () {
//        var theLocator = this;
//        executePendingConnections(theLocator.xmlID);
//    },
//    reportMarkAvailable: function (mark) {
//
//        var theLocator = this;
//
//        if (LOG) {
//            console.log("%c" + "New MARK AVAILABLE (xmlID: " + mark.xmlID + ") for locator with xmlID " + theLocator.xmlID, "background: rgb(235,86,41); color: white;");
//        }
//
//        theLocator.addChild(mark, null, false, false, false);
//        theLocator.reportedMarks++;
//
//        if (mark.xmlID === theLocator.selectedMarkXmlID) {
//            theLocator.selectedMark = mark;
//        }
//
//        if (theLocator.reportedMarks === theLocator.marks.length) {
//            if (theLocator.shouldExpand) {
//                theLocator.expand(true);
//            }
//        }
//
//        mark.configurePositionVisualProperties();
//        repositionWidget(theLocator, mark.xVisualProperty);
//        repositionWidget(theLocator, mark.yVisualProperty);
//
//        this.executePendingConnections();
//
//    },
//    addChildren: function (marks) {
//        var theLocator = this;
//        marks.forEach(function (child) {
//            theLocator.addChild(child, null, false, false, false);
//        });
//    },
//    applySelectedStyle: function (selectConnectorsToo) {
//
//        if (LOG) {
//            console.log("this.selectedMark:");
//            console.log(this.selectedMark);
//        }
//
//        this.stroke = widget_selected_stroke_color;
//        this.strokeDashArray = widget_selected_stroke_dash_array;
//        if (selectConnectorsToo) {
//            this.inConnectors.forEach(function (inConnector) {
//                if (!inConnector.source.isLocator) {
//                    inConnector.applySelectedStyle(true, false);
//                } else {
//                    inConnector.source.applySelectedStyle(false);
//                    inConnector.applySelectedStyle(false, false);
//                }
//            });
//            this.outConnectors.forEach(function (outConnector) {
//                if (outConnector.destination && !outConnector.destination.isLocator) {
//                    outConnector.applySelectedStyle(false, true);
//                } else {
//                    outConnector.applySelectedStyle(false, false);
//                    if (outConnector.destination) {
//                        outConnector.destination.applySelectedStyle(false);
//                    }
//                }
//            });
//        }
//
//
//    },
//    applyUnselectedStyle: function () {
//
//        this.stroke = this.colorForStroke;
//        this.strokeDashArray = [];
//        this.inConnectors.forEach(function (inConnector) {
//
//            if (!inConnector.source.isLocator) {
//                inConnector.applyUnselectedStyle(true, false);
//            } else {
//                inConnector.applyUnselectedStyle(false, false);
//            }
//        });
//        this.outConnectors.forEach(function (outConnector) {
//            if (outConnector.destination && !outConnector.destination.isLocator) {
//                outConnector.applyUnselectedStyle(false, true);
//            } else {
//                outConnector.applyUnselectedStyle(false, false);
//            }
//        });
//    },
//    blink: function () {
//        var increment = 0.45;
//        var duration = 100;
//        var easing = fabric.util.ease['easeInCubic'];
//
//        this.animate('scaleX', '+=' + increment, {
//            duration: duration,
//            onChange: canvas.renderAll.bind(canvas),
//            easing: easing,
//            locator: this,
//            onComplete: function () {
//                if (LOG) {
//                    console.log(this);
//                }
//                this.locator.animate('scaleX', '-=' + increment, {
//                    duration: 1100,
//                    onChange: canvas.renderAll.bind(canvas),
//                    easing: fabric.util.ease['easeOutElastic']
//                });
//            }
//        });
//        this.animate('scaleY', '+=' + increment, {
//            duration: duration,
//            onChange: canvas.renderAll.bind(canvas),
//            easing: easing,
//            locator: this,
//            onComplete: function () {
//                this.locator.animate('scaleY', '-=' + increment, {
//                    duration: 1100,
//                    onChange: canvas.renderAll.bind(canvas),
//                    easing: fabric.util.ease['easeOutElastic']
//                });
//            }
//        });
//    },
//    positionChild: function (property, value, theMark, shouldAnimate) {
//        if (LOG) {
//            console.log("positionChild function at LOCATOR class");
//        }
//
//        var theLocator = this;
//
//        if (shouldAnimate) {
//            if (LOG) {
//                console.log("%cGoing to position child WITH ANIMATION", "background: red; color: white;");
//            }
//        } else {
//            if (LOG) {
//                console.log("%cGoing to position child with NO ANIMATION", "background: green; color: white;");
//            }
//        }
//
//        var theNumber = value.number;
//
//        theMark.setCoords();
//
//        theLocator.xAxisArrow.inConnectors.forEach(function (inConnector) {
//            inConnector.contract();
//        });
//        theLocator.yAxisArrow.inConnectors.forEach(function (inConnector) {
//            inConnector.contract();
//        });
//
//        if (LOG) {
//            console.log("theMark:");
//            console.log(theMark);
//        }
//
//        var duration = 500;
//        var easing = fabric.util.ease['easeOutBack'];
//        var untransformedProperty = null;
//
//        if (property === 'x') {
//            untransformedProperty = 'untransformedX';
//            theMark.xVisualProperty.value = value; // TODO: If there are outgoing connectors associated to this visual mark, their value should also be updated
//        } else if (property === 'y') {
//            untransformedProperty = 'untransformedY';
//            theMark.yVisualProperty.value = value; // TODO: If there are outgoing connectors associated to this visual mark, their value should also be updated
//        }
//
//        var newCoordinateValue = null;
//        var theCoordinate = theNumber;
//
//        if (theCoordinate === null) {
//            var boundingRect = theMark.getBoundingRect();
//            if (untransformedProperty === 'untransformedX') {
//                theCoordinate = boundingRect.width / 2 + 30;
//            } else if (untransformedProperty === 'untransformedY') {
//                theCoordinate = boundingRect.height / 2 + 60;
//            }
//        }
//
//        if (untransformedProperty === 'untransformedX') {
//
//            newCoordinateValue = theCoordinate + theLocator.radius - theMark.width / 2;
//
//        } else if (untransformedProperty === 'untransformedY') {
//
//            newCoordinateValue = -theCoordinate + theLocator.radius - theMark.height / 2;
//
//        }
//
//        if (shouldAnimate) {
//
//            fabric.util.animate({
//                startValue: theMark[untransformedProperty],
//                endValue: newCoordinateValue,
//                duration: duration,
//                easing: easing,
//                onChange: function (value) {
//
//                    theMark[untransformedProperty] = value;
//
//                    repositionWidget(theLocator, theMark);
//
//                    theLocator.positionCoordinateVisualProperties();
//
//                    theMark.configurePositionVisualProperties();
//                    repositionWidget(theLocator, theMark.xVisualProperty);
//                    repositionWidget(theLocator, theMark.yVisualProperty);
//
//                    theMark.positionElements();
//
//                    if (!theLocator.isCompressed) {
//                        theLocator.computeUntransformedBoundaries();
//                        theLocator.positionCoordinateVisualProperties();
//                    }
//
//                    canvas.renderAll();
//
//                },
//            });
//
//        } else {
//
//            theMark[untransformedProperty] = newCoordinateValue;
//
//            repositionWidget(theLocator, theMark);
//
//            theLocator.positionCoordinateVisualProperties();
//
//            theMark.configurePositionVisualProperties();
//            repositionWidget(theLocator, theMark.xVisualProperty);
//            repositionWidget(theLocator, theMark.yVisualProperty);
//
//            theMark.positionElements();
//
//            if (!theLocator.isCompressed) {
//                theLocator.computeUntransformedBoundaries();
//                theLocator.positionCoordinateVisualProperties();
//            }
//
//        }
//
//    },
//    setProperty: function (property, array, theVisualProperty, shouldAnimate) {
//
//        if (LOG) {
//            console.log("%csetProperty function. LOCATOR class", "background: red; color: white;");
//        }
//
//        var theLocator = this;
//        var duration = 500;
//        var easing = fabric.util.ease['easeOutBack'];
//        var untransformedProperty = null;
//
//        if (property === 'x') {
//
//            untransformedProperty = 'untransformedX';
//
//
//        } else if (property === 'y') {
//
//            untransformedProperty = 'untransformedY';
//
//        }
//
//
//        var i = 0;
//
//        theLocator.widgets.forEach(function (widget) {
//
//            if (widget.isMark) {
//
//                if (LOG)
//                    console.log("widget.label");
//                if (LOG)
//                    console.log(widget.label);
//
//                var theMark = widget;
//
//                theMark.xVisualProperty.inConnectors.forEach(function (inConnector) {
//                    inConnector.contract();
//                });
//                theMark.yVisualProperty.inConnectors.forEach(function (inConnector) {
//                    inConnector.contract();
//                });
//
//
//                var newCoordinateValue = null;
//
//                var theCoordinate = array[i].number;
//
//                if (!theCoordinate) {
//
//                    var boundingRect = widget.getBoundingRect();
//
//                    if (untransformedProperty === 'untransformedX') {
//
//                        theCoordinate = boundingRect.width / 2 + 30;
//
//                    } else if (untransformedProperty === 'untransformedY') {
//
//                        theCoordinate = boundingRect.height / 2 + 60;
//
//                    }
//
//                }
//
//                if (untransformedProperty === 'untransformedX') {
//
//                    newCoordinateValue = theCoordinate + theLocator.radius - theMark.width / 2;
//
//                } else if (untransformedProperty === 'untransformedY') {
//
//                    newCoordinateValue = -theCoordinate + theLocator.radius - theMark.height / 2;
//
//                }
//
//                fabric.util.animate({
//                    startValue: theMark[untransformedProperty],
//                    endValue: newCoordinateValue,
//                    duration: duration,
//                    easing: easing,
//                    onChange: function (value) {
//
//                        theMark[untransformedProperty] = value;
//
//                        repositionWidget(theLocator, theMark);
//
//                        theLocator.positionCoordinateVisualProperties();
//
//                        theMark.configurePositionVisualProperties();
//                        repositionWidget(theLocator, theMark.xVisualProperty);
//                        repositionWidget(theLocator, theMark.yVisualProperty);
//
//                        theMark.positionElements();
//
//                        if (!theLocator.isCompressed) {
//                            theLocator.computeUntransformedBoundaries();
//                            theLocator.positionCoordinateVisualProperties();
//                        }
//
//                    },
//                });
//
//                i++;
//
//            }
//        });
//
//
//
//
//    },
//    _render: function (ctx) {
//
//        var theLocator = this;
//
//        this.callSuper('_render', ctx);
//
//        ctx.save();
//        ctx.fillStyle = "black";
//        ctx.beginPath();
//        ctx.arc(0, 0, this.radius / 2.5, 0, 2 * Math.PI);
//        ctx.fill();
//        ctx.closePath();
//        ctx.restore();
//
//        ctx.beginPath();
//        ctx.strokeStyle = 'black';
//        ctx.lineWidth = 6;
//
//        var d = 10;
//
//        // Left horizontal line
//        ctx.moveTo(-(theLocator.radius + d + theLocator.strokeWidth), 0);
//        ctx.lineTo(-(theLocator.radius - d), 0);
//
//        // Right horizontal line
//        ctx.moveTo(+(theLocator.radius - d), 0);
//        ctx.lineTo(+(theLocator.radius + d + theLocator.strokeWidth), 0);
//
//        // Top vertical line
//        ctx.moveTo(0, -(theLocator.radius + d + theLocator.strokeWidth));
//        ctx.lineTo(0, -(theLocator.radius - d));
//
//        // Bottom vertical line
//        ctx.moveTo(0, +(theLocator.radius - d));
//        ctx.lineTo(0, +(theLocator.radius + d + theLocator.strokeWidth));
//
//        ctx.stroke();
//        ctx.closePath();
//
//
//        // *********************************************************************************************************** //
//        // Drawing the lines that cover the axes. They are only drawn if there are marks in the corresponding quadrants
//        // *********************************************************************************************************** //
//
//        ctx.beginPath();
//        // positive x axis
//        var x = theLocator.radius + d + theLocator.strokeWidth;
//        if (theLocator.maxUntransformedX > theLocator.radius) {
//            ctx.moveTo(theLocator.radius + d + theLocator.strokeWidth, 0);
//            x = theLocator.maxUntransformedX;
//        }
//        ctx.lineTo(x, 0); // axis line
//        // drawig the small arrow tip of the axis
//        ctx.lineTo(x, -5);
//        ctx.lineTo(x + 8, 0);
//        ctx.lineTo(x, 5);
//        ctx.lineTo(x, 0);
//        ctx.stroke();
//        ctx.closePath();
//
//        ctx.save();
//        ctx.font = "bold 16px Arial";
//        ctx.fillStyle = "black";
//        ctx.fillText("X", x + 15, 6);
//        ctx.restore();
//
//        ctx.beginPath();
//        // negative x axis
//        if (theLocator.minUntransformedX < -theLocator.radius) {
//            ctx.moveTo(-(theLocator.radius + d + theLocator.strokeWidth), 0);
//
//            var x = theLocator.minUntransformedX;
//            ctx.lineTo(x, 0); // axis line
//
//            // drawig the small arrow tip of the axis
//            ctx.lineTo(x, -5);
//            ctx.lineTo(x - 8, 0);
//            ctx.lineTo(x, 5);
//            ctx.lineTo(x, 0);
//        }
//
//        ctx.stroke();
//        ctx.closePath();
//
//
//        ctx.beginPath();
//        // positive y axis
//        var y = -(theLocator.radius + d + theLocator.strokeWidth);
//        if (theLocator.minUntransformedY < -theLocator.radius) {
//            ctx.moveTo(0, -(theLocator.radius + d + theLocator.strokeWidth));
//            y = theLocator.minUntransformedY;
//        }
//        ctx.lineTo(0, y); // axis line
//        // drawig the small arrow tip of the axis
//        ctx.lineTo(-5, y);
//        ctx.lineTo(0, y - 8);
//        ctx.lineTo(5, y);
//        ctx.lineTo(0, y);
//        ctx.stroke();
//        ctx.closePath();
//
//        ctx.save();
//        ctx.font = "bold 16px Arial";
//        ctx.fillStyle = "black";
//        ctx.textAlign = "center";
//        ctx.fillText("Y", 0, y - 16);
//        ctx.restore();
//
//        ctx.beginPath();
//        // negative y axis
//        if (theLocator.maxUntransformedY > theLocator.radius) {
//            ctx.moveTo(0, +(theLocator.radius + d + theLocator.strokeWidth));
//
//            var y = theLocator.maxUntransformedY;
//            ctx.lineTo(0, y);
//
//            // drawig the small arrow tip of the axis
//            ctx.lineTo(-5, y);
//            ctx.lineTo(0, y + 8);
//            ctx.lineTo(5, y);
//            ctx.lineTo(0, y);
//        }
//        ctx.stroke();
//        ctx.closePath();
//
//        if (!theLocator.isCompressed && theLocator.selectedMark) {
//
//            var selectedMark = theLocator.selectedMark;
//
//            ctx.beginPath();
//            ctx.strokeStyle = selectedMark.colorForStroke || selectedMark.stroke;
//            ctx.lineWidth = 1;
//            ctx.setLineDash([6, 2]);
//
//            var x = selectedMark.untransformedX - theLocator.radius + selectedMark.getWidth() / 2;
//            var y = selectedMark.untransformedY - theLocator.radius + selectedMark.height / 2;
//
//            ctx.fillStyle = "black";
//            ctx.font = "16px sans-serif";
//            ctx.stroke();
//            ctx.closePath();
//
//
//        }
//
//        ctx.restore();
//    },
//    computeUntransformedBoundaries: function () {
//
//        var theLocator = this;
//
//        theLocator.maxUntransformedX = 0;
//        theLocator.maxUntransformedY = 0;
//        theLocator.minUntransformedX = 0;
//        theLocator.minUntransformedY = 0;
//
//        var untransformedXs = new Array();
//        var untransformedYs = new Array();
//
//        // TODO: This is true because there are two default elements in the widget list: the arrows of each positive axis
//        if (theLocator.widgets.length > 2) {
//
//            theLocator.widgets.forEach(function (widget) {
//                if (widget.isMark) {
//
//                    // Getting the mark bounding rect; this will be used to cover the marks up to their boudaries
//                    var boundingRect = widget.getBoundingRect();
//                    // TODO: Possibly, this will have to be removed, as I expect that the bounding rect compensation process is solved in new versions of fabric.js
//                    compensateBoundingRect(boundingRect);
//
//
//
//                    // Up to this point, x is located exactly at the center p
////               var x = widget.untransformedX < 0 ? widget.untransformedX - theLocator.radius : widget.untransformedX + theLocator.radius + widget.width / 2;
//
//                    var x = widget.untransformedX < 0 ? widget.untransformedX - theLocator.radius + widget.width / 2 : widget.untransformedX + theLocator.radius;
//                    if (widget.untransformedX < 0) {
//                        x -= boundingRect.width / 2;
//                    } else {
//                        x += boundingRect.width / 2;
//                    }
//
//                    untransformedXs.push(x);
//
////                    if (LOG) console.log("mark.untransformedX:");
////                    if (LOG) console.log(widget.untransformedX);
////                    
////                    if (LOG) console.log("mark.untransformedY:");
////                    if (LOG) console.log(widget.untransformedY);
//
////                    if (LOG) console.log("(mark.untransformedX, mark.untransformedY):");
////                    if (LOG) console.log("(" + widget.untransformedX + "," + widget.untransformedY + ")");
//
//
//                    // Up to this point, y is located exactly at the center p
//                    var y = widget.untransformedY < 0 ? widget.untransformedY + widget.height / 2 - theLocator.radius : widget.untransformedY - theLocator.radius + widget.height / 2;
//
//                    // ************************************************************************************
//                    // Modifying the variable y to cover the objects including their widths and heights
//
//
//                    if (widget.untransformedY < 0) {
//                        y -= boundingRect.height / 2;
//                    } else {
//                        y += boundingRect.height / 2;
//                    }
//
//                    untransformedYs.push(y);
//                }
//            });
//
//            theLocator.maxUntransformedX = Math.max.apply(Math, untransformedXs);
//            theLocator.maxUntransformedY = Math.max.apply(Math, untransformedYs);
//            theLocator.minUntransformedX = Math.min.apply(Math, untransformedXs);
//            theLocator.minUntransformedY = Math.min.apply(Math, untransformedYs);
//
//        } else {
//
//            theLocator.maxUntransformedX = 300;
//            theLocator.minUntransformedY = -200;
//
//        }
//
////        if (LOG) console.log("theLocator.maxUntransformedX:");
////        if (LOG) console.log(theLocator.maxUntransformedX);
////
////        if (LOG) console.log("theLocator.maxUntransformedY:");
////        if (LOG) console.log(theLocator.maxUntransformedY);
////
////        if (LOG) console.log("theLocator.minUntransformedX:");
////        if (LOG) console.log(theLocator.minUntransformedX);
////
////        if (LOG) console.log("theLocator.minUntransformedY:");
////        if (LOG) console.log(theLocator.minUntransformedY);
//
//    },
//    showLocationProperties: function (easing, duration) {
//
//        var theLocator = this;
//        var gap = 17;
//
//        var xAxisArrow = theLocator.xAxisArrow;
//        xAxisArrow.untransformedY = 0;
//
//
//        var yAxisArrow = theLocator.yAxisArrow;
//        yAxisArrow.untransformedX = 0;
//
//
//        xAxisArrow.opacity = 0;
//        yAxisArrow.opacity = 0;
//
//        canvas.add(xAxisArrow);
//        canvas.add(yAxisArrow);
//
//        var defaultEasing = fabric.util.ease['easeInQuad'];
//        var defaultDuration = 500;
//
//        fabric.util.animate({
//            startValue: 0,
//            endValue: 1,
//            duration: duration || defaultDuration,
//            easing: easing || defaultEasing,
//            onChange: function (value) {
//                xAxisArrow.opacity = value;
//                xAxisArrow.untransformedX = value * (theLocator.maxUntransformedX + xAxisArrow.width / 2 + gap);
//                repositionWidget(theLocator, xAxisArrow);
//
//                yAxisArrow.opacity = value;
//                yAxisArrow.untransformedY = value * (theLocator.minUntransformedY - yAxisArrow.height / 2 - gap);
//                repositionWidget(theLocator, yAxisArrow);
//
//            },
//            onComplete: function () {
//                xAxisArrow.opacity = 1;
//                xAxisArrow.untransformedX = theLocator.maxUntransformedX + xAxisArrow.width / 2 + gap;
//                repositionWidget(theLocator, xAxisArrow);
//
//                yAxisArrow.opacity = 1;
//                yAxisArrow.untransformedY = theLocator.minUntransformedY - yAxisArrow.height / 2 - gap;
//                repositionWidget(theLocator, yAxisArrow);
//
//                canvas.renderAll();
//            }
//        });
//    },
//    hideLocationProperties: function (duration) {
//
//        var theLocator = this;
//
//        var xAxisArrow = theLocator.xAxisArrow;
//        var yAxisArrow = theLocator.yAxisArrow;
//        xAxisArrow.opacity = 1;
//        yAxisArrow.opacity = 1;
//
//        var easing = fabric.util.ease['easeInQuad'];
//
//        fabric.util.animate({
//            startValue: 1,
//            endValue: 0,
//            duration: duration || 500,
//            easing: easing,
//            onChange: function (value) {
//                xAxisArrow.opacity = value;
//                yAxisArrow.opacity = value;
//            },
//            onComplete: function () {
//                xAxisArrow.remove();
//                yAxisArrow.remove();
//            }
//        });
//    },
//    expand: function (refreshCanvas) {
//
//        var theLocator = this;
//
//        if (!theLocator.isCompressed)
//            return;
//
//        var easing = fabric.util.ease['easeInQuad'];
//        var duration = 500;
//
//        theLocator.computeUntransformedBoundaries();
//
//        var xAxisArrow = theLocator.xAxisArrow;
//        if (xAxisArrow) {
//            xAxisArrow.untransformedY = 0;
//            xAxisArrow.untransformedX = 0;
//            xAxisArrow.opacity = 0;
//            repositionWidget(theLocator, xAxisArrow);
//            canvas.add(xAxisArrow);
//        }
//
//        var yAxisArrow = theLocator.yAxisArrow;
//        if (yAxisArrow) {
//            yAxisArrow.untransformedY = 0;
//            yAxisArrow.untransformedX = 0;
//            yAxisArrow.opacity = 0;
//            repositionWidget(theLocator, yAxisArrow);
//            canvas.add(yAxisArrow);
//        }
//
//        var endValueMaxUntransformedX = theLocator.maxUntransformedX;
//        fabric.util.animate({
//            startValue: 0,
//            endValue: endValueMaxUntransformedX,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.maxUntransformedX = value;
//                if (xAxisArrow) {
//                    xAxisArrow.opacity = value / endValueMaxUntransformedX;
//                }
//            },
//        });
//
//        fabric.util.animate({
//            startValue: 0,
//            endValue: theLocator.minUntransformedX,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.minUntransformedX = value;
//            },
//        });
//
//        fabric.util.animate({
//            startValue: 0,
//            endValue: theLocator.maxUntransformedY,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.maxUntransformedY = value;
//            },
//        });
//
//        var endValueMinUntransformedY = theLocator.minUntransformedY;
//        fabric.util.animate({
//            startValue: 0,
//            endValue: theLocator.minUntransformedY,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.minUntransformedY = value;
//                if (yAxisArrow) {
//                    yAxisArrow.opacity = value / endValueMinUntransformedY;
//                }
//            },
//        });
//
//        fabric.util.animate({
//            startValue: 1,
//            endValue: 0,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.outConnectors.forEach(function (outConnector) {
//                    outConnector.opacity = value;
//                });
//            },
//        });
//
//        // This is done to guarantee that the canvas will be refreshed
//        fabric.util.animate({
//            duration: duration,
//            onChange: function (value) {
//                if (refreshCanvas) {
//                    theLocator.positionCoordinateVisualProperties();
//                    canvas.renderAll();
//                }
//            },
//            onComplete: function () {
//                theLocator.isCompressed = false;
//                if (theLocator.selectedMark) {
//                    canvas.add(theLocator.selectedMark.xVisualProperty);
//                    canvas.add(theLocator.selectedMark.yVisualProperty);
//                    theLocator.positionCoordinateVisualProperties();
//                }
//                if (refreshCanvas) {
//                    canvas.renderAll();
//                }
//            }
//        });
//
//    },
//    compress: function (refreshCanvas) {
//
//        var theLocator = this;
//
//        if (theLocator.isCompressed)
//            return;
//
//        theLocator.selectedMark = null;
//
//        // removing all the location visual properties associated to the marks of the plot
//        theLocator.widgets.forEach(function (widget) {
//            if (widget.isMark) {
//                if (widget.xVisualProperty.canvas) {
//
//                    widget.xVisualProperty.inConnectors.forEach(function (inConnector) {
//                        inConnector.opacity = 0;
//                    });
//                    widget.xVisualProperty.outConnectors.forEach(function (outConnector) {
//                        outConnector.opacity = 0;
//                    });
//
//                    widget.xVisualProperty.remove();
//
//                }
//                if (widget.yVisualProperty.canvas) {
//
//                    widget.yVisualProperty.inConnectors.forEach(function (inConnector) {
//                        inConnector.opacity = 0;
//                    });
//                    widget.yVisualProperty.outConnectors.forEach(function (outConnector) {
//                        outConnector.opacity = 0;
//                    });
//
//                    widget.yVisualProperty.remove();
//                }
//            }
//        });
//
//        var xAxisArrow = theLocator.xAxisArrow;
//        var yAxisArrow = theLocator.yAxisArrow;
//
//        var easing = fabric.util.ease['easeOutQuad'];
//        var duration = 500;
//
//        var startValueMaxUntransformedX = theLocator.maxUntransformedX;
//
//        fabric.util.animate({
//            startValue: startValueMaxUntransformedX,
//            endValue: 0,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.maxUntransformedX = value;
//                if (xAxisArrow) {
//                    xAxisArrow.opacity = value / startValueMaxUntransformedX;
//                }
//            },
//            onComplete: function () {
//                if (xAxisArrow) {
//                    xAxisArrow.remove();
//                }
//            }
//        });
//
//        fabric.util.animate({
//            startValue: theLocator.minUntransformedX,
//            endValue: 0,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.minUntransformedX = value;
//            },
//        });
//
//        fabric.util.animate({
//            startValue: theLocator.maxUntransformedY,
//            endValue: 0,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.maxUntransformedY = value;
//            },
//        });
//
//        var startValueMinUntransformedY = theLocator.minUntransformedY;
//        fabric.util.animate({
//            startValue: startValueMinUntransformedY,
//            endValue: 0,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.minUntransformedY = value;
//                if (yAxisArrow) {
//                    yAxisArrow.opacity = value / startValueMinUntransformedY;
//                }
//            },
//            onComplete: function () {
//                if (yAxisArrow) {
//                    yAxisArrow.remove();
//                }
//            }
//        });
//
//        // setting the opacity of the connectors to 1
//        fabric.util.animate({
//            startValue: 0,
//            endValue: 1,
//            duration: duration,
//            easing: easing,
//            onChange: function (value) {
//                theLocator.outConnectors.forEach(function (outConnector) {
//                    outConnector.opacity = value;
//                });
//            }
//        });
//
//        fabric.util.animate({
//            duration: duration,
//            onChange: function (value) {
//                theLocator.positionCoordinateVisualProperties();
//                if (refreshCanvas) {
//                    canvas.renderAll();
//                }
//            },
//            onComplete: function () {
//                theLocator.isCompressed = true;
//                theLocator.positionCoordinateVisualProperties();
//
//                theLocator.positionVisualPropertiesConnectorsAtTheOrigin();
//
//                if (refreshCanvas) {
//                    canvas.renderAll();
//                }
//            }
//        });
//
//
//    },
//    positionCoordinateVisualProperties: function () {
//
//        /*console.log("positionCoordinateVisualProperties FUNCTION");*/
//
//        var theLocator = this;
//        var gap = 17;
//
//        var xAxisArrow = theLocator.xAxisArrow;
//        var yAxisArrow = theLocator.yAxisArrow;
//
//        if (xAxisArrow) {
//            if (theLocator.maxUntransformedX > 0) {
//                xAxisArrow.untransformedX = theLocator.maxUntransformedX + xAxisArrow.width / 2 + gap;
//            } else {
//                xAxisArrow.untransformedX = theLocator.radius + xAxisArrow.width / 2 + gap;
//            }
//            repositionWidget(theLocator, xAxisArrow);
//        }
//
//        if (yAxisArrow) {
//            if (theLocator.minUntransformedY < 0) {
//                yAxisArrow.untransformedY = theLocator.minUntransformedY - yAxisArrow.height / 2 - gap;
//            } else {
//                yAxisArrow.untransformedY = -theLocator.radius - yAxisArrow.height / 2 - gap;
//            }
//            repositionWidget(theLocator, yAxisArrow);
//        }
//
//        theLocator.positionVisualPropertiesConnectors();
//
//
//    },
//    positionVisualPropertiesConnectorsAtTheOrigin: function () {
//
//        var theLocator = this;
//
//        if (theLocator.xAxisArrow) {
//            theLocator.xAxisArrow.inConnectors.forEach(function (inConnector) {
//                inConnector.set({x2: theLocator.left, y2: theLocator.top});
//            });
//
//            theLocator.xAxisArrow.outConnectors.forEach(function (outConnector) {
//                outConnector.set({x1: theLocator.left, y1: theLocator.top});
//            });
//        }
//
//        if (theLocator.yAxisArrow) {
//            theLocator.yAxisArrow.inConnectors.forEach(function (inConnector) {
//                inConnector.set({x2: theLocator.left, y2: theLocator.top});
//            });
//
//            theLocator.yAxisArrow.outConnectors.forEach(function (outConnector) {
//                outConnector.set({x1: theLocator.left, y1: theLocator.top});
//            });
//        }
//
//        theLocator.widgets.forEach(function (widget) {
//
//            if (widget.isMark) {
//
//                widget.xVisualProperty.inConnectors.forEach(function (inConnector) {
//                    inConnector.set({x2: theLocator.left, y2: theLocator.top});
//                });
//
//                widget.xVisualProperty.outConnectors.forEach(function (outConnector) {
//                    outConnector.set({x1: theLocator.left, y1: theLocator.top});
//                });
//
//                widget.yVisualProperty.inConnectors.forEach(function (inConnector) {
//                    inConnector.set({x2: theLocator.left, y2: theLocator.top});
//                });
//
//                widget.yVisualProperty.outConnectors.forEach(function (outConnector) {
//                    outConnector.set({x1: theLocator.left, y1: theLocator.top});
//                });
//
//            }
//
//        });
//
//
//    },
//    positionVisualPropertiesConnectors: function () {
//
//        var theLocator = this;
//
//        if (theLocator.xAxisArrow) {
//            theLocator.xAxisArrow.inConnectors.forEach(function (inConnector) {
//                inConnector.set({x2: theLocator.xAxisArrow.left, y2: theLocator.xAxisArrow.top});
//            });
//
//            theLocator.xAxisArrow.outConnectors.forEach(function (outConnector) {
//                outConnector.set({x1: theLocator.xAxisArrow.left, y1: theLocator.xAxisArrow.top});
//            });
//        }
//
//        if (theLocator.yAxisArrow) {
//            theLocator.yAxisArrow.inConnectors.forEach(function (inConnector) {
//                inConnector.set({x2: theLocator.yAxisArrow.left, y2: theLocator.yAxisArrow.top});
//            });
//
//            theLocator.yAxisArrow.outConnectors.forEach(function (outConnector) {
//                outConnector.set({x1: theLocator.yAxisArrow.left, y1: theLocator.yAxisArrow.top});
//            });
//        }
//
//        theLocator.widgets.forEach(function (widget) {
//
//            if (widget.isMark) {
//
//                widget.xVisualProperty.inConnectors.forEach(function (inConnector) {
//                    inConnector.set({x2: widget.xVisualProperty.left, y2: widget.xVisualProperty.top});
//                });
//
//                widget.xVisualProperty.outConnectors.forEach(function (outConnector) {
//                    outConnector.set({x1: widget.xVisualProperty.left, y1: widget.xVisualProperty.top});
//                });
//
//                widget.yVisualProperty.inConnectors.forEach(function (inConnector) {
//                    inConnector.set({x2: widget.yVisualProperty.left, y2: widget.yVisualProperty.top});
//                });
//
//                widget.yVisualProperty.outConnectors.forEach(function (outConnector) {
//                    outConnector.set({x1: widget.yVisualProperty.left, y1: widget.yVisualProperty.top});
//                });
//
//            }
//
//        });
//
//    },
//    addChild: function (child, connector, blinkChild, checkConnectorOpacity, markAsSelected) {
//
//        var theLocator = this;
//
//        theLocator.widgets.push(child);
//        child.parentObject = theLocator;
//        child.untransformedScaleX = 1;
//        child.untransformedScaleY = 1;
//
////        console.log("???????????????????????? BEFORE");
////        console.log("child.untransformedX: ");
////        console.log(child.untransformedX);
////        console.log("child.untransformedY:");
////        console.log(child.untransformedY);
//
//        computeUntransformedProperties(child);
//
////        console.log("   ----          ---------------- AFTER");
////        console.log("child.untransformedX: ");
////        console.log(child.untransformedX);
////        console.log("child.untransformedY:");
////        console.log(child.untransformedY);
//
//        child.configurePositionVisualProperties();
//
//        var xVisualProperty = child.xVisualProperty;
//        theLocator.widgets.push(xVisualProperty);
//        xVisualProperty.opacity = 1;
//        xVisualProperty.selectable = true;
//        xVisualProperty.evented = true;
//        repositionWidget(theLocator, xVisualProperty);
//        xVisualProperty.setCoords();
//
//        var yVisualProperty = child.yVisualProperty;
//        theLocator.widgets.push(yVisualProperty);
//        yVisualProperty.opacity = 1;
//        yVisualProperty.selectable = true;
//        yVisualProperty.evented = true;
//        repositionWidget(theLocator, yVisualProperty);
//        yVisualProperty.setCoords();
//
//
//
//        // We do this before the blinking, to keep consistency among all the values set to the x and y properties of the marks
//        // If this computation is done after or during the blinking, there will be problems related to the uncertainty
//        // of the position of the marks 
//
//        var relativeX = theLocator.getPointByOrigin('center', 'center').x - child.getPointByOrigin('center', 'center').x;
//        var relativeY = theLocator.getPointByOrigin('center', 'center').y - child.getPointByOrigin('center', 'center').y;
//
//        child.xVisualProperty.value = createNumericValue(-relativeX);
//        child.yVisualProperty.value = createNumericValue(relativeY);
//
//
//
//
//        if (blinkChild) {
//            child.blink();
//        }
//
//        if (checkConnectorOpacity) {
//            if (!theLocator.isCompressed) {
//                theLocator.computeUntransformedBoundaries();
//
//                // the boundaries of the axes have changed, so the x and y visual properties of the locator should be located properly
//                theLocator.positionCoordinateVisualProperties();
//
//                // Since the locator is extended, we have to set the visibility of the created connector to zero
//                var easing = fabric.util.ease['easeOutQuad'];
//                var duration = 500;
//                fabric.util.animate({
//                    startValue: 1,
//                    endValue: 0,
//                    duration: duration,
//                    easing: easing,
//                    onChange: function (value) {
//                        connector.opacity = value;
//                    },
//                });
//            }
//        }
//
////        if (connector && connector.canvas) {
////            connector.sendToBack();
////        }
//
////        child.bringToFront();
//        bringToFront(child);
//
//        if (markAsSelected) {
//            theLocator.selectedMark = child;
//            canvas.setActiveObject(child);
//        }
//
//
//
//    },
//    associateEvents: function () {
//        var theLocator = this;
//        theLocator.on({
//            'moving': function (options) {
//
//                this.moving = true;
//
//                if (this.lockMovementX && this.lockMovementY) {
//                    if (LOG)
//                        console.log("Output being created from locator");
//
//                    var theEvent = options['e'];
//
//                    if (theEvent) {
//                        var canvasCoords = getCanvasCoordinates(theEvent);
//                        var lastAddedConnector = getLastElementOfArray(this.outConnectors);
//                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
//                    }
//
//
//                } else {
//
//                    objectMoving(options, theLocator);
//
//                    if (theLocator.isCompressed) {
//                        theLocator.positionVisualPropertiesConnectorsAtTheOrigin();
//                    } else {
//                        theLocator.positionVisualPropertiesConnectors();
//                    }
//
//                }
//
//            },
//            'doubleTap': function (option) {
//                if (LOG)
//                    console.log("doubleTap over a LOCATOR");
//                if (this.isCompressed) {
//                    this.expand(true);
//                } else {
//                    this.compress(true);
//                }
//            },
//            'mouseup': function (option) {
//
//                if (LOG)
//                    console.log("Mouse UP over an locator ");
//
//                if (theLocator.lockMovementX && theLocator.lockMovementY) {
////                if (theLocator.moving || theLocator.scaling) {
//
//                    var theEvent = option['e'];
//                    var canvasCoords = getCanvasCoordinates(theEvent);
//
//                    var targetObject = findVisualPropertyPotentialDestination(canvasCoords);
//
//                    if (targetObject && targetObject !== theLocator) {
//
//                        if (targetObject.isMark) {
//
//                            var connector = getLastElementOfArray(theLocator.outConnectors);
//                            connector.setDestination(targetObject, true);
//                            theLocator.addChild(targetObject, connector, true, true, true);
//
//                            targetObject.lockMovementX = true;
//                            targetObject.lockMovementY = true;
//
//                        }
//
//                    } else {
//
//                        if (theLocator.lockMovementX && theLocator.lockMovementY) {
//
//                            // The mouse up event is done over a blank section of the canvas
//                            var lastAddedConnector = getLastElementOfArray(theLocator.outConnectors);
//                            lastAddedConnector.remove();
//
//                            theLocator.lockMovementX = false;
//                            theLocator.lockMovementY = false;
//
//                        }
//                    }
//
//                    // In case this locator belongs to a selection
//                    if (this.parentObject) {
//                        computeUntransformedProperties(this);
//                    }
//
//
//                } else {
//
//                    if (this.lockMovementX && this.lockMovementY) {
//                        var connector = this.outConnectors.pop();
//                        connector.remove();
//                    }
//
//                }
//
//                this.lockMovementX = false;
//                this.lockMovementY = false;
//                this.moving = false;
//                this.scaling = false;
//            },
//            'mousedown': function (option) {
//                if (LOG) {
//                    console.log("Mouse DOWN over an locator ");
//                }
//                bringToFront(this);
//                if (!this.isCompressed && this.selectedMark) {
//                    bringToFront(this.selectedMark.xVisualProperty);
//                    bringToFront(this.selectedMark.yVisualProperty);
//                }
//            },
//            'pressed': function (theEvent) {
//
//                blink(this, true);
//                theLocator.lockMovementX = true;
//                theLocator.lockMovementY = true;
//                var newConnector = new Connector({source: theLocator, x2: theLocator.left, y2: theLocator.top, arrowColor: theLocator.colorForStroke, strokeWidth: 1, undirected: true});
//                this.outConnectors.push(newConnector);
//                canvas.add(newConnector);
//
//            },
//            'scaling': function (options) {
//                this.scaling = true;
//                if (LOG) {
//                    console.log("Locator being scaled");
//                }
//            },
//            'inConnectionRemoved': function (options) {
//                var removedConnection = options.connector;
//                if (LOG) {
//                    console.log("%cAn IN connection has been removed from this locator", "background: DarkSeaGreen");
//                }
//                fabric.util.removeFromArray(this.inConnectors, removedConnection);
//            },
//            'outConnectionRemoved': function (options) {
//                var removedConnection = options.connector;
//                // the corresponding widget should be removed from the list of children of this locator
//                var theMark = removedConnection.destination;
//                fabric.util.removeFromArray(this.widgets, theMark);
//                if (LOG) {
//                    console.log("%cAn OUT connection has been removed from this locator", "background: DarkSeaGreen");
//                }
//                fabric.util.removeFromArray(this.outConnectors, removedConnection);
//            },
//            'newInConnection': function (options) {
//
//
//                // TODO: This method should check the type of locator, as some of them do not allow more than 2 inputs
//
//
//                var newInConnection = options.newInConnection;
//                var shouldAnimate = options.shouldAnimate;
//
//
//
//
//
//
//                if (LOG)
//                    console.log("newInConnection:");
//                if (LOG)
//                    console.log(newInConnection);
//
//                if (LOG)
//                    console.log("%c newInConnection " + shouldAnimate, "background:pink; color: black;");
//
//
//                this.inConnectors.push(newInConnection);
//
//                this.blink();
//
//                if (LOG)
//                    console.log("%cNew IN connection detected in this locator", "background:green");
//                if (LOG)
//                    console.log("%cThe input value is " + newInConnection.value, "background:yellow");
//                if (LOG)
//                    console.log("newInConnection:");
//                if (LOG)
//                    console.log(newInConnection);
//
//            },
////            'inValueUpdated': function (options) {
////                var inConnection = options.inConnection;
////                var markAsSelected = options.markAsSelected;
////                var shouldAnimate = options.shouldAnimate;
////                this.computeOutputValue(shouldAnimate);
////            },
//            'markMoving': function (theMark) {
//
//                if (LOG) {
//                    console.log("markMoving EVENT at LOCATOR class");
//                }
//
//
//                theLocator.xAxisArrow.inConnectors.forEach(function (inConnector) {
//                    inConnector.contract();
//                });
//                theLocator.yAxisArrow.inConnectors.forEach(function (inConnector) {
//                    inConnector.contract();
//                });
//
//                theMark.xVisualProperty.inConnectors.forEach(function (inConnector) {
//                    inConnector.contract();
//                });
//                theMark.yVisualProperty.inConnectors.forEach(function (inConnector) {
//                    inConnector.contract();
//                });
//
//
//
////                if (LOG) console.log("theMark.untransformedY:");
////                if (LOG) console.log(theMark.untransformedY);
//
////                if (LOG) console.log("A mark of mine is being moved");
//
//
//                theMark.configurePositionVisualProperties();
//                repositionWidget(theLocator, theMark.xVisualProperty);
//                repositionWidget(theLocator, theMark.yVisualProperty);
//
//                if (!theLocator.isCompressed) {
//                    theLocator.computeUntransformedBoundaries();
//                    theLocator.positionCoordinateVisualProperties();
//                }
//
////                drawRectAt(theMark.getCenterPoint(), generateRandomColor());
////                drawRectAt(theMark.getCenterPoint(), theMark.fill);
//
//
//
//
//                var relativeX = theLocator.getPointByOrigin('center', 'center').x - theMark.getPointByOrigin('center', 'center').x;
//                var relativeY = theLocator.getPointByOrigin('center', 'center').y - theMark.getPointByOrigin('center', 'center').y;
//
//                theMark.xVisualProperty.setValue(createNumericValue(-relativeX), false, false);
//                theMark.yVisualProperty.setValue(createNumericValue(relativeY), false, false);
//
//
//
//
//            },
//            'markSelected': function (theMark) {
//
//                if (LOG) {
//                    console.log("MARK SELECTED!!!!");
//                }
//
//                theLocator.widgets.forEach(function (widget) {
//                    if (widget.isMark) {
//                        if (widget.xVisualProperty.canvas) {
//
//                            widget.xVisualProperty.inConnectors.forEach(function (inConnector) {
//                                inConnector.opacity = 0;
//                            });
//                            widget.xVisualProperty.outConnectors.forEach(function (outConnector) {
//                                outConnector.opacity = 0;
//                            });
//
//                            widget.xVisualProperty.remove();
//                        }
//                        if (widget.yVisualProperty.canvas) {
//
//                            widget.yVisualProperty.inConnectors.forEach(function (inConnector) {
//                                inConnector.opacity = 0;
//                            });
//                            widget.yVisualProperty.outConnectors.forEach(function (outConnector) {
//                                outConnector.opacity = 0;
//                            });
//
//                            widget.yVisualProperty.remove();
//                        }
//                    }
//                });
//
//                theLocator.selectedMark = theMark;
//                if (!theLocator.isCompressed) {
//
//                    canvas.add(theMark.xVisualProperty);
//                    canvas.add(theMark.yVisualProperty);
//
//                    theMark.xVisualProperty.inConnectors.forEach(function (inConnector) {
//                        inConnector.opacity = 1;
//                    });
//                    theMark.xVisualProperty.outConnectors.forEach(function (outConnector) {
//                        outConnector.opacity = 1;
//                    });
//                    theMark.yVisualProperty.inConnectors.forEach(function (inConnector) {
//                        inConnector.opacity = 1;
//                    });
//                    theMark.yVisualProperty.outConnectors.forEach(function (outConnector) {
//                        outConnector.opacity = 1;
//                    });
//
//                }
//
//            }
//        });
//    },
//    inValueUpdated: function (options) {
//        var theLocator = this;
//        var inConnection = options.inConnection;
//        var markAsSelected = options.markAsSelected;
//        var shouldAnimate = options.shouldAnimate;
//        theLocator.computeOutputValue(shouldAnimate);
//    },
//});
//
//
//function addLocator(options) {
//
//    if (LOG) {
//        console.log("Options for function addLocator:");
//        console.log(options);
//    }
//
//    if (options.animateAtBirth) {
//        options.scaleX = 0.05;
//        options.scaleY = 0.05;
//    } else {
//        options.scaleX = 1;
//        options.scaleY = 1;
//    }
//
//    options.originX = 'center';
//    options.originY = 'center';
//
//    //options.fill = 'rgb(153, 153, 153)';
//    options.fill = 'rgba(153, 153, 153, 0.5)';
//
//    options.colorForStroke = 'rgb(86, 86, 86)';
//    options.stroke = 'rgb(86, 86, 86)';
//
//    options.strokeWidth = 3;
//    options.radius = 28;
//    options.lockRotation = true;
//    options.lockScalingX = true;
//    options.lockScalingY = true;
//    options.transparentCorners = false;
//    options.hasRotatingPoint = false;
//    options.hasControls = false;
//    options.hasBorders = false;
//
//    var newLocator = new Locator(options);
//    canvas.add(newLocator);
//
//    if (options.markAsSelected) {
//        newLocator.applySelectedStyle();
//        canvas.setActiveObject(newLocator);
//    }
//
//    var waitingTime = 0;
//    if (options.animateAtBirth) {
//
//        var easing = fabric.util.ease.easeOutElastic;
//        var duration = 1000;
//        waitingTime = duration + 50;
//
//        newLocator.animate('scaleX', 1, {
//            duration: duration,
//            easing: easing
//        });
//        newLocator.animate('scaleY', 1, {
//            onChange: canvas.renderAll.bind(canvas),
//            duration: duration,
//            easing: easing
//        });
//    }
//
//    if (LOG) {
//        console.log("newLocator:");
//        console.log(newLocator);
//    }
//
//    return newLocator;
//
//}
//
//function createLocatorFromXMLNode(locatorXmlNode) {
//
////    console.clear();
//
//    var options = {
//        markAsSelected: false,
//        animateAtBirth: false,
//        xmlID: locatorXmlNode.attr('xmlID'),
//        selectedMarkXmlID: Number(locatorXmlNode.attr('selectedMarkXmlID'))
//    };
//
//    var children = locatorXmlNode.children();
//    children.each(function () {
//        var child = $(this);
//        var tagName = this.tagName;
//
//        var value = child.text();
//        var type = child.attr('type');
//
//        if (type === 'array') {
//
//            var array = new Array();
//            var elements = child.children('markXmlID');
//            elements.each(function () {
//                var markNode = $(this);
//                array.push(Number(markNode.text()));
//            });
//            options[tagName] = array;
//
//        } else {
//
//            if (type === "number") {
//                value = Number(value);
//            } else if (type === "boolean") {
//                value = value === "true";
//            }
//
//            options[tagName] = value;
//
//        }
//
//    });
//
//
//    if (LOG) {
//        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!! options to create the saved LOCATOR");
//        console.log(options);
//    }
//
//
//
//    options.shouldExpand = options.isExpanded;
//
//    var theLocator = addLocator(options);
//
//    if (LOG) {
//        console.log("theLocator:");
//        console.log(theLocator);
//    }
//
//    return theLocator;
//
//}