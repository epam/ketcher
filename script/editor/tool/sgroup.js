/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

var isEqual = require('lodash/fp/isEqual');

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
		var selectedAtoms = editor.selection().atoms;

		var id = sgroups.find(function (_, sgroup) {
			return isEqual(sgroup.atoms, selectedAtoms);
		});

		propsDialog(editor, id !== undefined ? id : null, type);
		editor.selection(null);
		return null;
	}

	this.editor = editor;
	this.type = type;

	this.lassoHelper = new LassoHelper(1, editor);
	this.editor.selection(null);
}

SGroupTool.prototype.mousedown = function (event) {
	var ci = this.editor.findItem(event, searchMaps);
	if (!ci) //  ci.type == 'Canvas'
		this.lassoHelper.begin(event);
};

SGroupTool.prototype.mousemove = function (event) {
	if (this.lassoHelper.running(event))
		this.editor.selection(this.lassoHelper.addPoint(event));
	else
		this.editor.hover(this.editor.findItem(event, searchMaps));
};

SGroupTool.prototype.mouseleave = function (event) {
	if (this.lassoHelper.running(event))
		this.lassoHelper.end(event);
};

SGroupTool.prototype.mouseup = function (event) {
	var id = null; // id of an existing group, if we're editing one
	var selection = null; // atoms to include in a newly created group
	if (this.lassoHelper.running(event)) { // TODO it catches more events than needed, to be re-factored
		selection = this.lassoHelper.end(event);
	} else {
		var ci = this.editor.findItem(event, searchMaps);
		if (!ci) // ci.type == 'Canvas'
			return;
		this.editor.hover(null);

		if (ci.map === 'atoms') {
			// if we click the SGroup tool on a single atom or bond, make a group out of those
			selection = { atoms: [ci.id] };
		} else if (ci.map === 'bonds') {
			var bond = this.editor.render.ctab.bonds.get(ci.id);
			selection = { atoms: [bond.b.begin, bond.b.end] };
		} else if (ci.map === 'sgroups' || ci.map === 'sgroupData') {
			id = ci.id;
		} else {
			return;
		}
	}

	// TODO: handle click on an existing group?
	if (id !== null || (selection && selection.atoms))
		propsDialog(this.editor, id, this.type);
};

function propsDialog(editor, id, defaultType) {
	var restruct = editor.render.ctab;
	var struct = restruct.molecule;
	var selection = editor.selection() || {};
	var sg = id !== null ? struct.sgroups.get(id) : null;
	var type = sg ? sg.type : defaultType;
	var eventName = type === 'DAT' ? 'sdataEdit' : 'sgroupEdit';

	if (!selection.atoms && !selection.bonds && !sg) {
		console.info('There is no selection or sgroup');
		return;
	}

	var attrs = null;
	if (sg) {
		attrs = sg.getAttrs();
		attrs.context = getContextBySgroup(restruct, sg.atoms);
	} else {
		attrs = {
			context: getContextBySelection(restruct, selection)
		};
	}

	var res = editor.event[eventName].dispatch({
		type: type,
		attrs: attrs
	});

	Promise.resolve(res).then(function (newSg) {
		// TODO: check before signal
		if (newSg.type !== 'DAT' && // when data s-group separates
			checkOverlapping(struct, selection.atoms || [])) {
			editor.event.message.dispatch({
				error: 'Partial S-group overlapping is not allowed.'
			});
		} else {
			if (!sg && (!selection.atoms || selection.atoms.length === 0))
				return;

			var isDataSg = sg && sg.getAttrs().context === newSg.attrs.context;

			if (isDataSg) {
				var action = Action.fromSeveralSgroupAddition(restruct, newSg.type, sg.atoms, newSg.attrs)
					.mergeWith(Action.fromSgroupDeletion(restruct, id));

				editor.update(action);
				editor.selection(selection);
				return;
			}

			var result = fromContextType(id, editor, newSg, selection);
			editor.update(result.action);
			editor.selection(result.selection);
		}
	}).catch(function (result) {
		console.info('rejected', result);
	});
}

function getContextBySgroup(restruct, sgAtoms) {
	var struct = restruct.molecule;

	if (sgAtoms.length === 1)
		return 'Atom';

	if (allComponentsSelected(restruct, sgAtoms))
		return 'Fragment';

	var atomMap = sgAtoms.reduce(function (acc, aid) {
		acc[aid] = true;
		return acc;
	}, {});

	var sgBonds = struct.bonds
		.values()
		.filter(function (bond) { return atomMap[bond.begin] && atomMap[bond.end]; });

	return anyContinuousBonds(sgBonds) ? 'Group' : 'Bond';
}

