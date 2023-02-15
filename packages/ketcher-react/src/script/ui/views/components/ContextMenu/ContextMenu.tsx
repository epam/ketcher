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

import { Menu, MenuProps } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import styles from './ContextMenu.module.less'
import { CONTEXT_MENU_ID } from './contextMenu.types'
import AtomMenuItems from './menuItems/AtomMenuItems'
import BondMenuItems from './menuItems/BondMenuItems'
import FunctionalGroupMenuItems from './menuItems/FunctionalGroupMenuItems'
import SelectionMenuItems from './menuItems/SelectionMenuItems'

const props: Partial<MenuProps> = {
  animation: false,
  className: styles.contextMenu
}

const ContextMenu: React.FC = () => {
  return (
    <>
      <Menu {...props} id={CONTEXT_MENU_ID.FOR_BONDS}>
        <BondMenuItems />
      </Menu>

      <Menu {...props} id={CONTEXT_MENU_ID.FOR_ATOMS}>
        <AtomMenuItems />
      </Menu>

      <Menu {...props} id={CONTEXT_MENU_ID.FOR_SELECTION}>
        <SelectionMenuItems />
      </Menu>

      <Menu {...props} id={CONTEXT_MENU_ID.FOR_FUNCTIONAL_GROUPS}>
        <FunctionalGroupMenuItems />
      </Menu>
    </>
  )
}

export default ContextMenu
