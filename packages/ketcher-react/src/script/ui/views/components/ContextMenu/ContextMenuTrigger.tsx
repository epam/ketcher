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

/**
 * Initially, library itself should find a proper position for a menu
 * But sometimes it doesn't work correctly, so that's why fix is applied
 */
const fixContextMenuPosition = () => {
  const contextMenu: HTMLDivElement | null = document.querySelector(
    `.${CONTEXT_MENU_ID}`
  )
  if (contextMenu) {
    const computedStyles = getComputedStyle(contextMenu)
    const contextMenuHeight = parseInt(computedStyles.height)
    const currentTopPosition = parseInt(contextMenu.style.top)
    const screenSize = document.body.clientHeight
    if (currentTopPosition + contextMenuHeight > screenSize) {
      contextMenu.style.top = screenSize - contextMenuHeight + 'px'
    }
  }
}

const ContextMenuTrigger: React.FC<PropsWithChildren> = ({ children }) => {
  const { getKetcherInstance } = useAppContext()
  const { show } = useContextMenu<ContextMenuShowProps>({
    id: CONTEXT_MENU_ID
  })

  const getSelectedFunctionalGroups = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor
    const struct = editor.struct()
    const selectedAtomIds = editor.selection()?.atoms
    // Map could do deduplication
    const selectedFunctionalGroups = new Map<number, FunctionalGroup>()

    selectedAtomIds?.forEach((atomId) => {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
        struct.functionalGroups,
        atomId,
        true
      )

      functionalGroup !== null &&
        selectedFunctionalGroups.set(
          functionalGroup.relatedSGroupId,
          functionalGroup
        )
    })

    return selectedFunctionalGroups
  }, [getKetcherInstance])

  const handleDisplay = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()

      const editor = getKetcherInstance().editor as Editor
      const closestItem = editor.findItem(event, null)
      const selection = editor.selection()
      const functionalGroupsInSelection = getSelectedFunctionalGroups()

      if (selection) {
        if (functionalGroupsInSelection.size > 0) {
          const functionalGroups = Array.from(
            functionalGroupsInSelection.values()
          )

          const showProps: ContextMenuShowProps = {
            type: 'for-functional-groups-in-selection',
            functionalGroups
          }

          show({
            event,
            props: showProps
          })
        } else {
          const showProps: ContextMenuShowProps = {
            type: 'for-bonds-and-atoms-in-selection'
          }

          show({
            event,
            props: showProps
          })
        }
      } else if (closestItem) {
        const struct = editor.struct()

        switch (closestItem.map) {
          case 'bonds':
            {
              const functionalGroup = FunctionalGroup.findFunctionalGroupByBond(
                struct,
                struct.functionalGroups,
                closestItem.id,
                true
              )

              const showProps: ContextMenuShowProps =
                functionalGroup === null
                  ? {
                      type: 'for-one-bond',
                      closestItem
                    }
                  : { type: 'for-one-functional-group', functionalGroup }

              show({
                event,
                props: showProps
              })
            }
            break

          case 'atoms': {
            const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
              struct.functionalGroups,
              closestItem.id,
              true
            )

            const showProps: ContextMenuShowProps =
              functionalGroup === null
                ? {
                    type: 'for-one-atom',
                    closestItem
                  }
                : { type: 'for-one-functional-group', functionalGroup }

            show({
              event,
              props: showProps
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

            const showProps: ContextMenuShowProps = {
              type: 'for-one-functional-group',
              functionalGroup
            }

            functionalGroup &&
              show({
                event,
                props: showProps
              })
            break
          }
        }
      }
      fixContextMenuPosition()
    },
    [getKetcherInstance, getSelectedFunctionalGroups, show]
  )

  return (
    <div style={{ height: '100%' }} onContextMenu={handleDisplay}>
      {children}
    </div>
  )
}

export default ContextMenuTrigger
