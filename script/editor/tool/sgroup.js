var HoverHelper = require('./helper/hover');
var LassoHelper = require('./helper/lasso');

var Action = require('../action');
var Struct = require('../../chem/struct');
var Set = require('../../util/set');

var searchMaps = ['atoms', 'bonds', 'sgroups', 'sgroupData'];

function SGroupTool(editor, type) {
	if (!(this instanceof SGroupTool)) {
		var selection = editor.selection() || {};
		if (!selection.atoms && !selection.bonds)
			return new SGroupTool(editor, type);

		var sgroups = editor.render.ctab.molecule.sgroups;

		var selectedAtoms = JSON.stringify(editor.selection().atoms);

		var id = sgroups.find(function (index, sgroup) {
			return JSON.stringify(sgroup.atoms) === selectedAtoms;
		}, this);

		propsDialog(editor, id !== undefined ? id : null, type);
		editor.selection(null);
		return null;
	}

	this.editor = editor;
	this.type = type;

	this.hoverHelper = new HoverHelper(this);
	this.lassoHelper = new LassoHelper(1, editor);
	this.editor.selection(null);
}

SGroupTool.prototype.mousedown = function (event) {
	var ci = this.editor.findItem(event, searchMaps);
	if (!ci) //  ci.type == 'Canvas'
		this.lassoHelper.begin(event);
};

SGroupTool.prototype.mousemove = function (event) {
	if (this.lassoHelper.running())
		this.editor.selection(this.lassoHelper.addPoint(event));
	else
		this.hoverHelper.hover(this.editor.findItem(event, searchMaps));
};

SGroupTool.prototype.mouseup = function (event) {
	var id = null; // id of an existing group, if we're editing one
	var selection = null; // atoms to include in a newly created group
	if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		selection = this.lassoHelper.end(event);
	} else {
		var ci = this.editor.findItem(event, searchMaps);
		if (!ci) // ci.type == 'Canvas'
			return;
		this.hoverHelper.hover(null);

		if (ci.map == 'atoms') {
			// if we click the SGroup tool on a single atom or bond, make a group out of those
			selection = { atoms: [ci.id] };
		} else if (ci.map == 'bonds') {
			var bond = this.editor.render.ctab.bonds.get(ci.id);
			selection = { atoms: [bond.b.begin, bond.b.end] };
		} else if (ci.map == 'sgroups') {
			id = ci.id;
		} else {
			return;
		}
	}

	// TODO: handle click on an existing group?
	if (id != null || (selection && selection.atoms))
		propsDialog(this.editor, id, this.type);
};

function propsDialog(editor, id, defaultType) {
	var restruct = editor.render.ctab;
	var struct = restruct.molecule;
	var selection = editor.selection() || {};
	var sg = (id != null) && struct.sgroups.get(id);
	var type = sg ? sg.type : defaultType;
	var eventName = type == 'DAT' ? 'sdataEdit' : 'sgroupEdit';

	if (!selection.atoms && !selection.bonds && !sg) {
		console.info('There is no selection or sgroup');
		return;
	}

	var res = editor.event[eventName].dispatch({
		type: type,
		attrs: sg ? sg.getAttrs() : {
			context: defineContext(restruct, selection)
		}
	});

	Promise.resolve(res).then(function (newSg) {
		// TODO: check before signal
		if (newSg.type != 'DAT' && // when data s-group separates
			checkOverlapping(struct, selection.atoms || [])) {
			editor.event.message.dispatch({
				error: 'Partial S-group overlapping is not allowed.'
			});
		} else {
			var action = (id !== null) && sg.getAttrs().context === newSg.attrs.context ?
				Action.fromSgroupType(restruct, id, newSg.type)
					.mergeWith(Action.fromSgroupAttrs(restruct, id, newSg.attrs)) :
				chooseAction(id, editor, newSg, selection);

			editor.update(action);
		}
	}).catch(function (result) {
		console.info('rejected', result);
	});
}

