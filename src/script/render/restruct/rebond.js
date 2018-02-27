/****************************************************************************
 * Copyright 2018 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import ReObject from './reobject';

import { Bond } from '../../chem/struct';
import draw from '../draw';
import Vec2 from '../../util/vec2';
import util from '../util';
import scale from '../../util/scale';

/**
 * @param bond { Bond }
 * @constructor
 */
function ReBond(bond) {
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

/**
 * @param restruct { ReStruct }
 * @param bid { number }
 * @param options { object }
 */
ReBond.prototype.show = function (restruct, bid, options) { // eslint-disable-line max-statements
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
	reactingCenter.path = getReactingCenterPath(render, this, hb1, hb2);
	if (reactingCenter.path) {
		reactingCenter.rbb = util.relBox(reactingCenter.path.getBBox());
		restruct.addReObjectPath('data', this.visel, reactingCenter.path, null, true);
	}
	var topology = {};
	topology.path = getTopologyMark(render, this, hb1, hb2);
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
	return atom.neighbors.findIndex((hbid) => {
		const hb = restruct.molecule.halfBonds.get(hbid);
		const bid = hb.bid;
		if (bid === bid0)
			return false;

		const neibond = restruct.bonds.get(bid);

		const singleUp = neibond.b.type === Bond.PATTERN.TYPE.SINGLE &&
			neibond.b.stereo === Bond.PATTERN.STEREO.UP;

		if (singleUp)
			return neibond.b.end === hb.begin || (neibond.boldStereo && includeBoldStereoBond);

		return !!(
			neibond.b.type === Bond.PATTERN.TYPE.DOUBLE &&
			neibond.b.stereo === Bond.PATTERN.STEREO.NONE &&
			includeBoldStereoBond && neibond.boldStereo
		);
	});
}

function findIncomingUpBonds(bid0, bond, restruct) {
	const halfbonds = [bond.b.begin, bond.b.end].map((aid) => {
		const atom = restruct.molecule.atoms.get(aid);
		const pos = findIncomingStereoUpBond(atom, bid0, true, restruct);
		return pos < 0 ? -1 : atom.neighbors[pos];
	});
	console.assert(halfbonds.length === 2);
	bond.neihbid1 = restruct.atoms.get(bond.b.begin).showLabel ? -1 : halfbonds[0];
	bond.neihbid2 = restruct.atoms.get(bond.b.end).showLabel ? -1 : halfbonds[1];
}

function checkStereoBold(bid0, bond, restruct) {
	var halfbonds = [bond.b.begin, bond.b.end].map((aid) => {
		var atom = restruct.molecule.atoms.get(aid);
		var pos = findIncomingStereoUpBond(atom, bid0, false, restruct);
		return pos < 0 ? -1 : atom.neighbors[pos];
	});
	console.assert(halfbonds.length === 2);
	bond.boldStereo = halfbonds[0] >= 0 && halfbonds[1] >= 0;
}

/**
 * @param restruct { ReStruct }
 * @param bond { ReBond }
 * @param hb1 { HalfBond }
 * @param hb2 { HalfBond }
 * @return {*}
 */
function getBondPath(restruct, bond, hb1, hb2) {
	var path = null;
	var render = restruct.render;
	var struct = restruct.molecule;
	var shiftA = !restruct.atoms.get(hb1.begin).showLabel;
	var shiftB = !restruct.atoms.get(hb2.begin).showLabel;

	switch (bond.b.type) {
	case Bond.PATTERN.TYPE.SINGLE:
		switch (bond.b.stereo) {
		case Bond.PATTERN.STEREO.UP:
			findIncomingUpBonds(hb1.bid, bond, restruct);
			if (bond.boldStereo && bond.neihbid1 >= 0 && bond.neihbid2 >= 0)
				path = getBondSingleStereoBoldPath(render, hb1, hb2, bond, struct);
			else
				path = getBondSingleUpPath(render, hb1, hb2, bond, struct);
			break;
		case Bond.PATTERN.STEREO.DOWN:
			path = getBondSingleDownPath(render, hb1, hb2);
			break;
		case Bond.PATTERN.STEREO.EITHER:
			path = getBondSingleEitherPath(render, hb1, hb2);
			break;
		default:
			path = draw.bondSingle(render.paper, hb1, hb2, render.options);
			break;
		}
		break;
	case Bond.PATTERN.TYPE.DOUBLE:
		findIncomingUpBonds(hb1.bid, bond, restruct);
		if (bond.b.stereo === Bond.PATTERN.STEREO.NONE && bond.boldStereo &&
			bond.neihbid1 >= 0 && bond.neihbid2 >= 0)
			path = getBondDoubleStereoBoldPath(render, hb1, hb2, bond, struct, shiftA, shiftB);
		else
			path = getBondDoublePath(render, hb1, hb2, bond, shiftA, shiftB);
		break;
	case Bond.PATTERN.TYPE.TRIPLE:
		path = draw.bondTriple(render.paper, hb1, hb2, render.options);
		break;
	case Bond.PATTERN.TYPE.AROMATIC:
		var inAromaticLoop = (hb1.loop >= 0 && struct.loops.get(hb1.loop).aromatic) ||
			(hb2.loop >= 0 && struct.loops.get(hb2.loop).aromatic);
		path = inAromaticLoop ? draw.bondSingle(render.paper, hb1, hb2, render.options) :
			getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB);
		break;
	case Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE:
		path = getSingleOrDoublePath(render, hb1, hb2);
		break;
	case Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC:
		path = getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB);
		break;
	case Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC:
		path = getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB);
		break;
	case Bond.PATTERN.TYPE.ANY:
		path = draw.bondAny(render.paper, hb1, hb2, render.options);
		break;
	default:
		throw new Error('Bond type ' + bond.b.type + ' not supported');
	}
	return path;
}

