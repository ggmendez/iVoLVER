var dataWidgetStrokeWidth = 3;
var dataWidgetStrokeColor = 'black';
var dataWidgetFillColor = rgb(226, 227, 227);

var childrenFillColor = rgb(2, 128, 204);
var childrenStrokeColor = darkenrgb(2, 128, 204);
//var variableLabelColor = rgb(255,255,255);
var variableLabelColor = rgb(0, 0, 0);

var DataWidget = fabric.util.createClass(fabric.Object, {
    toSVG: function (reviver) {
        var markup = this._createBaseSVGMarkup(), x = this.left, y = this.top;
        if (!(this.group && this.group.type === 'path-group')) {
            x = -this.width / 2;
            y = -this.height / 2;
        }
        markup.push(
                '<rect ',
                'x="', x, '" y="', y,
                '" rx="', this.get('rx'), '" ry="', this.get('ry'),
                '" width="', this.width, '" height="', this.height,
                '" style="', this.getSvgStyles(),
                '" transform="', this.getSvgTransform(),
                this.getSvgTransformMatrix(),
                '"/>\n');

        return reviver ? reviver(markup.join('')) : markup.join('');
    },
    initialize: function (options) {
        options || (options = {});
        this.callSuper('initialize', options);

//        this.set('hasRotatingPoint', false);
        this.set('hasBorders', false);
//        this.set('hasControls', false);
        this.set('transparentCorners', false);

        this.JSONString = options.JSONString;

        this.hasControls = false;

        this.variableHeight = 45;
        this.variableWidth = 140;

        this.childrenRadius = 70;
        this.verticalSeparation = 10;
        this.childrenStrokeWidth = 3;
        this.additionalWidth = 2 * this.childrenRadius + 10;
        this.verticalSpace = 4;


        this.indent = 15;

        this.type = 'dataWidget';
        this.isDataWidget = true;

        this.set('fileName', options.fileName || '');

        this.set('transitionWidth', this.compressedWidth);

        this.set('childrenFillColor', options.childrenFillColor || childrenFillColor);
        this.set('childrenStrokeColor', options.childrenStrokeColor || childrenStrokeColor);

        this.set('variableLabelColor', options.variableLabelColor || variableLabelColor);

        this.set('fill', options.fill || dataWidgetFillColor);
        this.set('stroke', options.stroke || dataWidgetStrokeColor);

        this.set('strokeWidth', dataWidgetStrokeWidth || 3);

        this.set('isCompressed', true);
        this.set('rx', 20);
        this.set('ry', 20);

        this.set('originX', 'center');
        this.set('originY', 'center');

        this.set('widgets', new Array());
        this.set('variables', new Array());
        this.set('visualVariables', new Array());

        this.set('gap', 20);

        var iText = new fabric.IText(this.fileName, {
            originX: 'center',
            originY: 'center',
            left: this.left,
            top: this.top,
            fontSize: 22,
            textAlign: 'center',
            fontWeight: 'bold',
            fontFamily: 'calibri',
            hasControls: false,
            hasBorders: false,
            hasRotatingPoint: false,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockMovementX: true,
            lockMovementY: true,
            selectable: false,
            evented: false,
            editable: false
        });
        this.set('iText', iText);
        canvas.add(iText);

        setTimeout(function () {
            iText.bringToFront(true);
        }, 100);

        this.compressedWidth = Math.max(iText.width, this.variableWidth) + this.gap;

        this.set('width', options.width || this.compressedWidth);

        this.on('doubleTap', function (option) {
            if (this.isCompressed) {
                this.expand();
            } else {
                this.compress();
            }
        });

        this.on('rotating', function (option) {
            objectMoving(option, this);
        });
        this.on('scaling', function (option) {
            objectMoving(option, this);
        });

        this.on('moving', function (option) {
            var theDataWidget = this;
            this.visualVariables.forEach(function (visualVariable) {
                if (theDataWidget.isCompressed) {
                    visualVariable.outConnectors.forEach(function (connector) {
                        connector.set({x1: theDataWidget.left, y1: theDataWidget.top});
                    });
                } else {
                    visualVariable.outConnectors.forEach(function (connector) {
                        connector.set({x1: visualVariable.left, y1: visualVariable.top});
                    });
                }

            });
            objectMoving(option, this);
        });

        this.compressedHeight = 70;


        this.set('height', options.height || this.compressedHeight);

    },
    createVisualVariables: function (nVariables) {
        var theDataWidget = this;
        if (!nVariables) {
            nVariables = theDataWidget.variables.length;
        }
        for (var i = 0; i < nVariables; i++) {
            theDataWidget.addVariable({x: theDataWidget.left, y: theDataWidget.top}, theDataWidget.variables[i]);
        }
        canvas.renderAll();
    },
    parseCSVString: function () {

        if (LOG) {
            console.log("this.CSVString:");
            console.log(this.CSVString);
        }

        var theDataWidget = this;

        this.CSVString = this.CSVString.trim();

        var parsingResults = Papa.parse(this.CSVString, {
            delimiter: "", // auto-detect
            newline: "", // auto-detect
            header: true,
            dynamicTyping: true,
        });

        var fields = parsingResults.meta.fields;

        if (LOG) {
            console.log("fields: ");
            console.log(fields);
        }

        var data = {};

        fields.forEach(function (field) {
            var values = new Array();
            parsingResults.data.forEach(function (row) {
                var rawValue = row[field];

                var value = null;                

                if ($.isNumeric(rawValue)) {

                    value = createNumericValue(rawValue); // NUMBER

                } else if (isColor(rawValue)) {


                    value = createColorValue(rawValue); // COLOR


                } else {

                    var theMoment = parseStringAsMomentDate(rawValue);

                    if (theMoment) {

                        value = createDateAndTimeValue(theMoment); // DATE AND TIME

                    } else {

                        value = createStringValue(rawValue); // STRING

                    }

                }

                values.push(value);
            });

            data[field] = values;

            /*if (LOG) console.log("******************************");*/

        });

        /*if (LOG) console.log("parsingResults:");
         if (LOG) console.log(parsingResults);
         
         if (LOG) console.log("fields:");
         if (LOG) console.log(fields);
         
         if (LOG) console.log("data:");
         if (LOG) console.log(data);*/

        theDataWidget.data = data;
        $.each(data, function (key, val) {
            theDataWidget.variables.push(key);
        });
        theDataWidget.createVisualVariables();

    },
    parseJSONString: function () {
        var theDataWidget = this;
        var data = jQuery.parseJSON(this.JSONString);

        if (LOG) {
            console.log("data:");
            console.log(data);
        }

        theDataWidget.data = data;
        $.each(data, function (key, val) {
            theDataWidget.variables.push(key);
        });
        theDataWidget.createVisualVariables(14);
//        theDataWidget.createVisualVariables();

    },
    animateBirth: function (markAsSelected, finalScaleX, finalScaleY, doNotRefreshCanvas) {

        var theMark = this;
        var scaleX = finalScaleX || this.scaleX;
        var scaleY = finalScaleY || this.scaleY;
        this.set('scaleX', 0);
        this.set('scaleY', 0);

        if (markAsSelected) {
            this.applySelectedStyle(false);
        }

        var easing = fabric.util.ease['easeOutElastic'];
        var duration = 1200;

        theMark.animate('scaleX', scaleX, {
            duration: duration,
            easing: easing
        });

        var scaleYAnimationOptions = {};
        scaleYAnimationOptions['duration'] = duration;
        scaleYAnimationOptions['easing'] = easing;

        if (!doNotRefreshCanvas) {
            scaleYAnimationOptions['onChange'] = refresherFunction;
            scaleYAnimationOptions['onComplete'] = refresherFunction;
        }

        theMark.animate('scaleY', scaleY, scaleYAnimationOptions);
    },
    loadData: function () {

        var theDataWidget = this;

        var jqxhr = $.getJSON(theDataWidget.dataFile, function () {
//            if (LOG) console.log("success");
        }).done(function (data) {
            theDataWidget.data = data;

            $.each(data, function (key, val) {
                theDataWidget.variables.push(key);
            });
            theDataWidget.createVisualVariables(10);
//            if (LOG) console.log("theDataWidget.variables:");
//            if (LOG) console.log(theDataWidget.variables);
//            if (LOG) console.log("theDataWidget.data:");
//            if (LOG) console.log(theDataWidget.data);
        }).fail(function () {
//            if (LOG) console.log("error");
        }).always(function () {
//            if (LOG) console.log("complete");
        });

// Perform other work here ...

// Set another completion function for the request above
        jqxhr.complete(function () {
            if (LOG) {
                console.log("second complete");
            }
        });


    },
    getLatLong: function (postCode) {
        var theDataWidget = this;
        var parts = postCode.split(" ");

        for (var i = 0; i < theDataWidget.postCodes.outcode.length; i++) {
            if (theDataWidget.postCodes.outcode[i] == parts[0]) {
                return {lat: theDataWidget.postCodes.lat[i], long: theDataWidget.postCodes.lng[i]};
            }
        }
    },
    loadPostCodes: function () {

        var theDataWidget = this;

        var jqxhr = $.getJSON('./postcodes.json', function () {
//            if (LOG) console.log("success");
        }).done(function (data) {
            theDataWidget.postCodes = data;
            $.each(data, function (key, val) {
                theDataWidget.variables.push(key);
            });
            if (LOG) {
                console.log("theDataWidget.postCodes:");
                console.log(theDataWidget.postCodes);
            }
        }).fail(function () {
//            if (LOG) console.log("error");
        }).always(function () {
//            if (LOG) console.log("complete");
        });

// Perform other work here ...

// Set another completion function for the request above
        jqxhr.complete(function () {
            if (LOG) {
                console.log("second complete");
            }
        });


    },
    applySelectedStyle: function () {
        this.selected = true;
    },
    applyUnselectedStyle: function () {
        this.selected = false;
    },
    blink: function () {
        var increment = 0.1;
        var duration = 100;
        var easing = fabric.util.ease['easeInCubic'];

        this.animate('scaleX', '+=' + increment, {
            duration: duration,
            onChange: canvas.renderAll.bind(canvas),
            easing: easing,
            operator: this,
            onComplete: function () {
                if (LOG) {
                    console.log(this);
                    console.log(self);
                }
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
    },
    addVariable: function (canvasCoords, variableName) {

        var theDataWidget = this;
        var valuesArray = theDataWidget.data[variableName];
        var typeProposition = valuesArray[0].getTypeProposition();
        var iconName = getIconNameByVisualValueProposition(typeProposition);

        var options = {
            left: canvasCoords.x,
            top: canvasCoords.y,
            fill: icons[iconName].fill,
            stroke: icons[iconName].stroke,
            height: theDataWidget.variableHeight,
            width: theDataWidget.variableWidth,
            strokeWidth: theDataWidget.childrenStrokeWidth,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            originX: 'center',
            originY: 'center',
            scaleX: theDataWidget.getScaleX(),
            scaleY: theDataWidget.getScaleY(),
            angle: theDataWidget.getAngle(),
            labeled: false,
            hasBorders: false,
            hasControls: false,
            label: variableName,
            rx: 10,
            ry: 10,
            labelColor: theDataWidget.variableLabelColor,
            isNamedCollection: true
        };

        var namedCollection = new LabeledRect(options);

        namedCollection.set('value', valuesArray);

        theDataWidget.visualVariables.push(namedCollection);

        namedCollection.on('doubleTap', function (option) {
            theDataWidget.trigger('doubleTap');
        });

        namedCollection.outConnectors = new Array();

        namedCollection.on({
            'moving': function (option) {

                var theEvent = option['e'];

                if (theEvent) {
                    var canvasCoords = getCanvasCoordinates(theEvent);
                    var lastAddedConnector = getLastElementOfArray(this.outConnectors);
                    if (lastAddedConnector) {
                        lastAddedConnector.set({x2: canvasCoords.x, y2: canvasCoords.y});
                    }

                }

            },
            'mouseup': function (option) {

                var theEvent = option['e'];
                var canvasCoords = getCanvasCoordinates(theEvent);
                var coordX = canvasCoords.x;
                var coordY = canvasCoords.y;

                var targetObject = findPotentialDestination(canvasCoords, ['isDataWidget', 'isNamedCollection', 'isVisualProperty', 'isOperator', 'isFunctionInput', 'isMark', 'isPlayer', 'isVisualValue', 'isVerticalCollection', 'isMapperInput', 'isMapperOutput', 'isFunctionValuesCollection']);

                if (targetObject) {

                    if (targetObject !== namedCollection && !targetObject.isDataWidget) {                        

                        if (targetObject.isVerticalCollection) {

                            var connector = getLastElementOfArray(namedCollection.outConnectors);
                            connector.setDestination(targetObject, true);

                        } else if (targetObject.isFunctionValuesCollection) {

                            var connector = getLastElementOfArray(namedCollection.outConnectors);
                            connector.setDestination(targetObject, true);

                            setTimeout(function () {
                                bringToFront(connector.source);
                                bringToFront(connector.destination);
                            }, 50);

                        } else {
                            // This makes no sense, so, the added connector is just removed
                            var connector = namedCollection.outConnectors.pop();
                            if (connector) {
                                connector.contract();
                            }
                        }

                    } else {                                                
                        
                        console.log("THERE");
                        
                        console.log("namedCollection.outConnectors.length:");
                        console.log(namedCollection.outConnectors.length);
                        
                        var connector = namedCollection.outConnectors.pop();
                        if (connector) {
                            
                            console.log("connector:");
                            console.log(connector);
                            
                            connector.contract();
                        }
                        
                    }

                } else {

                    var lastAddedConnector = getLastElementOfArray(namedCollection.outConnectors);
                    newConnectionReleasedOnCanvas(lastAddedConnector, coordX, coordY);

                }
            },
            'mousedown': function (option) {

                if (LOG) {
                    console.log(namedCollection.attribute);
                    console.log(namedCollection.parentObject.get(namedCollection.attribute));
                }

                var newConnector = new Connector({source: namedCollection, x2: namedCollection.left, y2: namedCollection.top, arrowColor: namedCollection.colorForStroke, filledArrow: true, strokeWidth: 3});

                if (LOG) {
                    console.log("newConnector.value: ");
                    console.log(newConnector.value);
                }

                namedCollection.outConnectors.push(newConnector);
                canvas.add(newConnector);

            },
            'outConnectionRemoved': standarOutConnectionRemovedHandler,
        });

    },
    generateChildrenPositions: function (realWidth, topLeft) {

        var positions = new Array();
        var theDataWidget = this;
        var indent = theDataWidget.indent * theDataWidget.getScaleX();
        var nparts = theDataWidget.visualVariables.length;
        var effectiveSpace = realWidth - 2 * indent;
        var separation = effectiveSpace / nparts;

        var y = topLeft.y + (theDataWidget.variableHeight + theDataWidget.verticalSeparation) * theDataWidget.getScaleY() - 20;

        for (var i = 0, len = theDataWidget.visualVariables.length; i < len; i++) {
            var x = topLeft.x + indent + (i + 0.5) * separation;
            positions.push(fabric.util.rotatePoint(new fabric.Point(x, y), topLeft, fabric.util.degreesToRadians(theDataWidget.getAngle())));
        }

        return positions;
    },
    positionChildren: function () {

        var theDataWidget = this;
        var duration = 500;
        var easing = fabric.util.ease.easeInQuart;

        var nparts = theDataWidget.visualVariables.length;

        var indent = 15 * theDataWidget.getScaleX();

        var realWidth = theDataWidget.getWidth() + (theDataWidget.getScaleX() * theDataWidget.strokeWidth);

//        if (LOG) console.log("realWidth: " + realWidth);
//
//        var effectiveSpace = realWidth - 2 * indent;
//
//        if (LOG) console.log("effectiveSpace: " + effectiveSpace);
//
//        var separation = effectiveSpace / nparts;
//
//        if (LOG) console.log("separation: " + separation);
//
        var topLeft = theDataWidget.getPointByOrigin('left', 'top');
////        drawRectAt(topLeft, "black");
//
////        topLeft.x = topLeft.x + (theDataWidget.getScaleX()*theDataWidget.strokeWidth)/2;
//
//        var y = topLeft.y + (theDataWidget.childrenRadius + theDataWidget.verticalSeparation) * theDataWidget.getScaleY();
//
//        drawRectAt(topLeft, "purple");
//
//        for (var i = 0, len = theDataWidget.inConnectors.length; i < len; i++) {
//
//            var x = topLeft.x + indent + (i + 0.5) * separation;
//
//            drawRectAt(new fabric.Point(x, y), "yellow");
//
//            var rotatedPosition = fabric.util.rotatePoint(new fabric.Point(x, y), topLeft, fabric.util.degreesToRadians(theDataWidget.getAngle()));
//
//            drawRectAt(rotatedPosition, "red");
//
//            theDataWidget.animateChild(i, 'top', rotatedPosition.y, duration, easing);
//            theDataWidget.animateChild(i, 'left', rotatedPosition.x, duration, easing);
//        }


        var positions = theDataWidget.generateChildrenPositions(realWidth, topLeft);
        for (var i = 0, len = theDataWidget.visualVariables.length; i < len; i++) {
            theDataWidget.animateChild(i, 'top', positions[i].y, duration, easing);
            theDataWidget.animateChild(i, 'left', positions[i].x, duration, easing);
        }



    },
    repositionChildren: function (afterInConecctionRemoval, targetWidth) {

        var theDataWidget = this;
        var duration = 500;
        var easing = fabric.util.ease.easeInQuart;

        var nparts = 1 + theDataWidget.visualVariables.length;

        var realWidth = theDataWidget.getWidth() + (theDataWidget.getScaleX() * theDataWidget.strokeWidth);
        if (targetWidth) {
            realWidth = (targetWidth + theDataWidget.strokeWidth) * theDataWidget.getScaleX();
        }

        if (afterInConecctionRemoval && theDataWidget.visualVariables.length > 1) {
            realWidth -= theDataWidget.additionalWidth * theDataWidget.getScaleX();
            targetWidth = realWidth;
        }

//        if (LOG) console.log("%c realWidth: " + realWidth, "background: yellow; color: black;");

        var realChildWidth = (2 * theDataWidget.childrenRadius + theDataWidget.childrenStrokeWidth) * theDataWidget.getScaleX();

        var gap = (realWidth - (theDataWidget.visualVariables.length * realChildWidth)) / nparts;

//        if (LOG) console.log("%c realChildWidth: " + realChildWidth, "background: yellow; color: black;");
//        if (LOG) console.log("%c theDataWidget.getWidth(): " + theDataWidget.getWidth(), "background: yellow; color: black;");
//        if (LOG) console.log("%c theDataWidget.strokeWidth: " + theDataWidget.strokeWidth, "background: yellow; color: black;");
//        if (LOG) console.log("%c theDataWidget.getScaleX(): " + theDataWidget.getScaleX(), "background: yellow; color: black;");
//        if (LOG) console.log("%c gap: " + gap, "background: yellow; color: black;");

        var topLeft = theDataWidget.getPointByOrigin('left', 'top');
        if (targetWidth) {
            var clonnedAggregator = fabric.util.object.clone(theDataWidget);
            clonnedAggregator.width = targetWidth;
            topLeft = clonnedAggregator.getPointByOrigin('left', 'top');
        }


        if (!afterInConecctionRemoval && !targetWidth) {

            if (gap < 12.5 * theDataWidget.getScaleX()) {

                // Using this cloned version of the aggregator to retrieve the position of the top left point once the aggregator has grown in width
                var clonnedAggregator = fabric.util.object.clone(theDataWidget);
                clonnedAggregator.width = theDataWidget.width + theDataWidget.additionalWidth;
                topLeft = clonnedAggregator.getPointByOrigin('left', 'top');

                realWidth = clonnedAggregator.getWidth() + (theDataWidget.getScaleX() * theDataWidget.strokeWidth);
                gap = (realWidth - (theDataWidget.visualVariables.length * realChildWidth)) / nparts;

//                if (LOG) console.log("%c NEW gap: " + gap, "background: yellow; color: black;");

                theDataWidget.transitionWidth = theDataWidget.width + theDataWidget.additionalWidth;

                // growing the actual aggregator
                this.animate('width', theDataWidget.transitionWidth, {
                    duration: duration,
                    easing: easing,
                    onChange: function () {

                    },
                    onComplete: function () {

                    }
                });
            }
        }

        var positions = theDataWidget.generateChildrenPositions(realWidth, topLeft);
        for (var i = 0, len = theDataWidget.visualVariables.length; i < len; i++) {
            theDataWidget.animateChild(i, 'top', positions[i].y, duration, easing);
            theDataWidget.animateChild(i, 'left', positions[i].x, duration, easing);
        }

    },
    addChild: function (child) {

        this.widgets.push(child);

        var objectTopLeft = child.getPointByOrigin('left', 'top');
//        
//        
//        
//        var rotatedObjectTopLeft = fabric.util.rotatePoint(new fabric.Point(objectTopLeft.x, objectTopLeft.y), topLeft, -fabric.util.degreesToRadians(this.getAngle()));
//        
//        drawRectAt(topLeft, "red");
//        drawRectAt(objectTopLeft, "blue");
////        drawRectAt(rotatedObjectTopLeft, "green");
//        
//        
//        if (LOG) console.log("this.getScaleX():");
//        if (LOG) console.log(this.getScaleX());
//        
//        if (LOG) console.log("this.getScaleY():");
//        if (LOG) console.log(this.getScaleY());
//
//        // Computing the untransformed properties of each contained object                
        child.parentObject = this;
        child.untransformedScaleX = 1;
        child.untransformedScaleY = 1;
        child.untransformedAngle = 0;

//        if (LOG) console.log("%c object.untransformedAngle: " + child.untransformedAngle, "background: blue; color: white;");


//        object.untransformedX = (objectTopLeft.x - topLeft.x - this.strokeWidth/2 + object.strokeWidth/2) / this.getScaleX();
//        object.untransformedY = (objectTopLeft.y - topLeft.y - this.strokeWidth/2 + object.strokeWidth/2) / this.getScaleY();


//
//      var untransformedX = (objectTopLeft.x - topLeft.x - this.strokeWidth / 2 + object.strokeWidth / 2) / this.getScaleX();
//      var untransformedY = (objectTopLeft.y - topLeft.y - this.strokeWidth / 2 + object.strokeWidth / 2) / this.getScaleY();
//      if (LOG) console.log("%c untransformedX: " + untransformedX, "background: blue; color: white;");
//      if (LOG) console.log("%c untransformedY: " + untransformedY, "background: blue; color: white;");



        computeUntransformedProperties(child);



//        if (LOG) console.log(object.untransformedScaleX);
//        if (LOG) console.log("%c object.untransformedX: " + object.untransformedX, "background: blue; color: yellow;");
//        if (LOG) console.log("%c object.untransformedY: " + object.untransformedY, "background: blue; color: yellow;");



        child.added = true;

    },
    animateChild: function (i, prop, endValue, duration, easing) {

//        if (LOG) console.log("Animating child");

        var theDataWidget = this;
        var child = theDataWidget.visualVariables[i];
        fabric.util.animate({
            startValue: child[prop],
            endValue: endValue,
            duration: duration,
            easing: easing,
            onChange: function (value) {
                child[prop] = value;
                child.outConnectors.forEach(function (connector) {
                    connector.set({x1: child.left, y1: child.top});
                });
                // only render once
                if (i === theDataWidget.visualVariables.length - 1 && prop === 'left') {
                    canvas.renderAll();
                }
            },
            onComplete: function () {
                child.setCoords();
                if (!child.added) {
                    theDataWidget.addChild(child);
                }
                computeUntransformedProperties(child);
                if (i === theDataWidget.visualVariables.length - 1 && prop === 'left') {
                    canvas.renderAll();
                }
            }
        });
    },
    compress: function () {

        if (this.visualVariables.length <= 1) {
            return;
        }

        var theDataWidget = this;
        theDataWidget.isCompressed = true;

        var duration = 1000;
        var easing = fabric.util.ease.easeOutQuint;

        // saving the current width of the aggregator
        theDataWidget.expandedWidth = this.width;

        theDataWidget.transitionWidth = this.compressedWidth;

        theDataWidget.animate('height', theDataWidget.compressedHeight, {
            duration: duration,
            easing: easing,
            onChange: canvas.renderAll.bind(canvas),
        });
        var newTop = theDataWidget.top - (theDataWidget.height - theDataWidget.compressedHeight) / 2;
        theDataWidget.animate('top', newTop, {
            duration: duration,
            easing: easing,
            onChange: canvas.renderAll.bind(canvas),
        });


        var clonnedAggregator = fabric.util.object.clone(theDataWidget);
        clonnedAggregator.width = this.compressedWidth;
        var realWidth = clonnedAggregator.getWidth() + (theDataWidget.getScaleX() * theDataWidget.strokeWidth);
        var topLeft = clonnedAggregator.getPointByOrigin('left', 'top');
        var x = topLeft.x + realWidth / 2;
        var y = topLeft.y + (theDataWidget.gap + theDataWidget.iText.height / 2) * theDataWidget.getScaleY();
        var rotatedPosition = fabric.util.rotatePoint(new fabric.Point(x, y), topLeft, fabric.util.degreesToRadians(theDataWidget.getAngle()));

        var i = 0;
        theDataWidget.visualVariables.forEach(function (visualVariable) {
            animateObjectProperty(visualVariable, 'scaleX', 0, duration, easing, false, true, false);
            animateObjectProperty(visualVariable, 'scaleY', 0, duration, easing, false, true, false);
            animateObjectProperty(visualVariable, 'top', rotatedPosition.y, duration, easing, false, true, false);
            animateObjectProperty(visualVariable, 'left', rotatedPosition.x, duration, easing, i == theDataWidget.visualVariables.length - 1, true, false);
            i++;
        });
//        for (var i = 0, len = theDataWidget.visualVariables.length; i < len; i++) {            
//            theDataWidget.animateChild(i, 'scaleX', 0, duration, easing);
//            theDataWidget.animateChild(i, 'scaleY', 0, duration, easing);            
//            theDataWidget.animateChild(i, 'top', rotatedPosition.y, duration, easing);
//            theDataWidget.animateChild(i, 'left', rotatedPosition.x, duration, easing);
//        }
    },
    expand: function (refreshCanvas) {

        if (!this.isCompressed)
            return;

        var theDataWidget = this;
        theDataWidget.setCoords();

        theDataWidget.isCompressed = false;

        var duration = 650;
        var easing = fabric.util.ease['easeOutQuint'];

        var newHeight = theDataWidget.visualVariables.length * (theDataWidget.variableHeight + this.gap / 2) + this.iText.height / 2 + 3 * this.gap;
//        var newWidth = boundingRect.width + 2 * theDataWidget.indent;
        var newTop = theDataWidget.top + newHeight / 2 - theDataWidget.height / 2;

        var clonnedDataWidget = fabric.util.object.clone(theDataWidget);
        clonnedDataWidget.top = newTop;
        clonnedDataWidget.height = newHeight;
        var topCenter = clonnedDataWidget.getPointByOrigin('center', 'top');
        theDataWidget.animate('top', newTop, {
            easing: easing,
            duration: duration,
        });
        theDataWidget.animate('height', newHeight, {
            duration: duration,
            easing: easing
        });

        var positions = new Array();
        var i = 0;
        theDataWidget.visualVariables.forEach(function (visualVariable) {

            var x = theDataWidget.left;
            var y = topCenter.y + theDataWidget.iText.height + 3 * theDataWidget.gap + i * (theDataWidget.variableHeight + theDataWidget.gap / 2);

//            drawRectAt(new fabric.Point(x,y), generateRandomColor());

            canvas.add(visualVariable);
            visualVariable.bringForward(true);

            visualVariable.left = theDataWidget.left;
            visualVariable.top = theDataWidget.top;
            visualVariable.scaleX = 0;
            visualVariable.scaleY = 0;
//            visualVariable.opacity = 0;

            positions.push({x: x, y: y});

            i++;
        });

//        var easing = fabric.util.ease['easeInCubic'];
        var easing = fabric.util.ease['easeOutQuad'];

        for (var i = 0; i < theDataWidget.visualVariables.length; i++) {

//            theDataWidget.animateChild(i, 'opacity', 1, duration, easing, false, false);
            theDataWidget.animateChild(i, 'scaleX', 1, duration, easing, false, false);
            theDataWidget.animateChild(i, 'scaleY', 1, duration, easing, false, false);
            theDataWidget.animateChild(i, 'left', positions[i].x, duration, easing, false, false);
            theDataWidget.animateChild(i, 'top', positions[i].y, duration, easing, refreshCanvas && i == theDataWidget.visualVariables.length - 1, false);

        }

    },
    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },
    _render: function (ctx, noTransform) {

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

        if (this.selected) {
            this.stroke = widget_selected_stroke_color;
            this.strokeWidth = widget_selected_stroke_width;
            this.strokeDashArray = widget_selected_stroke_dash_array;
        } else {
            this.stroke = dataWidgetStrokeColor;
            this.strokeWidth = dataWidgetStrokeWidth;
            this.strokeDashArray = [];
        }

        this._renderStroke(ctx);



        this.iText.left = this.left;
        var topCenter = this.getPointByOrigin('center', 'top');
        this.iText.top = topCenter.y + this.iText.height / 2 + this.gap;
        this.iText.scaleX = this.scaleX;
        this.iText.scaleY = this.scaleY;
        this.iText.setCoords();

//        ctx.font = '20px Courier New';
//        ctx.fillStyle = '#000';
//        ctx.textAlign = "center";
//        ctx.moveTo(0, 0);
//        ctx.fillText(this.fileName, 0, this.height / 2 - 20);




    }
});