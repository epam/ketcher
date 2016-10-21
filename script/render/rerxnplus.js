var Visel = require('./visel');
var ReObject = require('./reobject');

function ReRxnPlus(/* chem.RxnPlus*/plus) {
	this.init(Visel.TYPE.PLUS);

	this.item = plus;
}
ReRxnPlus.prototype = new ReObject();
ReRxnPlus.isSelectable = function () {
	return true;
};

ReRxnPlus.prototype.highlightPath = function (render) {
	var p = render.ps(this.item.pp);
	var s = render.settings.scaleFactor;
	/* eslint-disable no-mixed-operators*/
	return render.paper.rect(p.x - s / 4, p.y - s / 4, s / 2, s / 2, s / 8);
	/* eslint-enable no-mixed-operators*/
};

ReRxnPlus.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.styles.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReRxnPlus.prototype.makeSelectionPlate = function (restruct, paper, styles) { // TODO [MK] review parameters
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

module.exports = ReRxnPlus;
