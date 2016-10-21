var Raphael = require('../raphael-ext');
var Box2Abs = require('../util/box2abs');
var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var util = require('../util');

var Struct = require('../chem/struct');

var ReRxnPlus = require('./rerxnplus');
var ReRxnArrow = require('./rerxnarrow');
var ReFrag = require('./refrag');
var ReRGroup = require('./rergroup');
var ReDataSGroupData = require('./redatasgroupdata');
var ReChiralFlag = require('./rechiralflag');
var ReSGroup = require('./resgroup');
var ReStruct = require('./restruct');

var tfx = util.tfx;

var DEBUG = { debug: false, logcnt: 0, logmouse: false, hl: false };
DEBUG.logMethod = function () { };
// DEBUG.logMethod = function (method) {addionalAtoms("METHOD: " + method);

var defaultRenderOps = {
	// flags for debugging
	showAtomIds: false,
	showBondIds: false,
	showHalfBondIds: false,
	showLoopIds: false,
	// rendering customization flags
	hideChiralFlag: false,
	showValenceWarnings: true,
	autoScale: false, // scale structure to fit into the given view box, used in view mode
	autoScaleMargin: 0,
	maxBondLength: 0, // 0 stands for "not specified"
	atomColoring: false,
	hideImplicitHydrogen: false,
	hideTerminalLabels: false,
	selectionDistanceCoefficient: 0.4
};

function Render(clientArea, scale, opt, viewSz) { // eslint-disable-line max-statements
	this.opt = Object.assign({}, defaultRenderOps, opt);

	this.useOldZoom = Prototype.Browser.IE;
	this.scale = scale || 100;
	this.baseScale = this.scale;
	this.offset = new Vec2();
	this.clientArea = clientArea = $(clientArea);
	clientArea.innerHTML = '';
	this.paper = new Raphael(clientArea);
	this.size = new Vec2();
	this.viewSz = viewSz || new Vec2(clientArea.clientWidth || 100,
									 clientArea.clientHeight || 100);
	this.bb = new Box2Abs(new Vec2(), this.viewSz);
	this.dirty = true;
	this.selectionRect = null;
	this.zoom = 1.0;
	this.structChangeHandlers = [];

	var render = this; // eslint-disable-line no-unused-vars
	var valueT = 0,
		valueL = 0;
	var element = clientArea;
	do {
		valueT += element.offsetTop  || 0;
		valueL += element.offsetLeft || 0;
		element = element.offsetParent;
	} while (element);

	this.clientAreaPos = new Vec2(valueL, valueT);

	this.ctab = new ReStruct(new Struct(), this);
	this.settings = null;
	this.styles = null;
}

Render.prototype.addStructChangeHandler = function (handler) {
	if (handler in this.structChangeHandlers)
		throw new Error('handler already present');
	this.structChangeHandlers.push(handler);
};

Render.prototype.view2scaled = function (p, isRelative) {
	var scroll = this.scrollPos();
	if (!this.useOldZoom) {
		p = p.scaled(1 / this.zoom);
		scroll = scroll.scaled(1 / this.zoom);
	}
	p = isRelative ? p : p.add(scroll).sub(this.offset);
	return p;
};

Render.prototype.scaled2view = function (p, isRelative) {
	p = isRelative ? p : p.add(this.offset).sub(this.scrollPos().scaled(1 / this.zoom));
	if (!this.useOldZoom)
		p = p.scaled(this.zoom);
	return p;
};

Render.prototype.scaled2obj = function (v) {
	return v.scaled(1 / this.settings.scaleFactor);
};

Render.prototype.obj2scaled = function (v) {
	return v.scaled(this.settings.scaleFactor);
};

Render.prototype.view2obj = function (v, isRelative) {
	return this.scaled2obj(this.view2scaled(v, isRelative));
};

Render.prototype.obj2view = function (v, isRelative) {
	return this.scaled2view(this.obj2scaled(v, isRelative));
};

Render.prototype.scrollPos = function () {
	return new Vec2(this.clientArea.scrollLeft, this.clientArea.scrollTop);
};

Render.prototype.page2obj = function (pagePos) {
	var offset = this.clientArea.cumulativeOffset();
	var pp = new Vec2(pagePos.pageX - offset.left, pagePos.pageY - offset.top);
	return this.view2obj(pp);
};

Render.prototype.client2Obj = function (clientPos) {
	return new Vec2(clientPos).sub(this.offset);
};

