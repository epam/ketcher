var util = require('../util');
var Vec2 = require('../util/vec2');
var Struct = require('../chem/struct');
var Raphael = require('../raphael-ext');

var tfx = util.tfx;

var dashdotPattern = [0.125, 0.125, 0.005, 0.125];

function arrow(render, a, b) {
	var width = 5,
		length = 7;
	var paper = render.paper;
	var styles = render.styles;
	return paper.path('M{0},{1}L{2},{3}L{4},{5}M{2},{3}L{4},{6}', tfx(a.x), tfx(a.y), tfx(b.x), tfx(b.y), tfx(b.x - length), tfx(b.y - width), tfx(b.y + width))
		.attr(styles.lineattr);
}

function plus(render, c) {
	var s = render.scale / 5;
	var paper = render.paper;
	var styles = render.styles;
	return paper.path('M{0},{4}L{0},{5}M{2},{1}L{3},{1}', tfx(c.x), tfx(c.y), tfx(c.x - s), tfx(c.x + s), tfx(c.y - s), tfx(c.y + s))
		.attr(styles.lineattr);
}

function bondSingle(render, hb1, hb2) {
	var a = hb1.p,
		b = hb2.p;
	var paper = render.paper;
	var styles = render.styles;
	return paper.path(makeStroke(a, b))
		.attr(styles.lineattr);
}

function bondSingleUp(render, hb1, hb2, bond, struct) { // eslint-disable-line max-params
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var settings = render.settings;
	var paper = render.paper;
	var styles = render.styles;
	var bsp = 0.7 * settings.bondSpace;
	var b2 = b.addScaled(n, bsp);
	var b3 = b.addScaled(n, -bsp);
	if (bond.neihbid2 >= 0) { // if the end is shared with another up-bond heading this way
		var coords = stereoUpBondGetCoordinates(hb2, bond.neihbid2, settings.bondSpace, struct);
		b2 = coords[0];
		b3 = coords[1];
	}
	return paper.path('M{0},{1}L{2},{3}L{4},{5}Z',
	tfx(a.x), tfx(a.y), tfx(b2.x), tfx(b2.y), tfx(b3.x), tfx(b3.y))
		.attr(styles.lineattr).attr({ fill: '#000' });
}

function bondSingleStereoBold(render, hb1, hb2, bond, isDouble, struct, shiftA, shiftB) { // eslint-disable-line max-params, max-statements
	var paper = render.paper;
	var settings = render.settings;
	var styles = render.styles;
	var coords1 = stereoUpBondGetCoordinates(hb1, bond.neihbid1, settings.bondSpace, struct);
	var coords2 = stereoUpBondGetCoordinates(hb2, bond.neihbid2, settings.bondSpace, struct);
	var a1 = coords1[0];
	var a2 = coords1[1];
	var a3 = coords2[0];
	var a4 = coords2[1];
	var pathMain = paper.path('M{0},{1}L{2},{3}L{4},{5}L{6},{7}Z',
	tfx(a1.x), tfx(a1.y), tfx(a2.x), tfx(a2.y), tfx(a3.x), tfx(a3.y), tfx(a4.x), tfx(a4.y))
		.attr(styles.lineattr).attr({
			stroke: '#000',
			fill: '#000'
		});
	if (isDouble) {
		var a = hb1.p,
			b = hb2.p,
			n = hb1.norm,
			shift = bond.doubleBondShift;
		var bsp = 1.5 * settings.bondSpace;
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

		return paper.set([pathMain, paper.path(
				'M{0},{1}L{2},{3}', tfx(b1.x), tfx(b1.y), tfx(b2.x), tfx(b2.y))
			.attr(styles.lineattr)]);
	}
	return pathMain;
}

