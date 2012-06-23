/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 *
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 *
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

// 2d-vector constructor and utilities
if (!window.util)
    util = {};

//util.assertDefined = function(v) { if (typeof(v) == 'undefined' || v == null) debugger; }
util.assertDefined = function() { };

util.Vec2 = function (x, y)
{
	if (arguments.length == 0) {
		this.x = 0;
		this.y = 0;
	} else if (arguments.length == 1) {
		this.x = parseFloat(x.x);
		this.y = parseFloat(x.y);
	} else if (arguments.length == 2) {
		this.x = parseFloat(x);
		this.y = parseFloat(y);
	} else {
		throw "util.Vec2(): invalid arguments";
	}
};

util.Vec2.ZERO = new util.Vec2(0, 0);
util.Vec2.UNIT = new util.Vec2(1, 1);

util.Vec2.prototype.length = function ()
{
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

util.Vec2.prototype.equals = function (v)
{
	util.assertDefined(v);
    return this.x == v.x && this.y == v.y;
};

util.Vec2.prototype.add = function (v)
{
	util.assertDefined(v);
    return new util.Vec2(this.x + v.x, this.y + v.y);
};

util.Vec2.prototype.add_ = function (v)
{
	util.assertDefined(v);
    this.x += v.x;
    this.y += v.y;
};

util.Vec2.prototype.sub = function (v)
{
	util.assertDefined(v);
    return new util.Vec2(this.x - v.x, this.y - v.y);
};

util.Vec2.prototype.scaled = function (s)
{
	util.assertDefined(s);
    return new util.Vec2(this.x * s, this.y * s);
};

util.Vec2.prototype.negated = function ()
{
    return new util.Vec2(-this.x, -this.y);
};

util.Vec2.prototype.yComplement = function (y1)
{
    y1 = y1 || 0;
    return new util.Vec2(this.x, y1 - this.y);
};

util.Vec2.prototype.addScaled = function (v, f)
{
	util.assertDefined(v);
	util.assertDefined(f);
    return new util.Vec2(this.x + v.x * f, this.y + v.y * f);
};

util.Vec2.prototype.normalized = function ()
{
    return this.scaled(1 / this.length());
};

util.Vec2.prototype.normalize = function ()
{
    var l = this.length();

    if (l < 0.000001)
        return false;

    this.x /= l;
    this.y /= l;

    return true;
};

util.Vec2.prototype.turnLeft = function ()
{
    return new util.Vec2(-this.y, this.x);
};

util.Vec2.prototype.toString = function ()
{
    return "(" + this.x.toFixed(2) + "," + this.y.toFixed(2) + ")";
};

util.Vec2.dist = function (a, b)
{
	util.assertDefined(a);
	util.assertDefined(b);
    return util.Vec2.diff(a, b).length();
};

util.Vec2.max = function (v1, v2)
{
	util.assertDefined(v1);
	util.assertDefined(v2);
    return new util.Vec2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
};

util.Vec2.min = function (v1, v2)
{
	util.assertDefined(v1);
	util.assertDefined(v2);
    return new util.Vec2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
};

util.Vec2.prototype.max = function (v)
{
	util.assertDefined(v);
    return new util.Vec2.max(this, v);
};

util.Vec2.prototype.min = function (v)
{
	util.assertDefined(v);
    return new util.Vec2.min(this, v);
};

util.Vec2.prototype.ceil = function ()
{
    return new util.Vec2(Math.ceil(this.x), Math.ceil(this.y));
};

util.Vec2.prototype.floor = function ()
{
    return new util.Vec2(Math.floor(this.x), Math.floor(this.y));
};

util.Vec2.sum = function (v1, v2)
{
	util.assertDefined(v1);
	util.assertDefined(v2);
    return new util.Vec2(v1.x + v2.x, v1.y + v2.y);
};

util.Vec2.dot = function (v1, v2)
{
	util.assertDefined(v1);
	util.assertDefined(v2);
    return v1.x * v2.x + v1.y * v2.y;
};

util.Vec2.cross = function (v1, v2)
{
	util.assertDefined(v1);
	util.assertDefined(v2);
    return v1.x * v2.y - v1.y * v2.x;
};

util.Vec2.prototype.rotate = function (angle)
{
	util.assertDefined(angle);
    var si = Math.sin(angle);
    var co = Math.cos(angle);

    return this.rotateSC(si, co);
};

util.Vec2.prototype.rotateSC = function (si, co)
{
	util.assertDefined(si);
	util.assertDefined(co);
    return new util.Vec2(this.x * co - this.y * si, this.x * si + this.y * co);
};

util.Vec2.angle = function (v1, v2)
{
	util.assertDefined(v1);
	util.assertDefined(v2);
    return Math.atan2(util.Vec2.cross(v1, v2), util.Vec2.dot(v1, v2));
};

util.Vec2.prototype.oxAngle = function ()
{
    return Math.atan2(this.y, this.x);
};

util.Vec2.diff = function (v1, v2)
{
	util.assertDefined(v1);
	util.assertDefined(v2);
    return new util.Vec2(v1.x - v2.x, v1.y - v2.y);
};

// assume arguments v1, f1, v2, f2, v3, f3, etc.
// where v[i] are vectors and f[i] are corresponding coefficients
util.Vec2.lc = function ()
{
    var v = new util.Vec2();
    for (var i = 0; i < arguments.length / 2; ++i)
        v = v.addScaled(arguments[2 * i], arguments[2 * i + 1]);
    return v;
};

util.Vec2.lc2 = function (v1, f1, v2, f2)
{
	util.assertDefined(v1);
	util.assertDefined(v2);
	util.assertDefined(f1);
	util.assertDefined(f2);
    return new util.Vec2(v1.x * f1 + v2.x * f2, v1.y * f1 + v2.y * f2);
};

util.Box2Abs = function ()
{
    if (arguments.length == 1 && 'min' in arguments[0] && 'max' in arguments[0])
    {
        this.p0 = arguments[0].min;
        this.p1 = arguments[0].max;
    }
    if (arguments.length == 2 && arguments[0] instanceof util.Vec2 && arguments[1] instanceof util.Vec2)
    {
        this.p0 = arguments[0];
        this.p1 = arguments[1];
    }
    else if (arguments.length == 4)
    {
        this.p0 = new util.Vec2(arguments[0], arguments[1]);
        this.p1 = new util.Vec2(arguments[2], arguments[3]);
    }
    else if (arguments.length == 0)
    {
        this.p0 = new util.Vec2();
        this.p1 = new util.Vec2();
    }
    else
        new Error("util.Box2Abs constructor only accepts 4 numbers or 2 vectors or no arguments!");
};

util.Box2Abs.prototype.toString = function () {
	return this.p0.toString() + " " + this.p1.toString();

}
util.Box2Abs.fromRelBox = function (relBox)
{
	util.assertDefined(relBox);
    return new util.Box2Abs(relBox.x, relBox.y,
    relBox.x + relBox.width, relBox.y + relBox.height);
};

util.Box2Abs.prototype.clone = function ()
{
    return new util.Box2Abs(this.p0, this.p1);
};

util.Box2Abs.union = function(/*util.Box2Abs*/b1, /*util.Box2Abs*/b2)
{
	util.assertDefined(b1);
	util.assertDefined(b2);
	return new util.Box2Abs(util.Vec2.min(b1.p0, b2.p0), util.Vec2.max(b1.p1, b2.p1));
};

util.Box2Abs.prototype.extend = function(/*util.Vec2*/lp, /*util.Vec2*/rb)
{
	util.assertDefined(lp);
	rb = rb || lp;
    return new util.Box2Abs(this.p0.sub(lp), this.p1.add(rb));
};

util.Box2Abs.prototype.include = function(/*util.Vec2*/p)
{
	util.assertDefined(p);
    return new util.Box2Abs(this.p0.min(p), this.p1.max(p));
};

util.Box2Abs.prototype.translate = function(/*util.Vec2*/d)
{
	util.assertDefined(d);
    // TODO [RB] ??? it does nothing... need to investigate and remove dead code that "uses" it
    // for now new implementation added
    // BEGIN
    /*
    this.p0.add(d);
    this.p1.add(d);
    */
    return new util.Box2Abs(this.p0.add(d), this.p1.add(d));
    // END
};

util.Box2Abs.prototype.transform = function(/*function(Vec2):Vec2*/f, context)
{
    return new util.Box2Abs(f.call(context, this.p0), f.call(context, this.p1));
};

util.Box2Abs.prototype.sz = function()
{
    return this.p1.sub(this.p0);
};

util.Box2Abs.prototype.pos = function()
{
    return this.p0;
};

// find intersection of a ray and a box and
//  return the shift magnitude to avoid it
util.Vec2.shiftRayBox =
    function (/*util.Vec2*/p, /*util.Vec2*/d, /*util.Box2Abs*/bb)
{
	util.assertDefined(p);
	util.assertDefined(d);
	util.assertDefined(bb);
    // four corner points of the box
    var b = [bb.p0, new util.Vec2(bb.p1.x, bb.p0.y),
            bb.p1, new util.Vec2(bb.p0.x, bb.p1.y)];
    var r = b.map(function(v){return v.sub(p)}); // b relative to p
    d = d.normalized();
    var rc = r.map(function(v){return util.Vec2.cross(v, d)}); // cross prods
    var rd = r.map(function(v){return util.Vec2.dot(v, d)}); // dot prods

    // find foremost points on the right and on the left of the ray
    var pid = -1, nid = -1;
    for (var i = 0; i < 4; ++i)
        if (rc[i] > 0)  {if (pid < 0 || rd[pid] < rd[i]) pid = i;}
        else            {if (nid < 0 || rd[nid] < rd[i]) nid = i;}

    if (nid < 0 || pid < 0) // no intersection, no shift
        return 0;

    // check the order
    var id0, id1;
    if (rd[pid] > rd[nid])
        id0 = nid, id1 = pid;
    else
        id0 = pid, id1 = nid;

    // simple proportion to calculate the shift
    return rd[id0] + Math.abs(rc[id0]) * (rd[id1] - rd[id0])
        / (Math.abs(rc[id0]) + Math.abs(rc[id1]));
};
