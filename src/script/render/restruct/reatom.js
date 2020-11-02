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

import Box2Abs from '../../util/box2abs';
import ReObject from './reobject';
import scale from '../../util/scale';
import element from '../../chem/element';
import { sketchingColors as elementColor } from '../../chem/element-color';
import draw from '../draw';
import util from '../util';
import Vec2 from '../../util/vec2';
import { Bond } from '../../chem/struct';

function ReAtom(/* chem.Atom*/atom) {
	this.init('atom');

	this.a = atom; // TODO rename a to item
	this.showLabel = false;

	this.hydrogenOnTheLeft = false;

	this.color = '#000000';
	this.component = -1;
}

ReAtom.prototype = new ReObject();
ReAtom.isSelectable = function () {
	return true;
};

ReAtom.prototype.getVBoxObj = function (render) {
	if (this.visel.boundingBox)
		return ReObject.prototype.getVBoxObj.call(this, render);
	return new Box2Abs(this.a.pp, this.a.pp);
};

ReAtom.prototype.drawHighlight = function (render) {
	var ret = this.makeHighlightPlate(render);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReAtom.prototype.makeHighlightPlate = function (render) {
	var paper = render.paper;
	var options = render.options;
	var ps = scale.obj2scaled(this.a.pp, options);
	return paper.circle(ps.x, ps.y, options.atomSelectionPlateRadius)
		.attr(options.highlightStyle);
};

ReAtom.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	var ps = scale.obj2scaled(this.a.pp, restruct.render.options);
	return paper.circle(ps.x, ps.y, styles.atomSelectionPlateRadius)
		.attr(styles.selectionStyle);
};

