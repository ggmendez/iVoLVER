var FatFontMark = fabric.util.createClass(fabric.IText, {
    type: 'fatFontMark',
    isFatFontMark: true,
    serializableProperties: ['left', 'top', 'fill', 'colorForStroke', 'radius', 'label', 'isCompressed', 'fontFamily', 'number', 'fontSize'],
    deserializer: addFatFontMarkToCanvas,
    initialize: function (text, options) {
        options || (options = {});

        options.fill = options.fill || ((options.values && options.values.fill) ? options.values.fill.color.toRgb() : '');
        options.label = options.label || ((options.values && options.values.label) ? options.values.label.string : '');
        options.angle = -(options.angle || ((options.values && options.values.angle) ? options.values.angle.number : 0));
        options.fontSize = options.fontSize || ((options.values && options.values.fontSize) ? options.values.fontSize.number : 80);

        this.callSuper('initialize', text, options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', options.strokeWidth || 2);

        this.set('colorForStroke', options.colorForStroke || this.stroke);

        this.set('hasBorders', true);

        this.createVariables();

        this.createIText();

        this.createRectBackground();

        var numberValue = null;
        var fontSizeValue = null;
        var angleValue = null;

        if (options.values) {
            numberValue = options.values.number || createNumericValue(this.number);
            fontSizeValue = options.values.fontSize || createNumericValue(this.fontSize, null, null, 'pixels');
            angleValue = options.values.angle || createNumericValue(-this.angle, null, null, 'degrees');
        } else {
            numberValue = createNumericValue(this.number);
            fontSizeValue = createNumericValue(this.fontSize, null, null, 'pixels');
            angleValue = createNumericValue(-this.angle, null, null, 'degrees');
        }

        this.specificProperties.push({attribute: "number", readable: true, writable: true, types: ['number'], updatesTo: ['label'], dataTypeProposition: 'isNumericData', value: createNumericValue(this.number)});
//      this.specificProperties.push({attribute: "fontFamily", readable: true, writable: true, types: ['string'], updatesTo: [], dataTypeProposition: 'isStringData', value: createNumericValue(this.fontFamily)});
        this.specificProperties.push({attribute: "fontSize", readable: true, writable: true, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: createNumericValue(this.fontSize)});
        this.specificProperties.push({attribute: "angle", readable: true, writable: true, types: ['number'], updatesTo: [], dataTypeProposition: 'isNumericData', value: createNumericValue(this.angle)});


        this.createVisualProperties();
        this.createPositionProperties(options.values);

        this.applySelectedStyle = function () {
        };
        this.applyUnselectedStyle = function () {
        };

        this.set('perPixelTargetFind', false);
        this.set('editable', false);
        this.set('shape', 'FatFont');

        this.changeColors = function (fill, stroke) {
            this.fill = fill;
            this.stroke = '';
            this.colorForStroke = stroke;
            this.backgroundRect.stroke = stroke;
            this.visualProperties.forEach(function (visualProperty) {
                if (!visualProperty.selected) {
                    visualProperty.stroke = stroke;
                }
                visualProperty.fill = fill;
                visualProperty.outConnectors.forEach(function (outConnector) {
                    outConnector.changeColor(stroke);
                });

            });
        };

        this.setCoreVisualPropertiesValues(options.values);

        this.applyXmlIDs(options.xmlIDs);

    },
    computeUpdatedValueOf: function (updater, value, updatedProperty) {
        if (updater == 'number') {
            value = Math.round(value);
            if (updatedProperty == 'label' && (this.label == ('' + this.number))) {
                return '' + value;
            } else {
                return this.label;
            }
        }
    },
    setProperty: function (property, propertyValue, theVisualProperty, shouldAnimate) {

        var theMark = this;


        if (property == 'shape') {

            if (propertyValue == theMark.shape) {
                return;
            }

            var waitingTime = 250;
            if (theMark.isCompressed) {
                waitingTime = 0;
            }

            setTimeout(function () {
                changeMarkShape(theMark, propertyValue);
            }, waitingTime);

        } else if (property == 'label') {

            this.setLabelProperty(propertyValue);

        } else if (property == 'fill') {

            this.setColorProperty(propertyValue);

        } else if (property == 'number') {

            var numericValue = propertyValue.number;

            theMark.label = theMark.computeUpdatedValueOf('number', numericValue, 'label');
            theMark.number = parseInt(numericValue);
            theMark.text = '' + theMark.number;



            if (theMark.number < 0) {
                theMark.fill = 'white';
                theMark.stroke = theMark.backgroundRect.stroke;
            } else {
                theMark.changeColors(theMark.visualProperties[0].fill, theMark.backgroundRect.stroke);
            }

//         if (theMark.number < 10) {
//            theMark.fontSize = 7;
//         } else if (theMark.number >= 10 && theMark.number < 100) {
//            theMark.fontSize = 20;
//         } else if (theMark.number >= 100 && theMark.number < 200) {
//            theMark.fontSize = 50;
//         } else {
//            theMark.fontSize = 70;
//         }

            theMark.originX = 'center';
            theMark.originY = 'center';
            this.setCoords();

            if (theMark.parentObject) {
                computeUntransformedProperties(theMark);
            }

            setTimeout(function () {
                theMark.positionElements();
                canvas.renderAll();
            }, 50);

            var visualProperty = theMark.getVisualPropertyByAttributeName('label');
            visualProperty.outConnectors.forEach(function (outConnector) {
                outConnector.setValue(theMark.label, false, false);
            });

            return theMark.number;

        } else {

            var numericValue = propertyValue.number;

            if (property == 'angle') {
                if (LOG)
                    console.log("Original value: " + numericValue);
                numericValue = numericValue % 360;
                if (LOG)
                    console.log("Modified value: " + numericValue);
            }

            var easing = fabric.util.ease['easeOutBack'];

            if (shouldAnimate) {
                theMark.animateProperty(property, numericValue, 500, easing);
            } else {
                theMark.changeProperty(property, numericValue);
            }

        }

        theMark.setCoords();
        canvas.renderAll();

    },
    positionLabel: function () {
        
        if (this.group) {
            return;
        }

        var groupLeft = 0;
        var groupTop = 0;
        var groupScaleX = 1;
        var groupScaleY = 1;

        this.setCoords();

        if (this.group) {
            groupLeft = this.group.left;
            groupTop = this.group.top;
            groupScaleX = this.group.getScaleX();
            groupScaleY = this.group.getScaleY();
        }

        var objectCenter = this.getCenterPoint();
        var boundingRect = this.getBoundingRect();

        // TODO: Eventually, this compensantion should not be necessary
        compensateBoundingRect(boundingRect);

        var boundingRectCenterBottom = new fabric.Point(this.left, objectCenter.y + (boundingRect.height / 2));
        boundingRectCenterBottom.y += this.labelGap;
        this.iText.text = this.label;
        this.iText.left = groupLeft + this.left * groupScaleX;
        this.iText.top = groupTop + boundingRectCenterBottom.y;
        this.iText.setCoords();

    },
//   _render: function (ctx) {
//      ctx.save();
//      this.callSuper('_render', ctx);
//      if (this.iText) {
//         this.positionLabel();
//      }
//      ctx.restore();
//   },

    _render: function (ctx) {
        
        this.set('editable', false);
        this.renderLocationLines(ctx);
        this.callSuper('_render', ctx);
        if (this.iText) {
            this.positionLabel();
        }
    },
    drawBorders: function (ctx) {

        if (!this.hasBorders || this.group) {
            return this;
        }

        var padding = this.padding, padding2 = padding * 2, vpt = this.getViewportTransform();

        ctx.save();

        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;

        ctx.strokeStyle = widget_selected_stroke_color;
        ctx.lineWidth = widget_selected_stroke_width;
        ctx.setLineDash(widget_selected_stroke_dash_array);

        var scaleX = 1 / this._constrainScale(this.scaleX),
                scaleY = 1 / this._constrainScale(this.scaleY);



        var w = this.getWidth(),
                h = this.getHeight(),
                strokeWidth = this.strokeWidth,
                capped = this.strokeLineCap === 'round' || this.strokeLineCap === 'square',
                vLine = this.type === 'line' && this.width === 0,
                hLine = this.type === 'line' && this.height === 0,
                sLine = vLine || hLine,
                strokeW = (capped && hLine) || !sLine,
                strokeH = (capped && vLine) || !sLine;

        if (vLine) {
            w = strokeWidth / scaleX;
        }
        else if (hLine) {
            h = strokeWidth / scaleY;
        }
        if (strokeW) {
            w += strokeWidth / scaleX;
        }
        if (strokeH) {
            h += strokeWidth / scaleY;
        }
        var wh = fabric.util.transformPoint(new fabric.Point(w, h), vpt, true),
                width = wh.x,
                height = wh.y;
        if (this.group) {
            width = width * this.group.scaleX;
            height = height * this.group.scaleY;
        }

        ctx.strokeRect(
                ~~(-(width / 2) - padding) - 0.5, // offset needed to make lines look sharper
                ~~(-(height / 2) - padding) - 0.5,
                ~~(width + padding2) + 1, // double offset needed to make lines look sharper
                ~~(height + padding2) + 1
                );

        if (this.hasRotatingPoint && this.isControlVisible('mtr') && !this.get('lockRotation') && this.hasControls) {

            var rotateHeight = (-height - (padding * 2)) / 2;

            ctx.beginPath();
            ctx.moveTo(0, rotateHeight);
            ctx.lineTo(0, rotateHeight - this.rotatingPointOffset);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
        return this;

    },
    generateOptionsForShape: function (newShapeType) {

        var theMark = this;

        var options = {
            left: theMark.left,
            top: theMark.top,
            fill: theMark.fill,
            stroke: theMark.colorForStroke || theMark.stroke,
            colorForStroke: theMark.colorForStroke || theMark.stroke,
            label: theMark.label,
            angle: theMark.angle,
        };

        if (newShapeType == CIRCULAR_MARK || newShapeType === SQUARED_MARK) {

            options.area = theMark.width * theMark.height;

        } else if (newShapeType == ELLIPTIC_MARK) {

            options.rx = theMark.width / 2;
            options.ry = theMark.height / 2;

        } else if (newShapeType == RECTANGULAR_MARK) {

            options.width = theMark.width;
            options.height = theMark.height;

        } else if (newShapeType == FATFONT_MARK) {

            options.fontFamily = 'Miguta';
            options.number = Math.round(theMark.area / 100);
            options.fontSize = Math.round((theMark.width + theMark.height) / 2);
            options.stroke = '';

        } else if (newShapeType === PATH_MARK || newShapeType == FILLEDPATH_MARK || newShapeType == SVGPATHGROUP_MARK) {

            options.targetWidth = theMark.width;
            options.targetHeight = theMark.height;

        }

        return options;

    }

});
Mark.call(FatFontMark.prototype);

function addFatFontMarkToCanvas(options) {

    options.colorForStroke = options.colorForStroke || options.stroke;
    options.stroke = '';
    options.number = options.number || ((options.values && options.values.number) ? options.values.number.number : 0);
    options.fontFamily = options.fontFamily || 'Miguta';

    var text = '' + options.number;
    var fatFontMark = new FatFontMark(text, options);
    canvas.add(fatFontMark);

    if (LOG)
        console.log("options:");
    if (LOG)
        console.log(options);


    var waitingTime = 0;
    if (options.animateAtBirth) {
        waitingTime = 1250;
        fatFontMark.animateBirth(options.markAsSelected, 1, 1, options.doNotRefreshCanvas);
    }

    fatFontMark.associateEvents();

    if (options.shouldExpand) {
        fatFontMark.expand(true);
    }

    setTimeout(function () {
        if (options.locatorXmlID) {
            var locator = connectableElements[options.locatorXmlID];
            locator.reportMarkAvailable(fatFontMark);
        }
        if (options.xmlID) {
            fatFontMark.executePendingConnections();
        }
    }, waitingTime);
    
    return fatFontMark;
}