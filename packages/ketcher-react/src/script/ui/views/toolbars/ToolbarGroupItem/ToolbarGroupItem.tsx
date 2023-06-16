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

import action, { UiAction, UiActionAction } from '../../../action'

import { ActionButton, ActionButtonProps } from './ActionButton'
import { ToolbarItem } from '../toolbar.types'
import { ToolbarMultiToolItem } from './ToolbarMultiToolItem'
import { getIconName } from 'components'

interface ToolbarGroupItemProps extends ToolbarItem {
  status: {
    [key in string]?: UiAction
  }
  opened: string | null
  disableableButtons: string[]
  indigoVerification: boolean
  className?: string
  vertical?: boolean
}

interface ToolbarGroupItemCallProps {
  onAction: (action: UiActionAction) => void
  onOpen: (menuName: string, isSelected: boolean) => void
}

type Props = ToolbarGroupItemProps & ToolbarGroupItemCallProps

const ToolbarGroupItem = (props: Props) => {
  const {
    id,
    options,
    status,
    className,
    opened,
    indigoVerification,
    disableableButtons,
    vertical,
    onAction,
    onOpen
  } = props

  if (!options?.length) {
    const iconName = getIconName(id)
    return (
      iconName && (
        <ActionButton
          className={className}
          name={iconName}
          action={action[id]}
          status={status[id] as ActionButtonProps['status']}
          selected={!!status[id]?.selected}
          indigoVerification={indigoVerification}
          disableableButtons={disableableButtons}
          onAction={onAction}
        />
      )
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
      vertical={vertical}
    />
  )
}

export type { ToolbarGroupItemProps, ToolbarGroupItemCallProps }
export { ToolbarGroupItem }
