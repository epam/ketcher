var Raphael = require('../raphael-ext');
var Box2Abs = require('../util/box2abs');
var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var util = require('../util');

var Struct = require('../chem/struct');
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
	hideTerminalLabels: false
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

Render.prototype.scaled2obj = function (v) {
	return v.scaled(1 / this.settings.scaleFactor);
};

Render.prototype.obj2scaled = function (v) {
	return v.scaled(this.settings.scaleFactor);
};

Render.prototype.view2obj = function (p, isRelative) {
	var scroll = this.scrollPos();
	if (!this.useOldZoom) {
		p = p.scaled(1 / this.zoom);
		scroll = scroll.scaled(1 / this.zoom);
	}
	p = isRelative ? p : p.add(scroll).sub(this.offset);
	return this.scaled2obj(p);
};

Render.prototype.obj2view = function (v, isRelative) {
	var p = this.obj2scaled(v, isRelative);
	p = isRelative ? p : p.add(this.offset).sub(this.scrollPos().scaled(1 / this.zoom));
	if (!this.useOldZoom)
		p = p.scaled(this.zoom);
	return p;
};

Render.prototype.scrollPos = function () {
	return new Vec2(this.clientArea.scrollLeft, this.clientArea.scrollTop);
};

Render.prototype.page2obj = function (pagePos) {
	var offset = this.clientArea.cumulativeOffset();
	var pp = new Vec2(pagePos.pageX - offset.left, pagePos.pageY - offset.top);
	return this.view2obj(pp);
};

Render.prototype.onResize = function () {
	this.viewSz = new Vec2(this.clientArea.clientWidth,
	                       this.clientArea.clientHeight);
};

Render.prototype.setPaperSize = function (sz) {
	DEBUG.logMethod('setPaperSize');
	this.sz = sz;
	this.paper.setSize(sz.x * this.zoom, sz.y * this.zoom);
	this.setViewBox(this.zoom);
};

Render.prototype.setOffset = function (newoffset) {
	DEBUG.logMethod('setOffset');
	var delta = new Vec2(newoffset.x - this.offset.x, newoffset.y - this.offset.y);
	this.clientArea.scrollLeft += delta.x;
	this.clientArea.scrollTop += delta.y;
	this.offset = newoffset;
};

Render.prototype.setZoom = function (zoom) {
	// when scaling the canvas down it may happen that the scaled canvas is smaller than the view window
	// don't forget to call setScrollOffset after zooming (or use extendCanvas directly)
	console.info('set zoom', zoom);
	this.zoom = zoom;
	this.paper.setSize(this.sz.x * zoom, this.sz.y * zoom);
	this.setViewBox(zoom);
};

function calcExtend(sSz, x0, y0, x1, y1) {
	var ex = (x0 < 0) ? -x0 : 0;
	var ey = (y0 < 0) ? -y0 : 0;

	if (sSz.x < x1)
		ex += x1 - sSz.x;
	if (sSz.y < y1)
		ey += y1 - sSz.y;
	return new Vec2(ex, ey);
}

Render.prototype.setScrollOffset = function (x, y) {
	var clientArea = this.clientArea;
	var cx = clientArea.clientWidth;
	var cy = clientArea.clientHeight;
	var e = calcExtend(this.sz.scaled(this.zoom), x, y,
	                   cx + x, cy + y).scaled(1 / this.zoom);
	if (e.x > 0 || e.y > 0) {
		this.setPaperSize(this.sz.add(e));
		var d = new Vec2((x < 0) ? -x : 0,
		                 (y < 0) ? -y : 0).scaled(1 / this.zoom);
		if (d.x > 0 || d.y > 0) {
			this.ctab.translate(d);
			this.setOffset(this.offset.add(d));
		}
	}
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

Render.prototype.ps = function (pp) {
	return pp.scaled(this.settings.scaleFactor);
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
	this.styles.lassoStyle = {
		'stroke': 'gray',
		'stroke-width': '1px'
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
	                       tfx(b0.x), tfx(b0.y), tfx(a0.x), tfx(a0.y),
	                       tfx(a1.x), tfx(a1.y), tfx(b1.x), tfx(b1.y))
		.attr(this.styles.sgroupBracketStyle);
};

module.exports = Render;
