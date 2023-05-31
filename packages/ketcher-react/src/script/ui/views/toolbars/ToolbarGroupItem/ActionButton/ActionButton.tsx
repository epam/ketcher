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

import { UiAction, UiActionAction } from '../../../../action'

import classes from './ActionButton.module.less'
import clsx from 'clsx'
import { shortcutStr } from '../../shortcutStr'
import { Icon } from '../../../../../../components'

interface ActionButtonProps {
  name: string
  action?: UiAction
  status?: {
    disabled?: boolean
    hidden?: boolean
  }
  selected?: boolean
  disableableButtons: string[]
  indigoVerification: boolean
  className?: string
}

interface ActionButtonCallProps {
  onAction: (action: UiActionAction) => void
}

type Props = ActionButtonProps & ActionButtonCallProps

const ActionButton = (props: Props) => {
  const {
    name,
    action,
    status = {},
    selected = false,
    disableableButtons,
    indigoVerification,
    className,
    onAction
  } = props

  if (status.hidden) {
    return null
  }

  const shortcut = shortcutStr(action?.shortcut)
  const disabled =
    status.disabled || (indigoVerification && disableableButtons.includes(name))

  const handleClick = () => {
    if (action?.action) {
      onAction(action.action)
    }
  }

  return (
    <button
      data-testid={name}
      disabled={disabled}
      onClick={handleClick}
      title={shortcut ? `${action?.title} (${shortcut})` : action?.title}
      className={clsx(
        classes.button,
        {
          [classes.selected]: selected
        },
        className
      )}
    >
      <Icon name={name} />
      <kbd>{shortcut}</kbd>
    </button>
  )
}

export type { ActionButtonProps, ActionButtonCallProps }
export { ActionButton }
