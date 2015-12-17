var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var Action = require('../ui/action');

var ReStruct = require('../rnd/restruct')

var EditorTool = require('./editortool');
var LassoHelper = require('./lassohelper');
var SelectionHelper = require('./selectionhelper');

var ui = global.ui;

var Editor = function (render)
{
	this.render = render;
	this._selectionHelper = new SelectionHelper(this);
};

Editor.prototype.selectAll = function () {
	var selection = {};
	for (var map in ReStruct.maps) {
		selection[map] = ui.render.ctab[map].ikeys();
	}
	this._selectionHelper.setSelection(selection);
};
Editor.prototype.deselectAll = function () {
	this._selectionHelper.setSelection();
};
Editor.prototype.hasSelection = function (copyable) {
	if ('selection' in this._selectionHelper)
		for (var map in this._selectionHelper.selection)
			if (this._selectionHelper.selection[map].length > 0)
			if (!copyable || map !== 'sgroupData')
				return true;
	return false;
};
Editor.prototype.getSelection = function (explicit) {
	var selection = {};
	if ('selection' in this._selectionHelper) {
		for (var map in this._selectionHelper.selection) {
			selection[map] = this._selectionHelper.selection[map].slice(0);
		}
	}
	if (explicit) {
		var struct = this.render.ctab.molecule;
		// "auto-select" the atoms for the bonds in selection
		if ('bonds' in selection) {
			selection.bonds.each(
			function (bid) {
				var bond = struct.bonds.get(bid);
				selection.atoms = selection.atoms || [];
				if (selection.atoms.indexOf(bond.begin) < 0) selection.atoms.push(bond.begin);
				if (selection.atoms.indexOf(bond.end) < 0) selection.atoms.push(bond.end);
			},
				this
			);
		}
		// "auto-select" the bonds with both atoms selected
		if ('atoms' in selection && 'bonds' in selection) {
			struct.bonds.each(
			function (bid) {
				if (!('bonds' in selection) || selection.bonds.indexOf(bid) < 0) {
					var bond = struct.bonds.get(bid);
					if (selection.atoms.indexOf(bond.begin) >= 0 && selection.atoms.indexOf(bond.end) >= 0) {
						selection.bonds = selection.bonds || [];
						selection.bonds.push(bid);
					}
				}
			},
				this
			);
		}
	}
	return selection;
};

Editor.prototype.getSelectionStruct = function () {
	console.assert(ui.ctab == this.render.ctab.molecule,
				   'Another ctab');
	var src = ui.ctab;
	var selection = this.getSelection(true);
	var dst = src.clone(Set.fromList(selection.atoms),
						Set.fromList(selection.bonds), true);

	// Copy by its own as Struct.clone doesn't support
	// arrows/pluses id sets
	src.rxnArrows.each(function (id, item) {
		if (selection.rxnArrows.indexOf(id) != -1)
			dst.rxnArrows.add(item.clone());
	});
	src.rxnPluses.each(function (id, item) {
		if (selection.rxnPluses.indexOf(id) != -1)
			dst.rxnPluses.add(item.clone());
	});

	// TODO: should be reaction only if arrwos? check this logic
	dst.isReaction = src.isReaction &&
		(dst.rxnArrows.count() || dst.rxnPluses.count());

	return dst;
};                                        

Editor.RotateTool = function (editor) {
	this.editor = editor;
	this._lassoHelper = new LassoHelper(1, editor);

	var selection = this.editor._selectionHelper.selection;
	if (!selection.atoms || !selection.atoms.length) {
		// otherwise, clear selection
		this.editor._selectionHelper.setSelection(null);
	}
};

Editor.RotateTool.prototype = new EditorTool();

Editor.RotateTool.prototype.OnMouseDown = function (event) {

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
Editor.RotateTool.prototype.OnMouseMove = function (event) {
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

Editor.RotateTool.prototype.OnMouseUp = function (event) {
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

Editor.RotateTool.prototype.OnCancel = function () {
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

module.exports = Editor;
