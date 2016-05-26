var DivisionOperator = fabric.util.createClass(Operator, {
    type: 'divisionOperator',
    isDivisionOperator: true,
    initialize: function (options) {
        options || (options = {});
        this.callSuper('initialize', options);
        this.set('operator', '\u00F7');
    },
    divideBy: function (a, b) {
        if (LOG)
            console.log("multiplying " + a + " by " + b);
        var result = null;
        if ($.isArray(a)) {
            if ($.isArray(b)) {
                result = new Array();
                for (var i = 0; i < a.length; i++) {
                    result.push(a[i] / b[i]);
                }
            } else {
                result = new Array();
                for (var i = 0; i < a.length; i++) {
                    result.push(a[i] / b);
                }
            }
        } else {
            if ($.isArray(b)) {
                result = new Array();
                for (var i = 0; i < b.length; i++) {
                    result.push(a / b[i]);
                }
            } else {

                result = createNumericValue(a.number / b.number);

            }
        }
        if (LOG)
            console.log("RESULT " + result);
        return result;
    },
    computeOutputValue: function (shouldAnimate) {

        var theOperator = this;

        var result = createNumericValue(1);
        if (this.inConnectors.length) {
            result = this.inConnectors[0].value;
            for (var i = 1; i < this.inConnectors.length; i++) {
                result = this.divideBy(result, this.inConnectors[i].value);
            }
        } else {
            result = createNumericValue(0);
        }

        /*theOperator.setValue(result, true);
         
         if (LOG) console.log("%cValue of this operator updated to " + theOperator.value + " due to the new in connection", "background:yellow");
         if (LOG) console.log("theOperator.value:");
         if (LOG) console.log(theOperator.value);*/

        /*this.value = result;*/

        if (result) {
            theOperator.setValue(result, true);
        }

        return result;


    },
    _render: function (ctx) {
        ctx.save();
        this.callSuper('_render', ctx);
        ctx.font = '55px Verdana';
        ctx.fillStyle = 'black';

        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 6;
        ctx.moveTo(-(this.radius - 10), 0);
        ctx.lineTo(+(this.radius - 10), 0);

        ctx.moveTo(0, 0);
        ctx.fillRect(-4, -18, 8, 8);

        ctx.moveTo(0, 0);
        ctx.fillRect(-4, 9, 8, 8);
        ctx.stroke();
        ctx.closePath();

        ctx.font = '16px Helvetica';
        ctx.moveTo(0, 0);
        ctx.textAlign = "center";

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

        ctx.restore();
    }
});