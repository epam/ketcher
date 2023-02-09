/****************************************************************************
 * Copyright 2022 EPAM Systems
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

import { FunctionalGroup } from 'ketcher-core'
import { PropsWithChildren, useCallback } from 'react'
import { useContextMenu } from 'react-contexify'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { CONTEXT_MENU_ID } from './ContextMenu'
import type { ContextMenuShowProps } from './contextMenu.types'

const ContextMenuTrigger: React.FC<PropsWithChildren> = ({ children }) => {
  const { getKetcherInstance } = useAppContext()
  const { show } = useContextMenu<ContextMenuShowProps>({
    id: CONTEXT_MENU_ID
  })

  const handleDisplay = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()

      const editor = getKetcherInstance().editor as Editor
      const closestItem = editor.findItem(event, null)
      const selection = editor.selection()
      const struct = editor.struct()

      if (selection) {
        const hasGroupsInSelection = selection?.atoms?.some((atomId) =>
          FunctionalGroup.atomsInFunctionalGroup(
            struct.functionalGroups,
            atomId
          )
        )

        if (hasGroupsInSelection) {
          show({
            event,
            props: {
              itemData: 'for-functional-groups-in-selection'
            }
          })
        } else {
          show({
            event,
            props: {
              itemData: 'for-bonds-and-atoms-in-selection'
            }
          })
        }
      } else if (closestItem) {
        switch (closestItem.map) {
          case 'bonds':
            {
              const functionalGroup = FunctionalGroup.findFunctionalGroupByBond(
                struct,
                struct.functionalGroups,
                closestItem.id,
                true
              )
              show({
                event,
                props: {
                  itemData:
                    functionalGroup === null
                      ? 'for-one-bond'
                      : 'for-one-functional-group',
                  closestItem: functionalGroup || closestItem
                }
              })
            }
            break

          case 'atoms': {
            const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
              struct.functionalGroups,
              closestItem.id,
              true
            )
            show({
              event,
              props: {
                itemData:
                  functionalGroup === null
                    ? 'for-one-atom'
                    : 'for-one-functional-group',
                closestItem: functionalGroup || closestItem
              }
            })
            break
          }

          case 'sgroups':
          case 'functionalGroups': {
            const sGroup = struct.sgroups.get(closestItem.id)
            const functionalGroup = FunctionalGroup.findFunctionalGroupBySGroup(
              struct.functionalGroups,
              sGroup
            )
            functionalGroup &&
              show({
                event,
                props: {
                  itemData: 'for-one-functional-group',
                  closestItem: functionalGroup
                }
              })
            break
          }
        }
      }
    },
    [getKetcherInstance, show]
  )

  return (
    <div style={{ height: '100%' }} onContextMenu={handleDisplay}>
      {children}
    </div>
  )
}

export default ContextMenuTrigger
