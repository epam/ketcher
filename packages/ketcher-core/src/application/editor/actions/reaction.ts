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

import {
  RxnArrowAdd,
  RxnArrowDelete,
  RxnArrowResize,
  RxnPlusAdd,
  RxnPlusDelete
} from '../operations'

import { Action } from './action'

export function fromArrowAddition(restruct, pos, mode) {
  const action = new Action()
  action.addOp(new RxnArrowAdd(pos, mode))
  return action.perform(restruct)
}

export function fromArrowResizing(restruct, id, d, current, anchor) {
  const action = new Action()
  action.addOp(new RxnArrowResize(id, d, current, anchor, false))
  return action.perform(restruct)
}

export function fromArrowDeletion(restruct, id) {
  const action = new Action()
  action.addOp(new RxnArrowDelete(id))
  return action.perform(restruct)
}

export function fromPlusAddition(restruct, pos) {
  const action = new Action()
  action.addOp(new RxnPlusAdd(pos).perform(restruct))
  return action
}

export function fromPlusDeletion(restruct, id) {
  const action = new Action()
  action.addOp(new RxnPlusDelete(id))
  return action.perform(restruct)
}
