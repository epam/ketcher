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

import utils from '../shared/utils';

import Pile from '../../util/pile';
import Struct from '../../chem/struct';
import LassoHelper from './helper/lasso';
import { sgroupDialog } from './sgroup';
import { atomLongtapEvent } from './atom';
import { fromMultipleMove } from '../actions/fragment';
import { fromAtomsAttrs } from '../actions/atom';
import { fromBondsAttrs } from '../actions/bond';
import { fromItemsFuse } from '../actions/closely-fusing';

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

	if (!ci) { //  ci.type == 'Canvas'
		atomLongtapEvent(this, rnd);
		delete this.dragCtx.item;

		if (!this.lassoHelper.fragment)
			this.lassoHelper.begin(event);

		return true;
	}

	this.editor.hover(null);

	if (!isSelected(rnd, this.editor.selection(), ci)) {
		let sel = closestToSel(ci);

		if (ci.map === 'frags') {
			const frag = ctab.frags.get(ci.id);
			sel = {
				atoms: frag.fragGetAtoms(ctab, ci.id),
				bonds: frag.fragGetBonds(ctab, ci.id)
			};
		} else if (ci.map === 'sgroups') {
			const sgroup = ctab.sgroups.get(ci.id).item;
			sel = {
				atoms: Struct.SGroup.getAtoms(struct, sgroup),
				bonds: Struct.SGroup.getBonds(struct, sgroup)
			};
		} else if (ci.map === 'rgroups') {
			const rgroup = ctab.rgroups.get(ci.id);
			sel = {
				atoms: rgroup.getAtoms(rnd),
				bonds: rgroup.getBonds(rnd)
			};
		}

		this.editor.selection(!event.shiftKey ? sel :
			selMerge(sel, this.editor.selection()));
	}

	if (ci.map === 'atoms')
		atomLongtapEvent(this, rnd); // this event has to be stopped in others events by `tool.dragCtx.stopTapping()`

	return true;
};

SelectTool.prototype.mousemove = function (event) {
	const editor = this.editor;
	const restruct = editor.render.ctab;
	const dragCtx = this.dragCtx;

	if (dragCtx && dragCtx.stopTapping)
		dragCtx.stopTapping();

	if (dragCtx && dragCtx.item) {
		// moving selected objects
		if (dragCtx.action) {
			dragCtx.action.perform(restruct);
			editor.update(dragCtx.action, true); // redraw the elements in unshifted position, lest the have different offset
		}

		const expSel = editor.explicitSelected();
		dragCtx.action = fromMultipleMove(
			restruct,
			expSel,
			editor.render.page2obj(event).sub(dragCtx.xy0)
		);

		dragCtx.mergeItems = utils.getItemsToFuse(editor, expSel);
		utils.hoverItemsToFuse(editor, dragCtx.mergeItems);

		editor.update(dragCtx.action, true);
		return true;
	}

	if (this.lassoHelper.running()) {
		const sel = this.lassoHelper.addPoint(event);
		editor.selection(!event.shiftKey ? sel : selMerge(sel, editor.selection()));
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
		editor.update(dragCtx.action);

		delete this.dragCtx;
	} else if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		const sel = this.lassoHelper.end();
		editor.selection(!event.shiftKey ? sel : selMerge(sel, editor.selection()));
	} else if (this.lassoHelper.fragment) {
		if (!event.shiftKey)
			editor.selection(null);
	}
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
		});
	} else if (ci.map === 'bonds') {
		this.editor.selection(closestToSel(ci));
		var bond = rnd.ctab.bonds.get(ci.id).b;
		var rb = editor.event.bondEdit.dispatch(bond);
		Promise.resolve(rb).then((newbond) => {
			editor.update(fromBondsAttrs(rnd.ctab, ci.id, newbond));
		});
	} else if (ci.map === 'sgroups' || ci.map === 'sgroupData') {
		this.editor.selection(closestToSel(ci));
		sgroupDialog(this.editor, ci.id);
	}
	return true;
};

SelectTool.prototype.cancel = SelectTool.prototype.mouseleave = function () { // eslint-disable-line no-multi-assign
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

function closestToSel(ci) {
	var res = {};
	res[ci.map] = [ci.id];
	return res;
}

// TODO: deep-merge?
function selMerge(selection, add) {
	if (add) {
		Object.keys(add).forEach((item) => {
			if (!selection[item])
				selection[item] = add[item].slice();
			else
				selection[item] = uniqArray(selection[item], add[item]);
		});
	}
	return selection;
}

function uniqArray(dest, add) {
	for (var i = 0; i < add.length; i++) {
		if (dest.indexOf(add[i]) < 0)
			dest.push(add[i]);
	}
	return dest;
}

function isSelected(render, selection, item) {
	if (!selection)
		return false;

	const ctab = render.ctab;

	if (item.map === 'frags' || item.map === 'rgroups') {
		const atoms = item.map === 'frags' ?
			ctab.frags.get(item.id).fragGetAtoms(ctab, item.id) :
			ctab.rgroups.get(item.id).getAtoms(render);

		const selectionSet = new Pile(selection['atoms']);
		const atomSet = new Pile(atoms);

		return !!selection['atoms'] && selectionSet.isSuperset(atomSet);
	}

	return !!selection[item.map] &&
		selection[item.map].indexOf(item.id) > -1;
}

export default SelectTool;
