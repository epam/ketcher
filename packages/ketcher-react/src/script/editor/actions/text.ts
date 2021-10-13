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

import { ReStruct, Vec2 } from 'ketcher-core'
import { TextCreate, TextDelete, TextUpdate } from '../operations'

import Action from '../shared/action'

export function fromTextCreation(
  ReStruct: ReStruct,
  content: string,
  position: Vec2
) {
  const action = new Action()
  action.addOp(new TextCreate(content, position))
  return action.perform(ReStruct)
}

export function fromTextUpdating(
  ReStruct: ReStruct,
  id: number,
  content: string
) {
  const action = new Action()
  action.addOp(new TextUpdate(id, content))
  return action.perform(ReStruct)
}

export function fromTextDeletion(ReStruct: ReStruct, id: number) {
  const action = new Action()

  action.addOp(new TextDelete(id))

  return action.perform(ReStruct)
}