ReAtom.prototype.show = function (restruct, aid, options) { // eslint-disable-line max-statements
	const render = restruct.render;
	const ps = scale.obj2scaled(this.a.pp, render.options);

	this.hydrogenOnTheLeft = setHydrogenPos(restruct.molecule, this);
	this.showLabel = isLabelVisible(restruct, render.options, this);
	this.color = 'black'; // reset colour
	if (this.showLabel) {
		var label = buildLabel(this, render.paper, ps, options);
		var delta = 0.5 * options.lineWidth;
		var rightMargin = label.rbb.width / 2;
		var leftMargin = -label.rbb.width / 2;
		var implh = Math.floor(this.a.implicitH);
		var isHydrogen = label.text === 'H';
		restruct.addReObjectPath('data', this.visel, label.path, ps, true);

		var index = null;
		if (options.showAtomIds) {
			index = {};
			index.text = aid.toString();
			index.path = render.paper.text(ps.x, ps.y, index.text)
				.attr({
					font: options.font,
					'font-size': options.fontszsub,
					fill: '#070'
				});
			index.rbb = util.relBox(index.path.getBBox());
			draw.recenterText(index.path, index.rbb);
			restruct.addReObjectPath('indices', this.visel, index.path, ps);
		}
		this.setHighlight(this.highlight, render);
	}

	if (this.showLabel && !this.a.alias && !this.a.pseudo) {
		var hydroIndex = null;
		if (isHydrogen && implh > 0) {
			hydroIndex = showHydroIndex(this, render, implh, rightMargin);
			rightMargin += hydroIndex.rbb.width + delta;
			restruct.addReObjectPath('data', this.visel, hydroIndex.path, ps, true);
		}

		if (this.a.radical != 0) {
			var radical = showRadical(this, render);
			restruct.addReObjectPath('data', this.visel, radical.path, ps, true);
		}
		if (this.a.isotope != 0) {
			var isotope = showIsotope(this, render, leftMargin);
			leftMargin -= isotope.rbb.width + delta;
			restruct.addReObjectPath('data', this.visel, isotope.path, ps, true);
		}
		if (!isHydrogen && implh > 0 && displayHydrogen(options.showHydrogenLabels, this)) {
			var data = showHydrogen(this, render, implh, {
				hydrogen: {},
				hydroIndex,
				rightMargin,
				leftMargin
			});
			var hydrogen = data.hydrogen;
			hydroIndex = data.hydroIndex;
			rightMargin = data.rightMargin;
			leftMargin = data.leftMargin;
			restruct.addReObjectPath('data', this.visel, hydrogen.path, ps, true);
			if (hydroIndex != null)
				restruct.addReObjectPath('data', this.visel, hydroIndex.path, ps, true);
		}

		if (this.a.charge != 0 && options.showCharge) {
			var charge = showCharge(this, render, rightMargin);
			rightMargin += charge.rbb.width + delta;
			restruct.addReObjectPath('data', this.visel, charge.path, ps, true);
		}
		if (this.a.explicitValence >= 0 && options.showValence) {
			var valence = showExplicitValence(this, render, rightMargin);
			rightMargin += valence.rbb.width + delta;
			restruct.addReObjectPath('data', this.visel, valence.path, ps, true);
		}

		if (this.a.badConn && options.showValenceWarnings) {
			var warning = showWarning(this, render, leftMargin, rightMargin);
			restruct.addReObjectPath('warnings', this.visel, warning.path, ps, true);
		}
		if (index) {
			/* eslint-disable no-mixed-operators */
			pathAndRBoxTranslate(index.path, index.rbb,
				-0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
				0.3 * label.rbb.height);
			/* eslint-enable no-mixed-operators */
		}
	}

	if (this.a.attpnt) {
		const lsb = bisectLargestSector(this, restruct.molecule);
		showAttpnt(this, render, lsb, restruct.addReObjectPath.bind(restruct));
	}

	let aamText = getAamText(this);
	const queryAttrsText = (!this.a.alias && !this.a.pseudo) ? getQueryAttrsText(this) : '';

	// this includes both aam flags, if any, and query features, if any
	// we render them together to avoid possible collisions
	aamText = (queryAttrsText.length > 0 ? queryAttrsText + '\n' : '') + (aamText.length > 0 ? '.' + aamText + '.' : '');
	if (aamText.length > 0) {
		var elem = element.map[this.a.label];
		var aamPath = render.paper.text(ps.x, ps.y, aamText).attr({
			font: options.font,
			'font-size': options.fontszsub,
			fill: (options.atomColoring && elem) ? elementColor[this.a.label] : '#000'
		});
		var aamBox = util.relBox(aamPath.getBBox());
		draw.recenterText(aamPath, aamBox);
		var dir = bisectLargestSector(this, restruct.molecule);
		var visel = this.visel;
		var t = 3;
		// estimate the shift to clear the atom label
		for (var i = 0; i < visel.exts.length; ++i)
			t = Math.max(t, util.shiftRayBox(ps, dir, visel.exts[i].translate(ps)));
		// estimate the shift backwards to account for the size of the aam/query text box itself
		t += util.shiftRayBox(ps, dir.negated(), Box2Abs.fromRelBox(aamBox));
		dir = dir.scaled(8 + t);
		pathAndRBoxTranslate(aamPath, aamBox, dir.x, dir.y);
		restruct.addReObjectPath('data', this.visel, aamPath, ps, true);
	}
};

function isLabelVisible(restruct, options, atom) {
	const visibleTerminal = options.showHydrogenLabels !== 'off' &&
		options.showHydrogenLabels !== 'Hetero';

	const neighborsLength = atom.a.neighbors.length === 0 || (atom.a.neighbors.length < 2 && visibleTerminal);

	const shouldBeVisible =
		neighborsLength ||
		options.carbonExplicitly ||
		atom.a.alias ||
		atom.a.isotope !== 0 ||
		atom.a.radical !== 0 ||
		atom.a.charge !== 0 ||
		atom.a.explicitValence >= 0 ||
		atom.a.atomList !== null ||
		atom.a.rglabel !== null ||
		atom.a.badConn && options.showValenceWarnings ||
		atom.a.label.toLowerCase() !== 'c';

	if (shouldBeVisible)
		return true;

	if (atom.a.neighbors.length === 2) {
		const nei1 = atom.a.neighbors[0];
		const nei2 = atom.a.neighbors[1];
		const hb1 = restruct.molecule.halfBonds.get(nei1);
		const hb2 = restruct.molecule.halfBonds.get(nei2);
		const bond1 = restruct.bonds.get(hb1.bid);
		const bond2 = restruct.bonds.get(hb2.bid);

		const sameNotStereo = bond1.b.type === bond2.b.type &&
			bond1.b.stereo === Bond.PATTERN.STEREO.NONE &&
			bond2.b.stereo === Bond.PATTERN.STEREO.NONE;

		if (sameNotStereo && Math.abs(Vec2.cross(hb1.dir, hb2.dir)) < 0.2)
			return true;
	}

	return false;
}

