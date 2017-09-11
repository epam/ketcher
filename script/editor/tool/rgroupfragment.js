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

var Struct = require('../../chem/struct');

var Action = require('../action');

function RGroupFragmentTool(editor) {
	if (!(this instanceof RGroupFragmentTool)) {
		// TODO: check if it's a fragments already
		editor.selection(null);
		return new RGroupFragmentTool(editor);
	}

	this.editor = editor;
}

RGroupFragmentTool.prototype.mousemove = function (event) {
	this.editor.hover(this.editor.findItem(event, ['frags', 'rgroups']));
};

RGroupFragmentTool.prototype.mouseup = function (event) {
	var editor = this.editor;
	var struct = editor.render.ctab.molecule;
	var ci = editor.findItem(event, ['frags', 'rgroups']);
	if (ci) {
		this.editor.hover(null);

		var label = (ci.map === 'rgroups') ? ci.id :
		    Struct.RGroup.findRGroupByFragment(struct.rgroups, ci.id) || null;
		var rg = Object.assign({ label: label },
		                       ci.map === 'frags' ? null :
		                       struct.rgroups.get(ci.id));
		var res = editor.event.rgroupEdit.dispatch(rg);

		Promise.resolve(res).then(function (newRg) {
			var action = ci.map === 'rgroups' ?
			    Action.fromRGroupAttrs(editor.render.ctab, ci.id, newRg) :
			    Action.fromRGroupFragment(editor.render.ctab, newRg.label, ci.id);

			editor.update(action);
		});
		return true;
	}
};

module.exports = RGroupFragmentTool;
