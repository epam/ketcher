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

if (!window.rnd || !rnd.MolData)
	throw new Error("MolData should be defined first");

rnd.MolData.prototype.drawArrow = function (a, b)
{
	var width = 5, length = 7;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{1}L{2},{3}L{4},{5}M{2},{3}L{4},{6}", a.x, a.y, b.x, b.y, b.x - length, b.y - width, b.y + width)
	.attr(styles.lineattr);
}

rnd.MolData.prototype.drawBondSingle = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{1}L{2},{3}", a.x, a.y, b.x, b.y)
	.attr(styles.lineattr);
}

rnd.MolData.prototype.drawBondSingleUp = function (hb1, hb2)
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
}

rnd.MolData.prototype.drawBondSingleDown = function (hb1, hb2)
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

	var path = "", p, q, r = a, s;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * i);
		p = r.addScaled(n, bsp * i / (nlines - 1));
		q = r.addScaled(n, -bsp * i / (nlines - 1));
		path += 'M' + p.x + ',' + p.y + 'L' + q.x + ',' + q.y;
	}
	return paper.path(path)
	.attr(styles.lineattr);
}

rnd.MolData.prototype.drawBondSingleEither = function (hb1, hb2)
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

	var path = 'M' + a.x + ',' + a.y, r = a, s;
	for (var i = 0; i < nlines; ++i) {
		r = a.addScaled(d, step * i).addScaled(n,
			((i & 1) ? -1 : +1) * bsp * i / (nlines - 1));
		path += 'L' + r.x + ',' + r.y;
	}
	return paper.path(path)
	.attr(styles.lineattr);
}

rnd.MolData.prototype.getBondLineShift = function (cos, sin)
{
	if (sin < 0 || Math.abs(cos) > 0.9)
		return 0;
	return sin / (1 - cos);
}

rnd.MolData.prototype.drawBondDouble = function (hb1, hb2, bond, cis_trans)
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
}

rnd.MolData.prototype.drawBondTriple = function (hb1, hb2)
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
}

rnd.MolData.prototype.drawBondAromatic = function (hb1, hb2, bond)
{
	var a = hb1.p, b = hb2.p, n = hb1.norm, shift = bond.doubleBondShift;
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
	var l1 = paper.path("M{0},{1}L{2},{3}",
		a2.x, a2.y, b2.x, b2.y).attr(styles.lineattr);
	var l2 = paper.path("M{0},{1}L{2},{3}",
		a3.x, a3.y, b3.x, b3.y).attr(styles.lineattr);
	(shift > 0 ? l1 : l2).attr({
		'stroke-dasharray':'- '
	});
	return paper.set([l1,l2]);
}

rnd.MolData.prototype.drawBondAny = function (hb1, hb2)
{
	var a = hb1.p, b = hb2.p;
	var paper = this.render.paper;
	var styles = this.render.styles;
	return paper.path("M{0},{1}L{2},{3}", a.x, a.y, b.x, b.y)
	.attr(styles.lineattr).attr({
		'stroke-dasharray':'- '
	});
}

rnd.MolData.prototype.drawBond = function (bond, hb1, hb2)
{
	var path = null;
	switch (bond.b.type)
	{
		case chem.Molecule.BOND.TYPE.SINGLE:
			switch (bond.b.stereo) {
				case chem.Molecule.BOND.STEREO.UP:
					path = this.drawBondSingleUp(hb1, hb2, bond);
					break;
				case chem.Molecule.BOND.STEREO.DOWN:
					path = this.drawBondSingleDown(hb1, hb2, bond);
					break;
				case chem.Molecule.BOND.STEREO.EITHER:
					path = this.drawBondSingleEither(hb1, hb2, bond);
					break;
				default:
					path = this.drawBondSingle(hb1, hb2, bond);
					break;
			}
			break;
		case chem.Molecule.BOND.TYPE.DOUBLE:
			path = this.drawBondDouble(hb1, hb2, bond,
				bond.b.stereo == chem.Molecule.BOND.STEREO.CIS_TRANS);
			break;
		case chem.Molecule.BOND.TYPE.TRIPLE:
			path = this.drawBondTriple(hb1, hb2, bond);
			break;
		case chem.Molecule.BOND.TYPE.AROMATIC:
			path = this.drawBondAromatic(hb1, hb2, bond);
			break;
		case chem.Molecule.BOND.TYPE.ANY:
			path = this.drawBondAny(hb1, hb2, bond);
			break;
		default:
			throw new Error("Bond type " + bond.b.type + " not supported");
	}
	return path;
}