function displayHydrogen(hydrogenLabels, atom) {
	return (
		(hydrogenLabels === 'on') ||
		(hydrogenLabels === 'Terminal' && atom.a.neighbors.length < 2) ||
		(hydrogenLabels === 'Hetero' && atom.label.text.toLowerCase() !== 'c') ||
		(hydrogenLabels === 'Terminal and Hetero' && (atom.a.neighbors.length < 2 || atom.label.text.toLowerCase() !== 'c'))
	);
}

function setHydrogenPos(struct, atom) {
	// check where should the hydrogen be put on the left of the label
	if (atom.a.neighbors.length === 0) {
		const elem = element.map[atom.a.label];
		return !elem || element[elem].leftH;
	}

	let yl = 1;
	let yr = 1;
	let nl = 0;
	let nr = 0;

	atom.a.neighbors.forEach((nei) => {
		const d = struct.halfBonds.get(nei).dir;

		if (d.x <= 0) {
			yl = Math.min(yl, Math.abs(d.y));
			nl++;
		} else {
			yr = Math.min(yr, Math.abs(d.y));
			nr++;
		}
	});

	return (yl < 0.51 || yr < 0.51) ? yr < yl : nr > nl;
}

function buildLabel(atom, paper, ps, options) { // eslint-disable-line max-statements
	let label = {};
	label.text = getLabelText(atom.a);

	if (label.text === '')
		label = 'R#'; // for structures that missed 'M  RGP' tag in molfile

	if (label.text === atom.a.label) {
		const elem = element.map[label.text];
		if (options.atomColoring && elem)
			atom.color = elementColor[label.text] || '#000';
	}

	label.path = paper.text(ps.x, ps.y, label.text)
		.attr({
			font: options.font,
			'font-size': options.fontsz,
			fill: atom.color,
			'font-style': atom.a.pseudo ? 'italic' : ''
		});

	label.rbb = util.relBox(label.path.getBBox());
	draw.recenterText(label.path, label.rbb);

	if (atom.a.atomList !== null)
		pathAndRBoxTranslate(label.path, label.rbb, (atom.hydrogenOnTheLeft ? -1 : 1) * (label.rbb.width - label.rbb.height) / 2, 0);

	atom.label = label;
	return label;
}

function getLabelText(atom) {
	if (atom.atomList !== null)
		return atom.atomList.label();

	if (atom.pseudo)
		return atom.pseudo;

	if (atom.alias)
		return atom.alias;

	if (atom.label === 'R#' && atom.rglabel !== null) {
		let text = '';

		for (let rgi = 0; rgi < 32; rgi++) {
			if (atom.rglabel & (1 << rgi)) // eslint-disable-line max-depth
				text += ('R' + (rgi + 1).toString());
		}

		return text;
	}

	return atom.label;
}

function showHydroIndex(atom, render, implh, rightMargin) {
	var ps = scale.obj2scaled(atom.a.pp, render.options);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var hydroIndex = {};
	hydroIndex.text = (implh + 1).toString();
	hydroIndex.path =
		render.paper.text(ps.x, ps.y, hydroIndex.text)
			.attr({
				font: options.font,
				'font-size': options.fontszsub,
				fill: atom.color
			});
	hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox());
	draw.recenterText(hydroIndex.path, hydroIndex.rbb);
	/* eslint-disable no-mixed-operators*/
	pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
		rightMargin + 0.5 * hydroIndex.rbb.width + delta,
		0.2 * atom.label.rbb.height);
	/* eslint-enable no-mixed-operators*/
	return hydroIndex;
}

