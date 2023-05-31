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

import { Icon } from '../../../components'
import { StyledIconButton } from './styles'

export interface ButtonProps {
  iconName: string
  onClick: () => void
  title: string
  className?: string
  isHidden?: boolean
  disabled?: boolean
  isActive?: boolean
  shortcut?: string
}

export const IconButton = ({
  onClick,
  iconName,
  title,
  shortcut,
  className,
  isActive = false,
  isHidden = false,
  disabled = false
}: ButtonProps) => {
  const combinedTitle = shortcut ? `${title} (${shortcut})` : title

  if (isHidden) {
    return null
  }

  return (
    <StyledIconButton
      className={className}
      title={combinedTitle}
      onClick={onClick}
      disabled={disabled}
      isActive={isActive}
    >
      <Icon name={iconName} />
    </StyledIconButton>
  )
}