Render.prototype.findItem = function (event, maps, skip) {
	var ci = this.findClosestItem(
			'ui' in window ? new Vec2(this.page2obj(event)) :
							 new Vec2(event.pageX, event.pageY).sub(this.clientAreaPos),
		maps, skip);
	// rbalabanov: let it be this way at the moment
	if (ci.type == 'Atom') ci.map = 'atoms';
	else if (ci.type == 'Bond') ci.map = 'bonds';
	else if (ci.type == 'SGroup') ci.map = 'sgroups';
	else if (ci.type == 'DataSGroupData') ci.map = 'sgroupData';
	else if (ci.type == 'RxnArrow') ci.map = 'rxnArrows';
	else if (ci.type == 'RxnPlus') ci.map = 'rxnPluses';
	else if (ci.type == 'Fragment') ci.map = 'frags';
	else if (ci.type == 'RGroup') ci.map = 'rgroups';
	else if (ci.type == 'ChiralFlag') ci.map = 'chiralFlags';
	return ci;
};

Render.prototype.setMolecule = function (ctab, norescale) {
	DEBUG.logMethod('setMolecule');
	this.paper.clear();
	this.ctab = new ReStruct(ctab, this, norescale);
	this.offset = null;
	this.size = null;
	this.bb = null;
	this.update(false);
};

// molecule manipulation interface
Render.prototype.atomGetAttr = function (aid, name) {
	DEBUG.logMethod('atomGetAttr');
	// TODO: check attribute names
	return this.ctab.molecule.atoms.get(aid)[name];
};

Render.prototype.invalidateAtom = function (aid, level) {
	var atom = this.ctab.atoms.get(aid);
	this.ctab.markAtom(aid, level ? 1 : 0);
	var hbs = this.ctab.molecule.halfBonds;
	for (var i = 0; i < atom.a.neighbors.length; ++i) {
		var hbid = atom.a.neighbors[i];
		if (hbs.has(hbid)) {
			var hb = hbs.get(hbid);
			this.ctab.markBond(hb.bid, 1);
			this.ctab.markAtom(hb.end, 0);
			if (level)
				this.invalidateLoop(hb.bid);
		}
	}
};

Render.prototype.invalidateLoop = function (bid) {
	var bond = this.ctab.bonds.get(bid);
	var lid1 = this.ctab.molecule.halfBonds.get(bond.b.hb1).loop;
	var lid2 = this.ctab.molecule.halfBonds.get(bond.b.hb2).loop;
	if (lid1 >= 0)
		this.ctab.loopRemove(lid1);
	if (lid2 >= 0)
		this.ctab.loopRemove(lid2);
};

Render.prototype.invalidateBond = function (bid) {
	var bond = this.ctab.bonds.get(bid);
	this.invalidateLoop(bid);
	this.invalidateAtom(bond.b.begin, 0);
	this.invalidateAtom(bond.b.end, 0);
};

Render.prototype.invalidateItem = function (map, id, level) {
	if (map == 'atoms') {
		this.invalidateAtom(id, level);
	} else if (map == 'bonds') {
		this.invalidateBond(id);
		if (level > 0)
			this.invalidateLoop(id);
	} else {
		this.ctab.markItem(map, id, level);
	}
};

Render.prototype.atomGetDegree = function (aid) {
	DEBUG.logMethod('atomGetDegree');
	return this.ctab.atoms.get(aid).a.neighbors.length;
};

Render.prototype.atomGetNeighbors = function (aid) {
	var atom = this.ctab.atoms.get(aid);
	var neiAtoms = [];
	for (var i = 0; i < atom.a.neighbors.length; ++i) {
		var hb = this.ctab.molecule.halfBonds.get(atom.a.neighbors[i]);
		neiAtoms.push({
			aid: hb.end - 0,
			bid: hb.bid - 0
		});
	}
	return neiAtoms;
};

// returns an array of s-group id's
Render.prototype.atomGetSGroups = function (aid) {
	DEBUG.logMethod('atomGetSGroups');
	var atom = this.ctab.atoms.get(aid);
	return Set.list(atom.a.sgs);
};

Render.prototype.sGroupGetAttr = function (sgid, name) {
	DEBUG.logMethod('sGroupGetAttr');
	return this.ctab.sgroups.get(sgid).item.getAttr(name);
};

Render.prototype.sGroupGetAttrs = function (sgid) {
	DEBUG.logMethod('sGroupGetAttrs');
	return this.ctab.sgroups.get(sgid).item.getAttrs();
};

