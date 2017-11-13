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

import * as Actions from '../actions';

function PasteTool(editor, struct) {
	if (!(this instanceof PasteTool))
		return new PasteTool(editor, struct);

	this.editor = editor;
	this.editor.selection(null);
	this.struct = struct;

	var rnd = editor.render;
	var point = editor.lastEvent ?
	    rnd.page2obj(editor.lastEvent) : null;
	this.action = Actions.fromPaste(rnd.ctab, this.struct, point);
	this.editor.update(this.action, true);
}

PasteTool.prototype.mousemove = function (event) {
	var rnd = this.editor.render;
	if (this.action)
		this.action.perform(rnd.ctab);
	this.action = Actions.fromPaste(rnd.ctab, this.struct, rnd.page2obj(event));
	this.editor.update(this.action, true);
};

PasteTool.prototype.mouseup = function () {
	if (this.action) {
		var action = this.action;
		delete this.action;
		this.editor.update(action);
	}
};

PasteTool.prototype.cancel = PasteTool.prototype.mouseleave = function () {
	var rnd = this.editor.render;
	if (this.action) {
		this.action.perform(rnd.ctab); // revert the action
		delete this.action;
		rnd.update();
	}
};

export default PasteTool;
