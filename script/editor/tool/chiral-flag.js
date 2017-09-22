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

var Action = require('../action');

function ChiralFlagTool(editor) {
	if (!(this instanceof ChiralFlagTool))
		return new ChiralFlagTool(editor);

	this.editor = editor;
	this.editor.selection(null);
}

ChiralFlagTool.prototype.mousedown = function (event) {
	const rnd = this.editor.render;
	const ci = this.editor.findItem(event, ['chiralFlags']);
	if (ci && ci.map === 'chiralFlags') {
		this.editor.hover(null);
		this.editor.selection({ chiralFlags: [ci.id] });
		this.dragCtx = {
			xy0: rnd.page2obj(event),
			action: new Action()
		};
	}
};
ChiralFlagTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	if (this.dragCtx) {
		if (this.dragCtx.action)
			this.dragCtx.action.perform(rnd.ctab);

		this.dragCtx.action = Action.fromMultipleMove(
			rnd.ctab,
			this.editor.selection() || {},
			rnd.page2obj(event).sub(this.dragCtx.xy0)
		);
		this.editor.update(this.dragCtx.action, true);
	} else {
		this.editor.hover(this.editor.findItem(event, ['chiralFlags']));
	}
};
ChiralFlagTool.prototype.mouseup = function (event) {
	var rnd = this.editor.render;
	if (this.dragCtx) {
		this.editor.update(this.dragCtx.action);
		delete this.dragCtx;
	} else if (rnd.ctab.molecule.isChiral === false) {
		this.editor.update(Action.fromChiralFlagAddition(rnd.ctab, rnd.page2obj(event)));
	}
};

module.exports = ChiralFlagTool;
