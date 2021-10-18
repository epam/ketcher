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

function offFunctionsToFG(editor, functionalGroups, sgroups, event) {
  const ci = editor.findItem(event, ['atoms', 'bonds'])
  if (functionalGroups.size > 0 && ci && ci.map) {
    switch (ci.map) {
      case 'atoms':
        for (let sg of sgroups.values()) {
          if (sg.item.atoms.includes(ci.id)) {
            for (let fg of functionalGroups.values()) {
              if (sg.item.id === fg.relatedSGroupId + 1) {
                return true
              }
            }
          }
        }
        break
      case 'bonds':
        const bond = editor.render.ctab.bonds.get(ci.id)
        for (let sgs of sgroups.values()) {
          if (
            sgs.item.atoms.includes(bond.b.begin) &&
            sgs.item.atoms.includes(bond.b.end)
          ) {
            for (let fg of functionalGroups.values()) {
              if (sgs.item.id === fg.relatedSGroupId + 1) {
                return true
              }
            }
          }
        }
        break
    }
  }
  return false
}

export { offFunctionsToFG }
