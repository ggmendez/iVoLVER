/*
 Color conversions
 Copyright (c) 2011, Cory Nelson (phrosty@gmail.com)
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
 When possible, constants are given as accurate pre-computed rationals. When not,
 they are given at double precision with a comment on how to compute them.
 */

//    (function () { // wrap in a function to capture variables.

        function clamp(x, min, max) {
            if (x < min)
                return min;
            if (x > max)
                return max;
            return x;
        }

function clamphue(hue) {
    hue %= Math.PI * 2;

    if (hue < 0)
    {
        hue += Math.PI * 2;
    }

    return hue;
}

function ColorLShuv(L, S, h, clamped) {
    this.clamped = clamped || L < 0 || L > 100; // TODO: what is S min/max?

    this.L = clamp(L, 0, 100);
    this.S = S;
    this.h = clamphue(h);

    this.toLChuv = function ()
    {
        return new ColorLChuv(this.L, this.S * this.L, this.h);
    };
}

function ColorLChuv(L, C, h, clamped) {
    this.clamped = clamped || L < 0 || L > 100 || C < 0 || C > 7.40066582332174237e2;

    this.L = clamp(L, 0, 100);
    this.C = clamp(C, 0, 7.40066582332174237e2); // 240/316141*sqrt(950343809713)
    this.h = clamphue(h);

    this.toLShuv = function () {
        return new ColorLShuv(this.L, this.C / this.L, this.h, this.clamped);
    };

    this.toLuv = function () {
        var h = clamphue(this.h);
        return new ColorLuv(this.L, Math.cos(h) * this.C, Math.sin(h) * this.C, this.clamped);
    };
}

function ColorLuv(L, u, v, clamped) {
    this.clamped = clamped || L < 0 || L > 100 || u < -81304600 / 316141 || v > 54113280 / 316141; // TODO: what is u max, and v min??

    this.L = clamp(L, 0, 100);
    this.u = (u < -81304600 / 316141) ? -81304600 / 316141 : u;
    this.v = (v > 54113280 / 316141) ? 54113280 / 316141 : v;

    this.toLChuv = function ()
    {
        return new ColorLChuv(
                this.L,
                Math.sqrt(this.u * this.u + this.v * this.v),
                Math.atan2(this.v, this.u),
                this.clamped);
    };

    this.toXYZ = function () {
        var rdiv = Color.refX + Color.refY * 15 + Color.refZ * 3;
        var ur = Color.refX * 4 / rdiv;
        var vr = Color.refY * 9 / rdiv;

        if (L > 8) {
            var Y = (this.L + 16) / 116;
            Y = Y * Y * Y;
        } else {
            var Y = this.L * (27 / 24389);
        }

        var a = (this.L * 52 / (this.u + this.L * 13 * ur) - 1) / 3;
        var b = -5 * Y;
        var d = (this.L * 39 / (this.v + this.L * 13 * vr) - 5) * Y;

        var X = (d - b) / (a + 1 / 3);
        var Z = X * a + b;

        return new ColorXYZ(X, Y, Z, this.clamped);
    };
}

function ColorLChab(L, C, h, clamped) {
    this.clamped = clamped || L < 0 || L > 100 || C < 0 || C > 4.64238345442629658e2;

    this.L = clamp(L, 0, 100);
    this.C = clamp(C, 0, 4.64238345442629658e2); // 2500*sqrt(1/29)
    this.h = clamphue(h);

    this.toLab = function () {
        var h = clamphue(this.h);
        return new ColorLab(this.L, Math.cos(h) * this.C, Math.sin(h) * this.C, this.clamped);
    };
}

function ColorLab(L, a, b, clamped) {
    this.clamped = clamped || L < 0 || L > 100 || a < -12500 / 29 || a > 12500 / 29 || b < -5000 / 29 || b > 5000 / 29;

    this.L = clamp(L, 0, 100);
    this.a = clamp(a, -12500 / 29, 12500 / 29);
    this.b = clamp(b, -5000 / 29, 5000 / 29);

    this.toXYZ = function ()
    {
        function toXYZc(c)
        {
            var c3 = c * c * c;

            if (c3 > 216 / 24389)
                return c3;
            return c * (108 / 841) - (432 / 24389);
        }

        var Y = (this.L + 16) / 116;

        return new ColorXYZ(
                toXYZc(Y + this.a / 500) * Color.refX,
                toXYZc(Y) * Color.refY,
                toXYZc(Y - this.b / 200) * Color.refZ,
                this.clamped);
    };

    this.toLChab = function ()
    {
        return new ColorLChab(
                this.L,
                Math.sqrt(this.a * this.a + this.b * this.b),
                Math.atan2(this.b, this.a),
                this.clamped);
    };
}

