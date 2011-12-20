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

rnd.ReStruct.prototype.drawArrow = function (a, b)
{
	var width = 5, length = 7;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{1}L{2},{3}L{4},{5}M{2},{3}L{4},{6}", a.x, a.y, b.x, b.y, b.x - length, b.y - width, b.y + width)
	.attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawPlus = function (c)
{
	var s = this.render.scale/5;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{4}L{0},{5}M{2},{1}L{3},{1}", c.x, c.y, c.x - s, c.x + s, c.y - s, c.y + s)
	.attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawBondSingle = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{1}L{2},{3}", a.x, a.y, b.x, b.y)
	.attr(styles.lineattr);
};

rnd.ReStruct.prototype.drawBondSingleUp = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm;
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
	var bsp = settings.bondSpace;
	var b2 = b.addScaled(n, bsp);
	var b3 = b.addScaled(n, -bsp);
	return paper.path("M{0},{1}L{2},{3}L{4},{5},L{0},{1}",
		a.x, a.y, b2.x, b2.y, b3.x, b3.y)
	.attr(styles.lineattr).attr({
		'fill':'#000'
	});
};

rnd.ReStruct.prototype.drawBondSingleDown = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm;
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
	var bsp = settings.bondSpace;
	var d = b.sub(a);
	var len = d.length();
	d = d.normalized();
	var interval = 1.2 * settings.lineWidth;
	var nlines = Math.floor((len - settings.lineWidth) /
		(settings.lineWidth + interval)) + 1;
	var step = len / (nlines - 1);

	var path = "", p, q, r = a;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * i);
		p = r.addScaled(n, bsp * i / (nlines - 1));
		q = r.addScaled(n, -bsp * i / (nlines - 1));
		path += 'M' + p.x + ',' + p.y + 'L' + q.x + ',' + q.y;
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
	var bsp = settings.bondSpace;
	var d = b.sub(a);
	var len = d.length();
	d = d.normalized();
	var interval = 0.6 * settings.lineWidth;
	var nlines = Math.floor((len - settings.lineWidth) /
		(settings.lineWidth + interval)) + 1;
	var step = len / (nlines - 1);

	var path = 'M' + a.x + ',' + a.y, r = a;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * i).addScaled(n,
			((i & 1) ? -1 : +1) * bsp * i / (nlines - 1));
		path += 'L' + r.x + ',' + r.y;
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
		a2.x, a2.y, b2.x, b2.y, a3.x, a3.y, b3.x, b3.y)
	.attr(styles.lineattr);
};

rnd.ReStruct.makeStroke = function (a, b) {
	return 'M' + a.x.toString() + ',' + a.y.toString() +
		'L' + b.x.toString() + ',' + b.y.toString() + '	';
};

rnd.ReStruct.prototype.drawBondSingleOrDouble = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm;
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
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
	var settings = this.render.settings;
	var paper = this.render.paper;
	var styles = this.render.styles;
	var a2 = a.addScaled(n, settings.bondSpace);
	var b2 = b.addScaled(n, settings.bondSpace);
	var a3 = a.addScaled(n, -settings.bondSpace);
	var b3 = b.addScaled(n, -settings.bondSpace);
	var shiftA = !this.atoms.get(hb1.begin).showLabel;
	var shiftB = !this.atoms.get(hb2.begin).showLabel;
	if (shiftA)
		a2 = a2.addScaled(hb1.dir, settings.bondSpace *
			this.getBondLineShift(hb1.rightCos, hb1.rightSin));
	if (shiftB)
		b2 = b2.addScaled(hb1.dir, -settings.bondSpace *
			this.getBondLineShift(hb2.leftCos, hb2.leftSin));
	if (shiftA)
		a3 = a3.addScaled(hb1.dir, settings.bondSpace *
			this.getBondLineShift(hb1.leftCos, hb1.leftSin));
	if (shiftB)
		b3 = b3.addScaled(hb1.dir, -settings.bondSpace *
			this.getBondLineShift(hb2.rightCos, hb2.rightSin));
	return paper.path("M{0},{1}L{2},{3}M{4},{5}L{6},{7}M{8},{9}L{10},{11}",
		a.x, a.y, b.x, b.y, a2.x, a2.y, b2.x, b2.y, a3.x, a3.y, b3.x, b3.y)
	.attr(styles.lineattr);
};

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

