var RectangularExtractor = fabric.util.createClass(fabric.Rect, {
    type: 'rectangularExtractor',
    isRectangularExtractor: true,
    
    getExtractorType: function () {
        return RECTANGULAR_VIXOR;
    },
    
    initialize: function (options) {
        options || (options = {});
        this.callSuper('initialize', options);
        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', options.strokeWidth || 2);

        if (options.area) {
            var side = Math.sqrt(options.area);
            this.set('width', Math.abs(side));
            this.set('height', Math.abs(side));
            this.set('area', options.area);
        } else {
            this.set('width', options.width || 0);
            this.set('height', options.height || 0);
            this.set('area', Math.abs(this.width) * Math.abs(this.height));
        }

        this.set('shape', 'Rectangle');
       


        this.set('colorForStroke', options.colorForStroke || this.stroke);

        this.createRectBackground();

        this.set('widgets', new Array());
        this.set('visualProperties', new Array());

        this.set('specificProperties', new Array());
        
        this.specificProperties.push({attribute: "width", readable: true, writable: true, types: ['number'], updatesTo: ['area']});
        this.specificProperties.push({attribute: "height", readable: true, writable: true, types: ['number'], updatesTo: ['area']});
        this.specificProperties.push({attribute: "area", readable: true, writable: true, types: ['number'], updatesTo: ['width', 'height']});
        this.specificProperties.push({attribute: "angle", readable: true, writable: true, types: ['number'], updatesTo: []});

        this.createVisualProperties();

    },
    computeUpdatedValueOf: function (updater, value, updatedProperty) {
        if (updater == 'width' || updater == 'height') {
            if (updatedProperty == 'area') {
                return value * value;
            }
        } else if (updater == 'area') {
            if (updatedProperty == 'width') {
                return Math.sqrt(value);
            } else if (updatedProperty == 'height') {
                return Math.sqrt(value);
            }
        }
    },
    setProperty: function (property, value, theVisualProperty) {

//        if (LOG) console.log("property:");
//        if (LOG) console.log(property);
//
//        if (LOG) console.log("value:");
//        if (LOG) console.log(value);

        var theExtractor = this;

        if (property == 'label') {
            theExtractor.label = '' + value;
        } else if (property == 'fill') {
            
            var fillColor = value;
            var strokeColor = theVisualProperty.parentObject.colorForStroke;
            
             if (isHexColor(value)) {
                var rgbColor = hexToRGB(value);
                var r = rgbColor.r;
                var g = rgbColor.g;
                var b = rgbColor.b;
                strokeColor = darkenrgb(r, g, b);
            }
            
            theExtractor.changeColors(fillColor, strokeColor);
            
        } else if (property == 'width' || property == 'height' || property == 'area') {


            var changedVisualProperty = theExtractor.getVisualPropertyByAttributeName(property);
            var propertiesToUpdate = changedVisualProperty.updatesTo;

            if (property == 'area') {



                if (LOG) console.log("%cModifying " + changedVisualProperty.attribute + ". Value: " + value, "background:green; color:white;");



                theExtractor.area = value; // This value has to be updated as fabric does not know its link with the radius attribute

                // Updating all the attributes that are affected by the modifications in the area property

                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theExtractor.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theExtractor.computeUpdatedValueOf(property, value, attributeName);

                    if (LOG) console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");


                    var easing = fabric.util.ease['easeOutBack'];
                    if ((attributeName == 'width' || attributeName == 'height') && updatedValue < 15) {
                        easing = fabric.util.ease['easeOutCirc'];
                    }
                    theExtractor.animateProperty(attributeName, updatedValue, 500, easing);


                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(updatedValue, false, false);
                    });
                });

                property = 'width';
                value = Math.sqrt(value);

            } else if (property == 'width' || property == 'height') {

                if (LOG) console.log("Modifying " + property + ". Value: " + value);

                var easing = fabric.util.ease['easeOutBack'];
                if (value < 15) {
                    easing = fabric.util.ease['easeOutCirc'];
                }
                theExtractor.animateProperty(property, value, 500, easing);


                theExtractor.area = value * value;

                // Updating all the attributes that are affected by the modifications in the area property
                propertiesToUpdate.forEach(function (attributeName) {
                    var visualProperty = theExtractor.getVisualPropertyByAttributeName(attributeName);
                    var updatedValue = theExtractor.computeUpdatedValueOf(property, value, attributeName);

                    if (LOG) console.log("%cAfecting " + attributeName + ". Value: " + updatedValue, "background:red; color:white;");

                    var easing = fabric.util.ease['easeOutBack'];
                    if ((attributeName == 'width' || attributeName == 'height') && updatedValue < 15) {
                        easing = fabric.util.ease['easeOutCirc'];
                    }
                    theExtractor.animateProperty(attributeName, updatedValue, 500, easing);

                    visualProperty.outConnectors.forEach(function (outConnector) {
                        outConnector.setValue(updatedValue, false, false);
                    });
                });


            }






//            var easing = fabric.util.ease['easeOutBack'];
//            if (property == 'radius' && value < 15) {
//                easing = fabric.util.ease['easeOutCirc'];
//            }
//
//            theExtractor.animateProperty(property, value, 500, easing);


        } else {

            if (property == 'angle') {
                if (LOG) console.log("Original value: " + value);
                value = value % 360;
                if (LOG) console.log("Modified value: " + value);
            }

            var easing = fabric.util.ease['easeOutBack'];
            theExtractor.animateProperty(property, value, 500, easing);

        }

        canvas.renderAll();
        theExtractor.setCoords();

    },
    _render: function (ctx) {
        ctx.save();
        this.callSuper('_render', ctx);
        
        ctx.restore();
    }
});
Extractor.call(RectangularExtractor.prototype);

function addRectangularExtractorToCanvas(options) {
    var rectangularExtractor = new RectangularExtractor(options);
    canvas.add(rectangularExtractor);
    if (rectangularExtractor.width > 0 && rectangularExtractor.height > 0) {
        rectangularExtractor.animateBirth(options.markAsSelected);
    }
    rectangularExtractor.associateEvents();
}