function showRadical(atom, render) {
	var ps = scale.obj2scaled(atom.a.pp, render.options);
	var options = render.options;
	var paper = render.paper;
	var radical = {};
	var hshift;
	switch (atom.a.radical) {
	case 1:
		radical.path = paper.set();
		hshift = 1.6 * options.lineWidth;
		radical.path.push(
			draw.radicalBullet(paper, ps.add(new Vec2(-hshift, 0)), options),
			draw.radicalBullet(paper, ps.add(new Vec2(hshift, 0)), options)
		);
		radical.path.attr('fill', atom.color);
		break;
	case 2:
		radical.path = paper.set();
		radical.path.push(
			draw.radicalBullet(paper, ps, options)
		);
		radical.path.attr('fill', atom.color);
		break;
	case 3:
		radical.path = paper.set();
		hshift = 1.6 * options.lineWidth;
		radical.path.push(
			draw.radicalCap(paper, ps.add(new Vec2(-hshift, 0)), options),
			draw.radicalCap(paper, ps.add(new Vec2(hshift, 0)), options)
		);
		radical.path.attr('stroke', atom.color);
		break;
	default:
		break;
	}
	radical.rbb = util.relBox(radical.path.getBBox());
	var vshift = -0.5 * (atom.label.rbb.height + radical.rbb.height);
	if (atom.a.radical === 3)
		vshift -= options.lineWidth / 2;
	pathAndRBoxTranslate(radical.path, radical.rbb,
		0, vshift);
	return radical;
}

function showIsotope(atom, render, leftMargin) {
	var ps = scale.obj2scaled(atom.a.pp, render.options);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var isotope = {};
	isotope.text = atom.a.isotope.toString();
	isotope.path = render.paper.text(ps.x, ps.y, isotope.text)
		.attr({
			font: options.font,
			'font-size': options.fontszsub,
			fill: atom.color
		});
	isotope.rbb = util.relBox(isotope.path.getBBox());
	draw.recenterText(isotope.path, isotope.rbb);
	/* eslint-disable no-mixed-operators*/
	pathAndRBoxTranslate(isotope.path, isotope.rbb,
		leftMargin - 0.5 * isotope.rbb.width - delta,
		-0.3 * atom.label.rbb.height);
	/* eslint-enable no-mixed-operators*/
	return isotope;
}

function showCharge(atom, render, rightMargin) {
	var ps = scale.obj2scaled(atom.a.pp, render.options);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var charge = {};
	charge.text = '';
	var absCharge = Math.abs(atom.a.charge);
	if (absCharge != 1)
		charge.text = absCharge.toString();
	if (atom.a.charge < 0)
		charge.text += '\u2013';
	else
		charge.text += '+';

	charge.path = render.paper.text(ps.x, ps.y, charge.text)
		.attr({
			font: options.font,
			'font-size': options.fontszsub,
			fill: atom.color
		});
	charge.rbb = util.relBox(charge.path.getBBox());
	draw.recenterText(charge.path, charge.rbb);
	/* eslint-disable no-mixed-operators*/
	pathAndRBoxTranslate(charge.path, charge.rbb,
		rightMargin + 0.5 * charge.rbb.width + delta,
		-0.3 * atom.label.rbb.height);
	/* eslint-enable no-mixed-operators*/
	return charge;
}

function showExplicitValence(atom, render, rightMargin) {
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
	var ps = scale.obj2scaled(atom.a.pp, render.options);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var valence = {};
	valence.text = mapValence[atom.a.explicitValence];
	if (!valence.text)
		throw new Error('invalid valence ' + atom.a.explicitValence.toString());
	valence.text = '(' + valence.text + ')';
	valence.path = render.paper.text(ps.x, ps.y, valence.text)
		.attr({
			font: options.font,
			'font-size': options.fontszsub,
			fill: atom.color
		});
	valence.rbb = util.relBox(valence.path.getBBox());
	draw.recenterText(valence.path, valence.rbb);
	/* eslint-disable no-mixed-operators*/
	pathAndRBoxTranslate(valence.path, valence.rbb,
		rightMargin + 0.5 * valence.rbb.width + delta,
		-0.3 * atom.label.rbb.height);
	/* eslint-enable no-mixed-operators*/
	return valence;
}

