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

export const SgContexts = {
  Fragment: 'Fragment',
  Multifragment: 'Multifragment',
  Bond: 'Bond',
  Atom: 'Atom',
  Group: 'Group',
};

export const selectionKeys = [
  'atoms',
  'bonds',
  'frags',
  'sgroups',
  'rgroups',
  'rgroupAttachmentPoints',
  'rxnArrows',
  'rxnPluses',
  'simpleObjects',
  'texts',
] as const;

export const defaultBondThickness = 2;

export enum MonomerGroups {
  SUGARS = 'Sugars',
  BASES = 'Bases',
  PHOSPHATES = 'Phosphates',
}

export enum MonomerGroupCodes {
  R = 'R',
  A = 'A',
  C = 'C',
  G = 'G',
  T = 'T',
  U = 'U',
  X = 'X',
  P = 'P',
}

export const MonomerCodeToGroup: Record<MonomerGroupCodes, MonomerGroups> = {
  R: MonomerGroups.SUGARS,
  A: MonomerGroups.BASES,
  C: MonomerGroups.BASES,
  G: MonomerGroups.BASES,
  T: MonomerGroups.BASES,
  U: MonomerGroups.BASES,
  X: MonomerGroups.BASES,
  P: MonomerGroups.PHOSPHATES,
} as const;
