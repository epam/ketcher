var Action = require('../action');
var element = require('../../chem/element');
var Struct = require('../../chem/struct');

var EditorTool = require('./base');
var HoverHelper = require('./helper/hover');
var LassoHelper = require('./helper/lasso');
var SGroupHelper = require('./helper/sgroup');
var RGroupAtomTool = require('./rgroupatom');

var ui = global.ui;

var SelectTool = function (editor, mode) {
	this.editor = editor;

	this._hoverHelper = new HoverHelper(this);
	this._lassoHelper = new LassoHelper(mode == 'lasso' ? 0 : 1, editor, mode == 'fragment');
	this._sGroupHelper = new SGroupHelper(editor);
};

SelectTool.prototype = new EditorTool();
SelectTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	var ctab = rnd.ctab, struct = ctab.molecule;
	this._hoverHelper.hover(null); // TODO review hovering for touch devices
	var selectFragment = (this._lassoHelper.fragment || event.ctrlKey);
	var ci = rnd.findItem(
		event,
		selectFragment ?
			['frags', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags'] :
			['atoms', 'bonds', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags']
	);
	if (!ci || ci.type == 'Canvas') {
		if (!this._lassoHelper.fragment)
			this._lassoHelper.begin(event);
	} else {
		this._hoverHelper.hover(null);
		if ('onShowLoupe' in rnd)
			rnd.onShowLoupe(true);
		if (!this.editor._selectionHelper.isSelected(ci)) {
			if (ci.map == 'frags') {
				var frag = ctab.frags.get(ci.id);
				this.editor._selectionHelper.setSelection(
				{ 'atoms': frag.fragGetAtoms(rnd, ci.id), 'bonds': frag.fragGetBonds(rnd, ci.id) },
					event.shiftKey
				);
			} else if (ci.map == 'sgroups') {
				var sgroup = ctab.sgroups.get(ci.id).item;
				this.editor._selectionHelper.setSelection(
				{ 'atoms': Struct.SGroup.getAtoms(struct, sgroup), 'bonds': Struct.SGroup.getBonds(struct, sgroup) },
					event.shiftKey
				);
			} else if (ci.map == 'rgroups') {
				var rgroup = ctab.rgroups.get(ci.id);
				this.editor._selectionHelper.setSelection(
				{ 'atoms': rgroup.getAtoms(rnd), 'bonds': rgroup.getBonds(rnd) },
					event.shiftKey
				);
			} else {
				this.editor._selectionHelper.setSelection(ci, event.shiftKey);
			}
		}
		this.dragCtx = {
			item: ci,
			xy0: rnd.page2obj(event)
		};
		if (ci.map == 'atoms' && !ui.is_touch) {
			var self = this;
			this.dragCtx.timeout = setTimeout(
			function () {
				delete self.dragCtx;
				self.editor._selectionHelper.setSelection(null);
				ui.showLabelEditor({
					pos: rnd.obj2view(rnd.atomGetPos(ci.id)),
					label: rnd.atomGetAttr(ci.id, 'label'),
					charge: rnd.atomGetAttr(ci.id, 'charge'),

					onOk: function (res) {
						ui.addUndoAction(Action.fromAtomsAttrs(ci.id, res), true);
						rnd.update();
					}
				});
			},
				750
			);
			this.dragCtx.stopTapping = function () {
				if ('timeout' in self.dragCtx) {
					clearTimeout(self.dragCtx.timeout);
					delete self.dragCtx.timeout;
				}
			};
		}
	}
	return true;
};

SelectTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		if ('stopTapping' in this.dragCtx) this.dragCtx.stopTapping();
		// moving selected objects
		if (this.dragCtx.action) {
			this.dragCtx.action.perform();
			rnd.update(); // redraw the elements in unshifted position, lest the have different offset
		}
		this.dragCtx.action = Action.fromMultipleMove(
		this.editor.getSelection(true),
		rnd.page2obj(event).sub(this.dragCtx.xy0));
		// finding & highlighting object to stick to
		if (['atoms'/* , 'bonds'*/].indexOf(this.dragCtx.item.map) >= 0) {
			// TODO add bond-to-bond fusing
			var ci = rnd.findItem(event, [this.dragCtx.item.map], this.dragCtx.item);
			this._hoverHelper.hover(ci.map == this.dragCtx.item.map ? ci : null);
		}
		rnd.update();
	} else if (this._lassoHelper.running()) {
		this.editor._selectionHelper.setSelection(this._lassoHelper.addPoint(event), event.shiftKey);
	} else {
		this._hoverHelper.hover(
		rnd.findItem(
			event,
			(this._lassoHelper.fragment || event.ctrlKey) ?
				['frags', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags'] :
				['atoms', 'bonds', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags']
		)
		);
	}
	return true;
};
SelectTool.prototype.OnMouseUp = function (event) {
	if ('dragCtx' in this) {
		if ('stopTapping' in this.dragCtx) this.dragCtx.stopTapping();
		if (['atoms'/* , 'bonds'*/].indexOf(this.dragCtx.item.map) >= 0) {
			// TODO add bond-to-bond fusing
			var ci = this.editor.render.findItem(event, [this.dragCtx.item.map], this.dragCtx.item);
			if (ci.map == this.dragCtx.item.map) {
				this._hoverHelper.hover(null);
				this.editor._selectionHelper.setSelection();
				this.dragCtx.action = this.dragCtx.action
						 ? Action.fromAtomMerge(this.dragCtx.item.id, ci.id).mergeWith(this.dragCtx.action)
						 : Action.fromAtomMerge(this.dragCtx.item.id, ci.id);
			}
		}
		ui.addUndoAction(this.dragCtx.action, true);
		this.editor.render.update();
		delete this.dragCtx;
	} else {
		if (this._lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
			this.editor._selectionHelper.setSelection(this._lassoHelper.end(), event.shiftKey);
		} else if (this._lassoHelper.fragment) {
			this.editor._selectionHelper.setSelection();
		}
	}
	return true;
};

SelectTool.prototype.OnDblClick = function (event) {
	var rnd = this.editor.render;
	var ci = rnd.findItem(event);
	var struct = rnd.ctab.molecule;
	if (ci.map == 'atoms') {
		this.editor._selectionHelper.setSelection(ci);
		// TODO [RB] re-factoring needed. we probably need to intoduce "custom" element sets, some of them might be "special" (lists, r-groups), some of them might be "pluggable" (reaxys generics)
		var atom = struct.atoms.get(ci.id);
		if (atom.label == 'R#') {
			RGroupAtomTool.prototype.OnMouseUp.call(this, event);
		} else if (atom.label == 'L#') {
			ui.showElemTable({
				selection: atom,
				onOk: function (attrs) {
					if (atom.label != attrs.label || !atom.atomList.equals(attrs.atomList)) {
						ui.addUndoAction(Action.fromAtomsAttrs(ci.id, attrs));
						rnd.update();
					}
					return true;
				}
			});
		} else if (element.getElementByLabel(atom.label)) {
			var charge = rnd.atomGetAttr(ci.id, 'charge') - 0;
			var isotope = rnd.atomGetAttr(ci.id, 'isotope') - 0;
			var explicitValence = rnd.atomGetAttr(ci.id, 'explicitValence') - 0;
			ui.showAtomProperties({
				label: rnd.atomGetAttr(ci.id, 'label'),
				charge: charge == 0 ? '' : charge,
				isotope: isotope == 0 ? '' : isotope,
				explicitValence: explicitValence < 0 ? '' : explicitValence,
				radical: rnd.atomGetAttr(ci.id, 'radical'),
				invRet: rnd.atomGetAttr(ci.id, 'invRet'),
				exactChangeFlag: rnd.atomGetAttr(ci.id, 'exactChangeFlag'),
				ringBondCount: rnd.atomGetAttr(ci.id, 'ringBondCount'),
				substitutionCount: rnd.atomGetAttr(ci.id, 'substitutionCount'),
				unsaturatedAtom: rnd.atomGetAttr(ci.id, 'unsaturatedAtom'),
				hCount: rnd.atomGetAttr(ci.id, 'hCount'),
				onOk: function (res) {
					ui.addUndoAction(Action.fromAtomsAttrs(ci.id, {
						label: res.label,
						charge: res.charge == '' ? 0 : parseInt(res.charge, 10),
						isotope: res.isotope == '' ? 0 : parseInt(res.isotope, 10),
						explicitValence: res.explicitValence == '' ? -1 : parseInt(res.explicitValence, 10),
						radical: parseInt(res.radical, 10),
						// reaction flags
						invRet: parseInt(res.invRet, 10),
						exactChangeFlag: res.exactChangeFlag,
						// query flags
						ringBondCount: parseInt(res.ringBondCount, 10),
						substitutionCount: parseInt(res.substitutionCount, 10),
						unsaturatedAtom: res.unsaturatedAtom,
						hCount: parseInt(res.hCount, 10)
					}), true);
					rnd.update();
				}
			});
		} else {
			ui.showReaGenericsTable({
				values: [atom.label],
				onOk: function (res) {
					var label = res.values[0];
					if (atom.label != label) {
						ui.addUndoAction(Action.fromAtomsAttrs(ci.id, { label: label }));
						rnd.update();
					}
					return true;
				}
			});
		}
	} else if (ci.map == 'bonds') {
		this.editor._selectionHelper.setSelection(ci);
		var type = rnd.bondGetAttr(ci.id, 'type');
		var stereo = rnd.bondGetAttr(ci.id, 'stereo');
		ui.showBondProperties({
			type: Struct.Bond.type2Caption(type, stereo),
			topology: rnd.bondGetAttr(ci.id, 'topology') || 0,
			center: rnd.bondGetAttr(ci.id, 'reactingCenterStatus') || 0,
			onOk: function (res) {
				var bond = Object.assign(Struct.Bond.caption2Type(res.type), {
					topology: parseInt(res.topology, 10),
					reactingCenterStatus: parseInt(res.center, 10)
				});
				ui.addUndoAction(Action.fromBondAttrs(ci.id, bond), true);
				rnd.update();
			}
		});
	} else if (ci.map == 'sgroups') {
		this.editor._selectionHelper.setSelection(ci);
		this._sGroupHelper.showPropertiesDialog(ci.id);
//    } else if (ci.map == 'sgroupData') {
//        this._sGroupHelper.showPropertiesDialog(ci.sgid);
	}
	return true;
};

SelectTool.prototype.OnCancel = function () {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		if ('stopTapping' in this.dragCtx) this.dragCtx.stopTapping();
		ui.addUndoAction(this.dragCtx.action, true);
		rnd.update();
		delete this.dragCtx;
	} else if (this._lassoHelper.running()) {
		this.editor._selectionHelper.setSelection(this._lassoHelper.end());
	}
	this._hoverHelper.hover(null);
};

module.exports = SelectTool;
