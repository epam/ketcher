var Set = require('../../util/set');

var Action = require('../action');
var element = require('../../chem/element');
var Struct = require('../../chem/struct');

var EditorTool = require('./base');
var HoverHelper = require('./helper/hover');
var LassoHelper = require('./helper/lasso');

var SGroup = require('./sgroup');
var RGroupAtomTool = require('./rgroupatom');

var ui = global.ui;

function SelectTool(editor, mode) {
	if (!(this instanceof SelectTool))
		return new SelectTool(editor, mode);

	this.editor = editor;

	this.hoverHelper = new HoverHelper(this);
	this.lassoHelper = new LassoHelper(mode == 'lasso' ? 0 : 1, editor, mode == 'fragment');
}

SelectTool.prototype = new EditorTool();
SelectTool.prototype.OnMouseDown = function (event) { // eslint-disable-line max-statements
	var rnd = this.editor.render;
	var ctab = rnd.ctab;
	var struct = ctab.molecule;
	this.hoverHelper.hover(null); // TODO review hovering for touch devicess
	var selectFragment = (this.lassoHelper.fragment || event.ctrlKey);
	var ci = this.editor.findItem(
		event,
		selectFragment ?
			['frags', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags'] :
			['atoms', 'bonds', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags']
	);
	if (!ci || ci.type == 'Canvas') {
		if (!this.lassoHelper.fragment)
			this.lassoHelper.begin(event);
	} else {
		this.hoverHelper.hover(null);
		if (!isSelected(rnd, this.editor.selection(), ci)) {
			var sel = closestToSel(ci);
			if (ci.map == 'frags') {
				var frag = ctab.frags.get(ci.id);
				sel = {
					atoms: frag.fragGetAtoms(rnd, ci.id),
					bonds: frag.fragGetBonds(rnd, ci.id)
				};
			} else if (ci.map == 'sgroups') {
				var sgroup = ctab.sgroups.get(ci.id).item;
				sel = {
					atoms: Struct.SGroup.getAtoms(struct, sgroup),
					bonds: Struct.SGroup.getBonds(struct, sgroup)
				};
			} else if (ci.map == 'rgroups') {
				var rgroup = ctab.rgroups.get(ci.id);
				sel = {
					atoms: rgroup.getAtoms(rnd),
					bonds: rgroup.getBonds(rnd)
				};
			}
			this.editor.selection(!event.shiftKey ? sel :
			                         selMerge(sel, this.editor.selection()));
		}
		this.dragCtx = {
			item: ci,
			xy0: rnd.page2obj(event)
		};
		if (ci.map == 'atoms') {
			var self = this;
			this.dragCtx.timeout = setTimeout(
			function () {
				delete self.dragCtx;
				self.editor.selection(null);
				var atom = rnd.ctab.molecule.atoms.get(ci.id);
				ui.showLabelEditor({
					// pos: rnd.obj2view(atom.pp)
					label: atom.label,
					charge: atom.charge,
					isotope: atom.isotope,
					radical: atom.radical,

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
			this.editor.explicitSelected(),
			rnd.page2obj(event).sub(this.dragCtx.xy0));
		// finding & highlighting object to stick to
		if (['atoms'/* , 'bonds'*/].indexOf(this.dragCtx.item.map) >= 0) {
			// TODO add bond-to-bond fusing
			var ci = this.editor.findItem(event, [this.dragCtx.item.map], this.dragCtx.item);
			this.hoverHelper.hover(ci.map == this.dragCtx.item.map ? ci : null);
		}
		rnd.update();
	} else if (this.lassoHelper.running()) {
		var sel = this.lassoHelper.addPoint(event);
		this.editor.selection(!event.shiftKey ? sel :
		                         selMerge(sel, this.editor.selection()));
	} else {
		this.hoverHelper.hover(
		this.editor.findItem(event,
			(this.lassoHelper.fragment || event.ctrlKey) ?
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
			var ci = this.editor.findItem(event, [this.dragCtx.item.map], this.dragCtx.item);
			if (ci.map == this.dragCtx.item.map) {
				this.hoverHelper.hover(null);
				this.editor.selection(null);
				this.dragCtx.action = this.dragCtx.action ?
					Action.fromAtomMerge(this.dragCtx.item.id, ci.id).mergeWith(this.dragCtx.action) :
						Action.fromAtomMerge(this.dragCtx.item.id, ci.id);
			}
		}
		ui.addUndoAction(this.dragCtx.action, true);
		this.editor.render.update();
		delete this.dragCtx;
	} else if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		var sel = this.lassoHelper.end();
		this.editor.selection(!event.shiftKey ? sel :
		                         selMerge(sel, this.editor.selection()));
	} else if (this.lassoHelper.fragment) {
		this.editor.selection(null);
	}
	return true;
};

SelectTool.prototype.OnDblClick = function (event) { // eslint-disable-line max-statements
	var editor = this.editor;
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event);
	var struct = rnd.ctab.molecule;
	if (ci.map == 'atoms') {
		this.editor.selection(closestToSel(ci));
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
			// TODO: the same as atom?
			var atom2 = rnd.ctab.molecule.atoms.get(ci.id);
			var charge = atom2.charge - 0;
			var isotope = atom2.isotope - 0;
			var explicitValence = atom2.explicitValence - 0;
			ui.showAtomProperties({
				label: atom2.label,
				charge: charge == 0 ? '' : charge,
				isotope: isotope == 0 ? '' : isotope,
				explicitValence: explicitValence < 0 ? '' : explicitValence,
				radical: atom2.radical,
				invRet: atom2.invRet,
				exactChangeFlag: atom2.exactChangeFlag,
				ringBondCount: atom2.ringBondCount,
				substitutionCount: atom2.substitutionCount,
				unsaturatedAtom: atom2.unsaturatedAtom,
				hCount: atom2.hCount,
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
		this.editor.selection(closestToSel(ci));
		var bond = rnd.ctab.bonds.get(ci.id).b;
		var res = editor.event.bondEdit.dispatch(bond);
		Promise.resolve(res).then(function (newbond) {
			editor.event.change.dispatch(Action.fromBondAttrs(ci.id, newbond));
		});
	} else if (ci.map == 'sgroups') {
		this.editor.selection(closestToSel(ci));
		SGroup.dialog(this.editor, ci.id);
//    } else if (ci.map == 'sgroupData') {
//        SGroup.dialog(this.editor, ci.sgid);
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
	} else if (this.lassoHelper.running()) {
		this.editor.selection(this.lassoHelper.end());
	}
	this.hoverHelper.hover(null);
};

function closestToSel(ci) {
	var res = {};
	res[ci.map] = [ci.id];
	return res;
}

// TODO: deep-merge?
function selMerge(selection, add) {
	if (add) {
		for (var item in add) {
			if (!selection[item]) {
				selection[item] = add[item].slice();
			} else {
				selection[item] = uniqArray(selection[item],
				                            add[item]);
			}
		}
	}
	return selection;
}

function uniqArray(dest, add) {
	for (var i = 0; i < add.length; i++) {
		if (dest.indexOf(add[i]) < 0)
			dest.push(add[i]);
	}
	return dest;
}

function isSelected(render, selection, item) {
	if (!selection)
		return false;
	var ctab = render.ctab;
	if (item.map == 'frags' || item.map == 'rgroups') {
		var atoms = item.map == 'frags' ?
			ctab.frags.get(item.id).fragGetAtoms(render, item.id) :
		    ctab.rgroups.get(item.id).getAtoms(render);

		return !!selection['atoms'] &&
			Set.subset(Set.fromList(atoms), Set.fromList(selection['atoms']));
	}

	return !!selection[item.map] &&
		selection[item.map].indexOf(item.id) > -1;
}

module.exports = SelectTool;
