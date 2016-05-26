function blobsCounterAssociateMouseEvents(blobsCounter) {
    blobsCounter.on({
        'mouseup': function(option) {
            blobsCounterMouseup(option, blobsCounter);
        },
        'mousedown': function(option) {
            blobsCounterMousedown(option, blobsCounter);
        },
        'moving': function(option) {
            blobsCounterMoving(option, blobsCounter);
        },
        'selected': function(option) {
            blobsCounterSelected(option, blobsCounter);
        }
    });
}

function blobsCounterMouseup(option, blobsCounter) {

    if (LOG) console.log("blobsCounterMouseup");
    if (blobsCounter.permanentOpacity) {
        blobsCounter.opacity = blobsCounter.permanentOpacity;
    } else {
        blobsCounter.opacity = 1;
    }

    if (blobsCounter.moving) {

        var theEvent = option['e'];

        if (theEvent) {

            var coordY = theEvent.offsetY;
            var coordX = theEvent.offsetX;

            if (fabric.isTouchSupported && theEvent.changedTouches && theEvent.changedTouches.length > 0) {
                // Here I use the changedTouches list since the up event produces a change in it
                coordX = theEvent.changedTouches[0].pageX - $('#theCanvas').offset().left;
                coordY = theEvent.changedTouches[0].pageY - $('#theCanvas').offset().top;
            }

            var importedImage = getImportedImageContaining(coordX, coordY);

            // Only if the finger is dragged to a point in which there is no other importedImage
            if (importedImage == null) {

                var existingOutput = getOutputContaining(coordX, coordY);

                // The mouse up event is done over a blank section of the canvas
                if (existingOutput == null) {

                    var lastAddedConnector = getLastElementOfArray(blobsCounter.connectors);

//                    addOutputAt(coordX, coordY, blobsCounter, lastAddedConnector, CIRCULAR_OUTPUT);

                    var text = new fabric.IText(blobsCounter.blobs.length + " blobs", {
                        top: coordY,
                        left: coordX,
                        centerX: 'center',
                        centerY: 'center',
                        fontSize: 60,
                        textAlign: 'center',
                        fontFamily: 'calibri',
                        hasControls: false,
                        hasBorders: false,
                        hasRotatingPoint: false,
                        lockRotation: true,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockMovementX: true,
                        lockMovementY: true,
                        selectable: true,
                        editable: true
                    });

                    canvas.add(text);



                } else {
                    // if the mouse up event happens over an existing output
                    var connector = getLastElementOfArray(blobsCounter.connectors);
                    addConnectorToOutput(existingOutput, connector);
                }

            } else {

                // removing the last connector added when the widget was down clicked 
                var connector = blobsCounter.connectors.pop();
                canvas.remove(connector);

            }

        }

    } else {
        // removing the last connector added when the widget was down clicked 
        var connector = blobsCounter.connectors.pop();
        canvas.remove(connector);
    }
    
    blobsCounter.moving = false;
    canvas.renderAll();
}

function blobsCounterMousedown(option, blobsCounter) {

    if (LOG) console.log("blobsCounterMousedown");

    var theEvent = option;
    theEvent = option['e'];

    if (theEvent) {

        var coordY = theEvent.offsetY;
        var coordX = theEvent.offsetX;

        if (fabric.isTouchSupported && theEvent.touchess && theEvent.touches.length > 0) {
            coordX = theEvent.touches[0].pageX - $('#theCanvas').offset().left;
            coordY = theEvent.touches[0].pageY - $('#theCanvas').offset().top;
        }

        var coords = [blobsCounter.left, blobsCounter.top, coordX, coordY];

        var newConnector = CreateDefaultConnector(coords, blobsCounter.trueColor);
        canvas.add(newConnector);
        canvas.sendToBack(newConnector);
        newConnector.widget = blobsCounter;
        blobsCounter.connectors.push(newConnector);

    }

}

function blobsCounterMoving(option, blobsCounter, parentGroup) {

    if (LOG) console.log("blobsCounterMoving");
    blobsCounter.moving = true;

    var theEvent = option;

    theEvent = option['e'];

    if (theEvent) {

        var coordY = theEvent.offsetY;
        var coordX = theEvent.offsetX;

        if (fabric.isTouchSupported && theEvent.changedTouches && theEvent.changedTouches.length > 0) {
            // Here I use the changedTouches list since the up event produces a change in it
            coordX = theEvent.changedTouches[0].pageX - $('#theCanvas').offset().left;
            coordY = theEvent.changedTouches[0].pageY - $('#theCanvas').offset().top;
        }

        var lastAddedConnector = getLastElementOfArray(blobsCounter.connectors);

        lastAddedConnector.set({x2: coordX, y2: coordY});

        canvas.renderAll();

    }

}

function blobsCounterSelected(option, targetWidget) {
    if (LOG) console.log("blobsCounterSelected");
    widgetApplySelectedStyle(targetWidget);
    canvas.renderAll();
}


function countBlobs(blobsCounter) {

    if (!blobsCounter)
        return;

    if (LOG) console.log("countBlobs");

    var imageObject = blobsCounter.parentObject;
    var imageForTextRecognition = imageObject.id;

    var request = new XMLHttpRequest(); // create a new request object to send to server
    request.open("POST", "FindBlobs", true); // set the method and destination
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    request.onreadystatechange = function() {

        if (request.readyState == 4) { // has the data arrived?
            if (request.status == 200) { // is everything OK?

                var textResponse = request.responseText; // getting the result

                if (textResponse.trim().length > 0) {
                    var response = JSON.parse(textResponse);

                    if (response) {

                        if (LOG) console.log(response);
                        blobsCounter.blobs = response;

                    }
                }
            }
        }
    };

    request.send("imageForTextRecognition=" + imageForTextRecognition); // sending the data to the server

}



