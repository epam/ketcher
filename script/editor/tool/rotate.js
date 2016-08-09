var Vec2 = require('../../util/vec2');

var Action = require('../action');
var LassoHelper = require('./helper/lasso');
var EditorTool = require('./base');

var ui = global.ui;

function RotateTool(editor) {
	this.editor = editor;
	this.lassoHelper = new LassoHelper(1, editor);

	var selection = this.editor._selectionHelper.selection;
	if (!selection.atoms || !selection.atoms.length)
		// otherwise, clear selection
		this.editor._selectionHelper.setSelection(null);
}

RotateTool.prototype = new EditorTool();

RotateTool.prototype.OnMouseDown = function (event) {
	var selection = this.editor._selectionHelper.selection;
	if (selection.atoms && selection.atoms.length) {
		var rnd = this.editor.render;
		var molecule = rnd.ctab.molecule;
		var xy0 = new Vec2();

		if (!selection.atoms || !selection.atoms.length)
			return true;

		var rotId = null;
		var rotAll = false;

		selection.atoms.each(function (aid) {
			var atom = molecule.atoms.get(aid);

			xy0.add_(atom.pp);

			if (rotAll)
				return;

			atom.neighbors.find(function (nei) {
				var hb = molecule.halfBonds.get(nei);

				if (selection.atoms.indexOf(hb.end) == -1) {
					if (hb.loop >= 0) {
						var neiAtom = molecule.atoms.get(aid);
						if (!Object.isUndefined(neiAtom.neighbors.find(function (neiNei) {
							var neiHb = molecule.halfBonds.get(neiNei);
							return neiHb.loop >= 0 && selection.atoms.indexOf(neiHb.end) != -1;
						}))) {
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

		if (!rotId && rotId != null)
			xy0 = molecule.atoms.get(rotId).pp;
		else
			xy0 = xy0.scaled(1 / selection.atoms.length);

		this.dragCtx = {
			xy0: xy0,
			angle1: this.calcAngle(xy0, rnd.page2obj(event)),
			all: rotAll
		};
	} else {
		this.lassoHelper.begin(event);
	}
	return true;
};
RotateTool.prototype.OnMouseMove = function (event) { // eslint-disable-line max-statements
	if (this.lassoHelper.running()) {
		this.editor._selectionHelper.setSelection(
		this.lassoHelper.addPoint(event)
		);
	} else if ('dragCtx' in this) {
		var editor = this.editor;
		var rnd = editor.render;
		var dragCtx = this.dragCtx;

		var pos = rnd.page2obj(event);
		var angle = this.calcAngle(dragCtx.xy0, pos) - dragCtx.angle1;

		var degrees = Math.round(angle / Math.PI * 180);

		if (degrees > 180)
			degrees -= 360;
		else if (degrees <= -180)
			degrees += 360;

		if ('angle' in dragCtx && dragCtx.angle == degrees) return true;
		if ('action' in dragCtx) dragCtx.action.perform();

		dragCtx.angle = degrees;
		dragCtx.action = Action.fromRotate(
			dragCtx.all ? rnd.ctab.molecule : this.editor.getSelection(),
			dragCtx.xy0,
			angle
		);

		$('toolText').update(degrees + 'º');

		rnd.update();
	}
	return true;
};

RotateTool.prototype.OnMouseUp = function (event) {
	// atoms to include in a newly created group
	var selection = null; // eslint-disable-line no-unused-vars
	if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		selection = this.lassoHelper.end(event);
	} else if ('dragCtx' in this) {
		if ('action' in this.dragCtx) {
			ui.addUndoAction(this.dragCtx.action, true);
			$('toolText').update('');
		} else {
			this.editor._selectionHelper.setSelection();
		}
		delete this.dragCtx;
	}
	return true;
};

RotateTool.prototype.OnCancel = function () {
	if ('dragCtx' in this) {
		if ('action' in this.dragCtx) {
			ui.addUndoAction(this.dragCtx.action, true);
			$('toolText').update('');
		}
		delete this.dragCtx;
	}

	// don't reset the selection when leaving the canvas, see KETCHER-632
	// this.editor._selectionHelper.setSelection();
};

module.exports = RotateTool;
