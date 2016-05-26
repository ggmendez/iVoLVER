var DateAndTimeData = fabric.util.createClass(fabric.Path, {
    serializableProperties: ['left', 'top', 'theType', 'value'],
    deserializer: addVisualValueToCanvas,
    initialize: function (options) {
        options || (options = {});
        var path = paths["dateAndTime"].rw;
        this.callSuper('initialize', path, options);

        this.set('dataTypeProposition', 'isDateAndTimeData');
        this.set(this.dataTypeProposition, true);

        if (LOG) {
            console.log("options:");
            console.log(options);
            console.log("options.theMoment:");
            console.log(options.theMoment);
        }

        var theMoment = options.theMoment || moment();

        var value = createDateAndTimeValue(theMoment);
        this.set('value', value);

        this.set('strokeWidth', options.strokeWidth || 2);
        this.set('originalStrokeWidth', this.strokeWidth);

        this.set('fill', options.fill || rgb(254, 210, 66));
        this.set('stroke', options.stroke || darkenrgb(254, 210, 66));
        this.set('colorForStroke', options.stroke || darkenrgb(254, 210, 66));

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
    buildFormatSelector: function () {

        var theVisualValue = this;

        var formatSelector = $('<select />', {id: 'formatSelector', style: 'font-size: 18px; margin-right: 10px; margin-top: 10px;'});

        dateAndTimeFormats.forEach(function (item) {
            var currentOption = $('<option />', {value: item, text: item});
            currentOption.appendTo(formatSelector);
        });


        formatSelector.on('change', function (e) {

            var newPrefix = this.value;
            $('#formatSelector').val(newPrefix);

            if (theVisualValue.outputScaledValue) {

                // TODO
                // the value of this datatyope should be updated

            } else {

                // TODO

            }

        });

        return formatSelector;

    },
    buildDateFields: function () {

        var theVisualValue = this;

        var theMoment = theVisualValue.value;

        var dateFieldsDiv = $('<div/>', {id: 'dateFieldsDiv'});

        var dayTextField = $('<input />', {id: 'dayTextField', maxlength: 3, type: 'number', style: 'text-align: center; margin-top: 2px; font-size: 18px; width: 45px; margin-right: 10px;', value: theMoment.date()});
        var monthSelector = theVisualValue.buildMonthSelector();
        var yearTextField = $('<input />', {id: 'yearTextField', maxlength: 4, type: 'number', style: 'text-align: center; margin-top: 2px; font-size: 18px; width: 70px; margin-right: 5px;', value: theMoment.year()});

        dateFieldsDiv.append($('<label/>', {text: 'Day:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
        dateFieldsDiv.append(dayTextField);

        dateFieldsDiv.append($('<label/>', {text: 'Month:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
        dateFieldsDiv.append(monthSelector);

        dateFieldsDiv.append($('<label/>', {text: 'Year:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
        dateFieldsDiv.append(yearTextField);



        return dateFieldsDiv;
    },
    buildTimeFields: function () {

        var theVisualValue = this;

        var theMoment = theVisualValue.value;

        var timeFieldsDiv = $('<div/>', {id: 'timeFieldsDiv'});

        var hoursTextField = $('<input />', {id: 'hoursTextField', maxlength: 3, type: 'number', style: 'text-align: center; margin-top: 2px; font-size: 18px; width: 45px; margin-right: 10px;', value: theMoment.hour()});
        var minutesTextField = $('<input />', {id: 'minutesTextField', maxlength: 3, type: 'number', style: 'text-align: center; margin-top: 2px; font-size: 18px; width: 45px; margin-right: 10px;', value: theMoment.minute() + 1});
        var secondsTextField = $('<input />', {id: 'secondsTextField', maxlength: 4, type: 'number', style: 'text-align: center; margin-top: 2px; font-size: 18px; width: 70px; margin-right: 5px;', value: theMoment.second()});
        var millisecondsTextField = $('<input />', {id: 'millisecondsTextField', maxlength: 4, type: 'number', style: 'text-align: center; margin-top: 2px; font-size: 18px; width: 70px; margin-right: 5px;', value: theMoment.millisecond()});

        timeFieldsDiv.append($('<label/>', {text: 'Hour:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
        timeFieldsDiv.append(hoursTextField);

        timeFieldsDiv.append($('<label/>', {text: 'Minutes:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
        timeFieldsDiv.append(minutesTextField);

        timeFieldsDiv.append($('<label/>', {text: 'Seconds:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
        timeFieldsDiv.append(secondsTextField);

        timeFieldsDiv.append($('<label/>', {text: 'Milliseconds:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
        timeFieldsDiv.append(millisecondsTextField);

        return timeFieldsDiv;
    },
    setValue: function (dateAndTimeValue, refreshCanvas) {
        if (dateAndTimeValue.isDateAndTimeData) {
            var theVisualValue = this;
            theVisualValue.value = dateAndTimeValue;

            if (theVisualValue.collection) {
                var options = {
                    visualValue: theVisualValue
                };
                theVisualValue.collection.trigger('valueChanged', options);
            }

            if (refreshCanvas) {
                canvas.renderAll();
            }
            return true;
        } else {
            return false;
        }
    },
    expand: function () {

        var theVisualValue = this;

        showDateAndTimeValue(theVisualValue, true);

    }


});
VisualValue.call(DateAndTimeData.prototype);


function showDateAndTimeValue(valueHolder, editable) {

    var mainDiv = $('<div/>', {class: 'icon-large'});

    if (LOG)
        console.log("%cconfigurator:", "background:red; color:white;");
    if (LOG)
        console.log(mainDiv);

    var padding = (valueHolder.width / 4) * canvas.getZoom();

    mainDiv.css('padding-right', padding + 'px');
    mainDiv.css('padding-left', padding + 'px');

    document.body.appendChild(mainDiv[0]);


    var dateInputField = $('<input />', {id: 'dateInputField', type: 'date', style: 'text-align: center; margin-top: 2px; font-size: 18px; margin-right: 5px;', value: valueHolder.value.moment.format('YYYY-MM-DD')});
    dateInputField.prop('disabled', !editable);

    var timeInputField = $('<input />', {id: 'timeInputField', type: 'time', step: 1, style: 'width: 150px; text-align: center; margin-top: 2px; font-size: 18px; margin-right: 5px;', value: valueHolder.value.moment.format('HH:mm:ss')});
    timeInputField.prop('disabled', !editable);

    var okButton = $('<button/>', {text: "OK", class: "square", style: "width: 35%; margin-left: 10%; float: left; border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    var cancelButton = $('<button/>', {text: "Cancel", class: "square", style: "width: 35%; float: right; margin-right: 10%; border-color: #000; border-style: solid; border-width: 2px; color: black; "});

    okButton.click(function () {

        var dateInputFieldValue = $("#dateInputField").val();
        var timeInputFieldValue = $("#timeInputField").val();

        var inputDate = dateInputFieldValue + " -- " + timeInputFieldValue;

        if (LOG)
            console.log(dateInputFieldValue);
        if (LOG)
            console.log(timeInputFieldValue);

        var storedMoment = valueHolder.value.moment;
        var currentMoment = moment(inputDate, "YYYY-MM-DD" + " -- " + "HH:mm:ss");

        var diffSeconds = storedMoment.diff(currentMoment, 'seconds');

        var dateAndTimeChanged = diffSeconds !== 0;
        if (dateAndTimeChanged) {

            var newDateAndTimeValue = createDateAndTimeValue(currentMoment);

            valueHolder.inConnectors.forEach(function (inConnector) {
                inConnector.contract();
            });

            valueHolder.setValue(newDateAndTimeValue, true);

            valueHolder.outConnectors.forEach(function (outConnector) {
                outConnector.setValue(newDateAndTimeValue, false, true);
            });

        }

        if (LOG)
            console.log(currentMoment);

        mainDiv.tooltipster('hide');
    });

    associateEnterEvent(dateInputField, okButton);
    associateEnterEvent(timeInputField, okButton);

    cancelButton.click(function () {
        mainDiv.tooltipster('hide');
    });

    var configurationPanel = $('<div/>', {id: 'theConfigurationPanel'});

    configurationPanel.append($('<label/>', {text: 'Date:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
    configurationPanel.append(dateInputField);

    configurationPanel.append($('<br /><br />'));

    configurationPanel.append($('<label/>', {text: 'Time:', style: "margin-right: 5px; font-size: 18px; margin-top: 10px;"}));
    configurationPanel.append(timeInputField);

    configurationPanel.append($('<hr />', {style: "margin-top: 20px;"}));

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

    valueHolder.configurator = mainDiv;

    // positioning and showing the configurator        
    var centerPoint = valueHolder.getPointByOrigin('center', 'center');
    var screenCoords = getScreenCoordinates(centerPoint);
    mainDiv.css('position', 'absolute');
    mainDiv.css('top', screenCoords.y + 'px');
    mainDiv.css('left', screenCoords.x + 'px');
    mainDiv.tooltipster('reposition');
    mainDiv.tooltipster('show');

}

function createDateAndTimeValue(aMoment) {
    var theMoment = aMoment;
    var type = typeof aMoment;
    if (type === "string") { // if the sent value is a string, we have to create the corresponding moment.js object
        theMoment = moment(aMoment);
    }
    return new Value({isDateAndTimeData: true, moment: theMoment});
}