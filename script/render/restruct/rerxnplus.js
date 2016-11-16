var ReObject = require('./reobject');
var scale = require('../../util/scale');

function ReRxnPlus(/* chem.RxnPlus*/plus) {
	this.init('rxnPlus');

	this.item = plus;
}
ReRxnPlus.prototype = new ReObject();
ReRxnPlus.isSelectable = function () {
	return true;
};

ReRxnPlus.prototype.highlightPath = function (render) {
	var p = scale.obj2scaled(this.item.pp, render.options);
	var s = render.options.scale;
	/* eslint-disable no-mixed-operators*/
	return render.paper.rect(p.x - s / 4, p.y - s / 4, s / 2, s / 2, s / 8);
	/* eslint-enable no-mixed-operators*/
};

ReRxnPlus.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.options.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReRxnPlus.prototype.makeSelectionPlate = function (restruct, paper, styles) { // TODO [MK] review parameters
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

module.exports = ReRxnPlus;
