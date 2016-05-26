var CollectionAttributeSelector = fabric.util.createClass(fabric.Rect, {
    isCollectionAttributeSelector: true,
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
        this.set('width', options.width || 240);
        this.set('height', options.height || 100);
        this.set('fill', options.fill || rgb(204, 204, 204));
        this.set('stroke', options.stroke || rgb(45, 45, 45));
        this.set('strokeWidth', 3);

        this.set('inputPosition', -1);

        this.set('attribute', 'Size');
        this.set('defaultFontSize', 25);

        this.set('isCompressed', true);
        this.set('rx', 5);
        this.set('ry', this.rx);

        this.set('originX', 'center');
        this.set('originY', 'center');

        this.set('topElements', new Array());

        this.addAttributesList();
        this.addOutPoint();
        this.addCollection();


        this.associateEvents();

        this.positionElements(false);




    },
    bringTopElementsToFront: function () {
        var theCollectionAttributeSelector = this;
        theCollectionAttributeSelector.bringToFront(true);
        theCollectionAttributeSelector.setCoords();
        theCollectionAttributeSelector.topElements.forEach(function (element) {
            element.bringToFront(true);
            bringConnectorsToFront(element);
            element.setCoords();
        });

        // This following two lines are executed so that, after bringing everything to the front, the collections' in and out connectors are also brought to the front
        theCollectionAttributeSelector.theCollection.positionConnectors();

    },
    applySelectedStyle: function () {
        this.selected = true;
    },
    applyUnselectedStyle: function () {
        this.selected = false;
    },
    updateOutputVisualValuePropositions: function () {

        var theCollectionAttributeSelector = this;

        if (!theCollectionAttributeSelector.theCollection.isEmpty()) {
            theCollectionAttributeSelector.outputPoint.dataTypeProposition = theCollectionAttributeSelector.theCollection.dataTypeProposition;
            theCollectionAttributeSelector.outputPoint[theCollectionAttributeSelector.outputPoint.dataTypeProposition] = true;
        }
    },
    updateOutputVisibilityStatus: function () {

        var theCollectionAttributeSelector = this;

        if (!theCollectionAttributeSelector.theCollection.isEmpty() && theCollectionAttributeSelector.theCollection.iconName) {
            theCollectionAttributeSelector.outputPoint.fill = icons[theCollectionAttributeSelector.theCollection.iconName].fill;
            theCollectionAttributeSelector.outputPoint.stroke = icons[theCollectionAttributeSelector.theCollection.iconName].stroke;
            
            // any connector going out of this output point should also be 
            theCollectionAttributeSelector.outputPoint.outConnectors.forEach(function (connector) {
                connector.changeColor(theCollectionAttributeSelector.outputPoint.stroke);
            });
            
            if (!theCollectionAttributeSelector.outputPoint.opacity) {
                theCollectionAttributeSelector.outputPoint.opacity = 1;
                theCollectionAttributeSelector.outputPoint.permanentOpacity = 1;
                theCollectionAttributeSelector.outputPoint.movingOpacity = 1;
                blink(theCollectionAttributeSelector.outputPoint, false, 0.3);
                theCollectionAttributeSelector.outputPoint.selectable = true;
                theCollectionAttributeSelector.outputPoint.evented = true;
            }
        } else {
            theCollectionAttributeSelector.outputPoint.opacity = 0;
            theCollectionAttributeSelector.outputPoint.permanentOpacity = 0;
            theCollectionAttributeSelector.outputPoint.movingOpacity = 0;
            theCollectionAttributeSelector.outputPoint.selectable = false;
            theCollectionAttributeSelector.outputPoint.evented = false;
        }

    },
    buildAttributesList: function () {

        var theAttributeSelector = this;

        var attributes = [
            'Size',
            'First',
            'Last',
            'Min',
            'Max'
        ];

        var selector = $('<select />', {style: 'font-family: Calibri; border: none; background: transparent; padding: 0; -webkit-appearance: none; -moz-appearance: none;'});
        attributes.forEach(function (item) {
            var currentOption = $('<option />', {value: item, text: item, selected: item.factor === theAttributeSelector.attribute});
            currentOption.appendTo(selector);
        });

        selector.on('change', function (e) {
            theAttributeSelector.attribute = selector.val();
            var outputValue = theAttributeSelector.computeOutput();
            theAttributeSelector.outputPoint.setValue(outputValue, false);
            canvas.renderAll();
        });

        selector.focus(function () {
            selector.blur();
//            selector.css("border", "none");
//            selector.css("outline", "none");
//            selector.css("outline-width", "0px");
//            selector.css("outline-color", "transparent");
//            selector.css("outline-style", "none");
        });

        return selector;

    },
    positionAttributesList: function () {

        var theAttributeSelector = this;
        var attributesList = theAttributeSelector.attributesList;

        var centerPoint = theAttributeSelector.getCenterPoint();
        var topLeft = theAttributeSelector.getPointByOrigin('left', 'top');

//        var canvasPoint = new fabric.Point(centerPoint.x - 20, centerPoint.y - (attributesList.height() / 2) / canvas.getZoom() + 3);
//        
        var canvasPoint = new fabric.Point(topLeft.x + 15, centerPoint.y - (attributesList.height() / 2) / canvas.getZoom() + 3);


//        centerPoint.x -= (22 / canvas.getZoom());        
//        centerPoint.y -= ((attributesList.height()/2)/canvas.getZoom());

        var screenCoordinates = getScreenCoordinates(canvasPoint);

        attributesList.css('position', 'absolute');
//        attributesList.css('left', (center.x - 10* canvas.getZoom()) + 'px');
//        attributesList.css('top', (center.y - 25* canvas.getZoom()) + 'px');        
        attributesList.css('left', screenCoordinates.x + 'px');
        attributesList.css('top', screenCoordinates.y + 'px');


        attributesList.css('font-size', (theAttributeSelector.defaultFontSize * canvas.getZoom()) + 'px');
//        attributesList.css('font-size', canvas.getZoom() * 100 + '%');



//        attributesList.css('-ms-transform', 'scale(' + canvas.getZoom() + ',' + canvas.getZoom() + ')');
//        attributesList.css('-webkit-transform', 'scale(' + canvas.getZoom() + ',' + canvas.getZoom() + ')');
//        attributesList.css('transform:', 'scale(' + canvas.getZoom() + ',' + canvas.getZoom() + ')');

    },
    _render: function (ctx, noTransform) {

        var theAttributeSelector = this;

        this.callSuper('_render', ctx);

        ctx.save();

        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";


        var attributesList = theAttributeSelector.attributesList;

        var gap = 8;
        var arrowSide = 15;
        var arrowSpace = arrowSide + 10;
//        var x = -20 - theAttributeSelector.strokeWidth*canvas.getZoom() / 2;
//        var y = -(attributesList.height() / 2) / canvas.getZoom() + theAttributeSelector.strokeWidth*canvas.getZoom() / 2;        
        var x = -theAttributeSelector.width / 2 + 15 - theAttributeSelector.strokeWidth;
        var y = -(attributesList.height() / 2) / canvas.getZoom() + theAttributeSelector.strokeWidth;
        var width = attributesList.width() / canvas.getZoom() + 30;
        var height = attributesList.height() / canvas.getZoom();

        ctx.fillRect(x, y, width, height);


        ctx.save();
        ctx.strokeStyle = rgb(45, 45, 45);
        ctx.lineWidth = 2;
        ctx.rect(x, y + 1, width, height);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "black";



        var firstX = x + width - arrowSpace + gap / 2;
        var secondX = firstX + arrowSide;
        var thirdX = firstX + arrowSide / 2;

        var firstY = -3;

        var path = new Path2D();
        path.moveTo(firstX, firstY);
        path.lineTo(secondX, firstY);
        path.lineTo(thirdX, firstY + arrowSide);
        ctx.fill(path);

        ctx.font = "25px Calibri";
        ctx.fillText("of", secondX + 18, 10);

        ctx.restore();


        theAttributeSelector.positionAttributesList();

    },
    addAttributesList: function () {

        var theAttributeSelector = this;

        var attributesList = theAttributeSelector.buildAttributesList();

        theAttributeSelector.attributesList = attributesList;

        theAttributeSelector.positionAttributesList();

        $("body").append(attributesList);

    },
    addCollection: function () {

        var theCollectionAttributeSelector = this;

        var theCollection = new VerticalCollection({
            isCollectionAttributeSelectorInCollection: true,
            originX: 'center',
            originY: 'center',
            stroke: theCollectionAttributeSelector.outputPoint.stroke,
            fill: theCollectionAttributeSelector.outputPoint.fill,
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
            attributeSelector: theCollectionAttributeSelector,
        });

        theCollectionAttributeSelector.theCollection = theCollection;
        theCollectionAttributeSelector.topElements.push(theCollection);
        canvas.add(theCollection);

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

        var theCollectionAttributeSelector = this;
        var centerPoint = theCollectionAttributeSelector.getCenterPoint();
        var topLeft = theCollectionAttributeSelector.getPointByOrigin('left', 'top');
        var gap = 15; // vertical space between the top border of the mapper and the top border of its collections       

        if (theCollectionAttributeSelector.theCollection) {
            theCollectionAttributeSelector.theCollection.setPositionByOrigin(new fabric.Point(topLeft.x + 170, topLeft.y + gap), 'center', 'top');
            theCollectionAttributeSelector.theCollection.setCoords();
        }

        var inPointX = centerPoint.x + 115;
        var inPointY = topLeft.y + theCollectionAttributeSelector.compressedHeight / 2;
        if (theCollectionAttributeSelector.outputPoint) {
            theCollectionAttributeSelector.outputPoint.left = inPointX;
            if (theCollectionAttributeSelector.outputPoint.isCompressed || !theCollectionAttributeSelector.outputPoint.relativeY) {
                theCollectionAttributeSelector.outputPoint.top = inPointY + 5;
            } else {
                theCollectionAttributeSelector.outputPoint.top = theCollectionAttributeSelector.outputPoint.relativeY + theCollectionAttributeSelector.getPointByOrigin('center', 'top').y;
            }
            theCollectionAttributeSelector.outputPoint.setCoords();
        }

        if (positionCollectionsElements) {
            theCollectionAttributeSelector.theCollection.positionElements(theCollectionAttributeSelector.valueScale);
        }

    },
    getCollection: function () {
        return this.theCollection;
    },
    getOutputPoint: function () {
        return this.outputPoint;
    },
    associateEvents: function () {
        var theCollectionAttributeSelector = this;
        theCollectionAttributeSelector.on({
            'moving': function (options) {

                theCollectionAttributeSelector.positionElements(true);
                theCollectionAttributeSelector.outputPoint.updateConnectorsPositions();

            },
            'collectionElementMoved': function (options) {

                var theCollection = options.collection;
                var movedElement = options.movedElement;
                var shouldAnimate = false;

                var theOtherCollection = null;
                if (theCollection.isCollectionAttributeSelectorInCollection) {
                    theOtherCollection = theCollection.mapper.outCollection;
                } else {
                    theOtherCollection = theCollection.mapper.theCollection;
                }

                theCollection.matchingY = movedElement.relativeY + (movedElement.scaleY * movedElement.height / 2);

                if (theOtherCollection) {

                    theOtherCollection.matchingY = movedElement.relativeY + (movedElement.scaleY * movedElement.height / 2);

                }

                var outputValue = theCollectionAttributeSelector.computeOutput();
                theCollectionAttributeSelector.outputPoint.setValue(outputValue, false);

            },
            'collectionElementManipulationStopped': function (options) {

                var theCollectionAttributeSelector = this;

                var shouldAnimate = false;

                var movedElement = options.movedElement;

                var outputValue = theCollectionAttributeSelector.computeOutput();

                console.log("outputValue: ");
                console.log(outputValue);

                theCollectionAttributeSelector.outputPoint.setValue(outputValue, true);

                canvas.renderAll();

            },
            'collectionValueChanged': function (options) {

                var shouldAnimate = false;

                var theCollectionAttributeSelector = this;

                var theCollection = theCollectionAttributeSelector.theCollection;

                var changedVisualValue = options.visualValue;

                var outputValue = theCollectionAttributeSelector.computeOutput();
                theCollectionAttributeSelector.outputPoint.setValue(outputValue, false);

            },
            'visualValueAdded': function (options) { // TODO IMPORTANT: At the moment, this event is not being controlled by mappers or getters, which also should be notified when a collection changes because of a new value

                var shouldAnimate = false;

                var theCollectionAttributeSelector = this;

                var theCollection = theCollectionAttributeSelector.theCollection;
                theCollection.visualValues.sort(compareByTop);
                var outputValue = theCollectionAttributeSelector.computeOutput();
                theCollectionAttributeSelector.outputPoint.setValue(outputValue, false);


            },
            'collectionChanged': function (options) {

                var shouldAnimate = false;

                var theCollectionAttributeSelector = this;

                var theCollection = theCollectionAttributeSelector.theCollection;
                theCollection.visualValues.sort(compareByTop);
                var outputValue = theCollectionAttributeSelector.computeOutput();
                theCollectionAttributeSelector.outputPoint.setValue(outputValue, false);


            },
            'valueChanged': function (options) {

                var shouldAnimate = false;

                var theCollectionAttributeSelector = this;

                var theCollection = theCollectionAttributeSelector.theCollection;

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

                    console.log("Algo hay que hacer aquí...");

                    var outputValue = theCollectionAttributeSelector.computeOutput();
                    theCollectionAttributeSelector.outputPoint.setValue(outputValue, false);

                }

            },
        });
    },
    evaluateSingleNumber: function (value) {

        var theCollectionAttributeSelector = this;

        /*console.log("********************************************************************************************************************");
         console.log("********************************************************************************************************************");
         console.log("%cEvaluating A NUMBER this single value:", "background: " + theCollectionAttributeSelector.fill);
         console.log(value);*/

        var theCollection = theCollectionAttributeSelector.getCollection();
        var valuesArray = theCollection.getValues();


        var closestResults = getClosestElement(value, valuesArray);

        var closestValue = closestResults.closestValue;


        var closestElementPosition = closestResults.position;

        var minimumValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition);

        /*console.log("%c closestValue: " + closestValue.number, "background: " + theCollectionAttributeSelector.fill);
         console.log("%c closestElementPosition: " + closestElementPosition, "background: " + theCollectionAttributeSelector.fill);
         console.log("%c minimumValue: ", "background: " + theCollectionAttributeSelector.fill);
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

            secondLowestValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition + 1);
            secondLowestPosition = closestElementPosition + 1;
            firstVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(secondLowestPosition);

        } else if (closestElementPosition === theCollection.getTotalValues() - 1) { // is the closest value the LAST element of the collection? Then, there is nothing after

            console.log("%c ++++ CASE 2", "background: yellow; color: black;");

            secondLowestValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition - 1);
            secondLowestPosition = closestElementPosition - 1;
            firstVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(secondLowestPosition);

        } else {

            console.log("%c ++++ CASE 3", "background: yellow; color: black;");

            // The closest element is somewhere in the middle of the collection
            beforeValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition - 1); // the before element
            afterValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition + 1); // the after element

            secondLowestValue = null;
            secondLowestPosition = null;
            if (beforeValue.number < afterValue.number) {
                secondLowestValue = beforeValue;
                secondLowestPosition = closestElementPosition - 1;

            } else {
                secondLowestValue = afterValue;
                secondLowestPosition = closestElementPosition + 1;

            }

            firstVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(secondLowestPosition);

        }

        console.log("%c beforeValue: ", "beforeValue: " + theCollectionAttributeSelector.fill);
        console.log(beforeValue);

        console.log("%c afterValue: ", "afterValue: " + theCollectionAttributeSelector.fill);
        console.log(afterValue);

        console.log("%c secondLowestPosition: " + secondLowestPosition, "background: " + theCollectionAttributeSelector.fill);

        console.log("%c secondLowestValue: ", "background: " + theCollectionAttributeSelector.fill);
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

        var theCollectionAttributeSelector = this;

        /*console.log("********************************************************************************************************************");
         console.log("********************************************************************************************************************");
         console.log("%cEvaluating this single value:", "background: " + theCollectionAttributeSelector.fill);
         console.log(value);*/

        var theCollection = theCollectionAttributeSelector.getCollection();
        var valuesArray = theCollection.getValues();
        var distances = value.getDistancesTo(valuesArray);

