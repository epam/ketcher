var Vec2 = require('../util/vec2');
var SGroup = require('../chem/sgroup');

var util = require('../util');

var Visel = require('./visel');

var ReObject = require('./reobject')

var tfx = util.tfx;

var ReSGroup = function (sgroup) {
	this.init(Visel.TYPE.SGROUP);

	this.item = sgroup;
};
ReSGroup.prototype = new ReObject();
ReSGroup.isSelectable = function () { return false; }


ReSGroup.findClosest = function (render, p) {
	var ret = null;
	var minDist = render.opt.selectionDistanceCoefficient;
	render.ctab.molecule.sgroups.each(function (sgid, sg){
		var d = sg.bracketDir, n = d.rotateSC(1, 0);
		var pg = new Vec2(Vec2.dot(p, d), Vec2.dot(p, n));
		for (var i = 0; i < sg.areas.length; ++i) {
			var box = sg.areas[i];
			var inBox = box.p0.y < pg.y && box.p1.y > pg.y && box.p0.x < pg.x && box.p1.x > pg.x;
			var xDist = Math.min(Math.abs(box.p0.x - pg.x), Math.abs(box.p1.x - pg.x));
			if (inBox && (ret == null || xDist < minDist)) {
				ret = sgid;
				minDist = xDist;
			}
		}
	}, this);
	if (ret != null)
		return {
			'id':ret,
			'dist':minDist
		};
	return null;
};

ReSGroup.prototype.draw = function (render) { // TODO need to review parameter list
	return this.item.draw(render.ctab);
};

ReSGroup.prototype.drawHighlight = function (render) {
	var styles = render.styles;
	var settings = render.settings;
	var paper = render.paper;
	var sg = this.item;
	var bb = sg.bracketBox.transform(render.obj2scaled, render);
	var lw = settings.lineWidth;
	var vext = new Vec2(lw * 4, lw * 6);
	bb = bb.extend(vext, vext);
	var d = sg.bracketDir, n = d.rotateSC(1,0);
	var a0 = Vec2.lc2(d, bb.p0.x, n, bb.p0.y);
	var a1 = Vec2.lc2(d, bb.p0.x, n, bb.p1.y);
	var b0 = Vec2.lc2(d, bb.p1.x, n, bb.p0.y);
	var b1 = Vec2.lc2(d, bb.p1.x, n, bb.p1.y);

	var set = paper.set();
	sg.highlighting = paper
	.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}L{0},{1}', tfx(a0.x), tfx(a0.y), tfx(a1.x), tfx(a1.y), tfx(b1.x), tfx(b1.y), tfx(b0.x), tfx(b0.y))
	.attr(styles.highlightStyle);
	set.push(sg.highlighting);

	SGroup.getAtoms(render.ctab.molecule, sg).each(function (aid) {
		set.push(render.ctab.atoms.get(aid).makeHighlightPlate(render));
	}, this);
	SGroup.getBonds(render.ctab.molecule, sg).each(function (bid) {
		set.push(render.ctab.bonds.get(bid).makeHighlightPlate(render));
	}, this);
	render.ctab.addReObjectPath('highlighting', this.visel, set);
};
module.exports = ReSGroup