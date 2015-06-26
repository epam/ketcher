/*global require, module*/

var util = require('./index');
var Vec2 = require('./vec2');

var Box2Abs = function () {
	if (arguments.length == 1 && 'min' in arguments[0] && 'max' in arguments[0]) {
		this.p0 = arguments[0].min;
		this.p1 = arguments[0].max;
	}

	if (arguments.length == 2 && arguments[0] instanceof Vec2 && arguments[1] instanceof Vec2) {
		this.p0 = arguments[0];
		this.p1 = arguments[1];
	} else if (arguments.length == 4) {
		this.p0 = new Vec2(arguments[0], arguments[1]);
		this.p1 = new Vec2(arguments[2], arguments[3]);
	} else if (arguments.length == 0) {
		this.p0 = new Vec2();
		this.p1 = new Vec2();
	} else {
		new Error('Box2Abs constructor only accepts 4 numbers or 2 vectors or no arguments!');
	}
};

Box2Abs.prototype.toString = function () {
	return this.p0.toString() + ' ' + this.p1.toString();

};

Box2Abs.fromRelBox = function (relBox) {
	util.assertDefined(relBox);
	return new Box2Abs(relBox.x, relBox.y, relBox.x + relBox.width, relBox.y + relBox.height);
};

Box2Abs.prototype.clone = function () {
	return new Box2Abs(this.p0, this.p1);
};

Box2Abs.union = function (/*Box2Abs*/b1, /*Box2Abs*/b2) {
	util.assertDefined(b1);
	util.assertDefined(b2);
	return new Box2Abs(Vec2.min(b1.p0, b2.p0), Vec2.max(b1.p1, b2.p1));
};

Box2Abs.prototype.extend = function (/*Vec2*/lp, /*Vec2*/rb) {
	util.assertDefined(lp);
	rb = rb || lp;
	return new Box2Abs(this.p0.sub(lp), this.p1.add(rb));
};

Box2Abs.prototype.include = function (/*Vec2*/p) {
	util.assertDefined(p);
	return new Box2Abs(this.p0.min(p), this.p1.max(p));
};

Box2Abs.prototype.contains = function (/*Vec2*/p, /*float*/ext) {
	ext = (ext || 0) - 0;
	util.assertDefined(p);
	return p.x >= this.p0.x - ext && p.x <= this.p1.x + ext && p.y >= this.p0.y - ext && p.y <= this.p1.y + ext;
};

Box2Abs.prototype.translate = function (/*Vec2*/d) {
	util.assertDefined(d);
	return new Box2Abs(this.p0.add(d), this.p1.add(d));
};

Box2Abs.prototype.transform = function (/*function(Vec2):Vec2*/f, context) {
	util.assert(!util.isNullOrUndefined(f));
	return new Box2Abs(f.call(context, this.p0), f.call(context, this.p1));
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

module.exports = Box2Abs;
