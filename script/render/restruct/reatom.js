var Box2Abs = require('../../util/box2abs');
var ReObject = require('./reobject');

var element = require('../../chem/element');
var draw = require('../draw');
var util = require('../../util');
var Vec2 = require('../../util/vec2');

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
	var ps = render.ps(this.a.pp);
	return paper.circle(ps.x, ps.y, options.atomSelectionPlateRadius)
		.attr(options.highlightStyle);
};

ReAtom.prototype.makeSelectionPlate = function (restruct, paper, styles) {
	var ps = restruct.render.ps(this.a.pp);
	return paper.circle(ps.x, ps.y, styles.atomSelectionPlateRadius)
		.attr(styles.selectionStyle);
};

ReAtom.prototype.show = function (render, aid, addReObjectPath) {
	var ps = render.ps(this.a.pp);
	var label = this.buildLabel(render);
	var delta = 0.5 * render.options.lineWidth;
	var rightMargin = label.rbb.width / 2;
	var leftMargin = -label.rbb.width / 2;
	var implh = Math.floor(this.a.implicitH);
	var isHydrogen = label.text == 'H';
	var hydroIndex = null;
	addReObjectPath('data', this.visel, label.path, ps, true);

	var index = null;
	if (render.options.showAtomIds) {
		index = {};
		index.text = aid.toString();
		index.path = render.paper.text(ps.x, ps.y, index.text)
			.attr({
				'font': render.options.font,
				'font-size': render.options.fontszsub,
				'fill': '#070'
			});
		index.rbb = util.relBox(index.path.getBBox());
		draw.recenterText(index.path, index.rbb);
		addReObjectPath('indices', this.visel, index.path, ps);
	}
	this.setHighlight(this.highlight, render);

	if (isHydrogen && implh > 0) {
		hydroIndex = this.hydroIndex(render, implh, rightMargin);
		rightMargin += hydroIndex.rbb.width + delta;
		addReObjectPath('data', this.visel, hydroIndex.path, ps, true);
	}

	if (this.a.radical != 0) {
		var radical = this.radical(render);
		addReObjectPath('data', this.visel, radical.path, ps, true);
	}
	if (this.a.isotope != 0) {
		var isotope = this.isotope(render, leftMargin);
		leftMargin -= isotope.rbb.width + delta;
		addReObjectPath('data', this.visel, isotope.path, ps, true);
	}
	if (!isHydrogen && implh > 0 && showHydrogen(render.options.hydrogenLabels, this)) {
		var data = this.hydrogen(render, implh, {
			hydrogen: {},
			hydroIndex: hydroIndex,
			rightMargin: rightMargin,
			leftMargin: leftMargin
		});
		var hydrogen = data.hydrogen;
		hydroIndex = data.hydroIndex;
		rightMargin = data.rightMargin;
		leftMargin = data.leftMargin;
		addReObjectPath('data', this.visel, hydrogen.path, ps, true);
		if (hydroIndex != null)
			addReObjectPath('data', this.visel, hydroIndex.path, ps, true);
	}

	if (this.a.charge != 0 && render.options.showCharge) {
		var charge = this.charge(render, rightMargin);
		rightMargin += charge.rbb.width + delta;
		addReObjectPath('data', this.visel, charge.path, ps, true);
	}
	if (this.a.explicitValence >= 0 && render.options.showValence) {
		var valence = this.explicitValence(render, rightMargin);
		rightMargin += valence.rbb.width + delta;
		addReObjectPath('data', this.visel, valence.path, ps, true);
	}

	if (this.a.badConn && render.options.showValenceWarnings) {
		var warning = this.warning(render, leftMargin, rightMargin);
		addReObjectPath('warnings', this.visel, warning.path, ps, true);
	}
	if (index) {
		/* eslint-disable no-mixed-operators*/
		pathAndRBoxTranslate(index.path, index.rbb,
			-0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
			0.3 * label.rbb.height);
		/* eslint-enable no-mixed-operators*/
	}
};

function showHydrogen(hydrogenLabels, atom) {
	return !!((hydrogenLabels == 'on') ||
	(hydrogenLabels == 'Terminal' && atom.a.neighbors.length < 2) ||
	(hydrogenLabels == 'Hetero' && atom.label.text.toLowerCase() != 'c') ||
	(hydrogenLabels == 'Terminal and Hetero' && (atom.a.neighbors.length < 2 || atom.label.text.toLowerCase() != 'c')));
}

