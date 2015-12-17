var Set = require('../util/set');
var Vec2 = require('../util/vec2');
var Action = require('../ui/action');

var ReStruct = require('../rnd/restruct')

var EditorTool = require('./editortool');
var HoverHelper = require('./hoverhelper');
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
                                        
Editor.APointTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
Editor.APointTool.prototype = new EditorTool();
Editor.APointTool.prototype.OnMouseMove = function (event) {
	this._hoverHelper.hover(this.editor.render.findItem(event, ['atoms']));
};
Editor.APointTool.prototype.OnMouseUp = function (event) {
	var ci = this.editor.render.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms') {
		this._hoverHelper.hover(null);
		var apOld = this.editor.render.ctab.molecule.atoms.get(ci.id).attpnt;
		ui.showAtomAttachmentPoints({
			selection: apOld,
			onOk: function (apNew) {
				if (apOld != apNew) {
					ui.addUndoAction(Action.fromAtomsAttrs(ci.id, { attpnt: apNew }), true);
					ui.render.update();
				}
			}.bind(this)
		});
		return true;
	}
};


Editor.ReactionArrowTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
Editor.ReactionArrowTool.prototype = new EditorTool();
Editor.ReactionArrowTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.render.findItem(event, ['rxnArrows']);
	if (ci && ci.map == 'rxnArrows') {
		this._hoverHelper.hover(null);
		this.editor._selectionHelper.setSelection(ci);
		this.dragCtx = {
			xy0: ui.page2obj(event)
		};
	}
};
Editor.ReactionArrowTool.prototype.OnMouseMove = function (event) {
	if ('dragCtx' in this) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform();
		this.dragCtx.action = Action.fromMultipleMove(
			this.editor._selectionHelper.selection,
		ui.page2obj(event).sub(this.dragCtx.xy0)
		);
		ui.render.update();
	} else {
		this._hoverHelper.hover(this.editor.render.findItem(event, ['rxnArrows']));
	}
};
Editor.ReactionArrowTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsequent undo/redo fails
		this.editor.render.update();
		delete this.dragCtx;
	} else if (this.editor.render.ctab.molecule.rxnArrows.count() < 1) {
		ui.addUndoAction(Action.fromArrowAddition(ui.page2obj(event)));
		this.editor.render.update();
	}
};


Editor.ReactionPlusTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
};
Editor.ReactionPlusTool.prototype = new EditorTool();
Editor.ReactionPlusTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.render.findItem(event, ['rxnPluses']);
	if (ci && ci.map == 'rxnPluses') {
		this._hoverHelper.hover(null);
		this.editor._selectionHelper.setSelection(ci);
		this.dragCtx = {
			xy0: ui.page2obj(event)
		};
	}
};
Editor.ReactionPlusTool.prototype.OnMouseMove = function (event) {
	if ('dragCtx' in this) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform();
		this.dragCtx.action = Action.fromMultipleMove(
			this.editor._selectionHelper.selection,
		ui.page2obj(event).sub(this.dragCtx.xy0)
		);
		ui.render.update();
	} else {
		this._hoverHelper.hover(this.editor.render.findItem(event, ['rxnPluses']));
	}
};
Editor.ReactionPlusTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		ui.addUndoAction(this.dragCtx.action, false); // TODO investigate, subsequent undo/redo fails
		this.editor.render.update();
		delete this.dragCtx;
	} else {
		ui.addUndoAction(Action.fromPlusAddition(ui.page2obj(event)));
		this.editor.render.update();
	}
};


