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

import { RGroup, Struct } from 'domain/entities'

import { ifDef } from 'utilities'
import { moleculeToStruct } from './moleculeToStruct'

export function rgroupToStruct(graphItem): Struct {
  const struct = moleculeToStruct(graphItem)
  const rgroup = rgroupLogicToStruct(graphItem.rlogic)
  struct.frags.forEach((_value: any, key) => {
    rgroup.frags.add(key)
  })
  if (graphItem.rlogic) struct.rgroups.add(rgroup)
  return struct
}

export function rgroupLogicToStruct(rglogic) {
  const attributes = { index: rglogic.index }
  ifDef(attributes, 'range', rglogic.range)
  ifDef(attributes, 'resth', rglogic.resth)
  ifDef(attributes, 'ifthen', rglogic.ifthen)

  return new RGroup(attributes)
}
