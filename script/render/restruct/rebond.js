var ReObject = require('./reobject');

var Struct = require('../../chem/struct');
var draw = require('../draw');
var Vec2 = require('../../util/vec2');
var util = require('../../util');

function ReBond(/* chem.Bond*/bond) {
	this.init('bond');

	this.b = bond; // TODO rename b to item
	this.doubleBondShift = 0;
}

ReBond.prototype = new ReObject();
ReBond.isSelectable = function () {
	return true;
};

ReBond.prototype.drawHighlight = function (render) {
	var ret = this.makeHighlightPlate(render);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReBond.prototype.makeHighlightPlate = function (render) {
	render.ctab.bondRecalc(render.options, this);
	var c = render.obj2scaled(this.b.center);
	return render.paper.circle(c.x, c.y, 0.8 * render.options.atomSelectionPlateRadius)
		.attr(render.options.highlightStyle);
};

ReBond.prototype.makeSelectionPlate = function (restruct, paper, options) {
	restruct.bondRecalc(restruct.render.options, this);
	var c = restruct.render.obj2scaled(this.b.center);
	return paper.circle(c.x, c.y, 0.8 * options.atomSelectionPlateRadius)
		.attr(options.selectionStyle);
};

ReBond.prototype.show = function (restruct, bid, options) {
	var render = restruct.render;
	var paper = render.paper;
	var hb1 = restruct.molecule.halfBonds.get(this.b.hb1),
		hb2 = restruct.molecule.halfBonds.get(this.b.hb2);

	this.path = getBondPath(restruct, this, hb1, hb2);

	this.rbb = util.relBox(this.path.getBBox());
	restruct.addReObjectPath('data', this.visel, this.path, null, true);
	var reactingCenter = {};
	reactingCenter.path = draw.reactingCenter(render, this, hb1, hb2);
	if (reactingCenter.path) {
		reactingCenter.rbb = util.relBox(reactingCenter.path.getBBox());
		restruct.addReObjectPath('data', this.visel, reactingCenter.path, null, true);
	}
	var topology = {};
	topology.path = draw.topologyMark(render, this, hb1, hb2);
	if (topology.path) {
		topology.rbb = util.relBox(topology.path.getBBox());
		restruct.addReObjectPath('data', this.visel, topology.path, null, true);
	}
	this.setHighlight(this.highlight, render);

	var ipath = null;
	var bondIdxOff = options.subFontSize * 0.6;
	if (options.showBondIds) {
		ipath = getIdsPath(bid, paper, hb1, hb2, bondIdxOff, 0.5, 0.5, hb1.norm);
		restruct.addReObjectPath('indices', this.visel, ipath);
	}
	if (options.showHalfBondIds) {
		ipath = getIdsPath(this.b.hb1, paper, hb1, hb2, bondIdxOff, 0.8, 0.2, hb1.norm);
		restruct.addReObjectPath('indices', this.visel, ipath);
		ipath = getIdsPath(this.b.hb2, paper, hb1, hb2, bondIdxOff, 0.2, 0.8, hb2.norm);
		restruct.addReObjectPath('indices', this.visel, ipath);
	}
	if (options.showLoopIds && !options.showBondIds) {
		ipath = getIdsPath(hb1.loop, paper, hb1, hb2, bondIdxOff, 0.5, 0.5, hb2.norm);
		restruct.addReObjectPath('indices', this.visel, ipath);
		ipath = getIdsPath(hb2.loop, paper, hb1, hb2, bondIdxOff, 0.5, 0.5, hb1.norm);
		restruct.addReObjectPath('indices', this.visel, ipath);
	}
};

ReBond.prototype.findIncomingStereoUpBond = function (atom, bid0, includeBoldStereoBond, restruct) {
	return atom.neighbors.findIndex(function (hbid) {
		var hb = restruct.molecule.halfBonds.get(hbid);
		var bid = hb.bid;
		if (bid === bid0)
			return false;
		var neibond = restruct.bonds.get(bid);
		if (neibond.b.type === Struct.Bond.PATTERN.TYPE.SINGLE && neibond.b.stereo === Struct.Bond.PATTERN.STEREO.UP)
			return neibond.b.end === hb.begin || (neibond.boldStereo && includeBoldStereoBond);
		return !!(neibond.b.type === Struct.Bond.PATTERN.TYPE.DOUBLE && neibond.b.stereo === Struct.Bond.PATTERN.STEREO.NONE && includeBoldStereoBond && neibond.boldStereo);
	}, this);
};

function findIncomingUpBonds(bid0, bond, restruct) {
	var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
		var atom = restruct.molecule.atoms.get(aid);
		var pos =  bond.findIncomingStereoUpBond(atom, bid0, true, restruct);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, this);
	util.assert(halfbonds.length === 2);
	bond.neihbid1 = restruct.atoms.get(bond.b.begin).showLabel ? -1 : halfbonds[0];
	bond.neihbid2 = restruct.atoms.get(bond.b.end).showLabel ? -1 : halfbonds[1];
}