Editor.ReactionMapTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);

	this.editor._selectionHelper.setSelection(null);

	this.rcs = this.editor.render.ctab.molecule.getComponents();
};
Editor.ReactionMapTool.prototype = new EditorTool();
Editor.ReactionMapTool.prototype.OnMouseDown = function (event) {
	var ci = this.editor.render.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms') {
		this._hoverHelper.hover(null);
		this.dragCtx = {
			item: ci,
			xy0: ui.page2obj(event)
		}
	}
};
Editor.ReactionMapTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		var ci = rnd.findItem(event, ['atoms'], this.dragCtx.item);
		if (ci && ci.map == 'atoms' && this._isValidMap(this.dragCtx.item.id, ci.id)) {
			this._hoverHelper.hover(ci);
			rnd.drawSelectionLine(rnd.atomGetPos(this.dragCtx.item.id), rnd.atomGetPos(ci.id));
		} else {
			this._hoverHelper.hover(null);
			rnd.drawSelectionLine(rnd.atomGetPos(this.dragCtx.item.id), ui.page2obj(event));
		}
	} else {
		this._hoverHelper.hover(rnd.findItem(event, ['atoms']));
	}
};
Editor.ReactionMapTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		var rnd = this.editor.render;
		var ci = rnd.findItem(event, ['atoms'], this.dragCtx.item);
		if (ci && ci.map == 'atoms' && this._isValidMap(this.dragCtx.item.id, ci.id)) {
			var action = new Action();
			var atoms = rnd.ctab.molecule.atoms;
			var atom1 = atoms.get(this.dragCtx.item.id), atom2 = atoms.get(ci.id);
			var aam1 = atom1.aam, aam2 = atom2.aam;
			if (!aam1 || aam1 != aam2) {
				if (aam1 && aam1 != aam2 || !aam1 && aam2) {
					atoms.each(
					function (aid, atom) {
						if (aid != this.dragCtx.item.id && (aam1 && atom.aam == aam1 || aam2 && atom.aam == aam2)) {
							action.mergeWith(Action.fromAtomsAttrs(aid, { aam: 0 }));
						}
					},
						this
					);
				}
				if (aam1) {
					action.mergeWith(Action.fromAtomsAttrs(ci.id, { aam: aam1 }));
				} else {
					var aam = 0; atoms.each(function (aid, atom) { aam = Math.max(aam, atom.aam || 0); });
					action.mergeWith(Action.fromAtomsAttrs(this.dragCtx.item.id, { aam: aam + 1 }));
					action.mergeWith(Action.fromAtomsAttrs(ci.id, { aam: aam + 1 }));
				}
				ui.addUndoAction(action, true);
				rnd.update();
			}
		}
		rnd.drawSelectionLine(null);
		delete this.dragCtx;
	}
	this._hoverHelper.hover(null);
};

Editor.ReactionMapTool.prototype._isValidMap = function (aid1, aid2) {
	var t1, t2;
	for (var ri = 0; (!t1 || !t2) && ri < this.rcs.reactants.length; ri++) {
		var ro = Set.list(this.rcs.reactants[ri]);
		if (!t1 && ro.indexOf(aid1) >= 0) t1 = 'r';
		if (!t2 && ro.indexOf(aid2) >= 0) t2 = 'r';
	}
	for (var pi = 0; (!t1 || !t2) && pi < this.rcs.products.length; pi++) {
		var po = Set.list(this.rcs.products[pi]);
		if (!t1 && po.indexOf(aid1) >= 0) t1 = 'p';
		if (!t2 && po.indexOf(aid2) >= 0) t2 = 'p';
	}
	return t1 && t2 && t1 != t2;
};


Editor.ReactionUnmapTool = function (editor) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);

	this.editor._selectionHelper.setSelection(null);
};
Editor.ReactionUnmapTool.prototype = new EditorTool();
Editor.ReactionUnmapTool.prototype.OnMouseMove = function (event) {
	var ci = this.editor.render.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms') {
		this._hoverHelper.hover(this.editor.render.ctab.molecule.atoms.get(ci.id).aam ? ci : null);
	} else {
		this._hoverHelper.hover(null);
	}
};
Editor.ReactionUnmapTool.prototype.OnMouseUp = function (event) {
	var ci = this.editor.render.findItem(event, ['atoms']);
	var atoms = this.editor.render.ctab.molecule.atoms;
	if (ci && ci.map == 'atoms' && atoms.get(ci.id).aam) {
		var action = new Action();
		var aam = atoms.get(ci.id).aam;
		atoms.each(
		function (aid, atom) {
			if (atom.aam == aam) {
				action.mergeWith(Action.fromAtomsAttrs(aid, { aam: 0 }));
			}
		},
			this
		);
		ui.addUndoAction(action, true);
		this.editor.render.update();
	}
	this._hoverHelper.hover(null);
};

Editor.PasteTool = function (editor, struct) {
	this.editor = editor;
	this.struct = struct;
	this.action = Action.fromPaste(
		this.struct, 'lastEvent' in this.OnMouseMove0 ?
			ui.page2obj(this.OnMouseMove0.lastEvent) : undefined);
	this.editor.render.update();
};
Editor.PasteTool.prototype = new EditorTool();
Editor.PasteTool.prototype.OnMouseMove = function (event) {
	if ('action' in this) {
		this.action.perform(this.editor);
	}
	this.action = Action.fromPaste(this.struct, ui.page2obj(event));
	this.editor.render.update();
};
Editor.PasteTool.prototype.OnMouseUp = function () {
	ui.addUndoAction(this.action);
	delete this.action;
	ui.selectAction(null);
};
Editor.PasteTool.prototype.OnCancel = function () {
	if ('action' in this) {
		this.action.perform(this.editor);
		delete this.action;
	}
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
