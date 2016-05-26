var ColorData = fabric.util.createClass(fabric.Path, {
    serializableProperties: ['left', 'top', 'theType', 'value'],
    deserializer: addVisualValueToCanvas,
    initialize: function (options) {
        options || (options = {});
        var path = paths["fill"].rw;
        this.callSuper('initialize', path, options);

        this.set('dataTypeProposition', 'isColorData');
        this.set(this.dataTypeProposition, true);

        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', this.strokeWidth);

        // the given color could be also in the form of a string (usually, when the initialize function is called during an XML iVoLVER project file
        var fabricColor = options.theColor || new fabric.Color(rgb(112, 112, 112));

        this.set('value', createColorValue(fabricColor));

        this.set('fill', options.fill || rgb(112, 112, 112));
        this.set('stroke', options.stroke || darkenrgb(112, 112, 112));
        this.set('colorForStroke', options.stroke || darkenrgb(112, 112, 112));

        this.set('inConnectors', new Array());
        this.set('outConnectors', new Array());
        this.set('readable', true);
        this.set('writable', true);
        this.associateEvents();

        this.set('originX', 'center');
        this.set('originY', 'center');


        this.set({left: options.left, top: options.top});
        this.setCoords();

    },
    setValue: function (colorValue, refreshCanvas, shouldAnimate) {
        var theVisualValue = this;
        if (colorValue.isColorData) {
            theVisualValue.value = colorValue;

            if (theVisualValue.collection) {
                var options = {
                    visualValue: theVisualValue
                };
                theVisualValue.collection.trigger('valueChanged', options);
            }

            theVisualValue.outConnectors.forEach(function (outConnector) {
                outConnector.setValue(theVisualValue.value.clone(), false, shouldAnimate);
            });

            if (refreshCanvas) {
                canvas.renderAll();
            }
            return true; // Succes
        } else {
            return false; // error when trying to set the value of this data type. Some other function should deal witht this value in order to provide visual feedback to the user
        }
    },
    expand: function () {
        
        showColorChooser(this);
    },
//    expand: function () {
//        
//        
//
//        var theVisualValue = this;
//        var selectedColor = null;
//
//        var mainDiv = $('<div/>', {class: 'icon-large'});
//
//        if (LOG)
//            console.log("%cconfigurator:", "background:red; color:white;");
//        if (LOG)
//            console.log(mainDiv);
//
//        var padding = (theVisualValue.width / 4) * canvas.getZoom();
//
//        mainDiv.css('padding-right', padding + 'px');
//        mainDiv.css('padding-left', padding + 'px');
//
//        document.body.appendChild(mainDiv[0]);
//
//        var labelColorValue = $('<label/>', {text: 'Color' + ": ", style: "float: left; margin-right: 5px; font-size: 18px; margin-top: 13px;"});
//
//        var hexColor = '#' + this.value.color.toHex();
//        var colorRectangle = $('<div />', {id: 'colorRectangle', style: 'float: left; margin-top: 4px; margin-right: 10px; width: 40px; height: 30px; background: ' + hexColor + '; border-color: #000; border-style: solid; border-width: 1px;'});
//
//        var rgbColor = hexToRGB(hexColor);
//        var rValue = rgbColor.r;
//        var gValue = rgbColor.g;
//        var bValue = rgbColor.b;
//
//        var rTextField = $('<input />', {id: 'rTextField', maxlength: 3, type: 'number', style: 'margin-top: 2px; font-size: 18px; width: 55px; margin-right: 10px;', value: rValue});
//        var gTextField = $('<input />', {id: 'gTextField', maxlength: 3, type: 'number', style: 'margin-top: 2px; font-size: 18px; width: 55px; margin-right: 10px;', value: gValue});
//        var bTextField = $('<input />', {id: 'bTextField', maxlength: 3, type: 'number', style: 'margin-top: 2px; font-size: 18px; width: 55px; margin-right: 5px;', value: bValue});
//
//        var colorCanvasWidth = 360;
//        var colorCanvasHeight = 200;
//
//        var colorChooserCanvas = $('<canvas />', {id: 'colorChooserCanvas', style: 'margin-top: -5px; width: ' + colorCanvasWidth + 'px; height: ' + colorCanvasHeight + 'px; background-color: #fff; border-color: #000; border-style: solid; border-width: 1px;'});
//
//        var okButton = $('<button/>', {text: "OK", class: "square", style: "width: 25%; margin-left: 22%; float: left; border-color: #000; border-style: solid; border-width: 2px; color: black; "});
//
//        var cancelButton = $('<button/>', {text: "Cancel", class: "square", style: "width: 25%; float: right; margin-right: 22%; border-color: #000; border-style: solid; border-width: 2px; color: black; "});
//
//        var configurationPanel = $('<div/>', {id: 'theConfigurationPanel'});
//
//        configurationPanel.append(labelColorValue);
//
//        configurationPanel.append(colorRectangle);
//
//        configurationPanel.append($('<label/>', {text: 'R:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
//        configurationPanel.append(rTextField);
//
//        configurationPanel.append($('<label/>', {text: 'G:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
//        configurationPanel.append(gTextField);
//
//        configurationPanel.append($('<label/>', {text: 'B:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
//        configurationPanel.append(bTextField);
//
//        configurationPanel.append($('<br /><br />'));
//
//        configurationPanel.append(colorChooserCanvas);
//
//        configurationPanel.append($('<br />'));
//
//        configurationPanel.append($('<hr />'))
//
//        configurationPanel.append($('<br />'));
//
//        configurationPanel.append(okButton);
//
//        configurationPanel.append(cancelButton);
//
//
//
//        okButton.click(function () {
//            if (isRGBColor(selectedColor)) {
//
//                var fabricColor = new fabric.Color(selectedColor);
//
////                var colorValue = theVisualValue.createValue(fabricColor);
//                var colorValue = createColorValue(fabricColor);
//
//                if (theVisualValue.inConnectors.length > 0) {
//                    var connector = theVisualValue.inConnectors.pop();
//                    connector.contract();
//                }
//
//                theVisualValue.setValue(colorValue, true);
//
//                theVisualValue.outConnectors.forEach(function (outConnector) {
//                    outConnector.setValue(colorValue, false, false);
//                });
//
//                setTimeout(function () {
//                    canvas.renderAll();
//                }, 10);
//
//            }
//            mainDiv.tooltipster('hide');
//        });
//
//        function inputKeyUp(e) {
//            if (e.keyCode === 13) {
//                okButton.click();
//            } else {
//                var red = $('#rTextField').val();
//                var green = $('#gTextField').val();
//                var blue = $('#bTextField').val();
//                selectedColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
//                $('#colorRectangle').css("background-color", selectedColor);
//            }
//        }
//        rTextField.keyup(inputKeyUp);
//        gTextField.keyup(inputKeyUp);
//        bTextField.keyup(inputKeyUp);
//
//        cancelButton.click(function () {
//            mainDiv.tooltipster('hide');
//        });
//
//        var mouseDown = false;
//        var padding = 0;
//
//        var image = new Image();
//        image.onload = function () {
//            var theCanvas = document.getElementById('colorChooserCanvas');
//            var ctx = theCanvas.getContext('2d');
//            ctx.drawImage(image, 0, 0, 300, 150);
//
//            function getMousePos(theCanvas, event) {
//                var x, y;
//                var rect = theCanvas.getBoundingClientRect();
//                if (event.targetTouches) {
//                    // Here if this is a touch event
//                    var touch = event.targetTouches[0];
//                    x = touch.clientX - rect.left;
//                    y = touch.clientY - rect.top;
//                } else {
//                    // Here is this is a mouse event
//                    x = event.clientX - rect.left;
//                    y = event.clientY - rect.top;
//                }
//                return {x: x, y: y};
//            }
//
//            function mouseDownFunction(event) {
//                event.preventDefault();
//                mouseDown = true;
//            }
//
//            function mouseUpFunction(event) {
//                event.preventDefault();
//                mouseDown = false;
//            }
//
//            function mouseMovingFunction(event) {
//
//                event.preventDefault();
//
//                var mousePos = getMousePos(theCanvas, event);
//                var x = mousePos.x;
//                var y = mousePos.y;
//
//                if (mouseDown && mousePos !== null && mousePos.x > 0 && mousePos.x < colorCanvasWidth && mousePos.y > 0 && mousePos.y < colorCanvasHeight) {
//
//                    var imageData = ctx.getImageData(0, 0, 300, 150);
//
//                    /*if (LOG) console.log(imageData);*/
//
//                    var data = imageData.data;
//
//                    var normalizedX = Math.round(300 * (x / colorCanvasWidth));
//                    var normalizedY = Math.round(150 * (y / colorCanvasHeight));
//
//                    var red = data[((300 * normalizedY) + normalizedX) * 4];
//                    var green = data[((300 * normalizedY) + normalizedX) * 4 + 1];
//                    var blue = data[((300 * normalizedY) + normalizedX) * 4 + 2];
//                    selectedColor = 'rgb(' + red + ',' + green + ',' + blue + ')';
//
//                    $('#rTextField').val(red);
//                    $('#gTextField').val(green);
//                    $('#bTextField').val(blue);
//
//                    $('#colorRectangle').css("background-color", selectedColor);
//
//                }
//            }
//
//            theCanvas.addEventListener('mousedown', mouseDownFunction, false);
//            theCanvas.addEventListener('touchstart', mouseDownFunction, false);
//
//            theCanvas.addEventListener('mouseup', mouseUpFunction, false);
//            theCanvas.addEventListener('touchend', mouseUpFunction, false);
//
//            theCanvas.addEventListener('mousemove', mouseMovingFunction, false);
//            theCanvas.addEventListener('touchmove', mouseMovingFunction, false);
//        }
//        var imageSrc = './colorwheel.png';
//        image.src = imageSrc;
//
//        mainDiv.tooltipster({
//            content: configurationPanel,
//            animation: 'grow',
//            trigger: 'click',
//            interactive: true,
//            position: 'right',
//            multiple: true
//        });
//
//        theVisualValue.configurator = mainDiv;
//
//        // positioning and showing the configurator        
//        var centerPoint = theVisualValue.getPointByOrigin('center', 'center');
//        var screenCoords = getScreenCoordinates(centerPoint);
//        mainDiv.css('position', 'absolute');
//        mainDiv.css('top', screenCoords.y + 'px');
//        mainDiv.css('left', screenCoords.x + 'px');
//        mainDiv.tooltipster('reposition');
//        mainDiv.tooltipster('show');
//
//    },
});
VisualValue.call(ColorData.prototype);


// Overriding the behaviour of the rendering process of this datatype. The modification is done so that the color is shown in the drawn drop
ColorData.prototype._render = function (ctx) {

    this.renderMethod(ctx);

    var initialAngle = 20.5;
    var r = 8.8;

    ctx.save();
    ctx.beginPath();

    var fillStyle = "#" + this.value.color.toHex();
    var rgbColor = hexToRGB(fillStyle);
    var strokeStyle = darkenrgb(rgbColor.r, rgbColor.g, rgbColor.b);

    ctx.strokeStyle = strokeStyle;
    ctx.fillStyle = fillStyle;
    ctx.arc(0.5, 4.2, r, fabric.util.degreesToRadians(initialAngle), fabric.util.degreesToRadians(214));
    ctx.fill();
    ctx.stroke();
    ctx.lineTo(0.5 + (r + 1.08) * Math.cos(fabric.util.degreesToRadians(initialAngle)), 4.2 + (r + 1.08) * Math.sin(fabric.util.degreesToRadians(initialAngle)));
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

};

function createColorValue(color) {
    var fabricColor = color;    
    var type = typeof color;
    if (type === "string") {
        fabricColor = new fabric.Color(color);
    }
    return new Value({isColorData: true, color: fabricColor});
}