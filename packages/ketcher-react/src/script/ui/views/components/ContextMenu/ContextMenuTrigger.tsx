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
import { useCallback } from 'react'
import { useContextMenu } from 'react-contexify'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { CONTEXT_MENU_ID } from './ContextMenu'
import type { ContextMenuItemProps } from './contextMenu.types'

const ContextMenuTrigger: React.FC = ({ children }) => {
  const { getKetcherInstance } = useAppContext()
  const { show, hideAll } = useContextMenu<ContextMenuItemProps>({
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
  const hasConflictWithFunctionalGroupMenu = useCallback(
    (closestItem: any) => {
      const editor = getKetcherInstance().editor as Editor
      const struct = editor.struct()

      const functionalGroupId = FunctionalGroup.findFunctionalGroupByBond(
        struct,
        struct.functionalGroups,
        closestItem.id
      )
      const hasRelatedSGroup = struct.functionalGroups.some(
        (item) => item.relatedSGroupId === functionalGroupId
      )

      if (functionalGroupId !== null && hasRelatedSGroup) {
        return true
      }

      const selection = editor.selection()

      if (selection?.atoms) {
        const hasSelectedFunctionalGroup = selection.atoms.some((atomId) => {
          const functionalGroupId = FunctionalGroup.findFunctionalGroupByAtom(
            struct.functionalGroups,
            atomId
          )
          const hasRelatedSGroupId = struct.functionalGroups.some(
            (item) => item.relatedSGroupId === functionalGroupId
          )
          return functionalGroupId !== null && hasRelatedSGroupId
        })
        if (hasSelectedFunctionalGroup) {
          return true
        }
      }

      return false
    },
    [getKetcherInstance]
  )

  const handleDisplay = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      const editor = getKetcherInstance().editor as Editor
      const closestItem = editor.findItem(event, ['bonds'])

      if (!closestItem) {
        hideAll()
        return
      }

      if (hasConflictWithFunctionalGroupMenu(closestItem)) {
        hideAll()
        return
      }

      const selection = editor.selection()
      const isRightClickingSelection: number | undefined = selection?.[
        closestItem.map
      ]?.findIndex((selectedItemId) => selectedItemId === closestItem.id)

      if (
        isRightClickingSelection !== undefined &&
        isRightClickingSelection !== -1
      ) {
        // Show menu items for batch updates
        show({
          event,
          props: {
            selected: true,
            closestItem
          }
        })
      } else if (closestItem.map === 'bonds') {
        // Show menu items for single update
        if (selection) {
          editor.render.ctab.setSelection(null)
        }
        show({
          event,
          props: { selected: false, closestItem }
        })
      }
    },
    [getKetcherInstance, hasConflictWithFunctionalGroupMenu, hideAll, show]
  )

  return (
    <div style={{ height: '100%' }} onContextMenu={handleDisplay}>
      {children}
    </div>
  )
}

export default ContextMenuTrigger