ReAtom.prototype.buildLabel = function (render) {
	var ps = render.ps(this.a.pp);
	var options = render.options;
	var paper = render.paper;
	var label = {};
	if (this.a.atomList != null) {
		label.text = this.a.atomList.label();
	} else if (this.a.label == 'R#' && this.a.rglabel != null) {
		label.text = '';
		for (var rgi = 0; rgi < 32; rgi++) {
			if (this.a.rglabel & (1 << rgi)) // eslint-disable-line max-depth
				label.text += ('R' + (rgi + 1).toString());
		}
		if (label.text == '') label = 'R#'; // for structures that missed 'M  RGP' tag in molfile
	} else {
		label.text = this.a.label;
		var elem = element.getElementByLabel(label.text);
		if (render.options.atomColoring && elem)
			this.color = element[elem].color;
	}
	label.path = paper.text(ps.x, ps.y, label.text)
		.attr({
			'font': options.font,
			'font-size': options.fontsz,
			'fill': this.color
		});
	label.rbb = util.relBox(label.path.getBBox());
	draw.recenterText(label.path, label.rbb);
	if (this.a.atomList != null)
		pathAndRBoxTranslate(label.path, label.rbb, (this.hydrogenOnTheLeft ? -1 : 1) * (label.rbb.width - label.rbb.height) / 2, 0);
	this.label = label;
	return label;
};

ReAtom.prototype.hydroIndex = function (render, implh, rightMargin) {
	var ps = render.ps(this.a.pp);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var hydroIndex = {};
	hydroIndex.text = (implh + 1).toString();
	hydroIndex.path =
		render.paper.text(ps.x, ps.y, hydroIndex.text)
			.attr({
				'font': options.font,
				'font-size': options.fontszsub,
				'fill': this.color
			});
	hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox());
	draw.recenterText(hydroIndex.path, hydroIndex.rbb);
	/* eslint-disable no-mixed-operators*/
	pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
		rightMargin + 0.5 * hydroIndex.rbb.width + delta,
		0.2 * this.label.rbb.height);
	/* eslint-enable no-mixed-operators*/
	return hydroIndex;
};

ReAtom.prototype.radical = function (render) {
	var ps = render.ps(this.a.pp);
	var options = render.options;
	var radical = {};
	var hshift;
	switch (this.a.radical) {
	case 1:
		radical.path = render.paper.set();
		hshift = 1.6 * options.lineWidth;
		radical.path.push(
			draw.radicalBullet(render, ps.add(new Vec2(-hshift, 0))),
			draw.radicalBullet(render, ps.add(new Vec2(hshift, 0))));
		radical.path.attr('fill', this.color);
		break;
	case 2:
		radical.path = draw.radicalBullet(render, ps).attr('fill', this.color);
		break;
	case 3:
		radical.path = render.paper.set();
		hshift = 1.6 * options.lineWidth;
		radical.path.push(
			draw.radicalCap(render, ps.add(new Vec2(-hshift, 0))),
			draw.radicalCap(render, ps.add(new Vec2(hshift, 0))));
		radical.path.attr('stroke', this.color);
		break;
	}
	radical.rbb = util.relBox(radical.path.getBBox());
	var vshift = -0.5 * (this.label.rbb.height + radical.rbb.height);
	if (this.a.radical == 3)
		vshift -= options.lineWidth / 2;
	pathAndRBoxTranslate(radical.path, radical.rbb,
		0, vshift);
	return radical;
};

ReAtom.prototype.isotope = function (render, leftMargin) {
	var ps = render.ps(this.a.pp);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var isotope = {};
	isotope.text = this.a.isotope.toString();
	isotope.path = render.paper.text(ps.x, ps.y, isotope.text)
		.attr({
			'font': options.font,
			'font-size': options.fontszsub,
			'fill': this.color
		});
	isotope.rbb = util.relBox(isotope.path.getBBox());
	draw.recenterText(isotope.path, isotope.rbb);
	/* eslint-disable no-mixed-operators*/
	pathAndRBoxTranslate(isotope.path, isotope.rbb,
		leftMargin - 0.5 * isotope.rbb.width - delta,
		-0.3 * this.label.rbb.height);
	/* eslint-enable no-mixed-operators*/
	return isotope;
};

