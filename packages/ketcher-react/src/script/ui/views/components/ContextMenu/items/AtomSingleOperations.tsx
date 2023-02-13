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
import type { ItemParams, PredicateParams } from 'react-contexify'
import { Item } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import EnhancedStereoTool from 'src/script/editor/tool/enhanced-stereo'
import { mapAtomIdsToAtoms } from 'src/script/editor/tool/select'
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms'
import type {
  ItemData,
  ContextMenuShowProps,
  CustomItemProps
} from '../contextMenu.types'
import { noOperation } from './utils'

const AtomSingleOperations: React.FC<CustomItemProps> = (properties) => {
  const { getKetcherInstance } = useAppContext()
  const stereoAtomIdsRef = useRef<number[] | undefined>()

  const handleEdit = useCallback(
    async ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const molecule = editor.render.ctab
      const atomIds = props?.atomIds || []
      const atoms = mapAtomIdsToAtoms(atomIds, molecule)

      const newAtom = editor.event.elementEdit.dispatch(atoms)

      updateSelectedAtoms({
        selection: { atoms },
        changeAtomPromise: newAtom,
        editor
      })
    },
    [getKetcherInstance]
  )

  const handleStereoEdit = useCallback(
    async ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      if (!props || !stereoAtomIdsRef.current) {
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
    },
    [getKetcherInstance]
  )

  const isStereoDisabled = useCallback(
    ({
      props,
      triggerEvent,
      data
    }: PredicateParams<ContextMenuShowProps, ItemData>) => {
      if (properties.hidden({ props, triggerEvent, data })) {
        return true
      }

      const editor = getKetcherInstance().editor as Editor
      const stereoAtomIds: undefined | number[] = findStereoAtoms(
        editor.struct(),
        props?.atomIds
      )
      stereoAtomIdsRef.current = stereoAtomIds

      if (Array.isArray(stereoAtomIds) && stereoAtomIds.length !== 0) {
        return false
      }

      return true
    },
    [getKetcherInstance, properties]
  )

  return (
    <>
      <Item {...properties} onClick={handleEdit}>
        Edit...
      </Item>

      <Item
        {...properties}
        disabled={isStereoDisabled}
        onClick={handleStereoEdit}
      >
        Enhanced stereochemistry...
      </Item>
      {/* 
      <Item {...properties} onClick={handleDelete}>
        Delete
      </Item> */}
    </>
  )
}

export default AtomSingleOperations
