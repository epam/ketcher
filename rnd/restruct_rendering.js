/****************************************************************************
 * Copyright (C) 2009-2010 GGA Software Services LLC
 *
 * This file may be distributed and/or modified under the terms of the
 * GNU Affero General Public License version 3 as published by the Free
 * Software Foundation and appearing in the file LICENSE.GPL included in
 * the packaging of this file.
 *
 * This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
 * WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 ***************************************************************************/

if (!window.rnd || !rnd.ReStruct)
	throw new Error("MolData should be defined first");

function tfx(v) {
	return (v-0).toFixed(8);
}

rnd.relBox = function (box) {
    return {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
    };
}

rnd.ReStruct.prototype.drawArrow = function (a, b)
{
	var width = 5, length = 7;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{1}L{2},{3}L{4},{5}M{2},{3}L{4},{6}", tfx(a.x), tfx(a.y), tfx(b.x), tfx(b.y), tfx(b.x - length), tfx(b.y - width), tfx(b.y + width))
	.attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawPlus = function (c)
{
	var s = this.render.scale/5;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{4}L{0},{5}M{2},{1}L{3},{1}", tfx(c.x), tfx(c.y), tfx(c.x - s), tfx(c.x + s), tfx(c.y - s), tfx(c.y + s))
	.attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawBondSingle = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path(rnd.ReStruct.makeStroke(a, b))
	.attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawBondSingleUp = function (hb1, hb2, bond)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm;
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
	var bsp = 0.7 * settings.bondSpace;
	var b2 = b.addScaled(n, bsp);
	var b3 = b.addScaled(n, -bsp);
	if (bond.neihbid2 >= 0) { // if the end is shared with another up-bond heading this way
	    var coords = this.stereoUpBondGetCoordinates(hb2, bond.neihbid2);
	    b2 = coords[0];
	    b3 = coords[1];
	}
	return paper.path("M{0},{1}L{2},{3}L{4},{5}Z",
		tfx(a.x), tfx(a.y), tfx(b2.x), tfx(b2.y), tfx(b3.x), tfx(b3.y))
	.attr(styles.lineattr).attr({
		'fill':'#000'
	});
};

rnd.ReStruct.prototype.drawVec = function (a, dir, color, len) {
    var settings = this.render.settings;
    var paper = this.render.paper;
    var styles = this.render.styles;
    var bsp = settings.bondSpace;
    var b = a.addScaled(dir, len || 3*bsp);
    return paper.path("M{0},{1}L{2},{3}",
	    tfx(a.x), tfx(a.y), tfx(b.x), tfx(b.y))
	    .attr(styles.lineattr).attr({
	'stroke':(color || '#0F0')
    });
};

rnd.ReStruct.prototype.stereoUpBondGetCoordinates = function(hb, neihbid)
{
    var bsp = this.render.settings.bondSpace;
    var neihb = this.molecule.halfBonds.get(neihbid);
    var cos = util.Vec2.dot(hb.dir, neihb.dir);
    var sin = util.Vec2.cross(hb.dir, neihb.dir);
    var cosHalf = Math.sqrt(0.5 * (1 - cos));
    var biss = neihb.dir.rotateSC((sin >= 0 ? -1 : 1) * cosHalf, Math.sqrt(0.5 * (1 + cos)));

    var denom_add = 0.3;
    var scale = 0.7;
    var a1 = hb.p.addScaled(biss, scale * bsp / (cosHalf + denom_add));
    var a2 = hb.p.addScaled(biss.negated(), scale * bsp / (cosHalf + denom_add));
    return sin > 0 ? [a1, a2] : [a2, a1];
};

rnd.ReStruct.prototype.drawBondSingleStereoBold = function(hb1, hb2, bond, isDouble)
{
    var paper = this.render.paper;
    var settings = this.render.settings;
    var styles = this.render.styles;
    var coords1 = this.stereoUpBondGetCoordinates(hb1, bond.neihbid1);
    var coords2 = this.stereoUpBondGetCoordinates(hb2, bond.neihbid2);
    var a1 = coords1[0];
    var a2 = coords1[1];
    var a3 = coords2[0];
    var a4 = coords2[1];
    var pathMain = paper.path("M{0},{1}L{2},{3}L{4},{5}L{6},{7}Z",
	    tfx(a1.x), tfx(a1.y), tfx(a2.x), tfx(a2.y), tfx(a3.x), tfx(a3.y), tfx(a4.x), tfx(a4.y))
	    .attr(styles.lineattr).attr({
	'stroke': '#000',
	'fill': '#000'
    });
    if (isDouble) {
	var a = hb1.p, b = hb2.p, n = hb1.norm, shift = bond.doubleBondShift;
	var bsp = 1.5 * settings.bondSpace;
	var b1 = a.addScaled(n, bsp * shift);
	var b2 = b.addScaled(n, bsp * shift);
	var shiftA = !this.atoms.get(hb1.begin).showLabel;
	var shiftB = !this.atoms.get(hb2.begin).showLabel;
	if (shift > 0) {
	    if (shiftA)
		b1 = b1.addScaled(hb1.dir, bsp * this.getBondLineShift(hb1.rightCos, hb1.rightSin));
	    if (shiftB)
		b2 = b2.addScaled(hb1.dir, -bsp * this.getBondLineShift(hb2.leftCos, hb2.leftSin));
	} else if (shift < 0) {
	    if (shiftA)
		b1 = b1.addScaled(hb1.dir, bsp * this.getBondLineShift(hb1.leftCos, hb1.leftSin));
	    if (shiftB)
		b2 = b2.addScaled(hb1.dir, -bsp * this.getBondLineShift(hb2.rightCos, hb2.rightSin));
	}

	return paper.set([pathMain, paper.path(
		    "M{0},{1}L{2},{3}", tfx(b1.x), tfx(b1.y), tfx(b2.x), tfx(b2.y))
		    .attr(styles.lineattr)]);
    }
    return pathMain;
};

rnd.ReStruct.prototype.drawBondSingleDown = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm;
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
	var bsp = 0.7 *settings.bondSpace;
	var d = b.sub(a);
	var len = d.length()+0.2;
	d = d.normalized();
	var interval = 1.2 * settings.lineWidth;
	var nlines = Math.max(Math.floor((len - settings.lineWidth) /
		(settings.lineWidth + interval)),0) + 2;
	var step = len / (nlines - 1);

	var path = "", p, q, r = a;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * i);
		p = r.addScaled(n, bsp * (i+0.5) / (nlines - 0.5));
		q = r.addScaled(n, -bsp * (i+0.5) / (nlines - 0.5));
		path += rnd.ReStruct.makeStroke(p, q);
	}
	return paper.path(path)
    .attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawBondSingleEither = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm;
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
	var bsp = 0.7 * settings.bondSpace;
	var d = b.sub(a);
	var len = d.length();
	d = d.normalized();
	var interval = 0.6 * settings.lineWidth;
	var nlines = Math.max(Math.floor((len - settings.lineWidth) /
		(settings.lineWidth + interval)),0) + 2;
	var step = len / (nlines - 0.5);

	var path = 'M' + tfx(a.x) + ',' + tfx(a.y), r = a;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * (i + 0.5)).addScaled(n,
			((i & 1) ? -1 : +1) * bsp * (i + 0.5) / (nlines - 0.5));
		path += 'L' + tfx(r.x) + ',' + tfx(r.y);
	}
	return paper.path(path)
	.attr(styles.lineattr);
};

