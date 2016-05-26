var StringData = fabric.util.createClass(fabric.Path, {
    
    serializableProperties: ['left', 'top', 'theType', 'value.string'],
    deserializer: addVisualValueToCanvas,
    
    initialize: function (options) {
        options || (options = {});
        var path = paths["text"].rw;
        this.callSuper('initialize', path, options);

        this.set('dataTypeProposition', 'isStringData');
        this.set(this.dataTypeProposition, true);

//        this.set('value', this.createValue(options.string));
        this.set('value', createStringValue(options.string));

        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', this.strokeWidth);

        this.set('fill', options.fill || rgb(235, 50, 99));
        this.set('stroke', options.stroke || darkenrgb(235, 50, 99));
        this.set('colorForStroke', options.stroke || darkenrgb(235, 50, 99));

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
    /*createValue: function (theString) {
     return  new Value({isStringData: true, string: theString});
     },*/
    setValue: function (stringValue, refreshCanvas, shouldAnimate) {
        var theVisualValue = this;
        if (stringValue.isStringData) {
            theVisualValue.value = stringValue;

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

        var theVisualValue = this;

        showStringValue(theVisualValue, true);

    }


});
VisualValue.call(StringData.prototype);

function showStringValue(holderElement, allowEdition) {

    var mainDiv = $('<div/>', {class: 'icon-large'});

    if (LOG) console.log("%cconfigurator:", "background:red; color:white;");
    if (LOG) console.log(mainDiv);

    var padding = (holderElement.width / 4) * canvas.getZoom();

    mainDiv.css('padding-right', padding + 'px');
    mainDiv.css('padding-left', padding + 'px');

    document.body.appendChild(mainDiv[0]);

    var labelString = $('<label/>', {text: 'String:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"});

    var stringField = $('<input />', {id: 'stringTextField', type: 'text', maxlength: 500, style: 'margin-top: 10px; font-size: 18px; width: 180px;', value: holderElement.value.string});
    stringField.prop('disabled', !allowEdition);

    var okButton = $('<button/>', {text: "OK", class: "square", style: "width: 35%; margin-left: 10%; float: left; border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    var cancelButton = $('<button/>', {text: "Cancel", class: "square", style: "width: 35%; float: right; margin-right: 10%; border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    associateEnterEvent(stringField, okButton);

    okButton.click(function () {

        var stringValue = createStringValue($('#stringTextField').val());

        if (holderElement.inConnectors.length > 0) {
            var connector = holderElement.inConnectors.pop();
            connector.contract();
        }

        holderElement.setValue(stringValue, false);

        holderElement.outConnectors.forEach(function (outConnector) {
            outConnector.setValue(stringValue, false, false);
        });

        setTimeout(function () {
            canvas.renderAll();
        }, 10);

        mainDiv.tooltipster('hide');
    });


    cancelButton.click(function () {
        mainDiv.tooltipster('hide');
    });



    var configurationPanel = $('<div/>', {id: 'theConfigurationPanel'});

    configurationPanel.append(labelString);

//      configurationPanel.append(stringField);

    stringField.appendTo(configurationPanel);


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

}

function createStringValue(theString) {
    if (theString === null || typeof theString === 'undefined') {
        theString = '';
    }
    return  new Value({isStringData: true, string: theString});
}