rnd.ReStruct.prototype.drawBondSingleOrAromatic = function (hb1, hb2, bond)
{
	var shift = bond.doubleBondShift;
	var paper = this.render.paper;
	var paths = this.preparePathsForAromaticBond(hb1, hb2, shift);
	var l1 = paths[0], l2 = paths[1];
	(shift > 0 ? l1 : l2).attr({
		'stroke-dasharray':'-.'
	});
	return paper.set([l1,l2]);
};

rnd.ReStruct.prototype.preparePathsForAromaticBond = function (hb1, hb2, shift)
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
	var l1 = paper.path("M{0},{1}L{2},{3}",
		a2.x, a2.y, b2.x, b2.y).attr(styles.lineattr);
	var l2 = paper.path("M{0},{1}L{2},{3}",
		a3.x, a3.y, b3.x, b3.y).attr(styles.lineattr);
	return [l1, l2];
};


rnd.ReStruct.prototype.drawBondDoubleOrAromatic = function (hb1, hb2, bond)
{
	var shift = bond.doubleBondShift;
	var paper = this.render.paper;
	var paths = this.preparePathsForAromaticBond(hb1, hb2, shift);
	var l1 = paths[0], l2 = paths[1];
	l1.attr({'stroke-dasharray':'-.'});
	l2.attr({'stroke-dasharray':'-.'});
	return paper.set([l1,l2]);
};

rnd.ReStruct.prototype.drawBondAny = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{1}L{2},{3}", a.x, a.y, b.x, b.y)
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
		pathdesc += "M" + p[2 * i].x + "," + p[2 * i].y + "L" + p[2 * i + 1].x + "," + p[2 * i + 1].y;
	return paper.path(pathdesc).attr(styles.lineattr);
}

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
	var rbb = path.getBBox();
	this.centerText(path, rbb);
	return path;
}

rnd.ReStruct.prototype.drawBond = function (bond, hb1, hb2)
{
	var path = null;
	switch (bond.b.type)
	{
		case chem.Struct.BOND.TYPE.SINGLE:
			switch (bond.b.stereo) {
				case chem.Struct.BOND.STEREO.UP:
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
			path = this.drawBondDouble(hb1, hb2, bond,
				bond.b.stereo == chem.Struct.BOND.STEREO.CIS_TRANS);
			break;
		case chem.Struct.BOND.TYPE.TRIPLE:
			path = this.drawBondTriple(hb1, hb2, bond);
			break;
		case chem.Struct.BOND.TYPE.AROMATIC:
			var inAromaticLoop = (hb1.loop >= 0 && this.molecule.loops.get(hb1.loop).aromatic) ||
				(hb2.loop >= 0 && this.molecule.loops.get(hb2.loop).aromatic);
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
		p.x - dw, p.y + dh, p.x, p.y, p.x + dw, p.y + dh)
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

// TODO to be removed
/** @deprecated please use ReAtom.setHighlight instead */
rnd.ReStruct.prototype.showAtomHighlighting = function (aid, atom, visible)
{
	var exists = (atom.highlighting != null) && !atom.highlighting.removed;
    // rbalabanov: here is temporary fix for "drag issue" on iPad
    //BEGIN
    exists = exists && (!('hiddenPaths' in rnd.ReStruct.prototype) || rnd.ReStruct.prototype.hiddenPaths.indexOf(atom.highlighting) < 0);
    //END
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			atom.highlighting = paper
			.circle(atom.a.ps.x, atom.a.ps.y, styles.atomSelectionPlateRadius)
			.attr(styles.highlightStyle);
			if (rnd.DEBUG)
				atom.highlighting.attr({
					'fill':'#AAA'
				});
			render.addItemPath(atom.visel, 'highlighting', atom.highlighting);
		}
		if (rnd.DEBUG)
			atom.highlighting.attr({
				'stroke':'#0c0'
			});
		else
			atom.highlighting.show();
	} else {
		if (exists) {
			if (rnd.DEBUG)
				atom.highlighting.attr({
					'stroke':'none'
				});
			else
				atom.highlighting.hide();
		}
	}
};

