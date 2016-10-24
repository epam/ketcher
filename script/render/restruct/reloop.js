var Vec2 = require('../../util/vec2');
var Visel = require('./visel');
var ReObject = require('./reobject');

function ReLoop(loop) {
	this.loop = loop;
	this.visel = new Visel('loop');
	this.centre = new Vec2();
	this.radius = new Vec2();
}
ReLoop.prototype = new ReObject();
ReLoop.isSelectable = function () {
	return false;
};

module.exports = ReLoop;