rnd.ReStruct.prototype.getBondLineShift = function (cos, sin)
{
	if (sin < 0 || Math.abs(cos) > 0.9)
		return 0;
	return sin / (1 - cos);
};

rnd.ReStruct.prototype.drawBondDouble = function (hb1, hb2, bond, cis_trans)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm, shift = cis_trans ? 0 : bond.doubleBondShift;
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
	var bsp = settings.bondSpace / 2;
	var s1 = bsp, s2 = -bsp;
	s1 += shift * bsp;
	s2 += shift * bsp;
	var a2 = a.addScaled(n, s1);
	var b2 = b.addScaled(n, s1);
	var a3 = a.addScaled(n, s2);
	var b3 = b.addScaled(n, s2);

	var shiftA = !this.atoms.get(hb1.begin).showLabel;
	var shiftB = !this.atoms.get(hb2.begin).showLabel;
	if (shift > 0) {
		if (shiftA)
			a2 = a2.addScaled(hb1.dir, settings.bondSpace *
				this.getBondLineShift(hb1.rightCos, hb1.rightSin));
		if (shiftB)
			b2 = b2.addScaled(hb1.dir, -settings.bondSpace *
				this.getBondLineShift(hb2.leftCos, hb2.leftSin));
	} else if (shift < 0) {
		if (shiftA)
			a3 = a3.addScaled(hb1.dir, settings.bondSpace *
				this.getBondLineShift(hb1.leftCos, hb1.leftSin));
		if (shiftB)
			b3 = b3.addScaled(hb1.dir, -settings.bondSpace *
				this.getBondLineShift(hb2.rightCos, hb2.rightSin));
	}

	return paper.path(cis_trans ?
		"M{0},{1}L{6},{7}M{4},{5}L{2},{3}" :
		"M{0},{1}L{2},{3}M{4},{5}L{6},{7}",
		tfx(a2.x), tfx(a2.y), tfx(b2.x), tfx(b2.y), tfx(a3.x), tfx(a3.y), tfx(b3.x), tfx(b3.y))
	.attr(styles.lineattr);
};

rnd.ReStruct.makeStroke = function (a, b) {
	return 'M' + tfx(a.x) + ',' + tfx(a.y) +
		'L' + tfx(b.x) + ',' + tfx(b.y) + '	';
};

rnd.ReStruct.prototype.drawBondSingleOrDouble = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm;
        var render = this.render;
	var settings = render.settings;
	var paper = render.paper;
	var styles = render.styles;
	var bsp = settings.bondSpace / 2;

	var nSect = (util.Vec2.dist(a, b) / (settings.bondSpace + settings.lineWidth)).toFixed()-0;
	if (!(nSect & 1))
		nSect += 1;
	var path = '', pp = a;

	for (var i = 1; i <= nSect; ++i) {
		var pi = util.Vec2.lc2(a, (nSect - i) / nSect, b, i / nSect);
		if (i & 1) {
			path += rnd.ReStruct.makeStroke(pp, pi);
		} else {
			path += rnd.ReStruct.makeStroke(pp.addScaled(n, bsp), pi.addScaled(n, bsp));
			path += rnd.ReStruct.makeStroke(pp.addScaled(n, -bsp), pi.addScaled(n, -bsp));
		}
		pp = pi;
	}

	return paper.path(path)
	.attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawBondTriple = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm;
        var render = this.render;
	var settings = render.settings;
	var paper = render.paper;
	var styles = render.styles;
	var a2 = a.addScaled(n, settings.bondSpace);
	var b2 = b.addScaled(n, settings.bondSpace);
	var a3 = a.addScaled(n, -settings.bondSpace);
	var b3 = b.addScaled(n, -settings.bondSpace);
	return paper.path(rnd.ReStruct.makeStroke(a,b) + rnd.ReStruct.makeStroke(a2,b2) + rnd.ReStruct.makeStroke(a3,b3))
	.attr(styles.lineattr);
};

rnd.dashedPath = function (p0, p1, dash) {
    var t0 = 0;
    var t1 = util.Vec2.dist(p0, p1);
    var d = util.Vec2.diff(p1, p0).normalized();
    var black = true;
    var path = "";
    var i = 0;

    while (t0 < t1) {
        var len = dash[i % dash.length];
        var t2 = t0 + Math.min(len, t1 - t0);
        if (black)
            path += "M " + p0.addScaled(d, t0).coordStr() + " L " + p0.addScaled(d, t2).coordStr();
        t0 += len;
        black = !black;
        i++;
    }
    return path;
}

rnd.ReStruct.prototype.drawBondAromatic = function (hb1, hb2, bond, drawDashLine)
{
	if (!drawDashLine) {
		return this.drawBondSingle(hb1, hb2);
	}
	var shift = bond.doubleBondShift;
	var paper = this.render.paper;
	var paths = this.preparePathsForAromaticBond(hb1, hb2, shift);
	var l1 = paths[0], l2 = paths[1];
	(shift > 0 ? l1 : l2).attr({
		'stroke-dasharray':'- '
	});
	return paper.set([l1,l2]);
};

rnd.dashdotPattern = [0.125,0.125,0.005,0.125];

rnd.ReStruct.prototype.drawBondSingleOrAromatic = function (hb1, hb2, bond)
{
	var shift = bond.doubleBondShift;
	var paper = this.render.paper;
        var scale = this.render.settings.scaleFactor;
        var dash = util.map(rnd.dashdotPattern, function(v){ return v * scale; });
	var paths = this.preparePathsForAromaticBond(hb1, hb2, shift, shift > 0 ? 1 : 2, dash);
	var l1 = paths[0], l2 = paths[1];
// dotted line doesn't work in Chrome, render manually instead (see rnd.dashedPath)
//	(shift > 0 ? l1 : l2).attr({
//		'stroke-dasharray':'-.'
//	});
	return paper.set([l1,l2]);
};

