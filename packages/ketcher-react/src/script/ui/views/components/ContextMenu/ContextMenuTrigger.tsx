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
import {
  ClosestItem,
  CONTEXT_MENU_ID,
  ContextMenuShowProps,
  ContextMenuTriggerType,
  GetIsItemInSelectionArgs
} from './contextMenu.types'
import { onlyHasProperty } from './utils'
import { Selection } from '../../../../editor/Editor'

const ContextMenuTrigger: React.FC<PropsWithChildren> = ({ children }) => {
  const { getKetcherInstance } = useAppContext()
  const { show } = useContextMenu<ContextMenuShowProps>()

  const getSelectedFunctionalGroups = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor
    const struct = editor.struct()
    const selectedAtomIds = editor.selection()?.atoms
    // Map and Set can do deduplication
    const selectedFunctionalGroups = new Map<number, FunctionalGroup>()
    const selectedSGroupsIds: Set<number> = new Set()

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

      const sGroupId = struct.sgroups.find((_, sGroup) =>
        sGroup.atoms.includes(atomId)
      )

      sGroupId !== null && selectedSGroupsIds.add(sGroupId)
    })

    return {
      selectedFunctionalGroups,
      selectedSGroupsIds
    }
  }, [getKetcherInstance])

  const handleDisplay = useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (event) => {
      event.preventDefault()

      const editor = getKetcherInstance().editor as Editor
      const closestItem = editor.findItem(event, null)
      const selection = editor.selection()
      const { selectedFunctionalGroups, selectedSGroupsIds } =
        getSelectedFunctionalGroups()

      let showProps: ContextMenuShowProps = null
      let triggerType: ContextMenuTriggerType

      if (!closestItem) {
        if (selection) {
          editor.selection(null)
        }
        return
      } else if (!selection) {
        triggerType = ContextMenuTriggerType.ClosestItem
      } else if (
        getIsItemInSelection({
          item: closestItem,
          selection,
          selectedFunctionalGroups,
          selectedSGroupsIds
        })
      ) {
        if (!selection.bonds && !selection.atoms) {
          triggerType = ContextMenuTriggerType.None
        } else {
          triggerType = ContextMenuTriggerType.Selection
        }
      } else {
        // closestItem is outside of selection
        editor.selection(null)
        triggerType = ContextMenuTriggerType.ClosestItem
      }

      switch (triggerType) {
        case ContextMenuTriggerType.None: {
          return
        }

        case ContextMenuTriggerType.ClosestItem: {
          showProps = getMenuPropsForClosestItem(editor, closestItem)
          break
        }

        case ContextMenuTriggerType.Selection: {
          showProps = getMenuPropsForSelection(
            selection,
            selectedFunctionalGroups
          )
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

const getIsItemInSelection = ({
  item,
  selection,
  selectedSGroupsIds,
  selectedFunctionalGroups
}: GetIsItemInSelectionArgs): boolean => {
  if (!item || !selection) {
    return false
  }

  switch (item.map) {
    case 'sgroups':
      return selectedSGroupsIds.has(item.id)

    case 'functionalGroups':
      return Array.from(selectedFunctionalGroups.keys()).includes(item.id)

    default:
      return (
        item.map in selection &&
        Array.isArray(selection[item.map]) &&
        selection[item.map].includes(item.id)
      )
  }
}

function getMenuPropsForClosestItem(
  editor: Editor,
  closestItem: ClosestItem
): ContextMenuShowProps | null {
  const struct = editor.struct()

  switch (closestItem.map) {
    case 'bonds': {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByBond(
        struct,
        struct.functionalGroups,
        closestItem.id,
        true
      )

      return functionalGroup === null
        ? {
            id: CONTEXT_MENU_ID.FOR_BONDS,
            bondIds: [closestItem.id]
          }
        : {
            id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
            functionalGroups: [functionalGroup]
          }
    }

    case 'atoms': {
      const functionalGroup = FunctionalGroup.findFunctionalGroupByAtom(
        struct.functionalGroups,
        closestItem.id,
        true
      )

      return functionalGroup === null
        ? {
            id: CONTEXT_MENU_ID.FOR_ATOMS,
            atomIds: [closestItem.id]
          }
        : {
            id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
            functionalGroups: [functionalGroup]
          }
    }

    case 'sgroups':
    case 'functionalGroups': {
      const sGroup = struct.sgroups.get(closestItem.id)
      const functionalGroup = FunctionalGroup.findFunctionalGroupBySGroup(
        struct.functionalGroups,
        sGroup
      )

      return functionalGroup
        ? {
            id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
            functionalGroups: [functionalGroup]
          }
        : null
    }

    default:
      return null
  }
}

function getMenuPropsForSelection(
  selection: Selection | null,
  selectedFunctionalGroups: Map<number, FunctionalGroup>
): ContextMenuShowProps | null {
  if (!selection) {
    return null
  }
  if (selectedFunctionalGroups.size > 0) {
    const functionalGroups = Array.from(selectedFunctionalGroups.values())
    return {
      id: CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS,
      functionalGroups
    }
  } else if (onlyHasProperty(selection, 'bonds')) {
    return {
      id: CONTEXT_MENU_ID.FOR_BONDS,
      bondIds: selection.bonds
    }
  } else if (onlyHasProperty(selection, 'atoms')) {
    return {
      id: CONTEXT_MENU_ID.FOR_ATOMS,
      atomIds: selection.atoms
    }
  } else {
    return {
      id: CONTEXT_MENU_ID.FOR_SELECTION,
      bondIds: selection.bonds,
      atomIds: selection.atoms
    }
  }
}

export default ContextMenuTrigger
