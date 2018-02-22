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

import Action from '../shared/action';
import { fromAtomsAttrs } from '../actions/atom';

function ReactionUnmapTool(editor) {
	if (!(this instanceof ReactionUnmapTool))
		return new ReactionUnmapTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}
ReactionUnmapTool.prototype.mousemove = function (event) {
	var ci = this.editor.findItem(event, ['atoms']);
	if (ci && ci.map === 'atoms')
		this.editor.hover(this.editor.render.ctab.molecule.atoms.get(ci.id).aam ? ci : null);
	else
		this.editor.hover(null);
};
ReactionUnmapTool.prototype.mouseup = function (event) {
	var ci = this.editor.findItem(event, ['atoms']);
	var atoms = this.editor.render.ctab.molecule.atoms;
	if (ci && ci.map === 'atoms' && atoms.get(ci.id).aam) {
		var action = new Action();
		var aam = atoms.get(ci.id).aam;
		atoms.forEach((atom, aid) => {
			if (atom.aam === aam)
				action.mergeWith(fromAtomsAttrs(this.editor.render.ctab, aid, { aam: 0 }));
		});
		this.editor.update(action);
	}
	this.editor.hover(null);
};

export default ReactionUnmapTool;
