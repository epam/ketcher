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

import { RGroup, type RGroupAttributes } from 'domain/entities/rgroup';
import type { Struct } from 'domain/entities/struct';

import { ifDef } from 'utilities';
import { moleculeToStruct } from './moleculeToStruct';
import type { KetItem, KetRGroupLogic } from './types';

export function rgroupToStruct(ketItem: KetItem): Struct {
  const struct = moleculeToStruct(ketItem);
  const rlogic = ketItem.rlogic;
  if (!rlogic) {
    throw new Error('R-group logic (rlogic) is missing on a KET R-group item');
  }
  const rgroup = rgroupLogicToStruct(rlogic);
  struct.frags.forEach((_value, key) => {
    rgroup.frags.add(key);
  });
  struct.rgroups.set(rlogic.number, rgroup);
  return struct;
}

export function rgroupLogicToStruct(rglogic: KetRGroupLogic): RGroup {
  const params: RGroupAttributes = {};
  ifDef(params, 'range', rglogic.range);
  ifDef(params, 'resth', rglogic.resth);
  ifDef(params, 'ifthen', rglogic.ifthen);

  return new RGroup(params);
}