function getBondPath(restruct, bond, hb1, hb2) {
	var path = null;
	var render = restruct.render;
	var struct = restruct.molecule;
	var shiftA = !restruct.atoms.get(hb1.begin).showLabel;
	var shiftB = !restruct.atoms.get(hb2.begin).showLabel;

	switch (bond.b.type) {
	case Struct.Bond.PATTERN.TYPE.SINGLE:
		switch (bond.b.stereo) {
		case Struct.Bond.PATTERN.STEREO.UP:
			findIncomingUpBonds(hb1.bid, bond, restruct);
			if (bond.boldStereo && bond.neihbid1 >= 0 && bond.neihbid2 >= 0)
				path = draw.bondSingleStereoBold(render, hb1, hb2, bond, false, struct, shiftA, shiftB);
			else
				path = draw.bondSingleUp(render, hb1, hb2, bond, struct);
			break;
		case Struct.Bond.PATTERN.STEREO.DOWN:
			path = draw.bondSingleDown(render, hb1, hb2);
			break;
		case Struct.Bond.PATTERN.STEREO.EITHER:
			path = draw.bondSingleEither(render, hb1, hb2);
			break;
		default:
			path = draw.bondSingle(render, hb1, hb2);
			break;
		}
		break;
	case Struct.Bond.PATTERN.TYPE.DOUBLE:
		findIncomingUpBonds(hb1.bid, bond, restruct);
		if (bond.b.stereo === Struct.Bond.PATTERN.STEREO.NONE && bond.boldStereo &&
			bond.neihbid1 >= 0 && bond.neihbid2 >= 0) {
			path = draw.bondSingleStereoBold(render, hb1, hb2, bond, true, struct, shiftA, shiftB);
		} else {
			path = draw.bondDouble(render, hb1, hb2, bond,
				bond.b.stereo === Struct.Bond.PATTERN.STEREO.CIS_TRANS, shiftA, shiftB);
		}
		break;
	case Struct.Bond.PATTERN.TYPE.TRIPLE:
		path = draw.bondTriple(render, hb1, hb2);
		break;
	case Struct.Bond.PATTERN.TYPE.AROMATIC:
		var inAromaticLoop = (hb1.loop >= 0 && struct.loops.get(hb1.loop).aromatic) ||
			(hb2.loop >= 0 && struct.loops.get(hb2.loop).aromatic);
		path = inAromaticLoop ? draw.bondSingle(render, hb1, hb2) :
			draw.bondAromatic(render, hb1, hb2,
				bond.doubleBondShift, shiftA, shiftB);
		break;
	case Struct.Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE:
		path = draw.bondSingleOrDouble(render, hb1, hb2);
		break;
	case Struct.Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC:
		path = draw.bondSingleOrAromatic(render, hb1, hb2,
			bond.doubleBondShift, shiftA, shiftB);
		break;
	case Struct.Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC:
		path = draw.bondDoubleOrAromatic(render, hb1, hb2,
			bond.doubleBondShift, shiftA, shiftB);
		break;
	case Struct.Bond.PATTERN.TYPE.ANY:
		path = draw.bondAny(render, hb1, hb2);
		break;
	default:
		throw new Error('Bond type ' + bond.b.type + ' not supported');
	}
	return path;
}

function getIdsPath(bid, paper, hb1, hb2, bondIdxOff, param1, param2, norm) {
	var pb = Vec2.lc(hb1.p, param1, hb2.p, param2, norm, bondIdxOff);
	var ipath = paper.text(pb.x, pb.y, bid.toString());
	var irbb = util.relBox(ipath.getBBox());
	draw.recenterText(ipath, irbb);
	return ipath;
}

module.exports = ReBond;
