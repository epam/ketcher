var ReObject = require('./reobject');

var Struct = require('../../chem/struct');
var draw = require('../draw');
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
	var c = render.ps(this.b.center);
	return render.paper.circle(c.x, c.y, 0.8 * render.options.atomSelectionPlateRadius)
		.attr(render.options.highlightStyle);
};

ReBond.prototype.makeSelectionPlate = function (restruct, paper, options) {
	restruct.bondRecalc(restruct.render.options, this);
	var c = restruct.render.ps(this.b.center);
	return paper.circle(c.x, c.y, 0.8 * options.atomSelectionPlateRadius)
		.attr(options.selectionStyle);
};

ReBond.prototype.show = function (restruct) {
	var structData = {
		molecule: restruct.molecule,
		atoms: restruct.atoms,
		bonds: restruct.bonds
	};
	this.path = showBond(restruct.render, structData, this);
};

ReBond.prototype.findIncomingStereoUpBond = function (atom, bid0, includeBoldStereoBond, structData) {
	return atom.neighbors.findIndex(function (hbid) {
		var hb = structData.molecule.halfBonds.get(hbid);
		var bid = hb.bid;
		if (bid === bid0)
			return false;
		var neibond = structData.bonds.get(bid);
		if (neibond.b.type === Struct.Bond.PATTERN.TYPE.SINGLE && neibond.b.stereo === Struct.Bond.PATTERN.STEREO.UP)
			return neibond.b.end === hb.begin || (neibond.boldStereo && includeBoldStereoBond);
		return !!(neibond.b.type === Struct.Bond.PATTERN.TYPE.DOUBLE && neibond.b.stereo === Struct.Bond.PATTERN.STEREO.NONE && includeBoldStereoBond && neibond.boldStereo);
	}, this);
};

function findIncomingUpBonds(bid0, bond, structData) {
	var halfbonds = [bond.b.begin, bond.b.end].map(function (aid) {
		var atom = structData.molecule.atoms.get(aid);
		var pos =  bond.findIncomingStereoUpBond(atom, bid0, true, structData);
		return pos < 0 ? -1 : atom.neighbors[pos];
	}, this);
	util.assert(halfbonds.length === 2);
	bond.neihbid1 = structData.atoms.get(bond.b.begin).showLabel ? -1 : halfbonds[0];
	bond.neihbid2 = structData.atoms.get(bond.b.end).showLabel ? -1 : halfbonds[1];
}

function showBond(render, structData, bond) {
	var struct = structData.molecule;
	var path = null;
	var hb1 = struct.halfBonds.get(bond.b.hb1),
		hb2 = struct.halfBonds.get(bond.b.hb2);
	var shiftA = !structData.atoms.get(hb1.begin).showLabel;
	var shiftB = !structData.atoms.get(hb2.begin).showLabel;

	switch (bond.b.type) {
	case Struct.Bond.PATTERN.TYPE.SINGLE:
		switch (bond.b.stereo) {
		case Struct.Bond.PATTERN.STEREO.UP:
			findIncomingUpBonds(hb1.bid, bond, structData);
			if (bond.boldStereo && bond.neihbid1 >= 0 && bond.neihbid2 >= 0)
				path = draw.bondSingleStereoBold(render, hb1, hb2, bond, shiftA, shiftB);
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
		findIncomingUpBonds(hb1.bid, bond, structData);
		if (bond.b.stereo === Struct.Bond.PATTERN.STEREO.NONE && bond.boldStereo &&
			bond.neihbid1 >= 0 && bond.neihbid2 >= 0) {
			path = draw.bondSingleStereoBold(render, hb1, hb2, bond, shiftA, shiftB);
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

module.exports = ReBond;
