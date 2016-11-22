var ReObject = require('./reobject');

var Struct = require('../../chem/struct');
var draw = require('../draw');
var Vec2 = require('../../util/vec2');
var util = require('../../util');
var scale = require('../../util/scale');

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
	var options = render.options;
	bondRecalc(this, render.ctab, options);
	var c = scale.obj2scaled(this.b.center, options);
	return render.paper.circle(c.x, c.y, 0.8 * options.atomSelectionPlateRadius)
		.attr(options.highlightStyle);
};

ReBond.prototype.makeSelectionPlate = function (restruct, paper, options) {
	bondRecalc(this, restruct, options);
	var c = scale.obj2scaled(this.b.center, options);
	return paper.circle(c.x, c.y, 0.8 * options.atomSelectionPlateRadius)
		.attr(options.selectionStyle);
};

ReBond.prototype.show = function (restruct, bid, options) {
	var render = restruct.render;
	var struct = restruct.molecule;
	var paper = render.paper;
	var hb1 = struct.halfBonds.get(this.b.hb1),
		hb2 = struct.halfBonds.get(this.b.hb2);

	checkStereoBold(bid, this, restruct);
	bondRecalc(this, restruct, options);
	setDoubleBondShift(this, struct);

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

function findIncomingStereoUpBond(atom, bid0, includeBoldStereoBond, restruct) {
	return atom.neighbors.findIndex(function (hbid) {
		var hb = restruct.molecule.halfBonds.get(hbid);
		var bid = hb.bid;
		if (bid === bid0)
			return false;
		var neibond = restruct.bonds.get(bid);
		if (neibond.b.type === Struct.Bond.PATTERN.TYPE.SINGLE && neibond.b.stereo === Struct.Bond.PATTERN.STEREO.UP)
			return neibond.b.end === hb.begin || (neibond.boldStereo && includeBoldStereoBond);
		return !!(neibond.b.type === Struct.Bond.PATTERN.TYPE.DOUBLE && neibond.b.stereo === Struct.Bond.PATTERN.STEREO.NONE && includeBoldStereoBond && neibond.boldStereo);
	});
}

function findIncomingUpBonds(bid0, bond, restruct) {
	var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
		var atom = restruct.molecule.atoms.get(aid);
		var pos = findIncomingStereoUpBond(atom, bid0, true, restruct);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, this);
	util.assert(halfbonds.length === 2);
	bond.neihbid1 = restruct.atoms.get(bond.b.begin).showLabel ? -1 : halfbonds[0];
	bond.neihbid2 = restruct.atoms.get(bond.b.end).showLabel ? -1 : halfbonds[1];
}

function checkStereoBold(bid0, bond, restruct) {
	var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
		var atom = restruct.molecule.atoms.get(aid);
		var pos =  findIncomingStereoUpBond(atom, bid0, false, restruct);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, restruct);
	util.assert(halfbonds.length === 2);
	bond.boldStereo = halfbonds[0] >= 0 && halfbonds[1] >= 0;
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

function setDoubleBondShift(bond, struct) {
	var loop1, loop2;
	loop1 = struct.halfBonds.get(bond.b.hb1).loop;
	loop2 = struct.halfBonds.get(bond.b.hb2).loop;
	if (loop1 >= 0 && loop2 >= 0) {
		var d1 = struct.loops.get(loop1).dblBonds;
		var d2 = struct.loops.get(loop2).dblBonds;
		var n1 = struct.loops.get(loop1).hbs.length;
		var n2 = struct.loops.get(loop2).hbs.length;
		bond.doubleBondShift = selectDoubleBondShift(n1, n2, d1, d2);
	} else if (loop1 >= 0) {
		bond.doubleBondShift = -1;
	} else if (loop2 >= 0) {
		bond.doubleBondShift = 1;
	} else {
		bond.doubleBondShift = selectDoubleBondShiftChain(struct, bond);
	}
}

function bondRecalc(bond, restruct, options) {
	var render = restruct.render;
	var atom1 = restruct.atoms.get(bond.b.begin);
	var atom2 = restruct.atoms.get(bond.b.end);
	var p1 = scale.obj2scaled(atom1.a.pp, render.options);
	var p2 = scale.obj2scaled(atom2.a.pp, render.options);
	var hb1 = restruct.molecule.halfBonds.get(bond.b.hb1);
	var hb2 = restruct.molecule.halfBonds.get(bond.b.hb2);
	hb1.p = shiftBondEnd(atom1, p1, hb1.dir, 2 * options.lineWidth);
	hb2.p = shiftBondEnd(atom2, p2, hb2.dir, 2 * options.lineWidth);
	bond.b.center = Vec2.lc2(atom1.a.pp, 0.5, atom2.a.pp, 0.5);
	bond.b.len = Vec2.dist(p1, p2);
	bond.b.sb = options.lineWidth * 5;
	/* eslint-disable no-mixed-operators*/
	bond.b.sa = Math.max(bond.b.sb,  bond.b.len / 2 - options.lineWidth * 2);
	/* eslint-enable no-mixed-operators*/
	bond.b.angle = Math.atan2(hb1.dir.y, hb1.dir.x) * 180 / Math.PI;
}

function shiftBondEnd(atom, pos0, dir, margin) {
	var t = 0;
	var visel = atom.visel;
	for (var k = 0; k < visel.exts.length; ++k) {
		var box = visel.exts[k].translate(pos0);
		t = Math.max(t, Vec2.shiftRayBox(pos0, dir, box));
	}
	if (t > 0)
		pos0 = pos0.addScaled(dir, t + margin);
	return pos0;
}

function selectDoubleBondShift(n1, n2, d1, d2) {
	if (n1 == 6 && n2 != 6 && (d1 > 1 || d2 == 1))
		return -1;
	if (n2 == 6 && n1 != 6 && (d2 > 1 || d1 == 1))
		return 1;
	if (n2 * d1 > n1 * d2)
		return -1;
	if (n2 * d1 < n1 * d2)
		return 1;
	if (n2 > n1)
		return -1;
	return 1;
}

function selectDoubleBondShiftChain(struct, bond) {
	var hb1 = struct.halfBonds.get(bond.b.hb1);
	var hb2 = struct.halfBonds.get(bond.b.hb2);
	var nLeft = (hb1.leftSin > 0.3 ? 1 : 0) + (hb2.rightSin > 0.3 ? 1 : 0);
	var nRight = (hb2.leftSin > 0.3 ? 1 : 0) + (hb1.rightSin > 0.3 ? 1 : 0);
	if (nLeft > nRight)
		return -1;
	if (nLeft < nRight)
		return 1;
	if ((hb1.leftSin > 0.3 ? 1 : 0) + (hb1.rightSin > 0.3 ? 1 : 0) == 1)
		return 1;
	return 0;
}

module.exports = ReBond;
