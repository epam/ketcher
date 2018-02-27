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

import Vec2 from '../../util/vec2';
import { Bond } from '../../chem/struct';
import utils from '../shared/utils';

import { atomLongtapEvent } from './atom';
import { bondChangingAction } from '../actions/bond';
import { fromChain } from '../actions/chain';
import { fromItemsFuse, getItemsToFuse, getHoverToFuse } from '../actions/closely-fusing';

function ChainTool(editor) {
	if (!(this instanceof ChainTool))
		return new ChainTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}

ChainTool.prototype.mousedown = function (event) {
	const rnd = this.editor.render;
	const ci = this.editor.findItem(event, ['atoms', 'bonds']);
	this.editor.hover(null);
	this.dragCtx = {
		xy0: rnd.page2obj(event),
		item: ci
	};
	if (ci && ci.map === 'atoms') {
		this.editor.selection({ atoms: [ci.id] }); // for change atom
		// this event has to be stopped in others events by `tool.dragCtx.stopTapping()`
		atomLongtapEvent(this, rnd);
	}
	if (!this.dragCtx.item) // ci.type == 'Canvas'
		delete this.dragCtx.item;
	return true;
};

ChainTool.prototype.mousemove = function (event) { // eslint-disable-line max-statements
	const editor = this.editor;
	const restruct = editor.render.ctab;
	const dragCtx = this.dragCtx;

	editor.hover(this.editor.findItem(event, ['atoms', 'bonds']));
	if (!dragCtx) return true;

	if (dragCtx && dragCtx.stopTapping)
		dragCtx.stopTapping();

	editor.selection(null);

	if (!dragCtx.item || dragCtx.item.map === 'atoms') {
		if (dragCtx.action)
			dragCtx.action.perform(restruct);

		const atoms = restruct.molecule.atoms;

		const pos0 = dragCtx.item ?
			atoms.get(dragCtx.item.id).pp :
			dragCtx.xy0;

		const pos1 = editor.render.page2obj(event);
		const sectCount = Math.ceil(Vec2.diff(pos1, pos0).length());

		const angle = event.ctrlKey ?
			utils.calcAngle(pos0, pos1) :
			utils.fracAngle(pos0, pos1);

		const [action, newItems] = fromChain(restruct, pos0, angle, sectCount,
			dragCtx.item ? dragCtx.item.id : null);

		editor.event.message.dispatch({
			info: sectCount + ' sectors'
		});

		dragCtx.action = action;
		editor.update(dragCtx.action, true);

		dragCtx.mergeItems = getItemsToFuse(editor, newItems);
		editor.hover(getHoverToFuse(dragCtx.mergeItems));

		return true;
	}

	return true;
};

ChainTool.prototype.mouseup = function () {
	const dragCtx = this.dragCtx;
	if (!dragCtx)
		return true;
	delete this.dragCtx;

	const editor = this.editor;
	const restruct = editor.render.ctab;
	const struct = restruct.molecule;

	if (dragCtx.stopTapping) dragCtx.stopTapping();

	if (!dragCtx.action && dragCtx.item && dragCtx.item.map === 'bonds') {
		const bond = struct.bonds.get(dragCtx.item.id);

		dragCtx.action = bondChangingAction(restruct, dragCtx.item.id, bond, {
			type: Bond.PATTERN.TYPE.SINGLE,
			stereo: Bond.PATTERN.STEREO.NONE
		});
	} else {
		dragCtx.action = dragCtx.action ?
			fromItemsFuse(restruct, dragCtx.mergeItems).mergeWith(dragCtx.action) :
			fromItemsFuse(restruct, dragCtx.mergeItems);
	}

	editor.selection(null);
	editor.hover(null);

	if (dragCtx.action)
		editor.update(dragCtx.action);

	editor.event.message.dispatch({
		info: false
	});

	return true;
};

ChainTool.prototype.cancel = ChainTool.prototype.mouseup;

ChainTool.prototype.mouseleave = ChainTool.prototype.mouseup;

export default ChainTool;
