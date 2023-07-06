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
import { Struct } from 'ketcher-core'
import { MonomerColorScheme } from 'theming/defaultTheme'

export type MonomerItemType = {
  label: string
  colorScheme?: MonomerColorScheme
  favorite?: boolean
  struct: Struct
  props: {
    MonomerNaturalAnalogCode: string
    MonomerName: string
    Name: string
    // TODO determine whenever these props are optional or not
    BranchMonomer?: string
    MonomerCaps?: string
    MonomerCode?: string
    MonomerType?: string
  }
}

export interface IMonomerItemProps {
  item: MonomerItemType
  isSelected?: boolean
  onClick?: VoidFunction
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onStarClick?: VoidFunction
}
