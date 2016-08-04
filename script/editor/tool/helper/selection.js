var ReStruct = require('../../../render/restruct');
var Set = require('../../../util/set');

var ui = global.ui;

var SelectionHelper = function (editor) {
	this.editor = editor;
};
SelectionHelper.prototype.setSelection = function (selection, add) {
	if (!('selection' in this) || !add) {
		this.selection = {};
		for (var map1 in ReStruct.maps) this.selection[map1] = []; // TODO it should NOT be mandatory
	}
	if (selection && 'id' in selection && 'map' in selection)
		(selection[selection.map] = selection[selection.map] || []).push(selection.id);
	if (selection) {
		for (var map2 in this.selection) {
			if (map2 in selection) {
				for (var i = 0; i < selection[map2].length; i++) {
					if (this.selection[map2].indexOf(selection[map2][i]) < 0)
						this.selection[map2].push(selection[map2][i]);
				}
			}
		}
	}
	this.editor.render.setSelection(this.selection);
	this.editor.render.update();

	ui.updateClipboardButtons(); // TODO notify ui about selection
};
SelectionHelper.prototype.isSelected = function (item) {
	var render = this.editor.render;
	var ctab = render.ctab;
	if (item.map == 'frags' || item.map == 'rgroups') {
		var atoms = item.map == 'frags' ?
			ctab.frags.get(item.id).fragGetAtoms(render, item.id) :
			ctab.rgroups.get(item.id).getAtoms(render);
		return !Object.isUndefined(this.selection['atoms']) &&
			Set.subset(Set.fromList(atoms), Set.fromList(this.selection['atoms']));
	}
	return 'selection' in this && !Object.isUndefined(this.selection[item.map]) &&
	this.selection[item.map].indexOf(item.id) > -1;
};

module.exports = SelectionHelper;