function ColorxyY(x, y, Y, clamped)
{
    this.clamped = clamped || x < 0 || x > 1 || y < 0 || y > 1 || Y < 0 || Y > 1;

    this.x = clamp(x, 0, 1);
    this.y = clamp(y, 0, 1);
    this.Y = clamp(Y, 0, 1);

    this.toXYZ = function ()
    {
        if (Math.abs(this.y) != 0)
        {
            var mul = this.Y / this.y;
            return new ColorXYZ(this.x * mul, this.Y, (1 - this.x - this.y) * mul);
        }
        else
        {
            return new ColorXYZ(0, 0, 0);
        }
    };
}

function ColorXYZ(X, Y, Z, clamped)
{
    this.clamped = clamped || X < 0 || X > Color.refX || Y < 0 || Y > Color.refY || Z < 0 || Z > Color.refZ;

    this.X = clamp(X, 0, Color.refX);
    this.Y = clamp(Y, 0, Color.refY);
    this.Z = clamp(Z, 0, Color.refZ);

    this.toLinearRGB = function ()
    {
        return new ColorLinearxRGB(
                this.X * (641589 / 197960) + this.Y * (-608687 / 395920) + this.Z * (-49353 / 98980),
                this.X * (-42591639 / 43944050) + this.Y * (82435961 / 43944050) + this.Z * (1826061 / 43944050),
                this.X * (49353 / 887015) + this.Y * (-180961 / 887015) + this.Z * (49353 / 46685),
                this.clamped);
    };

    this.toxyY = function ()
    {
        var div = this.X + this.Y + this.Z;

        if (Math.abs(div) == 0)
        {
            div = 1;
        }

        return new ColorxyY(this.X / div, this.Y / div, this.Y, this.clamped);
    };

    this.toLab = function ()
    {
        function toLabc(c)
        {
            if (c > 216 / 24389)
                return Math.pow(c, 1 / 3);
            return c * (841 / 108) + (4 / 49);
        }

        var X = toLabc(this.X / Color.refX);
        var Y = toLabc(this.Y / Color.refY);
        var Z = toLabc(this.Z / Color.refZ);

        return new ColorLab(116 * Y - 16, 500 * (X - Y), 200 * (Y - Z), this.clamped);
    };

    this.toLuv = function ()
    {
        var rdiv = Color.refX + Color.refY * 15 + Color.refZ * 3;
        var ur = Color.refX * 4 / rdiv;
        var vr = Color.refY * 9 / rdiv;

        var div = this.X + this.Y * 15 + this.Z * 3;

        if (Math.abs(div) == 0)
        {
            div = 1;
        }

        var u = this.X * 4 / div;
        var v = this.Y * 9 / div;
        var yr = this.Y / Color.refY;

        if (yr > 216 / 24389)
        {
            var L = Math.pow(yr, 1 / 3) * 116 - 16;
        }
        else
        {
            var L = yr * (24389 / 27);
        }

        return new ColorLuv(L, L * 13 * (u - ur), L * 13 * (v - vr), this.clamped);
    };
}

function ColorLinearRGB(R, G, B, clamped)
{
    this.clamped = clamped || R < 0 || R > 1 || G < 0 || G > 1 || B < 0 || B > 1;
    this.R = clamp(R, 0, 1);
    this.G = clamp(G, 0, 1);
    this.B = clamp(B, 0, 1);

    this.toRGB = function ()
    {
        function toRGBc(c)
        {
            if (c > 0.0031308)
                return Math.pow(c, 1 / 2.4) * 1.055 - 0.055;
            return c * 12.92;
        }

        return new ColorRGB(toRGBc(this.R), toRGBc(this.G), toRGBc(this.B), this.clamped);
    };

    this.toXYZ = function ()
    {
        return new ColorXYZ(
                this.R * (5067776 / 12288897) + this.G * (4394405 / 12288897) + this.B * (4435075 / 24577794),
                this.R * (871024 / 4096299) + this.G * (8788810 / 12288897) + this.B * (887015 / 12288897),
                this.R * (79184 / 4096299) + this.G * (4394405 / 36866691) + this.B * (70074185 / 73733382),
                this.clamped);
    };
}

