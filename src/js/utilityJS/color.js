console.log("color");

const colors = function(COLOR) {
  // This file contains generic utilities for RGB and HSL functions. It is not comprehensive.
  COLOR.white = [255, 255, 255];
  COLOR.black = [0, 0, 0];
  COLOR.red = [255, 0, 0];
  COLOR.green = [0, 255, 0];
  COLOR.blue = [0, 0, 255];
  COLOR.grey = COLOR.gray = function(x) {
    return [x, x, x];
  };

  COLOR.RGB01ToCIELAB = function(col) {
    var c = [];
    c = COLOR.RGB01ToCIEXYZ(col);
    c = COLOR.CIEXYZToCIELAB(c);
    return c;
  };

  COLOR.CIELABToRGB01 = function(col) {
    var c = [];
    c = COLOR.CIELABToCIEXYZ(col);
    c = COLOR.CIEXYZToRGB01(c);
    return c;
  };

  // https://en.wikipedia.org/wiki/Lab_color_space
  // col contains [L*,a*,b*]
  COLOR.CIELABToCIEXYZ = function(col) {
    // Illuminant D65 reference white point [95.047,100,108.883]
    var Xr = 95.047;
    var Yr = 100;
    var Zr = 108.883;
    var delta = 6 / 29;
    var c = [];
    var fInv = function(t) {
      if (t > delta) {
        return t * t * t;
      } else {
        return 3 * delta * delta * (t - 4 / 29);
      }
    };
    c[0] = Xr * fInv((1 / 116) * (col[0] + 16) + (1 / 500) * col[1]);
    c[1] = Yr * fInv((1 / 116) * (col[0] + 16));
    c[2] = Zr * fInv((1 / 116) * (col[0] + 16) - (1 / 200) * col[2]);
    return c;
  };

  COLOR.CIEXYZToCIELAB = function(col) {
    // Illuminant D65 reference white point [95.047,100,108.883]
    var Xr = 95.047;
    var Yr = 100;
    var Zr = 108.883;
    var c = [];
    var c2 = [];
    var f = function(t) {
      if (t > Math.pow(6 / 29, 3)) {
        return Math.pow(t, 1 / 3);
      } else {
        return (1 / 3) * (29 / 6) * (29 / 6) * t + 4 / 29;
      }
    };
    c[0] = f(col[0] / Xr);
    c[1] = f(col[1] / Yr);
    c[2] = f(col[2] / Zr);
    c2[0] = 116 * c[1] - 16;
    c2[1] = 500 * (c[0] - c[1]);
    c2[2] = 200 * (c[1] - c[2]);
    return c2;
  };

  // Specifically, we are converting to sRGB here (hence the choice of D65 reference white above)
  // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
  // http://www.brucelindbloom.com/index.html?Equations.html
  COLOR.CIEXYZToRGB01 = function(col) {
    // Mi is the matrix M^{-1}
    var c = [];
    var Mi_11 = 3.2404542;
    var Mi_12 = -1.5371385;
    var Mi_13 = -0.4985314;
    var Mi_21 = -0.969266;
    var Mi_22 = 1.8760108;
    var Mi_23 = 0.041556;
    var Mi_31 = 0.0556434;
    var Mi_32 = -0.2040259;
    var Mi_33 = 1.0572252;
    c[0] = Mi_11 * col[0] + Mi_12 * col[1] + Mi_13 * col[2];
    c[1] = Mi_21 * col[0] + Mi_22 * col[1] + Mi_23 * col[2];
    c[2] = Mi_31 * col[0] + Mi_32 * col[1] + Mi_33 * col[2];
    var f = function(v) {
      if (v <= 0.0031308) {
        return 12.92 * v;
      } else {
        return 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
      }
    };
    c[0] = clamp(f(c[0]), 0, 1);
    c[1] = clamp(f(c[1]), 0, 1);
    c[2] = clamp(f(c[2]), 0, 1);
    return c;
  };

  // http://www.brucelindbloom.com/index.html?Equations.html
  COLOR.RGB01ToCIEXYZ = function(col) {
    var c = [];
    var c2 = [];
    var M_11 = 0.4124564;
    var M_12 = 0.3575761;
    var M_13 = 0.1804375;
    var M_21 = 0.2126729;
    var M_22 = 0.7151522;
    var M_23 = 0.072175;
    var M_31 = 0.0193339;
    var M_32 = 0.119192;
    var M_33 = 0.9503041;
    var f = function(V) {
      if (V <= 0.04045) {
        return V / 12.92;
      } else {
        return Math.pow((V + 0.055) / 1.055, 2.4);
      }
    };
    c[0] = f(col[0]);
    c[1] = f(col[1]);
    c[2] = f(col[2]);
    c2[0] = M_11 * c[0] + M_12 * c[1] + M_13 * c[2];
    c2[1] = M_21 * c[0] + M_22 * c[1] + M_23 * c[2];
    c2[2] = M_31 * c[0] + M_32 * c[1] + M_33 * c[2];
    return c2;
  };

  COLOR.HSLToRGB01 = function(col) {
    var K = [];
    var C = (1 - Math.abs(2 * col[2] - 1)) * col[1];
    var Hp = col[0] / 60;
    var Hp2 = Hp;
    while (Hp2 > 2) {
      Hp2 -= 2;
    }
    var X = C * (1 - Math.abs(Hp2 - 1));
    if (0 <= Hp && Hp < 1) {
      K[0] = C;
      K[1] = X;
      K[2] = 0;
    } else if (1 <= Hp && Hp < 2) {
      K[0] = X;
      K[1] = C;
      K[2] = 0;
    } else if (2 <= Hp && Hp < 3) {
      K[0] = 0;
      K[1] = C;
      K[2] = X;
    } else if (3 <= Hp && Hp < 4) {
      K[0] = 0;
      K[1] = X;
      K[2] = C;
    } else if (4 <= Hp && Hp < 5) {
      K[0] = X;
      K[1] = 0;
      K[2] = C;
    } else if (5 <= Hp && Hp < 6) {
      K[0] = C;
      K[1] = 0;
      K[2] = X;
    }
    var m = col[2] - C / 2;
    for (var i = 0; i < 3; i++) {
      K[i] = K[i] + m;
    }
    return K;
  };

  COLOR.HSLToRGB255 = function(col) {
    var c = [];
    c = COLOR.HSLToRGB01(col);
    c = COLOR.RGB01ToRGB255(c);
    return c;
  };

  COLOR.colorString = function(c) {
    if (c.length === 3) {
      return (
        "rgb(" +
        Math.floor(c[0] * 255) +
        "," +
        Math.floor(c[1] * 255) +
        "," +
        Math.floor(c[2] * 255) +
        ")"
      );
    }
    return (
      "rgba(" +
      Math.floor(c[0] * 255) +
      "," +
      Math.floor(c[1] * 255) +
      "," +
      Math.floor(c[2] * 255) +
      "," +
      c[3] +
      ")"
    );
  };

  function clamp(x, min, max) {
    if (x < min) {
      return min;
    }
    if (x > max) {
      return max;
    }
    return x;
  }

  COLOR.validate = function(col) {
    var c = [];
    for (var i = 0; i < 3; i++) {
      c[i] = clamp(Math.round(col[i]), 0, 255);
    }
    return c;
  };

  COLOR.hexStringToRGB01 = function(col) {
    var c = [];
    c = COLOR.hexStringToRGB255(col);
    c = COLOR.RGB255ToRGB01(c);
    return c;
  };

  COLOR.hexStringToRGB255 = function(col) {
    var c = [];
    var i = 0;
    if (col[0] === "#") {
      i = 1;
    }
    c[0] = 16 * parseInt(col[i], 16) + parseInt(col[i + 1], 16);
    c[1] = 16 * parseInt(col[i + 2], 16) + parseInt(col[i + 3], 16);
    c[2] = 16 * parseInt(col[i + 4], 16) + parseInt(col[i + 5], 16);
    return c;
  };

  COLOR.RGB255ToRGB01 = function(col) {
    var c = [];
    c[0] = col[0] / 255;
    c[1] = col[1] / 255;
    c[2] = col[2] / 255;
    return c;
  };

  COLOR.RGB01ToRGB255 = function(col) {
    var c = [];
    for (var i = 0; i < 3; i++) {
      c[i] = Math.round(col[i] * 255);
    }
    return c;
  };

  return COLOR;
};

export default colors;