rnd.MolData.prototype.radicalCap = function (p)
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
}

rnd.MolData.prototype.radicalBullet = function (p)
{
	var settings = this.render.settings;
	var paper = this.render.paper;
	return paper.circle(p.x, p.y, settings.lineWidth)
	.attr({
		stroke: null,
		fill: '#000'
	});
}

rnd.MolData.prototype.centerText = function (path, rbb)
{
	// TODO: find a better way
	if (this.render.paper.raphael.vml) {
		this.pathAndRBoxTranslate(path, rbb, 0, rbb.height * 0.16); // dirty hack
	}
}

rnd.MolData.prototype.showAtomHighlighting = function (aid, atom, visible)
{
	var exists = (atom.highlighting != null) && !atom.highlighting.removed;
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			atom.highlighting = paper
			.circle(atom.ps.x, atom.ps.y, styles.atomSelectionPlateRadius)
			.attr(styles.highlightStyle);
			if (rnd.DEBUG)
				atom.highlighting.attr({
					'fill':'#AAA'
				});
			this.addAtomPath('highlighting', aid, atom.highlighting);
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
}

rnd.MolData.prototype.showAtomSGroupHighlighting = function (aid, atom, visible)
{
	var exists = (atom.sGroupHighlighting != null) && !atom.sGroupHighlighting.removed;
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			atom.sGroupHighlighting = paper
			.circle(atom.ps.x, atom.ps.y, 0.7 * styles.atomSelectionPlateRadius)
			.attr(styles.sGroupHighlightStyle);
			this.addAtomPath('highlighting', aid, atom.sGroupHighlighting);
		}
		atom.sGroupHighlighting.show();
	} else {
		if (exists) {
			atom.sGroupHighlighting.hide();
		}
	}
}

rnd.MolData.prototype.showAtomSelection = function (aid, atom, visible)
{
	var exists = (atom.selectionPlate != null) && !atom.selectionPlate.removed;
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			atom.selectionPlate = paper
			.circle(atom.ps.x, atom.ps.y, styles.atomSelectionPlateRadius)
			.attr(styles.selectionStyle);
			this.addAtomPath('selection-plate', aid, atom.selectionPlate);
		}
		atom.selectionPlate.show();
	} else {
		if (exists)
			atom.selectionPlate.hide();
	}
}

rnd.MolData.prototype.showBracketSelection = function (sgid, sg, visible)
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
			var vext = new chem.Vec2(lw * 4, lw * 6);
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
}

rnd.MolData.prototype.showBracketHighlighting = function (sgid, sg, visible)
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
			var vext = new chem.Vec2(lw * 4, lw * 6);
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
}

rnd.MolData.prototype.pathAndRBoxTranslate = function (path, rbb, x, y) {
	path.translate(x, y)
	rbb.x += x;
	rbb.y += y;
}

var markerColors = ['black', 'cyan', 'magenta', 'red', 'green', 'blue', 'green'];

