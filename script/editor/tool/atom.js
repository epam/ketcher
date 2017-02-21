var Struct = require('../../chem/struct');
var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');
var utils = require('./utils');

function AtomTool(editor, atomProps) {
	if (!(this instanceof AtomTool)) {
		if (!editor.selection() || !editor.selection().atoms)
			return new AtomTool(editor, atomProps);

		var action = Action.fromAtomsAttrs(editor.selection().atoms,
		                                   atomProps);
		editor.update(action);
		editor.selection(null);
		return null;
	}

	this.editor = editor;
	this.atomProps = atomProps;
	this.bondProps = { type: 1, stereo: Struct.Bond.PATTERN.STEREO.NONE };

	this.hoverHelper = new HoverHelper(this);
}

AtomTool.prototype = new EditorTool();
AtomTool.prototype.OnMouseDown = function (event) {
	this.hoverHelper.hover(null);
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms']);
	if (!ci) { // ci.type == 'Canvas'
		this.dragCtx = { xy0: rnd.page2obj(event) };
	} else if (ci.map == 'atoms') {
		this.dragCtx = {
			item: ci,
			xy0: rnd.page2obj(event)
		};
	}
};
AtomTool.prototype.OnMouseMove = function (event) {
	var editor = this.editor;
	var rnd = editor.render;
	if ('dragCtx' in this && 'item' in this.dragCtx) {
		var dragCtx = this.dragCtx;
		var atom = rnd.ctab.molecule.atoms.get(dragCtx.item.id);
		var newAtomPos = utils.calcNewAtomPos(
			atom.pp, rnd.page2obj(event)
		);
		if ('action' in dragCtx)
			dragCtx.action.perform();
		// TODO [RB] kludge fix for KETCHER-560. need to review
		// BEGIN
		/*
		 var action_ret = Action.fromBondAddition(rnd.ctab,
		 this.bondProps, dragCtx.item.id, this.atomProps, newAtomPos, newAtomPos
		 );
		 */

		var actionRet = Action.fromBondAddition(rnd.ctab,
			this.bondProps, dragCtx.item.id, Object.assign({}, this.atomProps), newAtomPos, newAtomPos
		);
		// END
		// dragCtx.aid2 = actionRet[2];
		dragCtx.action = actionRet[0];
		rnd.update();
	} else {
		this.hoverHelper.hover(this.editor.findItem(event, ['atoms']));
	}
};
AtomTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		var dragCtx = this.dragCtx;
		var rnd = this.editor.render;
		this.editor.update(dragCtx.action || (
			dragCtx.item ?
				Action.fromAtomsAttrs(dragCtx.item.id, this.atomProps, true) :
				Action.fromAtomAddition(rnd.page2obj(event), this.atomProps)
		));
		delete this.dragCtx;
	}
};

module.exports = AtomTool;