rnd.ReStruct.prototype.showAtomSGroupHighlighting = function (aid, atom, visible)
{
	var exists = (atom.sGroupHighlighting != null) && !atom.sGroupHighlighting.removed;
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			atom.sGroupHighlighting = paper
			.circle(atom.a.ps.x, atom.a.ps.y, 0.7 * styles.atomSelectionPlateRadius)
			.attr(styles.sGroupHighlightStyle);
			render.addItemPath(atom.visel, 'highlighting', atom.sGroupHighlighting);
		}
		atom.sGroupHighlighting.show();
	} else {
		if (exists) {
			atom.sGroupHighlighting.hide();
		}
	}
};

rnd.ReStruct.prototype.removeBracketSelection = function (sgid, sg)
{
	var exists = (sg.selectionPlate != null) && !sg.selectionPlate.removed;
	if (exists)
		sg.selectionPlate.remove();
};

rnd.ReStruct.prototype.showBracketSelection = function (sgid, sg, visible)
{
	var exists = (sg.selectionPlate != null) && !sg.selectionPlate.removed;
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var settings = render.settings;
			var paper = render.paper;
			var bb = sg.bracketBox;
			var lw = settings.lineWidth;
			var vext = new util.Vec2(lw * 4, lw * 6);
			bb = bb.extend(vext, vext);
			sg.selectionPlate = paper
			.rect(bb.p0.x, bb.p0.y, bb.p1.x - bb.p0.x, bb.p1.y - bb.p0.y, lw * 2)
			.attr(styles.selectionStyle);
			this.addSGroupPath('selection-plate', sg.visel, sg.selectionPlate);
		}
		sg.selectionPlate.show();
	} else {
		if (exists)
			sg.selectionPlate.hide();
	}
};

rnd.ReStruct.prototype.removeBracketHighlighting = function (sgid, sg)
{
	var exists = (sg.highlighting != null) && !sg.highlighting.removed;
	if (exists)
		sg.highlighting.remove();
};

rnd.ReStruct.prototype.showBracketHighlighting = function (sgid, sg, visible)
{
	var exists = (sg.highlighting != null) && !sg.highlighting.removed;
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var settings = render.settings;
			var paper = render.paper;
			var bb = sg.bracketBox;
			var lw = settings.lineWidth;
			var vext = new util.Vec2(lw * 4, lw * 6);
			bb = bb.extend(vext, vext);
			sg.highlighting = paper
			.rect(bb.p0.x, bb.p0.y, bb.p1.x - bb.p0.x, bb.p1.y - bb.p0.y, lw * 2)
			.attr(styles.highlightStyle);
			this.addSGroupPath('highlighting', sg.visel, sg.highlighting);
		}
		sg.highlighting.show();
	} else {
		if (exists) {
			sg.highlighting.hide();
		}
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
			render.addItemPath(item.visel, 'selection-plate', item.selectionPlate);
		}
		item.selectionPlate.show();
	} else {
		if (exists)
			item.selectionPlate.hide();
	}
};

rnd.ReStruct.prototype.pathAndRBoxTranslate = function (path, rbb, x, y)
{
	path.translate(x, y);
	rbb.x += x;
	rbb.y += y;
};

var markerColors = ['black', 'cyan', 'magenta', 'red', 'green', 'blue', 'green'];

