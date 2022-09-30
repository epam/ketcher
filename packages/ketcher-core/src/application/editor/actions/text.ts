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

import { TextCreate, TextDelete, TextUpdate } from '../operations'

import { Action } from './action'
import { ReStruct } from '../../render'
import { Vec2 } from 'domain/entities'

export function fromTextCreation(
  restruct: ReStruct,
  content: string,
  position: Vec2,
  pos: Array<Vec2>
) {
  const action = new Action()
  action.addOp(new TextCreate(content, position, pos))
  return action.perform(restruct)
}

export function fromTextUpdating(
  restruct: ReStruct,
  id: number,
  content: string
) {
  const action = new Action()
  action.addOp(new TextUpdate(id, content))
  return action.perform(restruct)
}

export function fromTextDeletion(restruct: ReStruct, id: number) {
  const action = new Action()

  action.addOp(new TextDelete(id))

  return action.perform(restruct)
}
