/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  SimpleObjectAdd,
  SimpleObjectDelete,
  SimpleObjectSetGeometry,
} from '../operations';

import { Action } from './action';
import type { ReStruct } from 'application/render';
import type { Handle, ShapeGeometry } from 'domain/staticObjects/types';
import type { Vec2 } from 'domain/entities/vec2';
import { resizeShape } from 'domain/staticObjects/geometry';
import { getOrThrow } from 'utilities';

export function fromSimpleObjectDeletion(restruct, id) {
  const action = new Action();
  action.addOp(new SimpleObjectDelete(id));
  return action.perform(restruct);
}

export function fromSimpleObjectAddition(restruct, pos, mode, toCircle) {
  const action = new Action();
  action.addOp(new SimpleObjectAdd(pos, mode, toCircle));
  return action.perform(restruct);
}

export function fromSimpleObjectGeometryUpdate(
  restruct: ReStruct,
  id: number,
  geometry: ShapeGeometry,
) {
  const action = new Action();
  action.addOp(new SimpleObjectSetGeometry(id, geometry));
  return action.perform(restruct);
}

export function fromSimpleObjectHandleDrag(
  restruct: ReStruct,
  id: number,
  handle: Handle,
  pointer: Vec2,
) {
  const item = getOrThrow(
    restruct.molecule.simpleObjects,
    id,
    `Simple object with id ${id} not found`,
  );
  return fromSimpleObjectGeometryUpdate(
    restruct,
    id,
    resizeShape(item.geometry, handle, pointer),
  );
}
