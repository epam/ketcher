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

import { fromBondsAttrs } from 'ketcher-core'
import { useCallback } from 'react'
import type { ItemParams, PredicateParams } from 'react-contexify'
import { Item, Submenu } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import { toBondType } from 'src/script/ui/data/convert/structconv'
import styles from '../ContextMenu.module.less'
import type {
  ItemData,
  ContextMenuShowProps,
  CustomItemProps,
  CustomSubMenuProps
} from '../contextMenu.types'
import {
  formatTitle,
  getBondNames,
  noOperation,
  isBatchOperationHidden
} from './utils'

const bondNames = getBondNames(tools)

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
      const selectedBondIds = editor.selection()?.bonds

      if (Array.isArray(selectedBondIds) && selectedBondIds.length !== 0) {
        return false
      }

      return true
    },
    [getKetcherInstance]
  )

  return isDisabled
}

export const BondBatchEdit: React.FC<CustomItemProps> = (props) => {
  const { getKetcherInstance } = useAppContext()
  const isDisabled = useDisabled()

  const handleClick = useCallback(async () => {
    const editor = getKetcherInstance().editor as Editor
    const defaultBond = toBondType('single')

    try {
      const newBond = await editor.event.bondEdit.dispatch(defaultBond)
      const selectedBonds = editor.selection()?.bonds

      selectedBonds &&
        editor.update(
          fromBondsAttrs(editor.render.ctab, selectedBonds, newBond)
        )
    } catch (error) {
      noOperation()
    }
  }, [getKetcherInstance])

  return (
    <Item
      {...props}
      hidden={isBatchOperationHidden}
      disabled={isDisabled}
      onClick={handleClick}
    >
      Edit selected bond(s)...
    </Item>
  )
}

export const BondTypeBatchChange: React.FC<CustomSubMenuProps> = (props) => {
  const { getKetcherInstance } = useAppContext()
  const isDisabled = useDisabled()

  const handleClick = useCallback(
    ({ id }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const selectedBonds = editor.selection()?.bonds
      const bondProps = tools[id].action.opts

      selectedBonds &&
        editor.update(
          fromBondsAttrs(editor.render.ctab, selectedBonds, bondProps)
        )
    },
    [getKetcherInstance]
  )

  return (
    <Submenu
      {...props}
      label="Bond type"
      hidden={isBatchOperationHidden}
      disabled={isDisabled}
      className={styles.subMenu}
    >
      {bondNames.map((name) => (
        <Item id={name} onClick={handleClick} key={name}>
          <Icon name={name} className={styles.icon} />
          <span>{formatTitle(tools[name].title)}</span>
        </Item>
      ))}
    </Submenu>
  )
}
