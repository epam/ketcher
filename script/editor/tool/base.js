var Vec2 = require('../../util/vec2');

function EditorTool(editor) {
	this.editor = editor;
}

EditorTool.prototype.OnMouseDown = function () {};
EditorTool.prototype.OnMouseMove = function () {};
EditorTool.prototype.OnMouseUp = function () {};
EditorTool.prototype.OnClick = function () {};
EditorTool.prototype.OnDblClick = function () {};
EditorTool.prototype.OnMouseLeave = function () {
	this.OnCancel(); // eslint-disable-line new-cap
};

EditorTool.prototype.OnCancel = function () {}; // called when we abandon the tool
EditorTool.prototype.OnMouseDown0 = function (event) {
	this.OnMouseDown0.lastEvent = event;
	this.OnMouseMove0.lastEvent = event;

	if ('OnMouseDown' in this) return this.OnMouseDown(event); // eslint-disable-line new-cap
};

EditorTool.prototype.OnMouseMove0 = function (event) {
	this.OnMouseMove0.lastEvent = event;

	if ('OnMouseMove' in this) return this.OnMouseMove(event); // eslint-disable-line new-cap
};
EditorTool.prototype.OnMouseUp0 = function (event) {
	// here we suppress event we got when second touch released in guesture
	if (!('lastEvent' in this.OnMouseDown0)) return true;

	if ('lastEvent' in this.OnMouseMove0) {
		// this data is missing for 'touchend' event when last finger is out
		event = Object.clone(event); // pageX & pageY properties are readonly in Opera
		event.pageX = this.OnMouseMove0.lastEvent.pageX;
		event.pageY = this.OnMouseMove0.lastEvent.pageY;
	}

	try {
		if ('OnMouseUp' in this) return this.OnMouseUp(event); // eslint-disable-line new-cap
	} finally {
		delete this.OnMouseDown0.lastEvent;
	}
};

EditorTool.prototype.calcAngle = function (pos0, pos1) {
	var v = Vec2.diff(pos1, pos0);
	var angle = Math.atan2(v.y, v.x);
	var sign = angle < 0 ? -1 : 1;
	var floor = Math.floor(Math.abs(angle) / (Math.PI / 12)) * (Math.PI / 12);
	angle = sign * (floor + ((Math.abs(angle) - floor < Math.PI / 24) ? 0 : Math.PI / 12));
	return angle;
};

EditorTool.prototype.calcNewAtomPos = function (pos0, pos1) {
	var v = new Vec2(1, 0).rotate(this.calcAngle(pos0, pos1));
	v.add_(pos0); // eslint-disable-line no-underscore-dangle
	return v;
};

module.exports = EditorTool;
