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
  ContextMenuItemData,
  ContextMenuItemProps
} from '../contextMenu.types'
import { noOperation } from './utils'

const AtomSingleOperations: React.FC = (props) => {
  const { getKetcherInstance } = useAppContext()

  const handleEdit = useCallback(
    async ({
      props
    }: ItemParams<ContextMenuItemProps, ContextMenuItemData>) => {
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
    async ({
      props
    }: ItemParams<ContextMenuItemProps, ContextMenuItemData>) => {
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
    ({ props }: ItemParams<ContextMenuItemProps, ContextMenuItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const atomId = props?.closestItem.id
      editor.update(fromOneAtomDeletion(editor.render.ctab, atomId))
    },
    [getKetcherInstance]
  )

  const isHidden = useCallback(
    ({ props }: PredicateParams<ContextMenuItemProps, ContextMenuItemData>) =>
      props?.selected || props?.closestItem.map === 'bonds',
    []
  )

  const isStereoDisabled = useCallback(
    ({
      props,
      triggerEvent
    }: PredicateParams<ContextMenuItemProps, ContextMenuItemData>) => {
      if (!props || isHidden({ props, triggerEvent })) {
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
    [getKetcherInstance, isHidden]
  )

  return (
    <>
      <Item hidden={isHidden} onClick={handleEdit} {...props}>
        Edit
      </Item>

      <Item
        hidden={isHidden}
        disabled={isStereoDisabled}
        onClick={handleStereoEdit}
        {...props}
      >
        Enhanced stereochemistry
      </Item>

      <Item hidden={isHidden} onClick={handleDelete} {...props}>
        Delete
      </Item>
    </>
  )
}

export default AtomSingleOperations
