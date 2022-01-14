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

import ArrowDownIcon from './files/arrowDown.svg'
import BracketIcon from './files/bracket.svg'
import CheckMarkIcon from './files/checkmark.svg'
import ChevronIcon from './files/chevron.svg'
import CopyIcon from './files/copy.svg'
import DividerIcon from './files/divider.svg'
import DropDownIcon from './files/dropdown.svg'
import EraseIcon from './files/erase.svg'
import HelpIcon from './files/help.svg'
import OpenIcon from './files/open.svg'
import RapLeftLinkIcon from './files/rapLeftLink.svg'
import RapMiddleLinkIcon from './files/rapMiddleLink.svg'
import RapRightLinkIcon from './files/rapRightLink.svg'
import RedoIcon from './files/redo.svg'
import RectangleIcon from './files/rectangle.svg'
import SelectLassoIcon from './files/select-lasso.svg'
import SettingsIcon from './files/settings.svg'
import StarIcon from './files/star.svg'
import SingleBondIcon from './files/single-bond.svg'
import UndoIcon from './files/undo.svg'

const icons = {
  arrowDown: ArrowDownIcon,
  bracket: BracketIcon,
  checkmark: CheckMarkIcon,
  chevron: ChevronIcon,
  copy: CopyIcon,
  divider: DividerIcon,
  dropdown: DropDownIcon,
  erase: EraseIcon,
  help: HelpIcon,
  open: OpenIcon,
  rapLeftLink: RapLeftLinkIcon,
  rapMiddleLink: RapMiddleLinkIcon,
  rapRightLink: RapRightLinkIcon,
  redo: RedoIcon,
  rectangle: RectangleIcon,
  'select-lasso': SelectLassoIcon,
  settings: SettingsIcon,
  star: StarIcon,
  'single-bond': SingleBondIcon,
  undo: UndoIcon
}

type AllowedNames = keyof typeof icons

const getIconByName = (name: AllowedNames) => {
  // SVG imports handled by SVGR are typed as String, so we need to explicitly set correct type
  return icons[name] as unknown as React.VFC<React.SVGProps<SVGSVGElement>>
}

export type { AllowedNames }
export { getIconByName }
