var Struct = require('../../chem/struct');
var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

var ui = global.ui;

var AtomTool = function (editor, atomProps) {
	this.editor = editor;
	this.atomProps = atomProps;
	this.bondProps = { type: 1, stereo: Struct.Bond.PATTERN.STEREO.NONE };

	this._hoverHelper = new HoverHelper(this);
};
AtomTool.prototype = new EditorTool();
AtomTool.prototype.OnMouseDown = function (event) {
	this._hoverHelper.hover(null);
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
	var _E_ = this.editor, rnd = _E_.render;
	if ('dragCtx' in this && 'item' in this.dragCtx) {
		var _DC_ = this.dragCtx;
		var newAtomPos = this._calcNewAtomPos(
		rnd.atomGetPos(_DC_.item.id), rnd.page2obj(event)
		);
		if ('action' in _DC_) {
			_DC_.action.perform();
		}
		// TODO [RB] kludge fix for KETCHER-560. need to review
		// BEGIN
		/*
		 var action_ret = Action.fromBondAddition(
		 this.bondProps, _DC_.item.id, this.atomProps, newAtomPos, newAtomPos
		 );
		 */
		var action_ret = Action.fromBondAddition(
			this.bondProps, _DC_.item.id, Object.clone(this.atomProps), newAtomPos, newAtomPos
		);
		// END
		_DC_.action = action_ret[0];
		_DC_.aid2 = action_ret[2];
		rnd.update();
	} else {
		this._hoverHelper.hover(rnd.findItem(event, ['atoms']));
	}
};
AtomTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		var _DC_ = this.dragCtx;
		var rnd = this.editor.render;
		ui.addUndoAction(
				'action' in _DC_
				 ? _DC_.action
				 : 'item' in _DC_
					 ? Action.fromAtomsAttrs(_DC_.item.id, this.atomProps, true)
					 : Action.fromAtomAddition(rnd.page2obj(event), this.atomProps),
			true
		);
		rnd.update();
		delete this.dragCtx;
	}
};

module.exports = AtomTool;