rnd.MolData.prototype.showLabels = function ()
{
	var render = this.render;
	var settings = render.settings;
	var opt = render.opt;
	var paper = render.paper;
	var delta = 0.5 * settings.lineWidth;
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);

		if (rnd.DEBUG) {
			var marker = paper
			.circle(atom.ps.x, atom.ps.y, settings.fontsz * 0.5)
			.attr('stroke', 'none')
			.attr('fill', markerColors[atom.a.sgroup+1])
			.attr('opacity', '0.5');
			this.addAtomPath('data', aid, marker, marker.getBBox());
		}
		var index = null;
		if (opt.showAtomIds) {
			index = {};
			index.text = aid.toString();
			index.path = paper.text(atom.ps.x, atom.ps.y, index.text)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontszsub,
				'fill' : '#070'
			});
			index.rbb = index.path.getBBox();
			this.centerText(index.path, index.rbb);
			this.addAtomPath('indices', aid, index.path, index.rbb);
		}
		if (atom.selected)
			this.showAtomSelection(aid, atom, true);
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
			} else {
				label.text = atom.a.label;
				if (opt.atomColoring) {
					var elem = chem.Element.getElementByLabel(label.text);
					if (elem)
						color = chem.Element.elements.get(elem).color;
				}
			}
			label.path = paper.text(atom.ps.x, atom.ps.y, label.text)
			.attr({
				'font' : settings.font,
				'font-size' : settings.fontsz,
				'fill' : color
			});
			label.rbb = label.path.getBBox();
			this.centerText(label.path, label.rbb);
			this.addAtomPath('data', aid, label.path, label.rbb);
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
				paper.text(atom.ps.x, atom.ps.y, hydroIndex.text)
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
				this.addAtomPath('data', aid, hydroIndex.path, hydroIndex.rbb);
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

				charge.path = paper.text(atom.ps.x, atom.ps.y, charge.text)
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
				this.addAtomPath('data', aid, charge.path, charge.rbb);
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
							this.radicalBullet(atom.ps).translate(-hshift, 0),
							this.radicalBullet(atom.ps).translate(hshift, 0));
						radical.path.attr('fill', color);
						break;
					case 2:
						radical.path = this.radicalBullet(atom.ps)
						.attr('fill', color);
						break;
					case 3:
						radical.path = paper.set();
						hshift = 1.6 * settings.lineWidth;
						radical.path.push(
							this.radicalCap(atom.ps).translate(-hshift, 0),
							this.radicalCap(atom.ps).translate(hshift, 0));
						radical.path.attr('stroke', color);
						break;
				}
				radical.rbb = radical.path.getBBox();
				var vshift = -0.5 * (label.rbb.height + radical.rbb.height);
				if (atom.a.radical == 3)
					vshift -= settings.lineWidth/2;
				this.pathAndRBoxTranslate(radical.path, radical.rbb,
					0, vshift);
				this.addAtomPath('data', aid, radical.path, radical.rbb);
			}

			var isotope = {};
			if (atom.a.isotope != 0)
			{
				isotope.text = atom.a.isotope.toString();
				isotope.path = paper.text(atom.ps.x, atom.ps.y, isotope.text)
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
				this.addAtomPath('data', aid, isotope.path, isotope.rbb);
			}
			if (!isHydrogen && implh > 0)
			{
				hydrogen.text = 'H';
				hydrogen.path = paper.text(atom.ps.x, atom.ps.y, hydrogen.text)
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
					paper.text(atom.ps.x, atom.ps.y, hydroIndex.text)
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
				this.addAtomPath('data', aid, hydrogen.path, hydrogen.rbb);
				if (hydroIndex != null)
					this.addAtomPath('data', aid, hydroIndex.path, hydroIndex.rbb);
			}
			if (atom.badConn && opt.showValenceWarnings) {
				var warning = {};
				var y = atom.ps.y + label.rbb.height / 2 + delta;
				warning.path = paper.path("M{0},{1}L{2},{3}",
					atom.ps.x + leftMargin, y, atom.ps.x + rightMargin, y)
				.attr(this.render.styles.lineattr)
				.attr({
					'stroke':'#F00'
				});
				warning.rbb = warning.path.getBBox();
				this.addAtomPath('warnings', aid, warning.path, warning.rbb);
			}
			if (index)
				this.pathAndRBoxTranslate(index.path, index.rbb,
					-0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
					0.3 * label.rbb.height);
		}
	}
}

rnd.MolData.prototype.showBondHighlighting = function (bid, bond, visible)
{
	var exists = (bond.highlighting != null) && !bond.highlighting.removed;
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			bond.highlighting = paper
			.ellipse(bond.center.x, bond.center.y, bond.sa, bond.sb)
			.rotate(bond.angle)
			.attr(styles.highlightStyle);
			if (rnd.DEBUG)
				bond.highlighting.attr({
					'fill':'#AAA'
				});
			this.addBondPath('highlighting', bid, bond.highlighting);
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
}