function showHydrogen(atom, render, implh, data) { // eslint-disable-line max-statements
	var hydroIndex = data.hydroIndex;
	var hydrogenLeft = atom.hydrogenOnTheLeft;
	var ps = scale.obj2scaled(atom.a.pp, render.options);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var hydrogen = data.hydrogen;
	hydrogen.text = 'H';
	hydrogen.path = render.paper.text(ps.x, ps.y, hydrogen.text).attr({
		font: options.font,
		'font-size': options.fontsz,
		fill: atom.color
	});
	hydrogen.rbb = util.relBox(hydrogen.path.getBBox());
	draw.recenterText(hydrogen.path, hydrogen.rbb);
	if (!hydrogenLeft) {
		pathAndRBoxTranslate(hydrogen.path, hydrogen.rbb,
			data.rightMargin + (0.5 * hydrogen.rbb.width) + delta, 0);
		data.rightMargin += hydrogen.rbb.width + delta;
	}
	if (implh > 1) {
		hydroIndex = {};
		hydroIndex.text = implh.toString();
		hydroIndex.path = render.paper.text(ps.x, ps.y, hydroIndex.text)
			.attr({
				font: options.font,
				'font-size': options.fontszsub,
				fill: atom.color
			});
		hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox());
		draw.recenterText(hydroIndex.path, hydroIndex.rbb);
		if (!hydrogenLeft) {
			pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
				data.rightMargin + (0.5 * hydroIndex.rbb.width) + delta,
				0.2 * atom.label.rbb.height);
			data.rightMargin += hydroIndex.rbb.width + delta;
		}
	}
	if (hydrogenLeft) {
		if (hydroIndex != null) {
			pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
				data.leftMargin - (0.5 * hydroIndex.rbb.width) - delta,
				0.2 * atom.label.rbb.height);
			data.leftMargin -= hydroIndex.rbb.width + delta;
		}
		pathAndRBoxTranslate(hydrogen.path, hydrogen.rbb,
			data.leftMargin - (0.5 * hydrogen.rbb.width) - delta, 0);
		data.leftMargin -= hydrogen.rbb.width + delta;
	}
	return Object.assign(data, { hydrogen, hydroIndex });
}

function showWarning(atom, render, leftMargin, rightMargin) {
	var ps = scale.obj2scaled(atom.a.pp, render.options);
	var delta = 0.5 * render.options.lineWidth;
	var tfx = util.tfx;
	var warning = {};
	var y = ps.y + (atom.label.rbb.height / 2) + delta;
	warning.path = render.paper.path('M{0},{1}L{2},{3}',
		tfx(ps.x + leftMargin), tfx(y), tfx(ps.x + rightMargin), tfx(y))
		.attr(render.options.lineattr).attr({ stroke: '#F00' });
	warning.rbb = util.relBox(warning.path.getBBox());
	return warning;
}

function showAttpnt(atom, render, lsb, addReObjectPath) { // eslint-disable-line max-statements
	var asterisk = '∗';
	var ps = scale.obj2scaled(atom.a.pp, render.options);
	var options = render.options;
	var tfx = util.tfx;
	var i,
		j;
	for (i = 0; i < 4; ++i) {
		var attpntText = '';
		if (atom.a.attpnt & (1 << i)) {
			if (attpntText.length > 0)
				attpntText += ' ';
			attpntText += asterisk;
			for (j = 0; j < (i == 0 ? 0 : (i + 1)); ++j)
				attpntText += '\'';
			var pos0 = new Vec2(ps);
			var pos1 = ps.addScaled(lsb, 0.7 * options.scale);

			var attpntPath1 = render.paper.text(pos1.x, pos1.y, attpntText)
				.attr({
					font: options.font,
					'font-size': options.fontsz,
					fill: atom.color
				});
			var attpntRbb = util.relBox(attpntPath1.getBBox());
			draw.recenterText(attpntPath1, attpntRbb);

			var lsbn = lsb.negated();
			/* eslint-disable no-mixed-operators*/
			pos1 = pos1.addScaled(lsbn, util.shiftRayBox(pos1, lsbn, Box2Abs.fromRelBox(attpntRbb)) + options.lineWidth / 2);
			/* eslint-enable no-mixed-operators*/
			pos0 = shiftBondEnd(atom, pos0, lsb, options.lineWidth);
			var n = lsb.rotateSC(1, 0);
			var arrowLeft = pos1.addScaled(n, 0.05 * options.scale).addScaled(lsbn, 0.09 * options.scale);
			var arrowRight = pos1.addScaled(n, -0.05 * options.scale).addScaled(lsbn, 0.09 * options.scale);
			var attpntPath = render.paper.set();
			attpntPath.push(
				attpntPath1,
				render.paper.path('M{0},{1}L{2},{3}M{4},{5}L{2},{3}L{6},{7}', tfx(pos0.x), tfx(pos0.y), tfx(pos1.x), tfx(pos1.y), tfx(arrowLeft.x), tfx(arrowLeft.y), tfx(arrowRight.x), tfx(arrowRight.y))
					.attr(render.options.lineattr).attr({ 'stroke-width': options.lineWidth / 2 })
			);
			addReObjectPath('indices', atom.visel, attpntPath, ps);
			lsb = lsb.rotate(Math.PI / 6);
		}
	}
}

