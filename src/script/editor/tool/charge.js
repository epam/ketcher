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
import { fromAtomsAttrs } from '../actions/atom';

function ChargeTool(editor, charge) {
	if (!(this instanceof ChargeTool))
		return new ChargeTool(editor, charge);

	this.editor = editor;
	this.editor.selection(null);
	this.charge = charge;
}

ChargeTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms']);
	var struct = rnd.ctab.molecule;
	if (ci && ci.map === 'atoms' && element.map[struct.atoms.get(ci.id).label])
		this.editor.hover(ci);
	else
		this.editor.hover(null);
	return true;
};

ChargeTool.prototype.click = function (event) {
	var editor = this.editor;
	var rnd = editor.render;
	var struct = rnd.ctab.molecule;
	var ci = editor.findItem(event, ['atoms']);
	if (ci && ci.map === 'atoms' && element.map[struct.atoms.get(ci.id).label]) {
		this.editor.hover(null);
		this.editor.update(fromAtomsAttrs(rnd.ctab, ci.id, {
			charge: struct.atoms.get(ci.id).charge + this.charge
		}));
	}
	return true;
};

export default ChargeTool;
