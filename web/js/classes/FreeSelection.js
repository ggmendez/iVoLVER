var FreeSelection = fabric.util.createClass(fabric.Path, {
    type: 'freeSelection',
    initialize: function (path, options) {
        options || (options = {});
        this.callSuper('initialize', path, options);
        this.set('hasRotatingPoint', false);
        this.set('hasBorders', false);
        this.set('hasControls', false);
        this.set('transparentCorners', false);
        this.set('originX', 'center');
        this.set('originY', 'center');
        this.set('strokeLineCap', 'round');
        this.set('strokeLineJoin', 'round');
//        this.set('fill', '#f1efee');
        this.set('fill', '#e5eef4');
        this.set('top', options.top);
        this.set('left', options.left);
        this.set('strokeWidth', options.strokeWidth || 3);
//        this.set('stroke', options.stroke || '#7c7064');        
        this.set('type', 'functionWidget');
        this.set('widgets', new Array());
        this.set('isFreeSelection', true);

        this.collectSelectedOutputs();

        this.on('doubleTap', function (option) {

            if (this.minimized) {
                this.maximize();
//                alertify.log("Selection maximized", "", 1500);
            } else {
                this.minimize();
//                alertify.log("Selection minimized", "", 1500);
            }

        });

        this.on('moving', function (option) {
            objectMoving(option, this);
            this.widgets.forEach(function (widget) {
                widget.trigger('moving');
            });
        });
        this.on('rotating', function (option) {
            objectMoving(option, this);
            this.widgets.forEach(function (widget) {
                widget.trigger('rotating');
            });
        });
        this.on('scaling', function (option) {
            objectMoving(option, this);
            this.widgets.forEach(function (widget) {
                widget.trigger('scaling');
            });
        });
        this.on('mouseup', function (option) {
            if (LOG) console.log("Mouse up over this selection");
        });

        this.set('perPixelTargetFind', true);

    },
    minimize: function () {

        var selection = this;
        var easing = fabric.util.ease.easeOutBack;

        var finalWidth = 60;
        var finalHeight = 60;

        var newScaleX = finalWidth / this.width;
        var newScaleY = finalHeight / this.height;
        var duration = 800;

        selection.animate('scaleX', newScaleX, {
            duration: duration,
            easing: easing
        });

        selection.animate('scaleY', newScaleY, {
            onChange: function () {
                selection.trigger('scaling');
                canvasMouseUp({target: selection});
                canvas.renderAll.bind(canvas);
            },
            duration: duration,
            onComplete: function () {
                selection.trigger('scaling');
                canvas.renderAll.bind(canvas);
                canvas.renderAll(canvas);
                selection.minimized = true;
                canvasMouseUp({target: selection});
                selection.disableChildrenEvents();
            },
            easing: easing
        });

    },
    maximize: function () {
        var selection = this;
        var easing = fabric.util.ease.easeOutBack;
        var newScaleX = 1;
        var newScaleY = 1;
        var duration = 800;

        selection.animate('scaleX', newScaleX, {
            duration: duration,
            easing: easing
        });

        selection.animate('scaleY', newScaleY, {
            onChange: function () {
                selection.trigger('scaling');
                canvasMouseUp({target: selection});
                canvas.renderAll.bind(canvas);
            },
            duration: duration,
            onComplete: function () {
                selection.trigger('scaling');
                canvas.renderAll.bind(canvas);
                canvas.renderAll(canvas);
                selection.minimized = false;
                canvasMouseUp({target: selection});
                selection.enableChildrenEvents();
            },
            easing: easing
        });
    },
    collectSelectedOutputs: function () {

        var selection = this;
        var topLeft = this.getPointByOrigin('left', 'top');

        canvas.forEachObject(function (object) {

//            if (object.isOutput && object.isContainedWithinObject(selection)) {
            if (object.isContainedWithinObject(selection)) {

                if (LOG) console.log("Collecting object!");

                selection.widgets.push(object);

                var objectTopLeft = object.getPointByOrigin('left', 'top');

                // Computing the untransformed properties of each contained object                
                object.parentObject = selection;
                object.untransformedScaleX = 1;
                object.untransformedScaleY = 1;
                object.untransformedAngle = 0;
                object.untransformedX = objectTopLeft.x - topLeft.x;
                object.untransformedY = objectTopLeft.y - topLeft.y;

            }
        });



    },
    disableChildrenEvents: function () {
        this.widgets.forEach(function (widget) {
            widget.evented = false;
        });
    },
    enableChildrenEvents: function () {
        this.widgets.forEach(function (widget) {
            widget.evented = true;
        });
    },
    _render: function (ctx) {

        ctx.save();

        ctx.globalAlpha = 1;

        var activeObject = canvas.getActiveObject();

        if (this.selected || activeObject == this) {
            this.stroke = '#ffce0a';
            this.strokeWidth = 3;
            this.strokeDashArray = [7, 7];
        } else {
            this.stroke = '#7c7064';
            this.strokeWidth = 3;
            this.strokeDashArray = [];
        }

        this.callSuper('_render', ctx);

        ctx.restore();

    },
    remove: function () {
        this.widgets.forEach(function (widget) {
            widget.remove();
        });
        this.callSuper('remove');
    },
    applySelectedStyle: function () {
        this.selected = true;
    },
    applyUnselectedStyle: function () {
        this.selected = false;
    }
});



