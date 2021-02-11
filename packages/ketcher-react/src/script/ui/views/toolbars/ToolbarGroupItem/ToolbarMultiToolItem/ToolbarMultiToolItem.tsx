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
import React, { useRef } from 'react'
import action, { UiAction, UiActionAction } from '../../../../action'
import Icon from '../../../../component/view/icon'
import { Portal } from '../../../../Portal'
import { ToolbarItem, ToolbarItemVariant } from '../../toolbox.types'
import {
  ActionButton,
  ActionButtonCallProps,
  ActionButtonProps
} from '../ActionButton'
import { usePortalOpening } from './usePortalOpening'
import { usePortalStyle } from './usePortalStyle'

import styles from './ToolbarMultiToolItem.module.less'

interface ToolbarMultiToolItemProps {
  id: ToolbarItemVariant
  options: ToolbarItem[]
  status: {
    [key in string]?: UiAction
  }
  opened: any | null
  disableableButtons: string[]
  indigoVerification: boolean
}

interface ToolbarMultiToolItemCallProps {
  onAction: (action: UiActionAction) => void
  onOpen: (menuName: string, isSelected: boolean) => void
}

type Props = ToolbarMultiToolItemProps & ToolbarMultiToolItemCallProps

const ToolbarMultiToolItem = (props: Props) => {
  const {
    id,
    options,
    status,
    opened,
    indigoVerification,
    disableableButtons,
    onAction,
    onOpen
  } = props

  const ref = useRef<HTMLDivElement>(null)
  const [isOpen] = usePortalOpening([id, opened, options])
  const [portalStyle] = usePortalStyle([ref, isOpen])

  let selected = false
  let currentId = id

  const selectedTool = options.find(
    toolbarItem => status[toolbarItem.id]?.selected
  )
  if (selectedTool) {
    currentId = selectedTool.id
    selected = true
  }

  const currentStatus = status[currentId]
  // todo: #type find out real type, possible GetActionState is no acceptable here
  // and check this type convert is redundant
  selected = selected || Boolean(currentStatus?.selected)

  if (!currentStatus && options.length) {
    currentId = options[0].id
  }

  const actionButtonProps: Omit<
    ActionButtonProps & ActionButtonCallProps,
    'name' | 'status' | 'action'
  > = {
    disableableButtons,
    indigoVerification,
    onAction
  }

  const onOpenOptions = () => {
    // todo: same as #type above
    onOpen(id, Boolean(currentStatus?.selected))
  }

  return (
    <div ref={ref} className={styles.root}>
      <ActionButton
        {...actionButtonProps}
        name={currentId}
        action={action[currentId]}
        // @ts-ignore
        status={currentStatus}
        selected={selected}
      />
      <Icon className={styles.icon} name="dropdown" onClick={onOpenOptions} />

      {!isOpen ? null : (
        <Portal isOpen={isOpen} className={styles.portal} style={portalStyle}>
          {options.map(toolbarItem => {
            const _status = status[toolbarItem.id]
            return (
              <ActionButton
                {...actionButtonProps}
                key={toolbarItem.id}
                name={toolbarItem.id}
                action={action[toolbarItem.id]}
                // @ts-ignore
                status={_status}
                selected={!!_status?.selected}
              />
            )
          })}
        </Portal>
      )}
    </div>
  )
}

export type { ToolbarMultiToolItemProps, ToolbarMultiToolItemCallProps }
export { ToolbarMultiToolItem }