function bondSingleDown(render, hb1, hb2) { // eslint-disable-line max-statements
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var settings = render.settings;
	var paper = render.paper;
	var styles = render.styles;
	var bsp = 0.7 * settings.bondSpace;
	var d = b.sub(a);
	var len = d.length() + 0.2;
	d = d.normalized();
	var interval = 1.2 * settings.lineWidth;
	var nlines = Math.max(Math.floor((len - settings.lineWidth) /
	(settings.lineWidth + interval)), 0) + 2;
	var step = len / (nlines - 1);

	var path = '',
		p,
		q,
		r = a;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * i);
		p = r.addScaled(n, bsp * (i + 0.5) / (nlines - 0.5));
		q = r.addScaled(n, -bsp * (i + 0.5) / (nlines - 0.5));
		path += makeStroke(p, q);
	}
	return paper.path(path)
		.attr(styles.lineattr);
}

function bondSingleEither(render, hb1, hb2) { // eslint-disable-line max-statements
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var settings = render.settings;
	var paper = render.paper;
	var styles = render.styles;
	var bsp = 0.7 * settings.bondSpace;
	var d = b.sub(a);
	var len = d.length();
	d = d.normalized();
	var interval = 0.6 * settings.lineWidth;
	var nlines = Math.max(Math.floor((len - settings.lineWidth) /
	(settings.lineWidth + interval)), 0) + 2;
	var step = len / (nlines - 0.5);

	var path = 'M' + tfx(a.x) + ',' + tfx(a.y),
		r = a;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * (i + 0.5)).addScaled(n,
			((i & 1) ? -1 : +1) * bsp * (i + 0.5) / (nlines - 0.5));
		path += 'L' + tfx(r.x) + ',' + tfx(r.y);
	}
	return paper.path(path)
		.attr(styles.lineattr);
}

function bondDouble(render, hb1, hb2, bond, cisTrans, shiftA, shiftB) { // eslint-disable-line max-params, max-statements
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm,
		shift = cisTrans ? 0 : bond.doubleBondShift;
	var settings = render.settings;
	var paper = render.paper;
	var styles = render.styles;
	var bsp = settings.bondSpace / 2;
	var s1 = bsp,
		s2 = -bsp;
	s1 += shift * bsp;
	s2 += shift * bsp;
	var a2 = a.addScaled(n, s1);
	var b2 = b.addScaled(n, s1);
	var a3 = a.addScaled(n, s2);
	var b3 = b.addScaled(n, s2);

	if (shift > 0) {
		if (shiftA) {
			a2 = a2.addScaled(hb1.dir, settings.bondSpace *
			getBondLineShift(hb1.rightCos, hb1.rightSin));
		}
		if (shiftB) {
			b2 = b2.addScaled(hb1.dir, -settings.bondSpace *
			getBondLineShift(hb2.leftCos, hb2.leftSin));
		}
	} else if (shift < 0) {
		if (shiftA) {
			a3 = a3.addScaled(hb1.dir, settings.bondSpace *
			getBondLineShift(hb1.leftCos, hb1.leftSin));
		}
		if (shiftB) {
			b3 = b3.addScaled(hb1.dir, -settings.bondSpace *
			getBondLineShift(hb2.rightCos, hb2.rightSin));
		}
	}

	return paper.path(cisTrans ?
			'M{0},{1}L{6},{7}M{4},{5}L{2},{3}' :
			'M{0},{1}L{2},{3}M{4},{5}L{6},{7}',
	tfx(a2.x), tfx(a2.y), tfx(b2.x), tfx(b2.y), tfx(a3.x), tfx(a3.y), tfx(b3.x), tfx(b3.y))
		.attr(styles.lineattr);
}

