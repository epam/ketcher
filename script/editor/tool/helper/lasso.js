var locate = require('./locate');
var draw = require('../../../render/draw');
var scale = require('../../../util/scale');

function LassoHelper(mode, editor, fragment) {
	this.mode = mode;
	this.fragment = fragment;
	this.editor = editor;
}
LassoHelper.prototype.getSelection = function () {
	var rnd = this.editor.render;
	if (this.mode == 0)
		return locate.inPolygon(rnd.ctab, this.points);
	else if (this.mode == 1)
		return locate.inRectangle(rnd.ctab, this.points[0], this.points[1]);
	else
		throw new Error('Selector mode unknown'); // eslint-disable-line no-else-return
};

LassoHelper.prototype.begin = function (event) {
	var rnd = this.editor.render;
	this.points = [rnd.page2obj(event)];
	if (this.mode == 1)
		this.points.push(this.points[0]);
};

LassoHelper.prototype.running = function () {
	return !!this.points;
};

LassoHelper.prototype.addPoint = function (event) {
	if (this.points) {
		var rnd = this.editor.render;
		if (this.mode == 0)
			this.points.push(rnd.page2obj(event));
		else if (this.mode == 1)
			this.points = [this.points[0], rnd.page2obj(event)];
		this.update();
		return this.getSelection();
	}
	return null;
};

LassoHelper.prototype.update = function () {
	if (this.selection) {
		this.selection.remove();
		this.selection = null;
	}
	if (this.points && this.points.length > 1) {
		var rnd = this.editor.render;
		var dp = this.points.map(function (p) {
			return scale.obj2scaled(p, rnd.options).add(rnd.offset);
		});
		this.selection = this.mode == 0 ?
			draw.selectionPolygon(rnd, dp) :
			draw.selectionRectangle(rnd, dp[0], dp[1]);
	}
};

LassoHelper.prototype.end = function () {
	var ret = this.getSelection();
	this.points = null;
	this.update(null);
	return ret;
};

module.exports = LassoHelper;
