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

import { ReStruct } from '../../render'

import { HighlightAdd, HighlightDelete } from '../operations/highlight'

import { Action } from './action'

export function fromHighlightAddition(
  restruct: ReStruct,
  color: string,
  atoms?: number[],
  bonds?: number[]
): Action {
  const action = new Action()

  action.addOp(new HighlightAdd(atoms, bonds, color))

  return action.perform(restruct)
}

export function fromHighlightDelete(
  restruct: ReStruct,
  highlightId: number
): Action {
  const action = new Action()

  const highlights = restruct.molecule.highlights
  if (highlights.has(highlightId)) {
    action.addOp(new HighlightDelete(highlightId))

    return action.perform(restruct)
  }
  return action
}

export function fromHighlightClear(restruct: ReStruct): Action {
  const action = new Action()

  const highlights = restruct.molecule.highlights

  highlights.forEach((_, key) => {
    action.addOp(new HighlightDelete(key))
  })

  return action.perform(restruct)
}
