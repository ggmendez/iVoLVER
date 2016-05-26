var LabeledRect = fabric.util.createClass(fabric.Rect, {
    type: 'labeledRect',
    initialize: function (options) {
        options || (options = {});

        this.callSuper('initialize', options);        
        this.set('colorForStroke', options.colorForStroke || options.stroke);
        this.set('originX', 'center');
        this.set('originY', 'center');
        this.set('label', options.label || '');
        this.set('labelColor', options.labelColor || '#FFF');
    },
    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },
    
    
    applySelectedStyle: function (selectConnectors) {
        this.selected = true;
        if (selectConnectors) {
            this.outConnectors.forEach(function (outConnector) {
                outConnector.opacity = 1;
                if (!outConnector.source.isOperator) {
                    outConnector.applySelectedStyle(false, true);
                } else {
                    outConnector.destination.applySelectedStyle(false);
                    outConnector.applySelectedStyle(false, false);
                }
            });
        }
    },
    applyUnselectedStyle: function (unselectConnectors) {
        this.selected = false;
        if (unselectConnectors) {
            this.outConnectors.forEach(function (outConnector) {
                outConnector.opacity = canvas.connectorsHidden ? 0 : 1;
                outConnector.applyUnselectedStyle(false, true);
            });
        }
    },

    _render: function (ctx, noTransform) {

        var rx = this.rx ? Math.min(this.rx, this.width / 2) : 0,
                ry = this.ry ? Math.min(this.ry, this.height / 2) : 0,
                w = this.width,
                h = this.height,
                x = -w / 2,
                y = -h / 2,
                isInPathGroup = this.group && this.group.type === 'path-group',
                isRounded = rx !== 0 || ry !== 0,
                k = 1 - 0.5522847498 /* "magic number" for bezier approximations of arcs (http://itc.ktu.lt/itc354/Riskus354.pdf) */;

        ctx.beginPath();
        ctx.globalAlpha = isInPathGroup ? (ctx.globalAlpha * this.opacity) : this.opacity;

        if (this.transformMatrix && isInPathGroup) {
            ctx.translate(this.width / 2 + this.x, this.height / 2 + this.y);
        }
        if (!this.transformMatrix && isInPathGroup) {
            ctx.translate(-this.group.width / 2 + this.width / 2 + this.x, -this.group.height / 2 + this.height / 2 + this.y);
        }

        ctx.moveTo(x + rx, y);

        ctx.lineTo(x + w - rx, y);
        isRounded && ctx.bezierCurveTo(x + w - k * rx, y, x + w, y + k * ry, x + w, y + ry);

        ctx.lineTo(x + w, y + h);

        ctx.lineTo(x, y + h);

        ctx.lineTo(x, y + ry);
        isRounded && ctx.bezierCurveTo(x, y + k * ry, x + k * rx, y, x + rx, y);

        ctx.closePath();

        this._renderFill(ctx);

        ctx.save();
        
        if (this.selected) {
            ctx.strokeStyle = widget_selected_stroke_color;
            ctx.lineWidth = widget_selected_stroke_width;
            ctx.setLineDash(widget_selected_stroke_dash_array);
        }

        this._renderStroke(ctx);
        ctx.restore();

        ctx.save();
        ctx.font = '18px calibri';
        ctx.fillStyle = this.labelColor;
        ctx.textAlign = "center";
        ctx.moveTo(0, 0);
        ctx.fillText(this.label, 0, this.height / 2 - 16);
        ctx.restore();

    }

});