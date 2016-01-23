var Set = require('../util/set');
var ReStruct = require('../render/restruct');
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

module.exports = Editor;
