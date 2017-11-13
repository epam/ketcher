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

var Struct = require('../../chem/struct');
var Actions = require('../actions');

function RGroupAtomTool(editor) {
	if (!(this instanceof RGroupAtomTool)) {
		// TODO: map atoms with labels
		editor.selection(null);
		return new RGroupAtomTool(editor);
	}

	this.editor = editor;
}

RGroupAtomTool.prototype.mousemove = function (event) {
	this.editor.hover(this.editor.findItem(event, ['atoms']));
};

RGroupAtomTool.prototype.mouseup = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms']);
	if (!ci) { //  ci.type == 'Canvas'
		this.editor.hover(null);
		propsDialog(this.editor, null, rnd.page2obj(event));
		return true;
	} else if (ci.map === 'atoms') {
		this.editor.hover(null);
		propsDialog(this.editor, ci.id);
		return true;
	}
};

function propsDialog(editor, id, pos) {
	var struct = editor.render.ctab.molecule;
	var atom = (id || id === 0) ? struct.atoms.get(id) : null;
	var rglabel = atom ? atom.rglabel : 0;
	var label = atom ? atom.label : 'R#';

	var res = editor.event.elementEdit.dispatch({
		label: 'R#', rglabel: rglabel
	});

	Promise.resolve(res).then(function (elem) {
		elem = Object.assign({}, Struct.Atom.attrlist, elem); // TODO review: using Atom.attrlist as a source of default property values
		if (!id && id !== 0 && elem.rglabel) {
			editor.update(Actions.fromAtomAddition(editor.render.ctab, pos, elem));
		} else if (rglabel != elem.rglabel || label !== 'R#') {
			elem.aam = atom.aam; // WTF??
			editor.update(Actions.fromAtomsAttrs(editor.render.ctab, id, elem));
		}
	});
}

module.exports = RGroupAtomTool;