rnd.ReStruct.prototype.preparePathsForAromaticBond = function (hb1, hb2, shift, mask, dash)
{
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
	var a = hb1.p, b = hb2.p, n = hb1.norm;
	var bsp = settings.bondSpace / 2;
	var s1 = bsp, s2 = -bsp;
	s1 += shift * bsp;
	s2 += shift * bsp;
	var a2 = a.addScaled(n, s1);
	var b2 = b.addScaled(n, s1);
	var a3 = a.addScaled(n, s2);
	var b3 = b.addScaled(n, s2);
	var shiftA = !this.atoms.get(hb1.begin).showLabel;
	var shiftB = !this.atoms.get(hb2.begin).showLabel;
	if (shift > 0) {
		if (shiftA)
			a2 = a2.addScaled(hb1.dir, settings.bondSpace *
				this.getBondLineShift(hb1.rightCos, hb1.rightSin));
		if (shiftB)
			b2 = b2.addScaled(hb1.dir, -settings.bondSpace *
				this.getBondLineShift(hb2.leftCos, hb2.leftSin));
	} else if (shift < 0) {
		if (shiftA)
			a3 = a3.addScaled(hb1.dir, settings.bondSpace *
				this.getBondLineShift(hb1.leftCos, hb1.leftSin));
		if (shiftB)
			b3 = b3.addScaled(hb1.dir, -settings.bondSpace *
				this.getBondLineShift(hb2.rightCos, hb2.rightSin));
	}
	var l1 = paper.path(dash && (mask & 1) ? rnd.dashedPath(a2, b2, dash) : rnd.ReStruct.makeStroke(a2, b2)).attr(styles.lineattr);
	var l2 = paper.path(dash && (mask & 2) ? rnd.dashedPath(a3, b3, dash) : rnd.ReStruct.makeStroke(a3, b3)).attr(styles.lineattr);
	return [l1, l2];
};


rnd.ReStruct.prototype.drawBondDoubleOrAromatic = function (hb1, hb2, bond)
{
	var shift = bond.doubleBondShift;
	var paper = this.render.paper;
        var scale = this.render.settings.scaleFactor;
        var dash = util.map(rnd.dashdotPattern, function(v){ return v * scale; });
	var paths = this.preparePathsForAromaticBond(hb1, hb2, shift, 3, dash);
	var l1 = paths[0], l2 = paths[1];
// dotted line doesn't work in Chrome, render manually instead (see rnd.dashedPath)
//	l1.attr({'stroke-dasharray':'-.'});
//	l2.attr({'stroke-dasharray':'-.'});
	return paper.set([l1,l2]);
};

rnd.ReStruct.prototype.drawBondAny = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path(rnd.ReStruct.makeStroke(a,b))
	.attr(styles.lineattr).attr({
		'stroke-dasharray':'- '
	});
};

rnd.ReStruct.prototype.drawReactingCenter = function (bond, hb1, hb2)
{
	var a = hb1.p, b = hb2.p;
	var c = b.add(a).scaled(0.5);
	var d = b.sub(a).normalized();
	var n = d.rotateSC(1, 0);

	var paper = this.render.paper;
	var styles = this.render.styles;
	var settings = this.render.settings;

	var p = [];

	var lw = settings.lineWidth, bs = settings.bondSpace/2;
	var alongIntRc = lw, // half interval along for CENTER
		alongIntMadeBroken = 2 * lw, // half interval between along for MADE_OR_BROKEN
		alongSz = 1.5 * bs, // half size along for CENTER
		acrossInt = 1.5 * bs, // half interval across for CENTER
		acrossSz = 3.0 * bs, // half size across for all
		tiltTan = 0.2; // tangent of the tilt angle

	switch (bond.b.reactingCenterStatus)
	{
	case chem.Struct.BOND.REACTING_CENTER.NOT_CENTER: // X
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz));
		p.push(c.addScaled(n, acrossSz).addScaled(d, -tiltTan * acrossSz));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, tiltTan * acrossSz));
		break;
	case chem.Struct.BOND.REACTING_CENTER.CENTER:  // #
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz).addScaled(d, alongIntRc));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz).addScaled(d, alongIntRc));
		p.push(c.addScaled(n, acrossSz).addScaled(d, tiltTan * acrossSz).addScaled(d, -alongIntRc));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -tiltTan * acrossSz).addScaled(d, -alongIntRc));
		p.push(c.addScaled(d, alongSz).addScaled(n, acrossInt));
		p.push(c.addScaled(d, -alongSz).addScaled(n, acrossInt));
		p.push(c.addScaled(d, alongSz).addScaled(n, -acrossInt));
		p.push(c.addScaled(d, -alongSz).addScaled(n, -acrossInt));
		break;
//	case chem.Struct.BOND.REACTING_CENTER.UNCHANGED:  // o
//		//draw a circle
//		break;
	case chem.Struct.BOND.REACTING_CENTER.MADE_OR_BROKEN:
		p.push(c.addScaled(n, acrossSz).addScaled(d, alongIntMadeBroken));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, alongIntMadeBroken));
		p.push(c.addScaled(n, acrossSz).addScaled(d, -alongIntMadeBroken));
		p.push(c.addScaled(n, -acrossSz).addScaled(d, -alongIntMadeBroken));
		break;
	case chem.Struct.BOND.REACTING_CENTER.ORDER_CHANGED:
		p.push(c.addScaled(n, acrossSz));
		p.push(c.addScaled(n, -acrossSz));
		break;
	case chem.Struct.BOND.REACTING_CENTER.MADE_OR_BROKEN_AND_CHANGED:
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

	var pathdesc = "";
	for (var i = 0; i < p.length / 2; ++i)
		pathdesc += rnd.ReStruct.makeStroke(p[2 * i], p[2 * i + 1]);
	return paper.path(pathdesc).attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawTopologyMark = function (bond, hb1, hb2)
{
	var topologyMark = null;

	if (bond.b.topology == chem.Struct.BOND.TOPOLOGY.RING)
		topologyMark = "rng";
	else if (bond.b.topology == chem.Struct.BOND.TOPOLOGY.CHAIN)
		topologyMark = "chn";
	else
		return null;

	var paper = this.render.paper;
	var settings = this.render.settings;

	var a = hb1.p, b = hb2.p;
	var c = b.add(a).scaled(0.5);
	var d = b.sub(a).normalized();
	var n = d.rotateSC(1, 0);
	var fixed = settings.lineWidth;
	if (bond.doubleBondShift > 0)
		n = n.scaled(-bond.doubleBondShift);
	else if (bond.doubleBondShift == 0)
		fixed += settings.bondSpace / 2;

	var s = new util.Vec2(2, 1).scaled(settings.bondSpace);
	if (bond.b.type == chem.Struct.BOND.TYPE.TRIPLE)
		fixed += settings.bondSpace;
	var p = c.add(new util.Vec2(n.x * (s.x + fixed), n.y * (s.y + fixed)));
	var path = paper.text(p.x, p.y, topologyMark)
		.attr({
			'font' : settings.font,
			'font-size' : settings.fontszsub,
			'fill' : '#000'
		});
	var rbb = rnd.relBox(path.getBBox());
	this.centerText(path, rbb);
	return path;
};

