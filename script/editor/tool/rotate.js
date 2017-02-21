var Vec2 = require('../../util/vec2');

var Action = require('../action');
var EditorTool = require('./base');
var utils = require('./utils');

function RotateTool(editor, dir) {
	if (!(this instanceof RotateTool)) {
		if (!dir)
			return new RotateTool(editor);

		var restruct = editor.render.ctab;
		var selection = editor.selection();
		var singleBond = selection && selection.bonds &&
		    Object.keys(selection).length == 1 &&
		    selection.bonds.length == 1;

		var action = !singleBond ? Action.fromFlip(restruct, selection, dir) :
		    Action.fromBondAlign(restruct, selection.bonds[0], dir);
		editor.update(action);
		return null;
	}

	this.editor = editor;

	if (!editor.selection() || !editor.selection().atoms)
		// otherwise, clear selection
		this.editor.selection(null);
}

RotateTool.prototype = new EditorTool();

RotateTool.prototype.OnMouseDown = function (event) {
	var xy0 = new Vec2();
	var selection = this.editor.selection();
	var rnd = this.editor.render;
	var struct = rnd.ctab.molecule;

	if (selection && selection.atoms) {
		console.assert(selection.atoms.length > 0);

		var rotId = null;
		var rotAll = false;

		selection.atoms.each(function (aid) {
			var atom = struct.atoms.get(aid);

			xy0.add_(atom.pp); // eslint-disable-line no-underscore-dangle

			if (rotAll)
				return;

			atom.neighbors.find(function (nei) {
				var hb = struct.halfBonds.get(nei);

				if (selection.atoms.indexOf(hb.end) == -1) {
					if (hb.loop >= 0) {
						var neiAtom = struct.atoms.get(aid);
						if (!neiAtom.neighbors.find(function (neiNei) {
							var neiHb = struct.halfBonds.get(neiNei);
							return neiHb.loop >= 0 && selection.atoms.indexOf(neiHb.end) != -1;
						})) {
							rotAll = true;
							return true;
						}
					}
					if (rotId == null) {
						rotId = aid;
					} else if (rotId != aid) {
						rotAll = true;
						return true;
					}
				}
				return false;
			});
		});

		if (!rotAll && rotId != null)
			xy0 = struct.atoms.get(rotId).pp;
		else
			xy0 = xy0.scaled(1 / selection.atoms.length);
	} else {
		struct.atoms.each(function (id, atom) {
			xy0.add_(atom.pp); // eslint-disable-line no-underscore-dangle
		});
		// poor man struct center (without chiral, sdata, etc)
		xy0 = xy0.scaled(1 / struct.atoms.count());
	}
	this.dragCtx = {
		xy0: xy0,
		angle1: utils.calcAngle(xy0, rnd.page2obj(event))
	};
	return true;
};

RotateTool.prototype.OnMouseMove = function (event) { // eslint-disable-line max-statements
	if ('dragCtx' in this) {
		var editor = this.editor;
		var rnd = editor.render;
		var dragCtx = this.dragCtx;

		var pos = rnd.page2obj(event);
		var angle = utils.calcAngle(dragCtx.xy0, pos) - dragCtx.angle1;
		if (!event.ctrlKey)
			angle = utils.fracAngle(angle);

		var degrees = utils.degrees(angle);

		if ('angle' in dragCtx && dragCtx.angle == degrees) return true;
		if ('action' in dragCtx)
			dragCtx.action.perform();

		dragCtx.angle = degrees;
		dragCtx.action = Action.fromRotate(rnd.ctab, this.editor.selection(), dragCtx.xy0, angle);

		if (degrees > 180)
			degrees -= 360;
		else if (degrees <= -180)
			degrees += 360;
		this.editor.event.message.dispatch({ info: degrees + 'º' });

		rnd.update();
	}
	return true;
};

RotateTool.prototype.OnMouseUp = function () {
	if ('dragCtx' in this) {
		if ('action' in this.dragCtx)
			this.editor.update(this.dragCtx.action);
		else
			this.editor.selection(null);
		delete this.dragCtx;
	}
	return true;
};

RotateTool.prototype.OnCancel = function () {
	this.OnMouseUp(); // eslint-disable-line new-cap
};

module.exports = RotateTool;
