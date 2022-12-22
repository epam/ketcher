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

import { fromBondsAttrs, fromOneBondDeletion } from 'ketcher-core'
import { useCallback } from 'react'
import type { ItemParams, PredicateParams } from 'react-contexify'
import { Item, Submenu } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import styles from '../ContextMenu.module.less'
import type {
  ContextMenuItemData,
  ContextMenuItemProps
} from '../contextMenu.types'
import { formatTitle, getBondNames, noOperation } from './utils'

const bondNames = getBondNames(tools)

const BondSingleOperations: React.FC = (props) => {
  const { getKetcherInstance } = useAppContext()

  const handleEdit = useCallback(
    async ({
      props
    }: ItemParams<ContextMenuItemProps, ContextMenuItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondId = props?.closestItem.id
      const bond = editor.render.ctab.bonds.get(bondId)?.b

      try {
        const newBond = await editor.event.bondEdit.dispatch(bond)
        editor.update(fromBondsAttrs(editor.render.ctab, bondId, newBond))
      } catch (error) {
        noOperation()
      }
    },
    [getKetcherInstance]
  )

  const handleDelete = useCallback(
    ({ props }: ItemParams<ContextMenuItemProps, ContextMenuItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondId = props?.closestItem.id

      editor.update(fromOneBondDeletion(editor.render.ctab, bondId))
    },
    [getKetcherInstance]
  )

  const handleTypeChange = useCallback(
    ({ id, props }: ItemParams<ContextMenuItemProps, ContextMenuItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondId = props?.closestItem.id
      const bondProps = tools[id].action.opts

      editor.update(fromBondsAttrs(editor.render.ctab, bondId, bondProps))
    },
    [getKetcherInstance]
  )

  const isHidden = useCallback(
    ({ props }: PredicateParams<ContextMenuItemProps, ContextMenuItemData>) =>
      props?.selected || props?.closestItem.map === 'atoms',
    []
  )

  return (
    <>
      <Item hidden={isHidden} onClick={handleEdit} {...props}>
        Edit
      </Item>

      <Submenu
        label="Bond type"
        hidden={isHidden}
        className={styles.subMenu}
        {...props}
      >
        {bondNames.map((name) => (
          <Item id={name} onClick={handleTypeChange} key={name}>
            <Icon name={name} className={styles.icon} />
            <span>{formatTitle(tools[name].title)}</span>
          </Item>
        ))}
      </Submenu>

      <Item hidden={isHidden} onClick={handleDelete} {...props}>
        Delete
      </Item>
    </>
  )
}

export default BondSingleOperations
