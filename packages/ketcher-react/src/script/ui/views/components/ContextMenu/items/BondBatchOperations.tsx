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
import type {
  BooleanPredicate,
  ItemParams,
  PredicateParams
} from 'react-contexify'
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
  CustomItemProps
} from '../contextMenu.types'
import { formatTitle, getBondNames, noOperation } from './utils'

const bondNames = getBondNames(tools)

const useDisabled = (hidden?: BooleanPredicate) => {
  const { getKetcherInstance } = useAppContext()

  const isDisabled = useCallback(
    ({
      props,
      triggerEvent,
      data
    }: PredicateParams<ContextMenuShowProps, ItemData>) => {
      if (
        typeof hidden === 'boolean'
          ? hidden
          : hidden?.({ props, triggerEvent, data })
      ) {
        return true
      }

      const editor = getKetcherInstance().editor as Editor
      const selectedBondIds = editor.selection()?.bonds

      if (Array.isArray(selectedBondIds) && selectedBondIds.length !== 0) {
        return false
      }

      return true
    },
    [getKetcherInstance, hidden]
  )

  return isDisabled
}

export const BondBatchEdit: React.FC<CustomItemProps> = (props) => {
  const { getKetcherInstance } = useAppContext()
  const isDisabled = useDisabled(props.hidden)

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
    <Item {...props} disabled={isDisabled} onClick={handleClick}>
      Edit selected bond(s)...
    </Item>
  )
}

export const BondTypeBatchChange: React.FC<CustomItemProps> = (properties) => {
  const { getKetcherInstance } = useAppContext()

  const isSubMenuHidden = useCallback(
    ({ props }: PredicateParams<ContextMenuShowProps, ItemData>) =>
      props?.type !== properties.data,
    [properties.data]
  )

  const isDisabled = useDisabled(isSubMenuHidden)

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
      {...properties}
      label="Bond type"
      hidden={isSubMenuHidden}
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
