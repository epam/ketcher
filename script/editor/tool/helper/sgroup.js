var Action = require('../../action');

var ui = global.ui;

function SGroupHelper(editor, type) {
	this.editor = editor;
	this.selection = null;
	this.defaultType = type || null;
}

SGroupHelper.prototype.showPropertiesDialog = function (id, selection) {
	this.selection = selection;

	var rnd = this.editor.render;
	// check s-group overlappings
	if (id == null) {
		var verified = {};
		var atomsHash = {};

		selection.atoms.each(function (id) {
			atomsHash[id] = true;
		}, this);

		if (!Object.isUndefined(selection.atoms.detect(function (id) {
			var sgroups = rnd.atomGetSGroups(id);

			return !Object.isUndefined(sgroups.detect(function (sid) {
				if (sid in verified)
					return false;

				var sgAtoms = rnd.sGroupGetAtoms(sid);

				if (sgAtoms.length < selection.atoms.length) {
					if (!Object.isUndefined(sgAtoms.detect(function (aid) {
						return !(aid in atomsHash);
					}, this)))
						return true;
				} else if (!Object.isUndefined(selection.atoms.detect(function (aid) {
					return (sgAtoms.indexOf(aid) == -1);
				}, this))) {
					return true;
				}

				return false;
			}, this));
		}, this))) {
			alert('Partial S-group overlapping is not allowed.');
			return;
		}
	}

	ui.showSGroupProperties({
		type: id !== null ? rnd.sGroupGetType(id) : this.defaultType,
		attrs: id !== null ? rnd.sGroupGetAttrs(id) : {},
		onCancel: function () {
			this.editor.setSelection(null);
		}.bind(this),
		onOk: function (params) {
			if (id == null) {
				id = rnd.ctab.molecule.sgroups.newId();
				ui.addUndoAction(Action.fromSgroupAddition(params.type, this.selection.atoms,
														   params.attrs, id), true);
			} else {
				ui.addUndoAction(Action.fromSgroupType(id, params.type)
					.mergeWith(Action.fromSgroupAttrs(id, params.attrs)), true);
			}
			this.editor.setSelection(null);
			rnd.update();
		}.bind(this)
	});
};

module.exports = SGroupHelper;
