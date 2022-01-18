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

import { useTheme } from '@emotion/react'

import ArrowDownIcon from 'assets/icons/files/arrow-down.svg'
import BracketIcon from 'assets/icons/files/bracket.svg'
import CheckMarkIcon from 'assets/icons/files/checkmark.svg'
import ChevronIcon from 'assets/icons/files/chevron.svg'
import CopyIcon from 'assets/icons/files/copy.svg'
import DividerIcon from 'assets/icons/files/divider.svg'
import DropDownIcon from 'assets/icons/files/dropdown.svg'
import EraseIcon from 'assets/icons/files/erase.svg'
import HelpIcon from 'assets/icons/files/help.svg'
import OpenIcon from 'assets/icons/files/open.svg'
import RapLeftLinkIcon from 'assets/icons/files/rap-left-link.svg'
import RapMiddleLinkIcon from 'assets/icons/files/rap-middle-link.svg'
import RapRightLinkIcon from 'assets/icons/files/rap-right-link.svg'
import RedoIcon from 'assets/icons/files/redo.svg'
import RectangleIcon from 'assets/icons/files/rectangle.svg'
import SelectLassoIcon from 'assets/icons/files/select-lasso.svg'
import SettingsIcon from 'assets/icons/files/settings.svg'
import StarIcon from 'assets/icons/files/star.svg'
import SingleBondIcon from 'assets/icons/files/single-bond.svg'
import UndoIcon from 'assets/icons/files/undo.svg'

const iconMap = {
  'arrow-down': ArrowDownIcon,
  bracket: BracketIcon,
  checkmark: CheckMarkIcon,
  chevron: ChevronIcon,
  copy: CopyIcon,
  divider: DividerIcon,
  dropdown: DropDownIcon,
  erase: EraseIcon,
  help: HelpIcon,
  open: OpenIcon,
  'rap-left-link': RapLeftLinkIcon,
  'rap-middle-link': RapMiddleLinkIcon,
  'rap-right-link': RapRightLinkIcon,
  redo: RedoIcon,
  rectangle: RectangleIcon,
  'select-lasso': SelectLassoIcon,
  settings: SettingsIcon,
  star: StarIcon,
  'single-bond': SingleBondIcon,
  undo: UndoIcon
}

type IconNameType = keyof typeof iconMap

type IconPropsType = {
  name: IconNameType
  className?: string
}

const Icon = ({ name, className }: IconPropsType) => {
  const theme = useTheme()
  const Component = iconMap[name]

  if (!Component) {
    return null
  }

  const fallbackColor = theme.color.icon.active

  return <Component className={className} fill={fallbackColor} role="img" />
}

export { Icon }
export type { IconNameType }