/* Get Path */
function getBondSingleUpPath(render, hb1, hb2, bond, struct) { // eslint-disable-line max-params
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var options = render.options;
	var bsp = 0.7 * options.stereoBond;
	var b2 = b.addScaled(n, bsp);
	var b3 = b.addScaled(n, -bsp);
	if (bond.neihbid2 >= 0) { // if the end is shared with another up-bond heading this way
		var coords = stereoUpBondGetCoordinates(hb2, bond.neihbid2, options.stereoBond, struct);
		b2 = coords[0];
		b3 = coords[1];
	}
	return draw.bondSingleUp(render.paper, a, b2, b3, options);
}

function getBondSingleStereoBoldPath(render, hb1, hb2, bond, struct) { // eslint-disable-line max-params
	var options = render.options;
	var coords1 = stereoUpBondGetCoordinates(hb1, bond.neihbid1, options.stereoBond, struct);
	var coords2 = stereoUpBondGetCoordinates(hb2, bond.neihbid2, options.stereoBond, struct);
	var a1 = coords1[0];
	var a2 = coords1[1];
	var a3 = coords2[0];
	var a4 = coords2[1];
	return draw.bondSingleStereoBold(render.paper, a1, a2, a3, a4, options);
}

function getBondDoubleStereoBoldPath(render, hb1, hb2, bond, struct, shiftA, shiftB) { // eslint-disable-line max-params
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm,
		shift = bond.doubleBondShift;
	var bsp = 1.5 * render.options.stereoBond;
	var b1 = a.addScaled(n, bsp * shift);
	var b2 = b.addScaled(n, bsp * shift);
	if (shift > 0) {
		if (shiftA)
			b1 = b1.addScaled(hb1.dir, bsp * getBondLineShift(hb1.rightCos, hb1.rightSin));
		if (shiftB)
			b2 = b2.addScaled(hb1.dir, -bsp * getBondLineShift(hb2.leftCos, hb2.leftSin));
	} else if (shift < 0) {
		if (shiftA)
			b1 = b1.addScaled(hb1.dir, bsp * getBondLineShift(hb1.leftCos, hb1.leftSin));
		if (shiftB)
			b2 = b2.addScaled(hb1.dir, -bsp * getBondLineShift(hb2.rightCos, hb2.rightSin));
	}
	var sgBondPath = getBondSingleStereoBoldPath(render, hb1, hb2, bond, struct);
	return draw.bondDoubleStereoBold(render.paper, sgBondPath, b1, b2, render.options);
}