rnd.MolData.prototype.showBondSelection = function (bid, bond, visible)
{
	if (!this.bonds.has(bid))
		return;
	var exists = (bond.selectionPlate != null) && !bond.selectionPlate.removed;
	if (visible) {
		if (!exists) {
			var render = this.render;
			var styles = render.styles;
			var paper = render.paper;
			bond.selectionPlate = paper
			.ellipse(bond.center.x, bond.center.y, bond.sa, bond.sb)
			.rotate(bond.angle)
			.attr(styles.selectionStyle);
			this.addBondPath('selection-plate', bid, bond.selectionPlate);
		}
		bond.selectionPlate.show();
	} else {
		if (exists)
			bond.selectionPlate.hide();
	}
}

rnd.MolData.prototype.showBonds = function ()
{
	var render = this.render;
	var settings = render.settings;
	var paper = render.paper;
	var opt = render.opt;
	for (var bid in this.bondsChanged) {
		var bond = this.bonds.get(bid);
		var p1 = this.atoms.get(bond.b.begin).ps,
		p2 = this.atoms.get(bond.b.end).ps;
		var hb1 = this.halfBonds.get(bond.hb1),
		hb2 = this.halfBonds.get(bond.hb2);
		bond.center = chem.Vec2.lc2(p1, 0.5, p2, 0.5);
		bond.len = chem.Vec2.dist(p1, p2);
		bond.sb = settings.lineWidth * 5;
		bond.sa = Math.max(bond.sb,  bond.len / 2 - settings.lineWidth * 2);
		bond.angle = Math.atan2(hb1.dir.y, hb1.dir.x) * 180 / Math.PI;
		bond.path = this.drawBond(bond, hb1, hb2);
		bond.rbb = bond.path.getBBox();
		this.addBondPath('data', bid, bond.path, bond.rbb);
		if (bond.selected)
			this.showBondSelection(bid, bond, true);
		if (bond.highlight)
			this.showBondHighlighting(bid, bond, true);
		var bondIdxOff = settings.subFontSize * 0.6;
		var ipath = null, irbb = null;
		if (opt.showBondIds) {
			var pb = chem.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb1.norm, bondIdxOff);
			ipath = paper.text(pb.x, pb.y, bid.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			this.addBondPath('indices', bid, ipath, irbb);
			var phb1 = chem.Vec2.lc(hb1.p, 0.8, hb2.p, 0.2, hb1.norm, bondIdxOff);
			ipath = paper.text(phb1.x, phb1.y, bond.hb1.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			this.addBondPath('indices', bid, ipath, irbb);
			var phb2 = chem.Vec2.lc(hb1.p, 0.2, hb2.p, 0.8, hb1.norm, bondIdxOff);
			ipath = paper.text(phb2.x, phb2.y, bond.hb2.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			this.addBondPath('indices', bid, ipath, irbb);
		} else if (opt.showLoopIds) {
			var pl1 = chem.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb2.norm, bondIdxOff);
			ipath = paper.text(pl1.x, pl1.y, hb1.loop.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			this.addBondPath('indices', bid, ipath, irbb);
			var pl2 = chem.Vec2.lc(hb1.p, 0.5, hb2.p, 0.5, hb1.norm, bondIdxOff);
			ipath = paper.text(pl2.x, pl2.y, hb2.loop.toString());
			irbb = ipath.getBBox();
			this.centerText(ipath, irbb);
			this.addBondPath('indices', bid, ipath, irbb);
		}
	}
}

rnd.MolData.prototype.labelIsVisible = function (aid, atom)
{
	if (atom.neighbors.length < 2 ||
		atom.a.label.toLowerCase() != "c" ||
		(atom.badConn && this.render.opt.showValenceWarnings) ||
		atom.a.isotope != 0 ||
		atom.a.radical != 0 ||
		atom.a.charge != 0 ||
		atom.a.explcitValence)
		return true;
	if (!atom.showLabel && atom.neighbors.length == 2) {
		var n1 = atom.neighbors[0];
		var n2 = atom.neighbors[1];
		var hb1 = this.halfBonds.get(n1);
		var hb2 = this.halfBonds.get(n2);
		var b1 = this.bonds.get(hb1.bid);
		var b2 = this.bonds.get(hb2.bid);
		if (b1.b.type == b2.b.type && b1.b.stereo == chem.Molecule.BOND.STEREO.NONE && b2.b.stereo == chem.Molecule.BOND.STEREO.NONE)
			if (Math.abs(chem.Vec2.cross(hb1.dir, hb2.dir)) < 0.05)
				return true;
	}
	return false;
}

rnd.MolData.prototype.checkLabelsToShow = function ()
{
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);
		atom.showLabel = this.labelIsVisible(aid, atom);
	}
}

