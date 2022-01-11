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
import { IconButton } from '@mui/material'

// @TODO move arrow to shared folder
import ArrowIcon from './arrow-down.svg'

type ExpandButtonProps = {
  expandHandler: () => void
  expanded: boolean
}

// @TODO use theme
const ArrowButton = styled(IconButton)<{ isFlipped: boolean }>`
  & svg {
    ${(props) => (props.isFlipped ? `transform: rotate(0.5turn);` : null)}
    fill: #585858;
  }
`

export const ExpandButton = ({
  expandHandler,
  expanded
}: ExpandButtonProps) => {
  return (
    <ArrowButton isFlipped={expanded} onClick={expandHandler}>
      <ArrowIcon />
    </ArrowButton>
  )
}