rnd.ReStruct.prototype.drawBond = function (bond, hb1, hb2)
{
	var path = null;
        var molecule = this.molecule;
	switch (bond.b.type)
	{
		case chem.Struct.BOND.TYPE.SINGLE:
			switch (bond.b.stereo) {
				case chem.Struct.BOND.STEREO.UP:
		    this.findIncomingUpBonds(hb1.bid, bond);
		    if (bond.boldStereo && bond.neihbid1 >= 0 && bond.neihbid2 >= 0)
			path = this.drawBondSingleStereoBold(hb1, hb2, bond);
		    else
					path = this.drawBondSingleUp(hb1, hb2, bond);
					break;
				case chem.Struct.BOND.STEREO.DOWN:
					path = this.drawBondSingleDown(hb1, hb2, bond);
					break;
				case chem.Struct.BOND.STEREO.EITHER:
					path = this.drawBondSingleEither(hb1, hb2, bond);
					break;
				default:
					path = this.drawBondSingle(hb1, hb2);
					break;
			}
			break;
		case chem.Struct.BOND.TYPE.DOUBLE:
		    this.findIncomingUpBonds(hb1.bid, bond);
	    if (bond.b.stereo === chem.Struct.BOND.STEREO.NONE && bond.boldStereo
		    && bond.neihbid1 >= 0 && bond.neihbid2 >= 0)
			path = this.drawBondSingleStereoBold(hb1, hb2, bond, true);
		    else
			path = this.drawBondDouble(hb1, hb2, bond,
			bond.b.stereo === chem.Struct.BOND.STEREO.CIS_TRANS);
			break;
		case chem.Struct.BOND.TYPE.TRIPLE:
			path = this.drawBondTriple(hb1, hb2, bond);
			break;
		case chem.Struct.BOND.TYPE.AROMATIC:
			var inAromaticLoop = (hb1.loop >= 0 && molecule.loops.get(hb1.loop).aromatic) ||
				(hb2.loop >= 0 && molecule.loops.get(hb2.loop).aromatic);
			path = this.drawBondAromatic(hb1, hb2, bond, !inAromaticLoop);
			break;
		case chem.Struct.BOND.TYPE.SINGLE_OR_DOUBLE:
			path = this.drawBondSingleOrDouble(hb1, hb2, bond);
			break;
		case chem.Struct.BOND.TYPE.SINGLE_OR_AROMATIC:
			path = this.drawBondSingleOrAromatic(hb1, hb2, bond);
			break;
		case chem.Struct.BOND.TYPE.DOUBLE_OR_AROMATIC:
			path = this.drawBondDoubleOrAromatic(hb1, hb2, bond);
			break;
		case chem.Struct.BOND.TYPE.ANY:
			path = this.drawBondAny(hb1, hb2, bond);
			break;
		default:
			throw new Error("Bond type " + bond.b.type + " not supported");
	}
	return path;
};

rnd.ReStruct.prototype.radicalCap = function (p)
{
	var settings = this.render.settings;
	var paper = this.render.paper;
	var s = settings.lineWidth * 0.9;
	var dw = s, dh = 2 * s;
	return paper.path("M{0},{1}L{2},{3}L{4},{5}",
		tfx(p.x - dw), tfx(p.y + dh), tfx(p.x), tfx(p.y), tfx(p.x + dw), tfx(p.y + dh))
	.attr({
		'stroke': '#000',
		'stroke-width': settings.lineWidth * 0.7,
		'stroke-linecap' : 'square',
		'stroke-linejoin' : 'miter'
	});
};

rnd.ReStruct.prototype.radicalBullet = function (p)
{
	var settings = this.render.settings;
	var paper = this.render.paper;
	return paper.circle(p.x, p.y, settings.lineWidth)
	.attr({
		stroke: null,
		fill: '#000'
	});
};

rnd.ReStruct.prototype.centerText = function (path, rbb)
{
	// TODO: find a better way
	if (this.render.paper.raphael.vml) {
		this.pathAndRBoxTranslate(path, rbb, 0, rbb.height * 0.16); // dirty hack
	}
};

rnd.ReStruct.prototype.showItemSelection = function (id, item, visible)
{
	var exists = (item.selectionPlate != null) && !item.selectionPlate.removed;
    // rbalabanov: here is temporary fix for "drag issue" on iPad
    //BEGIN
    exists = exists && (!('hiddenPaths' in rnd.ReStruct.prototype) || rnd.ReStruct.prototype.hiddenPaths.indexOf(item.selectionPlate) < 0);
    //END
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			item.selectionPlate = item.makeSelectionPlate(this, paper, styles);
			this.addReObjectPath('selection-plate', item.visel, item.selectionPlate);
		}
		if (item.selectionPlate) item.selectionPlate.show(); // TODO [RB] review
	} else {
		if (exists)
			if (item.selectionPlate) item.selectionPlate.hide(); // TODO [RB] review
	}
};

rnd.ReStruct.prototype.pathAndRBoxTranslate = function (path, rbb, x, y)
{
	path.translateAbs(x, y);
        rbb.x += x;
        rbb.y += y;
};

var markerColors = ['black', 'cyan', 'magenta', 'red', 'green', 'blue', 'green'];