function getBondLineShift(cos, sin) {
	if (sin < 0 || Math.abs(cos) > 0.9)
		return 0;
	return sin / (1 - cos);
}

function stereoUpBondGetCoordinates(hb, neihbid, bondSpace, struct) {
	var neihb = struct.halfBonds.get(neihbid);
	var cos = Vec2.dot(hb.dir, neihb.dir);
	var sin = Vec2.cross(hb.dir, neihb.dir);
	var cosHalf = Math.sqrt(0.5 * (1 - cos));
	var biss = neihb.dir.rotateSC((sin >= 0 ? -1 : 1) * cosHalf, Math.sqrt(0.5 * (1 + cos)));

	var denomAdd = 0.3;
	var scale = 0.7;
	var a1 = hb.p.addScaled(biss, scale * bondSpace / (cosHalf + denomAdd));
	var a2 = hb.p.addScaled(biss.negated(), scale * bondSpace / (cosHalf + denomAdd));
	return sin > 0 ? [a1, a2] : [a2, a1];
}

function getBondSingleDownPath(render, hb1, hb2) {
	var a = hb1.p,
		b = hb2.p;
	var options = render.options;
	var d = b.sub(a);
	var len = d.length() + 0.2;
	d = d.normalized();
	var interval = 1.2 * options.lineWidth;
	var nlines = Math.max(Math.floor((len - options.lineWidth) /
			(options.lineWidth + interval)), 0) + 2;
	var step = len / (nlines - 1);
	return draw.bondSingleDown(render.paper, hb1, d, nlines, step, options);
}

function getBondSingleEitherPath(render, hb1, hb2) {
	var a = hb1.p,
		b = hb2.p;
	var options = render.options;
	var d = b.sub(a);
	var len = d.length();
	d = d.normalized();
	var interval = 0.6 * options.lineWidth;
	var nlines = Math.max(Math.floor((len - options.lineWidth) /
			(options.lineWidth + interval)), 0) + 2;
	var step = len / (nlines - 0.5);
	return draw.bondSingleEither(render.paper, hb1, d, nlines, step, options);
}

function getBondDoublePath(render, hb1, hb2, bond, shiftA, shiftB) { // eslint-disable-line max-params, max-statements
	const cisTrans = bond.b.stereo === Bond.PATTERN.STEREO.CIS_TRANS;

	const a = hb1.p;
	const b = hb2.p;
	const n = hb1.norm;
	const shift = cisTrans ? 0 : bond.doubleBondShift;

	const options = render.options;
	const bsp = options.bondSpace / 2;
	const s1 = bsp + (shift * bsp);
	const s2 = -bsp + (shift * bsp);

	let a1 = a.addScaled(n, s1);
	let b1 = b.addScaled(n, s1);
	let a2 = a.addScaled(n, s2);
	let b2 = b.addScaled(n, s2);

	if (shift > 0) {
		if (shiftA) {
			a1 = a1.addScaled(hb1.dir, options.bondSpace *
				getBondLineShift(hb1.rightCos, hb1.rightSin));
		}
		if (shiftB) {
			b1 = b1.addScaled(hb1.dir, -options.bondSpace *
				getBondLineShift(hb2.leftCos, hb2.leftSin));
		}
	} else if (shift < 0) {
		if (shiftA) {
			a2 = a2.addScaled(hb1.dir, options.bondSpace *
				getBondLineShift(hb1.leftCos, hb1.leftSin));
		}
		if (shiftB) {
			b2 = b2.addScaled(hb1.dir, -options.bondSpace *
				getBondLineShift(hb2.rightCos, hb2.rightSin));
		}
	}

	return draw.bondDouble(render.paper, a1, a2, b1, b2, cisTrans, options);
}

