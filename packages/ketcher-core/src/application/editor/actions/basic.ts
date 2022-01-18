/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import { AlignDescriptors, CanvasLoad } from '../operations'

import { Action } from './action'

export function fromNewCanvas(restruct, struct) {
  const action = new Action()

  action.addOp(new CanvasLoad(struct))
  return action.perform(restruct)
}

export function fromDescriptorsAlign(restruct) {
  const action = new Action()
  action.addOp(new AlignDescriptors())
  return action.perform(restruct)
}
