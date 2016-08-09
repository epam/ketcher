var Set = require('../../util/set');
var Action = require('../action');
var HoverHelper = require('./helper/hover');
var EditorTool = require('./base');

var ui = global.ui;

function ReactionMapTool(editor) {
	this.editor = editor;

	this.hoverHelper = new HoverHelper(this);

	this.editor._selectionHelper.setSelection(null);

	this.rcs = this.editor.render.ctab.molecule.getComponents();
}
ReactionMapTool.prototype = new EditorTool();
ReactionMapTool.prototype.OnMouseDown = function (event) {
	var rnd = this.editor.render;
	var ci = rnd.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms') {
		this.hoverHelper.hover(null);
		this.dragCtx = {
			item: ci,
			xy0: rnd.page2obj(event)
		};
	}
};
ReactionMapTool.prototype.OnMouseMove = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		var ci = rnd.findItem(event, ['atoms'], this.dragCtx.item);
		if (ci && ci.map == 'atoms' && this._isValidMap(this.dragCtx.item.id, ci.id)) {
			this.hoverHelper.hover(ci);
			rnd.drawSelectionLine(rnd.atomGetPos(this.dragCtx.item.id), rnd.atomGetPos(ci.id));
		} else {
			this.hoverHelper.hover(null);
			rnd.drawSelectionLine(rnd.atomGetPos(this.dragCtx.item.id), rnd.page2obj(event));
		}
	} else {
		this.hoverHelper.hover(rnd.findItem(event, ['atoms']));
	}
};
ReactionMapTool.prototype.OnMouseUp = function (event) { // eslint-disable-line max-statements
	if ('dragCtx' in this) {
		var rnd = this.editor.render;
		var ci = rnd.findItem(event, ['atoms'], this.dragCtx.item);
		if (ci && ci.map == 'atoms' && this._isValidMap(this.dragCtx.item.id, ci.id)) {
			var action = new Action();
			var atoms = rnd.ctab.molecule.atoms;
			var atom1 = atoms.get(this.dragCtx.item.id);
			var atom2 = atoms.get(ci.id);
			var aam1 = atom1.aam;
			var aam2 = atom2.aam;
			if (!aam1 || aam1 != aam2) {
				if (aam1 && aam1 != aam2 || !aam1 && aam2) { // eslint-disable-line no-mixed-operators
					atoms.each(
					function (aid, atom) {
						if (aid != this.dragCtx.item.id && (aam1 && atom.aam == aam1 || aam2 && atom.aam == aam2)) // eslint-disable-line no-mixed-operators
							action.mergeWith(Action.fromAtomsAttrs(aid, { aam: 0 }));
					},
						this
					);
				}
				if (aam1) {
					action.mergeWith(Action.fromAtomsAttrs(ci.id, { aam: aam1 }));
				} else {
					var aam = 0;
					atoms.each(function (aid, atom) {
						aam = Math.max(aam, atom.aam || 0);
					});
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
	this.hoverHelper.hover(null);
};

ReactionMapTool.prototype._isValidMap = function (aid1, aid2) {
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

module.exports = ReactionMapTool;
