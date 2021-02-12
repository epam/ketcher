/****************************************************************************
 * Copyright 2020 EPAM Systems
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

export const basicAtoms = ['H', 'C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I']

export const atomCuts = {
  H: 'h',
  C: 'c',
  N: 'n',
  O: 'o',
  S: 's',
  P: 'p',
  F: 'f',
  Cl: 'Shift+c',
  Br: 'Shift+b',
  I: 'i',
  A: 'a'
}

export default Object.keys(atomCuts).reduce((res, label) => {
  res[`atom-${label.toLowerCase()}`] = {
    title: `Atom ${label}`,
    shortcut: atomCuts[label],
    action: {
      tool: 'atom',
      opts: { label }
    }
  }
  return res
}, {})
