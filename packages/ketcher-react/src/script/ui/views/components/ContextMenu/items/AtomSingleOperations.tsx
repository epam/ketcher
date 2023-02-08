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

import {
  findStereoAtoms,
  fromAtomsAttrs,
  fromOneAtomDeletion
} from 'ketcher-core'
import { useCallback } from 'react'
import type { ItemParams, PredicateParams } from 'react-contexify'
import { Item } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import EnhancedStereoTool from 'src/script/editor/tool/enhanced-stereo'
import type {
  ItemData,
  ContextMenuShowProps,
  CustomItemProps
} from '../contextMenu.types'
import { noOperation } from './utils'

const AtomSingleOperations: React.FC<CustomItemProps> = (properties) => {
  const { getKetcherInstance } = useAppContext()

  const handleEdit = useCallback(
    async ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const atomId = props?.closestItem.id
      const atom = editor.render.ctab.atoms.get(atomId)?.a

      try {
        const newAtom = await editor.event.elementEdit.dispatch(atom)
        editor.update(
          fromAtomsAttrs(editor.render.ctab, atomId, newAtom, false)
        )
      } catch (error) {
        noOperation()
      }
    },
    [getKetcherInstance]
  )

  const handleStereoEdit = useCallback(
    async ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      if (!props) {
        return
      }

      const editor = getKetcherInstance().editor as Editor
      const stereoAtomId: number = props.closestItem.id

      try {
        const action = await EnhancedStereoTool.changeAtomsStereoAction(
          editor,
          [stereoAtomId]
        )

        action && editor.update(action)
      } catch (error) {
        noOperation()
      }
    },
    [getKetcherInstance]
  )

  const handleDelete = useCallback(
    ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const atomId = props?.closestItem.id
      editor.update(fromOneAtomDeletion(editor.render.ctab, atomId))
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

      if (!props) {
        return true
      }

      const editor = getKetcherInstance().editor as Editor
      const stereoAtoms: undefined | number[] = findStereoAtoms(
        editor.struct(),
        [props.closestItem.id]
      )

      if (Array.isArray(stereoAtoms) && stereoAtoms.length !== 0) {
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

      <Item {...properties} onClick={handleDelete}>
        Delete
      </Item>
    </>
  )
}

export default AtomSingleOperations
