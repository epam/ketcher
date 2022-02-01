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

import { BoxWithLines } from './components/BoxWithLines'
import GenSet from './components'
import styles from './GenGroup.module.less'

import type { GenericsType } from '../GenericTypes'

type GenProps = {
  groups: GenericsType
  selected: (label: string) => boolean
  onSelect: (label: string) => void
  isNested?: boolean
}

const GenGroup = ({
  groups,
  onSelect,
  selected,
  isNested = false
}: GenProps) => {
  if (typeof groups !== 'object') {
    return null
  }
  const keys = Object.keys(groups)

  return (
    <>
      {keys.map((key, index) => {
        const targetGroup = groups[key]
        const isLastSibling = index + 1 >= keys.length

        return (
          <div className={styles.fieldFlexWrapper} key={index}>
            {isNested && <BoxWithLines isLastSibling={isLastSibling} />}
            <fieldset className={styles.fieldset}>
              <legend key={index}>{targetGroup.title}</legend>
              {targetGroup.itemSets && (
                <GenSet
                  labels={targetGroup.itemSets}
                  selected={selected}
                  onSelect={onSelect}
                  className={styles.subgroup}
                />
              )}
              {targetGroup.subGroups && (
                <GenGroup
                  groups={targetGroup.subGroups}
                  selected={selected}
                  onSelect={onSelect}
                  isNested={true}
                />
              )}
            </fieldset>
          </div>
        )
      })}
    </>
  )
}

export default GenGroup
