// Visel is a shorthand for VISual ELement
// It corresponds to a visualization (i.e. set of paths) of an atom or a bond.

/*global require, global:false, rnd:false*/

var Box2Abs = require('../util/box2abs');
var Vec2 = require('../util/vec2');

var rnd = global.rnd = global.rnd || {}; // jshint ignore:line

rnd.Visel = function (type) {
	this.type = type;
	this.paths = [];
	this.boxes = [];
	this.boundingBox = null;
};

rnd.Visel.TYPE = {
	'ATOM': 1,
	'BOND': 2,
	'LOOP': 3,
	'ARROW': 4,
	'PLUS': 5,
	'SGROUP': 6,
	'TMP': 7, // [MK] TODO: do we still need it?
	'FRAGMENT': 8,
	'RGROUP': 9,
	'CHIRAL_FLAG': 10
};

rnd.Visel.prototype.add = function (path, bb, ext) {
	this.paths.push(path);
	if (bb) {
		this.boxes.push(bb);
		this.boundingBox = this.boundingBox == null ? bb : Box2Abs.union(this.boundingBox, bb);
	}
	if (ext) {
		this.exts.push(ext);
	}
};

rnd.Visel.prototype.clear = function () {
	this.paths = [];
	this.boxes = [];
	this.exts = [];
	this.boundingBox = null;
};

rnd.Visel.prototype.translate = function (x, y) {
	if (arguments.length > 2) {    // TODO: replace to debug time assert
		throw new Error('One vector or two scalar arguments expected');
	}
	if (y === undefined) {
		this.translate(x.x, x.y);
	} else {
		var delta = new Vec2(x, y);
		for (var i = 0; i < this.paths.length; ++i) {
			this.paths[i].translateAbs(x, y);
		}
		for (var j = 0; j < this.boxes.length; ++j) {
			this.boxes[j] = this.boxes[j].translate(delta);
		}
		if (this.boundingBox !== null) {
			this.boundingBox = this.boundingBox.translate(delta);
		}
	}
};
