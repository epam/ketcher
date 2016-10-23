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
	render.ctab.bondRecalc(render.settings, this);
	var c = render.ps(this.b.center);
	return render.paper.circle(c.x, c.y, 0.8 * render.styles.atomSelectionPlateRadius)
		.attr(render.styles.highlightStyle);
};

ReBond.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	restruct.bondRecalc(restruct.render.settings, this);
	var c = restruct.render.ps(this.b.center);
	return paper.circle(c.x, c.y, 0.8 * styles.atomSelectionPlateRadius)
		.attr(styles.selectionStyle);
};

module.exports = ReBond;
