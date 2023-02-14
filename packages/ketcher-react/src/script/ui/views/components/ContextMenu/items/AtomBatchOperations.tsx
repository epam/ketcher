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

import { findStereoAtoms } from 'ketcher-core'
import { useCallback, useRef } from 'react'
import type { PredicateParams } from 'react-contexify'
import { Item } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import EnhancedStereoTool from 'src/script/editor/tool/enhanced-stereo'
import { getSelectedAtoms } from 'src/script/editor/tool/select'
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms'
import type {
  ItemData,
  ContextMenuShowProps,
  CustomItemProps
} from '../contextMenu.types'
import { noOperation, isBatchOperationHidden } from './utils'

const useDisabled = () => {
  const { getKetcherInstance } = useAppContext()

  const isDisabled = useCallback(
    ({
      props,
      triggerEvent
    }: PredicateParams<ContextMenuShowProps, ItemData>) => {
      if (isBatchOperationHidden({ props, triggerEvent })) {
        return true
      }

      const editor = getKetcherInstance().editor as Editor
      const selectedAtomIds = editor.selection()?.atoms

      if (Array.isArray(selectedAtomIds) && selectedAtomIds.length !== 0) {
        return false
      }

      return true
    },
    [getKetcherInstance]
  )

  return isDisabled
}

export const AtomBatchEdit: React.FC<CustomItemProps> = (props) => {
  const { getKetcherInstance } = useAppContext()
  const isDisabled = useDisabled()

  const handleClick = useCallback(async () => {
    const editor = getKetcherInstance().editor as Editor
    const molecule = editor.render.ctab
    const selection = editor.selection()
    const selectedAtoms = getSelectedAtoms(selection, molecule)

    const newAtom = editor.event.elementEdit.dispatch(selectedAtoms)
    updateSelectedAtoms({
      selection,
      changeAtomPromise: newAtom,
      editor
    })
  }, [getKetcherInstance])

  return (
    <Item
      {...props}
      hidden={isBatchOperationHidden}
      disabled={isDisabled}
      onClick={handleClick}
    >
      Edit selected atom(s)...
    </Item>
  )
}

export const AtomStereoBatchEdit: React.FC<CustomItemProps> = (props) => {
  const { getKetcherInstance } = useAppContext()
  const isDisabled = useDisabled()
  const stereoAtomIdsRef = useRef<number[] | undefined>()

  const handleClick = useCallback(async () => {
    if (!stereoAtomIdsRef.current) {
      return
    }

    const editor = getKetcherInstance().editor as Editor

    try {
      const action = await EnhancedStereoTool.changeAtomsStereoAction(
        editor,
        stereoAtomIdsRef.current
      )

      action && editor.update(action)
    } catch (error) {
      noOperation()
    }
  }, [getKetcherInstance])

  const isStereoDisabled = useCallback(
    ({
      props,
      triggerEvent
    }: PredicateParams<ContextMenuShowProps, ItemData>) => {
      if (isDisabled({ props, triggerEvent })) {
        return true
      }
      const editor = getKetcherInstance().editor as Editor
      const selectedAtomIds = editor.selection()?.atoms

      const stereoAtomIds: undefined | number[] = findStereoAtoms(
        editor.struct(),
        selectedAtomIds
      )
      stereoAtomIdsRef.current = stereoAtomIds

      if (Array.isArray(stereoAtomIds) && stereoAtomIds.length !== 0) {
        return false
      }

      return true
    },
    [getKetcherInstance, isDisabled]
  )

  return (
    <Item
      {...props}
      hidden={isBatchOperationHidden}
      disabled={isStereoDisabled}
      onClick={handleClick}
    >
      Enhanced stereochemistry...
    </Item>
  )
}