// TODO: move to SGroup
Render.prototype.sGroupGetAtoms = function (sgid) {
	DEBUG.logMethod('sGroupGetAtoms');
	var sg = this.ctab.sgroups.get(sgid).item;
	return Struct.SGroup.getAtoms(this.ctab.molecule, sg);
};

Render.prototype.sGroupGetType = function (sgid) {
	DEBUG.logMethod('sGroupGetType');
	var sg = this.ctab.sgroups.get(sgid).item;
	return sg.type;
};

Render.prototype.sGroupsFindCrossBonds = function () {
	DEBUG.logMethod('sGroupsFindCrossBonds');
	this.ctab.molecule.sGroupsRecalcCrossBonds();
};

// TODO: move to ReStruct
Render.prototype.sGroupGetNeighborAtoms = function (sgid) {
	DEBUG.logMethod('sGroupGetNeighborAtoms');
	var sg = this.ctab.sgroups.get(sgid).item;
	return sg.neiAtoms;
};

// TODO: move to ReStruct
Render.prototype.atomIsPlainCarbon = function (aid) {
	DEBUG.logMethod('atomIsPlainCarbon');
	return this.ctab.atoms.get(aid).a.isPlainCarbon();
};

Render.prototype.highlightObject = function (obj, visible) {
	if (['atoms', 'bonds', 'rxnArrows', 'rxnPluses', 'chiralFlags', 'frags', 'rgroups', 'sgroups', 'sgroupData'].indexOf(obj.map) > -1) {
		var item = this.ctab[obj.map].get(obj.id);
		if (item == null)
			return true; // TODO: fix, attempt to highlight a deleted item
		if ((obj.map == 'sgroups' && item.item.type == 'DAT') || obj.map == 'sgroupData') {
			// set highlight for both the group and the data item
			var item1 = this.ctab.sgroups.get(obj.id);
			var item2 = this.ctab.sgroupData.get(obj.id);
			if (item1 != null)
				item1.setHighlight(visible, this);
			if (item2 != null)
				item2.setHighlight(visible, this);
		} else {
			item.setHighlight(visible, this);
		}
	} else {
		return false;
	}
	return true;
};

Render.prototype.itemGetPos = function (map, id) {
	return this.ctab.molecule[map].get(id).pp;
};

Render.prototype.atomGetPos = function (id) {
	DEBUG.logMethod('atomGetPos');
	return this.itemGetPos('atoms', id);
};

Render.prototype.rxnArrowGetPos = function (id) {
	DEBUG.logMethod('rxnArrowGetPos');
	return this.itemGetPos('rxnArrows', id);
};

Render.prototype.rxnPlusGetPos = function (id) {
	DEBUG.logMethod('rxnPlusGetPos');
	return this.itemGetPos('rxnPluses', id);
};

Render.prototype.bondGetAttr = function (bid, name) {
	DEBUG.logMethod('bondGetAttr');
	return this.ctab.bonds.get(bid).b[name];
};

Render.prototype.initStyles = function () {
	// TODO move fonts, dashed lines, etc. here
	var settings = this.settings;
	this.styles = {};
	/* eslint-disable quote-props */
	this.styles.lineattr = {
		stroke: '#000',
		'stroke-width': settings.lineWidth,
		'stroke-linecap': 'round',
		'stroke-linejoin': 'round'
	};
	/* eslint-enable quote-props */
	this.styles.selectionStyle = {
		fill: '#7f7',
		stroke: 'none'
	};
	this.styles.selectionZoneStyle = {
		fill: '#000',
		stroke: 'none',
		opacity: 0.0
	};
	this.styles.highlightStyle = {
		'stroke': '#0c0',
		'stroke-width': 0.6 * settings.lineWidth
	};
	this.styles.sGroupHighlightStyle = {
		'stroke': '#9900ff',
		'stroke-width': 0.6 * settings.lineWidth
	};
	this.styles.sgroupBracketStyle = {
		'stroke': 'darkgray',
		'stroke-width': 0.5 * settings.lineWidth
	};
	this.styles.atomSelectionPlateRadius = settings.labelFontSize * 1.2;
};

