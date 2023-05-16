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
import { ContextMenuShowProps, CONTEXT_MENU_ID } from './contextMenu.types'
import { onlyHasProperty } from './utils'

const ContextMenuTrigger: React.FC<PropsWithChildren> = ({ children }) => {
  const { getKetcherInstance } = useAppContext()
  const { show } = useContextMenu<ContextMenuShowProps>()

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

      let showProps: ContextMenuShowProps = null

      if (selection && !selection.bonds && !selection.atoms) {
        return
      }

      if (closestItem) {
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

              showProps =
                functionalGroup === null
                  ? {
                      id: CONTEXT_MENU_ID.FOR_BONDS,
                      bondIds: [closestItem.id]
                    }
                  : {
                      id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
                      functionalGroups: [functionalGroup]
                    }
            }
            break

          case 'atoms': {
            const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
              struct.functionalGroups,
              closestItem.id,
              true
            )

            showProps =
              functionalGroup === null
                ? {
                    id: CONTEXT_MENU_ID.FOR_ATOMS,
                    atomIds: [closestItem.id]
                  }
                : {
                    id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
                    functionalGroups: [functionalGroup]
                  }
            break
          }

          case 'sgroups':
          case 'functionalGroups': {
            const sGroup = struct.sgroups.get(closestItem.id)
            const functionalGroup = FunctionalGroup.findFunctionalGroupBySGroup(
              struct.functionalGroups,
              sGroup
            )

            showProps = functionalGroup
              ? {
                  id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
                  functionalGroups: [functionalGroup]
                }
              : null
            break
          }
        }
      } else if (selection) {
        if (functionalGroupsInSelection.size > 0) {
          const functionalGroups = Array.from(
            functionalGroupsInSelection.values()
          )
          showProps = {
            id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
            functionalGroups
          }
        } else if (onlyHasProperty(selection, 'bonds')) {
          showProps = {
            id: CONTEXT_MENU_ID.FOR_BONDS,
            bondIds: selection.bonds
          }
        } else if (onlyHasProperty(selection, 'atoms')) {
          showProps = {
            id: CONTEXT_MENU_ID.FOR_ATOMS,
            atomIds: selection.atoms
          }
        } else {
          showProps = {
            id: CONTEXT_MENU_ID.FOR_SELECTION,
            bondIds: selection.bonds,
            atomIds: selection.atoms
          }
        }
      }

      showProps &&
        show({
          id: showProps.id,
          event,
          props: showProps
        })
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
