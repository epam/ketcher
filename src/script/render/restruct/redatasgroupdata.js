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
import scale from '../../util/scale';

function ReDataSGroupData(sgroup) {
	this.init('sgroupData');

	this.sgroup = sgroup;
}

ReDataSGroupData.prototype = new ReObject();
ReDataSGroupData.isSelectable = function () {
	return true;
};

ReDataSGroupData.prototype.highlightPath = function (render) {
	var box = this.sgroup.dataArea;
	var p0 = scale.obj2scaled(box.p0, render.options);
	var sz = scale.obj2scaled(box.p1, render.options).sub(p0);
	return render.paper.rect(p0.x, p0.y, sz.x, sz.y);
};

ReDataSGroupData.prototype.drawHighlight = function (render) {
	var ret = this.highlightPath(render).attr(render.options.highlightStyle);
	render.ctab.addReObjectPath('highlighting', this.visel, ret);
	return ret;
};

ReDataSGroupData.prototype.makeSelectionPlate = function (restruct, paper, styles) { // TODO [MK] review parameters
	return this.highlightPath(restruct.render).attr(styles.selectionStyle);
};

export default ReDataSGroupData;