function getSingleOrDoublePath(render, hb1, hb2) {
	var a = hb1.p,
		b = hb2.p;
	var options = render.options;

	var nSect = (Vec2.dist(a, b) / (options.bondSpace + options.lineWidth)).toFixed() - 0;
	if (!(nSect & 1))
		nSect += 1;
	return draw.bondSingleOrDouble(render.paper, hb1, hb2, nSect, options);
}

function getBondAromaticPath(render, hb1, hb2, bond, shiftA, shiftB) { // eslint-disable-line max-params
	var dashdotPattern = [0.125, 0.125, 0.005, 0.125];
	var mark = null,
		dash = null;
	var options = render.options;
	var bondShift = bond.doubleBondShift;

	if (bond.b.type === Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC) {
		mark = bondShift > 0 ? 1 : 2;
		dash = dashdotPattern.map(v => v * options.scale);
	}
	if (bond.b.type === Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC) {
		mark = 3;
		dash = dashdotPattern.map(v => v * options.scale);
	}
	var paths = getAromaticBondPaths(hb1, hb2, bondShift, shiftA, shiftB, options.bondSpace, mark, dash);
	return draw.bondAromatic(render.paper, paths, bondShift, options);
}

function getAromaticBondPaths(hb1, hb2, shift, shiftA, shiftB, bondSpace, mask, dash) { // eslint-disable-line max-params, max-statements
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var bsp = bondSpace / 2;
	var s1 = bsp + (shift * bsp),
		s2 = -bsp + (shift * bsp);
	var a2 = a.addScaled(n, s1);
	var b2 = b.addScaled(n, s1);
	var a3 = a.addScaled(n, s2);
	var b3 = b.addScaled(n, s2);
	if (shift > 0) {
		if (shiftA) {
			a2 = a2.addScaled(hb1.dir, bondSpace *
				getBondLineShift(hb1.rightCos, hb1.rightSin));
		}
		if (shiftB) {
			b2 = b2.addScaled(hb1.dir, -bondSpace *
				getBondLineShift(hb2.leftCos, hb2.leftSin));
		}
	} else if (shift < 0) {
		if (shiftA) {
			a3 = a3.addScaled(hb1.dir, bondSpace *
				getBondLineShift(hb1.leftCos, hb1.leftSin));
		}
		if (shiftB) {
			b3 = b3.addScaled(hb1.dir, -bondSpace *
				getBondLineShift(hb2.rightCos, hb2.rightSin));
		}
	}
	return draw.aromaticBondPaths(a2, a3, b2, b3, mask, dash);
}

