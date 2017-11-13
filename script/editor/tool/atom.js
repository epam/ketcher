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
var utils = require('./utils');

function AtomTool(editor, atomProps) {
	if (!(this instanceof AtomTool)) {
		if (!editor.selection() || !editor.selection().atoms)
			return new AtomTool(editor, atomProps);

		var action = Actions.fromAtomsAttrs(editor.render.ctab, editor.selection().atoms,
		                                   atomProps, true);
		editor.update(action);
		editor.selection(null);
		return null;
	}

	this.editor = editor;
	this.atomProps = atomProps;
	this.bondProps = { type: 1, stereo: Struct.Bond.PATTERN.STEREO.NONE };
}

AtomTool.prototype.mousedown = function (event) {
	this.editor.hover(null);
	var ci = this.editor.findItem(event, ['atoms']);
	if (!ci) { // ci.type == 'Canvas'
		this.dragCtx = {};
	} else if (ci.map === 'atoms') {
		this.dragCtx = { item: ci };
	}
};
AtomTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	if (!this.dragCtx || !this.dragCtx.item) {
		this.editor.hover(this.editor.findItem(event, ['atoms']));
		return;
	}

	var dragCtx = this.dragCtx;
	var ci = this.editor.findItem(event, ['atoms']);

	if (ci && ci.map === 'atoms' && ci.id === dragCtx.item.id) {
		// fromAtomsAttrs
		this.editor.hover(this.editor.findItem(event, ['atoms']));
		return;
	}

	// fromAtomAddition
	var atom = rnd.ctab.molecule.atoms.get(dragCtx.item.id);

	var newAtomPos = utils.calcNewAtomPos(atom.pp, rnd.page2obj(event));
	if (dragCtx.action)
		dragCtx.action.perform(rnd.ctab);

	dragCtx.action = Actions.fromBondAddition(rnd.ctab,
		this.bondProps, dragCtx.item.id, Object.assign({}, this.atomProps), newAtomPos, newAtomPos
	)[0];
	this.editor.update(dragCtx.action, true);
};
AtomTool.prototype.mouseup = function (event) {
	if (this.dragCtx) {
		var dragCtx = this.dragCtx;
		var rnd = this.editor.render;
		this.editor.update(dragCtx.action || (
			dragCtx.item ?
				Actions.fromAtomsAttrs(rnd.ctab, dragCtx.item.id, this.atomProps, true) :
				Actions.fromAtomAddition(rnd.ctab, rnd.page2obj(event), this.atomProps)
		));
		delete this.dragCtx;
	}
};

function atomLongtapEvent(tool, render) {
	const dragCtx = tool.dragCtx;
	const editor = tool.editor;

	const atomid = dragCtx.item && dragCtx.item.id;

	const atom = (atomid !== undefined && atomid !== null) ? // edit atom or add atom
		render.ctab.molecule.atoms.get(atomid) :
		new Struct.Atom({ label: '' });

	// TODO: longtab event
	dragCtx.timeout = setTimeout(function () {
		delete tool.dragCtx;
		editor.selection(null);
		const res = editor.event.quickEdit.dispatch(atom);
		Promise.resolve(res).then(function (newatom) {
			const action = atomid ?
				Actions.fromAtomsAttrs(render.ctab, atomid, newatom) :
				Actions.fromAtomAddition(render.ctab, dragCtx.xy0, newatom);
			editor.update(action);
		});
	}, 750);
	dragCtx.stopTapping = function () {
		if (dragCtx.timeout) {
			clearTimeout(dragCtx.timeout);
			delete tool.dragCtx.timeout;
		}
	};
}

module.exports = Object.assign(AtomTool, {
	atomLongtapEvent: atomLongtapEvent
});
