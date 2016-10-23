var Box2Abs = require('../util/box2abs');
var Vec2 = require('../util/vec2');
var ReObject = require('./reobject');

var ui = global.ui;

function ReFrag(/* Struct.Fragment = {}*/frag) {
	this.init('frag');

	this.item = frag;
}
ReFrag.prototype = new ReObject();
ReFrag.isSelectable = function () {
	return false;
};

ReFrag.prototype.fragGetAtoms = function (render, fid) {
	var ret = [];
	render.ctab.atoms.each(function (aid, atom) {
		if (atom.a.fragment == fid)
			ret.push(aid);
	}, this);
	return ret;
};

ReFrag.prototype.fragGetBonds = function (render, fid) {
	var ret = [];
	render.ctab.bonds.each(function (bid, bond) {
		if (render.ctab.atoms.get(bond.b.begin).a.fragment == fid &&
		render.ctab.atoms.get(bond.b.end).a.fragment == fid)
			ret.push(bid);
	}, this);
	return ret;
};

ReFrag.prototype.calcBBox = function (restruct, fid, render) { // TODO need to review parameter list
	var ret;
	restruct.atoms.each(function (aid, atom) {
		if (atom.a.fragment == fid) {
			// TODO ReObject.calcBBox to be used instead
			var bba = atom.visel.boundingBox;
			if (!bba) {
				bba = new Box2Abs(atom.a.pp, atom.a.pp);
				var ext = new Vec2(0.05 * 3, 0.05 * 3);
				bba = bba.extend(ext, ext);
			} else {
				if (!render) {
					console.warn('No boundingBox fragment precalc');
					render = ui.render;
				}

				bba = bba.translate((render.offset || new Vec2()).negated()).transform(render.scaled2obj, render);
			}
			ret = (ret ? Box2Abs.union(ret, bba) : bba);
		}
	});
	return ret;
};

// TODO need to review parameter list
ReFrag.prototype._draw = function (render, fid, attrs) { // eslint-disable-line no-underscore-dangle
	var bb = this.calcBBox(render.ctab, fid, render);
	if (bb) {
		var p0 = render.obj2scaled(new Vec2(bb.p0.x, bb.p0.y));
		var p1 = render.obj2scaled(new Vec2(bb.p1.x, bb.p1.y));
		return render.paper.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0).attr(attrs);
	} else { // eslint-disable-line no-else-return
		// TODO abnormal situation, empty fragments must be destroyed by tools
		console.assert(null, 'Empty fragment');
	}
};

ReFrag.prototype.draw = function (render) { // eslint-disable-line no-unused-vars
	return null;// this._draw(render, fid, { 'stroke' : 'lightgray' }); // [RB] for debugging only
};

ReFrag.prototype.drawHighlight = function (render) { // eslint-disable-line no-unused-vars
	// Do nothing. This method shouldn't actually be called.
};

ReFrag.prototype.setHighlight = function (highLight, render) {
	var fid = render.ctab.frags.keyOf(this);
	if (!Object.isUndefined(fid)) {
		render.ctab.atoms.each(function (aid, atom) {
			if (atom.a.fragment == fid)
				atom.setHighlight(highLight, render);
		}, this);
		render.ctab.bonds.each(function (bid, bond) {
			if (render.ctab.atoms.get(bond.b.begin).a.fragment == fid)
				bond.setHighlight(highLight, render);
		}, this);
	} else {
		// TODO abnormal situation, fragment does not belong to the render
	}
};

module.exports = ReFrag;
