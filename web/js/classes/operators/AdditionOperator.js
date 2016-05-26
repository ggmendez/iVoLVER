var AdditionOperator = fabric.util.createClass(Operator, {
    type: 'additionOperator',
    isAdditionOperator: true,
    initialize: function (options) {
        options || (options = {});
        this.callSuper('initialize', options);
        this.set('operator', '\u002B'); 
    },
    // return a+b
    addTo: function (a, b) {
        if (LOG)
            console.log("adding " + a + " to " + b);
        var result = null;

        if ($.isArray(a)) {
            if ($.isArray(b)) {
                result = new Array();
                for (var i = 0; i < a.length; i++) {

                    if (typeof a[i] == 'string' || typeof b[i] == 'string') {
                        result.push(a[i] + " " + b[i]);
                    } else {
                        result.push(a[i] + b[i]);
                    }

                }
            } else {
                result = new Array();
                for (var i = 0; i < a.length; i++) {
                    result.push(a[i] + b);

                    if (typeof a[i] == 'string' || typeof b == 'string') {
                        result.push(a[i] + " " + b);
                    } else {
                        result.push(a[i] + b);
                    }

                }
            }
        } else {
            if ($.isArray(b)) {
                result = new Array();
                for (var i = 0; i < b.length; i++) {

                    if (typeof a == 'string' || typeof b[i] == 'string') {
                        result.push(a + " " + b[i]);
                    } else {
                        result.push(a + b[i]);
                    }

                }
            } else {

                if (typeof a == 'string' || typeof b == 'string') {
                    result = a + " " + b;
                } else {
                    result = a + b;
                }


            }
        }
        if (LOG)
            console.log("RESULT " + result);
        return result;
    },
    computeOutputValue: function (shouldAnimate) {

        var theOperator = this;

        var result = createNumericValue(0, '', '', '');



        if (theOperator.inConnectors.length) {

            if (theOperator.inConnectors.length === 1) {

                // There is only one incomming connector in this operator, so the result is that only value
                result = theOperator.inConnectors[0].value;

            } else {

                var incomingValues = theOperator.getAllInComingValues();
                var homogeneousType = getHomogeneousType(incomingValues);

                if (homogeneousType) {

                    var addFunction = getAdditionFunctionForType(homogeneousType);

                    if (!addFunction) {
                        return null;
                    }

                    var firstValue = theOperator.inConnectors[0].value;
                    var outPrefix = theOperator.value ? theOperator.value.outPrefix : firstValue.outPrefix;

                    result = addFunction(incomingValues, outPrefix);


                } else {

                    var types = getAllTypes(incomingValues);

                    console.log("types:");
                    console.log(types);

                    var containsString = types.indexOf("string") !== -1;
                    var containsDuration = types.indexOf("duration") !== -1;
                    var containsDateAndTime = types.indexOf("dateAndTime") !== -1;

                    if (containsString) {

                        result = concatStrings(incomingValues);

                        console.log("result:");
                        console.log(result);

                    } else {

                        console.log("incomingValues:");
                        console.log(incomingValues);

                        if (types.length === incomingValues.length && incomingValues.length === 2 && containsDateAndTime && containsDuration) {

                            console.log("incomingValues[0]:");
                            console.log(incomingValues[0]);

                            console.log("incomingValues[1]:");
                            console.log(incomingValues[1]);

                            result = addValues(incomingValues[0], incomingValues[1]);


                        } else {

                            return null;

                        }

                    }





                }






                /*
                 
                 
                 
                 if (LOG)
                 console.log("theOperator.value");
                 if (LOG)
                 console.log(theOperator.value);
                 
                 
                 
                 if (outPrefix == null) {
                 outPrefix = firstValue.outPrefix;
                 }
                 
                 if (LOG)
                 console.log("firstValue:");
                 if (LOG)
                 console.log(firstValue);
                 
                 result = createNumericValue(firstValue.number, firstValue.outPrefix, outPrefix, firstValue.units);
                 
                 for (var i = 1; i < theOperator.inConnectors.length; i++) {
                 
                 if (LOG)
                 console.log("///////// outPrefix:");
                 if (LOG)
                 console.log(outPrefix);
                 
                 result = addValues(result, theOperator.inConnectors[i].value, outPrefix);
                 }
                 
                 */


            }




        }

        if (result) {
            theOperator.setValue(result, true);
        }

        return result;


    },
    _render: function (ctx) {
        ctx.save();
        this.callSuper('_render', ctx);
        ctx.font = '70px Helvetica';
        ctx.fillStyle = OPERATOR_TEXT_FILL;
        ctx.textAlign = "center";

        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 6;
        ctx.moveTo(-(this.radius - 10), 0);
        ctx.lineTo(+(this.radius - 10), 0);
        ctx.moveTo(0, -(this.radius - 10));
        ctx.lineTo(0, +(this.radius - 10));
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        var label = '';
        if (this.value) {
            label = this.value.getDisplayableString();
            ctx.fillStyle = 'black';
        } else {
            label = 'Units do not match!'
            ctx.fillStyle = 'red';
        }

//      if ($.isArray(this.value)) {
//         label = "[...]";
//      }
//

        ctx.save();
        ctx.beginPath();
        ctx.font = '19px Helvetica';

        ctx.textAlign = "center";
        ctx.moveTo(0, 0);
        ctx.fillText(label, 0, 1.75 * this.radius);
        ctx.closePath();
        ctx.restore();


    }
});