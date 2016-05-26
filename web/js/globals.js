var LOG = false;
//var LOG = true;

LINE_TEXT_EXTRACTOR = "line";
BLOCK_TEXT_EXTRACTOR = "block";

modeButtons = [
    'panningModeButton',
    'disconnectingModeButton',
    'floodFillButton',
    'multipleColorRegionsButton',
    'groupColorRegionButton',
    'lineTextExtractorButton',
    'blockTextExtractorButton',
    'samplerButton',
    'samplerLineButton',
    'drawPathMark',
    'drawFilledMark',
    'drawFunction',
    'squaredSelectionButton',
    'freeSelectionButton'
];

OPERATOR_TEXT_FILL = "rgb(226, 227, 227)";
DEFAULT_OPERATOR_FILL = "rgb(226, 227, 227)";
DEFAULT_OPERATOR_STROKE = "rgb(0, 0, 0)";

DEFAULT_VISUAL_PROPERTY_FILL = "rgba(153,153,153,1)";
DEFAULT_VISUAL_PROPERTY_STROKE = "rgba(86,86,86,1)";

CDATA_END_REPLACE = 'CDATA_END';
CDATA_END = ']]>';

/* TYPES */

NUMERIC = "Numeric";
STRING = "String";
DURATION = "Duration";
DATEANDTIME = "DateAndTime";
COLOR = "Color";
SHAPE = "Shape";


PANNING_OPERATION = 'Panning';
DISCONNECTION_OPERATION = 'Disconnecting';
SQUARED_GROUPING_OPERATION = 'Squared_Grouping';
FREE_SELECTION_OPERATION = 'Free_Selection';


HORIZONTAL_RECTANGULAR_OUTPUT = 'Horizontal Rect';
VERTICAL_RECTANGULAR_OUTPUT = 'Vertical Rect';
SQUARED_OUTPUT = 'Square';
CIRCULAR_OUTPUT = 'Circle';
TRIANGULAR_OUTPUT = 'Triangle';
POLYGONAL_OUTPUT = 'Polygon';
MINIATURE_OUTPUT = 'Miniature';

IMAGE_PLOTTER = 'ImagePlotter';


CIRCULAR_MARK = 'Circle';
RECTANGULAR_MARK = 'Rectangle';
SQUARED_MARK = 'Square';
ELLIPTIC_MARK = 'Ellipse';
FATFONT_MARK = 'FatFont';
PATH_MARK = 'Path';
FILLEDPATH_MARK = 'FilledPath';
SVGPATHGROUP_MARK = 'SVGPathGroup';



RECTANGULAR_VIXOR = 'RectangleExtractor';
TEXT_RECOGNIZER = 'TextRecognizer';
COLOR_REGION_EXTRACTOR = 'ColorRegionExtractor';
SAMPLER_VIXOR = 'SamplerExtractor';

rectangular_output_default_width = 30;
rectangular_output_default_height = 30;

rectangular_mark_default_width = 65;
rectangular_mark_default_height = 65;



widget_fill_opacity = 0.5;

widget_stroke_color = '#3d3000';
widget_stroke_width = 1.5;
widget_stroke_dash_array = [7, 7];

widget_selected_stroke_color = '#ffce0a';
widget_selected_stroke_width = 3;
widget_selected_stroke_dash_array = [7, 7];

ADDING_NEW_OUTPUT = "ADDING_NEW_OUTPUT";
REPLACING_EXISTING_OUTPUT = "REPLACING_EXISTING_OUTPUT";
DELETING_OUTPUT = "DELETING_OUTPUT";


timeFormats = null;
dateFormats = null;

superScriptsCodes = [
    '&#8304;', // 0
    '&#185;', // 1
    '&#178;', // 2
    '&#179;', // 3
    '&#8308;', // 4
    '&#8309;', // 5
    '&#8310;', // 6
    '&#8311;', // 7
    '&#8312;', // 8
    '&#8313;', // 9
];

metricPrefixes = [
    {prefix: 'tera', symbol: 'T', factor: 1000000000000, exponent: 12},
    {prefix: 'giga', symbol: 'G', factor: 1000000000, exponent: 9},
    {prefix: 'mega', symbol: 'M', factor: 1000000, exponent: 6},
    {prefix: '100-kilo', symbol: 'ck', factor: 100000, exponent: 5},
    {prefix: '10-kilo', symbol: 'dk', factor: 10000, exponent: 4},
    {prefix: 'kilo', symbol: 'k', factor: 1000, exponent: 3},
    {prefix: 'hecto', symbol: 'h', factor: 100, exponent: 2},
    {prefix: 'deca', symbol: 'da', factor: 10, exponent: 1},
    {prefix: '', symbol: '(none)', factor: 1, exponent: 0},
    {prefix: 'deci', symbol: 'd', factor: 0.1, exponent: -1},
    {prefix: 'centi', symbol: 'c', factor: 0.01, exponent: -2},
    {prefix: 'milli', symbol: 'm', factor: 0.001, exponent: -3},
    {prefix: 'micro', symbol: 'μ', factor: 0.000001, exponent: -6},
    {prefix: 'nano', symbol: 'n', factor: 0.000000001, exponent: -9},
    {prefix: 'pico', symbol: 'p', factor: 0.000000000001, exponent: -12}
];

dateAndTimeFormats = [
    'D/MM/YYYY, HH:mm:ss',
    'D/MM/YYYY',
    'HH:mm:ss',
];

durationFormats = [
    'milliseconds',
    'seconds',
    'minutes',
    'hours',
    'days',
    'months',
    'years',
];

months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

durationUnits = [
    'years',
    'months',
    'weeks',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds'
];



// Path Segment Types (numbers)
PATHSEG_UNKNOWN = 0;
PATHSEG_CLOSEPATH = 1;
PATHSEG_MOVETO_ABS = 2;
PATHSEG_MOVETO_REL = 3;
PATHSEG_LINETO_ABS = 4;
PATHSEG_LINETO_REL = 5;
PATHSEG_CURVETO_CUBIC_ABS = 6;
PATHSEG_CURVETO_CUBIC_REL = 7;
PATHSEG_CURVETO_QUADRATIC_ABS = 8;
PATHSEG_CURVETO_QUADRATIC_REL = 9;
PATHSEG_ARC_ABS = 10;
PATHSEG_ARC_REL = 11;
PATHSEG_LINETO_HORIZONTAL_ABS = 12;
PATHSEG_LINETO_HORIZONTAL_REL = 13;
PATHSEG_LINETO_VERTICAL_ABS = 14;
PATHSEG_LINETO_VERTICAL_REL = 15;
PATHSEG_CURVETO_CUBIC_SMOOTH_ABS = 16;
PATHSEG_CURVETO_CUBIC_SMOOTH_REL = 17;
PATHSEG_CURVETO_QUADRATIC_SMOOTH_ABS = 18;
PATHSEG_CURVETO_QUADRATIC_SMOOTH_REL = 19;

linearDimensions = [
    'width',
    'height',
    'radius',
    'rx',
    'ry',
];