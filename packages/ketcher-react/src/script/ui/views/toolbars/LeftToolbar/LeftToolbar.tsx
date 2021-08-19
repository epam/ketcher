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

import React, { FC } from 'react'
import {
  ToolbarGroupItem,
  ToolbarGroupItemCallProps,
  ToolbarGroupItemProps
} from '../ToolbarGroupItem'
import { ToolbarItem, ToolbarItemVariant } from '../toolbar.types'

import { Bond } from './Bond'
import { RGroup } from './RGroup'
import { Shape } from './Shape'
import { Transform } from './Transform'
import classes from './LeftToolbar.module.less'
import clsx from 'clsx'
import { makeItems } from '../ToolbarGroupItem/utils'
import { useResizeObserver } from '../../../../../hooks'

const Group: FC<{ className?: string }> = ({ children, className }) => (
  <div className={clsx(classes.group, className)}>{children}</div>
)

const selectOptions: ToolbarItem[] = makeItems([
  'select-lasso',
  'select-rectangle',
  'select-fragment'
])

const arrowsOptions: ToolbarItem[] = makeItems([
  'reaction-arrow-open-angle',
  'reaction-arrow-filled-triangle',
  'reaction-arrow-filled-bow',
  'reaction-arrow-dashed-open-angle',
  'reaction-arrow-failed',
  'reaction-arrow-both-ends-filled-triangle',
  'reaction-arrow-equilibrium-filled-half-bow',
  'reaction-arrow-equilibrium-filled-triangle',
  'reaction-arrow-equilibrium-open-angle',
  'reaction-arrow-unbalanced-equilibrium-filled-half-bow',
  'reaction-arrow-unbalanced-equilibrium-open-half-angle',
  'reaction-arrow-unbalanced-equilibrium-large-filled-half-bow',
  'reaction-arrow-unbalanced-equilibrium-fille-half-triangle'
])

const mappingOptions: ToolbarItem[] = makeItems([
  'reaction-map',
  'reaction-unmap',
  'reaction-automap'
])

interface LeftToolbarProps
  extends Omit<ToolbarGroupItemProps, 'id' | 'options'> {
  className?: string
}

interface LeftToolbarCallProps extends ToolbarGroupItemCallProps {}

type Props = LeftToolbarProps & LeftToolbarCallProps

const LeftToolbar = (props: Props) => {
  const { className, ...rest } = props
  const { ref, height } = useResizeObserver<HTMLDivElement>()

  type ItemProps = {
    id: ToolbarItemVariant
    options?: ToolbarItem[]
  }
  const Item = ({ id, options }: ItemProps) =>
    ToolbarGroupItem({ id, options, ...rest })

  return (
    <div className={clsx(classes.root, className)} ref={ref}>
      <Group>
        <Item id="select" options={selectOptions} />
        <Item id="erase" />
      </Group>

      <Group>
        <Bond {...rest} height={height} />
        <Item id="chain" />
      </Group>

      <Group>
        <Item id="charge-plus" />
        <Item id="charge-minus" />
      </Group>

      <Group>
        <Transform {...rest} height={height} />
      </Group>
      <Group>
        <Item id="sgroup" />
        <Item id="sgroup-data" />
      </Group>
      <Group>
        <Item id="reaction-plus" />
        <Item id="reaction-arrows" options={arrowsOptions} />
        <Item id="reaction-mapping-tools" options={mappingOptions} />
      </Group>

      <Group>
        <RGroup {...rest} />
      </Group>
      <Group>
        <Shape {...rest} />
      </Group>
      <Group>
        <Item id="text" />
      </Group>
    </div>
  )
}

export type { LeftToolbarProps, LeftToolbarCallProps }
export { LeftToolbar }
