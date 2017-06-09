var Vec2 = require('../../util/vec2');
var Struct = require('../../chem/struct');
var Action = require('../action');
var utils = require('./utils');

var Bond = require('./bond');

function ChainTool(editor) {
	if (!(this instanceof ChainTool))
		return new ChainTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}

ChainTool.prototype.mousedown = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms', 'bonds']);
	this.editor.hover(null);
	this.dragCtx = {
		xy0: rnd.page2obj(event),
		item: ci
	};
	if (ci && ci.map === 'atoms') {
		this.editor.selection({ atoms: [ci.id] }); // for change atom
		// this event has to be stopped in others events by `tool.dragCtx.stopTapping()`
		atomLongtapEvent(this, rnd, ci.id);
	}
	if (!this.dragCtx.item) // ci.type == 'Canvas'
		delete this.dragCtx.item;
	return true;
};

ChainTool.prototype.mousemove = function (event) { // eslint-disable-line max-statements
	var editor = this.editor;
	var rnd = editor.render;
	if (this.dragCtx) {
		if ('stopTapping' in this.dragCtx)
			this.dragCtx.stopTapping();
		this.editor.selection(null);
		var dragCtx = this.dragCtx;
		if (!('item' in dragCtx) || dragCtx.item.map === 'atoms') {
			if ('action' in dragCtx)
				dragCtx.action.perform(rnd.ctab);

			var atoms = rnd.ctab.molecule.atoms;
			var pos0 = dragCtx.item ? atoms.get(dragCtx.item.id).pp :
				dragCtx.xy0;
			var pos1 = rnd.page2obj(event);
			var sectCount = Math.ceil(Vec2.diff(pos1, pos0).length());
			var angle = event.ctrlKey ? utils.calcAngle(pos0, pos1) :
				utils.fracAngle(pos0, pos1);

			dragCtx.action = Action.fromChain(rnd.ctab, pos0, angle, sectCount,
				dragCtx.item ? dragCtx.item.id : null);
			editor.event.message.dispatch({
				info: sectCount + " sectors"
			});
			this.editor.update(dragCtx.action, true);
			return true;
		}
	}
	this.editor.hover(this.editor.findItem(event, ['atoms', 'bonds']));
	return true;
};

ChainTool.prototype.mouseup = function () {
	var rnd = this.editor.render;
	var struct = rnd.ctab.molecule;
	if (this.dragCtx) {
		if ('stopTapping' in this.dragCtx)
			this.dragCtx.stopTapping();
		var dragCtx = this.dragCtx;

		var action = dragCtx.action;
		if (!action && dragCtx.item && dragCtx.item.map === 'bonds') {
			var bond = struct.bonds.get(dragCtx.item.id);

			action = Bond.bondChangingAction(rnd.ctab, dragCtx.item.id, bond, {
				type: Struct.Bond.PATTERN.TYPE.SINGLE,
				stereo: Struct.Bond.PATTERN.STEREO.NONE
			});
		}
		delete this.dragCtx;
		if (action)
			this.editor.update(action);
	}
	return true;
};

function atomLongtapEvent(tool, render, itemID) {
	var editor = tool.editor;
	var atom = render.ctab.molecule.atoms.get(itemID);
	// TODO: longtab event
	tool.dragCtx.timeout = setTimeout(function () {
		delete tool.dragCtx;
		editor.selection(null);
		var res = editor.event.quickEdit.dispatch(atom);
		Promise.resolve(res).then(function (newatom) {
			editor.update(Action.fromAtomsAttrs(render.ctab, itemID, newatom));
		});
	}, 750);
	tool.dragCtx.stopTapping = function () {
		if (tool.dragCtx.timeout) {
			clearTimeout(tool.dragCtx.timeout);
			delete tool.dragCtx.timeout;
		}
	};
}

ChainTool.prototype.cancel = ChainTool.prototype.mouseleave =
	ChainTool.prototype.mouseup;

module.exports = Object.assign(ChainTool, {
	atomLongtapEvent: atomLongtapEvent
});
