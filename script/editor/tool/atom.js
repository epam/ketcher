/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

var Struct = require('../../chem/struct');
var Action = require('../action');
var utils = require('./utils');

function AtomTool(editor, atomProps) {
	if (!(this instanceof AtomTool)) {
		if (!editor.selection() || !editor.selection().atoms)
			return new AtomTool(editor, atomProps);

		var action = Action.fromAtomsAttrs(editor.render.ctab, editor.selection().atoms,
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

	dragCtx.action = Action.fromBondAddition(rnd.ctab,
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
				Action.fromAtomsAttrs(rnd.ctab, dragCtx.item.id, this.atomProps, true) :
				Action.fromAtomAddition(rnd.ctab, rnd.page2obj(event), this.atomProps)
		));
		delete this.dragCtx;
	}
};

module.exports = AtomTool;
