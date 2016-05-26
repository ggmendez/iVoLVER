<%@page import="classes.OpenCVLoader"%>
<!DOCTYPE html>
<html style="overflow-x: no-display;">
    <head>
        <title>iVoLVER: Interactive Visual Language for Visual Reasoning</title>
        <meta charset="UTF8">

        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

        <link rel="stylesheet" type="text/css" href="./css/main.css" />
        <link rel="stylesheet" type="text/css" href="./css/kickstart.css" media="all" />
        <link rel="stylesheet" type="text/css" href="./style.css" media="all" />
        <link rel="stylesheet" type="text/css" href="./css/operators.css" />
        <link rel="stylesheet" type="text/css" href="./css/functions.css" />        
        <link rel="stylesheet" type="text/css" href="./css/collections.css" />        
        <link rel="stylesheet" type="text/css" href="./css/values.css" />        
        <link rel="stylesheet" type="text/css" href="./css/marks.css" />    
        <link rel="stylesheet" type="text/css" href="./css/generators.css" />    
        <link rel="stylesheet" type="text/css" href="./css/rangeGenerator.css" />    
        <link rel="stylesheet" type="text/css" href="./css/fonts/fontawesome/css/font-awesome.css" media="all" />
        <link rel="stylesheet" type="text/css" href="./css/fonts/font-awesome-4.4.0/css/font-awesome.css" media="all" />
        <link rel="stylesheet" href="./js/alertify.js-0.3.11/themes/alertify.core.css" />
        <link rel="stylesheet" href="./js/alertify.js-0.3.11/themes/alertify.default.css" />
        <link rel="stylesheet" type="text/css" href="./css/tooltipster.css" />

        <script type="text/javascript" src="./js/jquery-ui-1.10.4/js/jquery-1.10.2.js"></script>
        <script type="text/javascript" src="./js/jquery-ui-1.10.4/js/jquery.ajaxfileupload.js"></script>        
        <script type="text/javascript" src="./js/jquery-ui-1.10.4/js/jquery-ui-1.10.4.min.js"></script>
        <script type="text/javascript" src="./js/jquery-ui-1.10.4/js/jquery.path.js"></script>
        <script type="text/javascript" src="./js/kickstart.js"></script>
        <script type="text/javascript" src="./fabric.js-1.6.0-rc.1/dist/fabric.js"></script>
        <script type="text/javascript" src="./js/moment.js"></script>
        <script type="text/javascript" src="./js/alertify.js-0.3.11/lib/alertify.js"></script>
        <script type="text/javascript" src="./js/tooltipster/js/jquery.tooltipster.js"></script>
        <script type="text/javascript" src="./js/jquery.ui.touch-punch.min.js"></script>
        <script type="text/javascript" src="./js/globals.js"></script>
        <script type="text/javascript" src="./js/util/generalFunctions.js"></script>
        <script type="text/javascript" src="./js/project/Project.js"></script>
        <script type="text/javascript" src="./js/interaction/canvasEvents.js"></script>
        <script type="text/javascript" src="./js/interaction/objectsEvents.js"></script>
        <script type="text/javascript" src="./js/interaction/widgetsEvents.js"></script>
        <script type="text/javascript" src="./js/interaction/blobsCounter.js"></script>
        <script type="text/javascript" src="./js/hammer.js/hammer.js"></script>
        <script type="text/javascript" src="./js/jsts/javascript.util.js"></script>
        <script type="text/javascript" src="./js/jsts/jsts.js"></script>        
        <script type="text/javascript" src="./js/simplify.js/simplify.js"></script>
        <script type="text/javascript" src="./js/classes/operators/Operator.js"></script>
        <script type="text/javascript" src="./js/classes/operators/AdditionOperator.js"></script>
        <script type="text/javascript" src="./js/classes/operators/SubtractionOperator.js"></script>
        <script type="text/javascript" src="./js/classes/operators/MultiplicationOperator.js"></script>
        <script type="text/javascript" src="./js/classes/operators/DivisionOperator.js"></script>
        <script type="text/javascript" src="./js/classes/Connector.js"></script>
        <script type="text/javascript" src="./js/classes/iconPaths.js"></script>
        <script type="text/javascript" src="./js/classes/VisualProperty.js"></script>
        <script type="text/javascript" src="./js/classes/marks/Mark.js"></script>
        <script type="text/javascript" src="./js/classes/marks/EllipticMark.js"></script>
        <script type="text/javascript" src="./js/classes/marks/CircularMark.js"></script>
        <script type="text/javascript" src="./js/classes/marks/SquaredMark.js"></script>
        <script type="text/javascript" src="./js/classes/marks/RectangularMark.js"></script>
        <script type="text/javascript" src="./js/classes/marks/FatFontMark.js"></script>
        <script type="text/javascript" src="./js/classes/marks/SVGPathGroupMark.js"></script>
        <script type="text/javascript" src="./js/classes/marks/SVGPathMark.js"></script>
        <script type="text/javascript" src="./js/classes/marks/PathMark.js"></script>
        <script type="text/javascript" src="js/classes/extractors/Extractor.js"></script>
        <script type="text/javascript" src="js/classes/extractors/SVGPathExtractor.js"></script>
        <script type="text/javascript" src="js/classes/extractors/SamplerExtractor.js"></script>
        <script type="text/javascript" src="js/classes/extractors/TextualExtractor.js"></script>
        <script type="text/javascript" src="js/classes/extractors/SVGText.js"></script>
        <script type="text/javascript" src="./js/classes/selection/SquaredSelection.js"></script>
        <script type="text/javascript" src="./js/classes/LabeledRect.js"></script>
        <script type="text/javascript" src="./js/classes/DataWidget.js"></script>        
        <script type="text/javascript" src="./js/classes/Locator.js"></script>
        <script type="text/javascript" src="./js/classes/types/Value.js"></script>
        <script type="text/javascript" src="./js/classes/types/VisualValue.js"></script>
        <script type="text/javascript" src="./js/classes/types/NumericData.js"></script>
        <script type="text/javascript" src="./js/classes/types/StringData.js"></script>
        <script type="text/javascript" src="./js/classes/types/DateAndTimeData.js"></script>
        <script type="text/javascript" src="./js/classes/types/DurationData.js"></script>
        <script type="text/javascript" src="./js/classes/types/ColorData.js"></script>
        <script type="text/javascript" src="./js/classes/types/ShapeData.js"></script>
        <script type="text/javascript" src="./js/js-quantities/src/quantities.js"></script>
        <script type="text/javascript" src="./js/classes/functions/CollectionGetter.js"></script>
        <script type="text/javascript" src="./js/classes/functions/CollectionAttributeSelector.js"></script>
        <script type="text/javascript" src="./js/classes/functions/Mapper.js"></script>
        <script type="text/javascript" src="./js/classes/functions/VerticalCollection.js"></script>
        <script type="text/javascript" src="./js/classes/functions/NumericCollectionGenerator.js"></script>
        <script type="text/javascript" src="./js/classes/functions/MapperInput.js"></script>
        <script type="text/javascript" src="./js/classes/functions/MapperOutput.js"></script>
        <script type="text/javascript" src="./js/classes/functions/NumberGenerator.js"></script>
        <script type="text/javascript" src="./js/classes/functions/DateGenerator.js"></script>
        <script type="text/javascript" src="./js/classes/rangeGenerators/Range.js"></script>
        <script type="text/javascript" src="./js/classes/rangeGenerators/RangeLimit.js"></script>
        <script type="text/javascript" src="./js/classes/rangeGenerators/RangeOutput.js"></script>
        <script type="text/javascript" src="./js/classes/functions/NumberGeneratorOutput.js"></script>
        <script type="text/javascript" src="./js/classes/functions/NumericFunction.js"></script>
        <script type="text/javascript" src="./js/classes/functions/NumericFunctionInput.js"></script>
        <script type="text/javascript" src="./js/classes/functions/NumericFunctionOutput.js"></script>
        <script type="text/javascript" src="./js/classes/functions/FunctionDrawingCanvas.js"></script>
        <script type="text/javascript" src="./js/classes/functions/FunctionValuesCollection.js"></script>
        <script type="text/javascript" src="./js/colors.js"></script>
        <script type="text/javascript" src="./js/jsGradient.js"></script>
        <script type="text/javascript" src="./js/PapaParse/papaparse.min.js"></script>
        <script type="text/javascript" src="./js/FileSaver/FileSaver.min.js"></script>
        <script type="text/javascript" src="./js/mathjs/dist/math.min.js"></script>
        <script type="text/javascript" src="./js/colormix-1.0.0.min.js"></script>
        <script type="text/javascript" src="./js/webcamjs/webcam.js"></script>
        <script type="text/javascript" src="./js/h5utils.js"></script>
        <script type="text/javascript" src="./js/jquery.xdomainajax.js"></script>
        <script type="text/javascript" src="./js/resizeEvents/jquery.resize.js"></script>
        <script type="text/javascript" src="./js/jquery.drag.resize.js"></script>
        <script type="text/javascript" src="./js/toPathTransformations.js"></script>
        <script type="text/javascript" src="./js/path-data-polyfill.js"></script>

        <!-- Loading OpenCV library -->
        <% new OpenCVLoader();%>

    </head>

    <body oncontextmenu="return false;" onresize="adjustCanvasDimensions();">
        <!-- HORIZONTAL MENU -->
        <ul id="theMenu" class="menu nonSelection">
            <!-- IMPORTING -->
            <li><a href="javascript:void(0);" onclick="onLoad();"><i class="icon-picture fa-2x"></i></a></li>
            <li> <input type="file" accept=".jpeg, .png, .jpg"  id="imageFileInput" name="someFile" onchange="handleImageFiles(this.files)" style="visibility:hidden;position:absolute;top:-50;left:-50"/></li>
            <li class="verticalLeftDivider"><a href="javascript:readSVGFileAsData();"><i class="fa fa-file-code-o fa-2x"></i></a></li>
            <li class="verticalLeftDivider"><a href="javascript:void(0);" onclick="showCameraSignal();"><i id="openCameraButton" class="fa fa-camera fa-2x"></i></a></li>
            <li> <input type="file" accept=".svg" id="dataSVGFileInput" name="someSVGDataFile" onchange="handleSVGFiles(this.files, false)" style="visibility:hidden;position:absolute;top:-50;left:-50"/></li>
            <li class="verticalLeftDivider"><a href="javascript:loadDatafile();"><i class="icon-table fa-2x"></i></a></li>
            <li> <input type="file" accept=".csv, .json" id="dataimageFileInput" name="someDatafile" onchange="handleDatafiles(this.files)" style="visibility:hidden;position:absolute;top:-50;left:-50"/></li>
            <li class="verticalLeftDivider verticalRightDivider verticalRightDivider2"><a href="javascript:void(0);" onclick="showWebPage();"><i id="openWebPageButton" class="fa fa-globe fa-2x"></i></a></li>
            <!-- ZOOM -->
            <li class=""><a href="javascript:zoomIn();" onclick=""><i class="icon-zoom-in fa-2x"></i></a></li>
            <li class="verticalLeftDivider verticalRightDivider verticalRightDivider2"><a href="javascript:zoomOut();" onclick=""><i class="icon-zoom-out fa-2x"></i></a></li>            
            <!-- DRAGGING & PANNING MODES -->
            <li id="panningModeButton" unselectable='on' onselectstart='return false;' onmousedown='modeButtonClicked(this);' draggable="false" class="mode"><a><i class="fa fa-hand-paper-o fa-2x"> </i> </a></li>
            <li class="verticalLeftDivider" id="disconnectingModeButton" unselectable='on' onselectstart='return false;' onmousedown='modeButtonClicked(this);' draggable="false" class="mode"><a><i class="fa fa-unlink fa-2x"> </i> </a></li>
            <li class="verticalLeftDivider verticalRightDivider verticalRightDivider2" id="squaredSelectionButton" unselectable='on' onselectstart='return false;' onmousedown='modeButtonClicked(this);' draggable="false" class="mode"><a><i class="fa fa-object-group fa-2x"> </i> </a></li>
            <!-- CONNECTORS VISIBILITY -->
            <li class="verticalLeftDivider verticalRightDivider verticalRightDivider2" id="disconnectingModeButton" unselectable='on' onselectstart='return false;' draggable="false" class="mode"><a id="connectorsVisibilityButton" onmousedown="toggleConnectorsVisibility(this);"><i class="fa fa-eye fa-2x"></i></a></li>            
            <!-- OPERATIONS ON OBJECTS -->
            <li class="mode verticalLeftDivider" unselectable='on' onselectstart='return false;' onmousedown='duplicateObject();' draggable="false"><a><i class="fa fa-clone fa-flip-horizontal fa-2x clicMenu"> </i> </a></li>
            <li class="mode verticalLeftDivider" unselectable='on' onselectstart='return false;' onmousedown='expandMarks();' draggable="false"><a><i class="fa fa-angle-double-down fa-2x clicMenu"> </i> </a></li>
            <li class="mode verticalLeftDivider" unselectable='on' onselectstart='return false;' onmousedown='compressMarks();' draggable="false"><a><i class="fa fa-angle-double-up fa-2x clicMenu"> </i> </a></li>
            <li class="verticalLeftDivider verticalRightDivider verticalRightDivider2" unselectable='on' onselectstart='return false;' onmousedown='deleteObject();' draggable="false" class="mode"><a><i class="fa fa-remove fa-2x"> </i> </a></li>
            <li class="verticalLeftDivider verticalRightDivider verticalRightDivider2"><a href="javascript:void(0);" onclick="deleteAllObjects();"><i class="fa fa-trash-o fa-2x"></i></a></li>
            <!-- FILE MENU -->
            <li id="fileMenu" onclick="showMenu(this);" class="verticalRightDivider verticalRightDivider2">
                <a>
                    <i class="fa fa-file-o fa-2x"></i>
                </a>
                <ul id="fileMenuUL">
                    <li><a href="javascript:void(0);" onclick="saveProject();"><i id="saveProjectElement" class="fa-save icon-large"></i> Save project</a></li>
                    <li><a href="javascript:loadiVoLVERProject();"><i class="fa-folder-open-o icon-large"></i> Open project</a></li>
                    <li> <input type="file" accept=".xml" id="dataprojectFileInput" name="someProjectfile" onchange="handleDatafiles(this.files)" style="visibility:hidden;position:absolute;top:-50;left:-50"/></li>                    
                    <li class="divider"><a href="javascript:void(0);"><i class="fa-download icon-large"></i> Export canvas</a>
                        <ul>
                            <li><a href="javascript:void(0);" onclick="saveCanvas();"><i id="saveCanvasElement" class="fa-file-code-o icon-large"></i> As SVG</a></li>
                            <li><a href="javascript:void(0);" onclick="saveCanvas();"><i id="saveCanvasElement" class="fa-file-image-o icon-large"></i> As PNG</a></li>
                        </ul>
                    </li>
                </ul>
            </li>
            <!-- RIGHT PANEL HANDLER -->
            <li class="verticalLeftDivider2" style="float: right;"><a id="toggleAdditionalToolsVisibility" href="javascript:void(0);" onclick="togglePanelVisibility('#rightPanel');"><i class="fa fa-chevron-right fa-2x"></i></a></li>
        </ul>
        <div class="grid">
            <div style="width: 100%" id="mainContainer">
                <div class="rightPanel nonSelection" id="rightPanel" draggable="false">
                    <!-- EXTRACTORS -->
                    <h6 id="extractorsListH6" onclick="togglePanelVisibility('#extractorsList', false);" style="cursor: pointer;" class="nonSelection sectionHeader"><span class="fa fa-angle-down" style="margin-right: 5px;"></span>Extractors</h6>
                    <ul id="extractorsList" class="horizontalButtomsRow">
                        <li id="groupColorRegionButton" unselectable='on' onselectstart='return false;' onmousedown='modeButtonClicked(this);' draggable="false" class="boxDivider mode" style="margin-right: 8px; margin-bottom: 6px;"><a><i class="fa fa-paint-brush" style="font-size: 25px;"> </i> </a></li>
                        <li id="multipleColorRegionsButton" unselectable='on' onselectstart='return false;' onmousedown='modeButtonClicked(this);' draggable="false" class="boxDivider mode" style="margin-right: 8px; margin-bottom: 6px;"><a><i class="fa fa-pencil" style="font-size: 25px;"> </i> </a></li>
                        <li id="floodFillButton" unselectable='on' onselectstart='return false;' onmousedown='modeButtonClicked(this);' draggable="false" class="boxDivider mode" style="margin-right: 8px; margin-bottom: 6px;"><a><i class="fa fa-magic" style="font-size: 25px;"> </i> </a></li>
                        <li id="samplerLineButton" onclick="modeButtonClicked(this);" unselectable='on' onselectstart='return false;' draggable="false" class="boxDivider mode" style="width: 44%; margin-right: 8px; margin-bottom: 6px;"><a><i class="collections-straightSampler" style="font-size: 22px;"> </i> </a></li>
                        <li id="samplerButton" onclick="modeButtonClicked(this);" unselectable='on' onselectstart='return false;' draggable="false" class="boxDivider mode" style="width: 44%; margin-right: 8px; margin-bottom: 6px;"><a><i class="collections-freeSampler" style="font-size: 22px;"> </i> </a></li>
                        <li id="lineTextExtractorButton" unselectable='on' onselectstart='return false;' onmousedown="modeButtonClicked(this);" draggable="false" class="boxDivider mode" style="width: 44%; margin-right: 8px;"><a><i class="icon-strikethrough icon-large" style="font-size: 19px;"> </i> </a></li>
                        <li id="blockTextExtractorButton" unselectable='on' onselectstart='return false;' onmousedown="modeButtonClicked(this);" draggable="false" class="boxDivider mode" style="width: 44%; margin-right: 8px;"><a><i class="fa fa-stop icon-large" style="font-size: 19.5px;"> </i> </a></li>

                    </ul>
                    <hr />

                    <!-- MARKS -->
                    <h6 id="marksListH6" onclick="togglePanelVisibility('#marksList', false);" style="cursor: pointer;" class="nonSelection sectionHeader"><span class="fa fa-angle-down" style="margin-right: 5px;"></span>Marks</h6>
                    <ul id="marksList" class="horizontalButtomsRow">
                        <li id="circlePrototype" draggable="true" class="dragElement circularBorder" style="margin-right: 15px; margin-bottom: 3px;"><a><i class="mark-circle" style="font-size: 28px;"></i></a></li>
                        <li id="rectPrototype" draggable="true" class="dragElement circularBorder" style="margin-right: 12px; margin-bottom: 3px;"><a><i class="mark-rectangle" style="font-size: 28px;"></i></a></li>
                        <li id="squarePrototype" draggable="true" class="dragElement circularBorder" style="margin-right: 12px; margin-bottom: 3px;"><a><i class="mark-square" style="font-size: 28px;"></i></a></li>
                        <li id="pathMarkPrototype" draggable="true" class="dragElement circularBorder" style="margin-right: 15px; margin-bottom: 3px;"><a><i class="mark-pathMark" style="font-size: 28px;"></i></a></li>
                        <li id="fatFontPrototype" draggable="true" class="dragElement circularBorder" style="margin-right: 12px; margin-bottom: 3px;"><a><i class="mark-fatfont" style="font-size: 28px;"></i></a></li>
                        <li id="ellipsePrototype" draggable="true" class="dragElement circularBorder" style="margin-right: 12px; margin-bottom: 3px;"><a><i class="mark-ellipse" style="font-size: 28px;"></i></a></li>
                        <li style="visibility:hidden;position:absolute;top:0;left:0"> <input type="file" accept=".svg" id="svgimageFileInput" name="someSVGFile" onchange="handleSVGFiles(this.files, true)"/></li>
                        <li id="filePrototype" draggable="false" class="dragElement boxDivider" style="margin-right: 6px; margin-bottom: 0px;"><a onclick="loadSVGFile();"><i class="mark-svg"></i></a></li>                        
                        <li id="drawFilledMark" onclick="modeButtonClicked(this);" unselectable='on' onselectstart='return false;' draggable="false" class="boxDivider mode" style="margin-right: 5px; margin-bottom: 0px;"><a><i class="mark-filled"> </i> </a></li>
                        <li id="drawPathMark" onclick="modeButtonClicked(this);" unselectable='on' onselectstart='return false;' draggable="false" class="boxDivider mode" style="margin-right: 5px; margin-bottom: 0px;"><a><i class="mark-path"> </i> </a></li>
                    </ul>
                    <hr />

                    <!-- VALUES (DATA TYPES) -->
                    <h6 id="datatypesListH6" onclick="togglePanelVisibility('#datatypesList', false);" style="cursor: pointer;" class="nonSelection sectionHeader"><span class="fa fa-angle-down" style="margin-right: 5px;"></span>Values</h6>
                    <ul id="datatypesList" class="horizontalButtomsRow">
                        <li id="isShapeData" draggable="true" class="dragElement circularBorder" style="margin-right: 1px; margin-bottom: 5px;"><a><i class="value-shape" style="font-size: 25px;"> </i> </a></li>
                        <li id="isColorData" draggable="true" class="dragElement circularBorder" style="margin-right: 1px; margin-bottom: 5px;"><a><i class="value-color" style="font-size: 25px;"></i></a></li>
                        <li id="isStringData" draggable="true" class="dragElement circularBorder" style="margin-right: 1px; margin-bottom: 5px;"><a><i class="value-string" style="font-size: 25px;"></i></a></li>
                        <li id="isNumericData" draggable="true" class="dragElement circularBorder" style="margin-right: 1px; margin-bottom: 5px;"><a><i class="value-number" style="font-size: 25px;"></i></a></li>
                        <li id="rangeGenerator" draggable="true" class="dragElement circularBorder" style="margin-right: 10px; margin-bottom: 0px;"><a style="padding-top: 6px; padding-left: 10px; padding-bottom: 0px;"><i class="range-generator" style="font-size: 24px;"></i></a></li> 
                        <li id="isDurationData" draggable="true" class="dragElement circularBorder" style="margin-right: 1px; margin-bottom: 0px;"><a><i class="value-duration" style="font-size: 25px;"> </i> </a></li>
                        <li id="isDateAndTimeData" draggable="true" class="dragElement circularBorder" style="margin-right: 1px; margin-bottom: 0px;"><a><i class="value-dateAndTime" style="font-size: 25px;"></i></i></a></li>
                    </ul>
                    <hr />

                    <!-- OPERATORS -->
                    <h6 id="operatorsListH6" onclick="togglePanelVisibility('#operatorsList', false);" style="cursor: pointer;" class="nonSelection sectionHeader"><span class="fa fa-angle-down" style="margin-right: 5px;"></span>Operators</h6>
                    <ul id="operatorsList" class="horizontalButtomsRow">
                        <li id="division-operator" draggable="true" class="dragElement circularBorder" style="margin-right: 1px;"><a><i class="operator-divisonIcon" style="font-size: 24px;"></i></a></li>
                        <li id="multiplication-operator" draggable="true" class="dragElement circularBorder" style="margin-right: 2px;"><a><i class="operator-multiplicationIcon" style="font-size: 24px;"></i></a></li>
                        <li id="subtraction-operator" draggable="true" class="dragElement circularBorder" style="margin-right: 2px;"><a><i class="operator-subtractionIcon" style="font-size: 24px;"></i></a></li>
                        <li id="addition-operator" draggable="true" class="dragElement circularBorder" style="margin-right: 2px;"><a><i class="operator-additionIcon" style="font-size: 24px;"></i></a></li>
                    </ul>
                    <hr />

                    <!-- COLLECTIONS -->
                    <h6 id="draggableWidgetsListH6" onclick="togglePanelVisibility('#draggableWidgetsList', false);" style="cursor: pointer;" class="nonSelection sectionHeader"><span class="fa fa-angle-down" style="margin-right: 5px;"></span>Collections</h6>
                    <ul id="draggableWidgetsList" class="horizontalButtomsRow">
                        <li id="collectionGenerator" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 0px;"><a><i class="collections-generator"></i></a></li>
                        <li id="mapperWidget" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 0px;"><a><i class="collections-mapper"></i></a></li>
                        <li id="verticalCollection" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 0px;"><a><i class="collections-collection" ></i></a></li>
                    </ul>
                    <hr />

                    <!--FUNCTIONS--> 
                    <h6 id="functionsListH6" onclick="togglePanelVisibility('#functionsList', false);" style="cursor: pointer;" class="nonSelection sectionHeader"><span class="fa fa-angle-down" style="margin-right: 5px;"></span>Functions</h6>
                    <ul id='functionsList' class="horizontalButtomsRow">
                        <li id="x2Function" draggable="true" class="dragElement circularBorder" style="margin-right: 3px; margin-bottom: 6px;"><a><i class="function-x2"></i></a></li>
                        <li id="xFunction" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 6px;"><a><i class="function-x"></i></a></li>
                        <li id="emptyFunction" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 6px;"><a><i class="function-empty"></i></a></li>
                        <li id="locatorWidget" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 6px;"><a><i class="collections-locator" style="font-size: 25px;"></i></a></li>
                        <li id="logXFunction" draggable="true" class="dragElement circularBorder" style="margin-right: 3px; margin-bottom: 6px;"><a><i class="function-logx"></i></a></li>
                        <li id="cosXFunction" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 6px;"><a><i class="function-cosx"></i></a></li>
                        <li id="sinXFunction" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 6px;"><a><i class="function-sinx"></i></a></li>
                        <li id="x3Function" draggable="true" class="dragElement circularBorder" style="margin-right: 0px; margin-bottom: 6px;"><a><i class="function-x3"></i></a></li>
                        <li id="enterFunction" onclick="enterFunctionButtonClicked();" unselectable='on' onselectstart='return false;' draggable="false" class="boxDivider" style="width: 30%;"><a><i class="fa-superscript icon-large" style="font-size: 22.5px;"> </i> </a></li>
                        <li id="drawFunction" onclick="modeButtonClicked(this);" unselectable='on' onselectstart='return false;' draggable="false" class="boxDivider mode" style="width: 30%; margin-right: 10px;"><a><i class="function-draw"> </i> </a></li>
                        <li id="sqrtXFunction" draggable="true" class="dragElement circularBorder" style="margin-right: 10px;"><a><i class="function-sqrtx"></i></a></li>
                    </ul>
                </div>
                <section id="drop">
                    <div id="canvasContainer" class="canvasStyle">
                        <canvas id="theCanvas"></canvas>
                    </div>
                </section>
            </div>
        </div>

        <script type="text/javascript">

            $(document).ready(function () {
                $('.tooltip').tooltipster();
            });

            // global variables
            alertify.set({buttonReverse: true});
            var brushColor = "#000000";
            var brushWidth = 5;

            // create a wrapper around native canvas element (with id="theCanvas")            
            var canvas = new fabric.Canvas('theCanvas', {backgroundColor: "#ffffff", renderOnAddRemove: false});
            var width = $('#mainContainer').width();
            var height = $(document).height() - $('#theMenu').height() - 5;
            if (LOG) {
                console.log("$(document).height() :" + $(document).height());
                console.log("$('#theMenu').height() :" + $('#theMenu').height());
                console.log("height :" + height);
                console.log("height: " + height);
            }
            canvas.setWidth(width);
            canvas.setHeight(height);
            canvas.selection = false;
            canvas.connectorsHidden = false;
            canvas.selectionColor = 'rgba(229,238,244,0.5)';
            canvas.selectionDashArray = [7, 7];
            canvas.selectionBorderColor = '#7c7064';
            canvas.selectionLineWidth = 3;

            checkForRetinaDisplay();

            $("#canvasContainer").on('mousewheel', function (ev) {
                hideOpenTooltips();
                ev.preventDefault();
                var e = ev.originalEvent;
                displaywheel(e);
            });

            var canvasContainerElement = document.querySelector("#canvasContainer");
            var manager = new Hammer.Manager(canvasContainerElement);
            manager.add(new Hammer.Tap({event: 'doubletap', taps: 2, threshold: 75, interval: 400, time: 600, posThreshold: 25}));
            manager.add(new Hammer.Press({event: 'press', time: 450}));
            var pan1Finger = new Hammer.Pan({event: 'pan1Finger', pointers: 1});
            manager.add(pan1Finger);
            var pinch = new Hammer.Pinch({event: 'pinch'});
            manager.add(pinch);
            manager.on("doubletap", function (ev) {
                if (LOG) {
                    console.log("%cdoubletap detected", "background: #1f656a; color: white;");
                    console.log(ev);
                }
                canvasDoubleTap(ev);
            });
            manager.on("press", function (ev) {
                if (LOG)
                    console.log(ev);
                canvasPressEvent(ev);
            });

            // ###################### PANNING WITH 1 FINGER (TO CUT CONNECTORS) ###################### //
            manager.on("pan1Fingerstart", function (ev) {
                if (!canvas.activePanningMode) {
                    if (!canvas.isDrawingMode && !canvas.getActiveObject() && !canvas.getActiveGroup()) {
                        if (LOG) {
                            console.log("STARTING pan1Finger");
                            console.log(ev);
                        }
                        canvas.pan1Fingerstarted = true;
                        gestureSetEnabled(manager, 'pinch', false);
                    }
                } else if (!canvas.selection) {
                    /********** PANNING **********/
                    canvas.defaultCursor = "-webkit-grabbing";
                    // This is to allow the canvas panning with one finger
                    if (LOG) {
                        console.log("STARTING pan1Finger in PANNING MODE");
                        console.log(ev);
                    }
                    canvas.viewportLeft = canvas.viewportTransform[4];
                    canvas.viewportTop = canvas.viewportTransform[5];
                    gestureSetEnabled(manager, 'pinch', false);
                } else if (!canvas.getActiveObject()) {
                    console.log("Starting selection");
                }
                hideOpenTooltips();
            });
            manager.on("pan1Fingermove", function (ev) {
                if (!canvas.activePanningMode) {
                    if (!canvas.isDrawingMode && !canvas.getActiveObject() && !canvas.getActiveGroup() && canvas.pan1Fingerstarted) {
                        if (LOG) {
                            console.log("MOVING pan1Finger");
                            console.log(ev);
                        }
                    }
                } else if (!canvas.selection) {
                    /********** PANNING **********/
                    canvas.defaultCursor = "-webkit-grabbing";
                    // This should only happen when the mouse event happens over a zone where NO objects are being touched
                    if (!canvas.isDrawingMode && !canvas.getActiveObject() && !canvas.getActiveGroup()) {
                        var x = -canvas.viewportLeft - ev.deltaX;
                        var y = -canvas.viewportTop - ev.deltaY;
                        canvas.absolutePan(new fabric.Point(x, y));
                    }
                } else if (!canvas.getActiveObject()) {
                    /********** SQUARE SELECTING **********/
                    if (LOG) {
                        console.log("Selecting");
                    }
                }
            });

            manager.on("pan1Fingerend", function (ev) {
                if (!canvas.activePanningMode && !canvas.isSamplingLineMode && !canvas.selection) {
                    if (!canvas.isDrawingMode && !canvas.getActiveObject() && !canvas.getActiveGroup() && canvas.pan1Fingerstarted && !canvas.connectorsHidden) {
                        if (LOG) {
                            console.log("END pan1Finger");
                            console.log(ev);
                        }
                        var xPage, yPage;
                        var viewportLeft = canvas.viewportTransform[4];
                        var viewportTop = canvas.viewportTransform[5];
                        var xPage = ev.pointers[0].pageX;
                        var yPage = ev.pointers[0].pageY;
                        var x2 = (xPage - viewportLeft - $('#theCanvas').offset().left) / canvas.getZoom();
                        var y2 = (yPage - viewportTop - $('#theCanvas').offset().top) / canvas.getZoom();
                        var x1 = (xPage - ev.deltaX - viewportLeft - $('#theCanvas').offset().left) / canvas.getZoom();
                        var y1 = (yPage - ev.deltaY - viewportTop - $('#theCanvas').offset().top) / canvas.getZoom();
                        var p1 = new fabric.Point(x1, y1);
                        var p2 = new fabric.Point(x2, y2);
                        var line = {x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y};
                        var crossedConnectors = getConnectorsCrossedByLine(line);
                        if (LOG) {
                            console.log(crossedConnectors.length + " connectors crossed!");
                        }
                        var totalConnectors = crossedConnectors.length;
                        var i = 0;
                        crossedConnectors.forEach(function (object) {
                            var refreshCanvas = i === (totalConnectors - 1);
                            var connector = object.connector;
                            var splitPoint = object.splitPoint;
                            connector.split(splitPoint, line, refreshCanvas);
                            i++;
                        });
                        canvas.pan1Fingerstarted = false;
                    }
                    gestureSetEnabled(manager, 'pinch', true);
                } else if (!canvas.selection) {
                    canvas.defaultCursor = "-webkit-grab";
                    gestureSetEnabled(manager, 'pinch', true);
                } else if (!canvas.getActiveObject()) {
                    if (LOG) {
                        console.log("Square selection ended");
                    }
                }
            });

            // ###################### PINCHING ###################### //
            manager.on("pinchstart", function (ev) {
                if (!canvas.getActiveObject() && !canvas.getActiveGroup()) {
                    canvas.zoomBeforePanning = canvas.getZoom();
                }
            });
            manager.on("pinchmove", function (ev) {
                if (LOG) {
                    console.log("%cpinchmove", "background: aqua");
                    console.log(ev);
                }
                if (!canvas.getActiveObject() && !canvas.getActiveGroup()) {
                    var center = new fabric.Point(ev.center.x, ev.center.y);
                    canvas.zoomToPoint(center, canvas.zoomBeforePanning * ev.scale);
                    canvas.renderAll();
                }
            });
            canvas.allowTouchScrolling = false;
            var lastCopiedObject = null;
            bindCanvasDefaultEvents();

            var copiedObject;
            var canvasScale = 1;

            // button Zoom In
            $("#btnZoomIn").click(function () {
                zoomIn();
            });
            // button Zoom Out
            $("#btnZoomOut").click(function () {
                zoomOut();
            });
            // button Reset Zoom
            $("#btnResetZoom").click(function () {
                resetZoom();
            });

            $("#locatorWidget").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;  margin-top: -1px; margin-left: 38px;'><li><i class='icon-screenshot icon-2x'></i></li></div>");
                }
            });
            $("#mapperWidget").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='collections-mapper'></i></li></div>");
                }
            });
            $("#collectionGetterWidget").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='fa fa-angellist'></i></li></div>");
                }
            });
            $("#collectionAttributeSelectorWidget").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='fa fa-archive'></i></li></div>");
                }
            });
            $("#verticalCollection").draggable({
                cursorAt: {top: 18.5, left: 30},
                cursor: 'none',
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='collections-collection'></i></li></div>");
                }
            });
            $("#collectionGenerator").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -1px; margin-left: 38px;'><li><i class='collections-generator'></i></li></div>");
                }
            });
            $("#numberGenerator").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='collections-number'></i></li></div>");
                }
            });
            $("#dateGenerator").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='fa fa-adn'></i></li></div>");
                }
            });
            $("#rangeGenerator").draggable({
                cursorAt: {top: 18.5, left: 28},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='range-generator'></i></li></div>");
                }
            });
            $("#squarePrototype").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -1px; margin-left: 38px;'><li><i class='mark-square'></i></li></div>");
                }
            });
            $("#pathMarkPrototype").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -1px; margin-left: 38px;'><li><i class='mark-pathMark'></i></li></div>");
                }
            });
            $("#rectPrototype").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -1px; margin-left: 38px;'><li><i class='mark-rectangle'></i></li></div>");
                }
            });
            $("#circlePrototype").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -1px; margin-left: 38px;'><li><i class='mark-circle'></i></li></div>");
                }
            });
            $("#fatFontPrototype").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -1px; margin-left: 38px;'><li><i class='mark-fatfont'></i></li></div>");
                }
            });
            $("#ellipsePrototype").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -1px; margin-left: 38px;'><li><i class='mark-ellipse'></i></li></div>");
                }
            });
            $("#isColorData").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -4px; margin-left: 28px;'><li><i class='value-color' style='border:1px solid #aaa; border-radius: 10em; padding-top: 10px; padding-bottom: 10px; padding-left: 10px; padding-right: 10px;'></i></li></div>");
                }
            });
            $("#isStringData").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -4px; margin-left: 28px;'><li><i class='value-string' style='border:1px solid #aaa; border-radius: 10em; padding-top: 10px; padding-bottom: 10px; padding-left: 10px; padding-right: 10px;'></i></li></div>");
                }
            });
            $("#isNumericData").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -4px; margin-left: 28px;'><li><i class='value-number' style='border:1px solid #aaa; border-radius: 10em; padding-top: 10px; padding-bottom: 10px; padding-left: 10px; padding-right: 10px;'></i></li></div>");
                }
            });
            $("#collectionValue").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -20px; margin-left: -45px;'><li><i class='fa-flickr icon-2x' style='border:1px solid #aaa; border-radius: 5em; padding-top: 13px; padding-bottom: 10px; padding-left: 20px; padding-right: 47px;'></i></li></div>");
                }
            });
            $("#isShapeData").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -4px; margin-left: 28px;'><li><i class='value-shape' style='border:1px solid #aaa; border-radius: 10em; padding-top: 10px; padding-bottom: 10px; padding-left: 10px; padding-right: 10px;'></i></li></div>");
                }
            });
            $("#isDurationData").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -4px; margin-left: 28px;'><li><i class='value-duration' style='border:1px solid #aaa; border-radius: 10em; padding-top: 10px; padding-bottom: 10px; padding-left: 10px; padding-right: 10px;'></i></li></div>");
                }
            });
            $("#isDateAndTimeData").draggable({
                cursorAt: {top: 18.5, left: 60},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-top: -4px; margin-left: 28px;'><li><i class='value-dateAndTime' style='border:1px solid #aaa; border-radius: 10em; padding-top: 10px; padding-bottom: 10px; padding-left: 10px; padding-right: 10px;'></i></li></div>");
                }
            });
            $("#addition-operator").draggable({
                cursorAt: {top: 18.5, left: 8},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-left: -36px; margin-top: 0px; padding-left: 0px; padding-rigth: 60px;'><li><i class='operator-additionIcon' style='border:1px solid #aaa; border-radius: 5em; padding: 1em;'></i></li></div>");
                }
            });
            $("#subtraction-operator").draggable({
                cursorAt: {top: 18.5, left: 8},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-left: -36px; margin-top: 0px; padding-left: 0px; padding-rigth: 60px;'><li><i class='operator-subtractionIcon' style='border:1px solid #aaa; border-radius: 5em; padding: 1em;'></i></li></div>");
                }
            });
            $("#multiplication-operator").draggable({
                cursorAt: {top: 18.5, left: 8},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-left: -36px; margin-top: 0px; padding-left: 0px; padding-rigth: 60px;'><li><i class='operator-multiplicationIcon' style='border:1px solid #aaa; border-radius: 5em; padding: 1em;'></i></li></div>");
                }
            });
            $("#division-operator").draggable({
                cursorAt: {top: 18.5, left: 0},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100; margin-left: -36px; margin-top: 0px; padding-left: 0px; padding-rigth: 60px;'><li><i class='operator-divisonIcon' style='border:1px solid #aaa; border-radius: 5em; padding: 1em;'></i></li></div>");
                }
            });
            $("#xFunction").draggable({
                cursorAt: {top: 20, left: 23},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='function-x'></i></li></div>");
                }
            });
            $("#emptyFunction").draggable({
                cursorAt: {top: 20, left: 23},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='function-empty'></i></li></div>");
                }
            });
            $("#x2Function").draggable({
                cursorAt: {top: 20, left: 23},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='function-x2'></i></li></div>");
                }
            });
            $("#x3Function").draggable({
                cursorAt: {top: 20, left: 23},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='function-x3'></i></li></div>");
                }
            });
            $("#sinXFunction").draggable({
                cursorAt: {top: 20, left: 23},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='function-sinx'></i></li></div>");
                }
            });
            $("#cosXFunction").draggable({
                cursorAt: {top: 20, left: 23},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='function-cosx'></i></li></div>");
                }
            });
            $("#logXFunction").draggable({
                cursorAt: {top: 20, left: 23},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='function-logx'></i></li></div>");
                }
            });
            $("#sqrtXFunction").draggable({
                cursorAt: {top: 20, left: 23},
                cursor: 'none',
                scroll: false,
                helper: function (event) {
                    return $("<div style='z-index: 100;'><li><i class='function-sqrtx'></i></li></div>");
                }
            });
            $("#theCanvas").droppable({
                accept: "#addition-operator, #subtraction-operator, #multiplication-operator, #division-operator, #xFunction, #emptyFunction, #x2Function, #x3Function, #sinXFunction, #cosXFunction, #logXFunction, #sqrtXFunction, #playerWidget, #locatorWidget, #mapperWidget, #collectionGetterWidget, #collectionAttributeSelectorWidget, #verticalCollection, #collectionGenerator, #numberGenerator, #rangeGenerator, #dateGenerator, #rectPrototype, #squarePrototype, #pathMarkPrototype, #circlePrototype, #fatFontPrototype, #ellipsePrototype, #isColorData, #isStringData, #isNumericData, #collectionValue, #isDurationData, #isDateAndTimeData, #isShapeData",
                drop: canvasDropFunction
            });

            adjustCanvasDimensions();

            var drop = document.querySelector('#drop');
            addEvent(drop, 'dragover', cancel);
            addEvent(drop, 'dragenter', cancel);
            addEvent(drop, 'drop', function (e) {
                if(LOG){
                    console.log("*** External page element dropped ***");
                }
                if (e.preventDefault) {
                    e.preventDefault(); // stops the browser from redirecting off to the text.
                }
                var canvasCoords = getCanvasCoordinates(e);
                if (e.dataTransfer.types) {
                    if (LOG) {
                        console.log("e.dataTransfer.types:");
                        console.log(e.dataTransfer.types);
                    }
                    var totalTypes = e.dataTransfer.types.length;
                    for (var i = 0; i < totalTypes; i++) {
                        var type = e.dataTransfer.types[i];
                        var contentType = type;
                        var dataString = e.dataTransfer.getData(type);
                        if (LOG) {
                            console.log("content-type " + contentType);
                            console.log("dataString: " + dataString);
                        }
                        if (contentType === "text/html") {
                            var parsedHTML = $.parseHTML(dataString);
                            if (LOG) {
                                console.log("***" + dataString, 'red', 'white');
                            }
                            var found = addVisualElementFromHTML(parsedHTML, canvasCoords, true);
                            if (found) {
                                break;
                            }
                        } else if (false) {
                            var url = dataString;
                            showWebPage(url);
                        } else if (false) {
                            var x = canvasCoords.x;
                            var y = canvasCoords.y;
                            var theText = dataString;
                            var targetObject = findPotentialDestination(canvasCoords, ['isVisualProperty', 'isMark']);
                            if (targetObject) {
                                var value = createBestValueFromText(theText);
                                if (targetObject.isVisualProperty) {
                                    blink(targetObject, false);
                                    targetObject.setValue(value, true, true);
                                } else if (targetObject.isMark) {
                                    var attribute = null;
                                    if (value.isStringData) {
                                        attribute = 'label';
                                    } else if (value.isColorData) {
                                        attribute = 'fill';
                                    }
                                    if (attribute !== null) {
                                        var visualProperty = targetObject.getVisualPropertyByAttributeName(attribute);
                                        if (targetObject.isCompressed) {
                                            blink(targetObject, true);
                                        } else {
                                            blink(targetObject, !visualProperty);
                                        }
                                        if (visualProperty) {
                                            if (!targetObject.isCompressed) {
                                                blink(visualProperty, attribute === 'label');
                                            }
                                            visualProperty.setValue(value, true, true);
                                        }
                                    }
                                }
                            } else {
                                var theVisualVariable = createBestVisualVariableFromText(theText, x, y);
                                canvas.add(theVisualVariable);
                                theVisualVariable.animateBirth(false, null, null, false);
                                return theVisualVariable;
                            }
                            break;
                        }
                    }
                } else {
                    console.log(e.dataTransfer.getData('Text'));
                }
                return false;
            });
            // When the system starts up, the panning mode is active by default
            applyActiveMenuButtonStyle($("#panningModeButton"));
            activatePanningMode();
            var bubbleSound = new Audio("audio/bubble.wav"); // buffers automatically when created
            var popSound = new Audio("audio/pop.wav"); // buffers automatically when created
            var trashSound = new Audio("audio/trash.wav"); // buffers automatically when created
        </script>
    </body>
</html>