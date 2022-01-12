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

import ArrowDownIcon from './files/arrow-down.svg'
import CheckMarkIcon from './files/checkmark.svg'
import ChevronIcon from './files/chevron.svg'

const icons = {
  'arrow-down': ArrowDownIcon,
  checkmark: CheckMarkIcon,
  chevron: ChevronIcon
}

function emptyIcon() {
  return null
}

export default function findIconByName(name) {
  if (name && Object.prototype.hasOwnProperty.call(icons, name)) {
    const component = icons[name]
    return component
  } else {
    return emptyIcon
  }
}
