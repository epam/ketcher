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
import clsx from 'clsx'
import React from 'react'
import { basicAtoms } from '../../../action/atoms'
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../ToolbarGroupItem'
import { AtomsList } from './AtomsList'

import styles from './RightToolbar.module.less'

interface RightToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options' | 'Component' | 'tool'> {
  className?: string
}

interface RightToolbarCallProps extends ToolbarGroupItemCallProps {}

type Props = RightToolbarProps & RightToolbarCallProps

const RightToolbar = (props: Props) => {
  const { className, ...rest } = props
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.group}>
        <ToolbarGroupItem
          id="atom"
          Component={_props => AtomsList({ ..._props, atoms: basicAtoms })}
          {...rest}
        />

        <ToolbarGroupItem
          id="freq-atoms"
          Component={_props =>
            AtomsList({ ..._props, atoms: _props['freqAtoms'] })
          }
          {...rest}
        />
      </div>

      <div className={styles.group}>
        <ToolbarGroupItem id="period-table" {...rest} />
      </div>
    </div>
  )
}

export type { RightToolbarProps, RightToolbarCallProps }
export { RightToolbar }