rnd.ReStruct.prototype.showLabels = function ()
{
	var render = this.render;
	var settings = render.settings;
	var opt = render.opt;
	var paper = render.paper;
	var delta = 0.5 * settings.lineWidth;
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);

//		if (rnd.DEBUG) {
//			var marker = paper
//			.circle(atom.a.ps.x, atom.a.ps.y, settings.fontsz * 0.5)
//			.attr('stroke', 'none')
//			.attr('fill', markerColors[atom.a.sgroup+1])
//			.attr('opacity', '0.5');
//			render.addItemPath(atom.visel, 'data', marker, marker.getBBox());
//		}
		var index = null;
		if (opt.showAtomIds) {
			index = {};
			index.text = aid.toString();
			index.path = paper.text(atom.a.ps.x, atom.a.ps.y, index.text)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontszsub,
				'fill' : '#070'
			});
			index.rbb = index.path.getBBox();
			this.centerText(index.path, index.rbb);
			render.addItemPath(atom.visel, 'indices', index.path, index.rbb);
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

		if (queryAttrsText.length > 0) {
			var queryAttrsPath = paper.text(atom.a.ps.x, atom.a.ps.y, queryAttrsText)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontszsub,
				'fill' : '#000'
			});
			var queryAttrsRbb = queryAttrsPath.getBBox();
			this.centerText(queryAttrsPath, queryAttrsRbb);
			this.pathAndRBoxTranslate(queryAttrsPath, queryAttrsRbb, 0, settings.scaleFactor / 3);
			render.addItemPath(atom.visel, 'indices', queryAttrsPath, queryAttrsRbb);
		}
		if (atom.selected)
			this.showItemSelection(aid, atom, true);
		if (atom.highlight)
			this.showAtomHighlighting(aid, atom, true);
		if (atom.sGroupHighlight)
			this.showAtomSGroupHighlighting(aid, atom, true);

		if (atom.showLabel)
		{
			var rightMargin = 0, leftMargin = 0;
			// label
			var label = {};
			var color = '#000000';
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
			label.path = paper.text(atom.a.ps.x, atom.a.ps.y, label.text)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontsz,
				'fill' : color
			});
			label.rbb = label.path.getBBox();
			this.centerText(label.path, label.rbb);
			if (atom.a.atomList != null)
				this.pathAndRBoxTranslate(label.path, label.rbb, (atom.hydrogenOnTheLeft ? -1 : 1) * (label.rbb.width - label.rbb.height) / 2, 0);
			render.addItemPath(atom.visel, 'data', label.path, label.rbb);
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
				paper.text(atom.a.ps.x, atom.a.ps.y, hydroIndex.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontszsub,
					'fill' : color
				});
				hydroIndex.rbb = hydroIndex.path.getBBox();
				this.centerText(hydroIndex.path, hydroIndex.rbb);
				this.pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
					rightMargin + 0.5 * hydroIndex.rbb.width + delta,
					0.2 * label.rbb.height);
				rightMargin += hydroIndex.rbb.width + delta;
				render.addItemPath(atom.visel, 'data', hydroIndex.path, hydroIndex.rbb);
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
							this.radicalBullet(atom.a.ps).translate(-hshift, 0),
							this.radicalBullet(atom.a.ps).translate(hshift, 0));
						radical.path.attr('fill', color);
						break;
					case 2:
						radical.path = this.radicalBullet(atom.a.ps)
						.attr('fill', color);
						break;
					case 3:
						radical.path = paper.set();
						hshift = 1.6 * settings.lineWidth;
						radical.path.push(
							this.radicalCap(atom.a.ps).translate(-hshift, 0),
							this.radicalCap(atom.a.ps).translate(hshift, 0));
						radical.path.attr('stroke', color);
						break;
				}
				radical.rbb = radical.path.getBBox();
				var vshift = -0.5 * (label.rbb.height + radical.rbb.height);
				if (atom.a.radical == 3)
					vshift -= settings.lineWidth/2;
				this.pathAndRBoxTranslate(radical.path, radical.rbb,
					0, vshift);
				render.addItemPath(atom.visel, 'data', radical.path, radical.rbb);
			}

			var isotope = {};
			if (atom.a.isotope != 0)
			{
				isotope.text = atom.a.isotope.toString();
				isotope.path = paper.text(atom.a.ps.x, atom.a.ps.y, isotope.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontszsub,
					'fill' : color
				});
				isotope.rbb = isotope.path.getBBox();
				this.centerText(isotope.path, isotope.rbb);
				this.pathAndRBoxTranslate(isotope.path, isotope.rbb,
					leftMargin - 0.5 * isotope.rbb.width - delta,
					-0.3 * label.rbb.height);
				leftMargin -= isotope.rbb.width + delta;
				render.addItemPath(atom.visel, 'data', isotope.path, isotope.rbb);
			}
			if (!isHydrogen && implh > 0 && !render.opt.hideImplicitHydrogen)
			{
				hydrogen.text = 'H';
				hydrogen.path = paper.text(atom.a.ps.x, atom.a.ps.y, hydrogen.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontsz,
					'fill' : color
				});
				hydrogen.rbb = hydrogen.path.getBBox();
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
					paper.text(atom.a.ps.x, atom.a.ps.y, hydroIndex.text)
					.attr({
						'font' : settings.font,
						'font-size' : settings.fontszsub,
						'fill' : color
					});
					hydroIndex.rbb = hydroIndex.path.getBBox();
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
				render.addItemPath(atom.visel, 'data', hydrogen.path, hydrogen.rbb);
				if (hydroIndex != null)
					render.addItemPath(atom.visel, 'data', hydroIndex.path, hydroIndex.rbb);
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

				charge.path = paper.text(atom.a.ps.x, atom.a.ps.y, charge.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontszsub,
					'fill' : color
				});
				charge.rbb = charge.path.getBBox();
				this.centerText(charge.path, charge.rbb);
				this.pathAndRBoxTranslate(charge.path, charge.rbb,
					rightMargin + 0.5 * charge.rbb.width + delta,
					-0.3 * label.rbb.height);
				rightMargin += charge.rbb.width + delta;
				render.addItemPath(atom.visel, 'data', charge.path, charge.rbb);
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
				8: 'VIII'
			};
			if (atom.a.explicitValence)
			{
				valence.text = mapValence[atom.a.valence];
				if (!valence.text)
					throw new Error("invalid valence");
				valence.text = '(' + valence.text + ')';
				valence.path = paper.text(atom.a.ps.x, atom.a.ps.y, valence.text)
				.attr({
					'font' : settings.font,
					'font-size' : settings.fontszsub,
					'fill' : color
				});
				valence.rbb = valence.path.getBBox();
				this.centerText(valence.path, valence.rbb);
				this.pathAndRBoxTranslate(valence.path, valence.rbb,
					rightMargin + 0.5 * valence.rbb.width + delta,
					-0.3 * label.rbb.height);
				rightMargin += valence.rbb.width + delta;
				render.addItemPath(atom.visel, 'data', valence.path, valence.rbb);
			}

			if (atom.a.badConn && opt.showValenceWarnings) {
				var warning = {};
				var y = atom.a.ps.y + label.rbb.height / 2 + delta;
				warning.path = paper.path("M{0},{1}L{2},{3}",
					atom.a.ps.x + leftMargin, y, atom.a.ps.x + rightMargin, y)
				.attr(this.render.styles.lineattr)
				.attr({
					'stroke':'#F00'
				});
				warning.rbb = warning.path.getBBox();
				render.addItemPath(atom.visel, 'warnings', warning.path, warning.rbb);
			}
			if (index)
				this.pathAndRBoxTranslate(index.path, index.rbb,
					-0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
					0.3 * label.rbb.height);
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
		if (atom.a.exactChangeFlag > 0) {
			if (aamText.length > 0)
				aamText += ",";
			if (atom.a.exactChangeFlag == 1)
				aamText += 'ext';
			else
				throw new Error('Invalid value for the exact change flag');
		}
        if (aamText.length > 0) {
            var aamPath = paper.text(atom.a.ps.x, atom.a.ps.y, '.' + aamText + '.')
                .attr({
                    'font' : settings.font,
                    'font-size' : settings.fontszsub,
                    'fill' : 'gray'
                });
			var aamBox = aamPath.getBBox();
			this.centerText(aamPath, aamBox);

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
			var ang = 0;
			for (i = 0; i < angles.length; ++i) {
				if (da[i] > daMax) {
					daMax = da[i];
					ang = angles[i] + da[i]/2;
				}
			}
			var dir = new util.Vec2(Math.cos(ang), Math.sin(ang));

			var visel = atom.visel;
			var t = 3;
			for (i = 0; i < visel.boxes.length; ++i)
				t = Math.max(t, util.Vec2.shiftRayBox(atom.a.ps, dir, visel.boxes[i]));
			dir = dir.scaled(10 + t);
			this.pathAndRBoxTranslate(aamPath, aamBox, dir.x, dir.y);
			render.addItemPath(atom.visel, 'data', aamPath, null);
        }
	}
};