Render.prototype.initSettings = function () {
	var scaleFactor = this.scale;
	var labelFontSize = Math.ceil(1.9 * (scaleFactor / 6));
	var subFontSize = Math.ceil(0.7 * labelFontSize);
	var defaultSettings = {
		delta: this.ctab.molecule.getCoordBoundingBox(),
		margin: 0.1,
		scaleFactor: scaleFactor,
		lineWidth: scaleFactor / 20,
		bondShift: scaleFactor / 6,
		bondSpace: scaleFactor / 7,
		labelFontSize: labelFontSize,
		subFontSize: subFontSize,
		font: '30px "Arial"',
		fontsz: labelFontSize,
		fontszsub: subFontSize,
		fontRLabel: labelFontSize * 1.2,
		fontRLogic: labelFontSize * 0.7

	};
	this.settings = Object.assign({}, defaultSettings);
};

Render.prototype.getStructCenter = function (selection) {
	var bb = this.ctab.getVBoxObj(selection);
	return Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5);
};

Render.prototype.onResize = function () {
	this.setViewSize(new Vec2(this.clientArea.clientWidth,
	                          this.clientArea.clientHeight));
};

Render.prototype.setViewSize = function (viewSz) {
	this.viewSz = new Vec2(viewSz);
};

Render.prototype._setPaperSize = function (sz) { // eslint-disable-line no-underscore-dangle
	var z = this.zoom;
	this.paper.setSize(sz.x * z, sz.y * z);
	this.setViewBox(z);
};

Render.prototype.setPaperSize = function (sz) {
	DEBUG.logMethod('setPaperSize');
	this.sz = sz;
	this._setPaperSize(sz); // eslint-disable-line no-underscore-dangle
};

Render.prototype.setOffset = function (newoffset) {
	DEBUG.logMethod('setOffset');
	var delta = new Vec2(newoffset.x - this.offset.x, newoffset.y - this.offset.y);
	this.clientArea.scrollLeft += delta.x;
	this.clientArea.scrollTop += delta.y;
	this.offset = newoffset;
};

Render.prototype.getElementsInRectangle = function (p0, p1) {
	DEBUG.logMethod('getElementsInRectangle');
	var bondList = [];
	var atomList = [];

	var x0 = Math.min(p0.x, p1.x),
		x1 = Math.max(p0.x, p1.x),
		y0 = Math.min(p0.y, p1.y),
		y1 = Math.max(p0.y, p1.y);
	this.ctab.bonds.each(function (bid, bond) {
		var centre = Vec2.lc2(this.ctab.atoms.get(bond.b.begin).a.pp, 0.5,
			this.ctab.atoms.get(bond.b.end).a.pp, 0.5);
		if (centre.x > x0 && centre.x < x1 && centre.y > y0 && centre.y < y1)
			bondList.push(bid);
	}, this);
	this.ctab.atoms.each(function (aid, atom) {
		if (atom.a.pp.x > x0 && atom.a.pp.x < x1 && atom.a.pp.y > y0 && atom.a.pp.y < y1)
			atomList.push(aid);
	}, this);
	var rxnArrowsList = [];
	var rxnPlusesList = [];
	this.ctab.rxnArrows.each(function (id, item) {
		if (item.item.pp.x > x0 && item.item.pp.x < x1 && item.item.pp.y > y0 && item.item.pp.y < y1)
			rxnArrowsList.push(id);
	}, this);
	this.ctab.rxnPluses.each(function (id, item) {
		if (item.item.pp.x > x0 && item.item.pp.x < x1 && item.item.pp.y > y0 && item.item.pp.y < y1)
			rxnPlusesList.push(id);
	}, this);
	var chiralFlagList = [];
	this.ctab.chiralFlags.each(function (id, item) {
		if (item.pp.x > x0 && item.pp.x < x1 && item.pp.y > y0 && item.pp.y < y1)
			chiralFlagList.push(id);
	}, this);
	var sgroupDataList = [];
	this.ctab.sgroupData.each(function (id, item) {
		if (item.sgroup.pp.x > x0 && item.sgroup.pp.x < x1 && item.sgroup.pp.y > y0 && item.sgroup.pp.y < y1)
			sgroupDataList.push(id);
	}, this);
	return {
		atoms: atomList,
		bonds: bondList,
		rxnArrows: rxnArrowsList,
		rxnPluses: rxnPlusesList,
		chiralFlags: chiralFlagList,
		sgroupData: sgroupDataList
	};
};

