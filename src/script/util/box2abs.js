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

import Vec2 from './vec2';

function Box2Abs(...args) {
	if (args.length === 1 && 'min' in args[0] && 'max' in args[0]) {
		this.p0 = args[0].min;
		this.p1 = args[0].max;
	}

	if (args.length === 2) {
		this.p0 = args[0];
		this.p1 = args[1];
	} else if (args.length === 4) {
		this.p0 = new Vec2(args[0], args[1]);
		this.p1 = new Vec2(args[2], args[3]);
	} else if (args.length === 0) {
		this.p0 = new Vec2();
		this.p1 = new Vec2();
	} else {
		return new Error('Box2Abs constructor only accepts 4 numbers or 2 vectors or no args!');
	}
}

Box2Abs.prototype.toString = function () {
	return this.p0.toString() + ' ' + this.p1.toString();
};

Box2Abs.prototype.clone = function () {
	return new Box2Abs(this.p0, this.p1);
};

/**
 * @param lp { Vec2 }
 * @param rb [ Vec2 }
 * @returns { Box2Abs }
 */
Box2Abs.prototype.extend = function (lp, rb) {
	console.assert(!!lp);
	rb = rb || lp;
	return new Box2Abs(this.p0.sub(lp), this.p1.add(rb));
};

/**
 * @param p { Vec2 }
 * @returns { Box2Abs }
 */
Box2Abs.prototype.include = function (p) {
	console.assert(!!p);
	return new Box2Abs(this.p0.min(p), this.p1.max(p));
};

/**
 * @param p { Vec2 }
 * @param ext { number }
 * @returns { boolean }
 */
Box2Abs.prototype.contains = function (p, ext = 0.0) {
	console.assert(!!p);
	return p.x >= this.p0.x - ext && p.x <= this.p1.x + ext &&
		p.y >= this.p0.y - ext && p.y <= this.p1.y + ext;
};

/**
 * @param d { Vec2 }
 * @returns { Box2Abs }
 */
Box2Abs.prototype.translate = function (d) {
	console.assert(!!d);
	return new Box2Abs(this.p0.add(d), this.p1.add(d));
};

/**
 * @param f { function(Vec2, object): Vec2 }
 * @param options { object }
 * @returns { Box2Abs }
 */
Box2Abs.prototype.transform = function (f, options) {
	console.assert(!!f);
	return new Box2Abs(f(this.p0, options), f(this.p1, options));
};

Box2Abs.prototype.sz = function () {
	return this.p1.sub(this.p0);
};

Box2Abs.prototype.centre = function () {
	return Vec2.centre(this.p0, this.p1);
};

Box2Abs.prototype.pos = function () {
	return this.p0;
};

Box2Abs.fromRelBox = function (relBox) {
	console.assert(!!relBox);
	return new Box2Abs(relBox.x, relBox.y, relBox.x + relBox.width, relBox.y + relBox.height);
};

/**
 * @param b1 { Box2Abs }
 * @param b2 { Box2Abs }
 * @returns { Box2Abs }
 */
Box2Abs.union = function (b1, b2) {
	console.assert(!!b1);
	console.assert(!!b2);
	return new Box2Abs(Vec2.min(b1.p0, b2.p0), Vec2.max(b1.p1, b2.p1));
};

/**
 * @param a { Vec2 }
 * @param b { Vec2 }
 * @param c { Vec2 }
 * @param d { Vec2 }
 * @returns { boolean }
 */
Box2Abs.segmentIntersection = function (a, b, c, d) {
	const dc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
	const dd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);
	const da = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
	const db = (c.x - b.x) * (d.y - b.y) - (c.y - b.y) * (d.x - b.x);

	return dc * dd <= 0 && da * db <= 0;
};

export default Box2Abs;