rnd.ReStruct.prototype.showLabels = function ()
{
	var render = this.render;
	var settings = render.settings;
    var styles = render.styles;
	var opt = render.opt;
	var paper = render.paper;
	var delta = 0.5 * settings.lineWidth;
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);

                var ps = render.ps(atom.a.pp);
		var index = null;
		if (opt.showAtomIds) {
			index = {};
			index.text = aid.toString();
			index.path = paper.text(ps.x, ps.y, index.text)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontszsub,
				'fill' : '#070'
			});
			index.rbb = rnd.relBox(index.path.getBBox());
			this.centerText(index.path, index.rbb);
			this.addReObjectPath('indices', atom.visel, index.path, ps);
		}
                atom.setHighlight(atom.highlight, render);

                var color = '#000000';
		if (atom.showLabel)
		{
			var rightMargin = 0, leftMargin = 0;
			// label
			var label = {};
			if (atom.a.atomList != null) {
				label.text = atom.a.atomList.label();
            } else if (atom.a.label == 'R#' && atom.a.rglabel != null) {
                label.text = '';
                for (var rgi = 0; rgi < 32; rgi++) {
                    if (atom.a.rglabel & (1 << rgi)) label.text += ('R' + (rgi + 1).toString());
                }
                if (label.text == '') label = 'R#'; // for structures that missed 'M  RGP' tag in molfile
			} else {
				label.text = atom.a.label;
				if (opt.atomColoring) {
					var elem = chem.Element.getElementByLabel(label.text);
					if (elem)
						color = chem.Element.elements.get(elem).color;
				}
			}
			label.path = paper.text(ps.x, ps.y, label.text)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontsz,
				'fill' : color
			});
			label.rbb = rnd.relBox(label.path.getBBox());
			this.centerText(label.path, label.rbb);
			if (atom.a.atomList != null)
				this.pathAndRBoxTranslate(label.path, label.rbb, (atom.hydrogenOnTheLeft ? -1 : 1) * (label.rbb.width - label.rbb.height) / 2, 0);
			this.addReObjectPath('data', atom.visel, label.path, ps, true);
			rightMargin = label.rbb.width / 2;
			leftMargin = -label.rbb.width / 2;
			var implh = Math.floor(atom.a.implicitH);
			var isHydrogen = label.text == 'H';
			var hydrogen = {}, hydroIndex = null;
			var hydrogenLeft = atom.hydrogenOnTheLeft;
			if (isHydrogen && implh > 0) {
				hydroIndex = {};
				hydroIndex.text = (implh+1).toString();
				hydroIndex.path =
				paper.text(ps.x, ps.y, hydroIndex.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontszsub,
					'fill' : color
				});
				hydroIndex.rbb = rnd.relBox(hydroIndex.path.getBBox());
				this.centerText(hydroIndex.path, hydroIndex.rbb);
				this.pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
					rightMargin + 0.5 * hydroIndex.rbb.width + delta,
					0.2 * label.rbb.height);
				rightMargin += hydroIndex.rbb.width + delta;
				this.addReObjectPath('data',atom.visel, hydroIndex.path, ps, true);
			}

			var radical = {};
			if (atom.a.radical != 0)
			{
				var hshift;
				switch (atom.a.radical)
				{
					case 1:
						radical.path = paper.set();
						hshift = 1.6 * settings.lineWidth;
						radical.path.push(
							this.radicalBullet(ps.add(new util.Vec2(-hshift, 0))),
							this.radicalBullet(ps.add(new util.Vec2(hshift, 0))));
						radical.path.attr('fill', color);
						break;
					case 2:
						radical.path = this.radicalBullet(ps)
						.attr('fill', color);
						break;
					case 3:
						radical.path = paper.set();
						hshift = 1.6 * settings.lineWidth;
						radical.path.push(
							this.radicalCap(ps.add(new util.Vec2(-hshift, 0))),
							this.radicalCap(ps.add(new util.Vec2(hshift, 0))));
						radical.path.attr('stroke', color);
						break;
				}
				radical.rbb = rnd.relBox(radical.path.getBBox());
				var vshift = -0.5 * (label.rbb.height + radical.rbb.height);
				if (atom.a.radical == 3)
					vshift -= settings.lineWidth/2;
				this.pathAndRBoxTranslate(radical.path, radical.rbb,
					0, vshift);
				this.addReObjectPath('data', atom.visel, radical.path, ps, true);
			}

			var isotope = {};
			if (atom.a.isotope != 0)
			{
				isotope.text = atom.a.isotope.toString();
				isotope.path = paper.text(ps.x, ps.y, isotope.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontszsub,
					'fill' : color
				});
				isotope.rbb = rnd.relBox(isotope.path.getBBox());
				this.centerText(isotope.path, isotope.rbb);
				this.pathAndRBoxTranslate(isotope.path, isotope.rbb,
					leftMargin - 0.5 * isotope.rbb.width - delta,
					-0.3 * label.rbb.height);
				leftMargin -= isotope.rbb.width + delta;
				this.addReObjectPath('data', atom.visel, isotope.path, ps, true);
			}
			if (!isHydrogen && implh > 0 && !render.opt.hideImplicitHydrogen)
			{
				hydrogen.text = 'H';
				hydrogen.path = paper.text(ps.x, ps.y, hydrogen.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontsz,
					'fill' : color
				});
				hydrogen.rbb = rnd.relBox(hydrogen.path.getBBox());
				this.centerText(hydrogen.path, hydrogen.rbb);
				if (!hydrogenLeft) {
					this.pathAndRBoxTranslate(hydrogen.path, hydrogen.rbb,
						rightMargin + 0.5 * hydrogen.rbb.width + delta, 0);
					rightMargin += hydrogen.rbb.width + delta;
				}
				if (implh > 1) {
					hydroIndex = {};
					hydroIndex.text = implh.toString();
					hydroIndex.path =
					paper.text(ps.x, ps.y, hydroIndex.text)
					.attr({
						'font' : settings.font,
						'font-size' : settings.fontszsub,
						'fill' : color
					});
					hydroIndex.rbb = rnd.relBox(hydroIndex.path.getBBox());
					this.centerText(hydroIndex.path, hydroIndex.rbb);
					if (!hydrogenLeft) {
						this.pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
							rightMargin + 0.5 * hydroIndex.rbb.width + delta,
							0.2 * label.rbb.height);
						rightMargin += hydroIndex.rbb.width + delta;
					}
				}
				if (hydrogenLeft) {
					if (hydroIndex != null) {
						this.pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
							leftMargin - 0.5 * hydroIndex.rbb.width - delta,
							0.2 * label.rbb.height);
						leftMargin -= hydroIndex.rbb.width + delta;
					}
					this.pathAndRBoxTranslate(hydrogen.path, hydrogen.rbb,
						leftMargin - 0.5 * hydrogen.rbb.width - delta, 0);
					leftMargin -= hydrogen.rbb.width + delta;
				}
				this.addReObjectPath('data', atom.visel, hydrogen.path, ps, true);
				if (hydroIndex != null)
					this.addReObjectPath('data', atom.visel, hydroIndex.path, ps, true);
			}

			var charge = {};
			if (atom.a.charge != 0)
			{
				charge.text = "";
				var absCharge = Math.abs(atom.a.charge);
				if (absCharge != 1)
					charge.text = absCharge.toString();
				if (atom.a.charge < 0)
					charge.text += "\u2013";
				else
					charge.text += "+";

				charge.path = paper.text(ps.x, ps.y, charge.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontszsub,
					'fill' : color
				});
				charge.rbb = rnd.relBox(charge.path.getBBox());
				this.centerText(charge.path, charge.rbb);
				this.pathAndRBoxTranslate(charge.path, charge.rbb,
					rightMargin + 0.5 * charge.rbb.width + delta,
					-0.3 * label.rbb.height);
				rightMargin += charge.rbb.width + delta;
				this.addReObjectPath('data', atom.visel, charge.path, ps, true);
			}

			var valence = {};
			var mapValence = {
				0: '0',
				1: 'I',
				2: 'II',
				3: 'III',
				4: 'IV',
				5: 'V',
				6: 'VI',
				7: 'VII',
				8: 'VIII',
				9: 'IX',
				10: 'X',
				11: 'XI',
				12: 'XII',
				13: 'XIII',
				14: 'XIV'
			};
			if (atom.a.explicitValence >= 0)
			{
				valence.text = mapValence[atom.a.explicitValence];
				if (!valence.text)
					throw new Error("invalid valence " + atom.a.explicitValence.toString());
				valence.text = '(' + valence.text + ')';
				valence.path = paper.text(ps.x, ps.y, valence.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontszsub,
					'fill' : color
				});
				valence.rbb = rnd.relBox(valence.path.getBBox());
				this.centerText(valence.path, valence.rbb);
				this.pathAndRBoxTranslate(valence.path, valence.rbb,
					rightMargin + 0.5 * valence.rbb.width + delta,
					-0.3 * label.rbb.height);
				rightMargin += valence.rbb.width + delta;
				this.addReObjectPath('data', atom.visel, valence.path, ps, true);
			}

			if (atom.a.badConn && opt.showValenceWarnings) {
				var warning = {};
				var y = ps.y + label.rbb.height / 2 + delta;
				warning.path = paper.path("M{0},{1}L{2},{3}",
					tfx(ps.x + leftMargin), tfx(y), tfx(ps.x + rightMargin), tfx(y))
				.attr(this.render.styles.lineattr)
				.attr({
					'stroke':'#F00'
				});
				warning.rbb = rnd.relBox(warning.path.getBBox());
				this.addReObjectPath('warnings', atom.visel, warning.path, ps, true);
			}
			if (index)
				this.pathAndRBoxTranslate(index.path, index.rbb,
					-0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
					0.3 * label.rbb.height);
		}

        var lsb = this.bisectLargestSector(atom);

        var asterisk = Prototype.Browser.IE ? '*' : '∗';
        if (atom.a.attpnt) {
            var i, j;
            for (i = 0, c = 0; i < 4; ++i) {
                var attpntText = "";
                if (atom.a.attpnt & (1 << i)) {
                    if (attpntText.length > 0)
                        attpntText += ' ';
                    attpntText += asterisk;
                    for (j = 0; j < (i == 0 ? 0 : (i + 1)); ++j) {
                        attpntText += "'";
                    }
                    var pos0 = new util.Vec2(ps);
                    var pos1 = ps.addScaled(lsb, 0.7 * settings.scaleFactor);

                    var attpntPath1 = paper.text(pos1.x, pos1.y, attpntText)
                        .attr({
                            'font' : settings.font,
                            'font-size' : settings.fontsz,
                            'fill' : color
                        });
                    var attpntRbb = rnd.relBox(attpntPath1.getBBox());
                    this.centerText(attpntPath1, attpntRbb);

                    var lsbn = lsb.negated();
                    pos1 = pos1.addScaled(lsbn, util.Vec2.shiftRayBox(pos1, lsbn, util.Box2Abs.fromRelBox(attpntRbb)) + settings.lineWidth/2);
                    pos0 = this.shiftBondEnd(atom, pos0, lsb, settings.lineWidth);
                    var n = lsb.rotateSC(1, 0);
                    var arrowLeft = pos1.addScaled(n, 0.05 * settings.scaleFactor).addScaled(lsbn, 0.09 * settings.scaleFactor);
                    var arrowRight = pos1.addScaled(n, -0.05 * settings.scaleFactor).addScaled(lsbn, 0.09 * settings.scaleFactor);
                    var attpntPath = paper.set();
                    attpntPath.push(
                        attpntPath1,
                        paper.path("M{0},{1}L{2},{3}M{4},{5}L{2},{3}L{6},{7}", tfx(pos0.x), tfx(pos0.y), tfx(pos1.x), tfx(pos1.y), tfx(arrowLeft.x), tfx(arrowLeft.y), tfx(arrowRight.x), tfx(arrowRight.y))
                            .attr(styles.lineattr).attr({'stroke-width': settings.lineWidth/2})
                    );
                    this.addReObjectPath('indices', atom.visel, attpntPath, ps);
                    lsb = lsb.rotate(Math.PI/6);
                }
            }
        }


		var aamText = "";
		if (atom.a.aam > 0) {
			aamText += atom.a.aam;
		}
		if (atom.a.invRet > 0) {
			if (aamText.length > 0)
				aamText += ",";
			if (atom.a.invRet == 1)
				aamText += 'Inv';
			else if (atom.a.invRet == 2)
				aamText += 'Ret';
			else
				throw new Error('Invalid value for the invert/retain flag');
		}

            var queryAttrsText = "";
            if (atom.a.ringBondCount != 0) {
                if (atom.a.ringBondCount > 0)
                    queryAttrsText += "rb" + atom.a.ringBondCount.toString();
                else if (atom.a.ringBondCount == -1)
                    queryAttrsText += "rb0";
                else if (atom.a.ringBondCount == -2)
                    queryAttrsText += "rb*";
                else
                    throw new Error("Ring bond count invalid");
            }
            if (atom.a.substitutionCount != 0) {
                if (queryAttrsText.length > 0)
                    queryAttrsText += ",";

                if (atom.a.substitutionCount > 0)
                    queryAttrsText += "s" + atom.a.substitutionCount.toString();
                else if (atom.a.substitutionCount == -1)
                    queryAttrsText += "s0";
                else if (atom.a.substitutionCount == -2)
                    queryAttrsText += "s*";
                else
                    throw new Error("Substitution count invalid");
            }
            if (atom.a.unsaturatedAtom > 0) {
                if (queryAttrsText.length > 0)
                    queryAttrsText += ",";

                if (atom.a.unsaturatedAtom == 1)
                    queryAttrsText += "u";
                else
                    throw new Error("Unsaturated atom invalid value");
            }
            if (atom.a.hCount > 0) {
                if (queryAttrsText.length > 0)
                    queryAttrsText += ",";

                queryAttrsText += "H" + (atom.a.hCount - 1).toString();
            }


            if (atom.a.exactChangeFlag > 0) {
                if (aamText.length > 0)
                    aamText += ",";
                if (atom.a.exactChangeFlag == 1)
                    aamText += 'ext';
                else
                    throw new Error('Invalid value for the exact change flag');
            }
        
            // this includes both aam flags, if any, and query features, if any
            // we render them together to avoid possible collisions
            aamText = (queryAttrsText.length > 0 ? queryAttrsText + '\n' : '') + (aamText.length > 0 ? '.' + aamText + '.' : '');
            if (aamText.length > 0) {
                var aamPath = paper.text(ps.x, ps.y, aamText)
                .attr({
                    'font' : settings.font,
                    'font-size' : settings.fontszsub,
                    'fill' : color
                });
                var aamBox = rnd.relBox(aamPath.getBBox());
                this.centerText(aamPath, aamBox);
                var dir = this.bisectLargestSector(atom);
                var visel = atom.visel;
                var t = 3;
                // estimate the shift to clear the atom label
                for (i = 0; i < visel.exts.length; ++i)
                    t = Math.max(t, util.Vec2.shiftRayBox(ps, dir, visel.exts[i].translate(ps)));
                // estimate the shift backwards to account for the size of the aam/query text box itself
                t += util.Vec2.shiftRayBox(ps, dir.negated(), util.Box2Abs.fromRelBox(aamBox))
                dir = dir.scaled(8 + t);
                this.pathAndRBoxTranslate(aamPath, aamBox, dir.x, dir.y);
                this.addReObjectPath('data', atom.visel, aamPath, ps, true);
            }
        }
};

