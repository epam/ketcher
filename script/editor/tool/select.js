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

var Set = require('../../util/set');

var Action = require('../action');
var Struct = require('../../chem/struct');

var LassoHelper = require('./helper/lasso');

var SGroup = require('./sgroup');
var Atom = require('./atom');
var utils = require('./utils');

function SelectTool(editor, mode) {
	if (!(this instanceof SelectTool))
		return new SelectTool(editor, mode);

	this.editor = editor;

	this.lassoHelper = new LassoHelper(mode === 'lasso' ? 0 : 1, editor, mode === 'fragment');
}

SelectTool.prototype.mousedown = function (event) { // eslint-disable-line max-statements
	var rnd = this.editor.render;
	var ctab = rnd.ctab;
	var struct = ctab.molecule;
	this.editor.hover(null); // TODO review hovering for touch devicess
	var selectFragment = (this.lassoHelper.fragment || event.ctrlKey);
	var ci = this.editor.findItem(
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
		Atom.atomLongtapEvent(this, rnd);
		delete this.dragCtx.item;

		if (!this.lassoHelper.fragment)
			this.lassoHelper.begin(event);
	} else {
		this.editor.hover(null);
		if (!isSelected(rnd, this.editor.selection(), ci)) {
			var sel = closestToSel(ci);
			if (ci.map === 'frags') {
				var frag = ctab.frags.get(ci.id);
				sel = {
					atoms: frag.fragGetAtoms(rnd, ci.id),
					bonds: frag.fragGetBonds(rnd, ci.id)
				};
			} else if (ci.map === 'sgroups') {
				var sgroup = ctab.sgroups.get(ci.id).item;
				sel = {
					atoms: Struct.SGroup.getAtoms(struct, sgroup),
					bonds: Struct.SGroup.getBonds(struct, sgroup)
				};
			} else if (ci.map === 'rgroups') {
				var rgroup = ctab.rgroups.get(ci.id);
				sel = {
					atoms: rgroup.getAtoms(rnd),
					bonds: rgroup.getBonds(rnd)
				};
			}
			this.editor.selection(!event.shiftKey ? sel :
				selMerge(sel, this.editor.selection()));
		}
		if (ci.map === 'atoms')
			Atom.atomLongtapEvent(this, rnd);
	}
	return true;
};

SelectTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	var restruct = rnd.ctab;
	if (this.dragCtx && this.dragCtx.stopTapping)
		this.dragCtx.stopTapping();

	if (this.dragCtx && this.dragCtx.item) {
		// moving selected objects
		if (this.dragCtx.action) {
			this.dragCtx.action.perform(restruct);
			this.editor.update(this.dragCtx.action, true); // redraw the elements in unshifted position, lest the have different offset
		}
		var expSel = this.editor.explicitSelected();
		this.dragCtx.action = Action.fromMultipleMove(
			restruct,
			expSel,
			rnd.page2obj(event).sub(this.dragCtx.xy0));

		// finding & highlighting object to stick to
		this.dragCtx.mergeItems =
			closestToMerge(restruct, this.editor.findMerge(expSel, ['atoms', 'bonds']));

		if (this.dragCtx.mergeItems) {
			const hoverMerge = {
				atoms: Object.values(this.dragCtx.mergeItems.atoms),
				bonds: Object.values(this.dragCtx.mergeItems.bonds)
			};
			this.editor.hover({ map: 'merge', id: +Date.now(), items: hoverMerge });
		} else {
			this.editor.hover(null);
		}

		this.editor.update(this.dragCtx.action, true);
	} else if (this.lassoHelper.running()) {
		var sel = this.lassoHelper.addPoint(event);
		this.editor.selection(!event.shiftKey ? sel :
			selMerge(sel, this.editor.selection()));
	} else {
		this.editor.hover(
			this.editor.findItem(event,
				(this.lassoHelper.fragment || event.ctrlKey) ?
					['frags', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags'] :
					['atoms', 'bonds', 'sgroups', 'sgroupData', 'rgroups', 'rxnArrows', 'rxnPluses', 'chiralFlags']
			)
		);
	}
	return true;
};
SelectTool.prototype.mouseup = function (event) { // eslint-disable-line max-statements
	if (this.dragCtx && this.dragCtx.stopTapping)
		this.dragCtx.stopTapping();

	if (this.dragCtx && this.dragCtx.item) {
		var restruct = this.editor.render.ctab;

		if (this.dragCtx.mergeItems) {
			this.editor.selection(null);

			['atoms', 'bonds'].forEach(mp => {
				const mergeMap = this.dragCtx.mergeItems[mp];
				const mergeAction = mp === 'atoms' ? Action.fromAtomMerge : Action.fromBondMerge;
				Object.entries(mergeMap).forEach(pair => {
					this.dragCtx.action = this.dragCtx.action ?
						mergeAction(restruct, +pair[0], +pair[1]).mergeWith(this.dragCtx.action) :
						mergeAction(restruct, +pair[0], +pair[1]);
				});
			});
		}
		this.editor.hover(null);

		if (this.dragCtx.action)
			this.editor.update(this.dragCtx.action);
		delete this.dragCtx;
	} else if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		const sel = this.lassoHelper.end();
		this.editor.selection(!event.shiftKey ? sel :
			selMerge(sel, this.editor.selection()));
	} else if (this.lassoHelper.fragment) {
		this.editor.selection(null);
	}
	return true;
};

