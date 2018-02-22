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

import element from '../../chem/element';

function AttachTool(editor, attachPoints) {
	if (!(this instanceof AttachTool))
		return new AttachTool(editor, attachPoints);

	this.attach = attachPoints || { atomid: 0, bondid: 0 };
	this.editor = editor;

	this.editor.selection({
		atoms: [this.attach.atomid],
		bonds: [this.attach.bondid]
	});
}

AttachTool.prototype.mousemove = function (event) {
	const rnd = this.editor.render;

	const ci = this.editor.findItem(event, ['atoms', 'bonds']);
	const struct = rnd.ctab.molecule;
	if (ci && ((ci.map === 'atoms' && element.map[struct.atoms.get(ci.id).label]) || ci.map === 'bonds'))
		this.editor.hover(ci);
	else
		this.editor.hover(null);
	return true;
};

AttachTool.prototype.click = function (event) {
	const editor = this.editor;
	const rnd = editor.render;
	const struct = rnd.ctab.molecule;
	const ci = editor.findItem(event, ['atoms', 'bonds']);

	if (ci && ((ci.map === 'atoms' && element.map[struct.atoms.get(ci.id).label]) || ci.map === 'bonds')) {
		if (ci.map === 'atoms')
			this.attach.atomid = ci.id;
		else
			this.attach.bondid = ci.id;

		this.editor.selection({
			atoms: [this.attach.atomid],
			bonds: [this.attach.bondid]
		});
		this.editor.event.attachEdit.dispatch(this.attach);
	}
	return true;
};

export default AttachTool;
