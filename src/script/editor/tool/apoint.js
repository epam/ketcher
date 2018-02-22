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

import { fromAtomsAttrs } from '../actions/atom';

function APointTool(editor) {
	if (!(this instanceof APointTool))
		return new APointTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}

APointTool.prototype.mousemove = function (event) {
	this.editor.hover(this.editor.findItem(event, ['atoms']));
};

APointTool.prototype.click = function (event) {
	var editor = this.editor;
	var struct = editor.render.ctab.molecule;
	var ci = editor.findItem(event, ['atoms']);

	if (ci && ci.map === 'atoms') {
		this.editor.hover(null);
		var atom = struct.atoms.get(ci.id);
		var res = editor.event.elementEdit.dispatch({
			attpnt: atom.attpnt
		});
		Promise.resolve(res).then((newatom) => {
			if (atom.attpnt !== newatom.attpnt) {
				var action = fromAtomsAttrs(editor.render.ctab, ci.id, newatom);
				editor.update(action);
			}
		}).catch(() => null); // w/o changes
		return true;
	}
	return true;
};

export default APointTool;
