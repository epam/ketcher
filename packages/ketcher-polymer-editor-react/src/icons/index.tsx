/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import BracketIcon from './files/bracket.svg'
import DividerIcon from './files/divider.svg'
import DropDownIcon from './files/dropdown.svg'
import EraseIcon from './files/erase.svg'
import HelpIcon from './files/help.svg'
import OpenIcon from './files/open.svg'
import RedoIcon from './files/redo.svg'
import RectangleIcon from './files/rectangle.svg'
import SelectLassoIcon from './files/select-lasso.svg'
import SettingsIcon from './files/settings.svg'
import SingleBondIcon from './files/single-bond.svg'
import UndoIcon from './files/undo.svg'

const icons = {
  bracket: BracketIcon,
  divider: DividerIcon,
  dropdown: DropDownIcon,
  erase: EraseIcon,
  help: HelpIcon,
  open: OpenIcon,
  redo: RedoIcon,
  rectangle: RectangleIcon,
  'select-lasso': SelectLassoIcon,
  settings: SettingsIcon,
  'single-bond': SingleBondIcon,
  undo: UndoIcon
}

function emptyIcon() {
  return null
}

export default function findIconByName(name) {
  if (name && icons.hasOwnProperty(name)) {
    const component = icons[name]
    return component
  } else {
    return emptyIcon
  }
}
