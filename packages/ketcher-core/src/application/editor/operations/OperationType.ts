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

export const OperationType = Object.freeze({
  ATOM_ADD: 'Add atom',
  ATOM_DELETE: 'Delete atom',
  ATOM_ATTR: 'Set atom attribute',
  ATOM_MOVE: 'Move atom',
  CALC_IMPLICIT_H: 'Calculate implicit hydrogen',
  BOND_ADD: 'Add bond',
  BOND_DELETE: 'Delete bond',
  BOND_ATTR: 'Set bond attribute',
  BOND_MOVE: 'Move bond',
  LOOP_MOVE: 'Move loop',
  S_GROUP_ATTACHMENT_POINT_ADD: 'Add attachment point to s-group',
  S_GROUP_ATTACHMENT_POINT_REMOVE: 'Remove attachment point from s-group',
  S_GROUP_ATOM_ADD: 'Add atom to s-group',
  S_GROUP_ATOM_REMOVE: 'Remove atom from s-group',
  S_GROUP_ATTR: 'Set s-group attribute',
  S_GROUP_CREATE: 'Create s-group',
  S_GROUP_DELETE: 'Delete s-group',
  S_GROUP_ADD_TO_HIERACHY: 'Add s-group to hierarchy',
  S_GROUP_REMOVE_FROM_HIERACHY: 'Delete s-group from hierarchy',
  R_GROUP_ATTR: 'Set r-group attribute',
  R_GROUP_FRAGMENT: 'R-group fragment',
  R_GROUP_ATTACHMENT_POINT_ADD: 'Add R-group attachment point',
  R_GROUP_ATTACHMENT_POINT_REMOVE: 'Remove R-group attachment point',
  UPDATE_IF_THEN: 'Update',
  RESTORE_IF_THEN: 'Restore',
  RXN_ARROW_ADD: 'Add rxn arrow',
  RXN_ARROW_DELETE: 'Delete rxn arrow',
  RXN_ARROW_MOVE: 'Move rxn arrow',
  RXN_ARROW_ROTATE: 'Rotate rxn arrow',
  RXN_ARROW_RESIZE: 'Resize rxn arrow',
  RXN_PLUS_ADD: 'Add rxn plus',
  RXN_PLUS_DELETE: 'Delete rxn plus',
  RXN_PLUS_MOVE: 'Move rxn plus',
  S_GROUP_DATA_MOVE: 'Move s-group data',
  CANVAS_LOAD: 'Load canvas',
  ALIGN_DESCRIPTORS: 'Align descriptors',
  SIMPLE_OBJECT_ADD: 'Add simple object',
  SIMPLE_OBJECT_DELETE: 'Delete simple object',
  SIMPLE_OBJECT_MOVE: 'Move simple object',
  SIMPLE_OBJECT_RESIZE: 'Resize simple object',
  RESTORE_DESCRIPTORS_POSITION: 'Restore descriptors position',
  FRAGMENT_ADD: 'Add fragment',
  FRAGMENT_DELETE: 'Delete fragment',
  FRAGMENT_SET_PROPERTIES: 'Set fragment properties',
  FRAGMENT_STEREO_FLAG: 'Add fragment stereo flag',
  FRAGMENT_ADD_STEREO_ATOM: 'Add stereo atom to fragment',
  FRAGMENT_DELETE_STEREO_ATOM: 'Delete stereo atom from fragment',
  ENHANCED_FLAG_MOVE: 'Move enhanced flag',
  TEXT_CREATE: 'Add text',
  TEXT_UPDATE: 'Edit text',
  TEXT_DELETE: 'Delete text',
  TEXT_MOVE: 'Move text',
  ADD_HIGHLIGHT: 'Highlight',
  UPDATE_HIGHLIGHT: 'Update highlight',
  REMOVE_HIGHLIGHT: 'Remove highlight',
  POLYMER_BOND_ADD: 'Add polymer bond',
  POLYMER_BOND_DELETE: 'Remove polymer bond',
});

export enum OperationPriority {
  ATOM_ATTR = 1,
  BOND_ADD = 1,
  R_GROUP_ATTACHMENT_POINT_REMOVE = 1,
  ATOM_MOVE = 2,
  BOND_ATTR = 2,
  BOND_MOVE = 2,
  BOND_DELETE = 3,
  S_GROUP_ATOM_ADD = 3,
  S_GROUP_ATTACHMENT_POINT_ADD = 3,
  R_GROUP_ATTACHMENT_POINT_ADD = 3,
  S_GROUP_ATTR = 4,
  ATOM_DELETE = 5,
  FRAGMENT_STEREO_FLAG = 6,
  CALC_IMPLICIT_H = 10,
  FRAGMENT_DELETE_STEREO_ATOM = 90,
  S_GROUP_DELETE = 95,
  S_GROUP_ADD_TO_HIERACHY = 100,
  FRAGMENT_ADD_STEREO_ATOM = 100,
}
