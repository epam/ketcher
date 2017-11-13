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

const isEqual = require('lodash/fp/isEqual');
const uniq = require('lodash/fp/uniq');
const LassoHelper = require('./helper/lasso');
const Actions = require('../actions');
const Struct = require('../../chem/struct');
const Set = require('../../util/set');
const Contexts = require('../../util/constants').SgContexts;

const searchMaps = ['atoms', 'bonds', 'sgroups', 'sgroupData'];

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
	const restruct = editor.render.ctab;
	const struct = restruct.molecule;
	const selection = editor.selection() || {};
	const sg = id !== null ? struct.sgroups.get(id) : null;
	const type = sg ? sg.type : defaultType;
	const eventName = type === 'DAT' ? 'sdataEdit' : 'sgroupEdit';

	if (!selection.atoms && !selection.bonds && !sg) {
		console.info('There is no selection or sgroup');
		return;
	}

	let attrs = null;
	if (sg) {
		attrs = sg.getAttrs();
		attrs.context = getContextBySgroup(restruct, sg.atoms);
	} else {
		attrs = {
			context: getContextBySelection(restruct, selection)
		};
	}

	const res = editor.event[eventName].dispatch({
		type: type,
		attrs: attrs
	});

	Promise.resolve(res).then(newSg => {
		// TODO: check before signal
		if (newSg.type !== 'DAT' && // when data s-group separates
			checkOverlapping(struct, selection.atoms || [])) {
			editor.event.message.dispatch({
				error: 'Partial S-group overlapping is not allowed.'
			});
		} else {
			if (!sg && newSg.type !== 'DAT' && (!selection.atoms || selection.atoms.length === 0))
				return;

			const isDataSg = sg && sg.getAttrs().context === newSg.attrs.context;

			if (isDataSg) {
				const action = Actions.fromSeveralSgroupAddition(restruct, newSg.type, sg.atoms, newSg.attrs)
					.mergeWith(Actions.fromSgroupDeletion(restruct, id));

				editor.update(action);
				editor.selection(selection);
				return;
			}

			const result = fromContextType(id, editor, newSg, selection);
			editor.update(result.action);
			editor.selection(result.selection);
		}
	}).catch(result => {
		console.info('rejected', result);
	});
}

function getContextBySgroup(restruct, sgAtoms) {
	const struct = restruct.molecule;

	if (sgAtoms.length === 1)
		return Contexts.Atom;

	if (manyComponentsSelected(restruct, sgAtoms))
		return Contexts.Multifragment;

	if (singleComponentSelected(restruct, sgAtoms))
		return Contexts.Fragment;

	const atomMap = sgAtoms.reduce((acc, aid) => {
		acc[aid] = true;
		return acc;
	}, {});

	const sgBonds = struct.bonds
		.values()
		.filter(bond => atomMap[bond.begin] && atomMap[bond.end]);

	return anyChainedBonds(sgBonds) ? Contexts.Group : Contexts.Bond;
}

function getContextBySelection(restruct, selection) {
	const struct = restruct.molecule;

	if (selection.atoms && !selection.bonds)
		return Contexts.Atom;

	const bonds = selection.bonds.map(bondid => struct.bonds.get(bondid));

	if (!anyChainedBonds(bonds))
		return Contexts.Bond;

	selection.atoms = selection.atoms || [];

	const atomSelectMap = atomMap(selection.atoms);

	const allBondsSelected = bonds.every(bond =>
		atomSelectMap[bond.begin] !== undefined && atomSelectMap[bond.end] !== undefined
	);

	if (singleComponentSelected(restruct, selection.atoms) && allBondsSelected)
		return Contexts.Fragment;

	return manyComponentsSelected(restruct, selection.atoms) ? Contexts.Multifragment : Contexts.Group;
}

function fromContextType(id, editor, newSg, currSelection) {
	const restruct = editor.render.ctab;
	const sg = restruct.molecule.sgroups.get(id);
	const sourceAtoms = (sg && sg.atoms) || currSelection.atoms || [];
	const context = newSg.attrs.context;

	const result = getActionForContext(context, restruct, newSg, sourceAtoms, currSelection);

	result.selection = result.selection || currSelection;

	if (id !== null && id !== undefined)
		result.action = result.action.mergeWith(Actions.fromSgroupDeletion(restruct, id));

	editor.selection(result.selection);

	return result;
}

function getActionForContext(context, restruct, newSg, sourceAtoms, selection) {
	if (context === Contexts.Bond)
		return Actions.fromBondAction(restruct, newSg, sourceAtoms, selection);

	const atomsFromBonds = getAtomsFromBonds(restruct.molecule, selection.bonds);
	const newSourceAtoms = uniq(sourceAtoms.concat(atomsFromBonds));

	if (context === Contexts.Fragment)
		return Actions.fromGroupAction(restruct, newSg, newSourceAtoms, restruct.atoms.keys());

	if (context === Contexts.Multifragment)
		return Actions.fromMultiFragmentAction(restruct, newSg, newSourceAtoms);

	if (context === Contexts.Group)
		return Actions.fromGroupAction(restruct, newSg, newSourceAtoms, newSourceAtoms);

	if (context === Contexts.Atom)
		return Actions.fromAtomAction(restruct, newSg, newSourceAtoms);

	return {
		action: Actions.fromSeveralSgroupAddition(restruct, newSg.type, sourceAtoms, newSg.attrs)
	};
}

// tools
function atomMap(atoms) {
	atoms = atoms || [];

	return atoms.reduce((acc, atomid) => {
		acc[atomid] = atomid;
		return acc;
	}, {});
}

function anyChainedBonds(bonds) {
	if (bonds.length === 0)
		return true;

	for (let i = 0; i < bonds.length; ++i) {
		const fixedBond = bonds[i];
		for (let j = 0; j < bonds.length; ++j) {
			if (i === j)
				continue;

			const bond = bonds[j];

			if (fixedBond.end === bond.begin || fixedBond.end === bond.end)
				return true;
		}
	}

	return false;
}

function singleComponentSelected(restruct, atoms) {
	return countOfSelectedComponents(restruct, atoms) === 1;
}

function manyComponentsSelected(restruct, atoms) {
	return countOfSelectedComponents(restruct, atoms) > 1;
}

function countOfSelectedComponents(restruct, atoms) {
	const atomSelectMap = atomMap(atoms);

	return restruct.connectedComponents.values()
		.reduce((acc, component) => {
			const componentAtoms = Object.keys(component);

			const count = componentAtoms
				.reduce((acc, atom) => acc + (atomSelectMap[atom] === undefined), 0);

			return acc + (count === 0 ? 1 : 0);
		}, 0);
}

function getAtomsFromBonds(struct, bonds) {
	bonds = bonds || [];
	return bonds.reduce((acc, bondid) => {
		const bond = struct.bonds.get(bondid);
		acc = acc.concat([bond.begin, bond.end]);
		return acc;
	}, []);
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

module.exports = Object.assign(SGroupTool, {
	dialog: propsDialog
});
