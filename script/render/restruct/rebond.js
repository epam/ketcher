var ReObject = require('./reobject');

function ReBond(/* chem.Bond*/bond) {
	this.init('bond');

	this.b = bond; // TODO rename b to item
	this.doubleBondShift = 0;
}

ReBond.prototype = new ReObject();
ReBond.isSelectable = function () {
	return true;
};

ReBond.prototype.drawHighlight = function (render) {
	var ret = this.makeHighlightPlate(render);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReBond.prototype.makeHighlightPlate = function (render) {
	render.ctab.bondRecalc(render.options, this);
	var c = render.ps(this.b.center);
	return render.paper.circle(c.x, c.y, 0.8 * render.options.atomSelectionPlateRadius)
		.attr(render.options.highlightStyle);
};

ReBond.prototype.makeSelectionPlate = function (restruct, paper, options) {
	restruct.bondRecalc(restruct.render.options, this);
	var c = restruct.render.ps(this.b.center);
	return paper.circle(c.x, c.y, 0.8 * options.atomSelectionPlateRadius)
		.attr(options.selectionStyle);
};

module.exports = ReBond;