function getContextBySelection(restruct, selection) {
	var struct = restruct.molecule;

	if (selection.atoms && !selection.bonds)
		return 'Atom';

	var bonds = selection.bonds.map(function (bondid) {
		return struct.bonds.get(bondid);
	});

	if (!anyContinuousBonds(bonds))
		return 'Bond';

	selection.atoms = selection.atoms || [];

	var atomSelectMap = atomMap(selection.atoms);

	var allBondsSelected = selection.bonds.every(function (bondid) {
		var bond = struct.bonds.get(bondid);
		return atomSelectMap[bond.begin] !== undefined && atomSelectMap[bond.end] !== undefined;
	});

	return allComponentsSelected(restruct, selection.atoms) && allBondsSelected ? 'Fragment' : 'Group';
}

function fromContextType(id, editor, newSg, currSelection) {
	var restruct = editor.render.ctab;
	var sg = restruct.molecule.sgroups.get(id);
	var sourceAtoms = (sg && sg.atoms) || currSelection.atoms || [];
	var context = newSg.attrs.context;

	var result = getActionForContext(context, restruct, newSg, sourceAtoms, currSelection);

	result.selection = result.selection || currSelection;

	if (id !== null && id !== undefined)
		result.action = result.action.mergeWith(Action.fromSgroupDeletion(restruct, id));

	editor.selection(result.selection);

	return result;
}

function getActionForContext(context, restruct, newSg, sourceAtoms, selection) {
	if (context === 'Bond')
		return Action.fromBondAction(restruct, newSg, sourceAtoms, selection);

	var atomsFromBonds = getAtomsFromBonds(restruct.molecule, selection.bonds);
	var newSourceAtoms = unique(sourceAtoms.concat(atomsFromBonds));

	if (context === 'Fragment')
		return Action.fromGroupAction(restruct, newSg, newSourceAtoms, restruct.atoms.keys());

	if (context === 'Group')
		return Action.fromGroupAction(restruct, newSg, newSourceAtoms, newSourceAtoms);

	if (context === 'Atom')
		return Action.fromAtomAction(restruct, newSg, newSourceAtoms);

	return {
		action: Action.fromSeveralSgroupAddition(restruct, newSg.type, sourceAtoms, newSg.attrs)
	};
}

function checkOverlapping(struct, atoms) {
	var verified = {};
	var atomsHash = {};

	atoms.forEach(function (id) {
		atomsHash[id] = true;
	});

	return 0 <= atoms.findIndex(function (id) {
		var atom = struct.atoms.get(id);
		var sgroups = Set.list(atom.sgs);

		return 0 <= sgroups.findIndex(function (sid) {
			var sg = struct.sgroups.get(sid);
			if (sg.type === 'DAT' || sid in verified)
				return false;

			var sgAtoms = Struct.SGroup.getAtoms(struct, sg);

			if (sgAtoms.length < atoms.length) {
				var ind = sgAtoms.findIndex(function (aid) {
					return !(aid in atomsHash);
				});
				if (0 <= ind) return true;
			}

			return 0 <= atoms.findIndex(function (aid) {
				return (sgAtoms.indexOf(aid) === -1);
			});
		});
	});
}

// tools
function atomMap(atoms) {
	atoms = atoms || [];
	return atoms.reduce(function (acc, atomid) {
		acc[atomid] = atomid;
		return acc;
	}, {});
}

function anyContinuousBonds(bonds) {
	if (bonds.length === 0)
		return true;

	var i, j;
	for (i = 0; i < bonds.length; ++i) {
		var fixedBond = bonds[i];
		for (j = 0; j < bonds.length; ++j) {
			if (i === j)
				continue;

			var bond = bonds[j];

			if (fixedBond.end === bond.begin || fixedBond.end === bond.end)
				return true;
		}
	}

	return false;
}

function allComponentsSelected(restruct, atoms) {
	var atomSelectMap = atomMap(atoms);

	return restruct.connectedComponents.values()
		.every(function (component) {
			var componentAtoms = Object.keys(component);
			var count = componentAtoms
				.reduce(function (acc, atom) {
					return acc + (atomSelectMap[atom] === undefined);
				}, 0);

			return count === 0 || count === componentAtoms.length;
		});
}

function unique(source) {
	return Object.keys(
		source.reduce(function (acc, item) {
			acc[item] = item;
			return acc;
		}, {})
	).map(function (item) { return parseInt(item); });
}

function getAtomsFromBonds(struct, bonds) {
	bonds = bonds || [];
	return bonds.reduce(function (acc, bondid) {
		var bond = struct.bonds.get(bondid);
		acc = acc.concat([bond.begin, bond.end]);
		return acc;
	}, []);
}

module.exports = Object.assign(SGroupTool, {
	dialog: propsDialog
});
