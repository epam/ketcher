var Box2Abs = require('../util/box2abs');
var Visel = require('./visel');
var ReObject = require('./reobject');

function ReChiralFlag(pos) {
	this.init(Visel.TYPE.CHIRAL_FLAG);

	this.pp = pos;
}
ReChiralFlag.prototype = new ReObject();
ReChiralFlag.isSelectable = function () {
	return true;
};

ReChiralFlag.findClosest = function (render, p) {
	var minDist;
	var ret;

	// there is only one chiral flag, but we treat it as a "map" for convenience
	render.ctab.chiralFlags.each(function (id, item) {
		var pos = item.pp;
		if (Math.abs(p.x - pos.x) < 1.0) {
			var dist = Math.abs(p.y - pos.y);
			if (dist < 0.3 && (!ret || dist < minDist)) {
				minDist = dist;
				ret = { id: id, dist: minDist };
			}
		}
	});
	return ret;
};

ReChiralFlag.prototype.highlightPath = function (render) {
	var box = Box2Abs.fromRelBox(this.path.getBBox());
	var sz = box.p1.sub(box.p0);
	var p0 = box.p0.sub(render.offset);
	return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
};

ReChiralFlag.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.styles.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReChiralFlag.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

ReChiralFlag.prototype.draw = function (render) {
	var paper = render.paper;
	var settings = render.settings;
	var ps = render.ps(this.pp);
	this.path = paper.text(ps.x, ps.y, 'Chiral')
		.attr({
			'font': settings.font,
			'font-size': settings.fontsz,
			'fill': '#000'
		});
	render.ctab.addReObjectPath('data', this.visel, this.path, null, true);
};

module.exports = ReChiralFlag;