ReAtom.prototype.charge = function (render, rightMargin) {
	var ps = render.ps(this.a.pp);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var charge = {};
	charge.text = '';
	var absCharge = Math.abs(this.a.charge);
	if (absCharge != 1)
		charge.text = absCharge.toString();
	if (this.a.charge < 0)
		charge.text += '\u2013';
	else
		charge.text += '+';

	charge.path = render.paper.text(ps.x, ps.y, charge.text)
		.attr({
			'font': options.font,
			'font-size': options.fontszsub,
			'fill': this.color
		});
	charge.rbb = util.relBox(charge.path.getBBox());
	draw.recenterText(charge.path, charge.rbb);
	/* eslint-disable no-mixed-operators*/
	pathAndRBoxTranslate(charge.path, charge.rbb,
		rightMargin + 0.5 * charge.rbb.width + delta,
		-0.3 * this.label.rbb.height);
	/* eslint-enable no-mixed-operators*/
	return charge;
};

ReAtom.prototype.explicitValence = function (render, rightMargin) {
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
	var ps = render.ps(this.a.pp);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var valence = {};
	valence.text = mapValence[this.a.explicitValence];
	if (!valence.text)
		throw new Error('invalid valence ' + this.a.explicitValence.toString());
	valence.text = '(' + valence.text + ')';
	valence.path = render.paper.text(ps.x, ps.y, valence.text)
		.attr({
			'font': options.font,
			'font-size': options.fontszsub,
			'fill': this.color
		});
	valence.rbb = util.relBox(valence.path.getBBox());
	draw.recenterText(valence.path, valence.rbb);
	/* eslint-disable no-mixed-operators*/
	pathAndRBoxTranslate(valence.path, valence.rbb,
		rightMargin + 0.5 * valence.rbb.width + delta,
		-0.3 * this.label.rbb.height);
	/* eslint-enable no-mixed-operators*/
	return valence;
};

ReAtom.prototype.hydrogen = function (render, implh, data) {
	var hydroIndex = data.hydroIndex;
	var hydrogenLeft = this.hydrogenOnTheLeft;
	var ps = render.ps(this.a.pp);
	var options = render.options;
	var delta = 0.5 * options.lineWidth;
	var hydrogen = data.hydrogen;
	hydrogen.text = 'H';
	hydrogen.path = render.paper.text(ps.x, ps.y, hydrogen.text).attr({
		'font': options.font,
		'font-size': options.fontsz,
		'fill': this.color
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
				'font': options.font,
				'font-size': options.fontszsub,
				'fill': this.color
			});
		hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox());
		draw.recenterText(hydroIndex.path, hydroIndex.rbb);
		if (!hydrogenLeft) {
			pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
				data.rightMargin + (0.5 * hydroIndex.rbb.width) + delta,
				0.2 * this.label.rbb.height);
			data.rightMargin += hydroIndex.rbb.width + delta;
		}
	}
	if (hydrogenLeft) {
		if (hydroIndex != null) {
			pathAndRBoxTranslate(hydroIndex.path, hydroIndex.rbb,
				data.leftMargin - (0.5 * hydroIndex.rbb.width) - delta,
				0.2 * this.label.rbb.height);
			data.leftMargin -= hydroIndex.rbb.width + delta;
		}
		pathAndRBoxTranslate(hydrogen.path, hydrogen.rbb,
			data.leftMargin - (0.5 * hydrogen.rbb.width) - delta, 0);
		data.leftMargin -= hydrogen.rbb.width + delta;
	}
	return Object.assign(data, { hydrogen: hydrogen, hydroIndex: hydroIndex });
};

ReAtom.prototype.warning = function (render, leftMargin, rightMargin) {
	var ps = render.ps(this.a.pp);
	var delta = 0.5 * render.options.lineWidth;
	var tfx = util.tfx;
	var warning = {};
	var y = ps.y + (this.label.rbb.height / 2) + delta;
	warning.path = render.paper.path('M{0},{1}L{2},{3}',
		tfx(ps.x + leftMargin), tfx(y), tfx(ps.x + rightMargin), tfx(y))
		.attr(render.options.lineattr).attr({ stroke: '#F00' });
	warning.rbb = util.relBox(warning.path.getBBox());
	return warning;
};