rnd.MolData.layerMap = {
	'selection-plate' : 0,
	'highlighting' : 1,
	'warnings' : 2,
	'data' : 3,
	'indices' : 4
}

rnd.MolData.prototype.addSGroupPath = function (group, visel, path)
{
	var offset = this.render.offset;
	if (offset != null)
		path.translate(offset.x, offset.y);
	var bb = chem.Box2Abs.fromRelBox(path.getBBox());
	visel.add(path, bb);
	this.insertInLayer(rnd.MolData.layerMap[group], path);
}

rnd.MolData.prototype.addChiralPath = function (group, visel, path)
{
	var offset = this.render.offset;
	if (offset != null)
		path.translate(offset.x, offset.y);
	var bb = chem.Box2Abs.fromRelBox(path.getBBox());
	visel.add(path, bb);
	this.insertInLayer(rnd.MolData.layerMap[group], path);
}

rnd.MolData.prototype.addAtomPath = function (group, aid, path, rbb)
{
	var visel = this.atoms.get(aid).visel;
	var bb = rbb ? chem.Box2Abs.fromRelBox(rbb) : null;
	var offset = this.render.offset;
	if (offset != null) {
		if (bb != null)
			bb.translate(offset);
		path.translate(offset.x, offset.y);
	}
	visel.add(path, bb);
	this.viselsChanged[aid * 2] = visel; // code aid/bid to identify a visel
	this.insertInLayer(rnd.MolData.layerMap[group], path);
}

rnd.MolData.prototype.addBondPath = function (group, bid, path, rbb)
{
	var visel = this.bonds.get(bid).visel;
	var bb = rbb ? chem.Box2Abs.fromRelBox(rbb) : null;
	var offset = this.render.offset;
	if (offset != null) {
		if (bb != null)
			bb.translate(offset);
		path.translate(offset.x, offset.y);
	}
	visel.add(path, bb);
	this.viselsChanged[bid * 2 + 1] = visel; // code aid/bid to identify a visel
	this.insertInLayer(rnd.MolData.layerMap[group], path);
}

rnd.MolData.prototype.clearVisel = function (visel)
{
	for (var i = 0; i < visel.paths.length; ++i)
		visel.paths[i].remove();
	visel.clear();
}

rnd.MolData.prototype.shiftBonds = function ()
{    
	var settings = this.render.settings;
	for (var aid in this.atomsChanged) {
		var atom = this.atoms.get(aid);
		atom.neighbors.each( function (hbid) {
			var hb = this.halfBonds.get(hbid);
			hb.p = atom.ps;
			var t = 0;
			var visel = atom.visel;
			for (var i = 0; i < visel.boxes.length; ++i)
				t = Math.max(t, chem.Vec2.shiftRayBox(hb.p, hb.dir, visel.boxes[i]));
			if (t > 0)
				hb.p = hb.p.addScaled(hb.dir, t + 2 * settings.lineWidth);
		}, this)
	}
}

rnd.MolData.prototype.selectDoubleBondShift = function (n1, n2, d1, d2) {
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

rnd.MolData.prototype.setDoubleBondShift = function ()
{
	// double bonds in loops
	for (var bid in this.bondsChanged) {
		var bond = this.bonds.get(bid);
		var loop1, loop2;
		loop1 = this.halfBonds.get(bond.hb1).loop;
		loop2 = this.halfBonds.get(bond.hb2).loop;
		if (loop1 >= 0 && loop2 >= 0) {
			var d1 = this.loops.get(loop1).dblBonds;
			var d2 = this.loops.get(loop2).dblBonds;
			var n1 = this.loops.get(loop1).hbs.length;
			var n2 = this.loops.get(loop2).hbs.length;
			bond.doubleBondShift = this.selectDoubleBondShift(n1, n2, d1, d2);
		} else if (loop1 >= 0) {
			bond.doubleBondShift = -1;
		} else if (loop2 >= 0) {
			bond.doubleBondShift = 1;
		}
	}
}