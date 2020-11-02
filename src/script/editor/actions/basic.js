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

export function fromNewCanvas(restruct, struct) {
	var action = new Action();

	action.addOp(new op.CanvasLoad(struct));
	return action.perform(restruct);
}

export function fromDescriptorsAlign(restruct) {
	const action = new Action();
	action.addOp(new op.AlignDescriptors(restruct));
	return action.perform(restruct);
}