ReAtom.prototype.attpnt = function (render, lsb, addReObjectPath, shiftBondEnd) {
	var asterisk = Prototype.Browser.IE ? '*' : '∗';
	var ps = render.ps(this.a.pp);
	var options = render.options;
	var tfx = util.tfx;
	var i, c, j; // eslint-disable-line no-unused-vars
	for (i = 0, c = 0; i < 4; ++i) {
		var attpntText = '';
		if (this.a.attpnt & (1 << i)) {
			if (attpntText.length > 0)
				attpntText += ' ';
			attpntText += asterisk;
			for (j = 0; j < (i == 0 ? 0 : (i + 1)); ++j)
				attpntText += '\'';
			var pos0 = new Vec2(ps);
			var pos1 = ps.addScaled(lsb, 0.7 * options.scaleFactor);

			var attpntPath1 = render.paper.text(pos1.x, pos1.y, attpntText)
				.attr({
					'font': options.font,
					'font-size': options.fontsz,
					'fill': this.color
				});
			var attpntRbb = util.relBox(attpntPath1.getBBox());
			draw.recenterText(attpntPath1, attpntRbb);

			var lsbn = lsb.negated();
			/* eslint-disable no-mixed-operators*/
			pos1 = pos1.addScaled(lsbn, Vec2.shiftRayBox(pos1, lsbn, Box2Abs.fromRelBox(attpntRbb)) + options.lineWidth / 2);
			/* eslint-enable no-mixed-operators*/
			pos0 = shiftBondEnd(this, pos0, lsb, options.lineWidth);
			var n = lsb.rotateSC(1, 0);
			var arrowLeft = pos1.addScaled(n, 0.05 * options.scaleFactor).addScaled(lsbn, 0.09 * options.scaleFactor);
			var arrowRight = pos1.addScaled(n, -0.05 * options.scaleFactor).addScaled(lsbn, 0.09 * options.scaleFactor);
			var attpntPath = render.paper.set();
			attpntPath.push(
				attpntPath1,
				render.paper.path('M{0},{1}L{2},{3}M{4},{5}L{2},{3}L{6},{7}', tfx(pos0.x), tfx(pos0.y), tfx(pos1.x), tfx(pos1.y), tfx(arrowLeft.x), tfx(arrowLeft.y), tfx(arrowRight.x), tfx(arrowRight.y))
					.attr(render.options.lineattr).attr({ 'stroke-width': options.lineWidth / 2 })
			);
			addReObjectPath('indices', this.visel, attpntPath, ps);
			lsb = lsb.rotate(Math.PI / 6);
		}
	}
};

ReAtom.prototype.aamText = function () {
	var aamText = '';
	if (this.a.aam > 0)    aamText += this.a.aam;
	if (this.a.invRet > 0) {
		if (aamText.length > 0)    aamText += ',';
		if (this.a.invRet == 1)    aamText += 'Inv';
		else if (this.a.invRet == 2) aamText += 'Ret';
		else throw new Error('Invalid value for the invert/retain flag');
	}
	if (this.a.exactChangeFlag > 0) {
		if (aamText.length > 0)    aamText += ',';
		if (this.a.exactChangeFlag == 1) aamText += 'ext';
		else throw new Error('Invalid value for the exact change flag');
	}
	return aamText;
};

ReAtom.prototype.queryAttrsText = function () {
	var queryAttrsText = '';
	if (this.a.ringBondCount != 0) {
		if (this.a.ringBondCount > 0) queryAttrsText += 'rb' + this.a.ringBondCount.toString();
		else if (this.a.ringBondCount == -1) queryAttrsText += 'rb0';
		else if (this.a.ringBondCount == -2) queryAttrsText += 'rb*';
		else throw new Error('Ring bond count invalid');
	}
	if (this.a.substitutionCount != 0) {
		if (queryAttrsText.length > 0) queryAttrsText += ',';
		if (this.a.substitutionCount > 0) queryAttrsText += 's' + this.a.substitutionCount.toString();
		else if (this.a.substitutionCount == -1) queryAttrsText += 's0';
		else if (this.a.substitutionCount == -2) queryAttrsText += 's*';
		else throw new Error('Substitution count invalid');
	}
	if (this.a.unsaturatedAtom > 0) {
		if (queryAttrsText.length > 0) queryAttrsText += ',';
		if (this.a.unsaturatedAtom == 1) queryAttrsText += 'u';
		else throw new Error('Unsaturated atom invalid value');
	}
	if (this.a.hCount > 0) {
		if (queryAttrsText.length > 0) queryAttrsText += ',';
		queryAttrsText += 'H' + (this.a.hCount - 1).toString();
	}
	return queryAttrsText;
};

function pathAndRBoxTranslate(path, rbb, x, y) {
	path.translateAbs(x, y);
	rbb.x += x;
	rbb.y += y;
}

module.exports = ReAtom;
