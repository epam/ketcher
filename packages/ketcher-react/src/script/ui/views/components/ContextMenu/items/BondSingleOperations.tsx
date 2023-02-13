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
import type { ItemParams } from 'react-contexify'
import { Item, Submenu } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import styles from '../ContextMenu.module.less'
import type { ItemData, ContextMenuShowProps } from '../contextMenu.types'
import {
  formatTitle,
  getNonQueryBondNames,
  noOperation,
  queryBondNames
} from './utils'

const nonQueryBondNames = getNonQueryBondNames(tools)

const BondSingleOperations: React.FC = (props) => {
  const { getKetcherInstance } = useAppContext()

  const handleEdit = useCallback(
    async ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondIds = props?.bondIds || []
      const bond = editor.render.ctab.bonds.get(bondIds[0])?.b

      try {
        const newBond = await editor.event.bondEdit.dispatch(bond)
        editor.update(fromBondsAttrs(editor.render.ctab, bondIds, newBond))
      } catch (error) {
        noOperation()
      }
    },
    [getKetcherInstance]
  )

  const handleTypeChange = useCallback(
    ({ id, props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const bondIds = props?.bondIds || []
      const bondProps = tools[id].action.opts

      editor.update(fromBondsAttrs(editor.render.ctab, bondIds, bondProps))
    },
    [getKetcherInstance]
  )

  return (
    <>
      <Item {...props} onClick={handleEdit}>
        Edit...
      </Item>

      {nonQueryBondNames.map((name) => (
        <Item {...props} id={name} onClick={handleTypeChange} key={name}>
          <Icon name={name} className={styles.icon} />
          <span>{formatTitle(tools[name].title)}</span>
        </Item>
      ))}

      <Submenu {...props} label="Query bonds" className={styles.subMenu}>
        {queryBondNames.map((name) => (
          <Item id={name} onClick={handleTypeChange} key={name}>
            <Icon name={name} className={styles.icon} />
            <span>{formatTitle(tools[name].title)}</span>
          </Item>
        ))}
      </Submenu>
      {/* 
      <Item {...properties} onClick={handleDelete}>
        Delete
      </Item> */}
    </>
  )
}

export default BondSingleOperations
