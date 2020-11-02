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

import op from '../shared/op';
import Action from '../shared/action';

export function fromRGroupAttrs(restruct, id, attrs) {
	const action = new Action();

	Object.keys(attrs).forEach((key) => {
		action.addOp(new op.RGroupAttr(id, key, attrs[key]));
	});

	return action.perform(restruct);
}

export function fromRGroupFragment(restruct, rgidNew, frid) {
	const action = new Action();
	action.addOp(new op.RGroupFragment(rgidNew, frid));

	return action.perform(restruct);
}

export function fromUpdateIfThen(restruct, rgidNew, rgidOld, skipRgids) {
	const action = new Action();
	if (!restruct.molecule.rgroups.get(rgidOld))
		action.addOp(new op.UpdateIfThen(rgidNew, rgidOld, skipRgids));

	return action.perform(restruct);
}
