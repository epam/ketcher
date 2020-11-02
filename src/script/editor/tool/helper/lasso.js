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

import locate from './locate';
import draw from '../../../render/draw';
import scale from '../../../util/scale';

function LassoHelper(mode, editor, fragment) {
	this.mode = mode;
	this.fragment = fragment;
	this.editor = editor;
}

LassoHelper.prototype.getSelection = function () {
	const rnd = this.editor.render;

	if (this.mode === 0)
		return locate.inPolygon(rnd.ctab, this.points);

	if (this.mode === 1)
		return locate.inRectangle(rnd.ctab, this.points[0], this.points[1]);

	throw new Error('Selector mode unknown'); // eslint-disable-line no-else-return
};

LassoHelper.prototype.begin = function (event) {
	const rnd = this.editor.render;
	this.points = [rnd.page2obj(event)];
	if (this.mode === 1)
		this.points.push(this.points[0]);
};

LassoHelper.prototype.running = function () {
	return !!this.points;
};

LassoHelper.prototype.addPoint = function (event) {
	if (!this.points)
		return null;

	const rnd = this.editor.render;

	if (this.mode === 0)
		this.points.push(rnd.page2obj(event));
	else if (this.mode === 1)
		this.points = [this.points[0], rnd.page2obj(event)];

	this.update();
	return this.getSelection();
};

LassoHelper.prototype.update = function () {
	if (this.selection) {
		this.selection.remove();
		this.selection = null;
	}

	if (this.points && this.points.length > 1) {
		const rnd = this.editor.render;
		const dp = this.points.map(p => scale.obj2scaled(p, rnd.options).add(rnd.options.offset));
		this.selection = this.mode === 0 ?
			draw.selectionPolygon(rnd.paper, dp, rnd.options) :
			draw.selectionRectangle(rnd.paper, dp[0], dp[1], rnd.options);
	}
};

LassoHelper.prototype.end = function () {
	const ret = this.getSelection();
	this.points = null;
	this.update(null);
	return ret;
};

export default LassoHelper;
