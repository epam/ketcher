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
import action from '../../../../../../action'
import { ActionButton } from '../../../ActionButton'
import { MultiToolCallProps, MultiToolProps } from '../variants.types'

import classes from './GroupedMultiTool.module.less'

interface GroupedMultiToolProps extends MultiToolProps {}
interface GroupedMultiToolCallProps extends MultiToolCallProps {}

type Props = GroupedMultiToolProps & GroupedMultiToolCallProps

const GroupedMultiTool = (props: Props) => {
  const {
    groups,
    options,
    status,
    disableableButtons,
    indigoVerification,
    onAction
  } = props

  if (!groups) {
    return null
  }

  let i = 0
  return (
    <>
      {groups.map((amount, index) => (
        <div className={classes.group} key={index}>
          {options.slice(i, i + amount).map(toolbarItem => {
            i++
            const _status = status[toolbarItem.id]
            return (
              <ActionButton
                key={toolbarItem.id}
                name={toolbarItem.id}
                action={action[toolbarItem.id]}
                // @ts-ignore
                status={_status}
                selected={!!_status?.selected}
                disableableButtons={disableableButtons}
                indigoVerification={indigoVerification}
                onAction={onAction}
              />
            )
          })}
        </div>
      ))}
    </>
  )
}

export type { GroupedMultiToolProps, GroupedMultiToolCallProps }
export { GroupedMultiTool }
