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

import Vec2 from '../../util/vec2';
import Struct from '../../chem/struct';
import utils from '../shared/utils';

import { atomLongtapEvent } from './atom';
import { bondChangingAction } from '../actions/bond';
import { fromChain } from '../actions/chain';
import { fromItemsFuse } from '../actions/closely-fusing';

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
	const rnd = editor.render;

	if (this.dragCtx) {
		if ('stopTapping' in this.dragCtx)
			this.dragCtx.stopTapping();

		editor.selection(null);

		const dragCtx = this.dragCtx;

		if (!('item' in dragCtx) || dragCtx.item.map === 'atoms') {
			if ('action' in dragCtx)
				dragCtx.action.perform(rnd.ctab);

			const atoms = rnd.ctab.molecule.atoms;

			const pos0 = dragCtx.item ?
				atoms.get(dragCtx.item.id).pp :
				dragCtx.xy0;

			const pos1 = rnd.page2obj(event);
			const sectCount = Math.ceil(Vec2.diff(pos1, pos0).length());

			const angle = event.ctrlKey ?
				utils.calcAngle(pos0, pos1) :
				utils.fracAngle(pos0, pos1);

			dragCtx.action = fromChain(rnd.ctab, pos0, angle, sectCount,
				dragCtx.item ? dragCtx.item.id : null);

			editor.event.message.dispatch({
				info: sectCount + ' sectors'
			});

			editor.update(dragCtx.action, true);

			dragCtx.mergeItems = utils.getItemsToFuse(editor);
			utils.hoverItemsToFuse(editor, dragCtx.mergeItems);

			return true;
		}
	}

	editor.hover(this.editor.findItem(event, ['atoms', 'bonds']));
	return true;
};

ChainTool.prototype.mouseup = function () {
	const editor = this.editor;
	const restruct = editor.render.ctab;
	const struct = restruct.molecule;
	const dragCtx = this.dragCtx;

	if (!dragCtx) {
		editor.event.message.dispatch({
			info: false
		});

		return true;
	}

	if ('stopTapping' in this.dragCtx)
		dragCtx.stopTapping();

	let action = dragCtx.action;

	if (!action && dragCtx.item && dragCtx.item.map === 'bonds') {
		const bond = struct.bonds.get(dragCtx.item.id);

		action = bondChangingAction(restruct, dragCtx.item.id, bond, {
			type: Struct.Bond.PATTERN.TYPE.SINGLE,
			stereo: Struct.Bond.PATTERN.STEREO.NONE
		});
	}

	editor.selection(null);

	dragCtx.action = dragCtx.action ?
		fromItemsFuse(restruct, dragCtx.mergeItems).mergeWith(dragCtx.action) :
		fromItemsFuse(restruct, dragCtx.mergeItems);

	editor.hover(null);

	if (action)
		editor.update(action);

	delete this.dragCtx;
	return true;
};

ChainTool.prototype.cancel = ChainTool.prototype.mouseup;

ChainTool.prototype.mouseleave = ChainTool.prototype.mouseup;

export default ChainTool;
