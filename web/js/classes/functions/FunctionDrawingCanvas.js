var FunctionDrawingCanvas = fabric.util.createClass(fabric.Rect, {

  initialize: function(options) {
    options || (options = { });
    this.callSuper('initialize', options);
    this.fill = "rgba(255, 255, 255, 0.75)";
    this.stroke = rgb(150, 150, 150);
    this.evented = false;
    this.selectable = false;
  },

  _render: function(ctx) {
    this.callSuper('_render', ctx);
  }
  
});