// TODO to be removed
/** @deprecated please use ReBond.setHighlight instead */
rnd.ReStruct.prototype.showBondHighlighting = function (bid, bond, visible)
{
	var exists = (bond.highlighting != null) && !bond.highlighting.removed;
    // rbalabanov: here is temporary fix for "drag issue" on iPad
    //BEGIN
    exists = exists && (!('hiddenPaths' in rnd.ReStruct.prototype) || rnd.ReStruct.prototype.hiddenPaths.indexOf(bond.highlighting) < 0);
    //END
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			this.bondRecalc(render.settings, bond);
			bond.highlighting = paper
			.ellipse(bond.b.center.x, bond.b.center.y, bond.b.sa, bond.b.sb)
			.rotate(bond.b.angle)
			.attr(styles.highlightStyle);
			if (rnd.DEBUG)
				bond.highlighting.attr({
					'fill':'#AAA'
				});
			render.addItemPath(bond.visel, 'highlighting', bond.highlighting);
		}
		if (rnd.DEBUG)
			bond.highlighting.attr({
				'stroke':'#0c0'
			});
		else
			bond.highlighting.show();
	} else {
		if (exists) {
			if (rnd.DEBUG)
				bond.highlighting.attr({
					'stroke':'none'
				});
			else
				bond.highlighting.hide();
		}
	}
};