// TODO: test me see testPolygon from
// 'Remove unused methods from render' commit
Render.prototype.isPointInPolygon = function (r, p) { // eslint-disable-line max-statements
	var d = new Vec2(0, 1);
	var n = d.rotate(Math.PI / 2);
	var v0 = Vec2.diff(r[r.length - 1], p);
	var n0 = Vec2.dot(n, v0);
	var d0 = Vec2.dot(d, v0);
	var w0 = null;
	var counter = 0;
	var eps = 1e-5;
	var flag1 = false,
		flag0 = false;

	for (var i = 0; i < r.length; ++i) {
		var v1 = Vec2.diff(r[i], p);
		var w1 = Vec2.diff(v1, v0);
		var n1 = Vec2.dot(n, v1);
		var d1 = Vec2.dot(d, v1);
		flag1 = false;
		if (n1 * n0 < 0) {
			if (d1 * d0 > -eps) {
				if (d0 > -eps)
					flag1 = true;
				/* eslint-disable no-mixed-operators*/
			} else if ((Math.abs(n0) * Math.abs(d1) - Math.abs(n1) * Math.abs(d0)) * d1 > 0) {
				/* eslint-enable no-mixed-operators*/
				flag1 = true;
			}
		}
		if (flag1 && flag0 && Vec2.dot(w1, n) * Vec2(w0, n) >= 0) // eslint-disable-line new-cap
			flag1 = false;
		if (flag1)
			counter++;
		v0 = v1;
		n0 = n1;
		d0 = d1;
		w0 = w1;
		flag0 = flag1;
	}
	return (counter % 2) != 0;
};

Render.prototype.ps = function (pp) {
	return pp.scaled(this.settings.scaleFactor);
};

Render.prototype.getElementsInPolygon = function (rr) { // eslint-disable-line max-statements
	DEBUG.logMethod('getElementsInPolygon');
	var bondList = [];
	var atomList = [];
	var r = [];
	for (var i = 0; i < rr.length; ++i)
		r[i] = new Vec2(rr[i].x, rr[i].y);
	this.ctab.bonds.each(function (bid, bond) {
		var centre = Vec2.lc2(this.ctab.atoms.get(bond.b.begin).a.pp, 0.5,
			this.ctab.atoms.get(bond.b.end).a.pp, 0.5);
		if (this.isPointInPolygon(r, centre))
			bondList.push(bid);
	}, this);
	this.ctab.atoms.each(function (aid, atom) {
		if (this.isPointInPolygon(r, atom.a.pp))
			atomList.push(aid);
	}, this);
	var rxnArrowsList = [];
	var rxnPlusesList = [];
	this.ctab.rxnArrows.each(function (id, item) {
		if (this.isPointInPolygon(r, item.item.pp))
			rxnArrowsList.push(id);
	}, this);
	this.ctab.rxnPluses.each(function (id, item) {
		if (this.isPointInPolygon(r, item.item.pp))
			rxnPlusesList.push(id);
	}, this);
	var chiralFlagList = [];
	this.ctab.chiralFlags.each(function (id, item) {
		if (this.isPointInPolygon(r, item.pp))
			chiralFlagList.push(id);
	}, this);
	var sgroupDataList = [];
	this.ctab.sgroupData.each(function (id, item) {
		if (this.isPointInPolygon(r, item.sgroup.pp))
			sgroupDataList.push(id);
	}, this);

	return {
		atoms: atomList,
		bonds: bondList,
		rxnArrows: rxnArrowsList,
		rxnPluses: rxnPlusesList,
		chiralFlags: chiralFlagList,
		sgroupData: sgroupDataList
	};
};

