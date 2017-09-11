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

var Vec2 = require('../../util/vec2');

var Action = require('../action');
var utils = require('./utils');

function RotateTool(editor, dir) {
	if (!(this instanceof RotateTool)) {
		if (!dir)
			return new RotateTool(editor);

		var restruct = editor.render.ctab;
		var selection = editor.selection();
		var singleBond = selection && selection.bonds &&
		    Object.keys(selection).length === 1 &&
		    selection.bonds.length == 1;

		var action = !singleBond ? Action.fromFlip(restruct, selection, dir) :
		    Action.fromBondAlign(restruct, selection.bonds[0], dir);
		editor.update(action);
		return null;
	}

	this.editor = editor;

	if (!editor.selection() || !editor.selection().atoms)
		// otherwise, clear selection
		this.editor.selection(null);
}

RotateTool.prototype.mousedown = function (event) {
	var xy0 = new Vec2();
	var selection = this.editor.selection();
	var rnd = this.editor.render;
	var struct = rnd.ctab.molecule;

	if (selection && selection.atoms) {
		console.assert(selection.atoms.length > 0);

		var rotId = null;
		var rotAll = false;

		selection.atoms.forEach(function (aid) {
			var atom = struct.atoms.get(aid);

			xy0.add_(atom.pp); // eslint-disable-line no-underscore-dangle

			if (rotAll)
				return;

			atom.neighbors.find(function (nei) {
				var hb = struct.halfBonds.get(nei);

				if (selection.atoms.indexOf(hb.end) === -1) {
					if (hb.loop >= 0) {
						var neiAtom = struct.atoms.get(aid);
						if (!neiAtom.neighbors.find(function (neiNei) {
							var neiHb = struct.halfBonds.get(neiNei);
							return neiHb.loop >= 0 && selection.atoms.indexOf(neiHb.end) !== -1;
						})) {
							rotAll = true;
							return true;
						}
					}
					if (rotId == null) {
						rotId = aid;
					} else if (rotId != aid) {
						rotAll = true;
						return true;
					}
				}
				return false;
			});
		});

		if (!rotAll && rotId != null)
			xy0 = struct.atoms.get(rotId).pp;
		else
			xy0 = xy0.scaled(1 / selection.atoms.length);
	} else {
		struct.atoms.each(function (id, atom) {
			xy0.add_(atom.pp); // eslint-disable-line no-underscore-dangle
		});
		// poor man struct center (without chiral, sdata, etc)
		xy0 = xy0.scaled(1 / struct.atoms.count());
	}
	this.dragCtx = {
		xy0: xy0,
		angle1: utils.calcAngle(xy0, rnd.page2obj(event))
	};
	return true;
};

RotateTool.prototype.mousemove = function (event) { // eslint-disable-line max-statements
	if ('dragCtx' in this) {
		var rnd = this.editor.render;
		var dragCtx = this.dragCtx;

		var pos = rnd.page2obj(event);
		var angle = utils.calcAngle(dragCtx.xy0, pos) - dragCtx.angle1;
		if (!event.ctrlKey)
			angle = utils.fracAngle(angle);

		var degrees = utils.degrees(angle);

		if ('angle' in dragCtx && dragCtx.angle == degrees) return true;
		if ('action' in dragCtx)
			dragCtx.action.perform(rnd.ctab);

		dragCtx.angle = degrees;
		dragCtx.action = Action.fromRotate(rnd.ctab, this.editor.selection(), dragCtx.xy0, angle);

		if (degrees > 180)
			degrees -= 360;
		else if (degrees <= -180)
			degrees += 360;
		this.editor.event.message.dispatch({ info: degrees + 'º' });

		this.editor.update(dragCtx.action, true);
	}
	return true;
};

RotateTool.prototype.mouseup = function () {
	if (this.dragCtx) {
		var action = this.dragCtx.action;
		delete this.dragCtx;
		if (action)
			this.editor.update(action);
		else
			this.editor.selection(null);
	}
	return true;
};

RotateTool.prototype.cancel = RotateTool.prototype.mouseleave =
	RotateTool.prototype.mouseup;

module.exports = RotateTool;