function ColorHSV(H, S, V, clamped)
{
    this.clamped = clamped || S < 0 || S > 1 || V < 0 || V > 1;
    this.H = clamphue(H);
    this.S = clamp(S, 0, 1);
    this.V = clamp(V, 0, 1);

    this.toRGB = function ()
    {
        if (this.S <= 0)
        {
            return new ColorRGB(this.V, this.V, this.V, this.clamped);
        }

        var H = clamphue(this.H) / 60;
        var C = this.V * this.S;
        var m = this.V - C;
        var X = C * (1 - Math.abs(H % 2 - 1)) + m;

        C += m;

        if (H >= 5)
            return new ColorRGB(C, m, X, this.clamped);
        if (H >= 4)
            return new ColorRGB(X, m, C, this.clamped);
        if (H >= 3)
            return new ColorRGB(m, X, C, this.clamped);
        if (H >= 2)
            return new ColorRGB(m, C, X, this.clamped);
        if (H >= 1)
            return new ColorRGB(X, C, m, this.clamped);
        return new ColorRGB(C, X, m, this.clamped);
    };
}

function ColorHSL(H, S, L, clamped)
{
    this.clamped = clamped || S < 0 || S > 1 || L < 0 || L > 1;
    this.H = clamphue(H);
    this.S = clamp(S, 0, 1);
    this.L = clamp(L, 0, 1);

    this.toRGB = function ()
    {
        if (this.S <= 0)
        {
            return new ColorRGB(this.S, this.S, this.S, this.clamped);
        }

        var H = clamphue(this.H) / 60;
        var C = (1 - Math.abs(this.L * 2 - 1)) * this.S;
        var m = this.L - C * 0.5;
        var X = C * (1 - Math.abs(H % 2 - 1)) + m;

        C += m;

        if (H >= 5)
            return new ColorRGB(C, m, X, this.clamped);
        if (H >= 4)
            return new ColorRGB(X, m, C, this.clamped);
        if (H >= 3)
            return new ColorRGB(m, X, C, this.clamped);
        if (H >= 2)
            return new ColorRGB(m, C, X, this.clamped);
        if (H >= 1)
            return new ColorRGB(X, C, m, this.clamped);
        return new ColorRGB(C, X, m, this.clamped);
    };
}

function ColorRGB(R, G, B, clamped)
{
    this.clamped = clamped || R < 0 || R > 1 || G < 0 || G > 1 || B < 0 || B > 1;
    this.R = clamp(R, 0, 1);
    this.G = clamp(G, 0, 1);
    this.B = clamp(B, 0, 1);

    this.toHSV = function () {
        var min = Math.min(this.R, this.G, this.B);
        var max = Math.max(this.R, this.G, this.B);
        var delta = max - min;

        if (Math.abs(delta) != 0)
        {
            var S = delta / max;

            if (max == this.R)
                var H = (this.G - this.B) / delta;
            else if (max == this.G)
                var H = (this.B - this.R) / delta + 2;
            else
                var H = (this.R - this.G) / delta + 4;
        }
        else
        {
            var H = 0;
            var S = 0;
        }

        return new ColorHSV(H * 60, S, max, this.clamped);
    };

    this.toHSL = function () {
        var min = Math.min(this.R, this.G, this.B);
        var max = Math.max(this.R, this.G, this.B);
        var delta = max - min;

        var L = (max + min) * 0.5;

        if (Math.abs(delta) != 0)
        {
            if (L < 0.5)
                var S = delta / (max + min);
            else
                var S = delta / (2 - max - min);

            if (max == this.R)
                var H = (this.G - this.B) / delta;
            else if (max == this.G)
                var H = (this.B - this.R) / delta + 2;
            else
                var H = (this.R - this.G) / delta + 4;
        }
        else
        {
            var H = 0;
            var S = 0;
        }

        return new ColorHSL(H * 60, S, L, this.clamped);
    };

    this.toLinearRGB = function () {
        function toLinearRGBc(c)
        {
            if (c > 0.04045)
                return Math.pow((c + 0.055) / 1.055, 2.4);
            return c / 12.92;
        }

        return new ColorLinearRGB(toLinearRGBc(this.R), toLinearRGBc(this.G), toLinearRGBc(this.B), this.clamped);
    };

    this.toYUV = function () {
        var mat = Color.yuvmatrix;

        var y = this.R * mat.rScale + this.G * mat.gScale + this.B * mat.bScale;
        var u = (this.B - y) / (1 - mat.bScale) * 0.5 + 0.5;
        var v = (this.R - y) / (1 - mat.rScale) * 0.5 + 0.5;

        return new ColorYUV(y, u, v, this.clamped);
    };

    this.toYIQ = function () {
        return new ColorYIQ(
                this.R * 0.299 + this.G * 0.587 + this.B * 0.114,
                this.R * 0.5 + this.G * -0.23038159508364756 + this.B * -0.26961840491635244 + 0.5,
                this.R * -0.202349432337541121 + this.G * 0.5 + this.B * -0.297650567662458879 + 0.5,
                this.clamped);
    };
}

