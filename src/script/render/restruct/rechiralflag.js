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
import scale from '../../util/scale';
import ReObject from './reobject';

function ReChiralFlag(pos) {
	this.init('chiralFlag');

	this.pp = pos;
}
ReChiralFlag.prototype = new ReObject();
ReChiralFlag.isSelectable = function () {
	return true;
};

ReChiralFlag.prototype.highlightPath = function (render) {
	var box = Box2Abs.fromRelBox(this.path.getBBox());
	var sz = box.p1.sub(box.p0);
	var p0 = box.p0.sub(render.options.offset);
	return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
};

ReChiralFlag.prototype.drawHighlight = function (render) {
	if (!this.path) return null;
	var ret = this.highlightPath(render).attr(render.options.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReChiralFlag.prototype.makeSelectionPlate = function (restruct, paper, options) {
	if (!this.path) return null;
	return this.highlightPath(restruct.render).attr(options.selectionStyle);
};

ReChiralFlag.prototype.show = function (restruct, id, options) {
	var render = restruct.render;
	if (restruct.chiralFlagsChanged[id] <= 0) return;

	var paper = render.paper;
	var ps = scale.obj2scaled(this.pp, options);
	this.path = paper.text(ps.x, ps.y, 'Chiral')
		.attr({
			font: options.font,
			'font-size': options.fontsz,
			fill: '#000'
		});
	render.ctab.addReObjectPath('data', this.visel, this.path, null, true);
};

export default ReChiralFlag;
