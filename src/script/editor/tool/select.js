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

import { xor } from 'lodash/fp';
import { SGroup } from '../../chem/struct';
import LassoHelper from './helper/lasso';
import { sgroupDialog } from './sgroup';
import { atomLongtapEvent } from './atom';
import { fromMultipleMove } from '../actions/fragment';
import { fromAtomsAttrs } from '../actions/atom';
import { fromBondsAttrs } from '../actions/bond';
import { fromItemsFuse, getItemsToFuse, getHoverToFuse } from '../actions/closely-fusing';
import utils from '../shared/utils';

function SelectTool(editor, mode) {
	if (!(this instanceof SelectTool))
		return new SelectTool(editor, mode);

	this.editor = editor;
	this.lassoHelper = new LassoHelper(mode === 'lasso' ? 0 : 1, editor, mode === 'fragment');
}

SelectTool.prototype.mousedown = function (event) { // eslint-disable-line max-statements
	const rnd = this.editor.render;
	const ctab = rnd.ctab;
	const struct = ctab.molecule;

	this.editor.hover(null); // TODO review hovering for touch devicess

	const selectFragment = (this.lassoHelper.fragment || event.ctrlKey);
	const ci = this.editor.findItem(
		event,
		selectFragment ?
			['frags', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags'] :
			['atoms', 'bonds', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags']
	);

	this.dragCtx = {
		item: ci,
		xy0: rnd.page2obj(event)
	};

	if (!ci || ci.map === 'atoms')
		atomLongtapEvent(this, rnd);

	if (!ci) { //  ci.type == 'Canvas'
		delete this.dragCtx.item;
		if (!this.lassoHelper.fragment)
			this.lassoHelper.begin(event);
		return true;
	}

	let sel = closestToSel(ci);
	const selection = this.editor.selection();
	if (ci.map === 'frags') {
		const frag = ctab.frags.get(ci.id);
		sel = {
			atoms: frag.fragGetAtoms(ctab, ci.id),
			bonds: frag.fragGetBonds(ctab, ci.id)
		};
	} else if (ci.map === 'sgroups') {
		const sgroup = ctab.sgroups.get(ci.id).item;
		sel = {
			atoms: SGroup.getAtoms(struct, sgroup),
			bonds: SGroup.getBonds(struct, sgroup)
		};
	} else if (ci.map === 'rgroups') {
		const rgroup = ctab.rgroups.get(ci.id);
		sel = {
			atoms: rgroup.getAtoms(rnd),
			bonds: rgroup.getBonds(rnd)
		};
	} else if (ci.map === 'sgroupData') {
		if (isSelected(selection, ci)) return true;
	}

	if (!event.shiftKey)
		this.editor.selection(isSelected(selection, ci) ? selection : sel);
	else
		this.editor.selection(selMerge(sel, selection, true));
	return true;
};

SelectTool.prototype.mousemove = function (event) {
	const editor = this.editor;
	const rnd = editor.render;
	const restruct = editor.render.ctab;
	const dragCtx = this.dragCtx;
	if (dragCtx && dragCtx.stopTapping)
		dragCtx.stopTapping();
	if (dragCtx && dragCtx.item) {
		const atoms = restruct.molecule.atoms;
		const selection = editor.selection();
		const shouldDisplayDegree = dragCtx.item.map === 'atoms' &&
			atoms.get(dragCtx.item.id).neighbors.length === 1 &&
			selection.atoms.length === 1 &&
			!selection.bonds;
		if (shouldDisplayDegree) {
			// moving selected objects
			const pos = rnd.page2obj(event);
			const angle = utils.calcAngle(dragCtx.xy0, pos);
			const degrees = utils.degrees(angle);
			this.editor.event.message.dispatch({ info: degrees + 'º' });
		}
		if (dragCtx.action) {
			dragCtx.action.perform(restruct);
			// redraw the elements in unshifted position, lest the have different offset
			editor.update(dragCtx.action, true);
		}

		const expSel = editor.explicitSelected();
		dragCtx.action = fromMultipleMove(
			restruct,
			expSel,
			editor.render.page2obj(event).sub(dragCtx.xy0)
		);

		dragCtx.mergeItems = getItemsToFuse(editor, expSel);
		editor.hover(getHoverToFuse(dragCtx.mergeItems));

		editor.update(dragCtx.action, true);
		return true;
	}

	if (this.lassoHelper.running()) {
		const sel = this.lassoHelper.addPoint(event);
		editor.selection(!event.shiftKey ? sel : selMerge(sel, editor.selection(), false));
		return true;
	}

	const maps = (this.lassoHelper.fragment || event.ctrlKey) ?
		['frags', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags'] :
		['atoms', 'bonds', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags'];

	editor.hover(editor.findItem(event, maps));

	return true;
};

SelectTool.prototype.mouseup = function (event) { // eslint-disable-line max-statements
	const editor = this.editor;
	const restruct = editor.render.ctab;
	const dragCtx = this.dragCtx;

	if (dragCtx && dragCtx.stopTapping)
		dragCtx.stopTapping();

	if (dragCtx && dragCtx.item) {
		dragCtx.action = dragCtx.action ?
			fromItemsFuse(restruct, dragCtx.mergeItems).mergeWith(dragCtx.action) :
			fromItemsFuse(restruct, dragCtx.mergeItems);

		editor.hover(null);
		if (dragCtx.mergeItems) editor.selection(null);
		if (dragCtx.action.operations.length !== 0)
			editor.update(dragCtx.action);

		delete this.dragCtx;
	} else if (this.lassoHelper.running()) {
		// TODO it catches more events than needed, to be re-factored
		const sel = this.lassoHelper.end();
		editor.selection(!event.shiftKey ? sel : selMerge(sel, editor.selection()));
	} else if (this.lassoHelper.fragment) {
		if (!event.shiftKey)
			editor.selection(null);
	}
	this.editor.event.message.dispatch({
		info: false
	});
	return true;
};

SelectTool.prototype.dblclick = function (event) { // eslint-disable-line max-statements
	var editor = this.editor;
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms', 'bonds', 'sgroups', 'sgroupData']);
	if (!ci) return true;

	var struct = rnd.ctab.molecule;
	if (ci.map === 'atoms') {
		this.editor.selection(closestToSel(ci));
		var atom = struct.atoms.get(ci.id);
		var ra = editor.event.elementEdit.dispatch(atom);
		Promise.resolve(ra).then((newatom) => {
			// TODO: deep compare to not produce dummy, e.g.
			// atom.label != attrs.label || !atom.atomList.equals(attrs.atomList)
			editor.update(fromAtomsAttrs(rnd.ctab, ci.id, newatom));
		}).catch(() => null); // w/o changes
	} else if (ci.map === 'bonds') {
		this.editor.selection(closestToSel(ci));
		var bond = rnd.ctab.bonds.get(ci.id).b;
		var rb = editor.event.bondEdit.dispatch(bond);
		Promise.resolve(rb).then((newbond) => {
			editor.update(fromBondsAttrs(rnd.ctab, ci.id, newbond));
		}).catch(() => null); // w/o changes
	} else if (ci.map === 'sgroups' || ci.map === 'sgroupData') {
		this.editor.selection(closestToSel(ci));
		sgroupDialog(this.editor, ci.id);
	}
	return true;
};

SelectTool.prototype.cancel = function () {
	if (this.dragCtx && this.dragCtx.stopTapping)
		this.dragCtx.stopTapping();

	if (this.dragCtx && this.dragCtx.action) {
		var action = this.dragCtx.action;
		this.editor.update(action);
	}
	if (this.lassoHelper.running())
		this.editor.selection(this.lassoHelper.end());

	delete this.dragCtx;

	this.editor.hover(null);
};
SelectTool.prototype.mouseleave = SelectTool.prototype.cancel;

function closestToSel(ci) {
	const res = {};
	res[ci.map] = [ci.id];
	return res;
}

// TODO: deep-merge?
function selMerge(selection, add, reversible) {
	if (add) {
		Object.keys(add).forEach((item) => {
			if (!selection[item])
				selection[item] = add[item].slice();
			else
				selection[item] = uniqArray(selection[item], add[item], reversible);
		});
	}
	return selection;
}

function isSelected(selection, item) {
	return selection && selection[item.map] && selection[item.map].includes(item.id);
}

function uniqArray(dest, add, reversible) {
	return add.reduce((res, item) => {
		if (reversible) dest = xor(dest, [item]);
		else if (!dest.includes(item)) dest.push(item);
		return dest;
	}, []);
}

export default SelectTool;