function ColorYUV(Y, U, V, clamped)
{
    this.clamped = clamped || Y < 0 || Y > 1 || U < 0 || V > 1 || V < 0 || V > 1;
    this.Y = clamp(Y, 0, 1);
    this.U = clamp(U, 0, 1);
    this.V = clamp(V, 0, 1);

    this.toRGB = function ()
    {
        var mat = Color.yuvmatrix;

        var u = (this.U - 0.5) / 0.5 * (1 - mat.bScale);
        var v = (this.V - 0.5) / 0.5 * (1 - mat.rScale);

        var r = v + this.Y;
        var b = u + this.Y;
        var g = (this.Y - r * mat.rScale - b * mat.bScale) / mat.gScale;

        return new ColorRGB(r, g, b, this.clamped);
    };
}

function ColorYIQ(Y, I, Q, clamped)
{
    this.clamped = clamped || Y < 0 || Y > 1 || I < 0 || I > 1 || Q < 0 || Q > 1;
    this.Y = clamp(Y, 0, 1);
    this.I = clamp(I, 0, 1);
    this.Q = clamp(Q, 0, 1);

    this.toRGB = function ()
    {
        var i = this.I - 0.5;
        var q = this.Q - 0.5;

        return new ColorRGB(
                this.Y + i * 1.13933588212202582 - q * 0.649035964281386078,
                this.Y - i * 0.32416610079155499 + q * 0.676636193255190191,
                this.Y - i * 1.31908708412142932 - q * 1.78178677298826495,
                this.clamped);
    };
}

// CIE Delta E 1976
// JND: ~2.3
function deltaE1976(lab1, lab2) {
    var delta_L = lab1.L - lab2.L;
    var delta_a = lab1.a - lab2.a;
    var delta_b = lab1.b - lab2.b;

    return Math.sqrt(delta_L * delta_L + delta_a * delta_a + delta_b * delta_b);
}

function computeEuclideanDistance (c1, c2) {
    
    return Math.sqrt( Math.pow(getR(c1) - getR(c2), 2) + Math.pow(getG(c1) - getG(c2), 2) + Math.pow(getB(c1) - getB(c2), 2) );
    
}

// CIE Delta E 1994
function deltaE1994(lab1, lab2, type) {

    /*if (LOG) console.log("deltaE1994 for");
    if (LOG) console.log(lab1);
    if (LOG) console.log("and");
    if (LOG) console.log(lab2);*/

    var C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
    var C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);

    var delta_L = lab1.L - lab2.L;
    var delta_C = C1 - C2;
    var delta_a = lab1.a - lab2.a;
    var delta_b = lab1.b - lab2.b;
    var delta_H = Math.sqrt(delta_a * delta_a + delta_b * delta_b - delta_C * delta_C);

    if (type == 'graphic arts') {
        delta_C /= ((C1 * 0.045) + 1);
        delta_H /= ((C1 * 0.015) + 1);
    } else if (type == 'textiles') {
        delta_L *= 0.5;
        delta_C /= C1 * 0.048 + 1;
        delta_H /= C1 * 0.014 + 1;
    }
    
    if (isNaN(delta_H)) {
        delta_H = 0;
    }

    return Math.sqrt(delta_L * delta_L + delta_C * delta_C + delta_H * delta_H);
}

