var ui = global.ui;

var LassoHelper = function (mode, editor, fragment) {
	this.mode = mode;
	this.fragment = fragment;
	this.editor = editor;
};
LassoHelper.prototype.getSelection = function () {
	if (this.mode == 0) {
		return ui.render.getElementsInPolygon(this.points);
	} else if (this.mode == 1) {
		return ui.render.getElementsInRectangle(this.points[0], this.points[1]);
	} else {
		throw new Error('Selector mode unknown');
	}
};
LassoHelper.prototype.begin = function (event) {
	this.points = [ ui.page2obj(event) ];
	if (this.mode == 1) {
		this.points.push(this.points[0]);
	}
};
LassoHelper.prototype.running = function () {
	return 'points' in this;
};
LassoHelper.prototype.addPoint = function (event) {
	if (!this.running()) return false;
	if (this.mode == 0) {
		this.points.push(ui.page2obj(event));
		this.editor.render.drawSelectionPolygon(this.points);
	} else if (this.mode == 1) {
		this.points = [ this.points[0], ui.page2obj(event) ];
		this.editor.render.drawSelectionRectangle(this.points[0], this.points[1]);
	}
	return this.getSelection();
};
LassoHelper.prototype.end = function () {
	var ret = this.getSelection();
	if ('points' in this) {
		this.editor.render.drawSelectionPolygon(null);
		delete this.points;
	}
	return ret;
};

module.exports = LassoHelper