SelectTool.prototype.dblclick = function (event) { // eslint-disable-line max-statements
	var editor = this.editor;
	var rnd = this.editor.render;
	var ci = this.editor.findItem(event, ['atoms', 'bonds', 'sgroups', 'sgroupData']);
	if (!ci) return;

	var struct = rnd.ctab.molecule;
	if (ci.map === 'atoms') {
		this.editor.selection(closestToSel(ci));
		var atom = struct.atoms.get(ci.id);
		var ra = editor.event.elementEdit.dispatch(atom);
		Promise.resolve(ra).then(function (newatom) {
			// TODO: deep compare to not produce dummy, e.g.
			// atom.label != attrs.label || !atom.atomList.equals(attrs.atomList)
			editor.update(Action.fromAtomsAttrs(rnd.ctab, ci.id, newatom));
		});
	} else if (ci.map === 'bonds') {
		this.editor.selection(closestToSel(ci));
		var bond = rnd.ctab.bonds.get(ci.id).b;
		var rb = editor.event.bondEdit.dispatch(bond);
		Promise.resolve(rb).then(function (newbond) {
			editor.update(Action.fromBondAttrs(rnd.ctab, ci.id, newbond));
		});
	} else if (ci.map === 'sgroups' || ci.map === 'sgroupData') {
		this.editor.selection(closestToSel(ci));
		SGroup.dialog(this.editor, ci.id);
//    } else if (ci.map == 'sgroupData') {
//        SGroup.dialog(this.editor, ci.sgid);
	}
	return true;
};

SelectTool.prototype.cancel = SelectTool.prototype.mouseleave = function () {
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

function closestToMerge(restruct, closestMap) {
	const struct = restruct.molecule;
	const mergeMap = Object.assign({}, closestMap);

	Object.entries(closestMap.bonds).forEach(([srcId, dstId]) => {
		const bond = struct.bonds.get(srcId);
		const bondCI = struct.bonds.get(dstId);

		if (utils.mergeBondsParams(restruct, bond, bondCI)) {
			delete mergeMap.atoms[bond.begin];
			delete mergeMap.atoms[bond.end];
		} else {
			delete mergeMap.bonds[srcId];
		}
	});

	if (Object.keys(mergeMap.atoms).length === 0 &&
		Object.keys(mergeMap.bonds).length === 0) return null;

	return mergeMap;
}

function closestToSel(ci) {
	var res = {};
	res[ci.map] = [ci.id];
	return res;
}

// TODO: deep-merge?
function selMerge(selection, add) {
	if (add) {
		for (var item in add) {
			if (add.hasOwnProperty(item)) {
				if (!selection[item]) {
					selection[item] = add[item].slice();
				} else {
					selection[item] = uniqArray(selection[item],
						add[item]);
				}
			}
		}
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
	var ctab = render.ctab;
	if (item.map === 'frags' || item.map === 'rgroups') {
		var atoms = item.map === 'frags' ?
			ctab.frags.get(item.id).fragGetAtoms(render, item.id) :
			ctab.rgroups.get(item.id).getAtoms(render);

		return !!selection['atoms'] &&
			Set.subset(Set.fromList(atoms), Set.fromList(selection['atoms']));
	}

	return !!selection[item.map] &&
		selection[item.map].indexOf(item.id) > -1;
}

module.exports = SelectTool;
