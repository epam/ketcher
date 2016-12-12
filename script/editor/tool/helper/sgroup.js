var Action = require('../../action');
var Struct = require('../../../chem/struct');
var Set = require('../../../util/set');

var ui = global.ui;

function SGroupHelper(editor, type) {
	this.editor = editor;
	this.selection = null;
	this.defaultType = type || null;
}

SGroupHelper.prototype.showPropertiesDialog = function (id, selection) {
	this.selection = selection;

	var rnd = this.editor.render;
	var sg = (id != null) && rnd.ctab.sgroups.get(id).item;
	ui.showSGroupProperties({
		type: sg ? sg.type : this.defaultType,
		attrs: sg ? sg.getAttrs() : {},
		onCancel: function () {
			this.editor.setSelection(null);
		}.bind(this),
		onOk: function (params) {
			if (id != null) {
				ui.addUndoAction(Action.fromSgroupType(id, params.type)
					.mergeWith(Action.fromSgroupAttrs(id, params.attrs)), true);
			} else if (params.type != 'DAT' &&
			           checkOverlapping(id, selection, rnd.ctab)) {
				alert('Partial S-group overlapping is not allowed.');
			} else {
				id = rnd.ctab.molecule.sgroups.newId();
				ui.addUndoAction(Action.fromSgroupAddition(params.type, this.selection.atoms,
				                                           params.attrs, id), true);
			}
			this.editor.setSelection(null);
			rnd.update();
		}.bind(this)
	});
};

function checkOverlapping(id, selection, restruct) {
	var verified = {};
	var atomsHash = {};

	selection.atoms.each(function (id) {
		atomsHash[id] = true;
	});

	return 0 <= selection.atoms.findIndex(function (id) {
		var atom = restruct.atoms.get(id);
		var sgroups = Set.list(atom.a.sgs);

		return 0 <= sgroups.findIndex(function (sid) {
			var sg = restruct.sgroups.get(sid).item;
			if (sg.type == 'DAT' || sid in verified)
				return false;

			var sgAtoms = Struct.SGroup.getAtoms(restruct.molecule, sg);

			if (sgAtoms.length < selection.atoms.length) {
				if (0 <= sgAtoms.findIndex(function (aid) {
					return !(aid in atomsHash);
				}))
					return true;
			} else if (0 <= selection.atoms.findIndex(function (aid) {
				return (sgAtoms.indexOf(aid) == -1);
			})) {
				return true;
			}

			return false;
		});
	});
}

module.exports = SGroupHelper;
