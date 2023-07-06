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
import { Icon } from 'ketcher-react'
import { IStyledIconProps } from './types'

export const SummaryContainer = styled.div((props) => ({
  minHeight: '32px',
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  gap: '8px',
  borderBottom: props.theme.ketcher.border.small
}))

export const SummaryText = styled.span((props) => ({
  flexGrow: 1,
  fontSize: props.theme.ketcher.font.size.regular
}))

export const StyledIcon = styled(Icon)<IStyledIconProps>((props) => ({
  width: '16px',
  height: '16px',
  color: props.theme.ketcher.color.icon.grey,
  transition: props.theme.ketcher.transition.regular,
  transform: props.expanded ? 'none' : 'rotate(180deg)'
}))
