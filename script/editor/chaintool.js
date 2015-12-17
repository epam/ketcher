var Vec2 = require('../util/vec2');
var Action = require('../ui/action');
var HoverHelper = require('./hoverhelper');
var EditorTool = require('./editortool');

var ui = global.ui;

var ChainTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
ChainTool.prototype = new EditorTool();
ChainTool.prototype.OnMouseDown = function (event) {
	this._hoverHelper.hover(null);
	this.dragCtx = {
		xy0: ui.page2obj(event),
		item: this.editor.render.findItem(event, ['atoms'])
	};
	if (!this.dragCtx.item || this.dragCtx.item.type == 'Canvas') delete this.dragCtx.item;
	return true;
};
ChainTool.prototype.OnMouseMove = function (event) {
	var _E_ = this.editor, _R_ = _E_.render;
	if ('dragCtx' in this) {
		var _DC_ = this.dragCtx;
		if ('action' in _DC_) _DC_.action.perform();
		var pos0 = 'item' in _DC_ ? _R_.atomGetPos(_DC_.item.id) : _DC_.xy0;
		var pos1 = ui.page2obj(event);
		_DC_.action = Action.fromChain(
			pos0,
		this._calcAngle(pos0, pos1),
		Math.ceil(Vec2.diff(pos1, pos0).length()),
				'item' in _DC_ ? _DC_.item.id : null
		);
		_R_.update();
		return true;
	}
	this._hoverHelper.hover(_R_.findItem(event, ['atoms']));
	return true;
};
ChainTool.prototype.OnMouseUp = function () {
	if ('dragCtx' in this) {
		if ('action' in this.dragCtx) {
			ui.addUndoAction(this.dragCtx.action);
		}
		delete this.dragCtx;
	}
	return true;
};
ChainTool.prototype.OnCancel = function () {
	this.OnMouseUp();
};

module.exports = ChainTool;