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

import { Action, fromBondsAttrs, fromOneBondDeletion } from 'ketcher-core'
import { useCallback } from 'react'
import type { ItemParams, PredicateParams } from 'react-contexify'
import { Item, Menu, Submenu } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import styles from './ContextMenu.module.less'

export const CONTEXT_MENU_ID = 'KeTcHeR-CoNtExT-MeNu'
const bondTools = Object.keys(tools).filter((key) => key.startsWith('bond-'))

export interface ContextMenuItemProps {
  selected: boolean
  ci: any
}
type ItemData = unknown

const ContextMenu: React.FC = () => {
  const { getKetcherInstance } = useAppContext()

  const handleEdit = useCallback(
    async ({ props }: ItemParams<ContextMenuItemProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondId = props?.ci.id
      const bond = editor.render.ctab.bonds.get(bondId)?.b

      try {
        const newBond = await editor.event.bondEdit.dispatch(bond)
        editor.update(fromBondsAttrs(editor.render.ctab, bondId, newBond))
      } catch (error) {
        console.error(error)
      }
    },
    [getKetcherInstance]
  )

  const handleBatchEdit = useCallback(
    async ({ props }: ItemParams<ContextMenuItemProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondId = props?.ci.id
      const bond = editor.render.ctab.bonds.get(bondId)?.b

      try {
        const newBond = await editor.event.bondEdit.dispatch(bond)
        const action = new Action()
        const selectedBonds = editor.selection()?.bonds

        selectedBonds?.forEach((selectedBondId) => {
          action.mergeWith(
            fromBondsAttrs(editor.render.ctab, selectedBondId, newBond)
          )
        })

        editor.update(action)
      } catch (error) {
        console.error(error)
      }
    },
    [getKetcherInstance]
  )

  const handleDelete = useCallback(
    async ({ props }: ItemParams<ContextMenuItemProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondId = props?.ci.id

      editor.update(fromOneBondDeletion(editor.render.ctab, bondId))
    },
    [getKetcherInstance]
  )

  const handleBatchDelete = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor
    const action = new Action()
    const selectedBonds = editor.selection()?.bonds

    selectedBonds?.forEach((bondId) => {
      action.mergeWith(fromOneBondDeletion(editor.render.ctab, bondId))
    })

    editor.update(action)
  }, [getKetcherInstance])

  const handleTypeChange = useCallback(
    ({ id, props }: ItemParams<ContextMenuItemProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondId = props?.ci.id
      const bondProps = tools[id].action.opts

      editor.update(fromBondsAttrs(editor.render.ctab, bondId, bondProps))
    },
    [getKetcherInstance]
  )

  const handleBatchTypeChange = useCallback(
    ({ id }: ItemParams<ContextMenuItemProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const action = new Action()
      const selectedBonds = editor.selection()?.bonds
      const bondProps = tools[id].action.opts

      selectedBonds?.forEach((bondId) => {
        action.mergeWith(fromBondsAttrs(editor.render.ctab, bondId, bondProps))
      })

      editor.update(action)
    },
    [getKetcherInstance]
  )

  const isHidden = ({
    props
  }: PredicateParams<ContextMenuItemProps, ItemData>) => !!props?.selected
  const isBatchOpHidden = ({
    props
  }: PredicateParams<ContextMenuItemProps, ItemData>) => !props?.selected

  return (
    <Menu id={CONTEXT_MENU_ID} animation={false} className={styles.contextMenu}>
      {/** ****** Menu items for single update: ********/}
      <Item hidden={isHidden} onClick={handleEdit}>
        Edit
      </Item>

      <Submenu label="Bond type" hidden={isHidden} className={styles.subMenu}>
        {bondTools.map((name) => (
          <Item id={name} onClick={handleTypeChange} key={name}>
            <Icon name={name} className={styles.icon} />
            <span>{tools[name].title}</span>
          </Item>
        ))}
      </Submenu>

      <Item hidden={isHidden} onClick={handleDelete}>
        Delete
      </Item>

      {/** ****** Menu items for Batch updates: ********/}
      <Item hidden={isBatchOpHidden} onClick={handleBatchEdit}>
        Edit selected bond(s)
      </Item>

      <Submenu
        label="Bond type"
        hidden={isBatchOpHidden}
        className={styles.subMenu}
      >
        {bondTools.map((name) => (
          <Item id={name} onClick={handleBatchTypeChange} key={name}>
            <Icon name={name} className={styles.icon} />
            <span>{tools[name].title}</span>
          </Item>
        ))}
      </Submenu>

      <Item hidden={isBatchOpHidden} onClick={handleBatchDelete}>
        Delete selected bond(s)
      </Item>
    </Menu>
  )
}

export default ContextMenu