function getAamText(atom) {
	var aamText = '';
	if (atom.a.aam > 0) aamText += atom.a.aam;
	if (atom.a.invRet > 0) {
		if (aamText.length > 0) aamText += ',';
		if (atom.a.invRet == 1) aamText += 'Inv';
		else if (atom.a.invRet == 2) aamText += 'Ret';
		else throw new Error('Invalid value for the invert/retain flag');
	}
	if (atom.a.exactChangeFlag > 0) {
		if (aamText.length > 0) aamText += ',';
		if (atom.a.exactChangeFlag == 1) aamText += 'ext';
		else throw new Error('Invalid value for the exact change flag');
	}
	return aamText;
}

function getQueryAttrsText(atom) {
	var queryAttrsText = '';
	if (atom.a.ringBondCount != 0) {
		if (atom.a.ringBondCount > 0) queryAttrsText += 'rb' + atom.a.ringBondCount.toString();
		else if (atom.a.ringBondCount == -1) queryAttrsText += 'rb0';
		else if (atom.a.ringBondCount == -2) queryAttrsText += 'rb*';
		else throw new Error('Ring bond count invalid');
	}
	if (atom.a.substitutionCount != 0) {
		if (queryAttrsText.length > 0) queryAttrsText += ',';
		if (atom.a.substitutionCount > 0) queryAttrsText += 's' + atom.a.substitutionCount.toString();
		else if (atom.a.substitutionCount == -1) queryAttrsText += 's0';
		else if (atom.a.substitutionCount == -2) queryAttrsText += 's*';
		else throw new Error('Substitution count invalid');
	}
	if (atom.a.unsaturatedAtom > 0) {
		if (queryAttrsText.length > 0) queryAttrsText += ',';
		if (atom.a.unsaturatedAtom == 1) queryAttrsText += 'u';
		else throw new Error('Unsaturated atom invalid value');
	}
	if (atom.a.hCount > 0) {
		if (queryAttrsText.length > 0) queryAttrsText += ',';
		queryAttrsText += 'H' + (atom.a.hCount - 1).toString();
	}
	return queryAttrsText;
}

function pathAndRBoxTranslate(path, rbb, x, y) {
	path.translateAbs(x, y);
	rbb.x += x;
	rbb.y += y;
}

function bisectLargestSector(atom, struct) {
	var angles = [];
	atom.a.neighbors.forEach((hbid) => {
		var hb = struct.halfBonds.get(hbid);
		angles.push(hb.ang);
	});
	angles = angles.sort((a, b) => a - b);
	var da = [];
	for (var i = 0; i < angles.length - 1; ++i)
		da.push(angles[(i + 1) % angles.length] - angles[i]);
	da.push(angles[0] - angles[angles.length - 1] + (2 * Math.PI));
	var daMax = 0;
	var ang = -Math.PI / 2;
	for (i = 0; i < angles.length; ++i) {
		if (da[i] > daMax) {
			daMax = da[i];
			ang = angles[i] + (da[i] / 2);
		}
	}
	return new Vec2(Math.cos(ang), Math.sin(ang));
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

export default ReAtom;
