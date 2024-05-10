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

import { RGroup, Struct } from 'domain/entities';

import { ifDef } from 'utilities';
import { moleculeToStruct } from './moleculeToStruct';

export function rgroupToStruct(ketItem): Struct {
  const struct = moleculeToStruct(ketItem);
  const rgroup = rgroupLogicToStruct(ketItem.rlogic);
  struct.frags.forEach((_value: any, key) => {
    rgroup.frags.add(key);
  });
  if (ketItem.rlogic) struct.rgroups.set(ketItem.rlogic.number, rgroup);
  return struct;
}

export function rgroupLogicToStruct(rglogic) {
  const params = {};
  ifDef(params, 'range', rglogic.range);
  ifDef(params, 'resth', rglogic.resth);
  ifDef(params, 'ifthen', rglogic.ifthen);

  return new RGroup(params);
}
