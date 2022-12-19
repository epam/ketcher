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

import { Menu } from 'react-contexify'
import 'react-contexify/ReactContexify.css'
import styles from './ContextMenu.module.less'
import BondBatchOperations from './items/BondBatchOperations'
import BondSingleOperations from './items/BondSingleOperations'

export const CONTEXT_MENU_ID = 'ketcherBondContextMenu'

const ContextMenu: React.FC = () => {
  return (
    <Menu id={CONTEXT_MENU_ID} animation={false} className={styles.contextMenu}>
      <BondSingleOperations />
      <BondBatchOperations />
    </Menu>
  )
}

export default ContextMenu
