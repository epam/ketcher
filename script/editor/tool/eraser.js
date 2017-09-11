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
var LassoHelper = require('./helper/lasso');

function EraserTool(editor, mode) {
	if (!(this instanceof EraserTool)) {
		if (!editor.selection())
			return new EraserTool(editor, mode);

		var action = Action.fromFragmentDeletion(editor.render.ctab, editor.selection());
		editor.update(action);
		editor.selection(null);
		return null;
	}

	this.editor = editor;

	this.maps = ['atoms', 'bonds', 'rxnArrows', 'rxnPluses', 'sgroups', 'sgroupData', 'chiralFlags'];
	this.lassoHelper = new LassoHelper(mode || 0, editor);
}

EraserTool.prototype.mousedown = function (event) {
	var ci = this.editor.findItem(event, this.maps);
	if (!ci) //  ci.type == 'Canvas'
		this.lassoHelper.begin(event);
};

EraserTool.prototype.mousemove = function (event) {
	if (this.lassoHelper.running())
		this.editor.selection(this.lassoHelper.addPoint(event));
	else
		this.editor.hover(this.editor.findItem(event, this.maps));
};

EraserTool.prototype.mouseleave = function (event) {
	if (this.lassoHelper.running(event))
		this.lassoHelper.end(event);
};

EraserTool.prototype.mouseup = function (event) { // eslint-disable-line max-statements
	var rnd = this.editor.render;
	if (this.lassoHelper.running()) { // TODO it catches more events than needed, to be re-factored
		this.editor.update(Action.fromFragmentDeletion(rnd.ctab, this.lassoHelper.end(event)));
		this.editor.selection(null);
	} else {
		var ci = this.editor.findItem(event, this.maps);
		if (ci) { //  ci.type != 'Canvas'
			this.editor.hover(null);
			if (ci.map === 'atoms') {
				this.editor.update(Action.fromAtomDeletion(rnd.ctab, ci.id));
			} else if (ci.map === 'bonds') {
				this.editor.update(Action.fromBondDeletion(rnd.ctab, ci.id));
			} else if (ci.map === 'sgroups' || ci.map === 'sgroupData') {
				this.editor.update(Action.fromSgroupDeletion(rnd.ctab, ci.id));
			} else if (ci.map === 'rxnArrows') {
				this.editor.update(Action.fromArrowDeletion(rnd.ctab, ci.id));
			} else if (ci.map === 'rxnPluses') {
				this.editor.update(Action.fromPlusDeletion(rnd.ctab, ci.id));
			} else if (ci.map === 'chiralFlags') {
				this.editor.update(Action.fromChiralFlagDeletion(rnd.ctab));
			} else {
				// TODO re-factoring needed - should be "map-independent"
				console.error('EraserTool: unable to delete the object ' + ci.map + '[' + ci.id + ']');
				return;
			}
			this.editor.selection(null);
		}
	}
};

module.exports = EraserTool;