function getReactingCenterPath(render, bond, hb1, hb2) { // eslint-disable-line max-statements
	var a = hb1.p,
		b = hb2.p;
	var c = b.add(a).scaled(0.5);
	var d = b.sub(a).normalized();
	var n = d.rotateSC(1, 0);

	var p = [];

	var lw = render.options.lineWidth,
		bs = render.options.bondSpace / 2;
	var alongIntRc = lw, // half interval along for CENTER
		alongIntMadeBroken = 2 * lw, // half interval between along for MADE_OR_BROKEN
		alongSz = 1.5 * bs, // half size along for CENTER
		acrossInt = 1.5 * bs, // half interval across for CENTER
		acrossSz = 3.0 * bs, // half size across for all
		tiltTan = 0.2; // tangent of the tilt angle

	switch (bond.b.reactingCenterStatus) {
	case Bond.PATTERN.REACTING_CENTER.NOT_CENTER: // X
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz));
		p.push(c.addScaled(n, acrossSz).addScaled(d, -tiltTan * acrossSz));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, tiltTan * acrossSz));
		break;
	case Bond.PATTERN.REACTING_CENTER.CENTER: // #
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz).addScaled(d, alongIntRc));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz).addScaled(d, alongIntRc));
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz).addScaled(d, -alongIntRc));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz).addScaled(d, -alongIntRc));
		p.push(c.addScaled(d, alongSz).addScaled(n, acrossInt));
		p.push(c.addScaled(d, -alongSz).addScaled(n, acrossInt));
		p.push(c.addScaled(d, alongSz).addScaled(n, -acrossInt));
		p.push(c.addScaled(d, -alongSz).addScaled(n, -acrossInt));
		break;
		// case Bond.PATTERN.REACTING_CENTER.UNCHANGED: draw a circle
	case Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN:
		p.push(c.addScaled(n, acrossSz).addScaled(d, alongIntMadeBroken));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, alongIntMadeBroken));
		p.push(c.addScaled(n, acrossSz).addScaled(d, -alongIntMadeBroken));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -alongIntMadeBroken));
		break;
	case Bond.PATTERN.REACTING_CENTER.ORDER_CHANGED:
		p.push(c.addScaled(n, acrossSz));
		p.push(c.addScaled(n, -acrossSz));
		break;
	case Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN_AND_CHANGED:
		p.push(c.addScaled(n, acrossSz).addScaled(d, alongIntMadeBroken));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, alongIntMadeBroken));
		p.push(c.addScaled(n, acrossSz).addScaled(d, -alongIntMadeBroken));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -alongIntMadeBroken));
		p.push(c.addScaled(n, acrossSz));
		p.push(c.addScaled(n, -acrossSz));
		break;
	default:
		return null;
	}
	return draw.reactingCenter(render.paper, p, render.options);
}

function getTopologyMark(render, bond, hb1, hb2) { // eslint-disable-line max-statements
	var options = render.options;
	var mark = null;

	if (bond.b.topology === Bond.PATTERN.TOPOLOGY.RING)
		mark = 'rng';
	else if (bond.b.topology === Bond.PATTERN.TOPOLOGY.CHAIN)
		mark = 'chn';
	else
		return null;

	var a = hb1.p,
		b = hb2.p;
	var c = b.add(a).scaled(0.5);
	var d = b.sub(a).normalized();
	var n = d.rotateSC(1, 0);
	var fixed = options.lineWidth;
	if (bond.doubleBondShift > 0)
		n = n.scaled(-bond.doubleBondShift);
	else if (bond.doubleBondShift == 0)
		fixed += options.bondSpace / 2;

	var s = new Vec2(2, 1).scaled(options.bondSpace);
	if (bond.b.type == Bond.PATTERN.TYPE.TRIPLE)
		fixed += options.bondSpace;
	var p = c.add(new Vec2(n.x * (s.x + fixed), n.y * (s.y + fixed)));

	return draw.topologyMark(render.paper, p, mark, options);
}

function getIdsPath(bid, paper, hb1, hb2, bondIdxOff, param1, param2, norm) { // eslint-disable-line max-params
	var pb = Vec2.lc(hb1.p, param1, hb2.p, param2, norm, bondIdxOff);
	var ipath = paper.text(pb.x, pb.y, bid.toString());
	var irbb = util.relBox(ipath.getBBox());
	draw.recenterText(ipath, irbb);
	return ipath;
}
/* ----- */

function setDoubleBondShift(bond, struct) {
	var loop1,
		loop2;
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
	bond.b.sa = Math.max(bond.b.sb, bond.b.len / 2 - options.lineWidth * 2);
	/* eslint-enable no-mixed-operators*/
	bond.b.angle = Math.atan2(hb1.dir.y, hb1.dir.x) * 180 / Math.PI;
}

function shiftBondEnd(atom, pos0, dir, margin) {
	var t = 0;
	var visel = atom.visel;
	for (var k = 0; k < visel.exts.length; ++k) {
		var box = visel.exts[k].translate(pos0);
		t = Math.max(t, util.shiftRayBox(pos0, dir, box));
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

export default ReBond;
