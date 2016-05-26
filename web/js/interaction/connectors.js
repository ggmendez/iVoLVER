function CreateDefaultConnector(coords, color) {
    return new fabric.Line(coords, {
        fill: 'transparent',
        stroke: color,
        strokeDashArray: [10, 10],
        perPixelTargetFind: true,
        selectable: false,
        strokeLineJoin: 'round',
        strokeWidth: 1,
        opacity: 1,
        originX: 'center',
        originY: 'center',
        isConnector: true,
        permanentOpacity: 1
    });
}

function removeConnector(connector) {
    // removing the configurator associated to this connector    
    connector.configurator.remove();
    canvas.remove(connector);

    if (connector.output != null) {
        removeOutput(connector.output);
    }

    fabric.util.removeFromArray(connector.widget.connectors, connector);
}

function connectorHide(connector) {
    connector.opacity = 0;
    connector.configurator.hide();
}

function connectorShow(connector) {
    connector.opacity = connector.permanentOpacity;
    connector.configurator.show();
}

//function toggleConnectorVisibility(connector) {
//    if (connector.opacity == 0) {
//        connector.opacity = connector.permanentOpacity;
//        if (connector.configurator) {
//            connector.configurator.show();
//        }
//    } else {
//        connector.opacity = 0;
//        if (connector.configurator) {
//            connector.configurator.hide();
//        }
//    }
//}