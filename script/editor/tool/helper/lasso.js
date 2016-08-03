var LassoHelper = function (mode, editor, fragment) {
	this.mode = mode;
	this.fragment = fragment;
	this.editor = editor;
};
LassoHelper.prototype.getSelection = function () {
	var rnd = this.editor.render;
	if (this.mode == 0) {
		return rnd.getElementsInPolygon(this.points);
	} else if (this.mode == 1) {
		return rnd.getElementsInRectangle(this.points[0], this.points[1]);
	} else {
		throw new Error('Selector mode unknown');
	}
};
LassoHelper.prototype.begin = function (event) {
	var rnd = this.editor.render;
	this.points = [rnd.page2obj(event)];
	if (this.mode == 1) {
		this.points.push(this.points[0]);
	}
};
LassoHelper.prototype.running = function () {
	return 'points' in this;
};
LassoHelper.prototype.addPoint = function (event) {
	if (!this.running()) return false;
	var rnd = this.editor.render;
	if (this.mode == 0) {
		this.points.push(rnd.page2obj(event));
		rnd.drawSelectionPolygon(this.points);
	} else if (this.mode == 1) {
		this.points = [this.points[0], rnd.page2obj(event)];
		rnd.drawSelectionRectangle(this.points[0], this.points[1]);
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

module.exports = LassoHelper;
