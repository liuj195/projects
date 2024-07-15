var UINT32MAX = 4294967295; // 2^32 - 1
var POW2_32 = 4294967296; // 2^32

console.log("random");

export function Random(seed) {
  this.x = seed;
  this.y = 362436069;
  this.z = 521288629;
  this.w = 88675123;
  this.v = 886756453;
}

function modulo(a, b) {
  return a - Math.floor(a / b) * b;
}

function ToInteger(x) {
  x = Number(x);
  return x < 0 ? Math.ceil(x) : Math.floor(x);
}

function ToUint32(x) {
  return modulo(ToInteger(x), POW2_32);
}

Random.prototype.rand = function() {
  var t = ToUint32(this.x ^ (this.x >> 7));
  this.x = this.y;
  this.y = this.z;
  this.z = this.w;
  this.w = this.v;
  this.v = ToUint32(this.v ^ (this.v << 6) ^ (t ^ (t << 13)));
  return ToUint32((this.y + this.y + 1) * this.v) / UINT32MAX;
};
