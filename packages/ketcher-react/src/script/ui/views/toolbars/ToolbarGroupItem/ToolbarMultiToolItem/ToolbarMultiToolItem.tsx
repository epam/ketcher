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

import {
  ActionButton,
  ActionButtonCallProps,
  ActionButtonProps
} from '../ActionButton'
import { GroupDescriptor, MultiToolVariant } from './variants/variants.types'
import { ToolbarItem, ToolbarItemVariant } from '../../toolbar.types'
import action, { UiAction, UiActionAction } from '../../../../action'

import { useRef } from 'react'
import clsx from 'clsx'
import { Portal } from '../../../../Portal'
import { chooseMultiTool } from './variants/chooseMultiTool'
import classes from './ToolbarMultiToolItem.module.less'
import { usePortalOpening } from './usePortalOpening'
import { usePortalStyle } from './usePortalStyle'
import { SettingsManager } from '../../../../utils/settingsManager'
import { Icon } from '../../../../../../components'

interface ToolbarMultiToolItemProps {
  id: ToolbarItemVariant
  options: ToolbarItem[]
  groups?: GroupDescriptor[]
  variant?: MultiToolVariant
  status: {
    [key in string]?: UiAction
  }
  opened: string | null
  disableableButtons: string[]
  indigoVerification: boolean
  className?: string
  vertical?: boolean
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
    groups,
    variant,
    status,
    opened,
    indigoVerification,
    disableableButtons,
    className,
    vertical,
    onAction,
    onOpen
  } = props

  const ref = useRef<HTMLDivElement>(null)
  const [isOpen] = usePortalOpening([id, opened, options])
  const [portalStyle] = usePortalStyle([ref, isOpen])

  let selected = false
  let currentId = id

  const selectedTool = options.find(
    (toolbarItem) => status[toolbarItem.id]?.selected
  )
  if (selectedTool) {
    currentId = selectedTool.id
    selected = true
  }

  const currentStatus = status[currentId]
  // todo: #type find out real type, possible GetActionState is no acceptable here
  // and check this type convert is redundant
  selected = selected || Boolean(currentStatus?.selected)

  const allInnerItemsHidden: boolean = options.every(
    (option) => status[option.id]?.hidden
  )

  const displayMultiToolItem = !(allInnerItemsHidden || currentStatus?.hidden)

  if (!currentStatus && options.length) {
    const savedSelectionTool = SettingsManager.selectionTool
    const savedSelectionToolId =
      savedSelectionTool &&
      `${savedSelectionTool.tool}-${savedSelectionTool.opts}`
    currentId =
      savedSelectionTool &&
      savedSelectionToolId &&
      options.filter(
        (option) =>
          !status[option.id]?.hidden && option.id === savedSelectionToolId
      )[0]?.id

    if (!currentId) {
      currentId =
        options.filter((option) => !status[option.id]?.hidden)[0]?.id ||
        options[0].id
    }
  }

  const actionButtonProps: Omit<
    ActionButtonProps & ActionButtonCallProps,
    'name' | 'status' | 'action'
  > = {
    disableableButtons,
    indigoVerification,
    onAction: selected ? () => onOpenOptions() : onAction
  }

  const onOpenOptions = () => {
    // todo: same as #type above
    onOpen(id, Boolean(currentStatus?.selected))
  }

  const [Component, portalClassName] = chooseMultiTool(variant)

  return displayMultiToolItem ? (
    <div ref={ref} className={classes.root}>
      <ActionButton
        {...actionButtonProps}
        className={className}
        name={currentId}
        action={action[currentId]}
        status={currentStatus as ActionButtonProps['status']}
        selected={selected}
      />
      {!isOpen && (
        <Icon
          className={`${classes.icon} ${
            currentStatus?.selected && classes.iconSelected
          }`}
          name="dropdown"
          onClick={onOpenOptions}
        />
      )}

      {isOpen ? (
        <Portal
          isOpen={isOpen}
          className={clsx(
            classes.portal,
            vertical && classes['portal-vertical'],
            portalClassName
          )}
          style={portalStyle}
        >
          <Component
            options={options}
            groups={groups}
            status={status}
            disableableButtons={disableableButtons}
            indigoVerification={indigoVerification}
            onAction={onAction}
          />
        </Portal>
      ) : null}
    </div>
  ) : null
}

export type { ToolbarMultiToolItemProps, ToolbarMultiToolItemCallProps }
export { ToolbarMultiToolItem }