rnd.ReStruct.prototype.bondRecalc = function (settings, bond) {
	var p1 = this.atoms.get(bond.b.begin).a.ps,
	p2 = this.atoms.get(bond.b.end).a.ps;
	var hb1 = this.molecule.halfBonds.get(bond.b.hb1);
	bond.b.center = util.Vec2.lc2(p1, 0.5, p2, 0.5);
	bond.b.len = util.Vec2.dist(p1, p2);
	bond.b.sb = settings.lineWidth * 5;
	bond.b.sa = Math.max(bond.b.sb,  bond.b.len / 2 - settings.lineWidth * 2);
	bond.b.angle = Math.atan2(hb1.dir.y, hb1.dir.x) * 180 / Math.PI;
}

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
		bond.rbb = bond.path.getBBox();
		render.addItemPath(bond.visel, 'data', bond.path, bond.rbb);
		var reactingCenter = {};
		reactingCenter.path = this.drawReactingCenter(bond, hb1, hb2);
		if (reactingCenter.path) {
			reactingCenter.rbb = reactingCenter.path.getBBox();
			render.addItemPath(bond.visel, 'data', reactingCenter.path, reactingCenter.rbb);
		}
		var topology = {};
		topology.path = this.drawTopologyMark(bond, hb1, hb2);
		if (topology.path) {
			topology.rbb = topology.path.getBBox();
			render.addItemPath(bond.visel, 'data', topology.path, topology.rbb);
		}
		if (bond.selected)
			this.showItemSelection(bid, bond, true);
		if (bond.highlight)
			this.showBondHighlighting(bid, bond, true);
		var bondIdxOff = settings.subFontSize * 0.6;
		var ipath = null, irbb = null;
		if (opt.showBondIds) {
			var pb = util.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb1.norm, bondIdxOff);
			ipath = paper.text(pb.x, pb.y, bid.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			render.addItemPath(bond.visel, 'indices', ipath, irbb);
			var phb1 = util.Vec2.lc(hb1.p, 0.8, hb2.p, 0.2, hb1.norm, bondIdxOff);
			ipath = paper.text(phb1.x, phb1.y, bond.b.hb1.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			render.addItemPath(bond.visel, 'indices', ipath, irbb);
			var phb2 = util.Vec2.lc(hb1.p, 0.2, hb2.p, 0.8, hb1.norm, bondIdxOff);
			ipath = paper.text(phb2.x, phb2.y, bond.b.hb2.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			render.addItemPath(bond.visel, 'indices', ipath, irbb);
		} else if (opt.showLoopIds) {
			var pl1 = util.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb2.norm, bondIdxOff);
			ipath = paper.text(pl1.x, pl1.y, hb1.loop.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			render.addItemPath(bond.visel, 'indices', ipath, irbb);
			var pl2 = util.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb1.norm, bondIdxOff);
			ipath = paper.text(pl2.x, pl2.y, hb2.loop.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			render.addItemPath(bond.visel, 'indices', ipath, irbb);
		}
	}
};

