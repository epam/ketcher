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

export function fromArrowAddition(restruct, pos) {
	var action = new Action();
	if (restruct.molecule.rxnArrows.size < 1)
		action.addOp(new op.RxnArrowAdd(pos).perform(restruct));
	return action;
}

export function fromArrowDeletion(restruct, id) {
	var action = new Action();
	action.addOp(new op.RxnArrowDelete(id));
	return action.perform(restruct);
}

export function fromPlusAddition(restruct, pos) {
	var action = new Action();
	action.addOp(new op.RxnPlusAdd(pos).perform(restruct));
	return action;
}

export function fromPlusDeletion(restruct, id) {
	var action = new Action();
	action.addOp(new op.RxnPlusDelete(id));
	return action.perform(restruct);
}
