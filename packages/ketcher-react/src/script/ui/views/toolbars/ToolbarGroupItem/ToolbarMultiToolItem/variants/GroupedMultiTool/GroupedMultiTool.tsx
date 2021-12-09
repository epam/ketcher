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

import { MultiToolCallProps, MultiToolProps } from '../variants.types'

import { ActionButton } from '../../../ActionButton'
import action from '../../../../../../action'
import classes from './GroupedMultiTool.module.less'

type GroupedMultiToolProps = MultiToolProps
type GroupedMultiToolCallProps = MultiToolCallProps

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

  return (
    <>
      {groups.map((descriptor) => (
        <div className={classes.group} key={descriptor.start}>
          {options
            .slice(descriptor.start, descriptor.end)
            .map((toolbarItem) => {
              const currentStatus = status[toolbarItem.id]
              return (
                <ActionButton
                  key={toolbarItem.id}
                  name={toolbarItem.id}
                  action={action[toolbarItem.id]}
                  // @ts-ignore
                  status={currentStatus}
                  selected={!!currentStatus?.selected}
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
