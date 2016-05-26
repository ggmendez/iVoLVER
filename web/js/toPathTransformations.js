//Taken from: http://phrogz.net/svg/transformations.js

(function(scope){

var PRES_ATTRIBUTES = ['style', 'alignment-baseline', 'baseline-shift', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cursor', 'direction', 'display', 'dominant-baseline', 'enable-background', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'glyph-orientation-horizontal', 'glyph-orientation-vertical', 'image-rendering', 'kerning', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'opacity', 'overflow', 'pointer-events', 'shape-rendering', 'stop-color', 'stop-opacity', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration', 'text-rendering', 'unicode-bidi', 'visibility', 'word-spacing', 'writing-mode', 'class'];
        var copyPresentation = function copyPresentation(source, dest){
        for (var i = PRES_ATTRIBUTES.length - 1; i >= 0; --i){
        var att = PRES_ATTRIBUTES[i];
                if (source.hasAttribute(att)) {
        dest.setAttribute(att, source.getAttribute(att));
        } else {

        var parent = source.parentNode;
                if (parent && parent.nodeName === 'g' && parent.hasAttribute(att)) {
        dest.setAttribute(att, parent.getAttribute(att));
        }


        }
        }
        };
        scope.flattenToPaths = function flattenToPaths(el, transform, svg){
        if (!svg) svg = el;
                while (svg && svg.tagName != 'svg') svg = svg.parentNode;
                if (!transform) {
        transform = svg.createSVGMatrix();
        }

        var doc = el.ownerDocument;
                var svgNS = svg.getAttribute('xmlns');
                var localMatrix = svg.createSVGMatrix();
                if (el.transform) {
        for (var xs = el.transform.baseVal, i = xs.numberOfItems - 1; i >= 0; --i){
        localMatrix = xs.getItem(i).matrix.multiply(localMatrix);
        }
        }


        transform = transform.multiply(localMatrix);
                console.log("transform: ");
                console.log(transform);
                var results = [];
                if (el.tagName == 'g'){
        for (var i = 0, len = el.childNodes.length; i < len; ++i){
        if (el.childNodes[i].nodeType == 1){
        results = results.concat(arguments.callee(el.childNodes[i], transform, svg));
        }
        }
        } else if (el.tagName == 'text') {



        console.log("el:");
        console.log(el);


        var x = el.getAttribute('x'), y = el.getAttribute('y');
                var top = el.getAttribute('top'), left = el.getAttribute('left');
                console.log("This is a text");
                console.log("x: " + x);
                console.log("y: " + y);
                console.log("left: " + left);
                console.log("top: " + top);
        } else{

        var path = doc.createElementNS(svgNS, 'path');
                copyPresentation(el, path);
                var xform = svg.createSVGTransform();
                xform.setMatrix(transform);
                path.transform.baseVal.initialize(xform);
                switch (el.tagName){
        case 'rect':
                path.setAttribute('stroke', el.getAttribute('stroke') || 'none');
                var x = el.getAttribute('x') * 1, y = el.getAttribute('y') * 1,
                w = el.getAttribute('width') * 1, h = el.getAttribute('height') * 1,
                rx = el.getAttribute('rx') * 1, ry = el.getAttribute('ry') * 1;
                if (rx && !el.hasAttribute('ry')) ry = rx;
                else if (ry && !el.hasAttribute('rx')) rx = ry;
                if (rx > w / 2) rx = w / 2;
                if (ry > h / 2) ry = h / 2;
                var dString = 'M ' + (x + rx) + ',' + y +
                ' L ' + (x + w - rx) + ',' + y +
                ((rx || ry) ? (' A ' + rx + ',' + ry + ',0,0,' + (rx * ry < 0?0:1) + ',' + (x + w) + ',' + (y + ry)) : '') +
                ' L ' + (x + w) + ',' + (y + h - ry) +
                ((rx || ry) ? (' A ' + rx + ',' + ry + ',0,0,' + (rx * ry < 0?0:1) + ',' + (x + w - rx) + ',' + (y + h)) : '') +
                ' L ' + (x + rx) + ',' + (y + h) +
                ((rx || ry) ? (' A ' + rx + ',' + ry + ',0,0,' + (rx * ry < 0?0:1) + ',' + x + ',' + (y + h - ry)) : '') +
                ' L ' + x + ',' + (y + ry) +
                ((rx || ry) ? (' A ' + rx + ',' + ry + ',0,0,' + (rx * ry < 0?0:1) + ',' + (x + rx) + ',' + y) : '');
                path.setAttribute('d', dString);
                break;
                case 'circle':
                var cx = el.getAttribute('cx') * 1, cy = el.getAttribute('cy') * 1,
                r = el.getAttribute('r') * 1, r0 = r / 2 + ',' + r / 2;
                path.setAttribute('d', 'M ' + cx + ',' + (cy - r) + ' A ' + r0 + ',0,0,0,' + cx + ',' + (cy + r) + ' ' + r0 + ',0,0,0,' + cx + ',' + (cy - r));
                break;
                case 'ellipse':
                var cx = el.getAttribute('cx') * 1, cy = el.getAttribute('cy') * 1,
                rx = el.getAttribute('rx') * 1, ry = el.getAttribute('ry') * 1;
                path.setAttribute('d', 'M ' + cx + ',' + (cy - ry) + ' A ' + rx + ',' + ry + ',0,0,0,' + cx + ',' + (cy + ry) + ' ' + rx + ',' + ry + ',0,0,0,' + cx + ',' + (cy - ry));
                break;
                case 'line':
                var x1 = el.getAttribute('x1') * 1, y1 = el.getAttribute('y1') * 1,
                x2 = el.getAttribute('x2') * 1, y2 = el.getAttribute('y2') * 1;
                path.setAttribute('d', 'M ' + x1 + ',' + y1 + ' L ' + x2 + ',' + y2);
                break;
                case 'polyline':
                case 'polygon':
                for (var i = 0, l = [], pts = el.points, len = pts.numberOfItems; i < len; ++i){
        var p = pts.getItem(i);
                l[i] = p.x + ',' + p.y;
        }
        path.setAttribute('d', "M " + l.shift() + " L " + l.join(' ') + (el.tagName == 'polygon') ? 'z' : '');
                break;
                case 'path':
                path.setAttribute('d', el.getAttribute('d'));
                break;
                default:
                path = null;
        }
        if (path) results.push(path);
        }
        return results;
        };
        var pt;
        scope.pathToPolys = function pathToPolys(path, dist){
        var doc = path.ownerDocument;
                var svgNS = "http://www.w3.org/2000/svg";
                var svg = doc.createElementNS(svgNS, 'svg');
                var transform = svg.createSVGMatrix();
                for (var xs = path.transform.baseVal, i = xs.numberOfItems - 1; i >= 0; --i){
        transform = xs.getItem(i).matrix.multiply(transform);
        }

        if (!pt) pt = svg.createSVGPoint();
                var xy = function(x, y){
                pt.x = x; pt.y = y;
                        pt = pt.matrixTransform(transform);
                        return (isNaN(pt.x) || isNaN(pt.y)) ? '' : (pt.x + ',' + pt.y);
                }

        for (var segs = [], s = path.pathSegList, i = s.numberOfItems - 1; i >= 0; --i) segs[i] = s.getItem(i);
                var segments = segs.concat();
                var polyType = segs[segs.length - 1].pathSegType == SVGPathSeg.PATHSEG_CLOSEPATH ? 'polygon' : 'polyline';
                var poly = doc.createElementNS(svgNS, polyType);
                copyPresentation(path, poly);
                var brokenSafari = path.getPathSegAtLength(0) == 1;
                var seg, lastSeg, points = [], x, y;
                var addSegmentPoint = function(s){
                if (s.pathSegType == SVGPathSeg.PATHSEG_CLOSEPATH){

                } else{
                if (s.pathSegType % 2 == 1 && s.pathSegType > 1){
                x += s.x; y += s.y;
                } else{
                x = s.x; y = s.y;
                }
                var lastPoint = points[points.length - 1];
                        if (!lastPoint || x != lastPoint[0] || y != lastPoint[1]) points.push([x, y]);
                }
                };
                for (var d = 0, len = path.getTotalLength(); d <= len; d += dist){
        var pt = path.getPointAtLength(d);
                if (!brokenSafari){
        var seg = segments[path.getPathSegAtLength(d)];
                if (seg != lastSeg){
        lastSeg = seg;
                while (segs.length && segs[0] != seg) addSegmentPoint(segs.shift());
        }
        }
        var lastPoint = points[points.length - 1];
                if (!lastPoint || pt.x != lastPoint[0] || pt.y != lastPoint[1]) points.push([pt.x, pt.y]);
        }
        if (!brokenSafari) for (var i = 0, len = segs.length; i < len; ++i) addSegmentPoint(segs[i]);
                for (var i = 0, len = points.length; i < len; ++i) points[i] = xy(points[i][0], points[i][1]);
                poly.setAttribute('points', points.join(' '));
                return poly;
        };
        scope.pathsToPolys = function pathsToPolys(paths, dist){
        var out = [];
                for (var i = paths.length - 1; i >= 0; --i){
        out[i] = pathToPolys(paths[i], dist);
        }
        return out;
        }
})(this);
        Z = function(x, y){ this.x = x || 0; this.y = y || 0; }