rnd.ReStruct.prototype.shiftBondEnd = function (atom, pos0, dir, margin){
    var t = 0;
    var visel = atom.visel;
    for (var k = 0; k < visel.exts.length; ++k) {
        var box = visel.exts[k].translate(pos0);
        t = Math.max(t, util.Vec2.shiftRayBox(pos0, dir, box));
    }
    if (t > 0)
        pos0 = pos0.addScaled(dir, t + margin);
    return pos0;
};

rnd.ReStruct.prototype.bisectLargestSector = function (atom)
{
    var angles = [];
    atom.a.neighbors.each( function (hbid) {
        var hb = this.molecule.halfBonds.get(hbid);
        angles.push(hb.ang);
    }, this);
    angles = angles.sort(function(a,b){return a-b;});
    var da = [];
    for (var i = 0; i < angles.length - 1; ++i) {
        da.push(angles[(i + 1) % angles.length] - angles[i]);
    }
    da.push(angles[0] - angles[angles.length - 1] + 2 * Math.PI);
    var daMax = 0;
    var ang = -Math.PI/2;
    for (i = 0; i < angles.length; ++i) {
        if (da[i] > daMax) {
            daMax = da[i];
            ang = angles[i] + da[i]/2;
        }
    }
    return new util.Vec2(Math.cos(ang), Math.sin(ang));
};

