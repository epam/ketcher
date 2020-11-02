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
import Vec2 from '../../util/vec2';
import util from '../util';
import draw from '../draw';
import scale from '../../util/scale';

import ReObject from './reobject';

var BORDER_EXT = new Vec2(0.05 * 3, 0.05 * 3);

function ReRGroup(/* RGroup*/rgroup) {
	this.init('rgroup');

	this.labelBox = null;
	this.item = rgroup;
}
ReRGroup.prototype = new ReObject();
ReRGroup.isSelectable = function () {
	return false;
};

ReRGroup.prototype.getAtoms = function (render) {
	var ret = [];
	this.item.frags.forEach((fid) => {
		ret = ret.concat(render.ctab.frags.get(fid).fragGetAtoms(render.ctab, fid));
	});
	return ret;
};

ReRGroup.prototype.getBonds = function (render) {
	var ret = [];
	this.item.frags.forEach((fid) => {
		ret = ret.concat(render.ctab.frags.get(fid).fragGetBonds(render.ctab, fid));
	});
	return ret;
};

ReRGroup.prototype.calcBBox = function (render) {
	let ret = null;
	this.item.frags.forEach((fid) => {
		const bbf = render.ctab.frags.get(fid).calcBBox(render.ctab, fid, render);
		if (bbf)
			ret = (ret ? Box2Abs.union(ret, bbf) : bbf);
	});

	if (ret)
		ret = ret.extend(BORDER_EXT, BORDER_EXT);

	return ret;
};

function rGroupdrawBrackets(set, render, bb, d) {
	d = scale.obj2scaled(d || new Vec2(1, 0), render.options);
	var bracketWidth = Math.min(0.25, bb.sz().x * 0.3);
	var bracketHeight = bb.p1.y - bb.p0.y;
	var cy = 0.5 * (bb.p1.y + bb.p0.y);

	var leftBracket = draw.bracket(render.paper, d.negated(),
		d.negated().rotateSC(1, 0),
		scale.obj2scaled(new Vec2(bb.p0.x, cy), render.options),
		bracketWidth, bracketHeight, render.options);

	var rightBracket = draw.bracket(render.paper, d, d.rotateSC(1, 0),
		scale.obj2scaled(new Vec2(bb.p1.x, cy), render.options),
		bracketWidth, bracketHeight, render.options);

	return set.push(leftBracket, rightBracket);
}

// TODO need to review parameter list
ReRGroup.prototype.draw = function (render, options) { // eslint-disable-line max-statements
	const bb = this.calcBBox(render);

	if (!bb) {
		console.error('Abnormal situation, empty fragments must be destroyed by tools');
		return {};
	}

	const ret = { data: [] };
	const p0 = scale.obj2scaled(bb.p0, options);
	const p1 = scale.obj2scaled(bb.p1, options);
	const brackets = render.paper.set();

	rGroupdrawBrackets(brackets, render, bb); // eslint-disable-line new-cap

	ret.data.push(brackets);
	const key = render.ctab.rgroups.keyOf(this);
	const labelSet = render.paper.set();
	const label = render.paper
		.text(p0.x, (p0.y + p1.y) / 2, 'R' + key + '=')
		.attr({
			font: options.font,
			'font-size': options.fontRLabel,
			fill: 'black'
		});

	const labelBox = util.relBox(label.getBBox());
	label.translateAbs(-labelBox.width / 2 - options.lineWidth, 0);

	labelSet.push(label);
	const logicStyle = {
		font: options.font,
		'font-size': options.fontRLogic,
		fill: 'black'
	};

	const logic = [rLogicToString(key, this.item)];

	let shift = labelBox.height / 2 + options.lineWidth / 2;
	for (let i = 0; i < logic.length; ++i) {
		const logicPath = render.paper.text(p0.x, (p0.y + p1.y) / 2, logic[i]).attr(logicStyle);
		const logicBox = util.relBox(logicPath.getBBox());
		shift += logicBox.height / 2;
		logicPath.translateAbs(-logicBox.width / 2 - 6 * options.lineWidth, shift);
		shift += logicBox.height / 2 + options.lineWidth / 2;
		ret.data.push(logicPath);
		labelSet.push(logicPath);
	}

	ret.data.push(label);
	this.labelBox = Box2Abs.fromRelBox(labelSet.getBBox()).transform(scale.scaled2obj, render.options);
	return ret;
};

function rLogicToString(id, rLogic) {
	const ifThen = rLogic.ifthen > 0 ? 'IF ' : '';

	const rangeExists = rLogic.range.startsWith('>') ||
						rLogic.range.startsWith('<') ||
						rLogic.range.startsWith('=');

	let range = null;
	if (rLogic.range.length > 0)
		range = rangeExists ? rLogic.range : '=' + rLogic.range;
	else
		range = '>0';

	const restH = rLogic.resth ? ' (RestH)' : '';
	const nextRg = rLogic.ifthen > 0 ? '\nTHEN R' + rLogic.ifthen.toString() : '';

	return `${ifThen}R${id.toString()}${range}${restH}${nextRg}`;
}

// TODO need to review parameter list
ReRGroup.prototype._draw = function (render, rgid, attrs) { // eslint-disable-line no-underscore-dangle
	const bb = this.getVBoxObj(render).extend(BORDER_EXT, BORDER_EXT); // eslint-disable-line no-underscore-dangle

	if (!bb)
		return null;

	const p0 = scale.obj2scaled(bb.p0, render.options);
	const p1 = scale.obj2scaled(bb.p1, render.options);
	return render.paper.rect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y, 0).attr(attrs);
};

ReRGroup.prototype.drawHighlight = function (render) {
	const rgid = render.ctab.rgroups.keyOf(this);

	if (!rgid) {
		console.error('Abnormal situation, fragment does not belong to the render');
		return null;
	}

	const ret = this._draw(render, rgid, render.options.highlightStyle/* { 'fill' : 'red' }*/); // eslint-disable-line no-underscore-dangle
	render.ctab.addReObjectPath('highlighting', this.visel, ret);

	this.item.frags.forEach((fnum, fid) => {
		render.ctab.frags.get(fid).drawHighlight(render);
	});

	return ret;
};

ReRGroup.prototype.show = function (restruct, id, options) {
	const drawing = this.draw(restruct.render, options);

	Object.keys(drawing).forEach((group) => {
		while (drawing[group].length > 0)
			restruct.addReObjectPath(group, this.visel, drawing[group].shift(), null, true);
	});
	// TODO rgroup selection & highlighting
};

export default ReRGroup;