rnd.ReStruct.prototype.labelIsVisible = function (aid, atom)
{
	if ((atom.a.neighbors.length < 2 && !this.render.opt.hideTerminalLabels) ||
		atom.a.label.toLowerCase() != "c" ||
		(atom.a.badConn && this.render.opt.showValenceWarnings) ||
		atom.a.isotope != 0 ||
		atom.a.radical != 0 ||
		atom.a.charge != 0 ||
		atom.a.explicitValence ||
		atom.a.atomList != null ||
        atom.a.rglabel != null)
		return true;
	if (!atom.showLabel && atom.a.neighbors.length == 2) {
		var n1 = atom.a.neighbors[0];
		var n2 = atom.a.neighbors[1];
		var hb1 = this.molecule.halfBonds.get(n1);
		var hb2 = this.molecule.halfBonds.get(n2);
		var b1 = this.bonds.get(hb1.bid);
		var b2 = this.bonds.get(hb2.bid);
		if (b1.b.type == b2.b.type && b1.b.stereo == chem.Struct.BOND.STEREO.NONE && b2.b.stereo == chem.Struct.BOND.STEREO.NONE)
			if (Math.abs(util.Vec2.cross(hb1.dir, hb2.dir)) < 0.05)
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

rnd.ReStruct.prototype.addSGroupPath = function (group, visel, path)
{
	var offset = this.render.offset;
	if (offset != null)
		path.translate(offset.x, offset.y);
	var bb = util.Box2Abs.fromRelBox(path.getBBox());
	visel.add(path, bb);
	this.insertInLayer(rnd.ReStruct.layerMap[group], path);
};

rnd.ReStruct.prototype.addChiralPath = function (group, visel, path)
{
	var offset = this.render.offset;
	if (offset != null)
		path.translate(offset.x, offset.y);
	var bb = util.Box2Abs.fromRelBox(path.getBBox());
	visel.add(path, bb);
	this.insertInLayer(rnd.ReStruct.layerMap[group], path);
};

rnd.ReStruct.prototype.addLoopPath = function (group, visel, path)
{
	var offset = this.render.offset;
	if (offset != null)
		path.translate(offset.x, offset.y);
	var bb = util.Box2Abs.fromRelBox(path.getBBox());
	visel.add(path, bb);
	this.insertInLayer(rnd.ReStruct.layerMap[group], path);
};

rnd.ReStruct.prototype.addTmpPath = function (group, path)
{
	var visel = new rnd.Visel('TMP');
	var offset = this.render.offset;
	if (offset != null) {
		path.translate(offset.x, offset.y);
	}
	visel.add(path);
	this.tmpVisels.push(visel);
	this.insertInLayer(rnd.ReStruct.layerMap[group], path);
};

rnd.ReStruct.prototype.clearVisel = function (visel)
{
	for (var i = 0; i < visel.paths.length; ++i)
		visel.paths[i].remove();
	visel.clear();
};

rnd.ReStruct.prototype.shiftBonds = function ()
{
	var settings = this.render.settings;
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);
		atom.a.neighbors.each( function (hbid) {
			var hb = this.molecule.halfBonds.get(hbid);
			hb.p = atom.a.ps;
			var t = 0;
			var visel = atom.visel;
			for (var i = 0; i < visel.boxes.length; ++i)
				t = Math.max(t, util.Vec2.shiftRayBox(hb.p, hb.dir, visel.boxes[i]));
			if (t > 0)
				hb.p = hb.p.addScaled(hb.dir, t + 2 * settings.lineWidth);
		}, this)
	}
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
	this.findLoops();
};

