var Vec2 = require('../../util/vec2');

function calcAngle(pos0, pos1, fracAngle) {
	fracAngle = fracAngle || (Math.PI / 12);
	var v = Vec2.diff(pos1, pos0);
	var angle = Math.atan2(v.y, v.x);
	var sign = angle < 0 ? -1 : 1;
	var floor = Math.floor(Math.abs(angle) / fracAngle) * fracAngle;
	angle = sign * (floor + ((Math.abs(angle) - floor < fracAngle / 2) ? 0 : fracAngle));
	return angle;
}

function calcNewAtomPos(pos0, pos1) {
	var v = new Vec2(1, 0).rotate(calcAngle(pos0, pos1));
	v.add_(pos0); // eslint-disable-line no-underscore-dangle
	return v;
}

module.exports = {
	calcAngle: calcAngle,
	calcNewAtomPos: calcNewAtomPos
};
