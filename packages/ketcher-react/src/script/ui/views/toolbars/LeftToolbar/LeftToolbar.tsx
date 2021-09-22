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

import { FC } from 'react'
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
import {
  selectOptions,
  bondCommon,
  bondQuery,
  bondSpecial,
  bondStereo,
  transformOptions,
  arrowsOptions,
  mappingOptions,
  rGroupOptions,
  shapeOptions
} from './leftToolbarOptions'
import classes from './LeftToolbar.module.less'
import clsx from 'clsx'
import { useResizeObserver } from '../../../../../hooks'

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

  const status = rest.status

  type GroupItem = ItemProps

  const Group: FC<{ items?: GroupItem[]; className?: string }> = ({
    items,
    className
  }) => {
    const visibleItems: GroupItem[] = []
    if (items) {
      items.forEach(item => {
        let visible = true
        if (status[item.id]?.hidden) {
          visible = false
        } else if (item.options?.every(option => status[option.id]?.hidden)) {
          visible = false
        }
        if (visible) visibleItems.push(item)
      })
    }
    return visibleItems.length ? (
      <div className={clsx(classes.group, className)}>
        {visibleItems.map(item => {
          switch (item.id) {
            case 'bond-common':
              return <Bond {...rest} height={height} key={item.id} />
            case 'transform-rotate':
              return <Transform {...rest} height={height} key={item.id} />
            case 'rgroup':
              return <RGroup {...rest} key={item.id} />
            case 'shape':
              return <Shape {...rest} key={item.id} />
            default:
              return <Item id={item.id} options={item.options} key={item.id} />
          }
        })}
      </div>
    ) : null
  }

  return (
    <div className={clsx(classes.root, className)} ref={ref}>
      <Group
        items={[{ id: 'select', options: selectOptions }, { id: 'erase' }]}
      />

      <Group
        items={[
          {
            id: 'bond-common',
            options: [
              ...bondCommon,
              ...bondQuery,
              ...bondSpecial,
              ...bondStereo
            ]
          },
          { id: 'chain' }
        ]}
      />

      <Group items={[{ id: 'charge-plus' }, { id: 'charge-minus' }]} />

      <Group
        items={[
          {
            id: 'transform-rotate',
            options: transformOptions
          }
        ]}
      />

      <Group items={[{ id: 'sgroup' }, { id: 'sgroup-data' }]} />

      <Group
        items={[
          { id: 'reaction-plus' },
          { id: 'reaction-arrows', options: arrowsOptions },
          {
            id: 'reaction-mapping-tools',
            options: mappingOptions
          }
        ]}
      />

      <Group items={[{ id: 'rgroup', options: rGroupOptions }]} />

      <Group items={[{ id: 'shape', options: shapeOptions }]} />

      <Group items={[{ id: 'text' }]} />
    </div>
  )
}

export type { LeftToolbarProps, LeftToolbarCallProps }
export { LeftToolbar }