rnd.ReStruct.prototype.renderLoops = function ()
{
	var settings = this.render.settings;
	var paper = this.render.paper;
	this.reloops.each(function(rlid, reloop){
		var loop = reloop.loop;
		reloop.centre = new util.Vec2();
		loop.hbs.each(function(hbid){
			var hb = this.molecule.halfBonds.get(hbid);
			var bond = this.bonds.get(hb.bid);
			var apos = this.atoms.get(hb.begin).a.ps;
			if (bond.b.type != chem.Struct.BOND.TYPE.AROMATIC)
				loop.aromatic = false;
			reloop.centre.add_(apos);
		}, this);
		loop.convex = true;
		for (var k = 0; k < reloop.loop.hbs.length; ++k)
		{
			var hba = this.molecule.halfBonds.get(loop.hbs[k]);
			var hbb = this.molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length]);
			var angle = Math.atan2(
					util.Vec2.cross(hba.dir, hbb.dir),
					util.Vec2.dot(hba.dir, hbb.dir));
			if (angle > 0)
				loop.convex = false;
		}

		reloop.centre = reloop.centre.scaled(1.0 / loop.hbs.length);
		reloop.radius = -1;
		loop.hbs.each(function(hbid){
			var hb = this.molecule.halfBonds.get(hbid);
			var apos = this.atoms.get(hb.begin).a.ps;
			var bpos = this.atoms.get(hb.end).a.ps;
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
				hba = this.molecule.halfBonds.get(loop.hbs[k]);
				hbb = this.molecule.halfBonds.get(loop.hbs[(k + 1) % loop.hbs.length]);
				angle = Math.atan2(
						util.Vec2.cross(hba.dir, hbb.dir),
						util.Vec2.dot(hba.dir, hbb.dir));
				var halfAngle = (Math.PI - angle) / 2;
				var dir = hbb.dir.rotate(halfAngle);
				var pi = this.atoms.get(hbb.begin).a.ps;
				var sin = Math.sin(halfAngle);
				var minSin = 0.1;
				if (Math.abs(sin) < minSin)
					sin = sin * minSin / Math.abs(sin);
				var offset = settings.bondSpace / sin;
				var qi = pi.addScaled(dir, -offset);
				pathStr += (k == 0 ? 'M' : 'L');
				pathStr += qi.x.toString() + ',' + qi.y.toString();
			}
			pathStr += 'Z';
			path = paper.path(pathStr)
			.attr({
				'stroke': '#000',
				'stroke-width': settings.lineWidth,
				'stroke-dasharray':'- '
			});
		}
		this.addLoopPath('data', reloop.visel, path);
	}, this);
};
