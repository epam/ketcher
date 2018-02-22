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

import LassoHelper from './helper/lasso';
import { fromFragmentDeletion } from '../actions/fragment';
import { fromAtomDeletion } from '../actions/atom';
import { fromBondDeletion } from '../actions/bond';
import { fromArrowDeletion, fromPlusDeletion } from '../actions/reaction';
import { fromSgroupDeletion } from '../actions/sgroup';
import { fromChiralFlagDeletion } from '../actions/chiral-flag';

function EraserTool(editor, mode) {
	if (!(this instanceof EraserTool)) {
		if (!editor.selection())
			return new EraserTool(editor, mode);

		const action = fromFragmentDeletion(editor.render.ctab, editor.selection());
		editor.update(action);
		editor.selection(null);
		return null;
	}

	this.editor = editor;

	this.maps = ['atoms', 'bonds', 'rxnArrows', 'rxnPluses', 'sgroups', 'sgroupData', 'chiralFlags'];
	this.lassoHelper = new LassoHelper(mode || 0, editor);
}

EraserTool.prototype.mousedown = function (event) {
	const ci = this.editor.findItem(event, this.maps);
	if (!ci) //  ci.type == 'Canvas'
		this.lassoHelper.begin(event);
};

EraserTool.prototype.mousemove = function (event) {
	if (this.lassoHelper.running())
		this.editor.selection(this.lassoHelper.addPoint(event));
	else
		this.editor.hover(this.editor.findItem(event, this.maps));
};

EraserTool.prototype.mouseup = function (event) { // eslint-disable-line max-statements
	const rnd = this.editor.render;

	if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		this.editor.update(fromFragmentDeletion(rnd.ctab, this.lassoHelper.end(event)));
		this.editor.selection(null);
	}
};

EraserTool.prototype.click = function (event) {
	const restruct = this.editor.render.ctab;
	const ci = this.editor.findItem(event, this.maps);

	if (!ci) return; // ci.type == 'Canvas'

	this.editor.hover(null);
	if (ci.map === 'atoms') {
		this.editor.update(fromAtomDeletion(restruct, ci.id));
	} else if (ci.map === 'bonds') {
		this.editor.update(fromBondDeletion(restruct, ci.id));
	} else if (ci.map === 'sgroups' || ci.map === 'sgroupData') {
		this.editor.update(fromSgroupDeletion(restruct, ci.id));
	} else if (ci.map === 'rxnArrows') {
		this.editor.update(fromArrowDeletion(restruct, ci.id));
	} else if (ci.map === 'rxnPluses') {
		this.editor.update(fromPlusDeletion(restruct, ci.id));
	} else if (ci.map === 'chiralFlags') {
		this.editor.update(fromChiralFlagDeletion(restruct));
	} else {
		// TODO re-factoring needed - should be "map-independent"
		console.error('EraserTool: unable to delete the object ' + ci.map + '[' + ci.id + ']');
		return;
	}
	this.editor.selection(null);
};

EraserTool.prototype.mouseleave = EraserTool.prototype.mouseup;

EraserTool.prototype.cancel = function () {
	if (this.lassoHelper.running()) this.lassoHelper.end();
	this.editor.selection(null);
};

export default EraserTool;
