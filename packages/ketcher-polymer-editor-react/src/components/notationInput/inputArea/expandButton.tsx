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

import { IconButton } from '@mui/material'
import styled from '@emotion/styled'

import { Icon } from 'ketcher-react'

type ExpandButtonProps = {
  expandHandler: () => void
  expanded: boolean
}

const ArrowIcon = styled(Icon)<{ isFlipped: boolean }>`
  fill: ${({ theme }) => theme.ketcher.color.icon.active};
  ${({ isFlipped }) => isFlipped && 'transform: rotate(0.5turn);'}
`
export const ExpandButton = ({
  expandHandler,
  expanded
}: ExpandButtonProps) => {
  const buttonTitle = `${expanded ? 'Collapse' : 'Expand'} input area`

  return (
    <IconButton onClick={expandHandler} title={buttonTitle}>
      <ArrowIcon name="arrow-down" isFlipped={expanded} />
    </IconButton>
  )
}
