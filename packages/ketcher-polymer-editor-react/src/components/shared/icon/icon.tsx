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
import ArrowUpIcon from 'assets/icons/files/arrow-upward.svg'
import BracketIcon from 'assets/icons/files/bracket.svg'
import CapitalTIcon from 'assets/icons/files/capital-t.svg'
import CheckMarkIcon from 'assets/icons/files/checkmark.svg'
import ChevronIcon from 'assets/icons/files/chevron.svg'
import CloseIcon from 'assets/icons/files/close.svg'
import CopyIcon from 'assets/icons/files/copy.svg'
import DividerIcon from 'assets/icons/files/divider.svg'
import DoubleArrowLeftIcon from 'assets/icons/files/arrows-left.svg'
import DoubleArrowRightIcon from 'assets/icons/files/arrows-right.svg'
import DropDownIcon from 'assets/icons/files/dropdown.svg'
import EraseIcon from 'assets/icons/files/erase.svg'
import EllipseIcon from 'assets/icons/files/ellipse.svg'
import FileIcon from 'assets/icons/files/file-thumbnail.svg'
import HelpIcon from 'assets/icons/files/help.svg'
import HorizontalFlipIcon from 'assets/icons/files/horizontal-flip.svg'
import OpenIcon from 'assets/icons/files/open.svg'
import RapLeftLinkIcon from 'assets/icons/files/rap-left-link.svg'
import RapMiddleLinkIcon from 'assets/icons/files/rap-middle-link.svg'
import RapRightLinkIcon from 'assets/icons/files/rap-right-link.svg'
import RotateIcon from 'assets/icons/files/rotate.svg'
import RectangleIcon from 'assets/icons/files/rectangle.svg'
import SearchIcon from 'assets/icons/files/search.svg'
import SelectLassoIcon from 'assets/icons/files/select-lasso.svg'
import SelectRectangleIcon from 'assets/icons/files/select-rectangle.svg'
import SelectFragmentIcon from 'assets/icons/files/select-fragment.svg'
import SettingsIcon from 'assets/icons/files/settings.svg'
import StarIcon from 'assets/icons/files/star.svg'
import SingleBondIcon from 'assets/icons/files/single-bond.svg'
import VerticalFlipIcon from 'assets/icons/files/vertical-flip.svg'
import UndoIcon from 'assets/icons/files/undo.svg'
import SaveIcon from 'assets/icons/files/save.svg'
import ErrorIcon from 'assets/icons/files/error.svg'
import FullscreenIcon from 'assets/icons/files/fullscreen.svg'

const iconMap = {
  'arrow-down': ArrowDownIcon,
  'arrow-up': ArrowUpIcon,
  bracket: BracketIcon,
  'capital-t': CapitalTIcon,
  checkmark: CheckMarkIcon,
  chevron: ChevronIcon,
  close: CloseIcon,
  copy: CopyIcon,
  divider: DividerIcon,
  'double-arrow-left': DoubleArrowLeftIcon,
  'double-arrow-right': DoubleArrowRightIcon,
  dropdown: DropDownIcon,
  erase: EraseIcon,
  ellipse: EllipseIcon,
  'file-thumbnail': FileIcon,
  fullscreen: FullscreenIcon,
  help: HelpIcon,
  'horizontal-flip': HorizontalFlipIcon,
  open: OpenIcon,
  'rap-left-link': RapLeftLinkIcon,
  'rap-middle-link': RapMiddleLinkIcon,
  'rap-right-link': RapRightLinkIcon,
  rotate: RotateIcon,
  rectangle: RectangleIcon,
  search: SearchIcon,
  'select-lasso': SelectLassoIcon,
  'select-rectangle': SelectRectangleIcon,
  'select-fragment': SelectFragmentIcon,
  settings: SettingsIcon,
  star: StarIcon,
  'single-bond': SingleBondIcon,
  'vertical-flip': VerticalFlipIcon,
  undo: UndoIcon,
  save: SaveIcon,
  error: ErrorIcon
}

type IconNameType = keyof typeof iconMap

type IconPropsType = {
  name: string
  className?: string
}

const Icon = ({ name, className }: IconPropsType) => {
  const theme = useTheme()
  const Component = iconMap[name]

  if (!Component) {
    return null
  }

  const fallbackColor = theme.ketcher.color.icon.active

  return <Component className={className} fill={fallbackColor} role="img" />
}

export { Icon }
export type { IconNameType }