rnd.ReStruct.prototype.bondRecalc = function (settings, bond) {

    var render = this.render;
    var atom1 = this.atoms.get(bond.b.begin);
    var atom2 = this.atoms.get(bond.b.end);
    var p1 = render.ps(atom1.a.pp);
    var p2 = render.ps(atom2.a.pp);
    var hb1 = this.molecule.halfBonds.get(bond.b.hb1);
    var hb2 = this.molecule.halfBonds.get(bond.b.hb2);
    hb1.p = this.shiftBondEnd(atom1, p1, hb1.dir, 2 * settings.lineWidth);
    hb2.p = this.shiftBondEnd(atom2, p2, hb2.dir, 2 * settings.lineWidth);
    bond.b.center = util.Vec2.lc2(atom1.a.pp, 0.5, atom2.a.pp, 0.5);
    bond.b.len = util.Vec2.dist(p1, p2);
    bond.b.sb = settings.lineWidth * 5;
    bond.b.sa = Math.max(bond.b.sb,  bond.b.len / 2 - settings.lineWidth * 2);
    bond.b.angle = Math.atan2(hb1.dir.y, hb1.dir.x) * 180 / Math.PI;
};

rnd.ReStruct.prototype.showBonds = function ()
{
	var render = this.render;
	var settings = render.settings;
	var paper = render.paper;
	var opt = render.opt;
	for (var bid in this.bondsChanged) {
		var bond = this.bonds.get(bid);
		var hb1 = this.molecule.halfBonds.get(bond.b.hb1),
		hb2 = this.molecule.halfBonds.get(bond.b.hb2);
		this.bondRecalc(settings, bond);
		bond.path = this.drawBond(bond, hb1, hb2);
		bond.rbb = rnd.relBox(bond.path.getBBox());
		this.addReObjectPath('data', bond.visel, bond.path, null, true);
		var reactingCenter = {};
		reactingCenter.path = this.drawReactingCenter(bond, hb1, hb2);
		if (reactingCenter.path) {
			reactingCenter.rbb = rnd.relBox(reactingCenter.path.getBBox());
			this.addReObjectPath('data', bond.visel, reactingCenter.path, null, true);
		}
		var topology = {};
		topology.path = this.drawTopologyMark(bond, hb1, hb2);
		if (topology.path) {
			topology.rbb = rnd.relBox(topology.path.getBBox());
			this.addReObjectPath('data', bond.visel, topology.path, null, true);
		}
                bond.setHighlight(bond.highlight, render);
		var bondIdxOff = settings.subFontSize * 0.6;
		var ipath = null, irbb = null;
		if (opt.showBondIds) {
			var pb = util.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb1.norm, bondIdxOff);
			ipath = paper.text(pb.x, pb.y, bid.toString());
			irbb = rnd.relBox(ipath.getBBox());
			this.centerText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
                }
		if (opt.showHalfBondIds) {
			var phb1 = util.Vec2.lc(hb1.p, 0.8, hb2.p, 0.2, hb1.norm, bondIdxOff);
			ipath = paper.text(phb1.x, phb1.y, bond.b.hb1.toString());
			irbb = rnd.relBox(ipath.getBBox());
			this.centerText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
			var phb2 = util.Vec2.lc(hb1.p, 0.2, hb2.p, 0.8, hb2.norm, bondIdxOff);
			ipath = paper.text(phb2.x, phb2.y, bond.b.hb2.toString());
			irbb = rnd.relBox(ipath.getBBox());
			this.centerText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
                }
		if (opt.showLoopIds && !opt.showBondIds) {
			var pl1 = util.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb2.norm, bondIdxOff);
			ipath = paper.text(pl1.x, pl1.y, hb1.loop.toString());
			irbb = rnd.relBox(ipath.getBBox());
			this.centerText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
			var pl2 = util.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb1.norm, bondIdxOff);
			ipath = paper.text(pl2.x, pl2.y, hb2.loop.toString());
			irbb = rnd.relBox(ipath.getBBox());
			this.centerText(ipath, irbb);
			this.addReObjectPath('indices', bond.visel, ipath);
		}
	}
};

rnd.ReStruct.prototype.labelIsVisible = function (aid, atom)
{
	if (atom.a.neighbors.length == 0 ||
		(atom.a.neighbors.length < 2 && !this.render.opt.hideTerminalLabels) ||
		atom.a.label.toLowerCase() != "c" ||
		(atom.a.badConn && this.render.opt.showValenceWarnings) ||
		atom.a.isotope != 0 ||
		atom.a.radical != 0 ||
		atom.a.charge != 0 ||
		atom.a.explicitValence >= 0 ||
		atom.a.atomList != null ||
        atom.a.rglabel != null)
		return true;
	if (atom.a.neighbors.length == 2) {
		var n1 = atom.a.neighbors[0];
		var n2 = atom.a.neighbors[1];
		var hb1 = this.molecule.halfBonds.get(n1);
		var hb2 = this.molecule.halfBonds.get(n2);
		var b1 = this.bonds.get(hb1.bid);
		var b2 = this.bonds.get(hb2.bid);
		if (b1.b.type == b2.b.type && b1.b.stereo == chem.Struct.BOND.STEREO.NONE && b2.b.stereo == chem.Struct.BOND.STEREO.NONE)
			if (Math.abs(util.Vec2.cross(hb1.dir, hb2.dir)) < 0.2)
				return true;
	}
	return false;
};

