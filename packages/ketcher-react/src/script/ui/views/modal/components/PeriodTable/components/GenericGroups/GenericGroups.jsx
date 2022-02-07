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

import GenGroup from './components'
import { Generics } from 'ketcher-core'
import classes from './GenericGroups.module.less'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

function GenericGroups({ selected, onSelect, className, ...props }) {
  return (
    <div summary="Generic Groups" className={classes[className]} {...props}>
      <OverlayScrollbarsComponent>
        <GenGroup
          gen={Generics}
          name="atom"
          selected={selected}
          onSelect={onSelect}
        />
        <GenGroup
          gen={Generics}
          name="special"
          selected={selected}
          onSelect={onSelect}
        />

        <GenGroup
          gen={Generics}
          name="group"
          selected={selected}
          onSelect={onSelect}
        />
      </OverlayScrollbarsComponent>
    </div>
  )
}

export default GenericGroups
