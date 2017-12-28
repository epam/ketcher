/****************************************************************************
 * Copyright 2017 EPAM Systems
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

import { fromPaste } from '../actions/paste';
import utils from '../shared/utils';
import { fromBondsMerge } from '../actions/bond';
import { fromAtomMerge } from '../actions/atom';

function PasteTool(editor, struct) {
	if (!(this instanceof PasteTool))
		return new PasteTool(editor, struct);

	this.editor = editor;
	this.editor.selection(null);
	this.struct = struct;

	var rnd = editor.render;
	var point = editor.lastEvent ?
		rnd.page2obj(editor.lastEvent) : null;
	this.action = fromPaste(rnd.ctab, this.struct, point);
	this.editor.update(this.action, true);
}

PasteTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;

	if (this.action)
		this.action.perform(rnd.ctab);

	this.action = fromPaste(rnd.ctab, this.struct, rnd.page2obj(event));
	this.editor.update(this.action, true);

	const struct = rnd.ctab.molecule;

	this.dragCtx = { };

	const items = {
		atoms: Array.from(struct.atoms.keys()),
		bonds: Array.from(struct.bonds.keys())
	};

	utils.findAndHighlightObjectsToStick(this.editor, this.dragCtx, items);
};

PasteTool.prototype.mouseup = function () {
	const restruct = this.editor.render.ctab;

	if (this.dragCtx.mergeItems) {
		// merge single atoms
		this.dragCtx.mergeItems.atoms.forEach((dst, src) => {
			this.action = this.action ?
				fromAtomMerge(restruct, src, dst).mergeWith(this.action) :
				fromAtomMerge(restruct, src, dst);
		});

		// merge bonds
		this.action = this.action ?
			fromBondsMerge(restruct, this.dragCtx.mergeItems.bonds).mergeWith(this.action) :
			fromBondsMerge(restruct, this.dragCtx.mergeItems.bonds);
	}

	if (this.action) {
		const action = this.action;
		delete this.action;
		this.editor.update(action);
	}
};

PasteTool.prototype.cancel = PasteTool.prototype.mouseleave = function () { // eslint-disable-line no-multi-assign
	var rnd = this.editor.render;
	if (this.action) {
		this.action.perform(rnd.ctab); // revert the action
		delete this.action;
		rnd.update();
	}
};

export default PasteTool;
