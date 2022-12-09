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
import { Item, Submenu } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import type {
  ContextMenuItemData,
  ContextMenuItemProps
} from '../contextMenu.types'
import styles from '../ContextMenu.module.less'

const bondTools = Object.keys(tools).filter((key) => key.startsWith('bond-'))

const BondBatchOperations: React.FC = (props) => {
  const { getKetcherInstance } = useAppContext()

  const handleBatchEdit = useCallback(
    async ({
      props
    }: ItemParams<ContextMenuItemProps, ContextMenuItemData>) => {
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

  const handleBatchDelete = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor
    const action = new Action()
    const selectedBonds = editor.selection()?.bonds

    selectedBonds?.forEach((bondId) => {
      action.mergeWith(fromOneBondDeletion(editor.render.ctab, bondId))
    })

    editor.update(action)
  }, [getKetcherInstance])

  const handleBatchTypeChange = useCallback(
    ({ id }: ItemParams<ContextMenuItemProps, ContextMenuItemData>) => {
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
  }: PredicateParams<ContextMenuItemProps, ContextMenuItemData>) =>
    !props?.selected

  return (
    <>
      <Item hidden={isHidden} onClick={handleBatchEdit} {...props}>
        Edit selected bond(s)
      </Item>

      <Submenu
        label="Bond type"
        hidden={isHidden}
        className={styles.subMenu}
        {...props}
      >
        {bondTools.map((name) => (
          <Item id={name} onClick={handleBatchTypeChange} key={name}>
            <Icon name={name} className={styles.icon} />
            <span>{tools[name].title}</span>
          </Item>
        ))}
      </Submenu>

      <Item hidden={isHidden} onClick={handleBatchDelete} {...props}>
        Delete selected bond(s)
      </Item>
    </>
  )
}

export default BondBatchOperations
