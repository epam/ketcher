var Vec2 = require('../util/vec2');

var Action = require('../ui/action');
var LassoHelper = require('./lassohelper');
var EditorTool = require('./editortool');

var ui = global.ui;

var RotateTool = function (editor) {
	this.editor = editor;
	this._lassoHelper = new LassoHelper(1, editor);

	var selection = this.editor._selectionHelper.selection;
	if (!selection.atoms || !selection.atoms.length) {
		// otherwise, clear selection
		this.editor._selectionHelper.setSelection(null);
	}
};

RotateTool.prototype = new EditorTool();

RotateTool.prototype.OnMouseDown = function (event) {

	var selection = this.editor._selectionHelper.selection;
	if (selection.atoms && selection.atoms.length) {
		var molecule = this.editor.render.ctab.molecule;
		var xy0 = new Vec2();

		if (!selection.atoms || !selection.atoms.length) {
			return true;
		}

		var rot_id = null, rot_all = false;

		selection.atoms.each(function (aid) {
			var atom = molecule.atoms.get(aid);

			xy0.add_(atom.pp);

			if (rot_all) {
				return;
			}

			atom.neighbors.find(function (nei) {
				var hb = molecule.halfBonds.get(nei);

				if (selection.atoms.indexOf(hb.end) == -1) {
					if (hb.loop >= 0) {
						var nei_atom = molecule.atoms.get(aid);
						if (!Object.isUndefined(nei_atom.neighbors.find(function (nei_nei) {
							var nei_hb = molecule.halfBonds.get(nei_nei);
							return nei_hb.loop >= 0 && selection.atoms.indexOf(nei_hb.end) != -1;
						}))) {
							rot_all = true;
							return true;
						}
					}
					if (rot_id == null) {
						rot_id = aid;
					} else if (rot_id != aid) {
						rot_all = true;
						return true;
					}
				}
				return false;
			});
		});

		if (!rot_all && rot_id != null) {
			xy0 = molecule.atoms.get(rot_id).pp;
		} else {
			xy0 = xy0.scaled(1 / selection.atoms.length);
		}

		this.dragCtx = {
			xy0: xy0,
			angle1: this._calcAngle(xy0, ui.page2obj(event)),
			all: rot_all
		};
	} else {
		this._lassoHelper.begin(event);
	}
	return true;
};
RotateTool.prototype.OnMouseMove = function (event) {
	if (this._lassoHelper.running()) {
		this.editor._selectionHelper.setSelection(
		this._lassoHelper.addPoint(event)
		);
	} else if ('dragCtx' in this) {
		var _E_ = this.editor, _R_ = _E_.render;
		var _DC_ = this.dragCtx;

		var pos = ui.page2obj(event);
		var angle = this._calcAngle(_DC_.xy0, pos) - _DC_.angle1;

		var degrees = Math.round(angle / Math.PI * 180);

		if (degrees > 180) {
			degrees -= 360;
		} else if (degrees <= -180) {
			degrees += 360;
		}

		if ('angle' in _DC_ && _DC_.angle == degrees) return true;
		if ('action' in _DC_) _DC_.action.perform();

		_DC_.angle = degrees;
		_DC_.action = Action.fromRotate(
			_DC_.all ? _R_.ctab.molecule : this.editor.getSelection(),
			_DC_.xy0,
			angle
		);

		$('toolText').update(degrees + 'º');

		_R_.update();
	}
	return true;
};

RotateTool.prototype.OnMouseUp = function (event) {
	var id = null; // id of an existing group, if we're editing one
	var selection = null; // atoms to include in a newly created group
	if (this._lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		selection = this._lassoHelper.end(event);
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