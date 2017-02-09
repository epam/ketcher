var Action = require('../../action');
var Struct = require('../../../chem/struct');
var Set = require('../../../util/set');

function SGroupHelper(editor, type) {
	this.editor = editor;
	this.defaultType = type || null;
}

SGroupHelper.prototype.showPropertiesDialog = function (id, selection) {
	var editor = this.editor;
	var struct = editor.render.ctab.molecule;
	var sg = (id != null) && struct.sgroups.get(id);
	var atoms = selection && selection.atoms;
	var type = sg ? sg.type : this.defaultType;
	var eventName = type == 'DAT' ? 'sdataEdit' : 'sgroupEdit';

	editor.selection(null);
	var res = editor.event[eventName].dispatch({
		type: type,
		attrs: sg ? sg.getAttrs() : {}
	});

	Promise.resolve(res).then(function (newSg) {
		                           // TODO: check before signal
		if (newSg.type != 'DAT' && // when data s-group separates
		    checkOverlapping(struct, atoms || [])) {
			editor.event.message.dispatch({
				error: 'Partial S-group overlapping is not allowed.'
			});
		} else {
			var action = (id != null) ?
			    Action.fromSgroupType(id, newSg.type)
			          .mergeWith(Action.fromSgroupAttrs(id, newSg.attrs)) :
		        Action.fromSgroupAddition(newSg.type, atoms, newSg.attrs,
		                                  struct.sgroups.newId());
			editor.event.change.dispatch(action);
		}
	});
};

function checkOverlapping(struct, atoms) {
	var verified = {};
	var atomsHash = {};

	atoms.each(function (id) {
		atomsHash[id] = true;
	});

	return 0 <= atoms.findIndex(function (id) {
		var atom = struct.atoms.get(id);
		var sgroups = Set.list(atom.sgs);

		return 0 <= sgroups.findIndex(function (sid) {
			var sg = struct.sgroups.get(sid);
			if (sg.type == 'DAT' || sid in verified)
				return false;

			var sgAtoms = Struct.SGroup.getAtoms(struct, sg);

			if (sgAtoms.length < atoms.length) {
				if (0 <= sgAtoms.findIndex(function (aid) {
					return !(aid in atomsHash);
				}))
					return true;
			} else if (0 <= atoms.findIndex(function (aid) {
				return (sgAtoms.indexOf(aid) == -1);
			})) {
				return true;
			}

			return false;
		});
	});
}

module.exports = SGroupHelper;
