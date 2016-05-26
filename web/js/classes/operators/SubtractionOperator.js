var SubtractionOperator = fabric.util.createClass(Operator, {
    type: 'substractionOperator',
    isSubtractionOperator: true,
    initialize: function (options) {
        options || (options = {});
        this.callSuper('initialize', options);
        this.set('operator', '\u2013');
    },
    // return a-b
    subtractFrom: function (a, b) {
        var theOperator = this;

        if (LOG)
            console.log("subtracting " + a + " from " + b);
        var result = null;

        if ($.isArray(a)) {
            if ($.isArray(b)) {
                result = new Array();
                for (var i = 0; i < a.length; i++) {
                    result.push(a[i] - b[i]);
                }
            } else {
                result = new Array();
                for (var i = 0; i < a.length; i++) {
                    result.push(a[i] - b);
                }
            }
        } else {
            if ($.isArray(b)) {
                result = new Array();
                for (var i = 0; i < b.length; i++) {
                    result.push(a - b[i]);
                }
            } else {

                if (LOG)
                    console.log("a:");
                if (LOG)
                    console.log(a);

                // subtracting DATES
                if (a.isDateAndTimeData && b.isDateAndTimeData) {

                    var outputUnits = theOperator.value.outputUnits || 'milliseconds'; // when a previous value already exists, the new computed one should be expressed in the units of the existing one

                    var duration = computeDateDifference(b.moment, a.moment, outputUnits);

                    result = duration;

                    printDate(a.moment);

                    printDate(b.moment);

                } else {
                    result = a - b;
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
                
                var firstValue = theOperator.inConnectors[0].value;
                var secondValue = theOperator.inConnectors[1].value;
                var outPrefix = theOperator.value ? theOperator.value.outPrefix : firstValue.outPrefix;

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

                    result = subtractValues(result, theOperator.inConnectors[i].value, outPrefix);
                }*/
                
                result = firstValue.subtract(secondValue, outPrefix);

            }

        }
        
        if (result) {
            theOperator.setValue(result, true);
        }
        
        return result;

    },
    _render: function (ctx) {
        var theOperator = this;
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
        ctx.stroke();
        ctx.closePath();

        var label = '';
        if (this.value) {
            label = this.value.getDisplayableString();
            ctx.fillStyle = 'black';
        } else {
            label = ''
            ctx.fillStyle = 'red';
        }

        ctx.font = '16px Helvetica';
        ctx.moveTo(0, 0);


        /*var label = this.value;
         if ($.isArray(this.value)) {
         label = "[...]";
         }*/

        /*if (theOperator.sufix) {
         label += theOperator.sufix;
         }*/

        ctx.fillText(label, 0, 1.75 * this.radius);

        ctx.restore();
    }
});