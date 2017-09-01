/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

// Single entry point to Raphaël library

var Raphael = require('raphael');
var Vec2 = require('./util/vec2');

// TODO: refactor ugly prototype extensions to plain old functions
Raphael.el.translateAbs = function (x, y) {
	this.delta = this.delta || new Vec2();
	this.delta.x += x - 0;
	this.delta.y += y - 0;
	this.transform('t' + this.delta.x.toString() + ',' + this.delta.y.toString());
};

Raphael.st.translateAbs = function (x, y) {
	this.forEach(function (el) {
		el.translateAbs(x, y);
	});
};

module.exports = Raphael;
