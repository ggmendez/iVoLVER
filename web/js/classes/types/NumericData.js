var NumericData = fabric.util.createClass(fabric.Path, {
    serializableProperties: ['left', 'top', 'theType', 'value.unscaledValue', 'value.inPrefix', 'value.outPrefix', 'value.units'],
    deserializer: addVisualValueToCanvas,
    initialize: function (options) {
        options || (options = {});
        var path = paths["number"].rw;
        this.callSuper('initialize', path, options);

        this.set('dataTypeProposition', 'isNumericData');
        this.set(this.dataTypeProposition, true);

        this.set('optionsToDisplay', new Array);
        this.optionsToDisplay.showAsInteger = options.showAsInteger || false;

        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', this.strokeWidth);

        this.set('fill', options.fill || rgb(2, 128, 204));
        this.set('stroke', options.stroke || darkenrgb(2, 128, 204));
        this.set('colorForStroke', options.stroke || darkenrgb(2, 128, 204));

        var unscaledValue = options.unscaledValue;
        var inPrefix = options.inPrefix || '';
        var outPrefix = options.outPrefix || '';
        var theUnits = options.units || '';

//      if (LOG) console.log("++++++++++++++ inPrefix:");
//      if (LOG) console.log(inPrefix);
//
//      if (LOG) console.log("++++++++++++++ outPrefix:");
//      if (LOG) console.log(outPrefix);


        var value = createNumericValue(unscaledValue, inPrefix, outPrefix, theUnits);

//        console.log("$$$$$$$$$$$$$$$$$$$$$$$Created value : ");
//        console.log(value);

        this.set('value', value);

        /*if (LOG) {
         console.log("value:");
         console.log(value);
         }*/

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
    setValueChangingOutPrefixAndUnits: function (numericValue, refreshCanvas, shouldAnimate) {

        var theVisualValue = this;
        if (numericValue.isNumericData) {

            theVisualValue.value = numericValue;

            if (theVisualValue.observer) {
                var options = {
                    visualValue: theVisualValue,
                    shouldAnimate: shouldAnimate
                };
                theVisualValue.observer.trigger('valueChanged', options);
            }

            if (theVisualValue.collection) {
                var options = {
                    visualValue: theVisualValue,
                    shouldAnimate: shouldAnimate
                };
                theVisualValue.collection.trigger('valueChanged', options);
            }

            if (theVisualValue.isLimitValue) {
                var options = {
                    visualValue: theVisualValue,
                    shouldAnimate: shouldAnimate
                };
                theVisualValue.limitOf.trigger('limitChanged', options);
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
    setValue: function (numericValue, refreshCanvas, shouldAnimate) {

//        console.log("%c +++ setting value of NUMERICDATA class with refreshCanvas: " + refreshCanvas + ", shouldAnimate: " + shouldAnimate, "background: #008000; color: white;");


        var theVisualValue = this;
        if (numericValue.isNumericData) {


            if (LOG) {
                console.log("BEFORE the conversion to the corresponding units and output prefix: theVisualValue.value:");
                console.log(theVisualValue.value);
            }


            // Here, the units and out prefix of the value are preserved
            theVisualValue.value = createNumericValue(numericValue.number, numericValue.inPrefix, theVisualValue.value.outPrefix, theVisualValue.value.units);

            if (LOG) {
                console.log("AFTER the conversion to the corresponding units and output prefix: theVisualValue.value:");
                console.log(theVisualValue.value);
            }


            if (theVisualValue.observer) {
                var options = {
                    visualValue: theVisualValue,
                    shouldAnimate: shouldAnimate
                };
                theVisualValue.observer.trigger('valueChanged', options);
            }


            if (theVisualValue.collection) {
                var options = {
                    visualValue: theVisualValue,
                    shouldAnimate: shouldAnimate
                };
                theVisualValue.collection.trigger('valueChanged', options);
            }

            if (theVisualValue.isLimitValue) {
                var options = {
                    visualValue: theVisualValue,
                    shouldAnimate: shouldAnimate
                };
                theVisualValue.limitOf.trigger('limitChanged', options);
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

        var theVisualValue = this;

        showNumericValue(theVisualValue, true);

    },
});
VisualValue.call(NumericData.prototype);

//function getMultiplicationFactor(aPrefix) {
//    if (!aPrefix || aPrefix == 'none' || aPrefix === '') {
//        return 1;
//    } else {
//        for (var i = 0; i < metricPrefixes.length; i++) {
//            var item = metricPrefixes[i];
//            if (item.prefix === aPrefix) {
//                return item.factor;
//            }
//        }
//    }
//}

function getMultiplicationFactor(aPrefix) {

//    console.log("Looking for: " + aPrefix);

    if (!aPrefix || aPrefix === 'none' || aPrefix === '') {
        return 1;
    } else {
        for (var i = 0; i < metricPrefixes.length; i++) {
            var item = metricPrefixes[i];

            var tmp = item.prefix + ' (&#215; 10' + getSuperscriptString(item.exponent) + ')';
//            console.log("tmp: " + tmp);



//            if (tmp === aPrefix) {
            if (item.prefix !== '' && aPrefix.includes(item.prefix)) {
                return item.factor;
            }
        }
    }
}

function generateScaledValue(unscaledValue, inFactor, outFactor) {
    var scaledNumber = (unscaledValue * inFactor) / outFactor;
    return scaledNumber;
}

function getSuperscriptString(exponent) {

//    console.log("exponent: " + exponent);

    if (exponent < 0) {

        return '&#8315;' + getSuperscriptString(Math.abs(exponent));

    } else if (exponent > 0) {

        if (exponent < 10) {
            return superScriptsCodes[exponent];
        } else {
            return getSuperscriptString(parseInt('' + exponent / 10)) + getSuperscriptString(exponent % 10);
        }

    } else {
        return ''; // exponent is equal to zero
    }

}

function buildOutputSelector(numericValue) {

    var outputTypeSelector = $('<select />', {id: 'outputTypeSelector', style: 'font-size: 18px; margin-right: 10px; margin-top: 10px;'});

    metricPrefixes.forEach(function (item) {
        var text = '';
        if (item.exponent !== 0) {
            text = item.prefix + ' (&#215; 10' + getSuperscriptString(item.exponent) + ')';
        }
        var currentOption = $('<option />', {value: item.factor, selected: item.factor === numericValue.outMultiplicationFactor});
        currentOption.append('<span>' + text + '<span>');

        currentOption.appendTo(outputTypeSelector);
    });

    outputTypeSelector.on('change', function (e) {
        updateOutputText();
    });

    return outputTypeSelector;

}

function buildPrefixSelector(numericValue) {

    var prefixSelector = $('<select />', {id: 'prefixSelector', style: 'font-size: 18px; margin-right: 10px; margin-top: 10px;'});

    /*if (LOG) console.log("**************** theVisualValue.value.inMultiplicationFactor:");
     if (LOG) console.log(numericValue.inMultiplicationFactor);*/

    metricPrefixes.forEach(function (item) {
        var currentOption = $('<option />', {value: item.factor, text: item.prefix, selected: item.factor === numericValue.inMultiplicationFactor});
        currentOption.appendTo(prefixSelector);
    });

    prefixSelector.on('change', function (e) {
        updateOutputText();
    });

    return prefixSelector;

}

function updateOutputText() {

    var currentUnscaledValue = $("#unscaledValueTextField").val();
    var outFactor = $("#outputTypeSelector option:selected").val();
    var inFactor = $("#prefixSelector option:selected").val();
    var scaledNumber = generateScaledValue(currentUnscaledValue, inFactor, outFactor);
    var outputLabel = $('#outputLabel');
    var valueToShow = scaledNumber.toFixed(3);

    outputLabel.text('( ' + valueToShow + ' )');
}

function updateOutputUnits() {
    var inputUnits = $("#inputUnitsTextField").val();
    $("#outputUnits").text(inputUnits);
}

function createNumericValue(unscaledValue, inPrefix, outPrefix, units) {

    var theUnscaledValue = unscaledValue;
    var type = typeof unscaledValue;
    if (type !== "number") {
        theUnscaledValue = Number(unscaledValue); // if the provided unscaledValue is not a number, the given value has to be converted to a number
    }

    if (typeof inPrefix === 'undefined') {
        inPrefix = '';
    }
    if (typeof outPrefix === 'undefined') {
        outPrefix = '';
    }
    if (typeof units === 'undefined') {
        units = '';
    }

    var inMultiplicationFactor = getMultiplicationFactor(inPrefix);
    var outMultiplicationFactor = getMultiplicationFactor(outPrefix);
    var scaledValue = generateScaledValue(theUnscaledValue, inMultiplicationFactor, outMultiplicationFactor);

    return new Value({isNumericData: true, number: scaledValue, unscaledValue: unscaledValue, inPrefix: inPrefix, outPrefix: outPrefix, units: units, inMultiplicationFactor: inMultiplicationFactor, outMultiplicationFactor: outMultiplicationFactor});
}


function showNumericValue(holderElement, allowEdition) {

    var mainDiv = $('<div/>', {class: 'icon-large'});

    if (LOG) {
        console.log("%cconfigurator:", "background:red; color:white;");
        console.log(mainDiv);
    }

    var padding = (holderElement.width / 4) * canvas.getZoom();

    mainDiv.css('padding-right', padding + 'px');
    mainDiv.css('padding-left', padding + 'px');

    document.body.appendChild(mainDiv[0]);

    var label = holderElement.attribute || 'number';
    var labelUnscaledValue = $('<label/>', {text: capitalizeFirstLetter(label) + ": ", style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"});

    if (LOG) {
        console.log("theVisualValue.value:");
        console.log(holderElement.value);
    }

    var unscaledValueTextField = $('<input />', {id: 'unscaledValueTextField', maxlength: 6, type: 'number', style: 'margin-top: 10px; font-size: 18px; width: 80px; margin-right: 10px;', value: holderElement.value.unscaledValue});
    unscaledValueTextField.prop('disabled', !allowEdition);

    var inputUnitsTextField = $('<input />', {id: 'inputUnitsTextField', maxlength: 20, type: 'string', style: 'margin-top: 10px; font-size: 18px; width: 80px; margin-right: 10px;', value: holderElement.value.units});
//   inputUnitsTextField.prop('disabled', !allowEdition);

    var prefixSelector = buildPrefixSelector(holderElement.value);
    prefixSelector.prop('disabled', !allowEdition);

    var outputTypeSelector = buildOutputSelector(holderElement.value);

    var okButton = $('<button/>', {text: "OK", class: "square", style: "width: 25%; margin-left: 22%; margin-right: 6%;  border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    var cancelButton = $('<button/>', {text: "Cancel", class: "square", style: "width: 25%; border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    associateEnterEvent(unscaledValueTextField, okButton);
    associateEnterEvent(inputUnitsTextField, okButton);

    inputUnitsTextField.keyup(function () {
        updateOutputUnits();
    });

    unscaledValueTextField.keyup(function () {
        updateOutputText();
    });

    unscaledValueTextField.change(function () {
        updateOutputText();
    });

    okButton.click(function () {


        var inputValue = $("#unscaledValueTextField").val();
        var currentUnscaledValue = Number(inputValue);
        var selectedInPrefix = $("#prefixSelector option:selected").text();
        var selectedOutPrefix = $("#outputTypeSelector option:selected").text();
        var selectedUnits = $("#inputUnitsTextField").val();



        var unitsChanged = holderElement.value.units !== selectedUnits;

        if (LOG) {
            console.log("currentUnscaledValue: " + currentUnscaledValue);
            console.log("selectedInPrefix: " + selectedInPrefix);
            console.log("selectedOutPrefix: " + selectedOutPrefix);
            console.log("selectedUnits: " + selectedUnits);
        }



        var numberValue = createNumericValue(currentUnscaledValue, selectedInPrefix, selectedOutPrefix, selectedUnits);
        if (LOG) {
            console.log("numberValue: ");
            console.log(numberValue);
        }



        // The incoming connection(s) of this element are only removed if the ABSOLUTE VALUE of this numeric value has changed (1000 meters are the same thing than 1kilometers)
        if (!numberValue.equals(holderElement.value)) {
            if (holderElement.inConnectors.length > 0) {
                var connector = holderElement.inConnectors.pop();
                connector.contract();
            }
        }


        var refreshCanvas = false;
        var shouldAnimate = true;

        if (holderElement.isVisualProperty || holderElement.isRangeLimit) {

            holderElement.setValue(numberValue, refreshCanvas, shouldAnimate);

        } else {

            // if I call the normal setValue method, it will respect the units that the object already has. That is, the units selected by the user in this 
            // pop up will not be taken into account. Thus, I have to choose another method
            holderElement.setValueChangingOutPrefixAndUnits(numberValue, refreshCanvas, shouldAnimate);

        }

        if (LOG) {
            console.log("holderElement.value");
            console.log(holderElement.value);
        }


        setTimeout(function () {
            canvas.renderAll();
        }, 10);

        mainDiv.tooltipster('hide');
    });


    cancelButton.click(function () {
        mainDiv.tooltipster('hide');
    });

    var configurationPanel = $('<div/>', {id: 'theConfigurationPanel'});

    configurationPanel.append(labelUnscaledValue);

    configurationPanel.append(unscaledValueTextField);

    configurationPanel.append(prefixSelector);

    configurationPanel.append(inputUnitsTextField);

    configurationPanel.append($('<br /><br />'));

    configurationPanel.append($('<label/>', {text: 'Output as:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
    configurationPanel.append(outputTypeSelector);
    configurationPanel.append($('<label/>', {text: holderElement.value.units, id: 'outputUnits', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));

    configurationPanel.append($('<label/>', {id: 'outputLabel', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));

    configurationPanel.append($('<br /><br />'));

    configurationPanel.append($('<hr />'));

    configurationPanel.append($('<br />'));

    configurationPanel.append(okButton);

    configurationPanel.append(cancelButton);

    mainDiv.tooltipster({
        content: configurationPanel,
        animation: 'grow',
        trigger: 'click',
        interactive: true,
        position: 'right',
        multiple: true
    });

    holderElement.configurator = mainDiv;

    // positioning and showing the configurator        
    var centerPoint = holderElement.getPointByOrigin('center', 'center');
    var screenCoords = getScreenCoordinates(centerPoint);
    mainDiv.css('position', 'absolute');
    mainDiv.css('top', screenCoords.y + 'px');
    mainDiv.css('left', screenCoords.x + 'px');
    mainDiv.tooltipster('reposition');
    mainDiv.tooltipster('show');

    updateOutputText();



}