// CIE Delta E 2000
// Note: maximum is about 158 for colors in the sRGB gamut.
function deltaE2000(lch1, lch2) {
    var avg_L = (lch1.L + lch2.L) * 0.5;
    var delta_L = lch2.L - lch1.L;

    var avg_C = (lch1.C + lch2.C) * 0.5;
    var delta_C = lch1.C - lch2.C;

    var avg_H = (lch1.h + lch2.h) * 0.5;

    if (Math.abs(lch1.h - lch2.h) > Math.PI) {
        avg_H += Math.PI;
    }

    var delta_H = lch2.h - lch1.h;

    if (Math.abs(delta_H) > Math.PI) {
        if (lch2.h <= lch1.h)
            delta_H += Math.PI * 2;
        else
            delta_H -= Math.PI * 2;
    }

    delta_H = Math.sqrt(lch1.C * lch2.C) * Math.sin(delta_H) * 2;

    var T = 1
            - 0.17 * Math.cos(avg_H - Math.PI / 6)
            + 0.24 * Math.cos(avg_H * 2)
            + 0.32 * Math.cos(avg_H * 3 + Math.PI / 30)
            - 0.20 * Math.cos(avg_H * 4 - Math.PI * 7 / 20);

    var SL = avg_L - 50;
    SL *= SL;
    SL = SL * 0.015 / Math.sqrt(SL + 20) + 1;

    var SC = avg_C * 0.045 + 1;

    var SH = avg_C * T * 0.015 + 1;

    var delta_Theta = avg_H / 25 - Math.PI * 11 / 180;
    delta_Theta = Math.exp(delta_Theta * -delta_Theta) * (Math.PI / 6);

    var RT = Math.pow(avg_C, 7);
    RT = Math.sqrt(RT / (RT + 6103515625)) * Math.sin(delta_Theta) * -2; // 6103515625 = 25^7

    delta_L /= SL;
    delta_C /= SC;
    delta_H /= SH;

    if (isNaN(delta_H)) {
        delta_H = 0;
    }

    return Math.sqrt(delta_L * delta_L + delta_C * delta_C + delta_H * delta_H + RT * delta_C * delta_H);
}

