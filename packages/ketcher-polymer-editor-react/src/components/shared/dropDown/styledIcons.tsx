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

import styled from '@emotion/styled'

import { Icon } from 'components/shared/icon'

const CheckMarkStyled = styled(Icon)`
  fill: #343434;
`

const ChevronStyled = styled(Icon)`
  user-select: none;
  width: 16px;
  height: 1em;
  display: inline-block;
  flex-shrink: 0;
  transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  font-size: 1.5rem;
  position: absolute;
  right: 7px;
  top: calc(50% - 0.5em);
  pointer-events: none;
  fill: #5b6077;
`

const ChevronIcon = ({ className }) => (
  <ChevronStyled name="chevron" className={className} />
)

const CheckMarkIcon = ({ isSelected }: { isSelected: boolean }) => {
  if (!isSelected) {
    return null
  }

  return <CheckMarkStyled name="checkmark" />
}

export { ChevronIcon, CheckMarkIcon }