Render.prototype.update = function (force) { // eslint-disable-line max-statements
	DEBUG.logMethod('update');

	if (!this.settings || this.dirty) {
		if (this.opt.autoScale) {
			var cbb = this.ctab.molecule.getCoordBoundingBox();
			// this is only an approximation to select some scale that's close enough to the target one
			var sy = cbb.max.y - cbb.min.y > 0 ? 0.8 * this.viewSz.y / (cbb.max.y - cbb.min.y) : 100;
			var sx = cbb.max.x - cbb.min.x > 0 ? 0.8 * this.viewSz.x / (cbb.max.x - cbb.min.x) : 100;
			this.scale = Math.min(sy, sx);
			if (this.opt.maxBondLength > 0 && this.scale > this.opt.maxBondLength)
				this.scale = this.opt.maxBondLength;
		}
		this.initSettings();
		this.initStyles();
		this.dirty = false;
		force = true;
	}

	var start = (new Date()).getTime();
	var changes = this.ctab.update(force);
	this.ctab.setSelection({}); // [MK] redraw the selection bits where necessary
	var time = (new Date()).getTime() - start;
	if (force && $('log'))
		$('log').innerHTML = time.toString() + '\n';
	if (changes) {
		var sf = this.settings.scaleFactor;
		var bb = this.ctab.getVBoxObj().transform(this.obj2scaled, this).translate(this.offset || new Vec2());

		if (!this.opt.autoScale) {
			var ext = Vec2.UNIT.scaled(sf);
			var eb = bb.sz().length() > 0 ? bb.extend(ext, ext) : bb;
			var vb = new Box2Abs(this.scrollPos(), this.viewSz.scaled(1 / this.zoom).sub(Vec2.UNIT.scaled(20)));
			var cb = Box2Abs.union(vb, eb);
			if (!this.oldCb)
				this.oldCb = new Box2Abs();

			var sz = cb.sz().floor();
			var delta = this.oldCb.p0.sub(cb.p0).ceil();
			this.oldBb = bb;
			if (!this.sz || sz.x != this.sz.x || sz.y != this.sz.y)
				this.setPaperSize(sz);

			this.offset = this.offset || new Vec2();
			if (delta.x != 0 || delta.y != 0) {
				this.setOffset(this.offset.add(delta));
				this.ctab.translate(delta);
			}
		} else {
			var sz1 = bb.sz();
			var marg = this.opt.autoScaleMargin;
			var mv = new Vec2(marg, marg);
			var csz = this.viewSz;
			 /* eslint-disable no-mixed-operators*/
			if (csz.x < 2 * marg + 1 || csz.y < 2 * marg + 1)
				/* eslint-enable no-mixed-operators*/
				throw new Error('View box too small for the given margin');
				/* eslint-disable no-mixed-operators*/
			var rescale = Math.max(sz1.x / (csz.x - 2 * marg), sz1.y / (csz.y - 2 * marg));
			/* eslint-enable no-mixed-operators*/
			if (this.opt.maxBondLength / rescale > 1.0)
				rescale = 1.0;
			var sz2 = sz1.add(mv.scaled(2 * rescale));
			/* eslint-disable no-mixed-operators*/
			this.paper.setViewBox(bb.pos().x - marg * rescale - (csz.x * rescale - sz2.x) / 2, bb.pos().y - marg * rescale - (csz.y * rescale - sz2.y) / 2, csz.x * rescale, csz.y * rescale);
			/* eslint-enable no-mixed-operators*/
		}
	}
};

Render.prototype.findClosestAtom = function (pos, minDist, skip) { // TODO should be a member of ReAtom (see ReFrag)
	var closestAtom = null;
	var maxMinDist = this.opt.selectionDistanceCoefficient;
	minDist = minDist || maxMinDist;
	minDist	 = Math.min(minDist, maxMinDist);
	this.ctab.atoms.each(function (aid, atom) {
		if (aid != skip) {
			var dist = Vec2.dist(pos, atom.a.pp);
			if (dist < minDist) {
				closestAtom = aid;
				minDist = dist;
			}
		}
	}, this);
	if (closestAtom != null) {
		return {
			id: closestAtom,
			dist: minDist
		};
	}
	return null;
};

Render.prototype.findClosestBond = function (pos, minDist) { // TODO should be a member of ReBond (see ReFrag)
	var closestBond = null;
	var closestBondCenter = null;
	var maxMinDist = this.opt.selectionDistanceCoefficient;
	minDist = minDist || maxMinDist;
	minDist = Math.min(minDist, maxMinDist);
	var minCDist = minDist;
	this.ctab.bonds.each(function (bid, bond) {
		var p1 = this.ctab.atoms.get(bond.b.begin).a.pp,
			p2 = this.ctab.atoms.get(bond.b.end).a.pp;
		var mid = Vec2.lc2(p1, 0.5, p2, 0.5);
		var cdist = Vec2.dist(pos, mid);
		if (cdist < minCDist) {
			minCDist = cdist;
			closestBondCenter = bid;
		}
	}, this);
	this.ctab.bonds.each(function (bid, bond) {
		var hb = this.ctab.molecule.halfBonds.get(bond.b.hb1);
		var d = hb.dir;
		var n = hb.norm;
		var p1 = this.ctab.atoms.get(bond.b.begin).a.pp,
			p2 = this.ctab.atoms.get(bond.b.end).a.pp;

		var inStripe = Vec2.dot(pos.sub(p1), d) * Vec2.dot(pos.sub(p2), d) < 0;
		if (inStripe) {
			var dist = Math.abs(Vec2.dot(pos.sub(p1), n));
			if (dist < minDist) {
				closestBond = bid;
				minDist = dist;
			}
		}
	}, this);
	if (closestBond !== null || closestBondCenter !== null) {
		return {
			id: closestBond,
			dist: minDist,
			cid: closestBondCenter,
			cdist: minCDist
		};
	}
	return null;
};

