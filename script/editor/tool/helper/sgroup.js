var Action = require('../../action');

var ui = global.ui;

var SGroupHelper = function (editor, type) {
	this.editor = editor;
	this.selection = null;
	this.defaultType = type || null;
};

SGroupHelper.prototype.showPropertiesDialog = function (id, selection) {
	this.selection = selection;

	var rnd = this.editor.render;
	// check s-group overlappings
	if (id == null)
	{
		var verified = {};
		var atoms_hash = {};

		selection.atoms.each(function (id)
		{
			atoms_hash[id] = true;
		}, this);

		if (!Object.isUndefined(selection.atoms.detect(function (id)
		{
			var sgroups = rnd.atomGetSGroups(id);

			return !Object.isUndefined(sgroups.detect(function (sid)
			{
				if (sid in verified)
					return false;

				var sg_atoms = rnd.sGroupGetAtoms(sid);

				if (sg_atoms.length < selection.atoms.length)
				{
					if (!Object.isUndefined(sg_atoms.detect(function (aid)
					{
						return !(aid in atoms_hash);
					}, this)))
					{
						return true;
					}
				} else if (!Object.isUndefined(selection.atoms.detect(function (aid)
				{
					return (sg_atoms.indexOf(aid) == -1);
				}, this)))
				{
					return true;
				}

				return false;
			}, this));
		}, this)))
		{
			alert('Partial S-group overlapping is not allowed.');
			return;
		}
	}

	ui.showSGroupProperties({
		type: id !== null ? rnd.sGroupGetType(id) : this.defaultType,
		attrs: id !== null ? rnd.sGroupGetAttrs(id) : {},
		onCancel: function () {
			this.editor.deselectAll();
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
			this.editor.deselectAll();
			rnd.update();

		}.bind(this)
	});
};

module.exports = SGroupHelper;
