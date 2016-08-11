var Struct = require('../../chem/struct');
var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

var ui = global.ui;

function AtomTool(editor, atomProps) {
	this.editor = editor;
	this.atomProps = atomProps;
	this.bondProps = { type: 1, stereo: Struct.Bond.PATTERN.STEREO.NONE };

	this.hoverHelper = new HoverHelper(this);
}
AtomTool.prototype = new EditorTool();
AtomTool.prototype.OnMouseDown = function (event) {
	this.hoverHelper.hover(null);
	var rnd = this.editor.render;
	var ci = rnd.findItem(event, ['atoms']);
	if (!ci || ci.type == 'Canvas') {
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
		var newAtomPos = this.calcNewAtomPos(
		rnd.atomGetPos(dragCtx.item.id), rnd.page2obj(event)
		);
		if ('action' in dragCtx)
			dragCtx.action.perform();
		// TODO [RB] kludge fix for KETCHER-560. need to review
		// BEGIN
		/*
		 var action_ret = Action.fromBondAddition(
		 this.bondProps, dragCtx.item.id, this.atomProps, newAtomPos, newAtomPos
		 );
		 */
		var actionRet = Action.fromBondAddition(
			this.bondProps, dragCtx.item.id, Object.clone(this.atomProps), newAtomPos, newAtomPos
		);
		// END
		dragCtx.action = actionRet[0];
		dragCtx.aid2 = actionRet[2];
		rnd.update();
	} else {
		this.hoverHelper.hover(rnd.findItem(event, ['atoms']));
	}
};
AtomTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		var dragCtx = this.dragCtx;
		var rnd = this.editor.render;
		/* eslint-disable no-nested-ternary*/
		ui.addUndoAction(
				'action' in dragCtx ? dragCtx.action : 'item' in dragCtx ?
					Action.fromAtomsAttrs(dragCtx.item.id, this.atomProps, true) :
						Action.fromAtomAddition(rnd.page2obj(event), this.atomProps),
			true
		);
		/* eslint-enable no-nested-ternary*/
		rnd.update();
		delete this.dragCtx;
	}
};

module.exports = AtomTool;
