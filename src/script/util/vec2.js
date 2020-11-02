/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

function Vec2(x, y, z) {
	if (arguments.length === 0) {
		this.x = 0;
		this.y = 0;
		this.z = 0;
	} else if (arguments.length === 1) {
		this.x = parseFloat(x.x || 0);
		this.y = parseFloat(x.y || 0);
		this.z = parseFloat(x.z || 0);
	} else if (arguments.length === 2) {
		this.x = parseFloat(x || 0);
		this.y = parseFloat(y || 0);
		this.z = 0;
	} else if (arguments.length === 3) {
		this.x = parseFloat(x);
		this.y = parseFloat(y);
		this.z = parseFloat(z);
	} else {
		throw new Error('Vec2(): invalid arguments');
	}
}

Vec2.ZERO = new Vec2(0, 0);
Vec2.UNIT = new Vec2(1, 1);

Vec2.prototype.length = function () {
	return Math.sqrt((this.x * this.x) + (this.y * this.y));
};

Vec2.prototype.equals = function (v) {
	console.assert(!!v);
	return this.x === v.x && this.y === v.y;
};

Vec2.prototype.add = function (v) {
	console.assert(!!v);
	return new Vec2(this.x + v.x, this.y + v.y, this.z + v.z);
};

Vec2.prototype.add_ = function (v) { // eslint-disable-line no-underscore-dangle
	console.assert(!!v);
	this.x += v.x;
	this.y += v.y;
	this.z += v.z;
};

Vec2.prototype.get_xy0 = function () {
	return new Vec2(this.x, this.y);
};

Vec2.prototype.sub = function (v) {
	console.assert(!!v);
	return new Vec2(this.x - v.x, this.y - v.y, this.z - v.z);
};

Vec2.prototype.scaled = function (s) {
	console.assert(s === 0 || !!s);
	return new Vec2(this.x * s, this.y * s, this.z * s);
};

Vec2.prototype.negated = function () {
	return new Vec2(-this.x, -this.y, -this.z);
};

Vec2.prototype.yComplement = function (y1) {
	y1 = y1 || 0;
	return new Vec2(this.x, y1 - this.y, this.z);
};

Vec2.prototype.addScaled = function (v, f) {
	console.assert(!!v);
	console.assert(f === 0 || !!f);

	return new Vec2(this.x + (v.x * f), this.y + (v.y * f), this.z + (v.z * f));
};

Vec2.prototype.normalized = function () {
	return this.scaled(1 / this.length());
};

Vec2.prototype.normalize = function () {
	const l = this.length();

	if (l < 0.000001)
		return false;

	this.x /= l;
	this.y /= l;

	return true;
};

Vec2.prototype.turnLeft = function () {
	return new Vec2(-this.y, this.x, this.z);
};

Vec2.prototype.coordStr = function () {
	return this.x.toString() + ' , ' + this.y.toString();
};

Vec2.prototype.toString = function () {
	return '(' + this.x.toFixed(2) + ',' + this.y.toFixed(2) + ')';
};

Vec2.prototype.max = function (v) {
	console.assert(!!v);
	return new Vec2.max(this, v); // eslint-disable-line new-cap
};

Vec2.prototype.min = function (v) {
	console.assert(!!v);
	return new Vec2.min(this, v); // eslint-disable-line new-cap
};

Vec2.prototype.ceil = function () {
	return new Vec2(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
};

Vec2.prototype.floor = function () {
	return new Vec2(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
};

Vec2.prototype.rotate = function (angle) {
	console.assert(angle === 0 || !!angle);

	const si = Math.sin(angle);
	const co = Math.cos(angle);

	return this.rotateSC(si, co);
};

Vec2.prototype.rotateSC = function (si, co) {
	console.assert(si === 0 || !!si);
	console.assert(co === 0 || !!co);

	return new Vec2((this.x * co) - (this.y * si), (this.x * si) + (this.y * co), this.z);
};

Vec2.prototype.oxAngle = function () {
	return Math.atan2(this.y, this.x);
};

Vec2.dist = function (a, b) {
	console.assert(!!a);
	console.assert(!!b);
	return Vec2.diff(a, b).length();
};

Vec2.max = function (v1, v2) {
	console.assert(!!v1);
	console.assert(!!v2);
	return new Vec2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y), Math.max(v1.z, v2.z));
};

Vec2.min = function (v1, v2) {
	console.assert(!!v1);
	console.assert(!!v2);
	return new Vec2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y), Math.min(v1.z, v2.z));
};

Vec2.sum = function (v1, v2) {
	console.assert(!!v1);
	console.assert(!!v2);
	return new Vec2(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
};

Vec2.dot = function (v1, v2) {
	console.assert(!!v1);
	console.assert(!!v2);

	return (v1.x * v2.x) + (v1.y * v2.y);
};

Vec2.cross = function (v1, v2) {
	console.assert(!!v1);
	console.assert(!!v2);

	return (v1.x * v2.y) - (v1.y * v2.x);
};

Vec2.angle = function (v1, v2) {
	console.assert(!!v1);
	console.assert(!!v2);

	return Math.atan2(Vec2.cross(v1, v2), Vec2.dot(v1, v2));
};

Vec2.diff = function (v1, v2) {
	console.assert(!!v1);
	console.assert(!!v2);

	return new Vec2(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
};

// assume arguments v1, f1, v2, f2, v3, f3, etc.
// where v[i] are vectors and f[i] are corresponding coefficients
Vec2.lc = function (...args) {
	let v = new Vec2();
	for (let i = 0; i < arguments.length / 2; ++i)
		v = v.addScaled(args[2 * i], args[(2 * i) + 1]);
	return v;
};

/**
 * @param v1 { Vec2 }
 * @param f1 { number }
 * @param v2 { Vec2 }
 * @param f2 { number }
 * @return { Vec2 }
 */
Vec2.lc2 = function (v1, f1, v2, f2) {
	console.assert(!!v1);
	console.assert(!!v2);
	console.assert(f1 === 0 || !!f1);
	console.assert(f2 === 0 || !!f2);

	return new Vec2((v1.x * f1) + (v2.x * f2), (v1.y * f1) + (v2.y * f2), (v1.z * f1) + (v2.z * f2));
};

Vec2.centre = function (v1, v2) {
	return new Vec2.lc2(v1, 0.5, v2, 0.5); // eslint-disable-line new-cap
};

export default Vec2;
