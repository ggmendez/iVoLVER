# iVoLVER

[link](http://www.youtube.com/watch?v=wnJ80cEKKxo){:target="_blank"}

<p align="center">
  <a href="http://www.youtube.com/watch?v=wnJ80cEKKxo" target="_blank"><img src="http://img.youtube.com/vi/wnJ80cEKKxo/0.jpg"></a>
</p>

iVoLVER is a tool that allows users to create visualizations without textual programming. It is designed to enable **flexible acquisition of many types of data** (text, colors, shapes, quantities, dates) from multiple source types (bitmap charts, webpages, photographs, SVGs, CSV files) and, within the same canvas, supports transformation of that data through simple widgets to construct interactive animated visuals.

<a href="http://ivolver.cs.st-andrews.ac.uk" target="_blank"><img src="http://ivolver.cs.st-andrews.ac.uk/img/teaser.png" style="width:300px;box-shadow:rgba(0,0,0,0.3) 0 0 5px"></a>

Aside from the tool, which is web-based and designed for pen and touch, we contribute the design of the interactive visual language and widgets for extraction, transformation, and representation of data. We demonstrate the flexibility and expressive power of the tool through a set of scenarios, and discuss some of the challenges encountered and how the tool fits within the current infovis tool landscape.

### Scenarios

<a href="http://ivolver.cs.st-andrews.ac.uk/#scenario" target="_blank"><img src="http://ivolver.cs.st-andrews.ac.uk/img/scenarios/pngs/1.png" width="24%"></a>   <a href="http://ivolver.cs.st-andrews.ac.uk/#scenario" target="_blank" data-keyboard="true" data-toggle="modal"><img src="http://ivolver.cs.st-andrews.ac.uk/img/scenarios/pngs/2.png" width="24%"></a>   <a href="http://ivolver.cs.st-andrews.ac.uk/#scenario" target="_blank"><img src="http://ivolver.cs.st-andrews.ac.uk/img/scenarios/pngs/3.png" width="24%"></a>   <a href="http://ivolver.cs.st-andrews.ac.uk/#scenario" target="_blank"><img src="http://ivolver.cs.st-andrews.ac.uk/img/scenarios/pngs/4.png" width="24%"></a>

<a href="http://ivolver.cs.st-andrews.ac.uk/#scenario" target="_blank"><img src="http://ivolver.cs.st-andrews.ac.uk/img/scenarios/pngs/5.png" width="24%"></a>   <a href="http://ivolver.cs.st-andrews.ac.uk/#scenario" target="_blank"><img src="http://ivolver.cs.st-andrews.ac.uk/img/scenarios/pngs/6.png" width="24%"></a>   <a href="http://ivolver.cs.st-andrews.ac.uk/#scenario" target="_blank"><img src="http://ivolver.cs.st-andrews.ac.uk/img/scenarios/pngs/8.png" width="24%"></a>   <a href="http://ivolver.cs.st-andrews.ac.uk/#scenario" target="_blank"><img src="http://ivolver.cs.st-andrews.ac.uk/img/scenarios/pngs/4.png" width="24%"></a>

# Source Code

iVoLVER source code is available under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT license</a>.

The code is organized as a <a href="https://netbeans.org" target="_blank">Netbeans</a> project that includes:

- **1. The iVoLVER web client** (HTML + JavaScript) that implements the user interface using the following libraries:
  - <a href="http://fabricjs.com" target="_blank">fabric.js</a> for the rendering of the canvas elements,
  - <a href="http://hammerjs.github.io" target="_blank">hammer.js</a> for additional touch gestures support,
  - <a href="http://momentjs.com/" target="_blank">moment.js</a> to parse, validate, manipulate, and display dates in JavaScript,
  - The <a href="https://github.com/bjornharrtell/jsts" target="_blank">JavaScript Topology Suite</a> for processing geometry,
  - <a href="https://github.com/josdejong/mathjs" target="_blank">Math.js</a> for mathematical functions and expression parsing,
  - <a href="http://mourner.github.io/simplify-js" target="_blank">simplify.js</a> for polyline simplification,
  - <a href="http://iamceege.github.io/tooltipster" target="_blank">tooltipster.js</a> to create tooltips enhanced with CSS,
  - <a href="http://papaparse.com/" target="_blank">Papa Parse</a> to in-browser parse CSV files,
  - <a href="https://github.com/eligrey/FileSaver.js" target="_blank">FileSaver.js</a>, which implements the saveAs() FileSaver interface in browsers that do not natively support it,
  - <a href="http://colormix.florentschildknecht.com" target="_blank">colormix.js</a> for mixing, blending and easily manipulating colors and color spaces,
  - <a href=https://github.com/aurer/jsgradient" target="_blank">jsgradient.js</a> to implement a gradient between two colors,
  - <a href="http://fabien-d.github.com/alertify.js" target="_blank">alertify.js</a> for customized dialogs,

- **2. The Image processing server program** (mostly implemented under `src/java/classes`), with the computer vision routines that recognize text and extract data from images. This module is written in Java and uses the following dependencies:
  - Java wrappers of the <a href="http://opencv.org" target="_blank">OpenCV library</a> (version 2.4.9), and
  - The <a href="http://tess4j.sourceforge.net" target="_blank">Tess4J</a> library, a JNA wrapper for the <a href="https://github.com/tesseract-ocr/tesseract" target="_blank">Tesseract OCR API</a>

Communication between the client and the server is achieved through Java servlets (included in `src/java/servlets`).

### Running iVoLVER from the source code

The easies way to depploy the iVoLVER is from Netbeans, by opening the root directory as a Netbeans project. 

##### Configuring OpenCV

You will have to modify the `OpenCVLoader` class in `src/java/classes` to load to the right OpenCV DLL file. If you have added the DLL to your PATH, you could use:
```java
System.loadLibrary( Core.NATIVE_LIBRARY_NAME );
```

Otherwise, you will need to use the `System.load` method specifying the full path to the DLL file:
```java
String OpenCV_DLL_Path = <absolute_path_to_your_DLL_file>;
System.load(OpenCV_DLL_Path);
```

##### Configuring the text recognition module

Remember to set the `TESSDATA_PREFIX` environment variable pointing to the parent directory of your tessdata folder containing the traineddata files needed for the text recognition.

# Contact

If you are interested in iVoLVER, send us an email to ggm@st-andrews.ac.uk

# MIT License

Copyright (c) 2006 University of St Andrews (Gonzalo Gabriel Méndez, Miguel A. Nacenta)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