var Color =
        {
            refX: 31271 / 32902, // normalized standard observer D65.
            refY: 1,
            refZ: 35827 / 32902,
            yuvmatrices:
                    {
                        'bt601':
                                {
                                    name: 'ITU-R BT.601 (DVD, JPEG, Youtube)',
                                    rScale: 0.299,
                                    gScale: 0.587,
                                    bScale: 0.114
                                },
                        'bt709':
                                {
                                    name: 'ITU-R BT.709 (HDTV)',
                                    rScale: 0.2125,
                                    gScale: 0.7154,
                                    bScale: 0.0721
                                },
                        'smpte240m':
                                {
                                    name: 'SMPTE 240M (very old HDTV)',
                                    rScale: 0.212,
                                    gScale: 0.701,
                                    bScale: 0.087
                                },
                        'fcc':
                                {
                                    name: 'FCC',
                                    rScale: 0.3,
                                    gScale: 0.59,
                                    bScale: 0.11
                                }
                    },
            colorspaces:
                    {
                        'rgb':
                                {
                                    name: 'RGB',
                                    components: ['Red', 'Green', 'Blue'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 1, scale: 255},
                                                {minimum: 0, maximum: 1, scale: 255},
                                                {minimum: 0, maximum: 1, scale: 255}
                                            ],
                                    toColor: function (x) {
                                        return new ColorRGB(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.R, x.G, x.B];
                                    },
                                    conversions:
                                            {
                                                'hsl': function (x) {
                                                    return x.toHSL();
                                                },
                                                'hsv': function (x) {
                                                    return x.toHSV();
                                                },
                                                'yuv': function (x) {
                                                    return x.toYUV();
                                                },
                                                'yiq': function (x) {
                                                    return x.toYIQ();
                                                },
                                                'linear_rgb': function (x) {
                                                    return x.toLinearRGB();
                                                }
                                            }
                                },
                        'linear_rgb':
                                {
                                    name: 'Linear RGB',
                                    components: ['Red', 'Green', 'Blue'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 1, scale: 1023},
                                                {minimum: 0, maximum: 1, scale: 1023},
                                                {minimum: 0, maximum: 1, scale: 1023}
                                            ],
                                    toColor: function (x) {
                                        return new ColorLinearRGB(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.R, x.G, x.B];
                                    },
                                    conversions:
                                            {
                                                'rgb': function (x) {
                                                    return x.toRGB();
                                                },
                                                'xyz': function (x) {
                                                    return x.toXYZ();
                                                },
                                            }
                                },
                        'hsl':
                                {
                                    name: 'HSL',
                                    components: ['Hue', 'Saturation', 'Lightness'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 359, scale: 1},
                                                {minimum: 0, maximum: 1, scale: 255},
                                                {minimum: 0, maximum: 1, scale: 255}
                                            ],
                                    toColor: function (x) {
                                        return new ColorHSL(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.H, x.S, x.L];
                                    },
                                    conversions:
                                            {
                                                'rgb': function (x) {
                                                    return x.toRGB();
                                                }
                                            }
                                },
                        'hsv':
                                {
                                    name: 'HSV',
                                    components: ['Hue', 'Saturation', 'Value'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 359, scale: 1},
                                                {minimum: 0, maximum: 1, scale: 255},
                                                {minimum: 0, maximum: 1, scale: 255}
                                            ],
                                    toColor: function (x) {
                                        return new ColorHSV(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.H, x.S, x.V];
                                    },
                                    conversions:
                                            {
                                                'rgb': function (x) {
                                                    return x.toRGB();
                                                }
                                            }
                                },
                        'yuv':
                                {
                                    name: 'Y′UV',
                                    components: ['Luma', 'Chroma U', 'Chroma V'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 1, scale: 255},
                                                {minimum: 0, maximum: 1, scale: 255},
                                                {minimum: 0, maximum: 1, scale: 255}
                                            ],
                                    toColor: function (x) {
                                        return new ColorYUV(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.Y, x.U, x.V];
                                    },
                                    conversions:
                                            {
                                                'rgb': function (x) {
                                                    return x.toRGB();
                                                }
                                            }
                                },
                        'yiq':
                                {
                                    name: 'Y′IQ',
                                    components: ['Luma', 'Chroma I', 'Chroma Q'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 1, scale: 255},
                                                {minimum: 0, maximum: 1, scale: 255},
                                                {minimum: 0, maximum: 1, scale: 255}
                                            ],
                                    toColor: function (x) {
                                        return new ColorYIQ(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.Y, x.I, x.Q];
                                    },
                                    conversions:
                                            {
                                                'rgb': function (x) {
                                                    return x.toRGB();
                                                }
                                            }
                                },
                        'xyy':
                                {
                                    name: 'CIE xyY',
                                    components: ['x', 'y', 'Y'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 1, scale: 100},
                                                {minimum: 0, maximum: 1, scale: 100},
                                                {minimum: 0, maximum: 1, scale: 100}
                                            ],
                                    toColor: function (x) {
                                        return new ColorxyY(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.x, x.y, x.Y];
                                    },
                                    conversions:
                                            {
                                                'xyz': function (x) {
                                                    return x.toXYZ();
                                                }
                                            }
                                },
                        'xyz':
                                {
                                    name: 'CIE XYZ',
                                    components: ['X', 'Y', 'Z'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 0.9505, scale: 100},
                                                {minimum: 0, maximum: 1, scale: 100},
                                                {minimum: 0, maximum: 1.089, scale: 100}
                                            ],
                                    toColor: function (x) {
                                        return new ColorXYZ(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.X, x.Y, x.Z];
                                    },
                                    conversions:
                                            {
                                                'linear_rgb': function (x) {
                                                    return x.toLinearRGB();
                                                },
                                                'lab': function (x) {
                                                    return x.toLab();
                                                },
                                                'luv': function (x) {
                                                    return x.toLuv();
                                                },
                                                'xyy': function (x) {
                                                    return x.toxyY();
                                                }
                                            }
                                },
                        'lab':
                                {
                                    name: 'CIE L*a*b*',
                                    components: ['Lightness', 'a', 'b'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 100, scale: 1},
                                                {minimum: -12500 / 29, maximum: 12500 / 29, scale: 1},
                                                {minimum: -5000 / 29, maximum: 5000 / 29, scale: 1}
                                            ],
                                    toColor: function (x) {
                                        return new ColorLab(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.L, x.a, x.b];
                                    },
                                    conversions:
                                            {
                                                'xyz': function (x) {
                                                    return x.toXYZ();
                                                },
                                                'LChab': function (x) {
                                                    return x.toLChab();
                                                }
                                            }
                                },
                        'LChab':
                                {
                                    name: function (c)
                                    {
                                        c.appendChild(document.createTextNode('CIE L*C*h'));

                                        var sub = document.createElement('sub');
                                        sub.appendChild(document.createTextNode('ab'));
                                        c.appendChild(sub);
                                    },
                                    components: ['Lightness', 'Chroma', 'Hue'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 100, scale: 1},
                                                {minimum: 0, maximum: 4.64238345442629658e2, scale: 1},
                                                {minimum: 0, maximum: Math.PI * 2, scale: 180 / Math.PI}
                                            ],
                                    toColor: function (x) {
                                        return new ColorLChab(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.L, x.C, x.h];
                                    },
                                    conversions:
                                            {
                                                'lab': function (x) {
                                                    return x.toLab();
                                                }
                                            }
                                },
                        'luv':
                                {
                                    name: 'CIE L*u*v*',
                                    components: ['Lightness', 'u', 'v'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 100, scale: 1},
                                                {minimum: -81304600 / 316141, maximum: 720, scale: 1},
                                                {minimum: -160, maximum: 54113280 / 316141, scale: 1}
                                            ],
                                    toColor: function (x) {
                                        return new ColorLuv(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.L, x.u, x.v];
                                    },
                                    conversions:
                                            {
                                                'xyz': function (x) {
                                                    return x.toXYZ();
                                                },
                                                'LChuv': function (x) {
                                                    return x.toLChuv();
                                                }
                                            }
                                },
                        'LChuv':
                                {
                                    name: function (c)
                                    {
                                        c.appendChild(document.createTextNode('CIE L*C*h'));

                                        var sub = document.createElement('sub');
                                        sub.appendChild(document.createTextNode('uv'));
                                        c.appendChild(sub);
                                    },
                                    components: ['Lightness', 'Chroma', 'Hue'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 100, scale: 1},
                                                {minimum: 0, maximum: 7.40066582332174237e2, scale: 1},
                                                {minimum: 0, maximum: Math.PI * 2, scale: 180 / Math.PI}
                                            ],
                                    toColor: function (x) {
                                        return new ColorLChuv(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.L, x.C, x.h];
                                    },
                                    conversions:
                                            {
                                                'luv': function (x) {
                                                    return x.toLuv();
                                                },
                                                'lshuv': function (x) {
                                                    return x.toLShuv();
                                                }
                                            }
                                },
                        'lshuv':
                                {
                                    name: function (c)
                                    {
                                        c.appendChild(document.createTextNode('CIE L*Sh'));

                                        var sub = document.createElement('sub');
                                        sub.appendChild(document.createTextNode('uv'));
                                        c.appendChild(sub);
                                    },
                                    components: ['Lightness', 'Saturation', 'Hue'],
                                    componentInfo:
                                            [
                                                {minimum: 0, maximum: 100, scale: 1},
                                                {minimum: 0, maximum: 4.5, scale: 25},
                                                {minimum: 0, maximum: Math.PI * 2, scale: 180 / Math.PI}
                                            ],
                                    toColor: function (x) {
                                        return new ColorLShuv(x[0], x[1], x[2]);
                                    },
                                    toGeneric: function (x) {
                                        return [x.L, x.S, x.h];
                                    },
                                    conversions:
                                            {
                                                'LChuv': function (x) {
                                                    return x.toLChuv();
                                                }
                                            }
                                }
                    }
        };

