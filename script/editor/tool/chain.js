var Vec2 = require('../../util/vec2');
var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

var ui = global.ui;

function ChainTool(editor) {
	this.editor = editor;

	this.hoverHelper = new HoverHelper(this);
}
ChainTool.prototype = new EditorTool();
ChainTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	this.hoverHelper.hover(null);
	this.dragCtx = {
		xy0: rnd.page2obj(event),
		item: rnd.findItem(event, ['atoms'])
	};
	if (!this.dragCtx.item || this.dragCtx.item.type == 'Canvas') delete this.dragCtx.item;
	return true;
};
ChainTool.prototype.OnMouseMove = function (event) {
	var editor = this.editor;
	var rnd = editor.render;
	if ('dragCtx' in this) {
		var dragCtx = this.dragCtx;
		if ('action' in dragCtx) dragCtx.action.perform();
		var pos0 = 'item' in dragCtx ? rnd.atomGetPos(dragCtx.item.id) : dragCtx.xy0;
		var pos1 = rnd.page2obj(event);
		dragCtx.action = Action.fromChain(
			pos0,
		this.calcAngle(pos0, pos1),
		Math.ceil(Vec2.diff(pos1, pos0).length()),
				'item' in dragCtx ? dragCtx.item.id : null
		);
		rnd.update();
		return true;
	}
	this.hoverHelper.hover(rnd.findItem(event, ['atoms']));
	return true;
};
ChainTool.prototype.OnMouseUp = function () {
	if ('dragCtx' in this) {
		if ('action' in this.dragCtx)
			ui.addUndoAction(this.dragCtx.action);
		delete this.dragCtx;
	}
	return true;
};
ChainTool.prototype.OnCancel = function () {
	this.OnMouseUp(); // eslint-disable-line new-cap
};

module.exports = ChainTool;
