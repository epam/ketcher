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

import action, { UiAction, UiActionAction } from '../../../../action'

import { ActionButton } from '../../ToolbarGroupItem/ActionButton'
import templates from '../../../../data/templates'
import { getIconName } from 'components'

interface TemplatesListProps {
  active?: {
    tool?: string
    opts: {
      struct: any
    }
  }
  disableableButtons: string[]
  indigoVerification: boolean
}

interface TemplatesListCallProps {
  onAction: (action: UiActionAction) => void
}

type Props = TemplatesListProps & TemplatesListCallProps

const TemplatesList = (props: Props) => {
  const { active, disableableButtons, indigoVerification, onAction } = props

  const isTemplate = active && active.tool === 'template'

  const makeAction = (struct, index): UiAction => ({
    shortcut: action[`template-${index}`].shortcut,
    action: { tool: 'template', opts: { struct } },
    title: struct.name
  })

  return (
    <>
      {templates.map((struct, index) => {
        const iconName = getIconName(`template-${index}`)
        return (
          iconName && (
            <ActionButton
              key={iconName}
              name={iconName}
              action={makeAction(struct, index)}
              onAction={onAction}
              selected={isTemplate && active && active.opts.struct === struct}
              status={action[`template-${index}`]}
              disableableButtons={disableableButtons}
              indigoVerification={indigoVerification}
            />
          )
        )
      })}
    </>
  )
}

export type { TemplatesListProps, TemplatesListCallProps }
export { TemplatesList }
