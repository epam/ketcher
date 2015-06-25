// Single entry point to Raphaël library

var Raphael = require('raphael');
var Vec2 = require('./util/vec2');

// TODO: refactor ugly prototype extensions to plain old functions
Raphael.el.translateAbs = function (x,y) {
	this.delta = this.delta || new Vec2();
	this.delta.x += x - 0;
	this.delta.y += y - 0;
	this.transform('t' + this.delta.x.toString() + ',' + this.delta.y.toString());
};

Raphael.st.translateAbs = function (x,y) {
	this.forEach(function (el) {
		el.translateAbs(x,y);
	});
};

module.exports = Raphael;