//            console.log("%c valuesArray: ", "background: " + theCollectionAttributeSelector.fill);
//            var k = 0;
//            valuesArray.forEach(function (colorValue) {
//                console.log(k + ": " + colorValue.color.toRgb() + " distance: " + distances[k]);
//                k++;
//            });

        /*console.log("%c distances: " + distances, "background: " + theCollectionAttributeSelector.fill);
         console.log(distances);*/

        var minimunDistance = Math.min.apply(Math, distances);
        var closestElementPosition = distances.indexOf(minimunDistance);
        var minimumValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition);

        /*console.log("%c minimunDistance: " + minimunDistance, "background: " + theCollectionAttributeSelector.fill);
         console.log("%c closestElementPosition: " + closestElementPosition, "background: " + theCollectionAttributeSelector.fill);
         console.log("%c minimumValue: ", "background: " + theCollectionAttributeSelector.fill);
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

            afterValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition + 1);
            afterDistance = value.getDistanceTo(afterValue);

            secondLowestDistance = afterDistance;
            secondLowestValue = afterValue;
            secondLowestPosition = closestElementPosition + 1;

            firstVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(secondLowestPosition);

        } else if (closestElementPosition === theCollection.getTotalValues() - 1) { // is the closest value the LAST element of the collection? Then, there is nothing after

//            console.log("%c ++++ CASE 2", "background: yellow; color: black;");

            beforeValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition - 1);
            beforeDistance = value.getDistanceTo(beforeValue);

            secondLowestDistance = beforeDistance;
            secondLowestValue = beforeValue;
            secondLowestPosition = closestElementPosition - 1;

            firstVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(secondLowestPosition);

        } else {

//            console.log("%c ++++ CASE 3", "background: yellow; color: black;");

            // The closest element is somewhere in the middle of the collection
            beforeValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition - 1); // the before element
            afterValue = theCollectionAttributeSelector.getCollection().getValueAt(closestElementPosition + 1); // the after element

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

            firstVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(closestElementPosition);
            secondVisualValue = theCollectionAttributeSelector.getCollection().getVisualValueAt(secondLowestPosition);

        }

        /*console.log("%c beforeValue: ", "beforeValue: " + theCollectionAttributeSelector.fill);
         console.log(beforeValue);
         
         console.log("%c afterValue: ", "afterValue: " + theCollectionAttributeSelector.fill);
         console.log(afterValue);
         
         console.log("%c beforeDistance: " + beforeDistance, "background: " + theCollectionAttributeSelector.fill);
         console.log("%c afterDistance: " + afterDistance, "background: " + theCollectionAttributeSelector.fill);
         
         console.log("%c secondLowestPosition: " + secondLowestPosition, "background: " + theCollectionAttributeSelector.fill);
         console.log("%c secondLowestDistance: " + secondLowestDistance, "background: " + theCollectionAttributeSelector.fill);
         
         console.log("%c secondLowestValue: ", "background: " + theCollectionAttributeSelector.fill);
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




        var theCollectionAttributeSelector = this;

        /*console.log("%cThe mapper is trying to evaluate the following value:", "background: " + theCollectionAttributeSelector.fill);
         console.log("%cThe evaluation will happen with this value for shouldAnimate:" + shouldAnimate, "background: " + theCollectionAttributeSelector.fill);
         console.log(value);*/

        if ($.isArray(value)) {

            // Each of the elements of the received array has to be evaluated. The output of this process should be an array of values

            var outputValues = new Array();

            value.forEach(function (currentValue) {

                var currentEvaluationResult = theCollectionAttributeSelector.evaluateSingleValue(currentValue);

                /*console.log("evaluationResult:");
                 console.log(evaluationResult);*/

                var output = theCollectionAttributeSelector.computeOutput(currentEvaluationResult);
                outputValues.push(output);
            });

            theCollectionAttributeSelector.outputPoint.setValue(outputValues, shouldAnimate);

            /*console.log("RESULTS OF THE EVALUATION PROCESS:", "background: red; color: white;");
             console.log(outputValues);*/

        } else {

            // A single value is received. The value resulting from this evaluation process will be another single value
            var evaluationResult = theCollectionAttributeSelector.evaluateSingleValue(value);

            var outputValue = theCollectionAttributeSelector.computeOutput(evaluationResult);

            theCollectionAttributeSelector.outputPoint.setValue(outputValue, shouldAnimate);

        }

    },
    computeOutput: function () {

        console.log("%c" + "COMPUTING OUTPUT FOR A COLLECTION ATTRIBUTE SELECTION!!!", "background: #640b7e; color: white;");

        var theCollectionAttributeSelector = this;
        var theCollection = theCollectionAttributeSelector.theCollection;

        if (theCollection && !theCollection.isEmpty()) {

            var attribute = theCollectionAttributeSelector.attribute;
            var index = -1;
            var outputValue = null;

            if (attribute === "Size") {

                outputValue = createNumericValue(theCollection.getSize());

            } else if (attribute === "First") {

                index = 0;

            } else if (attribute === "Last") {

                index = theCollection.getSize() - 1;

            } else if (attribute === "Min") {

//                index = theCollection.getIndexOfMin();
                outputValue = theCollection.getMinValue();

            } else if (attribute === "Max") {

//                index = theCollection.getIndexOfMax();
                outputValue = theCollection.getMaxValue();

            }

            if (!outputValue || !outputValue.isNumericData) {
                outputValue = theCollection.getValueAt(index);
            }

            console.log("***** ---- outputValue:");
            console.log(outputValue);

            return outputValue;

        }

    }
});

function addCollectionAttributeSelector(x, y) {
    var aCollectionAttributeSelector = new CollectionAttributeSelector({
        left: x,
        top: y
    });
    canvas.add(aCollectionAttributeSelector);
    setTimeout(aCollectionAttributeSelector.bringTopElementsToFront(), 50);
    blink(aCollectionAttributeSelector.theCollection, false, 0.3);
    blink(aCollectionAttributeSelector, true, 0.2);
}