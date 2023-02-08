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
  const { show, hideAll } = useContextMenu<ContextMenuShowProps>({
    id: CONTEXT_MENU_ID
  })

  /**
   * Resolve conflicts with the existing functional-group context menu
   * Note: the following scenarios are compatible with the existing logic process,
   *       but maybe will change after refactoring the functional-group context menu.
   *
   * Scenario 1
   * Given: an expanded functional group
   * When: the user right-clicks a bond in the f-group
   * Then: only the functional-group context menu shows
   *
   * Scenario 2
   * Given: the user has selected a bunch of things including functional groups
   * When: the user right-clicks a selected or non-selected bond
   * Then: only the functional-group context menu shows
   *
   * More details: https://github.com/epam/ketcher/pull/1896
   */

  const handleDisplay = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      const editor = getKetcherInstance().editor as Editor
      const closestItem = editor.findItem(event, null)

      if (!closestItem) {
        hideAll()
        return
      }

      const selection = editor.selection()

      const isClickedWithinSelection: number | undefined = selection?.[
        closestItem.map
      ]?.includes(closestItem.id)

      const struct = editor.struct()

      if (isClickedWithinSelection) {
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
      } else {
        selection && editor.render.ctab.setSelection(null)
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
    [getKetcherInstance, hideAll, show]
  )

  return (
    <div style={{ height: '100%' }} onContextMenu={handleDisplay}>
      {children}
    </div>
  )
}

export default ContextMenuTrigger