Render.prototype.findClosestItem = function (pos, maps, skip) { // eslint-disable-line max-statements
	var ret = null;
	function updret(type, item, force) {
		if (item != null && (ret == null || ret.dist > item.dist || force)) {
			ret = {
				type: type,
				id: item.id,
				dist: item.dist
			};
		}
	}

	// TODO make it "map-independent", each object should be able to "report" its distance to point (something like ReAtom.dist(point))
	if (!maps || maps.indexOf('atoms') >= 0) {
		var atom = this.findClosestAtom(
			pos, undefined, !Object.isUndefined(skip) && skip.map == 'atoms' ? skip.id : undefined
		);
		updret('Atom', atom);
	}
	if (!maps || maps.indexOf('bonds') >= 0) {
		var bond = this.findClosestBond(pos);
		if (bond) {
			if (bond.cid !== null)
				updret('Bond', { id: bond.cid, dist: bond.cdist });
			if (ret == null || ret.dist > 0.4 * this.scale) // hack
				updret('Bond', bond);
		}
	}
	if (!maps || maps.indexOf('chiralFlags') >= 0) {
		var flag = ReChiralFlag.findClosest(this, pos);
		updret('ChiralFlag', flag); // [MK] TODO: replace this with map name, 'ChiralFlag' -> 'chiralFlags', to avoid the extra mapping "if (ci.type == 'ChiralFlag') ci.map = 'chiralFlags';"
	}
	if (!maps || maps.indexOf('sgroupData') >= 0) {
		var sgd = ReDataSGroupData.findClosest(this, pos);
		updret('DataSGroupData', sgd);
	}
	if (!maps || maps.indexOf('sgroups') >= 0) {
		var sg = ReSGroup.findClosest(this, pos);
		updret('SGroup', sg);
	}
	if (!maps || maps.indexOf('rxnArrows') >= 0) {
		var arrow = ReRxnArrow.findClosest(this, pos);
		updret('RxnArrow', arrow);
	}
	if (!maps || maps.indexOf('rxnPluses') >= 0) {
		var plus = ReRxnPlus.findClosest(this, pos);
		updret('RxnPlus', plus);
	}
	if (!maps || maps.indexOf('frags') >= 0) {
		var frag = ReFrag.findClosest(this, pos, skip && skip.map == 'atoms' ? skip.id : undefined);
		updret('Fragment', frag);
	}
	if (!maps || maps.indexOf('rgroups') >= 0) {
		var rgroup = ReRGroup.findClosest(this, pos);
		updret('RGroup', rgroup);
	}

	ret = ret || {
		type: 'Canvas',
		id: -1
	};
	return ret;
};

Render.prototype.setZoom = function (zoom) {
	// when scaling the canvas down it may happen that the scaled canvas is smaller than the view window
	// don't forget to call setScrollOffset after zooming (or use extendCanvas directly)
	console.info('set zoom', zoom);
	this.zoom = zoom;
	this._setPaperSize(this.sz); // eslint-disable-line no-underscore-dangle
};

Render.prototype.setScrollOffset = function (x, y) {
	var clientArea = this.clientArea;
	var cx = clientArea.clientWidth;
	var cy = clientArea.clientHeight;
	this.extendCanvas(x, y, cx + x, cy + y);
	clientArea.scrollLeft = x;
	clientArea.scrollTop = y;
	 // TODO: store drag position in scaled systems
	// scrollLeft = clientArea.scrollLeft;
	// scrollTop = clientArea.scrollTop;
	this.update(false);
};

Render.prototype.recoordinate = function (rp/* , vp*/) {
	// rp is a point in scaled coordinates, which will be positioned
	// vp is the point where the reference point should now be (in view coordinates)
	//    or the center if not set
	console.assert(rp, 'Reference point not specified');
	this.setScrollOffset(0, 0);
	// var avp = this.obj2view(rp);
	// var so = avp.sub(vp || this.viewSz.scaled(0.5));
	// this.setScrollOffset(so.x, so.y);
};

