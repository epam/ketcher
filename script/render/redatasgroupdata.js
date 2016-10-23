var ReObject = require('./reobject');

function ReDataSGroupData(sgroup) {
	this.init('sgroupData');

	this.sgroup = sgroup;
}

ReDataSGroupData.prototype = new ReObject();
ReDataSGroupData.isSelectable = function () {
	return true;
};

ReDataSGroupData.prototype.highlightPath = function (render) {
	var box = this.sgroup.dataArea;
	var p0 = render.obj2scaled(box.p0);
	var sz = render.obj2scaled(box.p1).sub(p0);
	return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
};

ReDataSGroupData.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.styles.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReDataSGroupData.prototype.makeSelectionPlate = function (restruct, paper, styles) { // TODO [MK] review parameters
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

module.exports = ReDataSGroupData;
