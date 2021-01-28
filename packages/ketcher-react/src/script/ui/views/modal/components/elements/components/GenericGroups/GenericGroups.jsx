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

import React from 'react'
import generics from '../../../../../../../chem/generics'
import GenGroup from './components'

import styles from './GenericGroups.module.less'

function GenericGroups({ selected, onSelect, className, ...props }) {
  return (
    <div summary="Generic Groups" className={styles[className]} {...props}>
      <div className={styles.col}>
        <GenGroup
          gen={generics}
          name="atom"
          selected={l => selected(l)}
          onSelect={l => onSelect(l)}
        />
        <GenGroup
          gen={generics}
          name="special"
          selected={l => selected(l)}
          onSelect={l => onSelect(l)}
        />
      </div>
      <div className={styles.col}>
        <GenGroup
          gen={generics}
          name="group"
          selected={l => selected(l)}
          onSelect={l => onSelect(l)}
        />
      </div>
    </div>
  )
}

export default GenericGroups