Render.prototype.extendCanvas = function (x0, y0, x1, y1) { // eslint-disable-line max-statements
	var ex = 0,
		ey = 0,
		dx = 0,
		dy = 0;
	x0 -= 0;
	x1 -= 0;
	y0 -= 0;
	y1 -= 0;

	if (x0 < 0) {
		ex += -x0;
		dx += -x0;
	}
	if (y0 < 0) {
		ey += -y0;
		dy += -y0;
	}

	var szx = this.sz.x * this.zoom,
		szy = this.sz.y * this.zoom;
	if (szx < x1)
		ex += x1 - szx;
	if (szy < y1)
		ey += y1 - szy;

	var d = new Vec2(dx, dy).scaled(1 / this.zoom);
	if (ey > 0 || ex > 0) {
		var e = new Vec2(ex, ey).scaled(1 / this.zoom);
		var sz = this.sz.add(e);

		this.setPaperSize(sz);
		if (d.x > 0 || d.y > 0) {
			this.ctab.translate(d);
			this.setOffset(this.offset.add(d));
		}
	}
	return d;
};

Render.prototype.setScale = function (z) {
	if (this.offset)
		this.offset = this.offset.scaled(1 / z).scaled(this.zoom);
	this.scale = this.baseScale * this.zoom;
	this.settings = null;
	this.update(true);
};

Render.prototype.setViewBox = function (z) {
	if (!this.useOldZoom)
		this.paper.canvas.setAttribute('viewBox', '0 0 ' + this.sz.x + ' ' + this.sz.y);
	else
		this.setScale(z);
};

Render.prototype.drawBracket = function (d, n, c, bracketWidth, bracketHeight) { // eslint-disable-line max-params
	bracketWidth = bracketWidth || 0.25;
	bracketHeight = bracketHeight || 1.0;
	var a0 = c.addScaled(n, -0.5 * bracketHeight);
	var a1 = c.addScaled(n, 0.5 * bracketHeight);
	var b0 = a0.addScaled(d, -bracketWidth);
	var b1 = a1.addScaled(d, -bracketWidth);

	a0 = this.obj2scaled(a0);
	a1 = this.obj2scaled(a1);
	b0 = this.obj2scaled(b0);
	b1 = this.obj2scaled(b1);

	return this.paper.path('M {0}, {1} L {2} , {3} L {4} , {5} L {6} , {7}',
		b0.x, b0.y, a0.x, a0.y, a1.x, a1.y, b1.x, b1.y)
		.attr(this.styles.sgroupBracketStyle);
};

Render.prototype.drawSelectionLine = function (p0, p1) {
	DEBUG.logMethod('drawSelectionLine');
	if (this.selectionRect) {
		this.selectionRect.remove();
		this.selectionRect = null;
	}
	if (p0 && p1) {
		p0 = this.obj2scaled(p0).add(this.offset);
		p1 = this.obj2scaled(p1).add(this.offset);
		this.selectionRect = this.paper.path(
		ReStruct.makeStroke(p0, p1)
		).attr({ 'stroke': 'gray', 'stroke-width': '1px' });
	}
};

Render.prototype.drawSelectionRectangle = function (p0, p1) {
	DEBUG.logMethod('drawSelectionRectangle');
	if (this.selectionRect) {
		this.selectionRect.remove();
		this.selectionRect = null;
	}
	if (p0 && p1) {
		p0 = this.obj2scaled(p0).add(this.offset);
		p1 = this.obj2scaled(p1).add(this.offset);
		this.selectionRect = this.paper.rect(
		Math.min(p0.x, p1.x), Math.min(p0.y, p1.y), Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y)
		).attr({ 'stroke': 'gray', 'stroke-width': '1px' });
	}
};

Render.prototype.drawSelectionPolygon = function (r) {
	DEBUG.logMethod('drawSelectionPolygon');
	if (this.selectionRect) {
		this.selectionRect.remove();
		this.selectionRect = null;
	}
	if (r && r.length > 1) {
		var v = this.obj2scaled(r[r.length - 1]).add(this.offset);
		var pstr = 'M' + tfx(v.x) + ',' + tfx(v.y);
		for (var i = 0; i < r.length; ++i) {
			v = this.obj2scaled(r[i]).add(this.offset);
			pstr += 'L' + tfx(v.x) + ',' + tfx(v.y);
		}
		this.selectionRect = this.paper.path(pstr).attr({ 'stroke': 'gray', 'stroke-width': '1px' });
	}
};

module.exports = Render;
