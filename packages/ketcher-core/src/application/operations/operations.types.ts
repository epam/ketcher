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

import { Struct } from 'domain/entities'

export type OperationType =
  | 'ATOM_ADD'
  | 'ATOM_DELETE'
  | 'ATOM_ATTR'
  | 'ATOM_MOVE'
  | 'BOND_ADD'
  | 'BOND_DELETE'
  | 'BOND_ATTR'
  | 'BOND_MOVE'
  | 'LOOP_MOVE'
  | 'S_GROUP_ATOM_ADD'
  | 'S_GROUP_ATOM_DELETE'
  | 'S_GROUP_ATTR'
  | 'S_GROUP_ADD'
  | 'S_GROUP_DELETE'
  | 'S_GROUP_ADD_TO_HIERACHY'
  | 'S_GROUP_REMOVE_FROM_HIERACHY'
  | 'R_GROUP_ATTR'
  | 'R_GROUP_ADD'
  | 'R_GROUP_DELETE'
  | 'R_GROUP_ADD_FRAGMENT'
  | 'R_GROUP_DELETE_FRAGMENT'
  | 'R_GROUP_UPDATE_IF_THEN'
  | 'RGROUP_RESTORE_IF_THEN'
  | 'RXN_ARROW_ADD'
  | 'RXN_ARROW_DELETE'
  | 'RXN_ARROW_MOVE'
  | 'RXN_ARROW_RESIZE'
  | 'RXN_PLUS_ADD'
  | 'RXN_PLUS_DELETE'
  | 'RXN_PLUS_MOVE'
  | 'S_GROUP_DATA_MOVE'
  | 'STRUCT_LOAD'
  | 'STRUCT_ALIGN_DESCRIPTORS'
  | 'STRUCT_CALC_IMPLICIT_H'
  | 'SIMPLE_OBJECT_ADD'
  | 'SIMPLE_OBJECT_DELETE'
  | 'SIMPLE_OBJECT_MOVE'
  | 'SIMPLE_OBJECT_RESIZE'
  | 'RESTORE_DESCRIPTORS_POSITION'
  | 'FRAGMENT_ADD'
  | 'FRAGMENT_DELETE'
  | 'FRAGMENT_UPDATE_STEREO_FLAG'
  | 'FRAGMENT_ADD_STEREO_ATOM'
  | 'FRAGMENT_DELETE_STEREO_ATOM'
  | 'FRAGMENT_MOVE_STEREO_FLAG'
  | 'TEXT_ADD'
  | 'TEXT_UPDATE'
  | 'TEXT_DELETE'
  | 'TEXT_MOVE'

export interface Operation {
  readonly type: OperationType
  readonly priority: number
  // eslint-disable-next-line no-use-before-define
  perform: (struct: Struct) => PerformOperationResult
}

export type PerformOperationResult = {
  entityId: number
  operationType: OperationType
  inverseOperation: Operation
}

export type AttrValueType = string | number | boolean | null