function bondSingleOrDouble(render, hb1, hb2) { // eslint-disable-line max-statements
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var settings = render.settings;
	var paper = render.paper;
	var styles = render.styles;
	var bsp = settings.bondSpace / 2;

	var nSect = (Vec2.dist(a, b) / (settings.bondSpace + settings.lineWidth)).toFixed() - 0;
	if (!(nSect & 1))
		nSect += 1;
	var path = '',
		pp = a;

	for (var i = 1; i <= nSect; ++i) {
		var pi = Vec2.lc2(a, (nSect - i) / nSect, b, i / nSect);
		if (i & 1) {
			path += makeStroke(pp, pi);
		} else {
			path += makeStroke(pp.addScaled(n, bsp), pi.addScaled(n, bsp));
			path += makeStroke(pp.addScaled(n, -bsp), pi.addScaled(n, -bsp));
		}
		pp = pi;
	}

	return paper.path(path)
		.attr(styles.lineattr);
}

function bondTriple(render, hb1, hb2) {
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var settings = render.settings;
	var paper = render.paper;
	var styles = render.styles;
	var a2 = a.addScaled(n, settings.bondSpace);
	var b2 = b.addScaled(n, settings.bondSpace);
	var a3 = a.addScaled(n, -settings.bondSpace);
	var b3 = b.addScaled(n, -settings.bondSpace);
	return paper.path(makeStroke(a, b) + makeStroke(a2, b2) + makeStroke(a3, b3))
		.attr(styles.lineattr);
}

function bondAromatic(render, hb1, hb2, bondShift, shiftA, shiftB) {  // eslint-disable-line max-params
	var paper = render.paper;
	var settings = render.settings;
	var styles = render.styles;
	var paths = aromaticBondPaths(hb1, hb2, bondShift,
	                              shiftA, shiftB, settings.bondSpace);
	var l1 = paper.path(paths[0]).attr(styles.lineattr);
	var l2 = paper.path(paths[1]).attr(styles.lineattr);
	(bondShift > 0 ? l1 : l2).attr({ 'stroke-dasharray': '- ' });
	return paper.set([l1, l2]);
}

function bondSingleOrAromatic(render, hb1, hb2, bondShift, shiftA, shiftB) {  // eslint-disable-line max-params
	var paper = render.paper;
	var settings = render.settings;
	var styles = render.styles;
	var dash = dashdotPattern.map(function (v) {
		return v * settings.scaleFactor;
	});
	var paths = aromaticBondPaths(hb1, hb2, bondShift,
	                              shiftA, shiftB, settings.bondSpace,
	                              bondShift > 0 ? 1 : 2, dash);
	var l1 = paper.path(paths[0]).attr(styles.lineattr);
	var l2 = paper.path(paths[1]).attr(styles.lineattr);
	// dotted line doesn't work in Chrome, render manually instead (see rnd.dashedPath)
	//	(shift > 0 ? l1 : l2).attr({
	//		'stroke-dasharray':'-.'
	//	});
	return paper.set([l1, l2]);
}

function bondDoubleOrAromatic(render, hb1, hb2, bondShift, shiftA, shiftB) {  // eslint-disable-line max-params
	var paper = render.paper;
	var settings = render.settings;
	var styles = render.styles;
	var dash = dashdotPattern.map(function (v) {
		return v * settings.scaleFactor;
	});
	var paths = aromaticBondPaths(hb1, hb2, bondShift,
	                              shiftA, shiftB, settings.bondSpace,
	                              3, dash);
	var l1 = paper.path(paths[0]).attr(styles.lineattr);
	var l2 = paper.path(paths[1]).attr(styles.lineattr);
	// dotted line doesn't work in Chrome, render manually instead (see rnd.dashedPath)
	//	l1.attr({'stroke-dasharray':'-.'});
	//	l2.attr({'stroke-dasharray':'-.'});
	return paper.set([l1, l2]);
}

function bondAny(render, hb1, hb2) {
	var a = hb1.p,
		b = hb2.p;
	var paper = render.paper;
	var styles = render.styles;
	return paper.path(makeStroke(a, b))
		.attr(styles.lineattr).attr({ 'stroke-dasharray': '- ' });
}

