var Visel = require('./visel');          
var ReObject = require('./reobject');

var ReDataSGroupData = function (sgroup)
{
	this.init(Visel.TYPE.SGROUP_DATA);

	this.sgroup = sgroup;
};

ReDataSGroupData.prototype = new ReObject();
ReDataSGroupData.isSelectable = function () { return true; }

ReDataSGroupData.findClosest = function (render, p) {
	var minDist = null;
	var ret = null;

	render.ctab.sgroupData.each(function (id, item) {
		if (item.sgroup.type != 'DAT')
			throw new Error('Data group expected');
		var box = item.sgroup.dataArea;
		var inBox = box.p0.y < p.y && box.p1.y > p.y && box.p0.x < p.x && box.p1.x > p.x;
		var xDist = Math.min(Math.abs(box.p0.x - p.x), Math.abs(box.p1.x - p.x));
		if (inBox && (ret == null || xDist < minDist)) {
			ret = {'id': id, 'dist': xDist};
			minDist = xDist;
		}
	});
	return ret;
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

module.exports = ReDataSGroupData