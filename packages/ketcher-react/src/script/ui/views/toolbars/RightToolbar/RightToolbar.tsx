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
import React, { FC } from 'react'

import { basicAtoms } from '../../../action/atoms'
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../ToolbarGroupItem'
import { AtomsList } from './AtomsList'
import classes from './RightToolbar.module.less'

const Group: FC<{ className?: string }> = ({ children, className }) => (
  <div className={clsx(classes.group, className)}>{children}</div>
)

interface RightToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  className?: string
  active?: {
    opts: any
    tool: string
  }
  freqAtoms: any[]
}

interface RightToolbarCallProps extends ToolbarGroupItemCallProps {}

type Props = RightToolbarProps & RightToolbarCallProps

const RightToolbar = (props: Props) => {
  const { className, ...rest } = props
  const { active, onAction, freqAtoms } = rest

  return (
    <div className={clsx(classes.root, className)}>
      <Group>
        <AtomsList atoms={basicAtoms} active={active} onAction={onAction} />
        <AtomsList atoms={freqAtoms} active={active} onAction={onAction} />
      </Group>

      <Group>
        <ToolbarGroupItem id="period-table" {...rest} />
      </Group>
    </div>
  )
}

export type { RightToolbarProps, RightToolbarCallProps }
export { RightToolbar }