Z.add = function(z1, z2){ return z1.plus(z2); };
        Z.subtract = function(z1, z2){ return z1.minus(z2); };
        Z.multiply = function(z1, z2){ return z1.times(z2); };
        Z.divide = function(z1, z2){ return z1.dividedby(z2); };
        Z.fromXY = function(o){     return new Z(o.x, o.y); };
        (function(Z){
        var getLength = function(){  return Math.sqrt(this.x * this.x + this.y * this.y); };
                var setLength = function(r){ var f = r / this.r; this.x *= f; this.y *= f; };
                var getAngle = function(){  return Math.atan2(this.x, this.y); };
                var setAngle = function(){ return Math.atan2(this.x, this.y); };
                var conjugate = function(){  return new Z(this.x, - this.y); };
                var getReal = function(){  return this.x; };
                var setReal = function(x){ this.x = x; };
                var getImag = function(){  return this.y; };
                var setImag = function(y){ this.y = y; };
                var multiply = function(z){ if (!(z instanceof Z)) z = new Z(z, 0); return new Z(this.x * z.x - this.y * z.y, this.y * z.x + this.x * z.y); };
                var add = function(z){ if (!(z instanceof Z)) z = new Z(z, 0); return new Z(this.x + z.x, this.y + z.y); };
                var subtract = function(z){ if (!(z instanceof Z)) z = new Z(z, 0); return new Z(this.x - z.x, this.y - z.y); };
                Z.prototype = {
                copy      : function(){ return new Z(this.x, this.y); },
                        add       : add,
                        plus      : add,
                        subtract  : subtract,
                        minus     : subtract,
                        multiply  : multiply,
                        times     : multiply,
                        scale     : multiply,
                        dividedby : function(z){
                        if (!(z instanceof Z)) z = new Z(z, 0);
                                var r2 = z.r2;
                                return new Z((this.x * z.x + this.y * z.y) / r2, (this.y * z.x - this.x * z.y) / r2);
                        },
                        normalize : function(){ this.r = 1; },
                        get normalized(){ var r = this.r; return new Z(this.x / r, this.y / r); },
                        get r2(){ return this.x * this.x + this.y * this.y; }
                };
                Object.defineProperty(Z.prototype, 'real', { get:getReal, set:setReal });
                Object.defineProperty(Z.prototype, 'i', { get:getImag, set:setImag });
                Object.defineProperty(Z.prototype, 'imag', { get:getImag, set:setImag });
                Object.defineProperty(Z.prototype, 'imaginary', { get:getImag, set:setImag });
                Object.defineProperty(Z.prototype, 'r', { get:getLength, set:setLength });
                Object.defineProperty(Z.prototype, 'abs', { get:getLength, set:setLength });
                Object.defineProperty(Z.prototype, 'length', { get:getLength, set:setLength });
                Object.defineProperty(Z.prototype, 'magnitude', { get:getLength, set:setLength });
                Object.defineProperty(Z.prototype, 'Θ', { get:getAngle, set:setAngle });
                Object.defineProperty(Z.prototype, 'arg', { get:getAngle, set:setAngle });
                Object.defineProperty(Z.prototype, 'angle', { get:getAngle, set:setAngle });
                Object.defineProperty(Z.prototype, 'phase', { get:getAngle, set:setAngle });
                Object.defineProperty(Z.prototype, 'theta', { get:getAngle, set:setAngle });
                Object.defineProperty(Z.prototype, 'conj', { get:conjugate });
                Object.defineProperty(Z.prototype, 'conjugate', { get:conjugate });
        })(Z);
        (function(scope){
        var p, z = new Z;
                scope.mxy = function(svg, evt){
                if (!p) p = svg.createSVGPoint();
                        p.x = evt.clientX; p.y = evt.clientY;
                        p = p.matrixTransform(svg.getScreenCTM().inverse());
                        z.x = p.x; z.y = p.y;
                        return z;
                }
        })(this);