function updateColors(firstid, firstcolor, starting)
{
    var queue = new Array();
    queue.push(firstid);

    var colors = {};
    colors[firstid] = firstcolor;

    while (queue.length > 0)
    {
        var id = queue.pop();
        var cs = Color.colorspaces[id];

        for (nextid in cs.conversions)
        {
            if (!colors[nextid])
            {
                colors[nextid] = cs.conversions[nextid](colors[id]);
                queue.push(nextid);
            }
        }
    }

    // update the text inputs.

    for (id in colors)
    {
        var cs = Color.colorspaces[id];

        var generic = cs.toGeneric(colors[id]);

        for (idx in cs.componentInfo)
        {
            var v = generic[idx] * cs.componentInfo[idx].scale;

            cs.sliders[idx].text.value = v.toFixed();

            if (starting || id != firstid)
            {
                $(cs.sliders[idx].slider).slider('option', 'value', v);
            }
        }

        $(cs.clamped).css('visibility', colors[id].clamped ? 'visible' : 'hidden');
    }

    var rgb = colors.rgb;
    $(Color.colorBar).css('background-color', 'RGB(' + (rgb.R * 100) + '%,' + (rgb.G * 100) + '%,' + (rgb.B * 100) + '%)');
}

function setupColor(table, id, cs, first) {
    var row = table.insertRow(-1);

    if (!first)
    {
        row.className = 'color';
    }

    var col = row.insertCell(-1);
    col.rowSpan = cs.components.length;
    col.className = 'colorname';

    if (typeof (cs.name) == 'string')
    {
        col.appendChild(document.createTextNode(cs.name));
    }
    else
    {
        cs.name(col);
    }

    var sliders = {};

    cs.getColor = function (c)
    {
        if (c == undefined)
            c = {};

        for (idx in sliders)
        {
            if (c[idx] == undefined)
            {
                c[idx] = $(sliders[idx].slider).slider('option', 'value');
            }

            c[idx] = c[idx] / cs.componentInfo[idx].scale;
        }

        return cs.toColor(c);
    };

    function update(c)
    {
        updateColors(id, cs.getColor(c), false);
    }

    function addSlider(idx)
    {
        col = row.insertCell(-1);
        col.appendChild(document.createTextNode(cs.components[idx]));

        var div = document.createElement('div');
        div.className = 'slider';
        $(div).slider({
            value: 0,
            min: cs.componentInfo[idx].minimum * cs.componentInfo[idx].scale,
            max: cs.componentInfo[idx].maximum * cs.componentInfo[idx].scale,
            slide: function (evt, ui) {
                var c = {};
                c[idx] = ui.value;
                update(c);
            }
        });
        col = row.insertCell(-1);
        col.appendChild(div);

        var input = document.createElement('input');
        input.type = 'text';
        input.readOnly = true;
        col = row.insertCell(-1);
        col.appendChild(input);

        sliders[idx] = {slider: div, text: input};
    }

    addSlider(0);

    if (first)
    {
        var total = 0;

        for (idx in Color.colorspaces)
        {
            total += Color.colorspaces[idx].components.length;
        }

        Color.colorBar = row.insertCell(-1);
        Color.colorBar.rowSpan = total;
        Color.colorBar.id = 'colorbar';
    }

    cs.clamped = row.insertCell(-1);
    cs.clamped.className = 'clamped';
    cs.clamped.appendChild(document.createTextNode('clamped'));
    cs.clamped.rowSpan = cs.components.length;

    for (var i = 1; i < cs.components.length; ++i)
    {
        row = table.insertRow(-1);
        addSlider(i);
    }

    cs.sliders = sliders;
}

