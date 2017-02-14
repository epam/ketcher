var Vec2 = require('../../util/vec2');

var FRAC = Math.PI / 12; // '15º'

function calcAngle(pos0, pos1) {
	var v = Vec2.diff(pos1, pos0);
	return Math.atan2(v.y, v.x);
}

function fracAngle(angle) {
	if (arguments.length > 1)
		angle = calcAngle(arguments[0], arguments[1]);
	return Math.round(angle / FRAC) * FRAC;
}

function calcNewAtomPos(pos0, pos1) {
	var v = new Vec2(1, 0).rotate(fracAngle(pos0, pos1));
	v.add_(pos0); // eslint-disable-line no-underscore-dangle
	return v;
}

module.exports = {
	calcAngle: calcAngle,
	fracAngle: fracAngle,
	calcNewAtomPos: calcNewAtomPos
};
