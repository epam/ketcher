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
import React from 'react'
import action, { UiAction, UiActionAction } from '../../../action'
import {
  ToolbarGroupVariant,
  ToolbarItem,
  ToolbarItemVariant
} from '../toolbox.types'
import { ActionButton } from './ActionButton'
import { ToolbarMultiToolItem } from './ToolbarMultiToolItem'

interface ToolbarGroupItemProps extends ToolbarItem {
  status: {
    [key in string]?: UiAction
  }
  opened: any | null
  disableableButtons: string[]
  indigoVerification: boolean

  // possible redundant properties ?

  active?: {
    opts: any
    tool: string
  }
  freqAtoms: any[]
  visibleTools: {
    [key in ToolbarGroupVariant]?: ToolbarItemVariant
  }
  className?: string
}

interface ToolbarGroupItemCallProps {
  onAction: (action: UiActionAction) => void
  onOpen: (menuName: string, isSelected: boolean) => void
}

type Props = ToolbarGroupItemProps & ToolbarGroupItemCallProps

const ToolbarGroupItem = (props: Props) => {
  const { id, options, Component, status, ...componentProps } = props
  const {
    className,
    opened,
    indigoVerification,
    disableableButtons,
    onAction,
    onOpen
  } = componentProps

  if (Component) {
    return <Component id={id} status={status} {...componentProps} />
  }

  if (!options || !options.length) {
    const selected = !!status[id]?.selected
    return (
      <ActionButton
        className={className}
        name={id}
        action={action[id]}
        // @ts-ignore
        status={status[id]}
        selected={selected}
        indigoVerification={indigoVerification}
        disableableButtons={disableableButtons}
        onAction={onAction}
      />
    )
  }

  return (
    <ToolbarMultiToolItem
      className={className}
      id={id}
      options={options}
      status={status}
      opened={opened}
      disableableButtons={disableableButtons}
      indigoVerification={indigoVerification}
      onAction={onAction}
      onOpen={onOpen}
    />
  )
}

export type { ToolbarGroupItemProps, ToolbarGroupItemCallProps }
export { ToolbarGroupItem }
