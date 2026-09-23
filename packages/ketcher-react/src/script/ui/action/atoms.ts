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

import type { UiAction, AtomActionOpts } from './action.types';

export const basicAtoms: readonly string[] = [
  'H',
  'C',
  'N',
  'O',
  'S',
  'P',
  'F',
  'Cl',
  'Br',
  'I',
] as const;

export const atomCuts: Readonly<Record<string, string>> = {
  H: 'h',
  C: 'c',
  N: 'n',
  O: 'o',
  S: 's',
  P: 'p',
  F: 'f',
  Cl: 'l',
  Br: 'b',
  I: 'i',
  A: 'a',
  Q: 'q',
  R: 'r',
  K: 'k',
  M: 'm',
  Si: 'Shift+s',
  Na: 'Shift+n',
  X: 'x',
  D: 'd',
  B: 'Shift+b',
  '*': 'Shift+8',
} as const;

type AtomActionsMap = Record<string, UiAction>;

export default Object.keys(atomCuts).reduce<AtomActionsMap>((res, label) => {
  const atomAction: UiAction = {
    title: `Atom ${label}`,
    shortcut: atomCuts[label],
    action: {
      tool: 'atom',
      opts: { label } as AtomActionOpts,
    },
  };
  res[`atom-${label.toLowerCase()}`] = atomAction;
  return res;
}, {});
