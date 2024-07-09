console.log("arrayops");

Array.prototype.add = function(b) {
  var a = this,
    c = [];
  if (Object.prototype.toString.call(b) === "[object Array]") {
    if (a.length !== b.length) {
      throw "Array lengths do not match.";
    } else {
      for (let i = 0; i < a.length; i++) {
        c[i] = a[i] + b[i];
      }
    }
  } else if (typeof b === "number") {
    for (let i = 0; i < a.length; i++) {
      c[i] = a[i] + b;
    }
  }
  return c;
};

Array.prototype.mult = function(b) {
  var a = this,
    c = [];
  if (Object.prototype.toString.call(b) === "[object Array]") {
    if (a.length !== b.length) {
      throw "Array lengths do not match.";
    } else {
      for (var i = 0; i < a.length; i++) {
        c[i] = a[i] * b[i];
      }
    }
  } else if (typeof b === "number") {
    for (let i = 0; i < a.length; i++) {
      c[i] = a[i] * b;
    }
  }
  return c;
};

export default Array;
