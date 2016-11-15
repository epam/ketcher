var ReObject = require('./reobject');
var scale = require('../../util/scale');

function ReRxnArrow(/* chem.RxnArrow*/arrow) {
	this.init('rxnArrow');

	this.item = arrow;
}
ReRxnArrow.prototype = new ReObject();
ReRxnArrow.isSelectable = function () {
	return true;
};

ReRxnArrow.prototype.highlightPath = function (render) {
	var p = scale.obj2scaled(this.item.pp, render.options);
	var s = render.options.scaleFactor;
	return render.paper.rect(p.x - s, p.y - s / 4, 2 * s, s / 2, s / 8); // eslint-disable-line no-mixed-operators
};

ReRxnArrow.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.options.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReRxnArrow.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

module.exports = ReRxnArrow;