function defineContext(restruct, selection) {
	if (selection.atoms && !selection.bonds)
		return 'Atom';

	if (selection.bonds && !selection.atoms) {
		var allSingle = selection.bonds.every(function (bondid) {
			var bond = restruct.bonds.get(bondid).b;
			return (bond.type !== 1 && bond.stereo === 0);
		});

		if (allSingle)
			return 'Single Bonds';
	}

	var componentAtoms = restruct.connectedComponents.keys()
		.reduce(function (acc, componentId) {
			var component = restruct.connectedComponents.get(componentId);
			var intersects = selection.atoms.find(function (atomid) { return component.hasOwnProperty(atomid); });
			return intersects ? acc.concat(Object.values(component)) : acc;
		}, []);

	var componentBonds = getAtomsBondIds(restruct, componentAtoms);

	return componentAtoms.length === selection.atoms.length && componentBonds.length === selection.bonds.length ? 'Fragment' : 'Group';
}

function chooseAction(id, editor, newSg, currSelection) {
	var restruct = editor.render.ctab;
	var struct = editor.render.ctab.molecule;
	var sg = (id != null) && struct.sgroups.get(id);

	var sourceAtoms = sg && sg.atoms || currSelection.atoms || [];

	console.info('rest', restruct);

	var context = newSg.attrs.context;
	var action;
	switch (context) {
	case 'Fragment':
		action = onGroupAction(restruct.atoms.keys());
		break;
	case 'Group':
		action = onGroupAction(sourceAtoms);
		break;
	case 'Single Bond':
		action = onSingleBondAction();
		break;
	case 'Atom':
		action = onAtomAction();
		break;
	default:
		console.error('Invalid context');
		return new Action();
	}

	return (id === null || !action) ? action : action.mergeWith(Action.fromSgroupDeletion(restruct, id));

	function onAtomAction() {
		editor.selection({ atoms: sourceAtoms });

		return sourceAtoms.reduce(function (acc, atom) {
			return acc.mergeWith(sgroupAddAction([atom]));
		}, new Action());
	}

	function onGroupAction(targetAtoms) {
		var fragIds = sourceAtoms
			.map(function (aid) { return restruct.atoms.get(aid).a.fragment; })
			.filter(function (fragId, index, self) { return self.indexOf(fragId) === index; });

		var result = fragIds.reduce(function (acc, fragId) {
			var atoms = targetAtoms
				.filter(function (aid) {
					var atom = restruct.atoms.get(aid).a;
					return fragId === atom.fragment;
				})
				.map(Number);

			var bonds = getAtomsBondIds(restruct, atoms);

			acc.action.mergeWith(sgroupAddAction(atoms));
			acc.selection.atoms = acc.selection.atoms.concat(atoms);
			acc.selection.bonds = acc.selection.bonds.concat(bonds);

			return acc;
		}, {
			action: new Action(),
			selection: {
				atoms: [],
				bonds: []
			}
		});

		editor.selection(result.selection);
		return result.action;
	}

	function onSingleBondAction() {
		if (sourceAtoms.length === 1 && !currSelection.bonds) {
			console.error('Cannot transform single atom to single bond');
			return;
		}

		if (currSelection.bonds) {
			var selectedBondAtoms = currSelection.bonds.reduce(function (acc, bondid) {
				var bond = restruct.bonds.get(bondid).b;

				if (bond.type !== 1 && bond.stereo === 0)
					return acc;

				acc = acc.concat([bond.begin, bond.end]);
				return acc;
			}, []);

			sourceAtoms = sourceAtoms.concat(selectedBondAtoms);
		}

		var bonds = getAtomsBondIds(restruct, sourceAtoms)
			.filter(function (bondid) {
				var bond = restruct.bonds.get(bondid).b;
				return bond.type === 1 && bond.stereo === 0;
			});

		editor.selection({ atoms: sourceAtoms, bonds: bonds });

		return bonds.reduce(function (acc, bondid) {
			var bond = restruct.bonds.get(bondid).b;
			return acc.mergeWith(sgroupAddAction([bond.begin, bond.end]));
		}, new Action());
	}

	function sgroupAddAction(atoms) {
		return Action.fromSgroupAddition(restruct, newSg.type, atoms, newSg.attrs, struct.sgroups.newId());
	}
}

function getAtomsBondIds(restruct, atoms) {
	return restruct.bonds.keys()
		.filter(function (bondid) {
			var bond = restruct.bonds.get(bondid).b;
			return atoms.includes(bond.begin) && atoms.includes(bond.end);
		})
		.map(Number);
}

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

module.exports = Object.assign(SGroupTool, {
	dialog: propsDialog
});