rnd.ReStruct.prototype.checkLabelsToShow = function ()
{
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);
		atom.showLabel = this.labelIsVisible(aid, atom);
	}
};

rnd.ReStruct.layerMap = {
	'background' : 0,
	'selection-plate' : 1,
	'highlighting' : 2,
	'warnings' : 3,
	'data' : 4,
	'indices' : 5
};

rnd.ReStruct.prototype.addReObjectPath = function(group, visel, path, pos, visible) {
    if (!path)
        return;
    var offset = this.render.offset;
    var bb = visible ? util.Box2Abs.fromRelBox(rnd.relBox(path.getBBox())) : null;
    var ext = pos && bb ? bb.translate(pos.negated()) : null;
    if (offset !== null) {
        path.translateAbs(offset.x, offset.y);
        bb = bb ? bb.translate(offset) : null;
    }
    visel.add(path, bb, ext);
    this.insertInLayer(rnd.ReStruct.layerMap[group], path);
};

rnd.ReStruct.prototype.clearVisel = function (visel)
{
	for (var i = 0; i < visel.paths.length; ++i)
            visel.paths[i].remove();
	visel.clear();
};

rnd.ReStruct.prototype.selectDoubleBondShift = function (n1, n2, d1, d2) {
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
};

rnd.ReStruct.prototype.selectDoubleBondShift_Chain = function (bond) {
	var struct = this.molecule;
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
};

rnd.ReStruct.prototype.setDoubleBondShift = function ()
{
	var struct = this.molecule;
	// double bonds in loops
	for (var bid in this.bondsChanged) {
		var bond = this.bonds.get(bid);
		var loop1, loop2;
		loop1 = struct.halfBonds.get(bond.b.hb1).loop;
		loop2 = struct.halfBonds.get(bond.b.hb2).loop;
		if (loop1 >= 0 && loop2 >= 0) {
			var d1 = struct.loops.get(loop1).dblBonds;
			var d2 = struct.loops.get(loop2).dblBonds;
			var n1 = struct.loops.get(loop1).hbs.length;
			var n2 = struct.loops.get(loop2).hbs.length;
			bond.doubleBondShift = this.selectDoubleBondShift(n1, n2, d1, d2);
		} else if (loop1 >= 0) {
			bond.doubleBondShift = -1;
		} else if (loop2 >= 0) {
			bond.doubleBondShift = 1;
		} else {
			bond.doubleBondShift = this.selectDoubleBondShift_Chain(bond);
		}
	}
};

rnd.ReStruct.prototype.updateLoops = function ()
{
	this.reloops.each(function(rlid, reloop){
		this.clearVisel(reloop.visel);
	}, this);
	var ret = this.molecule.findLoops();
    util.each(ret.bondsToMark, function(bid) {
        this.markBond(bid, 1);
    }, this);
    util.each(ret.newLoops, function(loopId) {
        this.reloops.set(loopId, new rnd.ReLoop(this.molecule.loops.get(loopId)));
    }, this);
};

rnd.ReStruct.prototype.renderLoops = function ()
{
    var render = this.render;
	var settings = render.settings;
	var paper = render.paper;
        var molecule = this.molecule;
	this.reloops.each(function(rlid, reloop){
		var loop = reloop.loop;
		reloop.centre = new util.Vec2();
		loop.hbs.each(function(hbid){
			var hb = molecule.halfBonds.get(hbid);
			var bond = this.bonds.get(hb.bid);
                        var apos = render.ps(this.atoms.get(hb.begin).a.pp);
			if (bond.b.type != chem.Struct.BOND.TYPE.AROMATIC)
				loop.aromatic = false;
			reloop.centre.add_(apos);
		}, this);
		loop.convex = true;
		for (var k = 0; k < reloop.loop.hbs.length; ++k)
		{
			var hba = molecule.halfBonds.get(loop.hbs[k]);
			var hbb = molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length]);
			var angle = Math.atan2(
					util.Vec2.cross(hba.dir, hbb.dir),
					util.Vec2.dot(hba.dir, hbb.dir));
			if (angle > 0)
				loop.convex = false;
		}

		reloop.centre = reloop.centre.scaled(1.0 / loop.hbs.length);
		reloop.radius = -1;
		loop.hbs.each(function(hbid){
			var hb = molecule.halfBonds.get(hbid);
                        var apos = render.ps(this.atoms.get(hb.begin).a.pp);
			var bpos = render.ps(this.atoms.get(hb.end).a.pp);
			var n = util.Vec2.diff(bpos, apos).rotateSC(1, 0).normalized();
			var dist = util.Vec2.dot(util.Vec2.diff(apos, reloop.centre), n);
			if (reloop.radius < 0) {
				reloop.radius = dist;
			} else {
				reloop.radius = Math.min(reloop.radius, dist);
			}
		}, this);
		reloop.radius *= 0.7;
		if (!loop.aromatic)
			return;
		var path = null;
		if (loop.convex) {
			path = paper.circle(reloop.centre.x, reloop.centre.y, reloop.radius)
			.attr({
				'stroke': '#000',
				'stroke-width': settings.lineWidth
			});
		} else {
			var pathStr = '';
			for (k = 0; k < loop.hbs.length; ++k)
			{
				hba = molecule.halfBonds.get(loop.hbs[k]);
				hbb = molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length]);
				angle = Math.atan2(
						util.Vec2.cross(hba.dir, hbb.dir),
						util.Vec2.dot(hba.dir, hbb.dir));
				var halfAngle = (Math.PI - angle) / 2;
				var dir = hbb.dir.rotate(halfAngle);
                                var pi = render.ps(this.atoms.get(hbb.begin).a.pp);
				var sin = Math.sin(halfAngle);
				var minSin = 0.1;
				if (Math.abs(sin) < minSin)
					sin = sin * minSin / Math.abs(sin);
				var offset = settings.bondSpace / sin;
				var qi = pi.addScaled(dir, -offset);
				pathStr += (k == 0 ? 'M' : 'L');
				pathStr += tfx(qi.x) + ',' + tfx(qi.y);
			}
			pathStr += 'Z';
			path = paper.path(pathStr)
			.attr({
				'stroke': '#000',
				'stroke-width': settings.lineWidth,
				'stroke-dasharray':'- '
			});
		}
		this.addReObjectPath('data', reloop.visel, path, null, true);
	}, this);
};