function reactingCenter(render, bond, hb1, hb2) {
	var a = hb1.p,
		b = hb2.p;
	var c = b.add(a).scaled(0.5);
	var d = b.sub(a).normalized();
	var n = d.rotateSC(1, 0);

	var paper = render.paper;
	var styles = render.styles;
	var settings = render.settings;

	var p = [];

	var lw = settings.lineWidth,
		bs = settings.bondSpace / 2;
	var alongIntRc = lw, // half interval along for CENTER
		alongIntMadeBroken = 2 * lw, // half interval between along for MADE_OR_BROKEN
		alongSz = 1.5 * bs, // half size along for CENTER
		acrossInt = 1.5 * bs, // half interval across for CENTER
		acrossSz = 3.0 * bs, // half size across for all
		tiltTan = 0.2; // tangent of the tilt angle

	switch (bond.b.reactingCenterStatus) {
	case Struct.Bond.PATTERN.REACTING_CENTER.NOT_CENTER: // X
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz));
		p.push(c.addScaled(n, acrossSz).addScaled(d, -tiltTan * acrossSz));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, tiltTan * acrossSz));
		break;
	case Struct.Bond.PATTERN.REACTING_CENTER.CENTER:  // #
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz).addScaled(d, alongIntRc));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz).addScaled(d, alongIntRc));
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz).addScaled(d, -alongIntRc));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz).addScaled(d, -alongIntRc));
		p.push(c.addScaled(d, alongSz).addScaled(n, acrossInt));
		p.push(c.addScaled(d, -alongSz).addScaled(n, acrossInt));
		p.push(c.addScaled(d, alongSz).addScaled(n, -acrossInt));
		p.push(c.addScaled(d, -alongSz).addScaled(n, -acrossInt));
		break;
//	case Bond.PATTERN.REACTING_CENTER.UNCHANGED:  // o
//		//draw a circle
//		break;
	case Struct.Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN:
		p.push(c.addScaled(n, acrossSz).addScaled(d, alongIntMadeBroken));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, alongIntMadeBroken));
		p.push(c.addScaled(n, acrossSz).addScaled(d, -alongIntMadeBroken));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -alongIntMadeBroken));
		break;
	case Struct.Bond.PATTERN.REACTING_CENTER.ORDER_CHANGED:
		p.push(c.addScaled(n, acrossSz));
		p.push(c.addScaled(n, -acrossSz));
		break;
	case Struct.Bond.PATTERN.REACTING_CENTER.MADE_OR_BROKEN_AND_CHANGED:
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

	var pathdesc = '';
	for (var i = 0; i < p.length / 2; ++i)
		/* eslint-disable no-mixed-operators*/
		pathdesc += makeStroke(p[2 * i], p[2 * i + 1]);
		/* eslint-enable no-mixed-operators*/
	return paper.path(pathdesc).attr(styles.lineattr);
}

function topologyMark(render, bond, hb1, hb2) { // eslint-disable-line max-statements
	var mark = null;

	if (bond.b.topology == Struct.Bond.PATTERN.TOPOLOGY.RING)
		mark = 'rng';
	else if (bond.b.topology == Struct.Bond.PATTERN.TOPOLOGY.CHAIN)
		mark = 'chn';
	else
		return null;

	var paper = render.paper;
	var settings = render.settings;

	var a = hb1.p,
		b = hb2.p;
	var c = b.add(a).scaled(0.5);
	var d = b.sub(a).normalized();
	var n = d.rotateSC(1, 0);
	var fixed = settings.lineWidth;
	if (bond.doubleBondShift > 0)
		n = n.scaled(-bond.doubleBondShift);
	else if (bond.doubleBondShift == 0)
		fixed += settings.bondSpace / 2;

	var s = new Vec2(2, 1).scaled(settings.bondSpace);
	if (bond.b.type == Struct.Bond.PATTERN.TYPE.TRIPLE)
		fixed += settings.bondSpace;
	var p = c.add(new Vec2(n.x * (s.x + fixed), n.y * (s.y + fixed)));
	var path = paper.text(p.x, p.y, mark)
		.attr({
			'font': settings.font,
			'font-size': settings.fontszsub,
			'fill': '#000'
		});
	var rbb = util.relBox(path.getBBox());
	recenterText(path, rbb);
	return path;
}

