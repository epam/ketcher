/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import isEqual from 'lodash/fp/isEqual';

import { SgContexts } from '../shared/constants';

import Pile from '../../util/pile';
import { SGroup } from '../../chem/struct';
import LassoHelper from './helper/lasso';
import { fromSgroupDeletion, fromSeveralSgroupAddition, fromSgroupAction } from '../actions/sgroup';

const searchMaps = ['atoms', 'bonds', 'sgroups', 'sgroupData'];

function SGroupTool(editor, type) {
	if (!(this instanceof SGroupTool)) {
		var selection = editor.selection() || {};
		if (!selection.atoms && !selection.bonds)
			return new SGroupTool(editor, type);

		var sgroups = editor.render.ctab.molecule.sgroups;
		var selectedAtoms = editor.selection().atoms;

		var id = sgroups.find((_, sgroup) => isEqual(sgroup.atoms, selectedAtoms));

		sgroupDialog(editor, id !== undefined ? id : null, type);
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
	if (this.lassoHelper.running(event)) {
		// TODO it catches more events than needed, to be re-factored
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
		sgroupDialog(this.editor, id, this.type);
};

SGroupTool.prototype.cancel = function () {
	if (this.lassoHelper.running()) this.lassoHelper.end();
	this.editor.selection(null);
};

export function sgroupDialog(editor, id, defaultType) {
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
		type,
		attrs
	});

	Promise.resolve(res).then((newSg) => {
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
				const action = fromSeveralSgroupAddition(restruct, newSg.type, sg.atoms, newSg.attrs)
					.mergeWith(fromSgroupDeletion(restruct, id));

				editor.update(action);
				editor.selection(selection);
				return;
			}

			const result = fromContextType(id, editor, newSg, selection);
			editor.update(result.action);
			editor.selection(result.selection);
		}
	}).catch(() => null); // w/o changes
}

function getContextBySgroup(restruct, sgAtoms) {
	const struct = restruct.molecule;

	if (sgAtoms.length === 1)
		return SgContexts.Atom;

	if (manyComponentsSelected(restruct, sgAtoms))
		return SgContexts.Multifragment;

	if (singleComponentSelected(restruct, sgAtoms))
		return SgContexts.Fragment;

	const atomSet = new Pile(sgAtoms);

	const sgBonds = Array.from(struct.bonds.values())
		.filter(bond => atomSet.has(bond.begin) && atomSet.has(bond.end));

	return anyChainedBonds(sgBonds) ? SgContexts.Group : SgContexts.Bond;
}

function getContextBySelection(restruct, selection) {
	const struct = restruct.molecule;

	if (selection.atoms && !selection.bonds)
		return SgContexts.Atom;

	const bonds = selection.bonds.map(bondid => struct.bonds.get(bondid));

	if (!anyChainedBonds(bonds))
		return SgContexts.Bond;

	selection.atoms = selection.atoms || [];

	const atomSet = new Pile(selection.atoms);
	const allBondsSelected = bonds.every(bond => atomSet.has(bond.begin) && atomSet.has(bond.end));

	if (singleComponentSelected(restruct, selection.atoms) && allBondsSelected)
		return SgContexts.Fragment;

	return manyComponentsSelected(restruct, selection.atoms) ?
		SgContexts.Multifragment :
		SgContexts.Group;
}

function fromContextType(id, editor, newSg, currSelection) {
	const restruct = editor.render.ctab;
	const sg = restruct.molecule.sgroups.get(id);
	const sourceAtoms = (sg && sg.atoms) || currSelection.atoms || [];
	const context = newSg.attrs.context;

	const result = fromSgroupAction(context, restruct, newSg, sourceAtoms, currSelection);

	result.selection = result.selection || currSelection;

	if (id !== null && id !== undefined)
		result.action = result.action.mergeWith(fromSgroupDeletion(restruct, id));

	editor.selection(result.selection);

	return result;
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
	const atomSet = new Pile(atoms);

	return Array.from(restruct.connectedComponents.values())
		.reduce((acc, component) => acc + (atomSet.isSuperset(component) ? 1 : 0), 0);
}

function checkOverlapping(struct, atoms) {
	const sgroups = atoms.reduce((res, aid) => {
		const atom = struct.atoms.get(aid);
		return res.union(atom.sgs);
	}, new Pile());

	return Array.from(sgroups).some((sid) => {
		const sg = struct.sgroups.get(sid);
		if (sg.type === 'DAT') return false;
		const sgAtoms = SGroup.getAtoms(struct, sg);

		return (sgAtoms.length < atoms.length) ?
			sgAtoms.findIndex(aid => (atoms.indexOf(aid) === -1)) >= 0 :
			atoms.findIndex(aid => (sgAtoms.indexOf(aid) === -1)) >= 0;
	});
}

export default SGroupTool;
