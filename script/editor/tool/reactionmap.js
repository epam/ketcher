var Set = require('../../util/set');
var scale = require('../../util/scale');
var Action = require('../action');
var HoverHelper = require('./helper/hover');
var draw = require('../../render/draw');

function ReactionMapTool(editor) {
	if (!(this instanceof ReactionMapTool))
		return new ReactionMapTool(editor);

	this.editor = editor;
	this.editor.selection(null);

	this.hoverHelper = new HoverHelper(this);
	this.rcs = this.editor.render.ctab.molecule.getComponents();
}

ReactionMapTool.prototype.mousedown = function (event) {
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms']);
	if (ci && ci.map == 'atoms') {
		this.hoverHelper.hover(null);
		this.dragCtx = {
			item: ci,
			xy0: rnd.page2obj(event)
		};
	}
};
ReactionMapTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	if ('dragCtx' in this) {
		var ci = this.editor.findItem(event, ['atoms'], this.dragCtx.item);
		var atoms = rnd.ctab.molecule.atoms;
		if (ci && ci.map == 'atoms' && isValidMap(this.rcs, this.dragCtx.item.id, ci.id)) {
			this.hoverHelper.hover(ci);
			this.updateLine(atoms.get(this.dragCtx.item.id).pp, atoms.get(ci.id).pp);
		} else {
			this.hoverHelper.hover(null);
			this.updateLine(atoms.get(this.dragCtx.item.id).pp, rnd.page2obj(event));
		}
	} else {
		this.hoverHelper.hover(this.editor.findItem(event, ['atoms']));
	}
};

ReactionMapTool.prototype.updateLine = function (p1, p2) {
	if (this.line) {
		this.line.remove();
		this.line = null;
	}
	if (p1 && p2) {
		var rnd = this.editor.render;
		this.line = draw.selectionLine(rnd.paper,
			scale.obj2scaled(p1, rnd.options).add(rnd.options.offset),
			scale.obj2scaled(p2, rnd.options).add(rnd.options.offset),
			rnd.options);
	}
};

ReactionMapTool.prototype.mouseup = function (event) { // eslint-disable-line max-statements
	if ('dragCtx' in this) {
		var rnd = this.editor.render;
		var ci = this.editor.findItem(event, ['atoms'], this.dragCtx.item);
		if (ci && ci.map == 'atoms' && isValidMap(this.rcs, this.dragCtx.item.id, ci.id)) {
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
							action.mergeWith(Action.fromAtomsAttrs(rnd.ctab, aid, { aam: 0 }));
					},
						this
					);
				}
				if (aam1) {
					action.mergeWith(Action.fromAtomsAttrs(rnd.ctab, ci.id, { aam: aam1 }));
				} else {
					var aam = 0;
					atoms.each(function (aid, atom) {
						aam = Math.max(aam, atom.aam || 0);
					});
					action.mergeWith(Action.fromAtomsAttrs(rnd.ctab, this.dragCtx.item.id, { aam: aam + 1 }));
					action.mergeWith(Action.fromAtomsAttrs(rnd.ctab, ci.id, { aam: aam + 1 }));
				}
				this.editor.update(action);
			}
		}
		this.updateLine(null);
		delete this.dragCtx;
	}
	this.hoverHelper.hover(null);
};

function isValidMap(rcs, aid1, aid2) {
	var t1, t2;
	for (var ri = 0; (!t1 || !t2) && ri < rcs.reactants.length; ri++) {
		var ro = Set.list(rcs.reactants[ri]);
		if (!t1 && ro.indexOf(aid1) >= 0) t1 = 'r';
		if (!t2 && ro.indexOf(aid2) >= 0) t2 = 'r';
	}
	for (var pi = 0; (!t1 || !t2) && pi < rcs.products.length; pi++) {
		var po = Set.list(rcs.products[pi]);
		if (!t1 && po.indexOf(aid1) >= 0) t1 = 'p';
		if (!t2 && po.indexOf(aid2) >= 0) t2 = 'p';
	}
	return t1 && t2 && t1 != t2;
}

module.exports = ReactionMapTool;
