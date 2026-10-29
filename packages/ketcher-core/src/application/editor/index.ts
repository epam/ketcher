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

import utilities from './shared/utilities';

export const vectorUtilities = {
  fracAngle: utilities.fracAngle,
  calcAngle: utilities.calcAngle,
  degrees: utilities.degrees,
  calcNewAtomPos: utilities.calcNewAtomPos,
};

export * from './operations';
export * from './actions';
export * from './shared/constants';
export * from './shared/coordinates';
export * from './shared/customEvents';
export * from './editor.types';
export * from './Editor';
export * from './editorSingleton';
export * from './shared/sort';
export * from './EditorHistory';
export * from './modes';
export * from './editorEvents';
export * from './editorSettings';
export * from './tools';
export * from './MacromoleculesConverter';
export * from './tools/types';
export type { FlipDirection } from './shared/utilities.types';
export type { LibraryItemDragState } from './editor.types';
