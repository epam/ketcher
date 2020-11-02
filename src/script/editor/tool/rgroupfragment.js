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

import { RGroup } from '../../chem/struct';
import { fromRGroupAttrs, fromRGroupFragment, fromUpdateIfThen } from '../actions/rgroup';

function RGroupFragmentTool(editor) {
	if (!(this instanceof RGroupFragmentTool)) {
		// TODO: check if it's a fragments already
		editor.selection(null);
		return new RGroupFragmentTool(editor);
	}

	this.editor = editor;
}

RGroupFragmentTool.prototype.mousemove = function (event) {
	this.editor.hover(this.editor.findItem(event, ['frags', 'rgroups']));
};

RGroupFragmentTool.prototype.click = function (event) {
	const editor = this.editor;
	const struct = editor.render.ctab.molecule;
	const ci = editor.findItem(event, ['frags', 'rgroups']);

	if (!ci) return true;

	this.editor.hover(null);

	const label = (ci.map === 'rgroups') ? ci.id :
		RGroup.findRGroupByFragment(struct.rgroups, ci.id);

	const rg = Object.assign(
		{ label },
		ci.map === 'frags' ? { fragId: ci.id } : struct.rgroups.get(ci.id)
	);

	const res = editor.event.rgroupEdit.dispatch(rg);

	Promise.resolve(res).then((newRg) => {
		const restruct = editor.render.ctab;

		let action = null;
		if (ci.map !== 'rgroups') {
			const rgidOld = RGroup.findRGroupByFragment(restruct.molecule.rgroups, ci.id);

			action = fromRGroupFragment(restruct, newRg.label, ci.id)
				.mergeWith(fromUpdateIfThen(restruct, newRg.label, rgidOld));
		} else {
			action = fromRGroupAttrs(restruct, ci.id, newRg);
		}

		editor.update(action);
	}).catch(() => null); // w/o changes

	return true;
};

RGroupFragmentTool.prototype.cancel = function () {
	this.editor.hover(null);
};

export default RGroupFragmentTool;
