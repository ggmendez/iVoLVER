function createSquareSelectionFromGroup(createdGroup) {

    createdGroup.isSelection = true;

    createdGroup.applySquaredSelectionStyle = function () {
        createdGroup.lockScalingX = true;
        createdGroup.lockScalingY = true;
        createdGroup.lockRotation = true;
        createdGroup.hasControls = false;
        createdGroup.hasBorders = true;
        createdGroup.padding = 10;
        createdGroup.borderColor = '#ffce0a';
        createdGroup.isCompressed = true;
    };

    createdGroup.addOtherElements = function () {

        var selectedObjects = createdGroup._objects;
        if (selectedObjects) {
            var totalSelectedObjects = selectedObjects.length;

            if (LOG) {
                console.log("Selection created with " + totalSelectedObjects + " objects");
            }

            if (totalSelectedObjects > 0) {
                selectedObjects.forEach(function (object) {
                    if (object.addToGroup) {
                        object.addToGroup(createdGroup);
                    }
                });
            }

            selectedObjects = createdGroup._objects;
            totalSelectedObjects = selectedObjects.length;
            if (LOG) {
                console.log("FINAL number of objects in the : " + totalSelectedObjects);
            }
            if (totalSelectedObjects > 0) {
                selectedObjects.forEach(function (object) {
                    object.previousLockMovementX = object.lockMovementX;
                    object.previousLockMovementY = object.lockMovementY;
                    object.lockMovementX = false;
                    object.lockMovementY = false;
                });
            }
        }

    };

    createdGroup.drawBorders = function (ctx) {

        if (!this.hasBorders) {
            return this;
        }

        ctx.save();

        ctx.setLineDash([7, 7]);

        ctx.fillStyle = 'rgba(229,238,244,0.3)';

        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = 3;

        var wh = this._calculateCurrentDimensions(true),
                width = wh.x,
                height = wh.y;
        if (this.group) {
            width = width * this.group.scaleX;
            height = height * this.group.scaleY;
        }

        ctx.fillRect(
                ~~(-(width / 2)) - 0.5, // offset needed to make lines look sharper
                ~~(-(height / 2)) - 0.5,
                ~~(width) + 1, // double offset needed to make lines look sharper
                ~~(height) + 1
                );

        ctx.strokeRect(
                ~~(-(width / 2)) - 0.5, // offset needed to make lines look sharper
                ~~(-(height / 2)) - 0.5,
                ~~(width) + 1, // double offset needed to make lines look sharper
                ~~(height) + 1
                );

        if (this.hasRotatingPoint && this.isControlVisible('mtr') && !this.get('lockRotation') && this.hasControls) {

            var rotateHeight = -height / 2;

            ctx.beginPath();
            ctx.moveTo(0, rotateHeight);
            ctx.lineTo(0, rotateHeight - this.rotatingPointOffset);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
        return this;
    };

    createdGroup.addAlignmentButtons = function () {

        createdGroup.alignmentButtons = new Object();

        var leftArrow = 'm -1879.8776,2895.2123 -10.8181,0 0,50.1239 10.8181,0 z m 19.3112,10.2276 -17.0832,14.8572 17.0832,14.8569 0,-8.5417 28.76,0 0,-12.6307 -28.76,0 z';
        var leftButton = new fabric.Path(leftArrow, {
            originX: 'center',
            originY: 'center',
            strokeWidth: 2,
            stroke: 'rgb(40,40,40)',
            fill: 'rgb(153, 153, 153)',
            selectable: false,
            evented: true,
            opacity: 1,
            permanentOpacity: 1,
            movingOpacity: 1,
            angle: 0,
            direction: 'left',
            perPixelTargetFind: false
        });
        createdGroup.alignmentButtons['left'] = leftButton;

        var rightButton = fabric.util.object.clone(leftButton);
        rightButton.angle = 180;
        rightButton.direction = 'right';
        createdGroup.alignmentButtons['right'] = rightButton;

        var topButton = fabric.util.object.clone(leftButton);
        topButton.angle = 90;
        topButton.direction = 'top';
        createdGroup.alignmentButtons['top'] = topButton;

        var bottomButton = fabric.util.object.clone(leftButton);
        bottomButton.angle = 270;
        bottomButton.direction = 'bottom';
        createdGroup.alignmentButtons['bottom'] = bottomButton;

        var distributeIcon = 'm 0,0 0,45.90625 9.90625,0 0,-45.90625 z m 62.5625,0 0,45.90625 9.90625,0 0,-45.90625 z m -34.46875,9.34375 -15.625,13.59375 15.625,13.625 0,-7.84375 16.3125,0 0,7.84375 15.625,-13.625 -15.625,-13.59375 0,7.8125 -16.3125,0 z';
        var distributeHorizontallyButton = new fabric.Path(distributeIcon, {
            originX: 'center',
            originY: 'center',
            strokeWidth: 2,
            stroke: 'rgb(40,40,40)',
            fill: 'rgb(153, 153, 153)',
            selectable: false,
            evented: true,
            opacity: 1,
            permanentOpacity: 1,
            movingOpacity: 1,
            angle: 0,
            direction: 'distributeHorizontally',
            perPixelTargetFind: false
        });
        createdGroup.alignmentButtons['distributeHorizontally'] = distributeHorizontallyButton;


        var distributeVerticallyButton = fabric.util.object.clone(distributeHorizontallyButton);
        distributeVerticallyButton.angle = -90;
        distributeVerticallyButton.direction = 'distributeVertically';
        createdGroup.alignmentButtons['distributeVertically'] = distributeVerticallyButton;

        var groupedObjects = createdGroup._objects;

        var alignmentButtons = createdGroup.alignmentButtons;
        for (var name in alignmentButtons) {
            var button = alignmentButtons[name];
            button.on({
                'mousedown': function (options) {

                    var theButton = this;

                    setTimeout(function () {

                        var alignmentProperty = theButton.direction;
                        alignObjectsTo(groupedObjects, alignmentProperty);

                        setTimeout(function () {
                            regroupObjects(groupedObjects);
                        }, 550);

                    }, 100);
                },
            });
        }

    };

    createdGroup.positionAlignmentButtons = function () {

        createdGroup.setCoords();

        var leftTop = createdGroup.getPointByOrigin('left', 'top');
        leftTop.x -= createdGroup.padding;
        leftTop.y -= createdGroup.padding;

        var rightBottom = createdGroup.getPointByOrigin('right', 'bottom');
        rightBottom.x += createdGroup.padding;
        rightBottom.y += createdGroup.padding;

        var centerPoint = createdGroup.getPointByOrigin('center', 'center');
//        drawRectAt(centerPoint, "blue");

        for (var name in createdGroup.alignmentButtons) {

            var button = createdGroup.alignmentButtons[name];

            var x, y, originX, originY;

            if (name === 'top') {

//                x = leftTop.x - 10;
//                y = leftTop.y;
//                originX = 'left';
//                originY = 'top';

                x = rightBottom.x + 10;
                y = leftTop.y;
                originX = 'left';
                originY = 'bottom';

            } else if (name === 'left') {

//                x = leftTop.x;
//                y = leftTop.y - 10;
//                originX = 'left';
//                originY = 'bottom';

                x = leftTop.x;
                y = rightBottom.y + 10;
                originX = 'left';
                originY = 'top';

            } else if (name === 'bottom') {

                x = rightBottom.x + 10;
                y = rightBottom.y;
                originX = 'left';
                originY = 'top';

            } else if (name === 'right') {

                x = rightBottom.x;
                y = rightBottom.y + 10;
                originX = 'left'; // because this is rotated
                originY = 'bottom';

            } else if (name === 'distributeHorizontally') {

                x = centerPoint.x;
                y = leftTop.y - 10;
                originX = 'center';
                originY = 'bottom';

            } else if (name === 'distributeVertically') {

                x = leftTop.x - 10;
                y = centerPoint.y;
                originX = 'center';
                originY = 'bottom';

            }

            var position = new fabric.Point(x, y);
//            drawRectAt(position, "red");

            button.flipX = false;
            button.flipY = false;
            button.setPositionByOrigin(position, originX, originY);

        }

    };

    createdGroup.expand = function () {
        if (!createdGroup.isCompressed) {
            return;
        }
        createdGroup.positionAlignmentButtons();
        for (var name in createdGroup.alignmentButtons) {
            var button = createdGroup.alignmentButtons[name];
            canvas.add(button);
            animateAlignmentButtonScale(createdGroup, button, 0, 1, false);
        }
        createdGroup.isCompressed = false;
    };

    createdGroup.compress = function () {
        if (createdGroup.isCompressed) {
            return;
        }
        createdGroup.positionAlignmentButtons();
        for (var name in createdGroup.alignmentButtons) {
            var button = createdGroup.alignmentButtons[name];
            animateAlignmentButtonScale(createdGroup, button, 1, 0, true);
        }
        createdGroup.isCompressed = true;
        canvas.renderAll();
    };

    createdGroup.associateEvents = function () {

        createdGroup.on('moving', function (option) {

            createdGroup.positionAlignmentButtons();

            console.log("Moving selection");
            var selectedObjects = createdGroup._objects;
            selectedObjects.forEach(function (object) {
                if (object.positionElements) {
                    object.positionElements();
                }
                updateConnectorsPositions(object);
            });
        });

        createdGroup.on('doubleTap', function (option) {
            if (createdGroup.isCompressed) {
                createdGroup.expand(true);
            } else {
                createdGroup.compress(true);
            }
        });
    };

    createdGroup.applySquaredSelectionStyle();

    createdGroup.addOtherElements();

    createdGroup.associateEvents();

    createdGroup.addAlignmentButtons();

}

function regroupObjects(objects) {

    var group = new fabric.Group([]);

    objects.forEach(function (object) {
        group.addWithUpdate(object);
    });

    createSquareSelectionFromGroup(group);

    group.regrouped = true; // used to decide further actions on the clearing of a selection

//    group.expand();

    canvas.add(group);

    group.setCoords();

    canvas.setActiveGroup(group);



    canvas.renderAll();

}

function alignObjectsTo(objects, alignmentProperty) {

    console.log("alignmentProperty: " + alignmentProperty);

    var maxCoordinate = null;
    var easing = fabric.util.ease['easeOutExpo'];
    var duration = 500;
    var alignableObjects = new Array();

    var originX = null, originY = null, coordinate = null, otherCoordinate = null;
    if (alignmentProperty === 'top' || alignmentProperty === 'bottom') {
        originX = 'center';
        originY = alignmentProperty;
        coordinate = 'y';
    } else if (alignmentProperty === 'left' || alignmentProperty === 'right') {
        originX = alignmentProperty;
        originY = 'center';
        coordinate = 'x';
    } else if (alignmentProperty === 'distributeHorizontally') {

        var toSort = new Array();
        var totalObjectsWidth = 0;

        objects.forEach(function (object) {
            if (object.isAlignable) {
                totalObjectsWidth += object.getWidth();
                toSort.push(object);
            }
        });

        var sortedObjects = toSort.sort(compareByCentralX);
        var totalObjects = sortedObjects.length;


        var leftObject = sortedObjects[0];
        var rightObject = sortedObjects[totalObjects - 1];

        if (leftObject && rightObject) {

            var p1 = leftObject.getPointByOrigin('left', 'top');
            var p2 = rightObject.getPointByOrigin('right', 'top');
            var availableWidth = Math.abs(p1.x - p2.x);

            var spacing = (availableWidth - totalObjectsWidth) / (totalObjects - 1);

            var cummulativeWidth = leftObject.getWidth();
            var initialLeft = p1.x;
            var currentLeft = initialLeft + cummulativeWidth + spacing;

            for (var i = 1; i < totalObjects - 1; i++) { // the left and right objects are ignored, as they do not need to be moved
                var object = sortedObjects[i];
                object.animatePositionProperty('left', currentLeft, duration, easing, false);
                cummulativeWidth += object.getWidth();
                currentLeft = p1.x + cummulativeWidth + ((i + 1) * spacing);
            }

            fabric.util.animate({
                duration: duration,
                startValue: 1,
                easing: easing,
                endValue: duration,
                onChange: refresherFunction,
                onComplete: refresherFunction
            });

            return;

        }



    } else if (alignmentProperty === 'distributeVertically') {

        var toSort = new Array();
        var totalObjectsHeight = 0;

        objects.forEach(function (object) {
            if (object.isAlignable) {
                totalObjectsHeight += object.getHeight();
                toSort.push(object);
            }
        });

        var sortedObjects = toSort.sort(compareByCentralY);
        var totalObjects = sortedObjects.length;

        var topObject = sortedObjects[0];
        var bottomObject = sortedObjects[totalObjects - 1];

        var p1 = topObject.getPointByOrigin('center', 'top');
        var p2 = bottomObject.getPointByOrigin('center', 'bottom');
        var availableHeight = Math.abs(p1.y - p2.y);

        var spacing = (availableHeight - totalObjectsHeight) / (totalObjects - 1);

        var cummulativeHeight = topObject.getHeight();
        var initialTop = p1.y;
        var currentTop = initialTop + cummulativeHeight + spacing;

        for (var i = 1; i < totalObjects - 1; i++) { // the left and right objects are ignored, as they do not need to be moved
            var object = sortedObjects[i];
            object.animatePositionProperty('top', currentTop, duration, easing, false);
            cummulativeHeight += object.getHeight();
            currentTop = initialTop + cummulativeHeight + ((i + 1) * spacing);
        }

        fabric.util.animate({
            duration: duration,
            startValue: 1,
            easing: easing,
            endValue: duration,
            onChange: refresherFunction,
            onComplete: refresherFunction
        });

        return;

    }

    objects.forEach(function (object) {
        if (object.isAlignable) {
            var centerPoint = object.getPointByOrigin(originX, originY);
            var currentCoordinate = centerPoint[coordinate];
            if (maxCoordinate === null) {
                maxCoordinate = currentCoordinate;
            } else {
                if (alignmentProperty === 'bottom' || alignmentProperty === 'right') {
                    if (currentCoordinate > maxCoordinate) {
                        maxCoordinate = currentCoordinate;
                    }
                } else {
                    if (currentCoordinate < maxCoordinate) {
                        maxCoordinate = currentCoordinate;
                    }
                }
            }
            alignableObjects.push(object);
        }
    });

    if (alignmentProperty === 'bottom') {
        easing = fabric.util.ease['easeOutBounce'];
    } else if (alignmentProperty === 'top') {
        easing = fabric.util.ease['easeOutBack'];
    }

    alignableObjects.forEach(function (object) {
        object.animatePositionProperty(alignmentProperty, maxCoordinate, duration, easing, false);
    });

    fabric.util.animate({
        duration: duration,
        startValue: 1,
        easing: easing,
        endValue: duration,
        onChange: refresherFunction,
        onComplete: refresherFunction
    });

}

function animateAlignmentButtonScale(group, object, from, to, removeAfterAnimation) {

    object.scaleX = from;
    object.scaleY = from;

    var duration = 400;
    var easing = fabric.util.ease['easeOutBack'];
    object.animate('scaleX', to, {
        duration: duration,
        easing: easing,
    });
    object.animate('scaleY', to, {
        duration: duration,
        onChange: function () {
            group.positionAlignmentButtons();
            canvas.renderAll();
        },
        onComplete: function () {
            if (removeAfterAnimation) {
                object.remove();
            }
            group.positionAlignmentButtons();
            canvas.renderAll();
        },
        easing: easing,
    });
}