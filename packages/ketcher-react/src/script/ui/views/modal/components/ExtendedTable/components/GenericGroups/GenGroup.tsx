/****************************************************************************
 * Copyright 2023 EPAM Systems
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

import type { GenGroup as GenGroupType } from 'ketcher-core'
import { GenSet } from './GenSet'
import { isGenericGroup } from '../../helpers'
import styles from './GenGroup.module.less'

type GenProps = {
  selected: (label: string) => boolean
  onAtomSelect: (label: string, activateImmediately: boolean) => void
  group: GenGroupType
  disabledQueryElements: Array<string> | null
}

const getLegendClassname = (title: string) => {
  const mainTitles = [
    'Atom Generics',
    'Special Nodes',
    'Group Generics',
    'Acyclic',
    'Cyclic'
  ]
  if (mainTitles.includes(title)) return 'legendMain'
  return 'legend'
}

const GenGroup = ({
  group,
  onAtomSelect,
  selected,
  disabledQueryElements
}: GenProps) => {
  return (
    <div className={styles.fieldFlexWrapper}>
      <fieldset className={styles.fieldset}>
        <legend className={styles[getLegendClassname(group.title)]}>
          {group.title}
        </legend>
        <div
          className={
            isGenericGroup(group.title)
              ? styles.genButtonContainer
              : styles.buttonContainer
          }
        >
          {group.itemSets && (
            <GenSet
              labels={group.itemSets}
              selected={selected}
              onAtomSelect={onAtomSelect}
              className={styles.subGroup}
              group={group.title}
              disabledQueryElements={disabledQueryElements}
            />
          )}
        </div>
      </fieldset>
    </div>
  )
}

export { GenGroup }