function radicalCap(render, p) {
	var settings = render.settings;
	var paper = render.paper;
	var s = settings.lineWidth * 0.9;
	var dw = s,
		dh = 2 * s;
	return paper.path('M{0},{1}L{2},{3}L{4},{5}',
	tfx(p.x - dw), tfx(p.y + dh), tfx(p.x), tfx(p.y), tfx(p.x + dw), tfx(p.y + dh))
		.attr({
			'stroke': '#000',
			'stroke-width': settings.lineWidth * 0.7,
			'stroke-linecap': 'square',
			'stroke-linejoin': 'miter'
		});
}

function radicalBullet(render, p) {
	var settings = render.settings;
	var paper = render.paper;
	return paper.circle(p.x, p.y, settings.lineWidth)
		.attr({
			stroke: null,
			fill: '#000'
		});
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

function makeStroke(a, b) {
	return 'M' + tfx(a.x) + ',' + tfx(a.y) +
		'L' + tfx(b.x) + ',' + tfx(b.y) + '	';
}

function getBondLineShift(cos, sin) {
	if (sin < 0 || Math.abs(cos) > 0.9)
		return 0;
	return sin / (1 - cos);
}

function dashedPath(p0, p1, dash) {
	var t0 = 0;
	var t1 = Vec2.dist(p0, p1);
	var d = Vec2.diff(p1, p0).normalized();
	var black = true;
	var path = '';
	var i = 0;

	while (t0 < t1) {
		var len = dash[i % dash.length];
		var t2 = t0 + Math.min(len, t1 - t0);
		if (black)
			path += 'M ' + p0.addScaled(d, t0).coordStr() + ' L ' + p0.addScaled(d, t2).coordStr();
		t0 += len;
		black = !black;
		i++;
	}
	return path;
}

function aromaticBondPaths(hb1, hb2, shift, shiftA, shiftB, bondSpace, mask, dash) { // eslint-disable-line max-params, max-statements
	var a = hb1.p,
		b = hb2.p,
		n = hb1.norm;
	var bsp = bondSpace / 2;
	var s1 = bsp,
		s2 = -bsp;
	s1 += shift * bsp;
	s2 += shift * bsp;
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
	var l1 = dash && (mask & 1) ? dashedPath(a2, b2, dash) : makeStroke(a2, b2);
	var l2 = dash && (mask & 2) ? dashedPath(a3, b3, dash) : makeStroke(a3, b3);

	return [l1, l2];
}

function recenterText(path, rbb) {
	// TODO: find a better way
	if (Raphael.vml) { // dirty hack
		var gap = rbb.height * 0.16;
		path.translateAbs(0, gap);
		rbb.y += gap;
	}
}

module.exports = {
	recenterText: recenterText,
	arrow: arrow,
	plus: plus,
	bondSingle: bondSingle,
	bondSingleUp: bondSingleUp,
	bondSingleStereoBold: bondSingleStereoBold,
	bondSingleDown: bondSingleDown,
	bondSingleEither: bondSingleEither,
	bondDouble: bondDouble,
	bondSingleOrDouble: bondSingleOrDouble,
	bondTriple: bondTriple,
	bondAromatic: bondAromatic,
	bondSingleOrAromatic: bondSingleOrAromatic,
	bondDoubleOrAromatic: bondDoubleOrAromatic,
	bondAny: bondAny,
	reactingCenter: reactingCenter,
	topologyMark: topologyMark,
	radicalCap: radicalCap,
	radicalBullet: radicalBullet
};