// initialize the table.

/*var table = document.getElementById('colors');
 var first = true;
 
 for (cs in Color.colorspaces)
 {
 setupColor(table, cs, Color.colorspaces[cs], first);
 first = false;
 }
 
 // initialize YUV coefficients select.
 
 var yuvselect = document.getElementById('yuvmatrix');
 for (id in Color.yuvmatrices)
 {
 var option = document.createElement('option');
 option.value = id;
 option.selected = (id == 'bt709');
 
 option.appendChild(document.createTextNode(Color.yuvmatrices[id].name));
 yuvselect.appendChild(option);
 }
 
 $(yuvselect).change(function ()
 {
 var next = Color.yuvmatrices[yuvselect.value];
 
 if (!next)
 return;
 
 var rgb = Color.colorspaces['yuv'].getColor().toRGB();
 
 Color.yuvmatrix = next;
 updateColors('rgb', rgb, false);
 });
 
 // Delta E events.
 
 var del1 = document.getElementById('del1');
 var dea1 = document.getElementById('dea1');
 var deb1 = document.getElementById('deb1');
 
 var del2 = document.getElementById('del2');
 var dea2 = document.getElementById('dea2');
 var deb2 = document.getElementById('deb2');
 
 var de1976 = document.getElementById('de1976');
 var de1994ga = document.getElementById('de1994ga');
 var de1994t = document.getElementById('de1994t');
 var de2000 = document.getElementById('de2000');
 
 function deChanged()
 {
 var L1 = parseInt(del1.value);
 var a1 = parseInt(dea1.value);
 var b1 = parseInt(deb1.value);
 var L2 = parseInt(del2.value);
 var a2 = parseInt(dea2.value);
 var b2 = parseInt(deb2.value);
 
 if (L1 == NaN || a1 == NaN || b1 == NaN || L2 == NaN || a2 == NaN || b2 == NaN)
 {
 return;
 }
 
 var lab1 = new ColorLab(L1, a1, b1);
 var lch1 = lab1.toLChab();
 
 var lab2 = new ColorLab(L2, a2, b2);
 var lch2 = lab2.toLChab();
 
 de1976.value = deltaE1976(lab1, lab2).toFixed(2);
 de1994ga.value = deltaE1994(lab1, lab2, 'graphic arts').toFixed(2);
 de1994t.value = deltaE1994(lab1, lab2, 'textiles').toFixed(2);
 de2000.value = deltaE2000(lch1, lch2).toFixed(2);
 }
 
 var deltaeinputs = [del1, dea1, deb1, del2, dea2, deb2];
 
 for (i in deltaeinputs)
 {
 $(deltaeinputs[i]).change(deChanged);
 $(deltaeinputs[i]).keyup(deChanged);
 }
 
 // initialize data.
 
 Color.yuvmatrix = Color.yuvmatrices['bt709'];
 updateColors('rgb', new ColorRGB(0.47, 0.76, 0.91), true);
 
 del1.value = 75;
 dea1.value = -13;
 deb1.value = -26;
 
 del2.value = 70;
 dea2.value = -16;
 deb2.value = -28;
 
 deChanged();*/

//    })();
