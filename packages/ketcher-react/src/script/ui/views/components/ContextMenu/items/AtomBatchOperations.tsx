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
  Action,
  findStereoAtoms,
  fromAtomsAttrs,
  fromOneAtomDeletion
} from 'ketcher-core'
import { useCallback, useRef } from 'react'
import type { PredicateParams } from 'react-contexify'
import { Item } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import EnhancedStereoTool from 'src/script/editor/tool/enhanced-stereo'
import { toElement } from 'src/script/ui/data/convert/structconv'
import type {
  ItemData,
  ContextMenuShowProps,
  CustomItemProps
} from '../contextMenu.types'
import { noOperation } from './utils'

const isHidden = ({ props }: PredicateParams<ContextMenuShowProps, ItemData>) =>
  !props?.selected

const useDisabled = () => {
  const { getKetcherInstance } = useAppContext()

  const isDisabled = useCallback(
    ({
      props,
      triggerEvent
    }: PredicateParams<ContextMenuShowProps, ItemData>) => {
      if (isHidden({ props, triggerEvent })) {
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
    const defaultAtom = toElement({
      label: 'C',
      charge: 0,
      isotope: 0,
      explicitValence: -1,
      radical: 0,
      invRet: 0,
      ringBondCount: 0,
      substitutionCount: 0,
      hCount: 0,
      stereoParity: 0
    })

    try {
      const newAtom = await editor.event.elementEdit.dispatch(defaultAtom)
      const selectedAtomIds = editor.selection()?.atoms

      editor.update(
        fromAtomsAttrs(editor.render.ctab, selectedAtomIds, newAtom, false)
      )
    } catch (error) {
      noOperation()
    }
  }, [getKetcherInstance])

  return (
    <Item
      {...props}
      hidden={isHidden}
      disabled={isDisabled}
      onClick={handleClick}
    >
      Edit selected atom(s)
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
      hidden={isHidden}
      disabled={isStereoDisabled}
      onClick={handleClick}
    >
      Enhanced stereochemistry
    </Item>
  )
}

export const AtomBatchDelete: React.FC<CustomItemProps> = (props) => {
  const { getKetcherInstance } = useAppContext()
  const isDisabled = useDisabled()

  const handleClick = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor
    const action = new Action()
    const selectedAtomIds = editor.selection()?.atoms

    selectedAtomIds?.forEach((atomId) => {
      action.mergeWith(fromOneAtomDeletion(editor.render.ctab, atomId))
    })

    editor.update(action)
  }, [getKetcherInstance])

  return (
    <Item
      {...props}
      hidden={isHidden}
      disabled={isDisabled}
      onClick={handleClick}
    >
      Delete selected atom(s)
    </Item>
  )
}
