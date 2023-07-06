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

export const GroupBlockContainer = styled.div<{
  disabled?: boolean
  selected?: boolean
  empty?: boolean
}>((props) => ({
  height: '40px',
  position: 'relative',
  marginLeft: '30px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: props.selected
    ? props.theme.ketcher.color.button.primary.active
    : props.theme.ketcher.color.background.primary,
  borderRadius: props.theme.ketcher.border.radius.regular,
  boxShadow: props.theme.ketcher.shadow.regular,
  padding: '5px 10px',
  color: props.selected ? 'white' : 'black',
  gap: '14px',
  cursor: 'pointer',
  outlineOffset: '1px',

  ':hover': {
    outline: props.theme.ketcher.outline.small
  },

  ':not(:last-child)': {
    ':after': {
      content: '""',
      position: 'absolute',
      right: '100%',
      bottom: 'calc(50% - 1px)',
      borderLeft: props.theme.ketcher.outline.medium,
      borderBottom: props.theme.ketcher.outline.medium,
      height: '2px',
      width: '17px'
    }
  },

  ':last-child': {
    ':after': {
      content: '""',
      position: 'absolute',
      right: '100%',
      bottom: 'calc(50% - 1px)',
      borderLeft: props.theme.ketcher.outline.medium,
      borderBottom: props.theme.ketcher.outline.medium,
      borderRadius: '0 0 0 4px',
      height: '130px',
      width: '17px'
    }
  }
}))

export const TextContainer = styled.div({
  display: 'flex',
  flexDirection: 'column'
})

export const GroupName = styled.span((props) => ({
  fontSize: props.theme.ketcher.font.size.small
}))

export const MonomerName = styled.span((props) => ({
  marginTop: '1px',
  fontSize: props.theme.ketcher.font.size.medium
}))

export const GroupIcon = styled(Icon)<{ selected?: boolean }>((props) => ({
  color: props.empty
    ? 'transparent'
    : props.selected
    ? props.theme.ketcher.color.background.primary
    : props.theme.ketcher.color.icon.grey,
  width: '20px',
  height: '20px',
  stroke: props.empty
    ? props.selected
      ? props.theme.ketcher.color.background.primary
      : props.theme.ketcher.color.icon.grey
    : 'none'
}))
